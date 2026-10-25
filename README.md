# ChitFlow

React/Vite frontend and FastAPI/PostgreSQL backend for coordinating chit groups,
contributions, bids, disputes, payout records and a hash-linked round audit history.
The application records payments; it does not execute bank transfers.

## Local setup (macOS or Linux)

Use Python 3.12+ and Node 24. These commands run from the existing repository;
keep your current checkout and existing `.env` files.

```sh
python3 -m venv .venv
.venv/bin/python -m pip install -r backend/requirements-dev.txt
cd frontend
npm ci
cd ..
```

Create a PostgreSQL role/database using your normal PostgreSQL administration tools.
Copy `backend/.env.example` to `backend/.env` only if you do not already have one.
Set `DATABASE_URL` to your actual database and generate `SECRET_KEY` locally with
`.venv/bin/python -c 'import secrets; print(secrets.token_urlsafe(48))'`.
Do not commit credentials or use the example placeholder as a real signing key.
The original repository tracked `backend/.env`; this branch removes it from
tracking while preserving the local file. Earlier commits still contain it.
Rotate any real database password and signing secret that were stored there.
This change does not rewrite Git history.
Plain `postgresql://` URLs are normalized to the installed psycopg2 driver.

Start the backend in one terminal:

```sh
cd backend
../.venv/bin/python -m uvicorn app.main:app --reload
```

Start the frontend in another:

```sh
cd frontend
npm run dev
```

The default UI origins allowed by the API are `http://localhost:5173` and
`http://127.0.0.1:5173`. If Vite chooses a different port, use port 5173 with
`npm run dev -- --port 5173 --strictPort`, or explicitly configure `CORS_ORIGINS`
as a JSON list of your allowed UI origins. `frontend/.env.example` documents
`VITE_API_BASE_URL`; restart Vite after changing it. Never put a secret in a
`VITE_` variable because those values are included in browser code.

`GET /health` actually queries the database. API documentation is at `/docs`.
Tables are created on startup for a fresh database; `create_all` is not a migration
system and does not repair historical data or change existing table definitions.
Back up an existing PostgreSQL database before upgrades. This update does not
reset tables, seed demo accounts, or modify historical round states.

## Accounts and permissions

Register your own accounts. There is no guaranteed seeded username/password.
Every new user has the MEMBER role; creating a group grants creator permissions
for that group through `created_by`. Use a separate browser/private window to test
a member account. The member's actual numeric ID is visible in Profile.

Only the group creator may add members, create/advance rounds, verify payments,
propose results, or create/verify payouts. Members see only groups/rounds they can
access. A 401 clears an expired session and returns to login; a 403 does not sign
out a valid account.

## Round workflow

1. Create a group, add registered members, and create a round.
2. Open contributions; each member records their own payment once.
3. Enter contribution verification; the creator verifies submitted payments.
4. Open bidding; bidders need a verified contribution. Record at least one bid.
5. Close bidding and propose the result. The dedicated result action selects the
   lowest active bid, with timestamp/ID ordering for deterministic equal amounts.
6. Open the challenge period. If disputed, the creator reviews and resolves the
   dispute before confirming the result.
7. Confirm the result and record the winner payout using the payout form.
8. Verify the payout with its dedicated action, then settle the round.

Result, dispute, and payout actions must use their dedicated endpoints; a generic
state PATCH cannot skip the record-producing operations. A settled round has no
next transition. `GET /rounds/{round_id}/payout` restores payout information for
authorized users after browser storage is cleared or a different browser is used.
Payout amount is explicitly entered, not calculated from an assumed discount rule.

Guided Help observes successful API responses, explains unavailable actions from
actual round data, and supports replay, Back, Skip, Escape, and Minimize/Resume.
Use Minimize if a tip covers a control. Failed actions remain on their guide step.

## Verification

From the repository root:

```sh
.venv/bin/python -m pytest -q
cd frontend
npm run lint
npm run build
```

The default backend suite uses an isolated in-memory SQLite database, with foreign
keys enabled. To test PostgreSQL, set `TEST_DATABASE_URL` locally to a PostgreSQL
connection for a test server and run pytest again. The suite creates and deletes
only its own randomly named schemas. The test role needs CREATE SCHEMA permission;
never point this at a production server. PostgreSQL enables the concurrent duplicate
round creation test; it is explicitly skipped on SQLite.

Browser tests start separate services on ports 8001 and 5174 with a temporary
SQLite database and a random test signing key. They do not use your running app or
its configured database. Install Chromium once:

```sh
cd frontend
npx playwright install chromium
CHITFLOW_TEST_PYTHON=../.venv/bin/python npm run test:e2e
```

The default test Python is `backend/.venv/bin/python` if you use that layout instead.
On a Linux machine with an existing Chromium binary, optionally set
`PLAYWRIGHT_CHROMIUM_EXECUTABLE` to its absolute path. Do not disable checks to make
a failing suite pass. Failed browser traces are written to `frontend/test-results`.
GitHub Actions runs backend tests with PostgreSQL plus frontend lint/build and
isolated browser tests; adding the workflow does not itself mean it has run remotely.

The generated UI uses a local MIT-licensed copy of the shadcn 4.21.0 Tailwind
utilities under `frontend/src/styles/`; the scaffolding CLI is not a runtime
dependency. JWTs use PyJWT with HS256 and a required expiry claim.

## Release boundaries

This update prepares the development/demo workflow; it does not deploy a service.
Before external deployment, arrange HTTPS, host-specific API/UI URLs and CORS,
managed secrets, database backups and schema migrations, login throttling, monitoring,
and a deployment-specific security review. These require the chosen hosting setup.
The current JWT session uses browser localStorage and expires after one hour;
there is no refresh-token/password-reset/email-verification flow. Do not describe
those unimplemented features as available. Audit hashes detect changes; they are
not an independently trusted external ledger or a substitute for database security.
