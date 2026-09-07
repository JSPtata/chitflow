from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class AuditEventResponse(BaseModel):
    event_id: int
    round_id: int
    actor_id: int
    event_type: str
    old_state: Optional[str]
    new_state: Optional[str]
    timestamp: datetime
    details: Optional[str]
    previous_hash: str
    current_hash: str

    class Config:
        from_attributes = True