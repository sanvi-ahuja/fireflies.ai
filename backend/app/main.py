from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routers import meetings, transcripts, summaries, action_items

# Create tables automatically on launch
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Fireflies.ai Clone API",
    description="High-performance backend API for Fireflies meeting transcription and notes platform.",
    version="1.0.0"
)

# Enable CORS for Next.js frontend
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routers
app.include_router(meetings.router)
app.include_router(transcripts.router)
app.include_router(summaries.router)
app.include_router(action_items.router)

@app.get("/")
def root():
    return {
        "status": "healthy",
        "service": "Fireflies.ai Clone API",
        "docs": "/docs"
    }
