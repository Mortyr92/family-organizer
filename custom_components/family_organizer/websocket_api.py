"""Namespaced websocket CRUD, permissions, and live subscriptions."""
from __future__ import annotations

from uuid import uuid4

import voluptuous as vol
from homeassistant.components import websocket_api
from homeassistant.core import callback

from .const import DOMAIN, EVENT_UPDATED, STORES
from .logic import merge_grocery_item, recipe_items
from .permissions import check_capability, role_for

_RESOURCE = vol.In(STORES)
_COLLECTIONS = {
    "people": {"items"},
    "calendar": {"items"},
    "groceries": {"items", "lists", "meal_slots", "meal_plans"},
    "chores": {"items", "completions"},
    "recipes": {"items"},
    "settings": {"items"},
}


def _manager(hass):
    return hass.data[DOMAIN]["stores"]


def _settings(manager):
    return manager["settings"].data


def _collection(resource: str, requested: str | None) -> str | None:
    value = requested or "items"
    return value if value in _COLLECTIONS[resource] else None


def _public_payload(resource: str, data: dict, user, settings: dict) -> dict:
    """Filter private records. Config-entry credentials never enter stores."""
    if resource == "settings":
        result = {key: data.get(key) for key in ("theme", "sync_interval")}
        if getattr(user, "is_admin", False):
            result.update({key: data.get(key, {}) for key in ("permissions", "roles")})
        return result
    result = {}
    for key, value in data.items():
        if isinstance(value, list):
            result[key] = [
                item for item in value
                if not isinstance(item, dict)
                or _can_view(user, resource, settings, item)
            ]
        else:
            result[key] = value
    return result


def _can_view(user, resource: str, settings: dict, item: dict) -> bool:
    try:
        check_capability(user, resource, "view", settings, item)
        return True
    except Exception:
        return False


@websocket_api.websocket_command({
    vol.Required("type"): f"{DOMAIN}/list",
    vol.Required("resource"): _RESOURCE,
})
@websocket_api.async_response
async def ws_list(hass, connection, msg):
    manager = _manager(hass)
    resource = msg["resource"]
    check_capability(connection.user, resource, "view", _settings(manager))
    connection.send_result(
        msg["id"],
        _public_payload(resource, manager[resource].data, connection.user, _settings(manager)),
    )


async def _mutate(hass, connection, msg, operation):
    manager = _manager(hass)
    resource = msg["resource"]
    if resource == "settings":
        connection.send_error(msg["id"], "invalid_resource", "Use the settings command")
        return
    collection = _collection(resource, msg.get("collection"))
    if collection is None:
        connection.send_error(msg["id"], "invalid_collection", "Invalid collection")
        return
    # meal_plans is a migration alias; all new writes target meal_slots.
    if resource == "groceries" and collection == "meal_plans":
        collection = "meal_slots"
    items = manager[resource].data.setdefault(collection, [])
    user = connection.user
    settings = _settings(manager)
    if operation == "create":
        check_capability(user, resource, "create", settings)
        item = dict(msg["item"])
        item["id"] = item.get("id") or uuid4().hex
        item["creator_id"] = user.id
        if resource == "groceries" and collection == "items":
            item, _ = merge_grocery_item(items, item)
        else:
            items.append(item)
        if resource == "people" and item.get("ha_user_id") and role_for(user, settings) == "admin":
            manager["settings"].data.setdefault("roles", {})[item["ha_user_id"]] = item.get("role", "member")
            await manager["settings"].async_save()
    else:
        index = next((i for i, item in enumerate(items) if item.get("id") == msg["item_id"]), None)
        if index is None:
            connection.send_error(msg["id"], "not_found", "Item not found")
            return
        item = items[index]
        check_capability(user, resource, "delete" if operation == "delete" else "edit", settings, item)
        if operation == "update":
            patch = {key: value for key, value in msg["item"].items() if key not in {"id", "creator_id"}}
            item.update(patch)
            if resource == "people" and item.get("ha_user_id") and role_for(user, settings) == "admin":
                manager["settings"].data.setdefault("roles", {})[item["ha_user_id"]] = item.get("role", "member")
                await manager["settings"].async_save()
        else:
            item = items.pop(index)
    await manager[resource].async_save()
    hass.bus.async_fire(EVENT_UPDATED, {
        "resource": resource, "collection": collection, "operation": operation, "item": item
    })
    connection.send_result(msg["id"], item)


