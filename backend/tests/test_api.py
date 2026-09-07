import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_list_meetings():
    response = client.get("/api/meetings")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1

def test_get_meeting_detail():
    meetings_res = client.get("/api/meetings")
    meetings = meetings_res.json()
    meeting_id = meetings[0]["id"]

    detail_res = client.get(f"/api/meetings/{meeting_id}")
    assert detail_res.status_code == 200
    detail = detail_res.json()
    assert detail["id"] == meeting_id
    assert "segments" in detail
    assert "summary" in detail
    assert "action_items" in detail

def test_ask_ai_chat():
    meetings_res = client.get("/api/meetings")
    meeting_id = meetings_res.json()[0]["id"]

    chat_res = client.post(
        f"/api/meetings/{meeting_id}/chat",
        json={"question": "What did the team discuss about audio player performance?"}
    )
    assert chat_res.status_code == 200
    assert "answer" in chat_res.json()
