from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.chit_group import ChitGroup
from app.models.user import User
from app.schemas.chit_group import ChitGroupCreate, ChitGroupResponse
from app.core.security import get_current_user
from app.models.membership import Membership
from typing import List



router = APIRouter(
    prefix="/chit-groups",
    tags=["Chit Groups"]
)


@router.post("/", response_model=ChitGroupResponse)
def create_chit_group(
    chit: ChitGroupCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    new_chit = ChitGroup(
        name=chit.name,
        contribution_amount=chit.contribution_amount,
        total_amount=chit.total_amount,
        number_of_members=chit.number_of_members,
        duration=chit.duration,
        status="ACTIVE",
        created_by=current_user.user_id
    )

    db.add(new_chit)
    db.flush()

    creator_membership = Membership(
        user_id=current_user.user_id,
        chit_id=new_chit.chit_id,
        status="ACTIVE"
    )  

    db.add(creator_membership)

    db.commit()
    db.refresh(new_chit)

    return new_chit

@router.get(
    "/",
    response_model=List[ChitGroupResponse]
)
def get_my_chit_groups(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    memberships = db.query(Membership).filter(
        Membership.user_id == current_user.user_id,
        Membership.status == "ACTIVE"
    ).all()

    chit_ids = [
        membership.chit_id
        for membership in memberships
    ]

    return db.query(ChitGroup).filter(
        ChitGroup.chit_id.in_(chit_ids)
    ).all()


@router.get(
    "/{chit_id}",
    response_model=ChitGroupResponse
)
def get_chit_group(
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
        raise HTTPException( #type:ignore
            status_code=403,
            detail="You are not a member of this chit group"
        )

    chit = db.query(ChitGroup).filter(
        ChitGroup.chit_id == chit_id
    ).first()

    if not chit:
        raise HTTPException( #type:ignore
            status_code=404,
            detail="Chit group not found"
        )

    return chit