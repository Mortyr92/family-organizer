"""Standards-compliant iCalendar parsing and export using icalendar."""
from __future__ import annotations

from datetime import date, datetime, timedelta, timezone
from typing import Any

from icalendar import Calendar, Event

from .models import parse_datetime


def build_ics(items: list[dict[str, Any]], people: list[dict[str, Any]] | None = None, name: str = "Family Organizer") -> bytes:
    """Serialize stored calendar items (with their RRULE/EXDATE data) to an iCalendar feed."""
    names = {p.get("id"): p.get("name", "") for p in people or []}
    calendar = Calendar()
    calendar.add("PRODID", "-//Family Organizer//Home Assistant//EN")
    calendar.add("VERSION", "2.0")
    calendar.add("X-WR-CALNAME", name)
    for item in items:
        try:
            start, end = parse_datetime(item["start"]), parse_datetime(item["end"])
        except (KeyError, ValueError, TypeError):
            continue
        event = Event()
        event.add("UID", f"{item.get('id', '')}@family-organizer")
        event.add("SUMMARY", item.get("title", ""))
        if item.get("all_day"):
            event.add("DTSTART", start.date())
            event.add("DTEND", end.date())
        else:
            event.add("DTSTART", start)
            event.add("DTEND", end)
        event.add("DTSTAMP", datetime.now(timezone.utc))
        if item.get("description"):
            event.add("DESCRIPTION", item["description"])
        if item.get("location"):
            event.add("LOCATION", item["location"])
        attendees = [names[i] for i in item.get("person_ids") or [] if names.get(i)]
        if attendees:
            event.add("CATEGORIES", attendees)
        rule = str(item.get("recurrence") or "").removeprefix("RRULE:")
        if rule:
            event.add("RRULE", dict(part.split("=", 1) for part in rule.split(";") if "=" in part))
        for exdate in item.get("exdates") or []:
            try:
                event.add("EXDATE", parse_datetime(exdate))
            except ValueError:
                continue
        calendar.add_component(event)
    return calendar.to_ical()


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
