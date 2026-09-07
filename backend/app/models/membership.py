from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from datetime import datetime

from app.db.database import Base


class Membership(Base):
    __tablename__ = "memberships"

    membership_id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    user_id = Column(
        Integer,
        ForeignKey("users.user_id"),
        nullable=False
    )

    chit_id = Column(
        Integer,
        ForeignKey("chit_groups.chit_id"),
        nullable=False
    )

    join_date = Column(
        DateTime,
        default=datetime.utcnow
    )

    status = Column(
        String(20),
        default="ACTIVE",
        nullable=False
    )