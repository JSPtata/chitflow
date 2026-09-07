from pydantic import BaseModel, Field
from decimal import Decimal


class ChitGroupCreate(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    contribution_amount: Decimal = Field(gt=0)
    total_amount: Decimal = Field(gt=0)
    number_of_members: int = Field(gt=1)
    duration: int = Field(gt=0)


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