from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from database import Base


class Lead(Base):
    __tablename__ = "leads"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    company = Column(String(100), nullable=True)
    phone = Column(String(20), nullable=True)
    status = Column(String(20), nullable=False, default="New")
    follow_up_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, server_default=func.now())

    discussions = relationship(
        "Discussion", back_populates="lead", cascade="all, delete-orphan"
    )
class Discussion(Base):
    __tablename__ = "discussions"

    id = Column(Integer, primary_key=True, index=True)
    lead_id = Column(Integer, ForeignKey("leads.id"), nullable=False,index=True)
    note= Column(Text, nullable=False)
    created_at = Column(DateTime, server_default=func.now())

    lead = relationship("Lead", back_populates="discussions")