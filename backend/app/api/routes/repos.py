from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.deps import get_db, get_token
from app.schemas.repo import RepositoryResponse
from app.api.controllers.repo_controller import handle_get_repos

router = APIRouter(prefix="/repos", tags=["repos"])


@router.get("", summary="Fetch and sync the authenticated user's GitHub repositories")
async def get_repos(
    token: str = Depends(get_token),
    db: AsyncSession = Depends(get_db),
) -> list[RepositoryResponse]:
    return await handle_get_repos(token, db)
