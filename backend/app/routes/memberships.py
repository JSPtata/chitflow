from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.user import User
from app.models.chit_group import ChitGroup
from app.models.membership import Membership
from app.schemas.membership import MembershipCreate, MembershipResponse
from app.core.security import get_current_user


router = APIRouter(
    prefix="/chit-groups",
    tags=["Memberships"]
)


@router.post(
    "/{chit_id}/members",
    response_model=MembershipResponse
)
def add_member(
    chit_id: int,
    membership: MembershipCreate,
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
            detail="Only the chit group creator can add members"
        )

    user = db.query(User).filter(
        User.user_id == membership.user_id
    ).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    existing_membership = db.query(Membership).filter(
        Membership.chit_id == chit_id,
        Membership.user_id == membership.user_id
    ).first()

    if existing_membership:
        raise HTTPException(
            status_code=400,
            detail="User is already a member of this chit group"
        )
    
    member_count = db.query(Membership).filter(
        Membership.chit_id == chit_id,
        Membership.status == "ACTIVE"
    ).count()

    if member_count >= chit.number_of_members:  # type: ignore
        raise HTTPException(
            status_code=400,
            detail="Chit group has reached maximum member capacity"
        )

    new_membership = Membership(
        user_id=membership.user_id,
        chit_id=chit_id,
        status="ACTIVE"
    )

    db.add(new_membership)
    db.commit()
    db.refresh(new_membership)

    return new_membership

@router.get(
    "/{chit_id}/members",
    response_model=list[MembershipResponse]
)
def get_members(
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

    return db.query(Membership).filter(
        Membership.chit_id == chit_id
    ).all()