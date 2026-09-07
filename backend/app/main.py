from fastapi import FastAPI

from app.db.database import engine, Base
from app.models.user import User
from app.models.chit_group import ChitGroup
from app.routes.users import router as users_router
from app.routes.chit_groups import router as chit_groups_router
from app.models.membership import Membership
from app.routes.memberships import router as memberships_router
from app.models.round import Round
from app.routes.rounds import router as rounds_router
from app.models.contribution import Contribution
from app.routes.contributions import router as contributions_router
from app.models.bid import Bid

from app.routes.bids import router as bids_router
from app.models.dispute import Dispute
from app.routes.disputes import router as disputes_router

from app.models.payout import Payout
from app.routes.payouts import router as payouts_router
from app.models.audit_event import AuditEvent
from app.routes.audit_events import router as audit_events_router


Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="ChitFlow API",
    description="State-Driven Digital Chit Fund Coordination System"
)

app.include_router(users_router)
app.include_router(chit_groups_router)
app.include_router(memberships_router)
app.include_router(rounds_router)
app.include_router(contributions_router)
app.include_router(bids_router)
app.include_router(disputes_router)
app.include_router(payouts_router)
app.include_router(audit_events_router)

@app.get("/")
def home():
    return {
        "message": "ChitFlow backend and PostgreSQL are connected"
    }