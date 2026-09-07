import { Meeting, MeetingDetail, ActionItem, AskAIResponse, TranscriptSegment } from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export async function fetchMeetings(q?: string, participant?: string, orderBy: string = "desc"): Promise<Meeting[]> {
  const params = new URLSearchParams();
  if (q) params.append("q", q);
  if (participant) params.append("participant", participant);
  if (orderBy) params.append("order_by", orderBy);

  const res = await fetch(`${API_BASE}/meetings?${params.toString()}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch meetings");
  return res.json();
}

export async function fetchMeetingDetail(id: string): Promise<MeetingDetail> {
  const res = await fetch(`${API_BASE}/meetings/${id}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch meeting detail");
  return res.json();
}

export async function createMeeting(data: {
  title: string;
  date?: string;
  duration_seconds?: number;
  audio_url?: string;
  raw_transcript_text?: string;
  participants?: { name: string; email?: string }[];
}): Promise<MeetingDetail> {
  const res = await fetch(`${API_BASE}/meetings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const detail = err?.detail
      ? typeof err.detail === "string"
        ? err.detail
        : JSON.stringify(err.detail)
      : `Server error ${res.status}`;
    throw new Error(detail);
  }
  return res.json();
}

export async function uploadTranscriptFile(meetingId: string, file: File): Promise<TranscriptSegment[]> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_BASE}/meetings/${meetingId}/transcript/upload`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) throw new Error("Failed to upload transcript file");
  return res.json();
}

export async function deleteMeeting(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/meetings/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete meeting");
}

export async function updateMeeting(
  meetingId: string,
  data: { title?: string; participants?: { name: string; email?: string }[] }
): Promise<Meeting> {
  const res = await fetch(`${API_BASE}/meetings/${meetingId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update meeting");
  return res.json();
}

export async function createActionItem(meetingId: string, text: string, assigneeName?: string): Promise<ActionItem> {
  const res = await fetch(`${API_BASE}/meetings/${meetingId}/action-items`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, assignee_name: assigneeName, completed: false }),
  });
  if (!res.ok) throw new Error("Failed to create action item");
  return res.json();
}

export async function updateActionItem(actionId: string, data: { completed?: boolean; text?: string; assignee_name?: string }): Promise<ActionItem> {
  const res = await fetch(`${API_BASE}/action-items/${actionId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update action item");
  return res.json();
}

export async function deleteActionItem(actionId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/action-items/${actionId}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete action item");
}

export async function askMeetingAI(meetingId: string, question: string): Promise<AskAIResponse> {
  const res = await fetch(`${API_BASE}/meetings/${meetingId}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question }),
  });
  if (!res.ok) throw new Error("Failed to consult AI");
  return res.json();
}
