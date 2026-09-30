"""Standards-compliant iCalendar parsing using icalendar."""
from __future__ import annotations

from datetime import date, datetime, timedelta, timezone
from typing import Any

from icalendar import Calendar


def _iso(value: date | datetime) -> tuple[str, bool]:
    if isinstance(value, datetime):
        if value.tzinfo is None:
            value = value.replace(tzinfo=timezone.utc)
        return value.isoformat(), False
    return value.isoformat(), True


def parse_ics(text: str) -> list[dict[str, Any]]:
    """Parse VEVENT values, retaining TZID offsets and recurrence metadata."""
    calendar = Calendar.from_ical(text)
    events: list[dict[str, Any]] = []
    for component in calendar.walk("VEVENT"):
        start_value = component.decoded("DTSTART")
        start, all_day = _iso(start_value)
        if component.get("DTEND"):
            end_value = component.decoded("DTEND")
        elif component.get("DURATION"):
            end_value = start_value + component.decoded("DURATION")
        else:
            end_value = start_value + (timedelta(days=1) if all_day else timedelta(hours=1))
        end, _ = _iso(end_value)
        uid = str(component.get("UID", f"ics-{len(events)}"))
        rrule = component.get("RRULE")
        recurrence = rrule.to_ical().decode() if rrule is not None else None
        event = {
            "id": uid,
            "external_id": uid,
            "title": str(component.get("SUMMARY", "")),
            "description": str(component.get("DESCRIPTION", "")),
            "location": str(component.get("LOCATION", "")),
            "start": start,
            "end": end,
            "all_day": all_day,
            "person_ids": [],
            "recurrence": recurrence,
            "shared": True,
        }
        if component.get("RECURRENCE-ID"):
            recurrence_id, _ = _iso(component.decoded("RECURRENCE-ID"))
            event["recurrence_id"] = recurrence_id
        if component.get("EXDATE"):
            values = component.get("EXDATE")
            values = values if isinstance(values, list) else [values]
            event["exdates"] = [
                _iso(item.dt)[0] for value in values for item in value.dts
            ]
        events.append(event)
    masters = {event["external_id"]: event for event in events if not event.get("recurrence_id")}
    for event in events:
        recurrence_id = event.get("recurrence_id")
        master = masters.get(event["external_id"])
        if recurrence_id and master is not None:
            master.setdefault("exdates", []).append(recurrence_id)
    return events
