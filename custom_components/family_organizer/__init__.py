"""Family Organizer integration."""
from __future__ import annotations

from datetime import datetime
from pathlib import Path
from uuid import uuid4

from homeassistant.components import panel_custom
from homeassistant.components.http import StaticPathConfig
from homeassistant.const import Platform
from homeassistant.core import ServiceCall
from homeassistant.exceptions import Unauthorized

from .const import DOMAIN, EVENT_UPDATED, PANEL_ICON, PANEL_TITLE, PANEL_URL
from .permissions import check_capability
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
    if entry.data.get("calendar_url"):
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
    await hass.http.async_register_static_paths([
        StaticPathConfig("/family_organizer/family-organizer-panel.js", str(bundle), True)
    ])
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
        check_capability(user, resource, capability, stores["settings"].data, item)
        return user

    async def add_grocery(call: ServiceCall):
        user = await service_user(call, "groceries", "create")
        item = {
            "id": uuid4().hex,
            "name": call.data["name"],
            "quantity": call.data.get("quantity", 1),
            "checked": False,
            "category": call.data.get("category", "Other"),
            "list_id": call.data.get("list_id", "default"),
            "store": call.data.get("store", ""),
            "assignee_id": call.data.get("assignee_id"),
            "creator_id": user.id,
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
        await service_user(call, "chores", "complete", chore)
        chore.setdefault("completed", []).append(datetime.now().astimezone().isoformat())
        await stores["chores"].async_save()
        hass.bus.async_fire(EVENT_UPDATED, {
            "resource": "chores", "operation": "complete", "item": chore
        })

    async def sync_calendar(call: ServiceCall):
        await service_user(call, "calendar", "edit")
        for coordinator in hass.data[DOMAIN].get("coordinators", {}).values():
            await coordinator.async_request_refresh()

    hass.services.async_register(DOMAIN, "add_grocery", add_grocery)
    hass.services.async_register(DOMAIN, "complete_chore", complete_chore)
    hass.services.async_register(DOMAIN, "sync_calendar", sync_calendar)
