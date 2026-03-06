from fastapi import HTTPException, Header
from app.db.session import AsyncSessionLocal


async def get_db():
    async with AsyncSessionLocal() as session:
        yield session


async def get_token(authorization: str = Header(...)) -> str:
    """Extract the Bearer token from the Authorization header."""
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid Authorization header format")
    token = authorization.removeprefix("Bearer ").strip()
    if not token:
        raise HTTPException(status_code=401, detail="Missing token")
    return token