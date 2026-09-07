from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from datetime import datetime

from app.db.database import Base


class AuditEvent(Base):
    __tablename__ = "audit_events"

    event_id = Column(Integer, primary_key=True, index=True)

    round_id = Column(
        Integer,
        ForeignKey("rounds.round_id"),
        nullable=False
    )

    actor_id = Column(
        Integer,
        ForeignKey("users.user_id"),
        nullable=False
    )

    event_type = Column(
        String(60),
        nullable=False
    )

    old_state = Column(
        String(40),
        nullable=True
    )

    new_state = Column(
        String(40),
        nullable=True
    )

    timestamp = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )

    details = Column(
        Text,
        nullable=True
    )

    previous_hash = Column(
        String(64),
        nullable=False
    )

    current_hash = Column(
        String(64),
        nullable=False
    )