"""Event reminders and the daily agenda digest."""
from __future__ import annotations

from datetime import date, datetime, time, timedelta
import logging

from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.event import async_track_time_interval

from .const import DOMAIN, EVENT_REMINDER
from .logic import DEFAULT_DAYPARTS, chore_due, chore_overdue
from .models import parse_datetime
from .recurrence import expand_occurrences

_LOGGER = logging.getLogger(__name__)
CHECK_INTERVAL = timedelta(seconds=60)


def occurrences_between(items: list[dict], start: datetime, end: datetime) -> list[dict]:
    """Expand calendar items into concrete occurrences overlapping [start, end)."""
    output = []
    for item in items:
        try:
            first = parse_datetime(item["start"])
            duration = parse_datetime(item["end"]) - first
        except (KeyError, ValueError, TypeError):
            continue
        if first.tzinfo is None:
            first = first.replace(tzinfo=start.tzinfo)
        for occurrence in expand_occurrences(first, item.get("recurrence"), end, item.get("exdates")):
            if occurrence + duration > start and occurrence < end:
                output.append({**item, "occurrence_start": occurrence, "occurrence_end": occurrence + duration})
    return sorted(output, key=lambda value: value["occurrence_start"])


def due_reminders(items: list[dict], now: datetime, default_minutes: int, lookahead: timedelta = CHECK_INTERVAL) -> list[dict]:
    """Return occurrences whose reminder moment falls within [now, now + lookahead)."""
    horizon = now + timedelta(days=8)
    due = []
    for occurrence in occurrences_between(items, now, horizon):
        if occurrence.get("all_day"):
            continue
        minutes = occurrence.get("reminder_minutes")
        minutes = default_minutes if minutes in (None, "") else int(minutes)
        if minutes < 0:
            continue
        remind_at = occurrence["occurrence_start"] - timedelta(minutes=minutes)
        if now <= remind_at < now + lookahead:
            due.append({**occurrence, "reminder_minutes": minutes, "remind_at": remind_at})
    return due


def format_time(value: datetime, time_format: str) -> str:
    return value.strftime("%I:%M %p").lstrip("0") if time_format == "12" else value.strftime("%H:%M")


def agenda_message(occurrences: list[dict], time_format: str) -> str:
    if not occurrences:
        return "Nothing on the family calendar today."
    lines = []
    for occurrence in occurrences:
        when = "All day" if occurrence.get("all_day") else format_time(occurrence["occurrence_start"], time_format)
        location = f" · {occurrence['location']}" if occurrence.get("location") else ""
        lines.append(f"{when} {occurrence.get('title', '')}{location}")
    return "\n".join(lines)


def due_list_deadlines(lists: list[dict], items: list[dict], now: datetime, lookahead: timedelta = CHECK_INTERVAL) -> list[dict]:
    """Return list/item deadlines whose one-hour-before moment falls within [now, now + lookahead)."""
    due = []
    list_names = {lst["id"]: lst.get("name", "") for lst in lists}
    for entry, kind in [(lst, "list") for lst in lists] + [(item, "item") for item in items]:
        deadline = entry.get("deadline")
        if not deadline:
            continue
        try:
            when = parse_datetime(deadline)
        except (ValueError, TypeError):
            continue
        if when.tzinfo is None:
            when = when.replace(tzinfo=now.tzinfo)
        remind_at = when - timedelta(hours=1)
        if now <= remind_at < now + lookahead:
            due.append({
                "id": entry.get("id"), "kind": kind, "deadline": when,
                "title": entry.get("title") or entry.get("name", ""),
                "list_id": entry.get("list_id") or entry.get("id"),
                "list_name": list_names.get(entry.get("list_id") or entry.get("id"), ""),
            })
    return due


