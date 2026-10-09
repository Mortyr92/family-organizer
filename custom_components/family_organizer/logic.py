"""Pure business logic."""
from __future__ import annotations

from datetime import date, datetime, time, timedelta


def chore_due(chore: dict, day: date) -> bool:
    schedule = chore.get("schedule", "once")
    created = date.fromisoformat(chore.get("created", day.isoformat())[:10])
    if day < created:
        return False
    if schedule in ("", "once"):
        return day == date.fromisoformat((chore.get("due_date") or chore.get("created") or day.isoformat())[:10])
    if schedule == "daily":
        return True
    if schedule == "weekly":
        return day.weekday() in [int(value) for value in chore.get("weekdays", [])]
    if schedule.startswith("weekly:"):
        return day.strftime("%A").lower() in schedule.split(":", 1)[1].lower().split(",")
    if schedule == "monthly":
        return day.day == int(chore.get("month_day") or created.day)
    if schedule in ("custom", "interval") or schedule.startswith("interval:"):
        interval = max(1, int(
            chore.get("interval_days") or (
                schedule.split(":", 1)[1] if ":" in schedule else 1
            )
        ))
        return (day - created).days % interval == 0
    return schedule == day.isoformat()


def chore_overdue(chore: dict, day: date, now: datetime | None = None) -> bool:
    """Return whether an incomplete occurrence has passed its due date/time."""
    now = now or datetime.now().astimezone()
    if day > now.date() or not chore_due(chore, day):
        return False
    completed = any(value[:10] == day.isoformat() for value in chore.get("completed", []))
    if completed:
        return False
    if day < now.date():
        return True
    due_time = chore.get("due_time")
    return bool(due_time and now.time().replace(tzinfo=None) > time.fromisoformat(due_time))


def points_by_person(
    chores: list[dict], start: date, days: int = 7, completions: list[dict] | None = None
) -> dict[str, int]:
    valid = {(start + timedelta(days=i)).isoformat() for i in range(days)}
    totals: dict[str, int] = {}
    if completions is not None:
        for completion in completions:
            if completion.get("completed_at", "")[:10] not in valid:
                continue
            person = completion.get("person_id")
            if person:
                totals[person] = totals.get(person, 0) + int(completion.get("points", 0))
        return totals
    for chore in chores:
        completed = sum(1 for item in chore.get("completed", []) if item[:10] in valid)
        people = chore.get("assignee_ids") or [chore.get("assignee_id")]
        person = people[int(chore.get("rotation_index", 0)) % len(people)] if people and people[0] else None
        if person and completed:
            totals[person] = totals.get(person, 0) + int(chore.get("points", 0)) * completed
    return totals


def leaderboard(chores: list[dict], period: str, today: date | None = None) -> dict[str, int]:
    """Calculate calendar-week or calendar-month points."""
    today = today or date.today()
    if period == "month":
        start = today.replace(day=1)
        next_month = (start.replace(day=28) + timedelta(days=4)).replace(day=1)
        days = (next_month - start).days
    else:
        start = today - timedelta(days=today.weekday())
        days = 7
    return points_by_person(chores, start, days)


def merge_grocery_item(items: list[dict], candidate: dict, list_type: str = "groceries") -> tuple[dict, bool]:
    """Merge equivalent unchecked items in the same routed list.

    To-do lists have no quantities, so duplicate to-do titles are never merged;
    only shopping/groceries lists combine matching items by summing quantity.
    """
    if list_type == "todo":
        items.append(candidate)
        return candidate, False
    for item in items:
        same = (
            not item.get("checked")
            and item.get("list_id", "default") == candidate.get("list_id", "default")
            and item.get("name", "").strip().casefold() == candidate.get("name", "").strip().casefold()
            and item.get("unit", "") == candidate.get("unit", "")
        )
        if same:
            item["quantity"] = float(item.get("quantity", 1)) + float(candidate.get("quantity", 1))
            item["store"] = candidate.get("store") or item.get("store", "")
            item["assignee_id"] = candidate.get("assignee_id") or item.get("assignee_id")
            return item, True
    items.append(candidate)
    return candidate, False


def recipe_items(
    recipe: dict, servings: float, selected: list[int] | None, list_id: str, creator_id: str | None
) -> list[dict]:
    """Convert selected, scaled recipe ingredients to grocery items."""
    base = float(recipe.get("servings") or 1)
    wanted = set(selected) if selected is not None else None
    output = []
    for index, ingredient in enumerate(recipe.get("ingredients", [])):
        if wanted is not None and index not in wanted:
            continue
        output.append({
            "name": ingredient.get("name", ""),
            "quantity": round(float(ingredient.get("amount", 0)) * servings / base, 3),
            "unit": ingredient.get("unit", ""),
            "category": ingredient.get("category", "Other"),
            "checked": False,
            "list_id": ingredient.get("list_id") or list_id,
            "store": ingredient.get("store", ""),
            "creator_id": creator_id,
            "shared": True,
        })
    return output
