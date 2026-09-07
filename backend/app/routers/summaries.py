from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas
from app.services.ai_engine import generate_ai_summary_and_tasks, answer_meeting_question

router = APIRouter(prefix="/api/meetings", tags=["AI Summaries & Chat"])

@router.get("/{meeting_id}/summary", response_model=schemas.SummaryResponse)
def get_summary(meeting_id: str, db: Session = Depends(get_db)):
    summary = db.query(models.Summary).filter(models.Summary.meeting_id == meeting_id).first()
    if not summary:
        raise HTTPException(status_code=404, detail="Summary not found for this meeting")
    return summary

@router.post("/{meeting_id}/summary/regenerate", response_model=schemas.SummaryResponse)
def regenerate_summary(meeting_id: str, db: Session = Depends(get_db)):
    meeting = db.query(models.Meeting).filter(models.Meeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")

    segments_data = [
        {
            "start_time": s.start_time,
            "end_time": s.end_time,
            "speaker_name": s.speaker_name,
            "text": s.text
        }
        for s in meeting.segments
    ]

    ai_result = generate_ai_summary_and_tasks(meeting.title, segments_data)

    summary = db.query(models.Summary).filter(models.Summary.meeting_id == meeting_id).first()
    if not summary:
        summary = models.Summary(meeting_id=meeting_id)
        db.add(summary)

    summary.overview = ai_result["overview"]
    summary.shorthand_bullet_points = ai_result["shorthand_bullet_points"]
    summary.key_topics = ai_result["key_topics"]

    db.commit()
    db.refresh(summary)
    return summary

@router.post("/{meeting_id}/chat", response_model=schemas.AskAIResponse)
def chat_with_meeting_ai(
    meeting_id: str,
    payload: schemas.AskAIRequest,
    db: Session = Depends(get_db)
):
    meeting = db.query(models.Meeting).filter(models.Meeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")

    segments_data = [
        {
            "start_time": s.start_time,
            "end_time": s.end_time,
            "speaker_name": s.speaker_name,
            "text": s.text
        }
        for s in meeting.segments
    ]

    summary_text = meeting.summary.overview if meeting.summary else ""
    result = answer_meeting_question(payload.question, meeting.title, segments_data, summary_text)

    return result
