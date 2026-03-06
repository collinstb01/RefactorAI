import enum
from sqlalchemy import Integer, String, ForeignKey, Text, DateTime, func, Enum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import TYPE_CHECKING
from datetime import datetime

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.repository import Repository


class ImpactLevel(enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class RefactorSuggestion(Base):
    __tablename__ = "refactor_suggestions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    analysis_id: Mapped[int] = mapped_column(Integer, ForeignKey("analysis.id"), nullable=False, index=True)
    repo_id: Mapped[int] = mapped_column(Integer, ForeignKey("repositories.id"), nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(300), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    impact: Mapped[ImpactLevel] = mapped_column(Enum(ImpactLevel), nullable=False, default=ImpactLevel.MEDIUM)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    # Relationships
    repository: Mapped["Repository"] = relationship("Repository", back_populates="refactor_suggestions")
