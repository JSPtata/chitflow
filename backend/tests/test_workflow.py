import hashlib
import json
from datetime import UTC, datetime, timedelta

import pytest

from app.core.security import create_access_token


PASSWORD = "OnlyForTests!47"


def account(client, number):
    data = {"name": f"Test {number}", "email": f"test{number}@example.com", "phone": f"900000{number:04}", "password": PASSWORD}
    response = client.post("/users/register", json=data)
    assert response.status_code == 200, response.text
    user = response.json()
    login = client.post("/users/login", json={"email": data["email"], "password": PASSWORD})
    assert login.status_code == 200
    return user, {"Authorization": "Bearer " + login.json()["access_token"]}


def setup(client):
    owner, auth = account(client, 1)
    member, member_auth = account(client, 2)
    outsider, outsider_auth = account(client, 3)
    response = client.post("/chit-groups/", headers=auth, json={"name": "Test group", "contribution_amount": 100, "total_amount": 200, "number_of_members": 2, "duration": 2})
    assert response.status_code == 200
    group = response.json()["chit_id"]
    assert client.post(f"/chit-groups/{group}/members", headers=auth, json={"user_id": member["user_id"]}).status_code == 200
    response = client.post(f"/chit-groups/{group}/rounds", headers=auth, json={"round_number": 1})
    assert response.status_code == 200
    return {"owner": owner, "auth": auth, "member": member, "member_auth": member_auth, "outsider": outsider, "outsider_auth": outsider_auth, "group": group, "round": response.json()["round_id"]}


def move(client, data, state, expected=200):
    response = client.patch(f"/chit-groups/rounds/{data['round']}/state", headers=data["auth"], json={"new_state": state})
    assert response.status_code == expected, response.text
    return response


def ready_for_result(client, data):
    move(client, data, "CONTRIBUTION_OPEN")
    contributions = []
    for auth in [data["auth"], data["member_auth"]]:
        response = client.post(f"/rounds/{data['round']}/contributions", headers=auth, json={"amount": 100, "payment_reference": "TEST-NOT-A-BANK-TRANSFER"})
        assert response.status_code == 200
        contributions.append(response.json()["contribution_id"])
    move(client, data, "CONTRIBUTION_VERIFICATION")
    move(client, data, "BIDDING_OPEN", 400)
    for contribution in contributions:
        assert client.patch(f"/rounds/contributions/{contribution}/verify", headers=data["auth"]).status_code == 200
    move(client, data, "BIDDING_OPEN")
    move(client, data, "BIDDING_CLOSED", 400)
    for auth, amount in [(data["auth"], 180), (data["member_auth"], 170)]:
        assert client.post(f"/rounds/{data['round']}/bids", headers=auth, json={"bid_amount": amount}).status_code == 200
    move(client, data, "BIDDING_CLOSED")
    move(client, data, "RESULT_PROPOSED", 400)
    response = client.post(f"/rounds/{data['round']}/result", headers=data["auth"])
    assert response.status_code == 200
    assert response.json()["winner_id"] == data["member"]["user_id"]
    move(client, data, "CHALLENGE_OPEN")


def test_complete_dispute_payout_and_audit(client):
    data = setup(client)
    ready_for_result(client, data)
    response = client.post(f"/rounds/{data['round']}/disputes", headers=data["member_auth"], json={"dispute_type": "RESULT", "description": "Test review of the recorded bid evidence"})
    assert response.status_code == 200
    dispute = response.json()["dispute_id"]
    assert client.patch(f"/rounds/disputes/{dispute}/review", headers=data["member_auth"]).status_code == 403
    move(client, data, "RESULT_CONFIRMED", 400)
    assert client.patch(f"/rounds/disputes/{dispute}/review", headers=data["auth"]).status_code == 200
    assert client.patch(f"/rounds/disputes/{dispute}/resolve", headers=data["auth"], json={"resolution": "Reviewed the bid evidence; retain the selected result"}).status_code == 200
    move(client, data, "RESULT_CONFIRMED")
    move(client, data, "PAYOUT_PENDING", 400)
    response = client.post(f"/rounds/{data['round']}/payout", headers=data["auth"], json={"amount": 170, "payment_reference": "TEST-PAYOUT"})
    assert response.status_code == 200
    payout = response.json()["payout_id"]
    recovered = client.get(f"/rounds/{data['round']}/payout", headers=data["auth"])
    assert recovered.status_code == 200 and recovered.json()["payout_id"] == payout
    assert client.get(f"/rounds/{data['round']}/payout", headers=data["member_auth"]).status_code == 200
    assert client.get(f"/rounds/{data['round']}/payout", headers=data["outsider_auth"]).status_code == 403
    assert client.patch(f"/rounds/payouts/{payout}/verify", headers=data["member_auth"]).status_code == 403
    move(client, data, "PAYOUT_VERIFICATION", 400)
    assert client.patch(f"/rounds/payouts/{payout}/verify", headers=data["auth"]).status_code == 200
    move(client, data, "ROUND_SETTLED")
    move(client, data, "CONTRIBUTION_OPEN", 400)
    events = client.get(f"/rounds/{data['round']}/audit", headers=data["auth"]).json()
    assert len(events) == 13
    previous = "GENESIS"
    for item in events:
        assert item["previous_hash"] == previous
        record = {key: item[key] for key in ["round_id", "actor_id", "event_type", "old_state", "new_state", "details"]}
        record["timestamp"] = datetime.fromisoformat(item["timestamp"]).isoformat()
        digest = hashlib.sha256((previous + json.dumps(record, sort_keys=True, separators=(",", ":"))).encode()).hexdigest()
        assert digest == item["current_hash"]
        previous = digest


