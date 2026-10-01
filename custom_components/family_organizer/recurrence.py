"""RFC 5545 recurrence expansion."""
from __future__ import annotations

from datetime import datetime

from dateutil.rrule import rrulestr


def expand_occurrences(
    start: datetime,
    rule: str | None,
    until: datetime,
    exdates: list[str] | None = None,
) -> list[datetime]:
    """Expand an RRULE, including BYDAY/month boundaries and exclusions."""
    if not rule:
        return [start] if start <= until else []
    if until.tzinfo is None and start.tzinfo is not None:
        until = until.replace(tzinfo=start.tzinfo)
    elif until.tzinfo is not None and start.tzinfo is None:
        start = start.replace(tzinfo=until.tzinfo)
    excluded = {
        datetime.fromisoformat(value.replace("Z", "+00:00"))
        for value in (exdates or [])
    }
    values = rrulestr(rule, dtstart=start).between(start, until, inc=True)
    return [value for value in values if value not in excluded]
