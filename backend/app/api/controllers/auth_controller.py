from sqlalchemy.ext.asyncio import AsyncSession

from app.schemas.auth import GitHubLoginPayload
from app.services.auth_service import handle_github_login_service, handle_logout_service


async def handle_github_login(payload: GitHubLoginPayload, db: AsyncSession) -> dict:
    return await handle_github_login_service(payload, db)


async def handle_logout() -> dict:
    return await handle_logout_service()