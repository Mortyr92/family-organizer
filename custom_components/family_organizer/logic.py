"""Pure business logic."""
from __future__ import annotations

from datetime import date, timedelta


def chore_due(chore: dict, day: date) -> bool:
    schedule = chore.get("schedule", "")
    if not schedule:
        return True
    if schedule == "daily":
        return True
    if schedule.startswith("weekly:"):
        return day.strftime("%A").lower() in schedule.split(":", 1)[1].lower().split(",")
    if schedule.startswith("interval:"):
        interval = max(1, int(schedule.split(":", 1)[1]))
        created = date.fromisoformat(chore.get("created", day.isoformat()))
        return (day - created).days % interval == 0
    return schedule == day.isoformat()


def points_by_person(chores: list[dict], start: date, days: int = 7) -> dict[str, int]:
    valid = {(start + timedelta(days=i)).isoformat() for i in range(days)}
    totals: dict[str, int] = {}
    for chore in chores:
        completed = sum(1 for item in chore.get("completed", []) if item[:10] in valid)
        person = chore.get("assignee_id")
        if person and completed:
            totals[person] = totals.get(person, 0) + int(chore.get("points", 0)) * completed
    return totals

