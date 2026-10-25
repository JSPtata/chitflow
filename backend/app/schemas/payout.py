from pydantic import ConfigDict, BaseModel
from decimal import Decimal
from typing import Optional
from pydantic import BaseModel, Field


class PayoutCreate(BaseModel):
    amount: Decimal = Field(gt=0, max_digits=12, decimal_places=2)
    payment_reference: Optional[str] = Field(
        default=None,
        max_length=100
    )


class PayoutResponse(BaseModel):
    payout_id: int
    round_id: int
    winner_id: int
    amount: Decimal
    payout_status: str
    payment_reference: Optional[str]

    model_config = ConfigDict(from_attributes=True)