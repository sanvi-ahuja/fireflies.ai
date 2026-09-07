from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, Form, status
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas
from app.services.parser import parse_transcript_content
from app.services.ai_engine import generate_ai_summary_and_tasks

router = APIRouter(prefix="/api/meetings", tags=["Transcripts"])

@router.get("/{meeting_id}/transcript", response_model=List[schemas.TranscriptSegmentResponse])
def get_transcript(
    meeting_id: str,
    q: Optional[str] = Query(None, description="In-transcript search filter"),
    db: Session = Depends(get_db)
):
    meeting = db.query(models.Meeting).filter(models.Meeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")

    query = db.query(models.TranscriptSegment).filter(models.TranscriptSegment.meeting_id == meeting_id)

    if q:
        query = query.filter(
            models.TranscriptSegment.text.ilike(f"%{q}%") |
            models.TranscriptSegment.speaker_name.ilike(f"%{q}%")
        )

    return query.order_by(models.TranscriptSegment.start_time.asc()).all()

@router.post("/{meeting_id}/transcript/upload", response_model=List[schemas.TranscriptSegmentResponse])
async def upload_transcript_file(
    meeting_id: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    meeting = db.query(models.Meeting).filter(models.Meeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")

    content_bytes = await file.read()
    content_str = content_bytes.decode("utf-8", errors="ignore")

    segments_data = parse_transcript_content(content_str, filename=file.filename or "")

    if not segments_data:
        raise HTTPException(status_code=400, detail="Could not parse valid transcript content from file.")

    # Remove old segments
    db.query(models.TranscriptSegment).filter(models.TranscriptSegment.meeting_id == meeting_id).delete()

    new_segments = []
    for seg in segments_data:
        obj = models.TranscriptSegment(
            meeting_id=meeting_id,
            start_time=seg["start_time"],
            end_time=seg["end_time"],
            speaker_name=seg["speaker_name"],
            text=seg["text"]
        )
        db.add(obj)
        new_segments.append(obj)

    # Update meeting duration from last segment
    meeting.duration_seconds = int(segments_data[-1]["end_time"])

    # Update participants list with unique speakers extracted from transcript
    unique_speakers = list({seg["speaker_name"] for seg in segments_data})
    existing_participants = meeting.participants or []
    existing_names = {p.get("name") for p in existing_participants}
    for speaker in unique_speakers:
        if speaker not in existing_names:
            existing_participants.append({"name": speaker, "email": ""})
    meeting.participants = existing_participants

    db.flush()  # flush new segments so AI engine can read them via meeting.segments

    # --- AI Processing: regenerate summary & action items from uploaded transcript ---

    # Remove old summary and action items so they are fully replaced
    db.query(models.Summary).filter(models.Summary.meeting_id == meeting_id).delete()
    db.query(models.ActionItem).filter(models.ActionItem.meeting_id == meeting_id).delete()

    # Generate AI summary and tasks from the newly parsed segments
    ai_result = generate_ai_summary_and_tasks(meeting.title, segments_data)

    # Save new summary
    new_summary = models.Summary(
        meeting_id=meeting_id,
        overview=ai_result["overview"],
        shorthand_bullet_points=ai_result["shorthand_bullet_points"],
        key_topics=ai_result["key_topics"]
    )
    db.add(new_summary)

    # Save new action items
    for item in ai_result["action_items"]:
        db.add(models.ActionItem(
            meeting_id=meeting_id,
            text=item["text"],
            assignee_name=item.get("assignee_name", ""),
            completed=item.get("completed", False)
        ))

    db.commit()
    for seg in new_segments:
        db.refresh(seg)
    return new_segments

@router.post("/{meeting_id}/highlights", response_model=schemas.TranscriptHighlightResponse, status_code=status.HTTP_201_CREATED)
def create_highlight(
    meeting_id: str,
    payload: schemas.TranscriptHighlightCreate,
    db: Session = Depends(get_db)
):
    segment = db.query(models.TranscriptSegment).filter(
        models.TranscriptSegment.id == payload.segment_id,
        models.TranscriptSegment.meeting_id == meeting_id
    ).first()
    if not segment:
        raise HTTPException(status_code=404, detail="Transcript segment not found for this meeting")

    highlight = models.TranscriptHighlight(
        meeting_id=meeting_id,
        segment_id=payload.segment_id,
        user_name=payload.user_name or "User",
        text=payload.text,
        highlight_color=payload.highlight_color or "#FEF08A"
    )
    db.add(highlight)
    db.commit()
    db.refresh(highlight)
    return highlight
