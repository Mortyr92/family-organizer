"""Namespaced websocket CRUD, permissions, and live subscriptions."""
from __future__ import annotations
from datetime import datetime, timezone

from uuid import uuid4

import voluptuous as vol
from homeassistant.components import websocket_api
from homeassistant.core import callback

from .const import DOMAIN, EVENT_UPDATED, STORES
from .logic import merge_grocery_item, recipe_items
from .permissions import (
    can_view,
    capabilities_for,
    check_capability,
    owns_item,
    person_for,
)

_RESOURCE = vol.In(STORES)
_COLLECTIONS = {
    "people": {"items"},
    "calendar": {"items", "sources"},
    "groceries": {"items", "lists", "meal_slots", "meal_plans"},
    "chores": {"items", "completions", "point_adjustments"},
    "recipes": {"items", "categories"},
    "settings": {"items"},
}


def _manager(hass):
    return hass.data[DOMAIN]["stores"]


def _settings(manager):
    return manager["settings"].data


def _people(manager):
    return manager["people"].data


def _person(manager, user):
    return person_for(user, _settings(manager), _people(manager))


def _collection(resource: str, requested: str | None) -> str | None:
    value = requested or "items"
    return value if value in _COLLECTIONS[resource] else None


def _validate_settings(values: dict) -> dict:
    allowed = {
        "theme", "sync_interval", "overview_position", "overview_collapsed",
        "week_start", "time_format", "default_calendar_view",
        "default_grocery_list_id", "meal_slots", "competition_default",
        "language", "stores",
    }
    result = {key: value for key, value in values.items() if key in allowed}
    enums = {
        "theme": {"auto", "light", "dark"},
        "overview_position": {"left", "right"},
        "week_start": {"monday", "sunday"},
        "time_format": {"12", "24"},
        "default_calendar_view": {"month", "week", "day"},
        "competition_default": {"week", "month"},
    }
    for key, choices in enums.items():
        if key in result and result[key] not in choices:
            raise vol.Invalid(f"Invalid {key}")
    if "sync_interval" in result:
        result["sync_interval"] = vol.All(vol.Coerce(int), vol.Range(min=5, max=1440))(
            result["sync_interval"]
        )
    for key in ("meal_slots", "stores"):
        if key in result:
            result[key] = [str(value).strip() for value in result[key] if str(value).strip()]
            if key == "meal_slots" and not result[key]:
                raise vol.Invalid("At least one meal slot is required")
    if "language" in result:
        result["language"] = str(result["language"])[:16]
    return result


def _public_payload(resource: str, data: dict, user, settings: dict) -> dict:
    """Filter private records. Config-entry credentials never enter stores."""
    if resource == "settings":
        # Calendar URLs and credentials live exclusively in config entries.
        allowed = {
            "theme", "sync_interval", "overview_position", "overview_collapsed",
            "week_start", "time_format", "default_calendar_view",
            "default_grocery_list_id", "meal_slots", "competition_default",
            "language", "stores",
        }
        result = {key: data.get(key) for key in allowed}
        result["current_user"] = {
            "person_id": (person_for(user, settings) or {}).get("id"),
            "capabilities": capabilities_for(user, settings),
        }
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


def _can_view(user, resource: str, settings: dict, item: dict, people=None) -> bool:
    if not can_view(user, settings, people):
        return False
    return item.get("shared", True) or owns_item(user, item, settings, people) or getattr(user, "is_admin", False)


