from sqlalchemy import Column, Integer, String, ForeignKey, Numeric

from app.db.database import Base


class Payout(Base):
    __tablename__ = "payouts"

    payout_id = Column(Integer, primary_key=True, index=True)

    round_id = Column(
        Integer,
        ForeignKey("rounds.round_id"),
        nullable=False
    )

    winner_id = Column(
        Integer,
        ForeignKey("users.user_id"),
        nullable=False
    )

    amount = Column(
        Numeric(12, 2),
        nullable=False
    )

    payout_status = Column(
        String(30),
        default="PENDING",
        nullable=False
    )

    payment_reference = Column(
        String(100),
        nullable=True
    )