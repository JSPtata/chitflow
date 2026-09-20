#!/bin/bash

# ============================================================
# ChitFlow presentation/demo data seeder
# ============================================================

BASE_URL="http://127.0.0.1:8000"

MANAGER_EMAIL="chitflowdemo917@example.com"
MANAGER_PASSWORD="chitflow123"


echo ""
echo "============================================================"
echo " ChitFlow Demo Seeder"
echo "============================================================"
echo ""


# ============================================================
# JSON HELPERS
# ============================================================

json_value() {
  KEY="$1"

  python3 -c "
import json
import sys

key = '$KEY'

try:
    data = json.load(sys.stdin)

    value = data.get(key)

    if value is None and key == 'user_id':
        value = data.get('id')

    if value is None and key == 'chit_id':
        value = data.get('id')

    if value is None and key == 'round_id':
        value = data.get('id')

    if value is not None:
        print(value)
except Exception:
    pass
"
}


# ============================================================
# LOGIN
# ============================================================

login_user() {
  EMAIL="$1"
  PASSWORD="$2"

  RESPONSE=$(curl -s \
    -X POST \
    "$BASE_URL/users/login" \
    -H "Content-Type: application/json" \
    -d "{
      \"email\": \"$EMAIL\",
      \"password\": \"$PASSWORD\"
    }")

  echo "$RESPONSE" |
    json_value "access_token"
}


# ============================================================
# GET USER ID
# ============================================================

get_user_id() {
  TOKEN="$1"

  RESPONSE=$(curl -s \
    "$BASE_URL/users/me" \
    -H "Authorization: Bearer $TOKEN")

  echo "$RESPONSE" |
    json_value "user_id"
}


# ============================================================
# REGISTER USER
# ============================================================

create_demo_user() {
  NAME="$1"
  EMAIL="$2"
  PHONE="$3"
  PASSWORD="$4"

  echo ""
  echo "Creating/checking user: $NAME"

  curl -s \
    -X POST \
    "$BASE_URL/users/register" \
    -H "Content-Type: application/json" \
    -d "{
      \"name\": \"$NAME\",
      \"email\": \"$EMAIL\",
      \"phone\": \"$PHONE\",
      \"password\": \"$PASSWORD\"
    }" >/dev/null

  TOKEN=$(login_user \
    "$EMAIL" \
    "$PASSWORD")

  if [ -z "$TOKEN" ]; then
    echo "ERROR: Could not login $EMAIL"
    return 1
  fi

  USER_ID=$(get_user_id "$TOKEN")

  echo "$USER_ID"
}


# ============================================================
# FIND GROUP BY NAME
# ============================================================

find_group_id() {
  TOKEN="$1"
  GROUP_NAME="$2"

  curl -s \
    "$BASE_URL/chit-groups/" \
    -H "Authorization: Bearer $TOKEN" |
  python3 -c "
import json
import sys

target = '''$GROUP_NAME'''

try:
    groups = json.load(sys.stdin)

    for group in groups:
        if group.get('name') == target:
            print(
                group.get('chit_id')
                or group.get('id')
                or ''
            )
            break
except Exception:
    pass
"
}


# ============================================================
# CREATE GROUP IF NEEDED
# ============================================================

create_group() {
  TOKEN="$1"
  NAME="$2"
  CONTRIBUTION="$3"
  MEMBERS="$4"
  DURATION="$5"

  EXISTING_ID=$(find_group_id \
    "$TOKEN" \
    "$NAME")

  if [ -n "$EXISTING_ID" ]; then
    echo ""
    echo "$NAME already exists."
    echo "$EXISTING_ID"

    return
  fi

  TOTAL=$((CONTRIBUTION * MEMBERS))

  echo ""
  echo "Creating group: $NAME"

  RESPONSE=$(curl -s \
    -X POST \
    "$BASE_URL/chit-groups/" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
      \"name\": \"$NAME\",
      \"contribution_amount\": $CONTRIBUTION,
      \"total_amount\": $TOTAL,
      \"number_of_members\": $MEMBERS,
      \"duration\": $DURATION
    }")

  echo "$RESPONSE" |
    json_value "chit_id"
}


# ============================================================
# ADD MEMBER
# ============================================================

add_member() {
  TOKEN="$1"
  GROUP_ID="$2"
  USER_ID="$3"
  USER_NAME="$4"

  echo "Adding $USER_NAME to group $GROUP_ID"

  curl -s \
    -X POST \
    "$BASE_URL/chit-groups/$GROUP_ID/members" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
      \"user_id\": $USER_ID
    }" >/dev/null
}


# ============================================================
# FIND FIRST ROUND
# ============================================================

