from pydantic import ConfigDict, BaseModel, Field
from decimal import Decimal


class ChitGroupCreate(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    contribution_amount: Decimal = Field(gt=0, max_digits=10, decimal_places=2)
    total_amount: Decimal = Field(gt=0, max_digits=12, decimal_places=2)
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

    model_config = ConfigDict(from_attributes=True)