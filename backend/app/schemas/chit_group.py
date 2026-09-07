from pydantic import BaseModel
from decimal import Decimal


class ChitGroupCreate(BaseModel):
    name: str
    contribution_amount: Decimal
    total_amount: Decimal
    number_of_members: int
    duration: int


class ChitGroupResponse(BaseModel):
    chit_id: int
    name: str
    contribution_amount: Decimal
    total_amount: Decimal
    number_of_members: int
    duration: int
    status: str
    created_by: int

    class Config:
        from_attributes = True