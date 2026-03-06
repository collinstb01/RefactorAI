from sqlalchemy import Integer, String, ForeignKey, Text, DateTime, func, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import TYPE_CHECKING
from datetime import datetime

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.repository import Repository


class ArchitectureAnalysis(Base):
    __tablename__ = "architecture_analysis"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    analysis_id: Mapped[int] = mapped_column(Integer, ForeignKey("analysis.id"), nullable=False, index=True, unique=True)
    repo_id: Mapped[int] = mapped_column(Integer, ForeignKey("repositories.id"), nullable=False, index=True)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    patterns: Mapped[list] = mapped_column(JSON, nullable=False, default=list)
    recommendations: Mapped[list] = mapped_column(JSON, nullable=False, default=list)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    # Relationships
    repository: Mapped["Repository"] = relationship("Repository", back_populates="architecture_analyses")
