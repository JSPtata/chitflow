from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.user import User
from app.models.round import Round
from app.models.chit_group import ChitGroup
from app.models.payout import Payout
from app.schemas.payout import PayoutCreate, PayoutResponse
from app.core.security import get_current_user
from app.state_machine.round_state_machine import transition_round


router = APIRouter(
    prefix="/rounds",
    tags=["Payouts"]
)


@router.post(
    "/{round_id}/payout",
    response_model=PayoutResponse
)
def create_payout(
    round_id: int,
    payout_data: PayoutCreate,
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

    if round_obj.current_state != "RESULT_CONFIRMED": #type:ignore
        raise HTTPException(
            status_code=400,
            detail="Payout can only be created after result confirmation"
        )

    chit = db.query(ChitGroup).filter(
        ChitGroup.chit_id == round_obj.chit_id  # type: ignore
    ).first()

    if not chit:
        raise HTTPException(
            status_code=404,
            detail="Chit group not found"
        )

    if chit.created_by != current_user.user_id:  # type: ignore
        raise HTTPException(
            status_code=403,
            detail="Only the chit group creator can create payout"
        )

    if not round_obj.winner_id:  # type: ignore
        raise HTTPException(
            status_code=400,
            detail="Winner is not assigned for this round"
        )

    existing_payout = db.query(Payout).filter(
        Payout.round_id == round_id
    ).first()

    if existing_payout:
        raise HTTPException(
            status_code=400,
            detail="Payout already exists for this round"
        )

    new_payout = Payout(
        round_id=round_id,
        winner_id=round_obj.winner_id,
        amount=payout_data.amount,
        payout_status="PENDING",
        payment_reference=payout_data.payment_reference
    )

    try:
        transition_round(
            db=db,
            round_obj=round_obj,
            new_state="PAYOUT_PENDING",
            actor_id=current_user.user_id,  # type: ignore
            event_type="PAYOUT_PENDING",
            details=f"Payout created for winner {round_obj.winner_id}"
        )
    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error)
        )

    db.add(new_payout)
    db.commit()
    db.refresh(new_payout)

    return new_payout


@router.patch(
    "/payouts/{payout_id}/verify",
    response_model=PayoutResponse
)
def verify_payout(
    payout_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    payout = db.query(Payout).filter(
        Payout.payout_id == payout_id
    ).first()

    if not payout:
        raise HTTPException(
            status_code=404,
            detail="Payout not found"
        )

    round_obj = db.query(Round).filter(
        Round.round_id == payout.round_id  # type: ignore
    ).first()

    if not round_obj:
        raise HTTPException(
            status_code=404,
            detail="Round not found"
        )

    chit = db.query(ChitGroup).filter(
        ChitGroup.chit_id == round_obj.chit_id  # type: ignore
    ).first()

    if not chit:
        raise HTTPException(
            status_code=404,
            detail="Chit group not found"
        )

    if chit.created_by != current_user.user_id:  # type: ignore
        raise HTTPException(
            status_code=403,
            detail="Only the chit group creator can verify payout"
        )

    payout.payout_status = "VERIFIED"  # type: ignore
    
    try:
        transition_round(
            db=db,
            round_obj=round_obj,
            new_state="PAYOUT_VERIFICATION",
            actor_id=current_user.user_id,  # type: ignore
            event_type="PAYOUT_VERIFIED",
            details=f"Payout {payout.payout_id} verified"
        )
    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error)
        )

    db.commit()
    db.refresh(payout)

    return payout