from pydantic import ConfigDict, BaseModel
from decimal import Decimal
from datetime import datetime
from pydantic import BaseModel, Field


class ContributionCreate(BaseModel):
    amount: Decimal = Field(gt=0, max_digits=10, decimal_places=2)
    payment_reference: str = Field(min_length=2, max_length=100)


class ContributionResponse(BaseModel):
    contribution_id: int
    round_id: int
    member_id: int
    amount: Decimal
    payment_date: datetime
    payment_status: str
    payment_reference: str

    model_config = ConfigDict(from_attributes=True)
