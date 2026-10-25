from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.user import User
from app.models.chit_group import ChitGroup
from app.models.round import Round
from app.schemas.round import RoundCreate, RoundTransition, RoundResponse
from app.core.security import get_current_user
from app.state_machine.round_state_machine import transition_round
from app.models.membership import Membership
from app.models.contribution import Contribution
from app.models.bid import Bid
from app.models.payout import Payout
from app.models.dispute import Dispute


router = APIRouter(
    prefix="/chit-groups",
    tags=["Rounds"]
)


@router.post(
    "/{chit_id}/rounds",
    response_model=RoundResponse
)
def create_round(
    chit_id: int,
    round_data: RoundCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    chit = db.query(ChitGroup).filter(
        ChitGroup.chit_id == chit_id
    ).with_for_update().first()

    if not chit:
        raise HTTPException(
            status_code=404,
            detail="Chit group not found"
        )

    if chit.created_by != current_user.user_id:  # type: ignore
        raise HTTPException(
            status_code=403,
            detail="Only the chit group creator can create rounds"
        )

    duplicate = db.query(Round).filter(
        Round.chit_id == chit_id,
        Round.round_number == round_data.round_number
    ).first()
    if duplicate:
        raise HTTPException(status_code=409, detail="This round number already exists in the group")

    new_round = Round(
        chit_id=chit_id,
        round_number=round_data.round_number,
        current_state="ROUND_CREATED",
        due_date=round_data.due_date
    )

    db.add(new_round)
    db.commit()
    db.refresh(new_round)

    return new_round


@router.patch(
    "/rounds/{round_id}/state",
    response_model=RoundResponse
)
def change_round_state(
    round_id: int,
    transition: RoundTransition,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    round_obj = db.query(Round).filter(
        Round.round_id == round_id
    ).with_for_update().first()

    if not round_obj:
        raise HTTPException(
            status_code=404,
            detail="Round not found"
        )

    chit = db.query(ChitGroup).filter(
        ChitGroup.chit_id == round_obj.chit_id
    ).first()

    if not chit:
        raise HTTPException(
            status_code=404,
            detail="Chit group not found"
        )

    if chit.created_by != current_user.user_id:  # type: ignore
        raise HTTPException(
            status_code=403,
            detail="Only the chit group creator can change round state"
        )

    # These actions create or validate records; a generic PATCH must not bypass them.
    dedicated = {
        "RESULT_PROPOSED": "the result action",
        "PAYOUT_PENDING": "payout creation",
        "PAYOUT_VERIFICATION": "payout verification",
        "DISPUTE_RAISED": "the raise-dispute action",
        "DISPUTE_UNDER_REVIEW": "the dispute review action",
        "DISPUTE_RESOLVED": "the dispute resolution action",
    }
    target = transition.new_state
    if target in dedicated:
        raise HTTPException(status_code=400, detail=f"Use {dedicated[target]} instead of a generic state transition")
    if target == "BIDDING_OPEN":
        payments = db.query(Contribution).filter(Contribution.round_id == round_id).all()
        if not payments or any(p.payment_status != "VERIFIED" for p in payments):
            raise HTTPException(status_code=400, detail="Submitted contributions must be verified before bidding")
    if target == "BIDDING_CLOSED" and not db.query(Bid).filter(Bid.round_id == round_id, Bid.status == "ACTIVE").first():
        raise HTTPException(status_code=400, detail="At least one active bid is required before closing bidding")
    if target == "RESULT_CONFIRMED":
        if not round_obj.winner_id:
            raise HTTPException(status_code=400, detail="A result must assign a winner before confirmation")
        if db.query(Dispute).filter(Dispute.round_id == round_id, Dispute.status != "RESOLVED").first():
            raise HTTPException(status_code=400, detail="Resolve outstanding disputes before confirming the result")
    if target == "ROUND_SETTLED":
        verified_payout = db.query(Payout).filter(
            Payout.round_id == round_id, Payout.payout_status == "VERIFIED",
            Payout.winner_id == round_obj.winner_id
        ).first()
        if not verified_payout:
            raise HTTPException(status_code=400, detail="A verified winner payout is required before settlement")

    try:
        transition_round(
            db=db,
            round_obj=round_obj,
            new_state=transition.new_state,
            actor_id=current_user.user_id #type:ignore
    )
    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error)
        )

    db.commit()
    db.refresh(round_obj)

    return round_obj

@router.get(
    "/{chit_id}/rounds",
    response_model=list[RoundResponse]
)
def get_rounds(
    chit_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    membership = db.query(Membership).filter(
        Membership.chit_id == chit_id,
        Membership.user_id == current_user.user_id,
        Membership.status == "ACTIVE"
    ).first()

    if not membership:
        raise HTTPException(
            status_code=403,
            detail="You are not a member of this chit group"
        )

    return db.query(Round).filter(
        Round.chit_id == chit_id
    ).order_by(
        Round.round_number.asc()
    ).all()