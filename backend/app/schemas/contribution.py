from pydantic import BaseModel
from decimal import Decimal
from datetime import datetime


class ContributionCreate(BaseModel):
    amount: Decimal
    payment_reference: str


class ContributionResponse(BaseModel):
    contribution_id: int
    round_id: int
    member_id: int
    amount: Decimal
    payment_date: datetime
    payment_status: str
    payment_reference: str

    class Config:
        from_attributes = True