# Fireflies.ai Clone - Meeting Intelligence & Transcription Platform

A full-stack clone of **Fireflies.ai** built for meeting transcription, interactive audio-synced transcripts, AI meeting summaries, action items tracking, and RAG-powered meeting search.

---

## Technical Stack

- **Frontend**: Next.js 14+ (App Router, TypeScript, Tailwind CSS, Lucide Icons)
- **Backend**: Python with FastAPI, SQLAlchemy, Pydantic v2
- **Database**: SQLite (`fireflies.db`) with relational database schema design
- **Testing**: Pytest for backend API test suites

---

## Core Features Implemented

1. **Meetings Library / Dashboard**:
   - Paginated meeting list displaying title, date, duration, participant avatars, and task counters.
   - Search across meeting title, date, and participants.
   - Recency sorting (Newest / Oldest first) and participant filters.

2. **Interactive Meeting & Transcript Detail View**:
   - Bi-directionally synchronized HTML5 audio player (clicking a transcript segment jumps audio timestamp; audio playback highlights active transcript lines).
   - In-transcript search with keyword match highlighting.
   - Speed controls (1x, 1.25x, 1.5x, 2x) and audio scrubbing slider.

3. **AI Summaries & Notes**:
   - Executive Overview & key shorthand takeaways.
   - Chapter & topic breakdown with clickable timestamp jumps.
   - Interactive Action Items checklist (add/edit/complete/delete tasks with assignee badges).

4. **Meeting Management (CRUD & File Uploads)**:
   - Create new meeting via uploaded files (`.vtt`, `.json`, `.txt`) or pasting raw timestamped transcripts.
   - Edit meeting metadata.
   - Delete meetings with cascading cleanup.

5. **Fireflies Experience & Bonus Features**:
   - Signature Fireflies dark aesthetic system (`#090C10` background with `#6E56CF` violet accents).
   - **RAG Ask AI Chat Drawer**: Ask questions about any meeting with automatic timestamp citations.
   - **Export Notes**: Export meeting summaries, action items, and transcripts as clean Markdown (`.md`) files.

---

## Database Schema Design

- **`meetings`**: `id`, `title`, `date`, `duration_seconds`, `audio_url`, `video_url`, `participants` (JSON)
- **`transcript_segments`**: `id`, `meeting_id` (FK), `start_time`, `end_time`, `speaker_name`, `text`
- **`summaries`**: `id`, `meeting_id` (FK UNIQUE), `overview`, `shorthand_bullet_points` (JSON), `key_topics` (JSON)
- **`action_items`**: `id`, `meeting_id` (FK), `text`, `assignee_name`, `completed`, `due_date`
- **`transcript_highlights`**: `id`, `meeting_id` (FK), `segment_id` (FK), `user_name`, `text`, `highlight_color`

---

## Quick Start & Setup Instructions

### Prerequisites
- Node.js (v18+)
- Python (3.10+)

### 1. Backend Setup (FastAPI)

```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Seed sample database
python -m app.seed

# Run backend test suite
python -m pytest

# Start FastAPI server
python run.py
```
The FastAPI backend server will run on `http://127.0.0.1:8000`. API Swagger documentation will be available at `http://127.0.0.1:8000/docs`.

### 2. Frontend Setup (Next.js)

```bash
cd frontend

# Install dependencies
npm install

# Start Next.js development server
npm run dev
```
The frontend web application will run on `http://localhost:3000`.
