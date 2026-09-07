from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Numeric
from datetime import datetime

from app.db.database import Base


class Contribution(Base):
    __tablename__ = "contributions"

    contribution_id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    round_id = Column(
        Integer,
        ForeignKey("rounds.round_id"),
        nullable=False
    )

    member_id = Column(
        Integer,
        ForeignKey("users.user_id"),
        nullable=False
    )

    amount = Column(
        Numeric(10, 2),
        nullable=False
    )

    payment_date = Column(
        DateTime,
        default=datetime.utcnow
    )

    payment_status = Column(
        String(20),
        default="SUBMITTED",
        nullable=False
    )

    payment_reference = Column(
        String(100),
        nullable=False
    )