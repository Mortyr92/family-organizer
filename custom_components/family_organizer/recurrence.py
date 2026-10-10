"""RFC 5545 recurrence expansion."""
from __future__ import annotations

from datetime import datetime, timezone

from dateutil.rrule import rrulestr


def _rewrite_until_to_utc(rule: str, start: datetime) -> str:
    if start.tzinfo is None:
        return rule
    prefix = ""
    body = rule
    if rule.startswith("RRULE:"):
        prefix = "RRULE:"
        body = rule.split(":", 1)[1]
    parts = body.split(";")
    changed = False
    for index, part in enumerate(parts):
        if not part.startswith("UNTIL="):
            continue
        raw = part.split("=", 1)[1].strip()
        if raw.endswith("Z"):
            continue
        parsed = None
        for fmt in ("%Y%m%dT%H%M%S", "%Y%m%dT%H%M", "%Y%m%d"):
            try:
                parsed = datetime.strptime(raw, fmt)
                break
            except ValueError:
                continue
        if parsed is None:
            continue
        if len(raw) == 8:
            parsed = parsed.replace(hour=23, minute=59, second=59)
        local_until = parsed.replace(tzinfo=start.tzinfo)
        utc_until = local_until.astimezone(timezone.utc)
        parts[index] = f"UNTIL={utc_until.strftime('%Y%m%dT%H%M%SZ')}"
        changed = True
    if not changed:
        return rule
    return f"{prefix}{';'.join(parts)}"


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
    try:
        values = rrulestr(rule, dtstart=start).between(start, until, inc=True)
    except ValueError as err:
        if start.tzinfo is not None and "RRULE UNTIL values must be specified in UTC" in str(err):
            values = rrulestr(_rewrite_until_to_utc(rule, start), dtstart=start).between(start, until, inc=True)
        else:
            raise
    return [value for value in values if value not in excluded]
