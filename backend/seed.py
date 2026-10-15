"""
Reset the database and fill it with sample leads and discussions.

Run from the backend folder:  python seed.py
WARNING: this deletes all existing data.
"""
from datetime import datetime, timedelta, timezone

import models
from database import Base, SessionLocal, engine

IST = timezone(timedelta(hours=5, minutes=30))


def utc(dt: datetime) -> datetime:
    """Convert a timezone-aware time to UTC without a timezone label (how we store times)."""
    return dt.astimezone(timezone.utc).replace(tzinfo=None)


def ago(**kwargs) -> datetime:
    """A time in the past, e.g. ago(hours=5) or ago(days=3)."""
    return utc(datetime.now(timezone.utc) - timedelta(**kwargs))


def ist_day_at(hour: int, minute: int = 0, days_from_today: int = 0) -> datetime:
    """A clock time on a given day in India, e.g. today at 6 PM, or yesterday at 11 AM."""
    local = datetime.now(IST).replace(hour=hour, minute=minute, second=0, microsecond=0)
    return utc(local + timedelta(days=days_from_today))


SEED_LEADS = [
    {
        "name": "Rahul Sharma", "company": "Infosys", "phone": "9876543210",
        "status": "Contacted", "follow_up_at": ist_day_at(18),
        "created_at": ago(days=4),
        "notes": [
            ("Intro call. Interested in the premium advisory plan.", ago(days=3)),
            ("Sent the pricing deck over email.", ago(hours=5)),
        ],
    },
    {
        "name": "Karan Malhotra", "company": "Freshworks", "phone": "9811122233",
        "status": "Contacted", "follow_up_at": ist_day_at(10),
        "created_at": ago(days=2),
        "notes": [
            ("Spoke briefly, asked to call back this morning.", ago(days=1)),
        ],
    },
    {
        "name": "Arjun Kapoor", "company": "Zomato", "phone": "9900011122",
        "status": "Qualified", "follow_up_at": ist_day_at(11, days_from_today=-1),
        "created_at": ago(days=7),
        "notes": [
            ("Budget confirmed for this quarter.", ago(days=6)),
            ("Wants a demo with their finance head.", ago(days=2)),
        ],
    },
    {
        "name": "Sneha Iyer", "company": "Razorpay", "phone": "9822334455",
        "status": "Proposal Sent", "follow_up_at": ist_day_at(10, 30, days_from_today=1),
        "created_at": ago(days=11),
        "notes": [
            ("Discovery call. Needs reporting for 200+ clients.", ago(days=10)),
            ("Demo done. Very positive feedback.", ago(days=4)),
            ("Proposal sent. Decision expected this week.", ago(days=1)),
        ],
    },
    {
        "name": "Priya Mehta", "company": "TCS", "phone": None,
        "status": "New", "follow_up_at": None,
        "created_at": ago(hours=3),
        "notes": [
            ("Inbound enquiry from the website form.", ago(hours=2)),
        ],
    },
    {
        "name": "Vikram Singh", "company": "Paytm", "phone": "9876501234",
        "status": "Won", "follow_up_at": None,
        "created_at": ago(days=21),
        "notes": [
            ("Negotiated a 10% discount on the annual plan.", ago(days=20)),
            ("Contract signed.", ago(days=12)),
        ],
    },
    {
        "name": "Ananya Gupta", "company": "Swiggy", "phone": None,
        "status": "Lost", "follow_up_at": None,
        "created_at": ago(days=16),
        "notes": [
            ("Went with a competitor on price.", ago(days=15)),
        ],
    },
]


def seed() -> None:
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        for item in SEED_LEADS:
            lead = models.Lead(
                name=item["name"],
                company=item["company"],
                phone=item["phone"],
                status=item["status"],
                follow_up_at=item["follow_up_at"],
                created_at=item["created_at"],
            )
            for text, when in item["notes"]:
                lead.discussions.append(models.Discussion(note=text, created_at=when))
            db.add(lead)
        db.commit()
        print(f"Seeded {len(SEED_LEADS)} leads.")
    finally:
        db.close()


if __name__ == "__main__":
    seed()