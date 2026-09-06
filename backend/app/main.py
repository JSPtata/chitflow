from fastapi import FastAPI

from app.db.database import engine, Base
from app.models.user import User
from app.routes.users import router as users_router


Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="ChitFlow API",
    description="State-Driven Digital Chit Fund Coordination System"
)

app.include_router(users_router)


@app.get("/")
def home():
    return {
        "message": "ChitFlow backend and PostgreSQL are connected"
    }