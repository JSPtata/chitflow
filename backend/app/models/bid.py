from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Numeric
from datetime import datetime

from app.db.database import Base


class Bid(Base):
    __tablename__ = "bids"

    bid_id = Column(Integer, primary_key=True, index=True)

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

    bid_amount = Column(
        Numeric(10, 2),
        nullable=False
    )

    timestamp = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )

    status = Column(
        String(20),
        default="ACTIVE",
        nullable=False
    )