import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, Text, JSON, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class Meeting(Base):
    __tablename__ = "meetings"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    title = Column(String(500), nullable=False, index=True)
    date = Column(DateTime, nullable=False, default=datetime.utcnow, index=True)
    duration_seconds = Column(Integer, default=0)
    audio_url = Column(Text, nullable=True)
    video_url = Column(Text, nullable=True)
    participants = Column(JSON, default=list) # List of dicts: [{"name": "", "email": "", "avatar": ""}]
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    segments = relationship("TranscriptSegment", back_populates="meeting", cascade="all, delete-orphan", order_by="TranscriptSegment.start_time")
    summary = relationship("Summary", back_populates="meeting", uselist=False, cascade="all, delete-orphan")
    action_items = relationship("ActionItem", back_populates="meeting", cascade="all, delete-orphan")
    highlights = relationship("TranscriptHighlight", back_populates="meeting", cascade="all, delete-orphan")

class TranscriptSegment(Base):
    __tablename__ = "transcript_segments"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    meeting_id = Column(String(36), ForeignKey("meetings.id", ondelete="CASCADE"), nullable=False, index=True)
    start_time = Column(Float, nullable=False)
    end_time = Column(Float, nullable=False)
    speaker_name = Column(String(255), nullable=False)
    speaker_avatar = Column(Text, nullable=True)
    text = Column(Text, nullable=False)

    meeting = relationship("Meeting", back_populates="segments")
    highlights = relationship("TranscriptHighlight", back_populates="segment", cascade="all, delete-orphan")

class Summary(Base):
    __tablename__ = "summaries"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    meeting_id = Column(String(36), ForeignKey("meetings.id", ondelete="CASCADE"), unique=True, nullable=False)
    overview = Column(Text, nullable=False)
    shorthand_bullet_points = Column(JSON, default=list) # ["point 1", "point 2"]
    key_topics = Column(JSON, default=list) # [{"timestamp": 12.5, "topic": "Architecture", "description": "..."}]

    meeting = relationship("Meeting", back_populates="summary")

class ActionItem(Base):
    __tablename__ = "action_items"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    meeting_id = Column(String(36), ForeignKey("meetings.id", ondelete="CASCADE"), nullable=False, index=True)
    text = Column(Text, nullable=False)
    assignee_name = Column(String(255), nullable=True)
    assignee_email = Column(String(255), nullable=True)
    completed = Column(Boolean, default=False)
    due_date = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    meeting = relationship("Meeting", back_populates="action_items")

class TranscriptHighlight(Base):
    __tablename__ = "transcript_highlights"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    meeting_id = Column(String(36), ForeignKey("meetings.id", ondelete="CASCADE"), nullable=False)
    segment_id = Column(String(36), ForeignKey("transcript_segments.id", ondelete="CASCADE"), nullable=False)
    user_name = Column(String(255), nullable=False, default="Default User")
    text = Column(Text, nullable=True)
    highlight_color = Column(String(50), default="#FEF08A") # Yellow highlight
    created_at = Column(DateTime, default=datetime.utcnow)

    meeting = relationship("Meeting", back_populates="highlights")
    segment = relationship("TranscriptSegment", back_populates="highlights")
