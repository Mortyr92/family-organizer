"""Namespaced websocket CRUD and subscriptions."""
from __future__ import annotations

import voluptuous as vol

from homeassistant.components import websocket_api
from homeassistant.core import callback

from .const import DOMAIN, STORES
from .permissions import check_permission

_RESOURCE = vol.In(STORES)


def _manager(hass):
    return hass.data[DOMAIN]["stores"]


def _settings(manager):
    return manager["settings"].data


@websocket_api.websocket_command({vol.Required("type"): f"{DOMAIN}/list", vol.Required("resource"): _RESOURCE})
@websocket_api.async_response
async def ws_list(hass, connection, msg):
    manager = _manager(hass)
    check_permission(connection.user, msg["resource"], "view", _settings(manager))
    connection.send_result(msg["id"], manager[msg["resource"]].data)


async def _mutate(hass, connection, msg, operation):
    manager = _manager(hass)
    resource = msg["resource"]
    required = "admin" if resource == "settings" else "edit"
    check_permission(connection.user, resource, required, _settings(manager))
    collection = msg.get("collection", "items")
    if collection not in ("items", "meal_plans") or (collection == "meal_plans" and resource != "groceries"):
        connection.send_error(msg["id"], "invalid_collection", "Invalid collection")
        return
    items = manager[resource].data[collection]
    if operation == "create":
        item = dict(msg["item"])
        items.append(item)
    else:
        index = next((i for i, item in enumerate(items) if item.get("id") == msg["item_id"]), None)
        if index is None:
            connection.send_error(msg["id"], "not_found", "Item not found")
            return
        if operation == "update":
            items[index].update(msg["item"])
            item = items[index]
        else:
            item = items.pop(index)
    await manager[resource].async_save()
    hass.bus.async_fire(f"{DOMAIN}_updated", {"resource": resource, "operation": operation, "item": item})
    connection.send_result(msg["id"], item)


@websocket_api.websocket_command({
    vol.Required("type"): f"{DOMAIN}/create",
    vol.Required("resource"): _RESOURCE,
    vol.Required("item"): dict,
    vol.Optional("collection"): str,
})
@websocket_api.async_response
async def ws_create(hass, connection, msg):
    await _mutate(hass, connection, msg, "create")


@websocket_api.websocket_command({
    vol.Required("type"): f"{DOMAIN}/update",
    vol.Required("resource"): _RESOURCE,
    vol.Required("item_id"): str,
    vol.Required("item"): dict,
    vol.Optional("collection"): str,
})
@websocket_api.async_response
async def ws_update(hass, connection, msg):
    await _mutate(hass, connection, msg, "update")


@websocket_api.websocket_command({
    vol.Required("type"): f"{DOMAIN}/delete",
    vol.Required("resource"): _RESOURCE,
    vol.Required("item_id"): str,
    vol.Optional("collection"): str,
})
@websocket_api.async_response
async def ws_delete(hass, connection, msg):
    await _mutate(hass, connection, msg, "delete")


@websocket_api.websocket_command({vol.Required("type"): f"{DOMAIN}/subscribe"})
@callback
def ws_subscribe(hass, connection, msg):
    check_permission(connection.user, "*", "view", _settings(_manager(hass)))

    @callback
    def forward(event):
        connection.send_event(msg["id"], event.data)

    connection.subscriptions[msg["id"]] = hass.bus.async_listen(f"{DOMAIN}_updated", forward)
    connection.send_result(msg["id"])


@websocket_api.websocket_command({
    vol.Required("type"): f"{DOMAIN}/settings",
    vol.Required("settings"): dict,
})
@websocket_api.async_response
async def ws_settings(hass, connection, msg):
    manager = _manager(hass)
    check_permission(connection.user, "settings", "admin", _settings(manager))
    allowed = {"theme", "permissions", "sync_interval"}
    manager["settings"].data.update({key: value for key, value in msg["settings"].items() if key in allowed})
    await manager["settings"].async_save()
    hass.bus.async_fire(f"{DOMAIN}_updated", {"resource": "settings", "operation": "update"})
    connection.send_result(msg["id"], manager["settings"].data)


def async_register(hass):
    for command in (ws_list, ws_create, ws_update, ws_delete, ws_subscribe, ws_settings):
        websocket_api.async_register_command(hass, command)