@pytest.mark.parametrize("target", ["RESULT_PROPOSED", "PAYOUT_PENDING", "PAYOUT_VERIFICATION", "DISPUTE_RAISED", "DISPUTE_UNDER_REVIEW", "DISPUTE_RESOLVED", "ROUND_SETTLED"])
def test_cannot_bypass_dedicated_actions(client, target):
    move(client, setup(client), target, 400)


def test_permissions_duplicates_and_validation(client):
    data = setup(client)
    for suffix in ["contributions", "bids", "audit", "disputes", "payout"]:
        assert client.get(f"/rounds/{data['round']}/{suffix}", headers=data["outsider_auth"]).status_code == 403
    assert client.get(f"/chit-groups/{data['group']}", headers=data["outsider_auth"]).status_code == 403
    assert client.get(f"/chit-groups/{data['group']}/rounds", headers=data["outsider_auth"]).status_code == 403
    assert client.post(f"/chit-groups/{data['group']}/rounds", headers=data["member_auth"], json={"round_number": 2}).status_code == 403
    assert client.post(f"/chit-groups/{data['group']}/rounds", headers=data["auth"], json={"round_number": 1}).status_code == 409
    assert client.post(f"/chit-groups/{data['group']}/rounds", headers=data["auth"], json={"round_number": 0}).status_code == 422
    assert client.post(f"/chit-groups/{data['group']}/members", headers=data["auth"], json={"user_id": data["outsider"]["user_id"]}).status_code == 400
    move(client, data, "CONTRIBUTION_OPEN")
    payment = {"amount": 100, "payment_reference": "TEST-PAYMENT"}
    response = client.post(f"/rounds/{data['round']}/contributions", headers=data["auth"], json=payment)
    assert response.status_code == 200
    assert client.post(f"/rounds/{data['round']}/contributions", headers=data["auth"], json=payment).status_code == 400
    assert client.patch(f"/rounds/contributions/{response.json()['contribution_id']}/verify", headers=data["auth"]).status_code == 400
    move(client, data, "CONTRIBUTION_VERIFICATION")
    assert client.patch(f"/rounds/contributions/{response.json()['contribution_id']}/verify", headers=data["member_auth"]).status_code == 403
    assert client.patch(f"/rounds/contributions/{response.json()['contribution_id']}/verify", headers=data["auth"]).status_code == 200
    move(client, data, "BIDDING_OPEN")
    assert client.post(f"/rounds/{data['round']}/bids", headers=data["member_auth"], json={"bid_amount": 170}).status_code == 403
    assert client.post(f"/rounds/{data['round']}/bids", headers=data["auth"], json={"bid_amount": -1}).status_code == 422


def test_authentication_and_password_limits(client):
    user, auth = account(client, 1)
    assert client.get("/users/me", headers=auth).status_code == 200
    assert client.get("/users/me").status_code in (401, 403)
    assert client.post("/users/login", json={"email": "test1@example.com", "password": "wrong"}).status_code == 401
    assert client.post("/users/login", json={"email": "test1@example.com", "password": "é" * 40}).status_code == 422
    assert client.post("/users/register", json={"name": "Test", "email": "other@example.com", "phone": "9000000200", "password": "é" * 40}).status_code == 422
    for claim in ["not-a-number", True, -1]:
        token = create_access_token({"user_id": claim})
        assert client.get("/users/me", headers={"Authorization": "Bearer " + token}).status_code == 401
    import jwt
    from app.core.config import settings
    expired = jwt.encode({"user_id": user["user_id"], "exp": datetime.now(UTC) - timedelta(hours=1)}, settings.SECRET_KEY, algorithm="HS256")
    assert client.get("/users/me", headers={"Authorization": "Bearer " + expired}).status_code == 401


def test_health_and_empty_payout(client):
    assert client.get("/health").json() == {"status": "ok", "database": "connected"}
    data = setup(client)
    response = client.get(f"/rounds/{data['round']}/payout", headers=data["auth"])
    assert response.status_code == 200 and response.json() is None


def test_postgresql_serializes_duplicate_round_creation(client):
    import os
    from concurrent.futures import ThreadPoolExecutor
    if not os.environ.get("TEST_DATABASE_URL"):
        pytest.skip("PostgreSQL-specific row lock test")
    data = setup(client)
    def create(_):
        return client.post(f"/chit-groups/{data['group']}/rounds", headers=data["auth"], json={"round_number": 2}).status_code
    with ThreadPoolExecutor(max_workers=2) as pool:
        assert sorted(pool.map(create, range(2))) == [200, 409]
