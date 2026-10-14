import os
from datetime import timezone
from typing import Optional

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session, selectinload

import models
import schemas
from database import Base, engine, get_db

Base.metadata.create_all(bind=engine)

app = FastAPI(title="LeadFlow API")

# Allow the React app (running on a different port) to call this API
origins = os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------- Helpers ----------

def get_lead_or_404(lead_id: int, db: Session) -> models.Lead:
    lead = db.get(models.Lead, lead_id)
    if lead is None:
        raise HTTPException(status_code=404, detail="Lead not found")
    return lead


def to_lead_out(lead: models.Lead) -> schemas.LeadOut:
    out = schemas.LeadOut.model_validate(lead)
    if lead.discussions:
        latest = max(lead.discussions, key=lambda d: (d.created_at, d.id))
        out.last_note = latest.note
        out.last_discussion_at = latest.created_at
    return out


def to_utc_naive(dt):
    """Convert any incoming time to UTC and drop the timezone label before saving."""
    if dt is not None and dt.tzinfo is not None:
        dt = dt.astimezone(timezone.utc).replace(tzinfo=None)
    return dt


# ---------- Endpoints ----------

@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/leads", response_model=list[schemas.LeadOut])
def list_leads(
    status: Optional[schemas.Status] = None,
    q: Optional[str] = None,
    db: Session = Depends(get_db),
):
    query = db.query(models.Lead).options(selectinload(models.Lead.discussions))
    if status:
        query = query.filter(models.Lead.status == status)
    if q:
        query = query.filter(models.Lead.name.ilike(f"%{q.strip()}%"))
    leads = query.order_by(models.Lead.created_at.desc()).all()
    return [to_lead_out(lead) for lead in leads]


@app.post("/leads", response_model=schemas.LeadOut, status_code=201)
def create_lead(data: schemas.LeadCreate, db: Session = Depends(get_db)):
    lead = models.Lead(**data.model_dump())
    db.add(lead)
    db.commit()
    db.refresh(lead)
    return to_lead_out(lead)


@app.get("/leads/{lead_id}/discussions", response_model=list[schemas.DiscussionOut])
def list_discussions(lead_id: int, db: Session = Depends(get_db)):
    get_lead_or_404(lead_id, db)
    return (
        db.query(models.Discussion)
        .filter(models.Discussion.lead_id == lead_id)
        .order_by(models.Discussion.created_at.desc(), models.Discussion.id.desc())
        .all()
    )


@app.post(
    "/leads/{lead_id}/discussions",
    response_model=schemas.DiscussionOut,
    status_code=201,
)
def add_discussion(
    lead_id: int, data: schemas.DiscussionCreate, db: Session = Depends(get_db)
):
    lead = get_lead_or_404(lead_id, db)
    discussion = models.Discussion(lead_id=lead.id, note=data.note)
    db.add(discussion)
    if data.follow_up_at is not None:
        lead.follow_up_at = to_utc_naive(data.follow_up_at)
    db.commit()
    db.refresh(discussion)
    return discussion

@app.patch(
    "/Leads/{lead_id}/status", 
    response_model=schemas.LeadOut, 
    status_code=200  )
def update_status(lead_id: int, data: schemas.LeadStatusUpdate, db: Session = Depends(get_db)):
    lead = get_lead_or_404(lead_id, db)
    lead.status = data.status
    db.commit()
    db.refresh(lead)
    return to_lead_out(lead)