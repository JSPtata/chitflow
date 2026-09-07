from sqlalchemy import Column, Integer, String, Text, ForeignKey
from app.db.database import Base


class Dispute(Base):
    __tablename__ = "disputes"

    dispute_id = Column(Integer, primary_key=True, index=True)

    round_id = Column(
        Integer,
        ForeignKey("rounds.round_id"),
        nullable=False
    )

    raised_by = Column(
        Integer,
        ForeignKey("users.user_id"),
        nullable=False
    )

    dispute_type = Column(
        String(50),
        nullable=False
    )

    description = Column(
        Text,
        nullable=False
    )

    status = Column(
        String(30),
        default="RAISED",
        nullable=False
    )

    resolution = Column(
        Text,
        nullable=True
    )