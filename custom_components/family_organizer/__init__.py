"""Family Organizer integration."""
from __future__ import annotations

from datetime import datetime
from pathlib import Path
from uuid import uuid4

import voluptuous as vol
from homeassistant.components import panel_custom
from homeassistant.const import Platform
from homeassistant.core import ServiceCall
from homeassistant.exceptions import Unauthorized

from .const import DOMAIN, EVENT_UPDATED, PANEL_ICON, PANEL_TITLE, PANEL_URL
from .permissions import capabilities_for, check_capability, person_for
from .logic import merge_grocery_item
from .storage import StoreManager
from .caldav_sync import CalendarSyncCoordinator
from .websocket_api import async_register as async_register_websocket

PLATFORMS = [Platform.CALENDAR, Platform.SENSOR, Platform.TODO]


async def async_setup(hass, config):
    hass.data.setdefault(DOMAIN, {})
    return True


async def async_setup_entry(hass, entry):
    domain_data = hass.data.setdefault(DOMAIN, {})
    if "stores" not in domain_data:
        stores = StoreManager(hass)
        await stores.async_load()
        domain_data["stores"] = stores
        async_register_websocket(hass)
        await _async_register_panel(hass)
        _register_services(hass, stores)
    coordinator = CalendarSyncCoordinator(hass, entry, domain_data["stores"])
    domain_data.setdefault("coordinators", {})[entry.entry_id] = coordinator
    entry.async_on_unload(coordinator.async_add_listener(lambda: None))
    entry.async_on_unload(entry.add_update_listener(_async_update_listener))
    if entry.options.get("calendar_url", entry.data.get("calendar_url")):
        await coordinator.async_config_entry_first_refresh()
    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)
    return True


async def _async_update_listener(hass, entry):
    await hass.config_entries.async_reload(entry.entry_id)


async def async_unload_entry(hass, entry):
    result = await hass.config_entries.async_unload_platforms(entry, PLATFORMS)
    hass.data[DOMAIN].get("coordinators", {}).pop(entry.entry_id, None)
    return result


async def _async_register_panel(hass):
    bundle = Path(__file__).parent / "panel" / "family-organizer-panel.js"
    # Home Assistant 2024.6 uses the synchronous registration API.
    hass.http.register_static_path(
        "/family_organizer/family-organizer-panel.js", str(bundle), True
    )
    await panel_custom.async_register_panel(
        hass,
        webcomponent_name="family-organizer-panel",
        frontend_url_path=PANEL_URL.strip("/"),
        module_url="/family_organizer/family-organizer-panel.js",
        sidebar_title=PANEL_TITLE,
        sidebar_icon=PANEL_ICON,
        require_admin=False,
    )


