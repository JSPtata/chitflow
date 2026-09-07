import hashlib
import json
from datetime import datetime

from sqlalchemy.orm import Session

from app.models.audit_event import AuditEvent


def create_audit_event(
    db: Session,
    round_id: int,
    actor_id: int,
    event_type: str,
    old_state: str | None,
    new_state: str | None,
    details: str | None = None
):
    previous_event = db.query(AuditEvent).filter(
        AuditEvent.round_id == round_id
    ).order_by(
        AuditEvent.event_id.desc()
    ).first()

    previous_hash = (
        previous_event.current_hash
        if previous_event
        else "GENESIS"
    )

    timestamp = datetime.utcnow()

    event_data = {
        "round_id": round_id,
        "actor_id": actor_id,
        "event_type": event_type,
        "old_state": old_state,
        "new_state": new_state,
        "timestamp": timestamp.isoformat(),
        "details": details
    }

    serialized_data = json.dumps(
        event_data,
        sort_keys=True,
        separators=(",", ":")
    )

    current_hash = hashlib.sha256(
        (previous_hash + serialized_data).encode()
    ).hexdigest()

    audit_event = AuditEvent(
        round_id=round_id,
        actor_id=actor_id,
        event_type=event_type,
        old_state=old_state,
        new_state=new_state,
        timestamp=timestamp,
        details=details,
        previous_hash=previous_hash,
        current_hash=current_hash
    )

    db.add(audit_event)

    return audit_event