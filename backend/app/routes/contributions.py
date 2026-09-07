from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.user import User
from app.models.round import Round
from app.models.membership import Membership
from app.models.contribution import Contribution
from app.schemas.contribution import ContributionCreate, ContributionResponse
from app.core.security import get_current_user
from app.models.chit_group import ChitGroup


router = APIRouter(
    prefix="/rounds",
    tags=["Contributions"]
)


@router.post(
    "/{round_id}/contributions",
    response_model=ContributionResponse
)
def submit_contribution(
    round_id: int,
    contribution: ContributionCreate,
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

    if round_obj.current_state != "CONTRIBUTION_OPEN": #type: ignore
        raise HTTPException(
            status_code=400,
            detail="Contributions are not open for this round"
        )

    membership = db.query(Membership).filter(
        Membership.chit_id == round_obj.chit_id,
        Membership.user_id == current_user.user_id,
        Membership.status == "ACTIVE"
    ).first()

    if not membership:
        raise HTTPException(
            status_code=403,
            detail="You are not an active member of this chit group"
        )

    existing_contribution = db.query(Contribution).filter(
        Contribution.round_id == round_id,
        Contribution.member_id == current_user.user_id
    ).first()

    if existing_contribution:
        raise HTTPException(
            status_code=400,
            detail="Contribution already submitted for this round"
        )

    new_contribution = Contribution(
        round_id=round_id,
        member_id=current_user.user_id,
        amount=contribution.amount,
        payment_reference=contribution.payment_reference,
        payment_status="SUBMITTED"
    )

    db.add(new_contribution)
    db.commit()
    db.refresh(new_contribution)

    return new_contribution

@router.patch(
    "/contributions/{contribution_id}/verify",
    response_model=ContributionResponse
)
def verify_contribution(
    contribution_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    contribution = db.query(Contribution).filter(
        Contribution.contribution_id == contribution_id
    ).first()

    if not contribution:
        raise HTTPException(
            status_code=404,
            detail="Contribution not found"
        )

    round_obj = db.query(Round).filter(
        Round.round_id == contribution.round_id
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
            detail="Only the chit group creator can verify contributions"
        )

    contribution.payment_status = "VERIFIED"  # type: ignore

    db.commit()
    db.refresh(contribution)

    return contribution

@router.get(
    "/{round_id}/contributions",
    response_model=list[ContributionResponse]
)
def get_contributions(
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

    return db.query(Contribution).filter(
        Contribution.round_id == round_id
    ).all()