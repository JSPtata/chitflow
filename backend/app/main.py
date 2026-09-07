from fastapi import FastAPI

from app.db.database import engine, Base
from app.models.user import User
from app.models.chit_group import ChitGroup
from app.routes.users import router as users_router
from app.routes.chit_groups import router as chit_groups_router


Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="ChitFlow API",
    description="State-Driven Digital Chit Fund Coordination System"
)

app.include_router(users_router)
app.include_router(chit_groups_router)


@app.get("/")
def home():
    return {
        "message": "ChitFlow backend and PostgreSQL are connected"
    }