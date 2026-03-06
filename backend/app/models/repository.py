from sqlalchemy import Integer, String, Boolean, ForeignKey, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import TYPE_CHECKING
from datetime import datetime

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.analysis import Analysis
    from app.models.architecture_analysis import ArchitectureAnalysis
    from app.models.refactor_suggestion import RefactorSuggestion


class Repository(Base):
    __tablename__ = "repositories"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    github_repo_id: Mapped[int] = mapped_column(Integer, unique=True, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    private: Mapped[bool] = mapped_column(Boolean, default=False)
    default_branch: Mapped[str] = mapped_column(String(100), nullable=False)
    repo_url: Mapped[str] = mapped_column(String(255), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())

    # Relationships
    owner: Mapped["User"] = relationship("User", back_populates="repositories")
    analyses: Mapped[list["Analysis"]] = relationship("Analysis", back_populates="repository")
    architecture_analyses: Mapped[list["ArchitectureAnalysis"]] = relationship("ArchitectureAnalysis", back_populates="repository")
    refactor_suggestions: Mapped[list["RefactorSuggestion"]] = relationship("RefactorSuggestion", back_populates="repository")
