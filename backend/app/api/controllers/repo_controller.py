from fastapi import BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from app.schemas.repo import RepositoryResponse, AnalyzeRepoPayload
from app.services.repo_service import (
    fetch_and_sync_repos, 
    analyze_repo, 
    run_analysis_task, 
    get_analysis_status,
    get_analysis_detail,
    get_all_analysis_history,
    get_repo_analysis_history
)


async def handle_get_repos(token: str, db: AsyncSession) -> list[RepositoryResponse]:
    repos = await fetch_and_sync_repos(db, token)
    return [RepositoryResponse.model_validate(r) for r in repos]


async def handle_analyze_repo(data: AnalyzeRepoPayload, db: AsyncSession, background_tasks: BackgroundTasks) -> dict:
    result = await analyze_repo(db, data)
    
    background_tasks.add_task(
        run_analysis_task, 
        result["analysis_id"], 
        result["repo_full_name"], 
        result["access_token"], 
        result["analysis_type"]
    )
    
    return {
        "status": "ok",
        "analysis_id": result["analysis_id"]
    }


async def handle_get_analysis_status(analysis_id: int, db: AsyncSession) -> dict:
    return await get_analysis_status(db, analysis_id)


async def handle_get_analysis_detail(analysis_id: int, db: AsyncSession) -> dict:
    return await get_analysis_detail(db, analysis_id)


async def handle_get_all_analysis_history(token: str, db: AsyncSession) -> list:
    return await get_all_analysis_history(db, token)


async def handle_get_repo_analysis_history(repo_id: int, token: str, db: AsyncSession) -> list:
    return await get_repo_analysis_history(db, repo_id, token)


async def handle_get_all_insights(token: str, db: AsyncSession) -> list:
    from app.services.repo_service import get_all_insights
    return await get_all_insights(db, token)

