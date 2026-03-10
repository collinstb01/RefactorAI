from fastapi import APIRouter, Depends, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.deps import get_db, get_token
from app.schemas.repo import AnalyzeRepoPayload, VSCodeAnalyzePayload
from app.api.controllers.repo_controller import handle_analyze_repo, handle_get_analysis_status, handle_get_analysis_detail

router = APIRouter(prefix="/analyze", tags=["analysis"])


@router.post("", summary="Trigger analysis for a repository")
async def analyze_repo_trigger(
    payload: AnalyzeRepoPayload,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
) -> dict:
    return await handle_analyze_repo(payload, db, background_tasks)

@router.post("/vscode", summary="Immediate analysis for a VS Code extension workspace")
async def analyze_vscode_workspace(
    payload: VSCodeAnalyzePayload,
) -> dict:
    from app.utils.llm_helpers import analayze_code_with_llm
    
    # Restructure VSCode array into the expected format for LLM
    # The existing analayze_code_with_llm expects code_files as {"file/path.py": "content..."}
    code_files = {f.path: f.content for f in payload.files}
    
    # Send directly to the LLM since we don't have a DB Repo to link this to
    # We'll just run "refactor" as the default broad analysis for the IDE
    try:
        results = await analayze_code_with_llm(code_files, "refactor")
        return results
    except Exception as e:
        from fastapi import HTTPException
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{analysis_id}/status", summary="Get the status of an analysis")
async def get_analysis_status(
    analysis_id: int,
    db: AsyncSession = Depends(get_db),
) -> dict:
    return await handle_get_analysis_status(analysis_id, db)


@router.get("/{analysis_id}", summary="Get the full result of a completed analysis")
async def get_analysis_detail(
    analysis_id: int,
    db: AsyncSession = Depends(get_db),
) -> dict:
    return await handle_get_analysis_detail(analysis_id, db)


@router.get("/history/all", summary="Get all analyses for the authenticated user")
async def get_all_history(
    token: str = Depends(get_token),
    db: AsyncSession = Depends(get_db),
) -> list:
    from app.api.controllers.repo_controller import handle_get_all_analysis_history
    return await handle_get_all_analysis_history(token, db)


@router.get("/history/repo/{repo_id}", summary="Get analysis history for a specific repository")
async def get_repo_history(
    repo_id: int,
    token: str = Depends(get_token),
    db: AsyncSession = Depends(get_db),
) -> list:
    from app.api.controllers.repo_controller import handle_get_repo_analysis_history
    return await handle_get_repo_analysis_history(repo_id, token, db)


@router.get("/insights/all", summary="Get top high/critical severity insights across all repositories")
async def get_insights_all(
    token: str = Depends(get_token),
    db: AsyncSession = Depends(get_db),
) -> list:
    from app.api.controllers.repo_controller import handle_get_all_insights
    return await handle_get_all_insights(token, db)
