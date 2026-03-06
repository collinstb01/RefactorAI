from pydantic import BaseModel, ConfigDict

class GitHubLoginPayload(BaseModel):
    model_config = ConfigDict(from_attributes=True)  # allows ORM → Pydantic conversion

    github_id: str
    name: str | None = None
    email: str | None = None
    avatar_url: str | None = None
    github_username: str | None = None
    access_token: str | None = None