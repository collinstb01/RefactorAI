from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.db.session import engine
from app.db.base import Base
import app.models  # noqa: F401 — registers all ORM models with Base
from app.core.exceptions import AppException
from app.core.handler import app_exception_handler
from app.core.global_exception import global_exception_handler

from app.api.routes.users import router as users_router
from app.api.routes.auth import router as auth_router
from app.api.routes.repos import router as repos_router
from app.api.routes.analyze import router as analyze_router

app = FastAPI(title="RefactorAI API", version="0.1.0")

# Allow requests from the Next.js frontend (and any localhost during dev)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_exception_handler(AppException, app_exception_handler)
app.add_exception_handler(Exception, global_exception_handler)

app.include_router(users_router)
app.include_router(auth_router)
app.include_router(repos_router)
app.include_router(analyze_router)

@app.on_event("startup")
async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

@app.get("/", tags=["health"])
def root() -> dict:
    return {"message": "RefactorAI API running"}