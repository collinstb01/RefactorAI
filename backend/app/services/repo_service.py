from app.schemas.repo import AnalysesType, AnalyzeRepoPayload
from app.core.exceptions import BadRequestException, UnauthorizedException, InternalServerErrorException
import httpx

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.user import User
from app.models.repository import Repository
from app.services.user_service import get_user_by_token

GITHUB_API = "https://api.github.com"
GITHUB_HEADERS = {
    "Accept": "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
}


async def fetch_and_sync_repos(db: AsyncSession, token: str) -> list[Repository]:
    """
    1. Identify the user via the session token.
    2. Use their stored GitHub OAuth token to call GitHub API.
    3. Upsert each repo into our repositories table.
    4. Return the full list of their repositories from DB.
    """
    user = await get_user_by_token(db, token)
    if not user:
        raise UnauthorizedException("Invalid or expired token")

    # Call GitHub API using the user's GitHub OAuth access_token
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{GITHUB_API}/user/repos",
            headers={
                **GITHUB_HEADERS,
                "Authorization": f"Bearer {user.access_token}",
            },
            params={"per_page": 100, "sort": "updated", "affiliation": "owner"},
            timeout=10,
        )

    if response.status_code != 200:
        raise InternalServerErrorException(
            f"GitHub API error: {response.status_code} — {response.text[:200]}"
        )

    github_repos = response.json()

    # Upsert each repo
    for gh_repo in github_repos:
        result = await db.execute(
            select(Repository).where(Repository.github_repo_id == gh_repo["id"])
        )
        existing = result.scalar_one_or_none()

        if existing:
            existing.name = gh_repo["name"]
            existing.full_name = gh_repo["full_name"]
            existing.private = gh_repo["private"]
            existing.default_branch = gh_repo.get("default_branch", "main")
            existing.repo_url = gh_repo["html_url"]
        else:
            db.add(Repository(
                user_id=user.id,
                github_repo_id=gh_repo["id"],
                name=gh_repo["name"],
                full_name=gh_repo["full_name"],
                private=gh_repo["private"],
                default_branch=gh_repo.get("default_branch", "main"),
                repo_url=gh_repo["html_url"],
            ))

    await db.commit()

    # Return all repos for this user from DB with their latest analysis status
    from sqlalchemy.orm import selectinload
    result = await db.execute(
        select(Repository)
        .options(selectinload(Repository.analyses))
        .where(Repository.user_id == user.id)
    )
    repos = result.scalars().all()
    
    def normalize(t: str) -> str:
        t = t.lower()
        if "refactor" in t:
            return "refactor"
        return t

    response_data = []
    for r in repos:
        # Get the latest completed or in_progress analysis
        latest = None
        history = []
        if r.analyses:
            # Sort by created_at desc
            sorted_analyses = sorted(r.analyses, key=lambda x: x.created_at, reverse=True)
            latest = sorted_analyses[0]
            for a in sorted_analyses:
                history.append({
                    "id": a.id,
                    "analysis_type": normalize(a.analysis_type),
                    "status": a.status,
                    "summary": a.summary,
                    "score": a.score,
                    "created_at": a.created_at,
                    "completed_at": a.completed_at
                })
            
        repo_dict = {
            "id": r.id,
            "github_repo_id": r.github_repo_id,
            "name": r.name,
            "full_name": r.full_name,
            "private": r.private,
            "default_branch": r.default_branch,
            "repo_url": r.repo_url,
            "created_at": r.created_at,
            "latest_analysis_id": latest.id if latest else None,
            "latest_analysis_status": latest.status if latest else None,
            "latest_analysis_score": latest.score if latest else None,
            "analysis_history": history,
        }
        response_data.append(repo_dict)
        
    return response_data

from app.utils.repo_helpers import download_repo, collect_code_files, analayze_code_with_llm
from app.models.analysis import Analysis
from app.models.issue import Issue, Severity
from app.models.metric import Metric

