"""Family Organizer summary sensors."""
from __future__ import annotations

from datetime import date

from homeassistant.components.sensor import SensorEntity

from .const import DOMAIN
from .logic import points_by_person


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
        return sum(points_by_person(self.stores["chores"].data["items"], date.today()).values())

    @property
    def extra_state_attributes(self):
        return {"people": points_by_person(self.stores["chores"].data["items"], date.today())}