@websocket_api.websocket_command({
    vol.Required("type"): f"{DOMAIN}/list",
    vol.Required("resource"): _RESOURCE,
})
@websocket_api.async_response
async def ws_list(hass, connection, msg):
    manager = _manager(hass)
    resource = msg["resource"]
    if not can_view(connection.user, _settings(manager), _people(manager)):
        raise vol.Invalid("User is not linked to a family person")
    connection.send_result(
        msg["id"],
        _public_payload(resource, manager[resource].data, connection.user, {
            **_settings(manager), "people": _people(manager).get("items", [])
        }),
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
    people = _people(manager)
    person = _person(manager, user)
    if not can_view(user, settings, people):
        raise vol.Invalid("User is not linked to a family person")
    capability = {
        "people": "manage_people",
        "calendar": "manage_calendar_all",
        "groceries": "manage_meal_plan" if collection in {"meal_slots", "meal_plans"} else "manage_groceries",
        "chores": "manage_chores",
        "recipes": "manage_recipes",
    }[resource]
    if operation == "create":
        if resource == "calendar" and collection == "items":
            caps = capabilities_for(user, settings, people)
            if not caps["manage_calendar_all"]:
                check_capability(user, resource, "manage_calendar_own", settings, people=people)
                assigned = msg["item"].get("person_ids", [])
                if assigned and any(value != person["id"] for value in assigned):
                    raise vol.Invalid("Cannot assign an event to another person")
        else:
            check_capability(user, resource, capability, settings, people=people)
        item = dict(msg["item"])
        item["id"] = item.get("id") or uuid4().hex
        item["creator_id"] = person["id"] if person else user.id
        if resource == "people":
            item["role"] = item.get("role") if item.get("role") in ("parent_admin", "parent", "child") else "child"
            item["user_id"] = item.get("user_id") or item.pop("ha_user_id", None)
            item["profile_picture"] = item.get("profile_picture") or item.pop("avatar_url", None)
            item["permissions"] = {
                key: value for key, value in item.get("permissions", {}).items()
                if key in capabilities_for(user, settings, people) and isinstance(value, bool)
            }
            if item.get("user_id") and any(
                existing.get("user_id") == item["user_id"] for existing in items
            ):
                raise vol.Invalid("Home Assistant user is already linked")
        if resource == "groceries" and collection == "items":
            item, _ = merge_grocery_item(items, item)
        else:
            items.append(item)
    else:
        index = next((i for i, item in enumerate(items) if item.get("id") == msg["item_id"]), None)
        if index is None:
            connection.send_error(msg["id"], "not_found", "Item not found")
            return
        item = items[index]
        if resource == "calendar" and collection == "items":
            caps = capabilities_for(user, settings, people)
            if not caps["manage_calendar_all"]:
                check_capability(
                    user, resource, "manage_calendar_own", settings, item, people
                )
        else:
            check_capability(user, resource, capability, settings, item, people)
        if operation == "update":
            patch = {key: value for key, value in msg["item"].items() if key not in {"id", "creator_id"}}
            if resource == "calendar" and collection == "items":
                assigned = patch.get("person_ids", item.get("person_ids", []))
                if not capabilities_for(user, settings, people)["manage_calendar_all"]:
                    if any(value != person["id"] for value in assigned):
                        raise vol.Invalid("Cannot assign an event to another person")
            if resource == "people":
                patch.pop("ha_user_id", None)
                if "role" in patch and patch["role"] not in ("parent_admin", "parent", "child"):
                    raise vol.Invalid("Invalid role")
                if "permissions" in patch:
                    patch["permissions"] = {
                        key: value for key, value in patch["permissions"].items()
                        if key in capabilities_for(user, settings, people) and isinstance(value, bool)
                    }
                if patch.get("user_id") and any(
                    existing is not item and existing.get("user_id") == patch["user_id"]
                    for existing in items
                ):
                    raise vol.Invalid("Home Assistant user is already linked")
            if resource == "recipes" and collection == "categories" and "parent_id" in patch:
                parent_id = patch["parent_id"]
                seen = {item["id"]}
                while parent_id:
                    if parent_id in seen:
                        raise vol.Invalid("A category cannot be moved below itself")
                    seen.add(parent_id)
                    parent = next((value for value in items if value.get("id") == parent_id), None)
                    if parent is None:
                        raise vol.Invalid("Parent category not found")
                    parent_id = parent.get("parent_id")
            item.update(patch)
        else:
            item = items.pop(index)
            if resource == "recipes" and collection == "categories":
                for child in items:
                    if child.get("parent_id") == item["id"]:
                        child["parent_id"] = item.get("parent_id")
                for recipe in manager["recipes"].data.get("items", []):
                    recipe["category_ids"] = [
                        value for value in recipe.get("category_ids", []) if value != item["id"]
                    ]
            if resource == "groceries" and collection == "lists":
                if not items:
                    items.insert(index, item)
                    raise vol.Invalid("At least one grocery list is required")
                manager["groceries"].data["items"] = [
                    value for value in manager["groceries"].data.get("items", [])
                    if value.get("list_id") != item["id"]
                ]
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
    vol.Optional("routes", default={}): dict,
})
@websocket_api.async_response
async def ws_recipe_to_groceries(hass, connection, msg):
    manager = _manager(hass)
    settings = _settings(manager)
    check_capability(
        connection.user, "groceries", "manage_groceries", settings,
        people=_people(manager),
    )
    recipe = next(
        (item for item in manager["recipes"].data["items"] if item.get("id") == msg["recipe_id"]),
        None,
    )
    if recipe is None or not _can_view(connection.user, "recipes", settings, recipe, _people(manager)):
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
    routes = msg.get("routes", {})
    selected_indices = msg.get("selected")
    original_indices = selected_indices if selected_indices is not None else list(
        range(len(recipe.get("ingredients", [])))
    )
    for generated_index, item in enumerate(recipe_items(
        recipe, msg["servings"], msg.get("selected"), msg["list_id"],
        (_person(manager, connection.user) or {}).get("id"),
    )):
        original_index = original_indices[generated_index]
        routed_list = routes.get(
            str(original_index), routes.get(original_index, item["list_id"])
        )
        if not any(value.get("id") == routed_list for value in manager["groceries"].data["lists"]):
            routed_list = msg["list_id"]
        item["list_id"] = routed_list
        item["id"] = uuid4().hex
        routed_destination = next(
            value for value in manager["groceries"].data["lists"] if value["id"] == routed_list
        )
        item["store"] = item.get("store") or routed_destination.get("store", "")
        merged, _ = merge_grocery_item(manager["groceries"].data["items"], item)
        added.append(merged)
    await manager["groceries"].async_save()
    hass.bus.async_fire(EVENT_UPDATED, {
        "resource": "groceries", "collection": "items", "operation": "recipe_add"
    })
    connection.send_result(msg["id"], added)


