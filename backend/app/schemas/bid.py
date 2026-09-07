from pydantic import BaseModel
from decimal import Decimal
from datetime import datetime
from pydantic import BaseModel, Field


class BidCreate(BaseModel):
    bid_amount: Decimal = Field(gt=0)


class BidResponse(BaseModel):
    bid_id: int
    round_id: int
    member_id: int
    bid_amount: Decimal
    timestamp: datetime
    status: str

    class Config:
        from_attributes = True