async def analyze_repo(db: AsyncSession, data: AnalyzeRepoPayload) -> dict:
    """
    1. Verify user and repo access
    2. Create analysis record
    3. Return record ID (caller handles background task)
    """
    user = await get_user_by_token(db, data.token)
    if not user:
        raise UnauthorizedException("Invalid or expired token")

    repo_result = await db.execute(
        select(Repository).where(Repository.id == data.repo_id, Repository.user_id == user.id)
    )
    repo = repo_result.scalar_one_or_none()
    if not repo:
        raise BadRequestException("Repository not found or access denied")

    # Check for recent analysis (rate limit: 2 minutes)
    from datetime import datetime, timedelta
    recent_check = await db.execute(
        select(Analysis)
        .where(Analysis.repo_id == repo.id)
        .order_by(Analysis.created_at.desc())
        .limit(1)
    )
    last_analysis = recent_check.scalar_one_or_none()
    
    if last_analysis and (datetime.now() - last_analysis.created_at) < timedelta(minutes=2):
        diff = timedelta(minutes=2) - (datetime.now() - last_analysis.created_at)
        wait_seconds = int(diff.total_seconds())
        raise BadRequestException(f"Please wait {wait_seconds} seconds before re-analyzing this repository.")

    # Create Analysis record
    new_analysis = Analysis(
        repo_id=repo.id,
        analysis_type=data.type.value,
        status="pending",
        summary="Starting analysis..."
    )
    db.add(new_analysis)
    await db.commit()
    await db.refresh(new_analysis)
    
    return {
        "status": "ok",
        "message": f"{data.type.value} analysis triggered",
        "analysis_id": new_analysis.id,
        "repo_full_name": repo.full_name,
        "access_token": user.access_token,
        "analysis_type": data.type.value
    }


async def run_analysis_task(analysis_id: int, repo_full_name: str, access_token: str, analysis_type: str):
    """
    Background task to perform the full analysis flow.
    Uses a fresh session to avoid 'Session closed' errors.
    Routes saved data to the correct table based on analysis_type.
    """
    from datetime import datetime
    from app.db.session import AsyncSessionLocal
    from app.models.architecture_analysis import ArchitectureAnalysis
    from app.models.refactor_suggestion import RefactorSuggestion, ImpactLevel
    
    async with AsyncSessionLocal() as db:
        # 1. Get the analysis record
        result = await db.execute(select(Analysis).where(Analysis.id == analysis_id))
        analysis = result.scalar_one_or_none()
        if not analysis:
            print(f"[analysis-{analysis_id}] Error: Record not found")
            return

        try:
            # Step 1: Downloading
            analysis.status = "in_progress"
            analysis.summary = "Downloading repository from GitHub..."
            await db.commit()
            
            repo_path = await download_repo(repo_full_name, access_token)
            
            # Step 2: Collecting
            analysis.summary = "Scanning and collecting code files..."
            await db.commit()
            
            code_files = collect_code_files(repo_path)
            
            # Step 3: Analyzing with AI
            analysis.summary = f"Analyzing {len(code_files)} files with AI (this may take a moment)..."
            await db.commit()
                                                                     
            analysis_results = await analayze_code_with_llm(code_files, analysis_type)
            
            # Step 4: Save summary (always present)
            analysis.status = "completed"
            analysis.summary = analysis_results.get("summary", "Analysis completed successfully.")
            analysis.completed_at = datetime.now()

            # ── Type-specific storage ─────────────────────────────────────────
            if analysis_type == "issues":
                # score only makes sense for issues
                analysis.score = float(analysis_results.get("score", 0))
                for issue_data in analysis_results.get("issues", []):
                    try:
                        sev_str = str(issue_data.get("severity", "medium")).upper()
                        severity = Severity.__members__.get(sev_str, Severity.MEDIUM)
                        db.add(Issue(
                            analysis_id=analysis.id,
                            file_path=issue_data.get("file", "unknown"),
                            issue_type=issue_data.get("type", "style"),
                            severity=severity,
                            description=issue_data.get("description", ""),
                            suggestion=issue_data.get("suggestion"),
                        ))
                    except Exception as e:
                        print(f"[analysis-{analysis_id}] Error saving issue: {e}")

            elif analysis_type == "metrics":
                analysis.score = 0
                metrics_data = analysis_results.get("metrics", {})
                for name, value in metrics_data.items():
                    try:
                        if isinstance(value, str):
                            import re
                            match = re.search(r"\d+", value)
                            val = float(match.group()) if match else 0.0
                        else:
                            val = float(value)
                        db.add(Metric(
                            analysis_id=analysis.id,
                            metric_name=name,
                            metric_value=val,
                        ))
                    except Exception as e:
                        print(f"[analysis-{analysis_id}] Error saving metric {name}: {e}")

            elif analysis_type == "architecture":
                analysis.score = 0
                arch_data = analysis_results.get("architecture", {})
                db.add(ArchitectureAnalysis(
                    analysis_id=analysis.id,
                    repo_id=analysis.repo_id,
                    description=arch_data.get("description", ""),
                    patterns=arch_data.get("patterns", []),
                    recommendations=arch_data.get("recommendations", []),
                ))

            elif analysis_type == "refactor":
                analysis.score = 0
                for suggestion in analysis_results.get("suggestions", []):
                    try:
                        impact_str = str(suggestion.get("impact", "medium")).upper()
                        impact = ImpactLevel.__members__.get(impact_str, ImpactLevel.MEDIUM)
                        db.add(RefactorSuggestion(
                            analysis_id=analysis.id,
                            repo_id=analysis.repo_id,
                            title=suggestion.get("title", "Untitled"),
                            description=suggestion.get("description", ""),
                            impact=impact,
                        ))
                    except Exception as e:
                        print(f"[analysis-{analysis_id}] Error saving refactor suggestion: {e}")

            await db.commit()
            print(f"[analysis-{analysis_id}] Success ({analysis_type})")
            
        except Exception as e:
            print(f"[analysis-{analysis_id}] Error: {e}")
            analysis.status = "failed"
            analysis.summary = f"Error: {str(e)}"
            await db.commit()