class ReminderScheduler:
    """Checks once a minute for reminders and the daily agenda."""

    def __init__(self, hass: HomeAssistant, stores) -> None:
        self.hass = hass
        self.stores = stores
        self._sent: set[str] = set()
        self._agenda_day: str | None = None
        self._unsub = None

    @callback
    def async_start(self) -> None:
        if self._unsub is None:
            self._unsub = async_track_time_interval(self.hass, self._tick, CHECK_INTERVAL)

    @callback
    def async_stop(self) -> None:
        if self._unsub:
            self._unsub()
            self._unsub = None

    @property
    def settings(self) -> dict:
        return self.stores["settings"].data

    async def _tick(self, now: datetime) -> None:
        settings = self.settings
        if not settings.get("reminders_enabled", True):
            return
        now = now.astimezone()
        items = self.stores["calendar"].data.get("items", [])
        for reminder in due_reminders(items, now, int(settings.get("default_reminder_minutes", 15) or 0)):
            key = f"{reminder.get('id')}|{reminder['occurrence_start'].isoformat()}"
            if key in self._sent:
                continue
            self._sent.add(key)
            await self._deliver(reminder, settings)
        if len(self._sent) > 2000:
            self._sent = set(list(self._sent)[-1000:])
        groceries = self.stores["groceries"].data
        for reminder in due_list_deadlines(groceries.get("lists", []), groceries.get("items", []), now):
            key = f"list|{reminder['kind']}|{reminder['id']}|{reminder['deadline'].isoformat()}"
            if key in self._sent:
                continue
            self._sent.add(key)
            await self._deliver_list_reminder(reminder, settings)
        await self._check_chore_alarms(now, settings)
        if settings.get("chore_overdue_notify_enabled"):
            await self._check_overdue_chores(now, settings)
        digest = settings.get("daily_agenda_time") or ""
        if digest and now.strftime("%H:%M") == digest and self._agenda_day != now.date().isoformat():
            self._agenda_day = now.date().isoformat()
            day_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
            today = occurrences_between(items, day_start, day_start + timedelta(days=1))
            await self._notify(
                "Today’s family agenda", agenda_message(today, str(settings.get("time_format", "24"))), settings,
                f"{DOMAIN}_agenda",
            )

    async def _deliver(self, reminder: dict, settings: dict) -> None:
        start = format_time(reminder["occurrence_start"], str(settings.get("time_format", "24")))
        location = f" at {reminder['location']}" if reminder.get("location") else ""
        minutes = reminder["reminder_minutes"]
        lead = "now" if minutes == 0 else f"in {minutes} minutes"
        message = f"{reminder.get('title', 'Event')} starts {lead} ({start}){location}."
        people = self.stores["people"].data.get("items", [])
        names = [p.get("name", "") for p in people if p.get("id") in (reminder.get("person_ids") or [])]
        self.hass.bus.async_fire(EVENT_REMINDER, {
            "event_id": reminder.get("id"), "title": reminder.get("title", ""),
            "start": reminder["occurrence_start"].isoformat(), "location": reminder.get("location"),
            "person_ids": reminder.get("person_ids") or [], "people": names, "message": message,
        })
        await self._notify("Family Organizer reminder", message, settings, f"{DOMAIN}_{reminder.get('id')}")
        if settings.get("notify_assigned_people", True):
            assigned = [p for p in people if p.get("id") in (reminder.get("person_ids") or [])]
            await self._notify_people("Family Organizer reminder", message, assigned)

    async def _deliver_list_reminder(self, reminder: dict, settings: dict) -> None:
        when = format_time(reminder["deadline"], str(settings.get("time_format", "24")))
        suffix = f" ({reminder['list_name']})" if reminder["kind"] == "item" and reminder["list_name"] else ""
        message = f"{reminder.get('title', 'Item')} is due at {when}{suffix}."
        self.hass.bus.async_fire(EVENT_REMINDER, {
            "list_reminder": True, "item_id": reminder["id"], "kind": reminder["kind"],
            "deadline": reminder["deadline"].isoformat(), "title": reminder.get("title", ""),
            "list_id": reminder.get("list_id"), "message": message,
        })
        await self._notify("Family Organizer reminder", message, settings, f"{DOMAIN}_list_{reminder['id']}")

    async def _notify(self, title: str, message: str, settings: dict, notification_id: str) -> None:
        if str(settings.get("notification_mode", "persistent")) == "notify":
            service = str(settings.get("notify_service") or "").strip()
            if await self._call_notify(service, title, message):
                return
        await self.hass.services.async_call(
            "persistent_notification", "create",
            {"title": title, "message": message, "notification_id": notification_id}, blocking=False,
        )

    async def _call_notify(self, service: str, title: str, message: str) -> bool:
        """Call a notify service; return True when it was delivered."""
        service = str(service or "").strip().removeprefix("notify.")
        if not service or not self.hass.services.has_service("notify", service):
            return False
        try:
            await self.hass.services.async_call(
                "notify", service, {"title": title, "message": message}, blocking=True
            )
            return True
        except Exception as err:  # noqa: BLE001 - fall back to a persistent notification
            _LOGGER.warning("notify.%s failed (%s)", service, err)
            return False

    async def _notify_people(self, title: str, message: str, people: list[dict]) -> None:
        """Send a device notification only to people with configured notify services."""
        for person in people:
            service = str(person.get("notify_service") or "").strip()
            if not service:
                continue
            await self._call_notify(service, title, message)

    def _chore_deadline(self, chore: dict, day: date, dayparts: dict, tzinfo) -> datetime | None:
        due_time = chore.get("due_time")
        if due_time:
            try:
                deadline_time = time.fromisoformat(due_time)
            except ValueError:
                return None
        else:
            daypart = chore.get("daypart") or "custom"
            entry = (dayparts or {}).get(daypart) or (DEFAULT_DAYPARTS.get(daypart) or {})
            end = entry.get("end") if isinstance(entry, dict) else None
            deadline_time = time.fromisoformat(end) if end else None
        if deadline_time is None:
            return None
        return datetime.combine(day, deadline_time, tzinfo=tzinfo)

    def _chore_alarm_people(self, chore: dict, people: dict[str, dict]) -> list[dict]:
        if chore.get("is_free"):
            ids = [value for value in (chore.get("alarm_person_ids") or []) if value in people]
            return [people[value] for value in ids]
        ids = list(chore.get("assignee_ids") or [])
        if ids and chore.get("rotate"):
            ids = [ids[int(chore.get("rotation_index", 0)) % len(ids)]]
        return [people[value] for value in ids if value in people]

    async def _check_chore_alarms(self, now: datetime, settings: dict) -> None:
        """Send optional pre-deadline alarms for chores and routines."""
        chores = self.stores["chores"].data.get("items", [])
        completions = self.stores["chores"].data.get("completions", [])
        people = {p.get("id"): p for p in self.stores["people"].data.get("items", []) if p.get("id")}
        dayparts = settings.get("chore_dayparts") or DEFAULT_DAYPARTS
        today = now.date()
        for chore in chores:
            if not chore.get("alarm_enabled"):
                continue
            try:
                if not chore_due(chore, today, bool(settings.get("chores_paused"))):
                    continue
            except (ValueError, TypeError):
                continue
            if any(
                value.get("chore_id") == chore.get("id")
                and not value.get("adjustment")
                and value.get("completed_at", "")[:10] == today.isoformat()
                for value in completions
            ):
                continue
            deadline = self._chore_deadline(chore, today, dayparts, now.tzinfo)
            if deadline is None:
                continue
            minutes = max(1, int(chore.get("alarm_minutes") or 30))
            remind_at = deadline - timedelta(minutes=minutes)
            if not (now <= remind_at < now + CHECK_INTERVAL):
                continue
            key = f"chore_alarm|{chore.get('id')}|{today.isoformat()}|{minutes}"
            if key in self._sent:
                continue
            self._sent.add(key)
            recipients = self._chore_alarm_people(chore, people)
            if not recipients:
                continue
            message = str(chore.get("title") or "Task").strip() or "Task"
            self.hass.bus.async_fire(EVENT_REMINDER, {
                "chore_alarm": True, "chore_id": chore.get("id"),
                "title": chore.get("title", ""),
                "person_ids": [person.get("id") for person in recipients],
                "message": message,
            })
            await self._notify_people("Family Organizer chore", message, recipients)

    async def _check_overdue_chores(self, now: datetime, settings: dict) -> None:
        """Notify the assignee (and an optional extra device) when a chore becomes overdue."""
        chores = self.stores["chores"].data.get("items", [])
        people = {p.get("id"): p for p in self.stores["people"].data.get("items", [])}
        day = now.date()
        for chore in chores:
            try:
                if not chore_overdue(chore, day, now):
                    continue
            except (ValueError, TypeError):
                continue
            key = f"chore_overdue|{chore.get('id')}|{day.isoformat()}"
            if key in self._sent:
                continue
            self._sent.add(key)
            assignees = chore.get("assignee_ids") or []
            if assignees and chore.get("rotate"):
                assignees = [assignees[int(chore.get("rotation_index", 0)) % len(assignees)]]
            assigned_people = [people[pid] for pid in assignees if pid in people]
            names = ", ".join(p.get("name", "") for p in assigned_people)
            message = f"{chore.get('title', 'Chore')} is overdue" + (f" ({names})" if names else "") + "."
            self.hass.bus.async_fire(EVENT_REMINDER, {
                "chore_overdue": True, "chore_id": chore.get("id"),
                "title": chore.get("title", ""), "person_ids": assignees, "message": message,
            })
            await self._notify_people("Family Organizer chore", message, assigned_people)
            extra = str(settings.get("chore_overdue_extra_service") or "").strip()
            if extra:
                await self._call_notify(extra, "Family Organizer chore", message)
