from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import desc, asc, or_

from app.database import get_db
from app import models, schemas
from app.services.parser import parse_transcript_content
from app.services.ai_engine import generate_ai_summary_and_tasks

router = APIRouter(prefix="/api/meetings", tags=["Meetings"])

@router.get("", response_model=List[schemas.MeetingResponse])
def list_meetings(
    q: Optional[str] = Query(None, description="Search term for title or participant"),
    participant: Optional[str] = Query(None, description="Filter by participant name"),
    order_by: str = Query("desc", description="Sort order: desc or asc"),
    db: Session = Depends(get_db)
):
    query = db.query(models.Meeting)

    if q:
        search_fmt = f"%{q}%"
        query = query.filter(
            or_(
                models.Meeting.title.ilike(search_fmt),
                models.Meeting.participants.cast(models.String).ilike(search_fmt)
            )
        )

    if participant:
        query = query.filter(models.Meeting.participants.cast(models.String).ilike(f"%{participant}%"))

    if order_by.lower() == "asc":
        query = query.order_by(asc(models.Meeting.date))
    else:
        query = query.order_by(desc(models.Meeting.date))

    meetings = query.all()

    # Annotate counts
    result = []
    for m in meetings:
        m_dict = schemas.MeetingResponse.from_orm(m)
        m_dict.segment_count = len(m.segments)
        m_dict.action_item_count = len(m.action_items)
        result.append(m_dict)

    return result

@router.post("", response_model=schemas.MeetingDetailResponse, status_code=status.HTTP_201_CREATED)
def create_meeting(
    payload: schemas.MeetingCreate,
    db: Session = Depends(get_db)
):
    participants_data = [p.dict() for p in payload.participants] if payload.participants else []

    db_meeting = models.Meeting(
        title=payload.title,
        date=payload.date or datetime.utcnow(),
        duration_seconds=payload.duration_seconds,
        audio_url=payload.audio_url,
        video_url=payload.video_url,
        participants=participants_data
    )
    db.add(db_meeting)
    db.flush() # Populate generated ID

    parsed_segments = []
    if payload.raw_transcript_text:
        parsed_segments = parse_transcript_content(payload.raw_transcript_text)

    segment_objects = []
    for seg in parsed_segments:
        seg_obj = models.TranscriptSegment(
            meeting_id=db_meeting.id,
            start_time=seg["start_time"],
            end_time=seg["end_time"],
            speaker_name=seg["speaker_name"],
            text=seg["text"]
        )
        db.add(seg_obj)
        segment_objects.append(seg)

    if segment_objects:
        max_duration = int(segment_objects[-1]["end_time"])
        db_meeting.duration_seconds = max(db_meeting.duration_seconds, max_duration)

    # Generate AI summary and initial action items
    ai_data = generate_ai_summary_and_tasks(db_meeting.title, segment_objects)

    db_summary = models.Summary(
        meeting_id=db_meeting.id,
        overview=ai_data["overview"],
        shorthand_bullet_points=ai_data["shorthand_bullet_points"],
        key_topics=ai_data["key_topics"]
    )
    db.add(db_summary)

    for item in ai_data["action_items"]:
        db_action = models.ActionItem(
            meeting_id=db_meeting.id,
            text=item["text"],
            assignee_name=item.get("assignee_name"),
            completed=item.get("completed", False)
        )
        db.add(db_action)

    db.commit()
    db.refresh(db_meeting)
    return db_meeting

@router.get("/{meeting_id}", response_model=schemas.MeetingDetailResponse)
def get_meeting(meeting_id: str, db: Session = Depends(get_db)):
    meeting = db.query(models.Meeting).filter(models.Meeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    
    m_dict = schemas.MeetingDetailResponse.from_orm(meeting)
    m_dict.segment_count = len(meeting.segments)
    m_dict.action_item_count = len(meeting.action_items)
    return m_dict

@router.patch("/{meeting_id}", response_model=schemas.MeetingResponse)
def update_meeting(
    meeting_id: str,
    payload: schemas.MeetingUpdate,
    db: Session = Depends(get_db)
):
    meeting = db.query(models.Meeting).filter(models.Meeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")

    if payload.title is not None:
        meeting.title = payload.title
    if payload.date is not None:
        meeting.date = payload.date
    if payload.participants is not None:
        meeting.participants = [p.dict() for p in payload.participants]

    meeting.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(meeting)

    m_dict = schemas.MeetingResponse.from_orm(meeting)
    m_dict.segment_count = len(meeting.segments)
    m_dict.action_item_count = len(meeting.action_items)
    return m_dict

@router.delete("/{meeting_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_meeting(meeting_id: str, db: Session = Depends(get_db)):
    meeting = db.query(models.Meeting).filter(models.Meeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")

    db.delete(meeting)
    db.commit()
    return None
