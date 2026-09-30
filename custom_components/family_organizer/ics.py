"""Dependency-free iCalendar parsing."""
from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Any


def _unescape(value: str) -> str:
    return value.replace("\\n", "\n").replace("\\,", ",").replace("\\;", ";").replace("\\\\", "\\")


def _datetime(value: str, params: str = "") -> tuple[str, bool]:
    if "VALUE=DATE" in params or (len(value) == 8 and "T" not in value):
        parsed = datetime.strptime(value[:8], "%Y%m%d")
        return parsed.date().isoformat(), True
    utc = value.endswith("Z")
    raw = value.removesuffix("Z")
    fmt = "%Y%m%dT%H%M%S" if len(raw) >= 15 else "%Y%m%dT%H%M"
    parsed = datetime.strptime(raw, fmt)
    if utc:
        parsed = parsed.replace(tzinfo=timezone.utc)
    return parsed.isoformat(), False


def parse_ics(text: str) -> list[dict[str, Any]]:
    lines: list[str] = []
    for line in text.replace("\r\n", "\n").split("\n"):
        if line.startswith((" ", "\t")) and lines:
            lines[-1] += line[1:]
        else:
            lines.append(line.rstrip("\r"))
    events, current = [], None
    for line in lines:
        if line == "BEGIN:VEVENT":
            current = {}
            continue
        if line == "END:VEVENT" and current is not None:
            if "start" in current:
                if "end" not in current:
                    start = datetime.fromisoformat(current["start"])
                    current["end"] = (start + timedelta(days=1 if current.get("all_day") else 0, hours=0 if current.get("all_day") else 1)).isoformat()
                current["id"] = current.get("external_id") or f"ics-{len(events)}"
                current.setdefault("person_ids", [])
                events.append(current)
            current = None
            continue
        if current is None or ":" not in line:
            continue
        key_params, value = line.split(":", 1)
        key, _, params = key_params.partition(";")
        key = key.upper()
        if key == "UID":
            current["external_id"] = _unescape(value)
        elif key == "SUMMARY":
            current["title"] = _unescape(value)
        elif key == "DESCRIPTION":
            current["description"] = _unescape(value)
        elif key == "LOCATION":
            current["location"] = _unescape(value)
        elif key in ("DTSTART", "DTEND"):
            parsed, all_day = _datetime(value, params.upper())
            current["start" if key == "DTSTART" else "end"] = parsed
            current["all_day"] = all_day
        elif key == "RRULE":
            current["recurrence"] = value
    return events

