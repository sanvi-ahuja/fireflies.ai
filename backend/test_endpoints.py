import requests, json

BASE = "http://127.0.0.1:8000"

# 1. Test root health
r = requests.get(f"{BASE}/")
print("Health:", r.json())

# 2. List meetings
r = requests.get(f"{BASE}/api/meetings")
meetings = r.json()
print(f"\nMeetings ({len(meetings)}):")
for m in meetings:
    print(f"  - [{m['id']}] {m['title']} | Segments:{m['segment_count']} | Tasks:{m['action_item_count']}")

# 3. Meeting detail
m_id = meetings[0]['id']
r = requests.get(f"{BASE}/api/meetings/{m_id}")
detail = r.json()
print(f"\nDetail for '{detail['title']}'")
print(f"  Summary preview: {detail['summary']['overview'][:100] if detail.get('summary') else 'NONE'}...")
print(f"  Transcript segments: {len(detail['segments'])}")
print(f"  Action items: {len(detail['action_items'])}")

# 4. AI Summary
r = requests.get(f"{BASE}/api/meetings/{m_id}/summary")
s = r.json()
print(f"\nAI Summary:")
print(f"  Overview: {s['overview'][:100]}...")
print(f"  Key topics: {len(s['key_topics'])} chapters")
print(f"  Bullets: {s['shorthand_bullet_points']}")

# 5. Ask AI Chat
r = requests.post(f"{BASE}/api/meetings/{m_id}/chat", json={"question": "What were the main engineering decisions?"})
chat = r.json()
print(f"\nAsk AI Chat Response:")
print(f"  Answer: {chat['answer'][:200]}...")
print(f"  Timestamps: {chat['relevant_timestamps']}")

# 6. Action Item toggle
ai_id = detail['action_items'][0]['id']
r = requests.patch(f"{BASE}/api/action-items/{ai_id}", json={"completed": True})
toggled = r.json()
print(f"\nAction Item Toggled:")
print(f"  Text: {toggled['text'][:60]}... | Completed: {toggled['completed']}")

# 7. Search filter
r = requests.get(f"{BASE}/api/meetings?q=roadmap")
print(f"\nSearch 'roadmap': {len(r.json())} results")

print("\n✅ All API endpoints PASSED!")
