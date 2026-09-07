import requests

# Test 1: Create meeting without a date (what frontend sends)
r = requests.post("http://127.0.0.1:8000/api/meetings", json={
    "title": "Test Meeting",
    "participants": []
})
print("Test 1 - No date field:", r.status_code)
print("Response:", r.json())
print()

# Test 2: Create meeting WITH date
r2 = requests.post("http://127.0.0.1:8000/api/meetings", json={
    "title": "Test Meeting 2",
    "date": "2026-09-07T17:00:00",
    "participants": []
})
print("Test 2 - With date:", r2.status_code)
print("Response:", r2.json())
print()

# Test 3: Check DB has data
r3 = requests.get("http://127.0.0.1:8000/api/meetings")
print("Test 3 - List meetings:", r3.status_code, "count:", len(r3.json()))
