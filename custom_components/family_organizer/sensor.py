"""Family Organizer summary sensors."""
from __future__ import annotations

from datetime import date, datetime, timedelta

from homeassistant.components.sensor import SensorEntity
from homeassistant.core import callback

from .const import DOMAIN, EVENT_UPDATED
from .logic import leaderboard
from .reminders import occurrences_between


async def async_setup_entry(hass, entry, async_add_entities):
    stores = hass.data[DOMAIN]["stores"]
    async_add_entities([GroceryCountSensor(stores), ChorePointsSensor(stores), TodayAgendaSensor(stores)])


class GroceryCountSensor(SensorEntity):
    _attr_name = "Family groceries"
    _attr_unique_id = "family_organizer_groceries"
    _attr_icon = "mdi:cart"

    def __init__(self, stores):
        self.stores = stores

    @property
    def native_value(self):
        return sum(not item.get("checked", False) for item in self.stores["groceries"].data["items"])


class ChorePointsSensor(SensorEntity):
    _attr_name = "Family chore points"
    _attr_unique_id = "family_organizer_chore_points"
    _attr_icon = "mdi:trophy"

    def __init__(self, stores):
        self.stores = stores

    @property
    def native_value(self):
        return sum(leaderboard(self.stores["chores"].data["items"], "week", date.today()).values())

    @property
    def extra_state_attributes(self):
        chores = self.stores["chores"].data["items"]
        return {
            "period": "week",
            "people": leaderboard(chores, "week", date.today()),
            "month": leaderboard(chores, "month", date.today()),
        }


class TodayAgendaSensor(SensorEntity):
    """Number of events today, with the full agenda as attributes for dashboard cards."""

    _attr_name = "Family agenda today"
    _attr_unique_id = "family_organizer_agenda_today"
    _attr_icon = "mdi:calendar-today"
    _attr_should_poll = False

    def __init__(self, stores):
        self.stores = stores

    async def async_added_to_hass(self):
        @callback
        def refresh(event):
            if event.data.get("resource") in (None, "calendar", "people", "settings"):
                self.async_write_ha_state()

        self.async_on_remove(self.hass.bus.async_listen(EVENT_UPDATED, refresh))

    def _today(self):
        now = datetime.now().astimezone()
        start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        return occurrences_between(self.stores["calendar"].data.get("items", []), start, start + timedelta(days=1))

    @property
    def native_value(self):
        return len(self._today())

    @property
    def extra_state_attributes(self):
        people = {p.get("id"): p for p in self.stores["people"].data.get("items", [])}
        events = []
        for occurrence in self._today():
            events.append({
                "id": occurrence.get("id"),
                "title": occurrence.get("title", ""),
                "start": occurrence["occurrence_start"].isoformat(),
                "end": occurrence["occurrence_end"].isoformat(),
                "all_day": bool(occurrence.get("all_day")),
                "location": occurrence.get("location"),
                "people": [people[i].get("name") for i in occurrence.get("person_ids") or [] if i in people],
                "colors": [people[i].get("color") for i in occurrence.get("person_ids") or [] if i in people],
            })
        upcoming = next((e for e in events if not e["all_day"] and e["start"] > datetime.now().astimezone().isoformat()), None)
        return {"events": events, "next_event": upcoming}
