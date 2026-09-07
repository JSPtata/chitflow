from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class RoundCreate(BaseModel):
    round_number: int
    due_date: Optional[datetime] = None


class RoundTransition(BaseModel):
    new_state: str


class RoundResponse(BaseModel):
    round_id: int
    chit_id: int
    round_number: int
    current_state: str
    start_date: datetime
    due_date: Optional[datetime]
    winner_id: Optional[int]

    class Config:
        from_attributes = True