from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field

class Participant(BaseModel):
    name: str
    email: Optional[str] = None
    avatar: Optional[str] = None

class TranscriptSegmentBase(BaseModel):
    start_time: float
    end_time: float
    speaker_name: str
    speaker_avatar: Optional[str] = None
    text: str

class TranscriptSegmentCreate(TranscriptSegmentBase):
    pass

class TranscriptSegmentResponse(TranscriptSegmentBase):
    id: str
    meeting_id: str

    class Config:
        from_attributes = True

class KeyTopic(BaseModel):
    timestamp: float
    topic: str
    description: str

class SummaryBase(BaseModel):
    overview: str
    shorthand_bullet_points: List[str] = []
    key_topics: List[KeyTopic] = []

class SummaryCreate(SummaryBase):
    pass

class SummaryResponse(SummaryBase):
    id: str
    meeting_id: str

    class Config:
        from_attributes = True

class ActionItemBase(BaseModel):
    text: str
    assignee_name: Optional[str] = None
    assignee_email: Optional[str] = None
    completed: bool = False
    due_date: Optional[datetime] = None

class ActionItemCreate(ActionItemBase):
    pass

class ActionItemUpdate(BaseModel):
    text: Optional[str] = None
    assignee_name: Optional[str] = None
    assignee_email: Optional[str] = None
    completed: Optional[bool] = None
    due_date: Optional[datetime] = None

class ActionItemResponse(ActionItemBase):
    id: str
    meeting_id: str
    created_at: datetime

    class Config:
        from_attributes = True

class TranscriptHighlightCreate(BaseModel):
    segment_id: str
    user_name: Optional[str] = "Default User"
    text: Optional[str] = None
    highlight_color: Optional[str] = "#FEF08A"

class TranscriptHighlightResponse(BaseModel):
    id: str
    meeting_id: str
    segment_id: str
    user_name: str
    text: Optional[str] = None
    highlight_color: str
    created_at: datetime

    class Config:
        from_attributes = True

class MeetingBase(BaseModel):
    title: str
    date: Optional[datetime] = None
    duration_seconds: int = 0
    audio_url: Optional[str] = None
    video_url: Optional[str] = None
    participants: List[Participant] = []

class MeetingCreate(MeetingBase):
    raw_transcript_text: Optional[str] = None

class MeetingUpdate(BaseModel):
    title: Optional[str] = None
    date: Optional[datetime] = None
    participants: Optional[List[Participant]] = None

class MeetingResponse(MeetingBase):
    id: str
    created_at: datetime
    updated_at: datetime
    segment_count: Optional[int] = 0
    action_item_count: Optional[int] = 0

    class Config:
        from_attributes = True

class MeetingDetailResponse(MeetingResponse):
    segments: List[TranscriptSegmentResponse] = []
    summary: Optional[SummaryResponse] = None
    action_items: List[ActionItemResponse] = []
    highlights: List[TranscriptHighlightResponse] = []

class AskAIRequest(BaseModel):
    question: str

class AskAIResponse(BaseModel):
    answer: str
    relevant_timestamps: List[float] = []
