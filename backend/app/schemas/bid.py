from pydantic import BaseModel
from decimal import Decimal
from datetime import datetime


class BidCreate(BaseModel):
    bid_amount: Decimal


class BidResponse(BaseModel):
    bid_id: int
    round_id: int
    member_id: int
    bid_amount: Decimal
    timestamp: datetime
    status: str

    class Config:
        from_attributes = True