from pydantic import ConfigDict, BaseModel
from decimal import Decimal
from datetime import datetime
from pydantic import BaseModel, Field


class BidCreate(BaseModel):
    bid_amount: Decimal = Field(gt=0, max_digits=10, decimal_places=2)


class BidResponse(BaseModel):
    bid_id: int
    round_id: int
    member_id: int
    bid_amount: Decimal
    timestamp: datetime
    status: str

    model_config = ConfigDict(from_attributes=True)