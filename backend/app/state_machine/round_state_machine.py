VALID_TRANSITIONS = {
    "ROUND_CREATED": [
        "CONTRIBUTION_OPEN"
    ],

    "CONTRIBUTION_OPEN": [
        "CONTRIBUTION_VERIFICATION",
        "PAYMENT_LATE"
    ],

    "PAYMENT_LATE": [
        "CONTRIBUTION_VERIFICATION",
        "PAYMENT_DEFAULT"
    ],

    "CONTRIBUTION_VERIFICATION": [
        "BIDDING_OPEN"
    ],

    "BIDDING_OPEN": [
        "BIDDING_CLOSED"
    ],

    "BIDDING_CLOSED": [
        "RESULT_PROPOSED"
    ],

    "RESULT_PROPOSED": [
        "CHALLENGE_OPEN"
    ],

    "CHALLENGE_OPEN": [
        "RESULT_CONFIRMED",
        "DISPUTE_RAISED"
    ],

    "DISPUTE_RAISED": [
        "DISPUTE_UNDER_REVIEW"
    ],

    "DISPUTE_UNDER_REVIEW": [
        "DISPUTE_RESOLVED"
    ],

    "DISPUTE_RESOLVED": [
        "RESULT_CONFIRMED",
        "RESULT_PROPOSED"
    ],

    "RESULT_CONFIRMED": [
        "PAYOUT_PENDING"
    ],

    "PAYOUT_PENDING": [
        "PAYOUT_VERIFICATION",
        "PAYOUT_DISPUTED"
    ],

    "PAYOUT_VERIFICATION": [
        "ROUND_SETTLED"
    ]
}


def is_valid_transition(current_state: str, new_state: str) -> bool:
    allowed_states = VALID_TRANSITIONS.get(current_state, [])

    return new_state in allowed_states

def transition_round(
    db,
    round_obj,
    new_state: str,
    actor_id: int,
    event_type: str = "ROUND_STATE_CHANGED",
    details: str | None = None
):
    from app.services.audit_service import create_audit_event

    old_state = round_obj.current_state

    if not is_valid_transition(
        old_state,
        new_state
    ):
        raise ValueError(
            f"Invalid transition from {old_state} to {new_state}"
        )

    round_obj.current_state = new_state

    create_audit_event(
        db=db,
        round_id=round_obj.round_id,
        actor_id=actor_id,
        event_type=event_type,
        old_state=old_state,
        new_state=new_state,
        details=details
    )