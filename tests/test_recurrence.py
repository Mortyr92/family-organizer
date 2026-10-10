from datetime import datetime
from zoneinfo import ZoneInfo

from custom_components.family_organizer.recurrence import expand_occurrences


def test_rewrites_non_utc_until_for_tz_aware_dtstart():
    start = datetime(2026, 10, 1, 9, 0, tzinfo=ZoneInfo("Europe/Amsterdam"))
    rule = "RRULE:FREQ=WEEKLY;UNTIL=20261029T090000"
    until = datetime(2026, 11, 1, 0, 0, tzinfo=ZoneInfo("Europe/Amsterdam"))
    values = expand_occurrences(start, rule, until)
    assert len(values) == 5
    assert values[0].day == 1
    assert values[-1].day == 29
