from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.user import User
from app.models.round import Round
from app.models.membership import Membership
from app.models.chit_group import ChitGroup
from app.models.dispute import Dispute
from app.schemas.dispute import (
    DisputeCreate,
    DisputeResolve,
    DisputeResponse
)
from app.core.security import get_current_user
from app.state_machine.round_state_machine import transition_round


router = APIRouter(
    prefix="/rounds",
    tags=["Disputes"]
)


@router.post(
    "/{round_id}/disputes",
    response_model=DisputeResponse
)
def raise_dispute(
    round_id: int,
    dispute_data: DisputeCreate,
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

    if round_obj.current_state != "CHALLENGE_OPEN":#type:ignore
        raise HTTPException(
            status_code=400,
            detail="Disputes can only be raised during challenge period"
        )

    membership = db.query(Membership).filter(
        Membership.chit_id == round_obj.chit_id,
        Membership.user_id == current_user.user_id,
        Membership.status == "ACTIVE"
    ).first()

    if not membership:
        raise HTTPException(
            status_code=403,
            detail="Only active members can raise disputes"
        )

    new_dispute = Dispute(
        round_id=round_id,
        raised_by=current_user.user_id,
        dispute_type=dispute_data.dispute_type,
        description=dispute_data.description,
        status="RAISED"
    )

    try:
        transition_round(
            db=db,
            round_obj=round_obj,
            new_state="DISPUTE_RAISED",
            actor_id=current_user.user_id,  # type: ignore
            event_type="DISPUTE_RAISED",
            details=dispute_data.description
        )
    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error)
        )

    db.add(new_dispute)
    db.commit()
    db.refresh(new_dispute)

    return new_dispute


@router.patch(
    "/disputes/{dispute_id}/review",
    response_model=DisputeResponse
)
def review_dispute(
    dispute_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    dispute = db.query(Dispute).filter(
        Dispute.dispute_id == dispute_id
    ).first()

    if not dispute:
        raise HTTPException(
            status_code=404,
            detail="Dispute not found"
        )

    round_obj = db.query(Round).filter(
        Round.round_id == dispute.round_id
    ).first()

    chit = db.query(ChitGroup).filter(
        ChitGroup.chit_id == round_obj.chit_id #type:ignore
    ).first()

    if chit.created_by != current_user.user_id:  # type: ignore
        raise HTTPException(
            status_code=403,
            detail="Only the chit group creator can review disputes"
        )


    dispute.status = "UNDER_REVIEW"  # type: ignore
    try:
        transition_round(
            db=db,
            round_obj=round_obj,
            new_state="DISPUTE_UNDER_REVIEW",
            actor_id=current_user.user_id,  # type: ignore
            event_type="DISPUTE_UNDER_REVIEW",
            details=f"Dispute {dispute.dispute_id} moved to review"
        )
    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error)
        )

    db.commit()
    db.refresh(dispute)

    return dispute


@router.patch(
    "/disputes/{dispute_id}/resolve",
    response_model=DisputeResponse
)
def resolve_dispute(
    dispute_id: int,
    resolution_data: DisputeResolve,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    dispute = db.query(Dispute).filter(
        Dispute.dispute_id == dispute_id
    ).first()

    if not dispute:
        raise HTTPException(
            status_code=404,
            detail="Dispute not found"
        )

    round_obj = db.query(Round).filter(
        Round.round_id == dispute.round_id
    ).first()

    chit = db.query(ChitGroup).filter(
        ChitGroup.chit_id == round_obj.chit_id #type:ignore
    ).first()

    if chit.created_by != current_user.user_id:  # type: ignore
        raise HTTPException(
            status_code=403,
            detail="Only the chit group creator can resolve disputes"
        )

    dispute.status = "RESOLVED"  # type: ignore
    dispute.resolution = resolution_data.resolution  # type: ignore
    
    try:
        transition_round(
            db=db,
            round_obj=round_obj,
            new_state="DISPUTE_RESOLVED",
            actor_id=current_user.user_id,  # type: ignore
            event_type="DISPUTE_RESOLVED",
            details=resolution_data.resolution
        )   
    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error)
        )

    db.commit()
    db.refresh(dispute)

    return dispute