find_round_id() {
  TOKEN="$1"
  GROUP_ID="$2"

  curl -s \
    "$BASE_URL/chit-groups/$GROUP_ID/rounds" \
    -H "Authorization: Bearer $TOKEN" |
  python3 -c "
import json
import sys

try:
    rounds = json.load(sys.stdin)

    if isinstance(rounds, list) and rounds:
        round_data = rounds[0]

        print(
            round_data.get('round_id')
            or round_data.get('id')
            or ''
        )
except Exception:
    pass
"
}


# ============================================================
# CREATE ROUND IF NEEDED
# ============================================================

create_round() {
  TOKEN="$1"
  GROUP_ID="$2"
  DUE_DATE="$3"

  EXISTING_ROUND=$(find_round_id \
    "$TOKEN" \
    "$GROUP_ID")

  if [ -n "$EXISTING_ROUND" ]; then
    echo ""
    echo "Group $GROUP_ID already has a round."
    echo "$EXISTING_ROUND"

    return
  fi

  echo ""
  echo "Creating Round #1 for group $GROUP_ID"

  RESPONSE=$(curl -s \
    -X POST \
    "$BASE_URL/chit-groups/$GROUP_ID/rounds" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
      \"round_number\": 1,
      \"due_date\": \"$DUE_DATE\"
    }")

  echo "$RESPONSE" |
    json_value "round_id"
}


# ============================================================
# CHANGE ROUND STATE
# ============================================================

move_round_to_contribution_open() {
  TOKEN="$1"
  ROUND_ID="$2"

  echo ""
  echo "Moving Office Circle round to CONTRIBUTION_OPEN"

  RESPONSE=$(curl -s \
    -X PATCH \
    "$BASE_URL/chit-groups/rounds/$ROUND_ID/state" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
      "new_state": "CONTRIBUTION_OPEN"
    }')

  echo "$RESPONSE"
}


# ============================================================
# 1. LOGIN MAIN DEMO ACCOUNT
# ============================================================

echo "Logging in main ChitFlow account..."

MANAGER_TOKEN=$(login_user \
  "$MANAGER_EMAIL" \
  "$MANAGER_PASSWORD")


if [ -z "$MANAGER_TOKEN" ]; then

  echo ""
  echo "ERROR"
  echo "Could not login main account:"
  echo "$MANAGER_EMAIL"
  echo ""
  echo "Check that the backend is running and credentials are correct."
  exit 1

fi


echo "Main account authenticated."


# ============================================================
# 2. CREATE DEMO USERS
# ============================================================

echo ""
echo "============================================================"
echo " Creating demo users"
echo "============================================================"


ASHA_ID=$(create_demo_user \
  "Asha Nair" \
  "asha.chitflow@example.com" \
  "9000000001" \
  "demo12345" |
  tail -1)


RAHUL_ID=$(create_demo_user \
  "Rahul Kumar" \
  "rahul.chitflow@example.com" \
  "9000000002" \
  "demo12345" |
  tail -1)


MEERA_ID=$(create_demo_user \
  "Meera Shah" \
  "meera.chitflow@example.com" \
  "9000000003" \
  "demo12345" |
  tail -1)


KIRAN_ID=$(create_demo_user \
  "Kiran Das" \
  "kiran.chitflow@example.com" \
  "9000000004" \
  "demo12345" |
  tail -1)


NILA_ID=$(create_demo_user \
  "Nila Raj" \
  "nila.chitflow@example.com" \
  "9000000005" \
  "demo12345" |
  tail -1)


ARJUN_ID=$(create_demo_user \
  "Arjun Iyer" \
  "arjun.chitflow@example.com" \
  "9000000006" \
  "demo12345" |
  tail -1)


echo ""
echo "Created users:"
echo ""
echo "Asha Nair   -> $ASHA_ID"
echo "Rahul Kumar -> $RAHUL_ID"
echo "Meera Shah  -> $MEERA_ID"
echo "Kiran Das   -> $KIRAN_ID"
echo "Nila Raj    -> $NILA_ID"
echo "Arjun Iyer  -> $ARJUN_ID"


# ============================================================
# VALIDATE USER IDS
# ============================================================

for ID in \
  "$ASHA_ID" \
  "$RAHUL_ID" \
  "$MEERA_ID" \
  "$KIRAN_ID" \
  "$NILA_ID" \
  "$ARJUN_ID"
do

  if [ -z "$ID" ]; then

    echo ""
    echo "ERROR: At least one user ID could not be determined."
    echo "Stopping before creating memberships."
    exit 1

  fi

done


# ============================================================
# 3. CREATE OFFICE CIRCLE
# ============================================================

echo ""
echo "============================================================"
echo " Creating Office Circle"
echo "============================================================"


OFFICE_ID=$(create_group \
  "$MANAGER_TOKEN" \
  "Office Circle" \
  5000 \
  5 \
  5 |
  tail -1)