async def get_analysis_status(db: AsyncSession, analysis_id: int) -> dict:
    """Gets the current status and summary of an analysis for polling."""
    result = await db.execute(select(Analysis).where(Analysis.id == analysis_id))
    analysis = result.scalar_one_or_none()
    if not analysis:
        raise BadRequestException("Analysis not found")
        
    return {
        "id": analysis.id,
        "status": analysis.status,
        "analysis_type": analysis.analysis_type,
        "summary": analysis.summary,
        "score": analysis.score,
        "completed_at": analysis.completed_at
    }

async def get_analysis_detail(db: AsyncSession, analysis_id: int) -> dict:
    """Gets the full analysis result, returning only data relevant to the analysis_type."""
    from sqlalchemy.orm import selectinload
    from app.models.architecture_analysis import ArchitectureAnalysis
    from app.models.refactor_suggestion import RefactorSuggestion

    result = await db.execute(
        select(Analysis)
        .options(
            selectinload(Analysis.issues),
            selectinload(Analysis.metrics),
            selectinload(Analysis.architecture),
            selectinload(Analysis.refactor_suggestions),
        )
        .where(Analysis.id == analysis_id)
    )
    analysis = result.scalar_one_or_none()
    if not analysis:
        raise BadRequestException("Analysis not found")

    base = {
        "id": analysis.id,
        "repo_id": analysis.repo_id,
        "analysis_type": analysis.analysis_type,
        "status": analysis.status,
        "summary": analysis.summary,
        "score": analysis.score,
        "created_at": analysis.created_at,
        "completed_at": analysis.completed_at,
    }

    atype = analysis.analysis_type.lower()
    if "refactor" in atype:
        atype = "refactor"

    if atype == "issues":
        base["issues"] = [
            {
                "id": issue.id,
                "type": issue.issue_type,
                "file_path": issue.file_path,
                "description": issue.description,
                "severity": issue.severity.name,
                "suggestion": issue.suggestion,
            }
            for issue in analysis.issues
        ]
        base["metrics"] = []

    elif atype == "metrics":
        base["metrics"] = [
            {"id": m.id, "name": m.metric_name, "value": m.metric_value}
            for m in analysis.metrics
        ]
        base["issues"] = []

    elif atype == "architecture":
        arch = analysis.architecture
        base["architecture"] = {
            "description": arch.description if arch else "",
            "patterns": arch.patterns if arch else [],
            "recommendations": arch.recommendations if arch else [],
        }
        base["issues"] = []
        base["metrics"] = []

    elif atype == "refactor":
        base["suggestions"] = [
            {
                "id": s.id,
                "title": s.title,
                "description": s.description,
                "impact": s.impact.value,
            }
            for s in analysis.refactor_suggestions
        ]
        base["issues"] = []
        base["metrics"] = []

    else:
        # Fallback: return issues + metrics
        base["issues"] = [
            {
                "id": issue.id,
                "type": issue.issue_type,
                "file_path": issue.file_path,
                "description": issue.description,
                "severity": issue.severity.name,
                "suggestion": issue.suggestion,
            }
            for issue in analysis.issues
        ]
        base["metrics"] = [
            {"id": m.id, "name": m.metric_name, "value": m.metric_value}
            for m in analysis.metrics
        ]

    return base



