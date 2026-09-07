import sys
import os
from datetime import datetime, timedelta
from app.database import engine, Base, SessionLocal
from app import models

def seed_database():
    print("Initializing Database schema...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        print("Seeding initial meeting data...")

        # ----------------------------------------------------
        # Meeting 1: Product Design & Roadmap Sync
        # ----------------------------------------------------
        m1 = models.Meeting(
            id="m1-product-roadmap",
            title="Q4 Product Roadmap & Fireflies UX Revamp",
            date=datetime.utcnow() - timedelta(hours=3),
            duration_seconds=145,
            audio_url="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
            participants=[
                {"name": "Sarah Chen", "email": "sarah.chen@fireflies.ai", "avatar": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150"},
                {"name": "Alex Rivera", "email": "alex.r@fireflies.ai", "avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"},
                {"name": "Elena Rostova", "email": "elena.r@fireflies.ai", "avatar": "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150"},
                {"name": "David Kim", "email": "david.k@fireflies.ai", "avatar": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150"}
            ]
        )
        db.add(m1)

        segments_m1 = [
            models.TranscriptSegment(meeting_id="m1-product-roadmap", start_time=0.0, end_time=12.5, speaker_name="Sarah Chen", text="Welcome everyone to our Q4 product sync! Today we're reviewing the UX redesign for our meeting intelligence workspace."),
            models.TranscriptSegment(meeting_id="m1-product-roadmap", start_time=13.0, end_time=25.8, speaker_name="Alex Rivera", text="Thanks Sarah. From the engineering side, we've optimized the waveform audio player and bi-directional transcript scrubbing speed by 40%."),
            models.TranscriptSegment(meeting_id="m1-product-roadmap", start_time=26.2, end_time=42.0, speaker_name="Elena Rostova", text="That's awesome Alex. On the design end, we've updated the dark theme contrast tokens. The purple glow accent (#6E56CF) now highlights key action items automatically."),
            models.TranscriptSegment(meeting_id="m1-product-roadmap", start_time=42.5, end_time=58.4, speaker_name="David Kim", text="What about the Ask AI side panel? Users want to ask questions about action items directly inside the meeting view."),
            models.TranscriptSegment(meeting_id="m1-product-roadmap", start_time=59.0, end_time=75.1, speaker_name="Sarah Chen", text="Good point David. Let's make sure the RAG pipeline indexes speaker timestamps so citations link directly to the transcript line."),
            models.TranscriptSegment(meeting_id="m1-product-roadmap", start_time=75.5, end_time=92.0, speaker_name="Alex Rivera", text="I'll take care of updating the API endpoints to support transcript file uploads in VTT, JSON, and raw TXT format."),
            models.TranscriptSegment(meeting_id="m1-product-roadmap", start_time=92.5, end_time=110.2, speaker_name="Elena Rostova", text="I will finalize the component Figma tokens and publish the updated button variants by Thursday afternoon."),
            models.TranscriptSegment(meeting_id="m1-product-roadmap", start_time=110.8, end_time=128.0, speaker_name="Sarah Chen", text="Perfect. Let's wrap up by scheduling a QA review for Friday morning before deployment.")
        ]
        db.add_all(segments_m1)

        summary_m1 = models.Summary(
            meeting_id="m1-product-roadmap",
            overview="The team met to finalize the Q4 Fireflies UX revamp, focusing on performance optimizations, dark theme aesthetic refinements, interactive audio scrubbing, and RAG-powered Ask AI meeting chat.",
            shorthand_bullet_points=[
                "Engineering improved audio player scrubbing performance and transcript sync speed by 40%.",
                "UI design finalized purple accent design tokens (#6E56CF) and dark mode contrast.",
                "RAG AI pipeline now links answers directly to interactive transcript timestamps."
            ],
            key_topics=[
                {"timestamp": 0.0, "topic": "Kickoff & UX Vision", "description": "Reviewing workspace design goals and user feedback."},
                {"timestamp": 26.2, "topic": "Waveform & Design System", "description": "Color tokens, typography, and dark theme consistency."},
                {"timestamp": 59.0, "topic": "Ask AI RAG Integration", "description": "Semantic search citations linked to transcript timestamps."}
            ]
        )
        db.add(summary_m1)

        actions_m1 = [
            models.ActionItem(meeting_id="m1-product-roadmap", text="Update API endpoints to support VTT and JSON transcript file uploads", assignee_name="Alex Rivera", completed=False),
            models.ActionItem(meeting_id="m1-product-roadmap", text="Finalize Figma component tokens and design guidelines by Thursday", assignee_name="Elena Rostova", completed=True),
            models.ActionItem(meeting_id="m1-product-roadmap", text="Schedule QA review sprint for Friday morning prior to staging deploy", assignee_name="Sarah Chen", completed=False)
        ]
        db.add_all(actions_m1)

        # ----------------------------------------------------
        # Meeting 2: Engineering Architecture & Cloud Migration
        # ----------------------------------------------------
        m2 = models.Meeting(
            id="m2-cloud-architecture",
            title="Cloud Infrastructure & Kafka Event Pipeline Review",
            date=datetime.utcnow() - timedelta(days=1),
            duration_seconds=180,
            audio_url="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
            participants=[
                {"name": "Marcus Vance", "email": "marcus.v@fireflies.ai", "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"},
                {"name": "Alex Rivera", "email": "alex.r@fireflies.ai", "avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"},
                {"name": "Priya Sharma", "email": "priya.s@fireflies.ai", "avatar": "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150"}
            ]
        )
        db.add(m2)

        segments_m2 = [
            models.TranscriptSegment(meeting_id="m2-cloud-architecture", start_time=0.0, end_time=15.0, speaker_name="Marcus Vance", text="Let's dive into our infrastructure scaling plan. We're moving live meeting bot ingestion to a Kafka event pipeline."),
            models.TranscriptSegment(meeting_id="m2-cloud-architecture", start_time=15.5, end_time=32.0, speaker_name="Priya Sharma", text="Kafka will handle the incoming WebRTC audio streams reliably. Redis PubSub will broadcast instant transcript lines to WebSockets."),
            models.TranscriptSegment(meeting_id="m2-cloud-architecture", start_time=32.5, end_time=48.0, speaker_name="Alex Rivera", text="And for database queries, we've set up SQLite for local development and PostgreSQL composite indexing for enterprise scale."),
            models.TranscriptSegment(meeting_id="m2-cloud-architecture", start_time=48.5, end_time=65.0, speaker_name="Marcus Vance", text="Priya, can you benchmark the vector database lookup latency for 100,000 meeting transcripts?"),
            models.TranscriptSegment(meeting_id="m2-cloud-architecture", start_time=65.5, end_time=80.0, speaker_name="Priya Sharma", text="Sure Marcus. I will run a load test on Qdrant and post results in Slack tomorrow morning.")
        ]
        db.add_all(segments_m2)

        summary_m2 = models.Summary(
            meeting_id="m2-cloud-architecture",
            overview="Technical architecture review focused on streaming audio ingestion with Kafka, low-latency WebSocket broadcasting via Redis, and vector DB benchmarking.",
            shorthand_bullet_points=[
                "Configured Kafka cluster to handle concurrent WebRTC audio bot streams.",
                "Integrated Redis PubSub for real-time WebSocket transcript delivery.",
                "Initiated vector database load testing for large-scale enterprise search."
            ],
            key_topics=[
                {"timestamp": 0.0, "topic": "Kafka Streaming Pipeline", "description": "Decoupling meeting bots from audio processing workers."},
                {"timestamp": 32.5, "topic": "Database & Redis Caching", "description": "Postgres indexing and cache-aside patterns."}
            ]
        )
        db.add(summary_m2)

        actions_m2 = [
            models.ActionItem(meeting_id="m2-cloud-architecture", text="Run load testing benchmark on vector search latency and report findings", assignee_name="Priya Sharma", completed=False),
            models.ActionItem(meeting_id="m2-cloud-architecture", text="Provision staging Kafka cluster and configure producer retry policies", assignee_name="Marcus Vance", completed=True)
        ]
        db.add_all(actions_m2)

        # ----------------------------------------------------
        # Meeting 3: Customer Success & QBR
        # ----------------------------------------------------
        m3 = models.Meeting(
            id="m3-customer-qbr",
            title="Acme Corp Quarterly Business Review & Feedback",
            date=datetime.utcnow() - timedelta(days=3),
            duration_seconds=120,
            audio_url="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
            participants=[
                {"name": "Sarah Chen", "email": "sarah.chen@fireflies.ai", "avatar": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150"},
                {"name": "Tom Holland", "email": "tom@acme.com", "avatar": "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150"}
            ]
        )
        db.add(m3)

        segments_m3 = [
            models.TranscriptSegment(meeting_id="m3-customer-qbr", start_time=0.0, end_time=18.0, speaker_name="Sarah Chen", text="Hi Tom, glad to have you on our QBR call. How has Fireflies been performing across your enterprise sales team?"),
            models.TranscriptSegment(meeting_id="m3-customer-qbr", start_time=18.5, end_time=38.0, speaker_name="Tom Holland", text="Sarah, it's saved us over 15 hours per rep every week! The automated CRM action item sync is our favorite feature."),
            models.TranscriptSegment(meeting_id="m3-customer-qbr", start_time=38.5, end_time=58.0, speaker_name="Sarah Chen", text="That's wonderful to hear. We're also rolling out soundbite exports so sales reps can clip 10-second highlights directly to prospects.")
        ]
        db.add_all(segments_m3)

        summary_m3 = models.Summary(
            meeting_id="m3-customer-qbr",
            overview="Quarterly Business Review with Acme Corp highlighting 15+ hours/rep weekly time savings and positive feedback on CRM action item automation.",
            shorthand_bullet_points=[
                "Acme Corp reported 15 hours saved per sales rep per week.",
                "Customer requested soundbite export feature for prospect follow-ups."
            ],
            key_topics=[
                {"timestamp": 0.0, "topic": "QBR Opening & ROI Analysis", "description": "Reviewing user adoption and key efficiency metrics."}
            ]
        )
        db.add(summary_m3)

        actions_m3 = [
            models.ActionItem(meeting_id="m3-customer-qbr", text="Send soundbite exporter preview link to Acme Corp account team", assignee_name="Sarah Chen", completed=True)
        ]
        db.add_all(actions_m3)

        db.commit()
        print("Database successfully seeded with 3 realistic meeting datasets!")

    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