def _register_services(hass, stores):
    async def service_user(call: ServiceCall, resource: str, capability: str, item=None):
        user_id = getattr(call.context, "user_id", None)
        user = await hass.auth.async_get_user(user_id) if user_id else None
        if user is None:
            raise Unauthorized(context=call.context)
        check_capability(
            user, resource, capability, stores["settings"].data, item,
            stores["people"].data,
        )
        return user, person_for(user, stores["settings"].data, stores["people"].data)

    async def add_grocery(call: ServiceCall):
        user, person = await service_user(call, "groceries", "manage_groceries")
        item = {
            "id": uuid4().hex,
            "name": call.data["name"],
            "quantity": call.data.get("quantity", 1),
            "unit": call.data.get("unit", ""),
            "checked": False,
            "category": call.data.get("category", "Other"),
            "list_id": call.data.get("list_id", "default"),
            "store": call.data.get("store", ""),
            "assignee_id": call.data.get("assignee_id"),
            "notes": call.data.get("notes", ""),
            "creator_id": person["id"] if person else user.id,
            "shared": True,
        }
        item, _ = merge_grocery_item(stores["groceries"].data["items"], item)
        await stores["groceries"].async_save()
        hass.bus.async_fire(EVENT_UPDATED, {"resource": "groceries", "operation": "create", "item": item})

    async def complete_chore(call: ServiceCall):
        chore = next(
            (item for item in stores["chores"].data["items"] if item["id"] == call.data["chore_id"]),
            None,
        )
        if chore is None:
            raise ValueError("Unknown chore")
        user_id = getattr(call.context, "user_id", None)
        user = await hass.auth.async_get_user(user_id) if user_id else None
        person = person_for(user, stores["settings"].data, stores["people"].data)
        caps = capabilities_for(user, stores["settings"].data, stores["people"].data)
        capability = "complete_any_chore" if caps["complete_any_chore"] else "complete_own_chores"
        await service_user(call, "chores", capability, chore)
        chore.setdefault("completed", []).append(datetime.now().astimezone().isoformat())
        stores["chores"].data.setdefault("completions", []).append({
            "id": uuid4().hex, "chore_id": chore["id"],
            "person_id": person["id"] if person else None,
            "completed_at": chore["completed"][-1], "points": int(chore.get("points", 0)),
            "adjustment": False,
        })
        await stores["chores"].async_save()
        hass.bus.async_fire(EVENT_UPDATED, {
            "resource": "chores", "operation": "complete", "item": chore
        })

    async def sync_calendar(call: ServiceCall):
        await service_user(call, "calendar", "manage_calendar_sync")
        for coordinator in hass.data[DOMAIN].get("coordinators", {}).values():
            await coordinator.async_request_refresh()

    async def add_event(call: ServiceCall):
        user_id = getattr(call.context, "user_id", None)
        user = await hass.auth.async_get_user(user_id) if user_id else None
        person = person_for(user, stores["settings"].data, stores["people"].data)
        caps = capabilities_for(user, stores["settings"].data, stores["people"].data)
        capability = "manage_calendar_all" if caps["manage_calendar_all"] else "manage_calendar_own"
        await service_user(call, "calendar", capability)
        person_ids = list(call.data.get("person_ids", []))
        if capability == "manage_calendar_own":
            if any(value != person["id"] for value in person_ids):
                raise Unauthorized(context=call.context)
            person_ids = person_ids or [person["id"]]
        item = {
            "id": uuid4().hex, "title": call.data["title"],
            "start": call.data["start"], "end": call.data["end"],
            "all_day": call.data.get("all_day", False),
            "person_ids": person_ids, "description": call.data.get("description", ""),
            "location": call.data.get("location", ""),
            "creator_id": person["id"] if person else user.id,
            "shared": call.data.get("shared", True),
        }
        stores["calendar"].data["items"].append(item)
        await stores["calendar"].async_save()
        hass.bus.async_fire(EVENT_UPDATED, {"resource": "calendar", "operation": "create", "item": item})

    grocery_schema = vol.Schema({
        vol.Required("name"): str,
        vol.Optional("quantity", default=1): vol.Coerce(float),
        vol.Optional("unit", default=""): str,
        vol.Optional("category", default="Other"): str,
        vol.Optional("notes", default=""): str,
        vol.Optional("list_id", default="default"): str,
        vol.Optional("store", default=""): str,
        vol.Optional("assignee_id"): str,
    })
    event_schema = vol.Schema({
        vol.Required("title"): str, vol.Required("start"): str, vol.Required("end"): str,
        vol.Optional("all_day", default=False): bool,
        vol.Optional("person_ids", default=[]): [str],
        vol.Optional("description", default=""): str,
        vol.Optional("location", default=""): str,
        vol.Optional("shared", default=True): bool,
    })
    chore_schema = vol.Schema({vol.Required("chore_id"): str})
    hass.services.async_register(DOMAIN, "add_grocery_item", add_grocery, schema=grocery_schema)
    hass.services.async_register(DOMAIN, "add_grocery", add_grocery, schema=grocery_schema)
    hass.services.async_register(DOMAIN, "add_event", add_event, schema=event_schema)
    hass.services.async_register(DOMAIN, "complete_chore", complete_chore, schema=chore_schema)
    hass.services.async_register(DOMAIN, "sync_calendar", sync_calendar, schema=vol.Schema({}))
