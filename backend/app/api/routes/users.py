from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.deps import get_db
from app.db.deps import get_token
from app.schemas.user import UserResponse, UpdateUserRequest
from app.api.controllers.user_controller import handle_get_me, handle_update_me

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", summary="Get the currently authenticated user")
async def get_me(
    token: str = Depends(get_token),
    db: AsyncSession = Depends(get_db),
) -> UserResponse:
    return await handle_get_me(token, db)


@router.patch("/me", summary="Update the currently authenticated user")
async def update_me(
    body: UpdateUserRequest,
    token: str = Depends(get_token),
    db: AsyncSession = Depends(get_db),
) -> UserResponse:
    return await handle_update_me(token, body, db)
