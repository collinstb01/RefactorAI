from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.user import User
from app.models.session import Session as UserSession


async def get_user_by_token(db: AsyncSession, token: str) -> User | None:
    """Look up the user whose active session matches the given access token."""
    result = await db.execute(
        select(UserSession).where(UserSession.access_token == token)
    )
    session = result.scalar_one_or_none()
    if not session:
        return None
    result = await db.execute(select(User).where(User.id == session.user_id))
    return result.scalar_one_or_none()


async def update_user_by_token(db: AsyncSession, token: str, data: dict) -> User | None:
    """Update allowed fields on the user identified by the session token."""
    user = await get_user_by_token(db, token)
    if not user:
        return None

    allowed = {"username", "email", "avatar_url"}
    for field, value in data.items():
        if field in allowed and value is not None:
            setattr(user, field, value)

    await db.commit()
    await db.refresh(user)
    return user
