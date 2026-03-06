from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime, timedelta

from app.models.user import User
from app.models.session import Session as UserSession
from app.schemas.auth import GitHubLoginPayload


async def handle_github_login_service(payload: GitHubLoginPayload, db: AsyncSession) -> dict:
    # Look up existing user by github_username
    result = await db.execute(
        select(User).where(User.username == payload.github_username)
    )
    user = result.scalar_one_or_none()

    if user is not None:
        # Update access_token on the user
        user.access_token = payload.access_token or user.access_token
        await db.flush()
    else:
        # Create new user
        user = User(
            username=payload.github_username or "",
            email=payload.email or "",
            avatar_url=payload.avatar_url or "",
            access_token=payload.access_token or "",
        )
        db.add(user)
        await db.flush()   # flush to get user.id without committing yet

    # Always create/refresh a Session record for this login
    session_record = UserSession(
        user_id=user.id,
        access_token=payload.access_token or "",
        refresh_token=payload.access_token or "",  # GitHub doesn't give refresh tokens; store same for now
        expires_at=datetime.utcnow() + timedelta(days=30),
    )
    db.add(session_record)
    await db.commit()
    await db.refresh(user)

    print(f"[auth] login OK → user_id={user.id}, username={user.username}")
    return {
        "status": "ok",
        "access_token": user.access_token,
    }


async def handle_logout_service() -> dict:
    print("[auth] logout triggered")
    return {"status": "ok", "message": "Logged out"}