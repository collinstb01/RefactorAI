from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.schemas.auth import GitHubLoginPayload
from app.api.controllers.auth_controller import handle_github_login, handle_logout
from app.db.deps import get_db

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", summary="Receive GitHub user data from NextAuth")
async def github_login(
    payload: GitHubLoginPayload,
    db: AsyncSession = Depends(get_db),
) -> dict:
    return await handle_github_login(payload, db)


@router.post("/logout", summary="Log out the user")
async def logout() -> dict:
    return await handle_logout()
