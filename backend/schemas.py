from datetime import datetime, timezone
from typing import Literal, Optional

from pydantic import BaseModel, ConfigDict, Field, field_serializer

Status = Literal["New", "Contacted", "Qualified", "Proposal Sent", "Won", "Lost"]


def as_utc(value: Optional[datetime]) -> Optional[datetime]:
    """Times are stored in UTC without a timezone. Mark them as UTC when sending them out."""
    if value is not None and value.tzinfo is None:
        return value.replace(tzinfo=timezone.utc)
    return value


# ---------- Incoming data (what the frontend sends) ----------

class LeadCreate(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    name: str = Field(min_length=1, max_length=100)
    company: Optional[str] = Field(default=None, max_length=100)
    phone: Optional[str] = Field(default=None, max_length=20)
    status: Status = "New"


class LeadStatusUpdate(BaseModel):
    status: Status


class DiscussionCreate(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    note: str = Field(min_length=1)
    follow_up_at: Optional[datetime] = None


# ---------- Outgoing data (what the API sends back) ----------

class DiscussionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    lead_id: int
    note: str
    created_at: datetime

    @field_serializer("created_at")
    def _utc(self, value):
        return as_utc(value)


class LeadOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    company: Optional[str]
    phone: Optional[str]
    status: Status
    follow_up_at: Optional[datetime]
    created_at: datetime
    last_note: Optional[str] = None
    last_discussion_at: Optional[datetime] = None

    @field_serializer("follow_up_at", "created_at", "last_discussion_at")
    def _utc(self, value):
        return as_utc(value)