if [ -z "$OFFICE_ID" ]; then
  echo "ERROR: Office Circle could not be created."
  exit 1
fi


echo "Office Circle ID: $OFFICE_ID"


# ============================================================
# 4. OFFICE CIRCLE MEMBERS
# ============================================================

echo ""
echo "Adding Office Circle members..."


add_member \
  "$MANAGER_TOKEN" \
  "$OFFICE_ID" \
  "$ASHA_ID" \
  "Asha"


add_member \
  "$MANAGER_TOKEN" \
  "$OFFICE_ID" \
  "$RAHUL_ID" \
  "Rahul"


add_member \
  "$MANAGER_TOKEN" \
  "$OFFICE_ID" \
  "$MEERA_ID" \
  "Meera"


add_member \
  "$MANAGER_TOKEN" \
  "$OFFICE_ID" \
  "$KIRAN_ID" \
  "Kiran"


add_member \
  "$MANAGER_TOKEN" \
  "$OFFICE_ID" \
  "$NILA_ID" \
  "Nila"


# ============================================================
# 5. CREATE OFFICE ROUND
# ============================================================

OFFICE_ROUND_ID=$(create_round \
  "$MANAGER_TOKEN" \
  "$OFFICE_ID" \
  "2026-10-15T18:00:00" |
  tail -1)


echo ""
echo "Office Circle Round ID: $OFFICE_ROUND_ID"


if [ -n "$OFFICE_ROUND_ID" ]; then

  move_round_to_contribution_open \
    "$MANAGER_TOKEN" \
    "$OFFICE_ROUND_ID"

fi


# ============================================================
# 6. CREATE FRIENDS GROWTH
# ============================================================

echo ""
echo "============================================================"
echo " Creating Friends Growth"
echo "============================================================"


FRIENDS_ID=$(create_group \
  "$MANAGER_TOKEN" \
  "Friends Growth" \
  3000 \
  6 \
  6 |
  tail -1)


if [ -z "$FRIENDS_ID" ]; then
  echo "ERROR: Friends Growth could not be created."
  exit 1
fi


echo "Friends Growth ID: $FRIENDS_ID"


# ============================================================
# 7. FRIENDS GROWTH MEMBERS
# ============================================================

echo ""
echo "Adding Friends Growth members..."


add_member \
  "$MANAGER_TOKEN" \
  "$FRIENDS_ID" \
  "$ASHA_ID" \
  "Asha"


add_member \
  "$MANAGER_TOKEN" \
  "$FRIENDS_ID" \
  "$RAHUL_ID" \
  "Rahul"


add_member \
  "$MANAGER_TOKEN" \
  "$FRIENDS_ID" \
  "$MEERA_ID" \
  "Meera"


add_member \
  "$MANAGER_TOKEN" \
  "$FRIENDS_ID" \
  "$KIRAN_ID" \
  "Kiran"


add_member \
  "$MANAGER_TOKEN" \
  "$FRIENDS_ID" \
  "$NILA_ID" \
  "Nila"


add_member \
  "$MANAGER_TOKEN" \
  "$FRIENDS_ID" \
  "$ARJUN_ID" \
  "Arjun"


# ============================================================
# 8. CREATE FRIENDS ROUND
# ============================================================

FRIENDS_ROUND_ID=$(create_round \
  "$MANAGER_TOKEN" \
  "$FRIENDS_ID" \
  "2026-11-15T18:00:00" |
  tail -1)


echo ""
echo "Friends Growth Round ID: $FRIENDS_ROUND_ID"


# ============================================================
# COMPLETE
# ============================================================

echo ""
echo "============================================================"
echo " DEMO DATA READY"
echo "============================================================"
echo ""

echo "Groups:"
echo ""
echo "Family Savings"
echo "  Keep existing settled round"
echo ""

echo "Office Circle"
echo "  Contribution: ₹5,000"
echo "  Capacity: 5"
echo "  Pool: ₹25,000"
echo "  Round: CONTRIBUTION_OPEN"
echo ""

echo "Friends Growth"
echo "  Contribution: ₹3,000"
echo "  Capacity: 6"
echo "  Pool: ₹18,000"
echo "  Round: ROUND_CREATED"
echo ""

echo "Demo users:"
echo ""
echo "asha.chitflow@example.com  / demo12345"
echo "rahul.chitflow@example.com / demo12345"
echo "meera.chitflow@example.com / demo12345"
echo "kiran.chitflow@example.com / demo12345"
echo "nila.chitflow@example.com  / demo12345"
echo "arjun.chitflow@example.com / demo12345"

echo ""
echo "Refresh ChitFlow:"
echo "http://localhost:5173/dashboard"
echo ""
