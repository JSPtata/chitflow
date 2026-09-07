from pydantic import BaseModel
from datetime import datetime


class MembershipCreate(BaseModel):
    user_id: int


class MembershipResponse(BaseModel):
    membership_id: int
    user_id: int
    chit_id: int
    join_date: datetime
    status: str

    class Config:
        from_attributes = True