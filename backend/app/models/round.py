from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from datetime import datetime

from app.db.database import Base


class Round(Base):
    __tablename__ = "rounds"

    round_id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    chit_id = Column(
        Integer,
        ForeignKey("chit_groups.chit_id"),
        nullable=False
    )

    round_number = Column(
        Integer,
        nullable=False
    )

    current_state = Column(
        String(40),
        default="ROUND_CREATED",
        nullable=False
    )

    start_date = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )

    due_date = Column(
        DateTime,
        nullable=True
    )

    winner_id = Column(
        Integer,
        ForeignKey("users.user_id"),
        nullable=True
    )