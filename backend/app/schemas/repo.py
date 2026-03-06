from pydantic import BaseModel, ConfigDict
from datetime import datetime
from enum import Enum

class AnalysesType(Enum):
    ARCHITECTURE = "architecture"
    REFACTOR = "refactor"
    ISSUES = "issues"
    METRICS = "metrics"

class AnalysisHistoryItem(BaseModel):
    id: int
    analysis_type: str
    status: str
    summary: str | None = None
    score: float | None = None
    created_at: datetime
    completed_at: datetime | None = None

class RepositoryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    github_repo_id: int
    name: str
    full_name: str
    private: bool
    default_branch: str
    repo_url: str
    created_at: datetime
    latest_analysis_id: int | None = None
    latest_analysis_status: str | None = None
    latest_analysis_score: float | None = None
    analysis_history: list[AnalysisHistoryItem] = []


class AnalyzeRepoPayload(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    repo_id: int
    repo_name: str
    repo_url: str
    token: str
    type: AnalysesType