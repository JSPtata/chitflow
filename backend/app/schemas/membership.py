from pydantic import ConfigDict, BaseModel
from datetime import datetime


class MembershipCreate(BaseModel):
    user_id: int


class MembershipResponse(BaseModel):
    membership_id: int
    user_id: int
    chit_id: int
    join_date: datetime
    status: str

    model_config = ConfigDict(from_attributes=True)