async def get_all_analysis_history(db: AsyncSession, token: str) -> list:
    """Returns all analysis records for the authenticated user."""
    user = await get_user_by_token(db, token)
    if not user:
        raise UnauthorizedException("Invalid token")
        
    from sqlalchemy.orm import joinedload
    
    result = await db.execute(
        select(Analysis)
        .options(joinedload(Analysis.repository))
        .join(Repository)
        .where(Repository.user_id == user.id)
        .order_by(Analysis.created_at.desc())
    )
    analyses = result.scalars().all()
    
    def normalize(t: str) -> str:
        t = t.lower()
        if "refactor" in t:
            return "refactor"
        return t

    return [
        {
            "id": a.id,
            "repo_id": a.repo_id,
            "repo_name": a.repository.name,
            "analysis_type": normalize(a.analysis_type),
            "status": a.status,
            "score": a.score,
            "summary": a.summary,
            "created_at": a.created_at,
            "completed_at": a.completed_at
        }
        for a in analyses
    ]


async def get_all_insights(db: AsyncSession, token: str) -> list:
    """Returns top critical/high issues across all user repositories for the Insights dashboard."""
    user = await get_user_by_token(db, token)
    if not user:
        raise UnauthorizedException("Invalid token")
        
    from sqlalchemy.orm import joinedload
    from app.models.issue import Severity
    
    result = await db.execute(
        select(Issue)
        .options(joinedload(Issue.analysis).joinedload(Analysis.repository))
        .join(Analysis)
        .join(Repository)
        .where(Repository.user_id == user.id)
        .where(Issue.severity.in_([Severity.HIGH, Severity.CRITICAL]))
        .order_by(Analysis.created_at.desc())
        .limit(30)
    )
    issues = result.scalars().all()
    
    return [
        {
            "id": i.id,
            "repo": i.analysis.repository.name,
            "analysis_id": i.analysis.id,
            "category": i.issue_type.capitalize(),
            "title": f"Issue in {i.file_path.split('/')[-1]}",
            "description": i.description,
            "fix": i.suggestion or "Review code for potential fixes.",
            "severity": i.severity.name.lower()
        }
        for i in issues
    ]

async def get_repo_analysis_history(db: AsyncSession, repo_id: int, token: str) -> list:
    """Returns full analysis history for a specific repository, including type-specific related data."""
    user = await get_user_by_token(db, token)
    if not user:
        raise UnauthorizedException("Invalid token")

    from sqlalchemy.orm import selectinload

    result = await db.execute(
        select(Analysis)
        .options(
            selectinload(Analysis.issues),
            selectinload(Analysis.metrics),
            selectinload(Analysis.architecture),
            selectinload(Analysis.refactor_suggestions),
        )
        .where(Analysis.repo_id == repo_id)
        .order_by(Analysis.created_at.desc())
    )
    analyses = result.scalars().all()

    def serialize(a: Analysis) -> dict:
        base = {
            "id": a.id,
            "repo_id": a.repo_id,
            "analysis_type": a.analysis_type,
            "status": a.status,
            "score": a.score,
            "summary": a.summary,
            "created_at": a.created_at,
            "completed_at": a.completed_at,
        }

        atype = a.analysis_type.lower()
        if "refactor" in atype:
            atype = "refactor"

        if atype == "issues":
            base["issues"] = [
                {
                    "id": i.id,
                    "type": i.issue_type,
                    "file_path": i.file_path,
                    "description": i.description,
                    "severity": i.severity.name,
                    "suggestion": i.suggestion,
                }
                for i in a.issues
            ]
            base["metrics"] = []

        elif atype == "metrics":
            base["metrics"] = [
                {"id": m.id, "name": m.metric_name, "value": m.metric_value}
                for m in a.metrics
            ]
            base["issues"] = []

        elif atype == "architecture":
            arch = a.architecture
            base["architecture"] = {
                "description": arch.description if arch else "",
                "patterns": arch.patterns if arch else [],
                "recommendations": arch.recommendations if arch else [],
            }
            base["issues"] = []
            base["metrics"] = []

        elif atype == "refactor":
            base["suggestions"] = [
                {
                    "id": s.id,
                    "title": s.title,
                    "description": s.description,
                    "impact": s.impact.value,
                }
                for s in a.refactor_suggestions
            ]
            base["issues"] = []
            base["metrics"] = []

        return base

    return [serialize(a) for a in analyses]

