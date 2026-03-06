from fastapi import APIRouter, Depends, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.deps import get_db, get_token
from app.schemas.repo import AnalyzeRepoPayload
from app.api.controllers.repo_controller import handle_analyze_repo, handle_get_analysis_status, handle_get_analysis_detail

router = APIRouter(prefix="/analyze", tags=["analysis"])


@router.post("", summary="Trigger analysis for a repository")
async def analyze_repo_trigger(
    payload: AnalyzeRepoPayload,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
) -> dict:
    return await handle_analyze_repo(payload, db, background_tasks)


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
