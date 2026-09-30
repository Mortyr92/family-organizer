from pathlib import Path

from custom_components.family_organizer.ics import parse_ics
from custom_components.family_organizer.recurrence import expand_occurrences
from custom_components.family_organizer.models import parse_datetime


def test_parses_ics_fixture_and_recurrence():
    fixture = Path(__file__).parent / "fixtures" / "family.ics"
    events = parse_ics(fixture.read_text())
    assert len(events) == 2
    assert events[0]["title"] == "School, run"
    assert events[0]["description"] == "Bring bags\nMeet outside"
    assert events[1]["all_day"] is True
    occurrences = expand_occurrences(
        parse_datetime(events[0]["start"]),
        events[0]["recurrence"],
        parse_datetime("2026-11-01T00:00:00+00:00"),
    )
    assert len(occurrences) == 4
    assert (occurrences[1] - occurrences[0]).days == 7

