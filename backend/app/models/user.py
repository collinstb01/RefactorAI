from sqlalchemy import Boolean, Integer, String, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import TYPE_CHECKING
from datetime import datetime

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.repository import Repository
    from app.models.session import Session

class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    username: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    avatar_url: Mapped[str] = mapped_column(String(255), nullable=False)    
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())
    access_token: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)   

    # Relationships
    repositories: Mapped[list["Repository"]] = relationship("Repository", back_populates="owner")
    sessions: Mapped[list["Session"]] = relationship("Session", back_populates="user")