_CREATE = {
    vol.Required("type"): f"{DOMAIN}/create", vol.Required("resource"): _RESOURCE,
    vol.Required("item"): dict, vol.Optional("collection"): str,
}
_UPDATE = {
    vol.Required("type"): f"{DOMAIN}/update", vol.Required("resource"): _RESOURCE,
    vol.Required("item_id"): str, vol.Required("item"): dict, vol.Optional("collection"): str,
}
_DELETE = {
    vol.Required("type"): f"{DOMAIN}/delete", vol.Required("resource"): _RESOURCE,
    vol.Required("item_id"): str, vol.Optional("collection"): str,
}


@websocket_api.websocket_command(_CREATE)
@websocket_api.async_response
async def ws_create(hass, connection, msg):
    await _mutate(hass, connection, msg, "create")


@websocket_api.websocket_command(_UPDATE)
@websocket_api.async_response
async def ws_update(hass, connection, msg):
    await _mutate(hass, connection, msg, "update")


@websocket_api.websocket_command(_DELETE)
@websocket_api.async_response
async def ws_delete(hass, connection, msg):
    await _mutate(hass, connection, msg, "delete")


@websocket_api.websocket_command({
    vol.Required("type"): f"{DOMAIN}/recipe_to_groceries",
    vol.Required("recipe_id"): str,
    vol.Required("servings"): vol.Coerce(float),
    vol.Required("list_id"): str,
    vol.Optional("selected"): [vol.Coerce(int)],
})
@websocket_api.async_response
async def ws_recipe_to_groceries(hass, connection, msg):
    manager = _manager(hass)
    settings = _settings(manager)
    check_capability(connection.user, "groceries", "create", settings)
    recipe = next(
        (item for item in manager["recipes"].data["items"] if item.get("id") == msg["recipe_id"]),
        None,
    )
    if recipe is None or not _can_view(connection.user, "recipes", settings, recipe):
        connection.send_error(msg["id"], "not_found", "Recipe not found")
        return
    destination = next(
        (item for item in manager["groceries"].data["lists"] if item.get("id") == msg["list_id"]),
        None,
    )
    if destination is None:
        connection.send_error(msg["id"], "not_found", "Grocery list not found")
        return
    added = []
    for item in recipe_items(
        recipe, msg["servings"], msg.get("selected"), msg["list_id"], connection.user.id
    ):
        item["id"] = uuid4().hex
        item["store"] = item.get("store") or destination.get("store", "")
        merged, _ = merge_grocery_item(manager["groceries"].data["items"], item)
        added.append(merged)
    await manager["groceries"].async_save()
    hass.bus.async_fire(EVENT_UPDATED, {
        "resource": "groceries", "collection": "items", "operation": "recipe_add"
    })
    connection.send_result(msg["id"], added)


@websocket_api.websocket_command({vol.Required("type"): f"{DOMAIN}/subscribe"})
@callback
def ws_subscribe(hass, connection, msg):
    check_capability(connection.user, "*", "view", _settings(_manager(hass)))

    @callback
    def forward(event):
        connection.send_event(msg["id"], event.data)

    connection.subscriptions[msg["id"]] = hass.bus.async_listen(EVENT_UPDATED, forward)
    connection.send_result(msg["id"])


@websocket_api.websocket_command({
    vol.Required("type"): f"{DOMAIN}/settings", vol.Required("settings"): dict,
})
@websocket_api.async_response
async def ws_settings(hass, connection, msg):
    manager = _manager(hass)
    check_capability(connection.user, "settings", "admin", _settings(manager))
    allowed = {"theme", "permissions", "roles", "sync_interval"}
    manager["settings"].data.update({
        key: value for key, value in msg["settings"].items() if key in allowed
    })
    await manager["settings"].async_save()
    hass.bus.async_fire(EVENT_UPDATED, {"resource": "settings", "operation": "update"})
    connection.send_result(
        msg["id"], _public_payload("settings", manager["settings"].data, connection.user, _settings(manager))
    )


def async_register(hass):
    for command in (
        ws_list, ws_create, ws_update, ws_delete, ws_recipe_to_groceries,
        ws_subscribe, ws_settings,
    ):
        websocket_api.async_register_command(hass, command)
