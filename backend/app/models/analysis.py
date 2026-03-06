from sqlalchemy import Integer, String, DateTime, ForeignKey, func, Float
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime
from typing import TYPE_CHECKING, Optional

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.repository import Repository
    from app.models.issue import Issue
    from app.models.metric import Metric
    from app.models.architecture_analysis import ArchitectureAnalysis
    from app.models.refactor_suggestion import RefactorSuggestion


class Analysis(Base):
    __tablename__ = "analysis"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    
    repo_id: Mapped[int] = mapped_column(Integer, ForeignKey("repositories.id"), nullable=False, index=True)
    
    analysis_type: Mapped[str] = mapped_column(String(50), nullable=False, default="issues")
    status: Mapped[str] = mapped_column(String(50), default="pending")  
    score: Mapped[float] = mapped_column(Float, nullable=True)
    summary: Mapped[str | None] = mapped_column(String(1000), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())
    completed_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    # Relationships
    repository: Mapped["Repository"] = relationship("Repository", back_populates="analyses")
    issues: Mapped[list["Issue"]] = relationship("Issue", back_populates="analysis")
    metrics: Mapped[list["Metric"]] = relationship("Metric", back_populates="analysis")
    architecture: Mapped[Optional["ArchitectureAnalysis"]] = relationship("ArchitectureAnalysis", uselist=False, backref="analysis")
    refactor_suggestions: Mapped[list["RefactorSuggestion"]] = relationship("RefactorSuggestion", backref="analysis")