@websocket_api.websocket_command({
    vol.Required("type"): f"{DOMAIN}/complete_chore",
    vol.Required("chore_id"): str,
    vol.Optional("person_id"): str,
})
@websocket_api.async_response
async def ws_complete_chore(hass, connection, msg):
    manager = _manager(hass)
    chore = next(
        (value for value in manager["chores"].data["items"] if value.get("id") == msg["chore_id"]),
        None,
    )
    if chore is None:
        connection.send_error(msg["id"], "not_found", "Chore not found")
        return
    settings, people = _settings(manager), _people(manager)
    person = _person(manager, connection.user)
    caps = capabilities_for(connection.user, settings, people)
    completion_person = msg.get("person_id") or (person or {}).get("id")
    if not caps["complete_any_chore"]:
        check_capability(
            connection.user, "chores", "complete_own_chores", settings, chore, people
        )
        if completion_person != person["id"]:
            raise vol.Invalid("Cannot complete a chore for another person")
    completion = {
        "id": uuid4().hex,
        "chore_id": chore["id"],
        "person_id": completion_person,
        "completed_at": datetime.now(timezone.utc).isoformat(),
        "points": int(chore.get("points", 0)),
        "adjustment": False,
    }
    manager["chores"].data.setdefault("completions", []).append(completion)
    # Preserve the old shape for existing automations while history is canonical.
    chore.setdefault("completed", []).append(completion["completed_at"])
    if chore.get("rotate") and chore.get("assignee_ids"):
        chore["rotation_index"] = (int(chore.get("rotation_index", 0)) + 1) % len(chore["assignee_ids"])
    await manager["chores"].async_save()
    hass.bus.async_fire(EVENT_UPDATED, {
        "resource": "chores", "collection": "completions",
        "operation": "create", "item": completion,
    })
    connection.send_result(msg["id"], completion)


@websocket_api.websocket_command({
    vol.Required("type"): f"{DOMAIN}/adjust_points",
    vol.Required("person_id"): str,
    vol.Required("points"): vol.Coerce(int),
    vol.Optional("note", default=""): str,
})
@websocket_api.async_response
async def ws_adjust_points(hass, connection, msg):
    manager = _manager(hass)
    check_capability(
        connection.user, "chores", "manage_chores", _settings(manager),
        people=_people(manager),
    )
    adjustment = {
        "id": uuid4().hex, "chore_id": "", "person_id": msg["person_id"],
        "completed_at": datetime.now(timezone.utc).isoformat(),
        "points": msg["points"], "note": msg["note"], "adjustment": True,
    }
    manager["chores"].data.setdefault("completions", []).append(adjustment)
    await manager["chores"].async_save()
    hass.bus.async_fire(EVENT_UPDATED, {
        "resource": "chores", "collection": "completions",
        "operation": "adjust", "item": adjustment,
    })
    connection.send_result(msg["id"], adjustment)


@websocket_api.websocket_command({vol.Required("type"): f"{DOMAIN}/subscribe"})
@callback
def ws_subscribe(hass, connection, msg):
    manager = _manager(hass)
    if not can_view(connection.user, _settings(manager), _people(manager)):
        raise vol.Invalid("User is not linked to a family person")

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
    check_capability(
        connection.user, "settings", "manage_settings", _settings(manager),
        people=_people(manager),
    )
    manager["settings"].data.update(_validate_settings(msg["settings"]))
    await manager["settings"].async_save()
    hass.bus.async_fire(EVENT_UPDATED, {"resource": "settings", "operation": "update"})
    connection.send_result(
        msg["id"], _public_payload("settings", manager["settings"].data, connection.user, {
            **_settings(manager), "people": _people(manager).get("items", [])
        })
    )


def async_register(hass):
    for command in (
        ws_list, ws_create, ws_update, ws_delete, ws_recipe_to_groceries,
        ws_complete_chore, ws_adjust_points, ws_subscribe, ws_settings,
    ):
        websocket_api.async_register_command(hass, command)
