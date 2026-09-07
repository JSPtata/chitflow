from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.round import Round
from app.models.membership import Membership
from app.models.audit_event import AuditEvent
from app.schemas.audit_event import AuditEventResponse


router = APIRouter(
    prefix="/rounds",
    tags=["Audit"]
)


@router.get(
    "/{round_id}/audit",
    response_model=list[AuditEventResponse]
)
def get_audit_history(
    round_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    round_obj = db.query(Round).filter(
        Round.round_id == round_id
    ).first()

    if not round_obj:
        raise HTTPException(
            status_code=404,
            detail="Round not found"
        )

    membership = db.query(Membership).filter(
        Membership.chit_id == round_obj.chit_id,
        Membership.user_id == current_user.user_id,
        Membership.status == "ACTIVE"
    ).first()

    if not membership:
        raise HTTPException(
            status_code=403,
            detail="You are not a member of this chit group"
        )

    return db.query(AuditEvent).filter(
        AuditEvent.round_id == round_id
    ).order_by(
        AuditEvent.event_id.asc()
    ).all()