"""Family calendar entity."""
from __future__ import annotations

from datetime import datetime, timedelta

from homeassistant.components.calendar import CalendarEntity, CalendarEvent

from .const import DOMAIN
from .models import parse_datetime
from .recurrence import expand_occurrences


async def async_setup_entry(hass, entry, async_add_entities):
    async_add_entities([FamilyCalendar(hass.data[DOMAIN]["stores"])])


class FamilyCalendar(CalendarEntity):
    _attr_name = "Family Organizer"
    _attr_unique_id = "family_organizer_calendar"

    def __init__(self, stores):
        self.stores = stores

    @property
    def event(self):
        now = datetime.now().astimezone()
        events = self._events(now, now + timedelta(days=365))
        return events[0] if events else None

    def _events(self, start_date, end_date):
        output = []
        for item in self.stores["calendar"].data.get("items", []):
            try:
                start = parse_datetime(item["start"])
                end = parse_datetime(item["end"])
                duration = end - start
                for occurrence in expand_occurrences(start, item.get("recurrence"), end_date):
                    if occurrence + duration >= start_date:
                        output.append(CalendarEvent(
                            start=occurrence.date() if item.get("all_day") else occurrence,
                            end=(occurrence + duration).date() if item.get("all_day") else occurrence + duration,
                            summary=item.get("title", ""),
                            description=item.get("description"),
                            location=item.get("location"),
                            uid=item.get("id"),
                            recurrence_id=None,
                            rrule=item.get("recurrence"),
                        ))
            except (KeyError, ValueError):
                continue
        return sorted(output, key=lambda event: str(event.start))

    async def async_get_events(self, hass, start_date, end_date):
        return self._events(start_date, end_date)
