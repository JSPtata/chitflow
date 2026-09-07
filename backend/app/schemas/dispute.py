from pydantic import BaseModel
from typing import Optional


class DisputeCreate(BaseModel):
    dispute_type: str
    description: str


class DisputeResolve(BaseModel):
    resolution: str


class DisputeResponse(BaseModel):
    dispute_id: int
    round_id: int
    raised_by: int
    dispute_type: str
    description: str
    status: str
    resolution: Optional[str]

    class Config:
        from_attributes = True