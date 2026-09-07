import re
import json
from typing import List, Dict, Any

def parse_time_str(time_str: str) -> float:
    """Converts HH:MM:SS.mmm or MM:SS into total seconds float."""
    parts = time_str.strip().split(":")
    try:
        if len(parts) == 3:
            h, m, s = parts
            return float(h) * 3600 + float(m) * 60 + float(s)
        elif len(parts) == 2:
            m, s = parts
            return float(m) * 60 + float(s)
        else:
            return float(parts[0])
    except ValueError:
        return 0.0

def parse_transcript_content(content: str, filename: str = "") -> List[Dict[str, Any]]:
    """
    Parses VTT, JSON, or plain text into a list of transcript segment dicts:
    [{"start_time": float, "end_time": float, "speaker_name": str, "text": str}]
    """
    content = content.strip()
    if not content:
        return []

    # 1. Try parsing JSON format
    if content.startswith("[") or content.startswith("{"):
        try:
            data = json.loads(content)
            if isinstance(data, dict):
                data = data.get("segments") or data.get("transcript") or []
            if isinstance(data, list):
                segments = []
                for item in data:
                    speaker = item.get("speaker") or item.get("speaker_name") or "Speaker"
                    text = item.get("text") or item.get("content") or ""
                    start = float(item.get("start") or item.get("start_time") or 0.0)
                    end = float(item.get("end") or item.get("end_time") or start + 5.0)
                    if text:
                        segments.append({
                            "start_time": start,
                            "end_time": end,
                            "speaker_name": speaker,
                            "text": text.strip()
                        })
                if segments:
                    return segments
        except Exception:
            pass

    # 2. Try WebVTT format
    if "WEBVTT" in content or filename.endswith(".vtt"):
        segments = []
        lines = content.splitlines()
        i = 0
        current_speaker = "Speaker 1"
        while i < len(lines):
            line = lines[i].strip()
            # Look for timestamp line e.g. 00:00:01.000 --> 00:00:05.000
            if "-->" in line:
                times = line.split("-->")
                start_t = parse_time_str(times[0].strip())
                end_t = parse_time_str(times[1].strip())
                i += 1
                text_lines = []
                while i < len(lines) and lines[i].strip() != "":
                    t_line = lines[i].strip()
                    if ":" in t_line and not t_line.startswith("http"):
                        possible_speaker, body = t_line.split(":", 1)
                        current_speaker = possible_speaker.strip()
                        text_lines.append(body.strip())
                    else:
                        text_lines.append(t_line)
                    i += 1
                full_text = " ".join(text_lines).strip()
                if full_text:
                    segments.append({
                        "start_time": start_t,
                        "end_time": end_t,
                        "speaker_name": current_speaker,
                        "text": full_text
                    })
            i += 1
        if segments:
            return segments

    # 3. Plain text format with timestamps e.g. [01:23] Speaker: Hello
    segments = []
    lines = content.splitlines()
    curr_time = 0.0
    pattern_timestamp = re.compile(r'\[?(\d{1,2}:\d{2}(?::\d{2})?)\]?\s*(?:([^:\n]+):)?\s*(.*)')

    for idx, line in enumerate(lines):
        line = line.strip()
        if not line:
            continue
        match = pattern_timestamp.match(line)
        if match:
            t_str, speaker, text = match.groups()
            if t_str:
                curr_time = parse_time_str(t_str)
            speaker_name = speaker.strip() if speaker else "Speaker"
            segment_text = text.strip() if text else line
            segments.append({
                "start_time": curr_time,
                "end_time": curr_time + 4.5,
                "speaker_name": speaker_name,
                "text": segment_text
            })
            curr_time += 5.0
        else:
            # Fallback for plain lines
            speaker_name = "Speaker"
            text_str = line
            if ":" in line:
                possible_spk, text_part = line.split(":", 1)
                if len(possible_spk) < 30:
                    speaker_name = possible_spk.strip()
                    text_str = text_part.strip()
            segments.append({
                "start_time": curr_time,
                "end_time": curr_time + 5.0,
                "speaker_name": speaker_name,
                "text": text_str
            })
            curr_time += 5.0

    return segments
