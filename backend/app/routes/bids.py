from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.user import User
from app.models.round import Round
from app.models.membership import Membership
from app.models.contribution import Contribution
from app.models.bid import Bid
from app.schemas.bid import BidCreate, BidResponse
from app.core.security import get_current_user
from app.models.chit_group import ChitGroup


router = APIRouter(
    prefix="/rounds",
    tags=["Bids"]
)


@router.post(
    "/{round_id}/bids",
    response_model=BidResponse
)
def place_bid(
    round_id: int,
    bid: BidCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    round_obj = db.query(Round).filter(
        Round.round_id == round_id
    ).first()

    if not round_obj:
        raise HTTPException(
            status_code=404,
            detail="Round not found"
        )

    if round_obj.current_state != "BIDDING_OPEN": #type:ignore
        raise HTTPException(
            status_code=400,
            detail="Bidding is not open for this round"
        )

    membership = db.query(Membership).filter(
        Membership.chit_id == round_obj.chit_id,
        Membership.user_id == current_user.user_id,
        Membership.status == "ACTIVE"
    ).first()

    if not membership:
        raise HTTPException(
            status_code=403,
            detail="You are not an active member of this chit group"
        )

    contribution = db.query(Contribution).filter(
        Contribution.round_id == round_id,
        Contribution.member_id == current_user.user_id,
        Contribution.payment_status == "VERIFIED"
    ).first()

    if not contribution:
        raise HTTPException(
            status_code=403,
            detail="Verified contribution required before bidding"
        )

    new_bid = Bid(
        round_id=round_id,
        member_id=current_user.user_id,
        bid_amount=bid.bid_amount,
        status="ACTIVE"
    )

    db.add(new_bid)
    db.commit()
    db.refresh(new_bid)

    return new_bid

@router.post(
    "/{round_id}/result",
    response_model=dict
)
def propose_result(
    round_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    round_obj = db.query(Round).filter(
        Round.round_id == round_id
    ).first()

    if not round_obj:
        raise HTTPException(
            status_code=404,
            detail="Round not found"
        )

    if round_obj.current_state != "BIDDING_CLOSED":#type:ignore
        raise HTTPException(
            status_code=400,
            detail="Result can only be proposed after bidding is closed"
        )

    chit = db.query(ChitGroup).filter(
        ChitGroup.chit_id == round_obj.chit_id
    ).first()

    if not chit:
        raise HTTPException(
            status_code=404,
            detail="Chit group not found"
        )

    if chit.created_by != current_user.user_id:  # type: ignore
        raise HTTPException(
            status_code=403,
            detail="Only the chit group creator can propose the result"
        )

    winning_bid = db.query(Bid).filter(
        Bid.round_id == round_id,
        Bid.status == "ACTIVE"
    ).order_by(
        Bid.bid_amount.asc()
    ).first()

    if not winning_bid:
        raise HTTPException(
            status_code=400,
            detail="No active bids found for this round"
        )

    round_obj.winner_id = winning_bid.member_id  # type: ignore
    round_obj.current_state = "RESULT_PROPOSED"  # type: ignore

    winning_bid.status = "WINNING"  # type: ignore

    db.commit()
    db.refresh(round_obj)
    db.refresh(winning_bid)

    return {
        "round_id": round_obj.round_id,
        "winner_id": round_obj.winner_id,
        "winning_bid_id": winning_bid.bid_id,
        "winning_bid_amount": str(winning_bid.bid_amount),
        "current_state": round_obj.current_state
    }