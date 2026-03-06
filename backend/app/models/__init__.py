# Import all models here so Alembic and create_all() can discover them
from app.models.user import User  # noqa: F401
from app.models.repository import Repository  # noqa: F401
from app.models.analysis import Analysis  # noqa: F401
from app.models.issue import Issue  # noqa: F401
from app.models.metric import Metric  # noqa: F401
from app.models.session import Session  # noqa: F401
from app.models.architecture_analysis import ArchitectureAnalysis  # noqa: F401
from app.models.refactor_suggestion import RefactorSuggestion  # noqa: F401

__all__ = [
    "User", "Repository", "Analysis",
    "Issue", "Metric", "Session",
    "ArchitectureAnalysis", "RefactorSuggestion",
]
