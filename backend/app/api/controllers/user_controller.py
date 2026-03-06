from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.schemas.user import UserResponse, UpdateUserRequest
from app.services.user_service import get_user_by_token, update_user_by_token
from app.core.exceptions import NotFoundException


async def handle_get_me(token: str, db: AsyncSession) -> UserResponse:
    user = await get_user_by_token(db, token)
    if not user:
        raise NotFoundException("User not found for the provided token")
    return UserResponse.model_validate(user)


async def handle_update_me(token: str, data: UpdateUserRequest, db: AsyncSession) -> UserResponse:
    user = await update_user_by_token(db, token, data.model_dump(exclude_none=True))
    if not user:
        raise NotFoundException("User not found for the provided token")
    return UserResponse.model_validate(user)
