from pydantic import ConfigDict, BaseModel, Field
from typing import Optional


class DisputeCreate(BaseModel):
    dispute_type: str = Field(min_length=1, max_length=50)
    description: str = Field(min_length=5, max_length=5000)


class DisputeResolve(BaseModel):
    resolution: str = Field(min_length=5, max_length=5000)


class DisputeResponse(BaseModel):
    dispute_id: int
    round_id: int
    raised_by: int
    dispute_type: str
    description: str
    status: str
    resolution: Optional[str]

    model_config = ConfigDict(from_attributes=True)