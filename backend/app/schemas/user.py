from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    username: str
    email: str
    avatar_url: str
    created_at: datetime


class UpdateUserRequest(BaseModel):
    username: Optional[str] = None
    email: Optional[str] = None
    avatar_url: Optional[str] = None
