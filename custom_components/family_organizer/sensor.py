"""Family Organizer summary sensors."""
from __future__ import annotations

from datetime import date

from homeassistant.components.sensor import SensorEntity

from .const import DOMAIN
from .logic import leaderboard


async def async_setup_entry(hass, entry, async_add_entities):
    stores = hass.data[DOMAIN]["stores"]
    async_add_entities([GroceryCountSensor(stores), ChorePointsSensor(stores)])


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
