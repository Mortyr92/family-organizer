"""Event reminders and the daily agenda digest."""
from __future__ import annotations

from datetime import datetime, timedelta
import logging

from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.event import async_track_time_interval

from .const import DOMAIN, EVENT_REMINDER
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

    async def _notify(self, title: str, message: str, settings: dict, notification_id: str) -> None:
        service = str(settings.get("notify_service") or "").strip()
        if service and self.hass.services.has_service("notify", service):
            try:
                await self.hass.services.async_call(
                    "notify", service, {"title": title, "message": message}, blocking=True
                )
                return
            except Exception as err:  # noqa: BLE001 - fall back to a persistent notification
                _LOGGER.warning("notify.%s failed (%s); using a persistent notification", service, err)
        await self.hass.services.async_call(
            "persistent_notification", "create",
            {"title": title, "message": message, "notification_id": notification_id}, blocking=False,
        )
