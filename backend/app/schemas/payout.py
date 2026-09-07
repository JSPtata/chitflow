from pydantic import BaseModel
from decimal import Decimal
from typing import Optional


class PayoutCreate(BaseModel):
    amount: Decimal
    payment_reference: Optional[str] = None


class PayoutResponse(BaseModel):
    payout_id: int
    round_id: int
    winner_id: int
    amount: Decimal
    payout_status: str
    payment_reference: Optional[str]

    class Config:
        from_attributes = True