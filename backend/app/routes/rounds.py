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
    ).first()

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
    ).first()

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