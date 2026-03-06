import enum
from sqlalchemy import Integer, String, ForeignKey, Text, DateTime, func, Enum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import TYPE_CHECKING
from datetime import datetime

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.analysis import Analysis

class Severity(enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class Issue(Base):
    __tablename__ = "issues"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    analysis_id: Mapped[int] = mapped_column(Integer, ForeignKey("analysis.id"), nullable=False, index=True)
    file_path: Mapped[str] = mapped_column(String(500), nullable=False)
    issue_type: Mapped[str] = mapped_column(String(50), nullable=False)  
    severity: Mapped[enum] = mapped_column(Enum(Severity), nullable=False)   
    description: Mapped[str] = mapped_column(Text, nullable=False)
    suggestion: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())

    # Relationships
    analysis: Mapped["Analysis"] = relationship("Analysis", back_populates="issues")
