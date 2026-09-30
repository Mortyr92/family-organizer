"""Small iCalendar recurrence expander for common family schedules."""
from __future__ import annotations

from datetime import datetime, timedelta


def expand_occurrences(start: datetime, rule: str | None, until: datetime) -> list[datetime]:
    if not rule:
        return [start] if start <= until else []
    parts = dict(part.split("=", 1) for part in rule.upper().split(";") if "=" in part)
    frequency = parts.get("FREQ", "DAILY")
    interval = max(1, int(parts.get("INTERVAL", "1")))
    count = int(parts.get("COUNT", "1000"))
    delta = timedelta(days=interval * (7 if frequency == "WEEKLY" else 1))
    if frequency == "MONTHLY":
        delta = timedelta(days=30 * interval)
    values, current = [], start
    while current <= until and len(values) < count:
        values.append(current)
        current += delta
    return values

