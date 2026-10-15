# LeadFlow

A single-screen lead management tool: track leads, log every discussion, and set follow-up reminders.

**Stack:** FastAPI + SQLAlchemy + SQLite (backend) · React + Vite (frontend)

## Features

- Lead list with name, status badge, last discussion note and time since last discussion
- Today's follow-ups pinned at the top (overdue follow-ups are pinned too and highlighted in red)
- Filter by status (New / Contacted / Qualified / Proposal Sent / Won / Lost)
- Search leads by name
- Click a lead to open its timeline dialog:
  - Full discussion history, newest first
  - Add a note with an optional follow-up date & time (updates the list immediately)
  - Change the lead's status
- Add a new lead (name required; company and phone optional; status defaults to New)
- Seed script with 7 leads and their discussions
- Docker Compose setup

## Project structure

```
backend/
  main.py          API routes
  models.py        SQLAlchemy models (Lead, Discussion)
  schemas.py       Pydantic request/response schemas
  database.py      DB engine and session
  seed.py          Demo data
frontend/
  src/
    api.js         API client
    time.js        Date helpers (time ago, today, overdue)
    App.jsx        Page state: leads, filters, dialogs
    components/    Toolbar, LeadList, LeadRow, StatusBadge, Modal,
                   AddLeadDialog, LeadTimelineDialog, DiscussionForm
docker-compose.yml
```

## Running locally

Requirements: Python 3.11+, Node 18+.

### 1. Backend

```bash
cd backend
python -m venv venv
# Windows: venv\Scripts\activate   |   macOS/Linux: source venv/bin/activate
pip install -r requirements.txt
python seed.py                 # optional: reset the DB and load demo data
uvicorn main:app --reload --port 8000
```

API runs at http://localhost:8000 (interactive docs at http://localhost:8000/docs).

### 2. Frontend

```bash
cd frontend
cp .env.example .env           # points the app at http://localhost:8000
npm install
npm run dev
```

Open http://localhost:5173.

## Running with Docker

```bash
docker compose up --build
```

- Frontend: http://localhost:5173
- Backend: http://localhost:8000

Demo data is seeded the first time the container starts. Run `docker compose down -v` to wipe the data.

## Environment variables

| Variable       | Where    | Default                    | Description                                 |
| -------------- | -------- | -------------------------- | ------------------------------------------- |
| `DATABASE_URL` | backend  | `sqlite:///./leadflow.db`  | SQLAlchemy database URL                     |
| `CORS_ORIGINS` | backend  | `http://localhost:5173`    | Comma-separated origins allowed to call API |
| `VITE_API_URL` | frontend | `http://localhost:8000`    | Base URL of the backend                     |

See `backend/.env.example` and `frontend/.env.example`.

## API

| Method | Path                           | Description                                   | Success |
| ------ | ------------------------------ | --------------------------------------------- | ------- |
| GET    | `/leads?status=&q=`            | List leads (optional status filter and search)| 200     |
| POST   | `/leads`                       | Create a lead                                 | 201     |
| GET    | `/leads/{id}/discussions`      | Discussions for a lead, newest first          | 200     |
| POST   | `/leads/{id}/discussions`      | Add a discussion (+ optional `follow_up_at`)  | 201     |
| PATCH  | `/leads/{id}/status`           | Update a lead's status                        | 200     |
| GET    | `/health`                      | Health check                                  | 200     |

Errors: `404` for an unknown lead, `422` for invalid input (e.g. empty name or unknown status).

## Notes

- All times are stored in UTC and converted to the browser's local time for display.
- "Today's follow-ups" uses the browser's local date.
