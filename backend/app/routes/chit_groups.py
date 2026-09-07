from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.chit_group import ChitGroup
from app.models.user import User
from app.schemas.chit_group import ChitGroupCreate, ChitGroupResponse
from app.core.security import get_current_user


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
    db.commit()
    db.refresh(new_chit)

    return new_chit