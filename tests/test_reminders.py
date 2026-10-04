"""Reminder timing, agenda digest and ICS export."""
from datetime import datetime, timedelta, timezone

from custom_components.family_organizer.ics import build_ics, parse_ics
from custom_components.family_organizer.reminders import agenda_message, due_reminders, occurrences_between

TZ = timezone(timedelta(hours=2))
ITEMS = [
    {"id": "swim", "title": "Swimming", "start": "2026-10-05T16:00:00+02:00", "end": "2026-10-05T17:00:00+02:00",
     "recurrence": "RRULE:FREQ=WEEKLY;BYDAY=MO", "person_ids": ["kid"], "location": "Pool", "reminder_minutes": 30},
    {"id": "holiday", "title": "Autumn break", "start": "2026-10-05T00:00:00+02:00", "end": "2026-10-06T00:00:00+02:00", "all_day": True},
    {"id": "dentist", "title": "Dentist", "start": "2026-10-05T09:00:00+02:00", "end": "2026-10-05T09:30:00+02:00"},
    {"id": "broken", "title": "Broken", "start": "nope", "end": "nope"},
]


def test_occurrences_between_expands_recurrence_and_skips_invalid():
    start = datetime(2026, 10, 12, 0, 0, tzinfo=TZ)
    today = occurrences_between(ITEMS, start, start + timedelta(days=1))
    assert [o["id"] for o in today] == ["swim"]
    assert today[0]["occurrence_start"] == datetime(2026, 10, 12, 16, 0, tzinfo=TZ)


def test_due_reminders_uses_event_or_default_lead_and_ignores_all_day():
    now = datetime(2026, 10, 5, 15, 30, tzinfo=TZ)
    due = due_reminders(ITEMS, now, default_minutes=15)
    assert [r["id"] for r in due] == ["swim"]
    assert due[0]["reminder_minutes"] == 30
    now = datetime(2026, 10, 5, 8, 45, tzinfo=TZ)
    due = due_reminders(ITEMS, now, default_minutes=15)
    assert [r["id"] for r in due] == ["dentist"]
    assert due_reminders(ITEMS, datetime(2026, 10, 5, 8, 0, tzinfo=TZ), 15) == []


def test_agenda_message_formats_times():
    start = datetime(2026, 10, 5, 0, 0, tzinfo=TZ)
    today = occurrences_between(ITEMS, start, start + timedelta(days=1))
    message = agenda_message(today, "12")
    assert message.splitlines() == ["All day Autumn break", "9:00 AM Dentist", "4:00 PM Swimming · Pool"]
    assert agenda_message([], "24") == "Nothing on the family calendar today."


def test_build_ics_round_trips_through_parser():
    text = build_ics(ITEMS, [{"id": "kid", "name": "Mila"}]).decode()
    assert "X-WR-CALNAME:Family Organizer" in text
    assert "RRULE:FREQ=WEEKLY;BYDAY=MO" in text
    assert "CATEGORIES:Mila" in text
    events = parse_ics(text)
    assert {e["title"] for e in events} == {"Swimming", "Autumn break", "Dentist"}
    assert next(e for e in events if e["title"] == "Autumn break")["all_day"] is True
