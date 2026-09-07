from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Numeric
from datetime import datetime

from app.db.database import Base


class ChitGroup(Base):
    __tablename__ = "chit_groups"

    chit_id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    name = Column(
        String(100),
        nullable=False
    )

    contribution_amount = Column(
        Numeric(10, 2),
        nullable=False
    )

    total_amount = Column(
        Numeric(12, 2),
        nullable=False
    )

    number_of_members = Column(
        Integer,
        nullable=False
    )

    duration = Column(
        Integer,
        nullable=False
    )

    status = Column(
        String(20),
        default="ACTIVE",
        nullable=False
    )

    created_by = Column(
        Integer,
        ForeignKey("users.user_id"),
        nullable=False
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )