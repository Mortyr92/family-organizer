"""Namespaced websocket CRUD, permissions, and live subscriptions."""
from __future__ import annotations
import asyncio
import hashlib
import hmac
import secrets
from datetime import datetime, timezone
from types import SimpleNamespace

from uuid import uuid4

import aiohttp
import voluptuous as vol
from homeassistant.components import websocket_api
from homeassistant.core import callback
from homeassistant.helpers.aiohttp_client import async_get_clientsession

from .const import DOMAIN, EVENT_UPDATED, SETTING_KEYS, STORES
from .logic import merge_grocery_item, recipe_items
from .recipe_import import recipe_from_html
from .permissions import (
    ROLE_CAPABILITIES,
    can_view,
    capabilities_for,
    check_capability,
    owns_item,
    person_for,
)

_RESOURCE = vol.In(STORES)
_COLLECTIONS = {
    "people": {"items"},
    "calendar": {"items", "sources", "categories"},
    "groceries": {"items", "lists", "meal_slots", "meal_plans"},
    "todos": {"items", "lists"},
    "chores": {"items", "completions", "point_adjustments"},
    "recipes": {"items", "categories"},
    "journal": {"items"},
    "contacts": {"items"},
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


# Verified PIN sessions per websocket connection; cleared when the connection closes.
_PIN_SESSIONS: dict[int, str] = {}


def _user(connection):
    """Effective user: the HA user, elevated to a family member after a verified PIN."""
    user = connection.user
    pin_person_id = _PIN_SESSIONS.get(id(connection))
    if not pin_person_id or user is None:
        return user
    return SimpleNamespace(
        id=user.id, is_admin=getattr(user, "is_admin", False), pin_person_id=pin_person_id
    )


def _collection(resource: str, requested: str | None) -> str | None:
    value = requested or "items"
    return value if value in _COLLECTIONS[resource] else None


def _ha_user_pictures(hass) -> dict[str, str]:
    """Map Home Assistant user IDs to the picture of their linked person entity."""
    result: dict[str, str] = {}
    for state in hass.states.async_all("person"):
        user_id = state.attributes.get("user_id")
        picture = state.attributes.get("entity_picture")
        if user_id and picture:
            result[user_id] = picture
    return result


def _sync_pictures(hass, people: list[dict]) -> bool:
    """Refresh profile pictures for members that follow their Home Assistant user."""
    pictures = _ha_user_pictures(hass)
    changed = False
    for person in people:
        if not person.get("sync_picture") or not person.get("user_id"):
            continue
        picture = pictures.get(person["user_id"])
        if picture and person.get("profile_picture") != picture:
            person["profile_picture"] = picture
            changed = True
    return changed


def _hash_pin(pin: str) -> str:
    salt = secrets.token_bytes(16)
    digest = hashlib.pbkdf2_hmac("sha256", pin.encode("utf-8"), salt, 120_000)
    return f"{salt.hex()}${digest.hex()}"


def _verify_pin(pin_hash: str, pin: str) -> bool:
    try:
        salt_hex, digest_hex = pin_hash.split("$", 1)
        salt = bytes.fromhex(salt_hex)
        expected = bytes.fromhex(digest_hex)
    except ValueError:
        return False
    actual = hashlib.pbkdf2_hmac("sha256", pin.encode("utf-8"), salt, 120_000)
    return hmac.compare_digest(actual, expected)


def _person_capabilities(person: dict) -> dict[str, bool]:
    role = person.get("role") if person.get("role") in ROLE_CAPABILITIES else "child"
    result = dict(ROLE_CAPABILITIES[role])
    overrides = person.get("permissions") or {}
    if isinstance(overrides, dict):
        for key, value in overrides.items():
            if key in result and isinstance(value, bool):
                result[key] = value
    return result


def _sanitize_item(resource: str, item: dict) -> dict:
    if resource == "people":
        result = {key: value for key, value in item.items() if key != "pin_hash"}
        result["has_pin"] = bool(item.get("pin_hash"))
        return result
    return item


def _validate_settings(values: dict) -> dict:
    result = {key: value for key, value in values.items() if key in SETTING_KEYS}
    enums = {
        "theme": {"auto", "light", "dark"},
        "overview_position": {"left", "right", "bottom"},
        "week_start": {"monday", "sunday"},
        "time_format": {"12", "24"},
        "default_calendar_view": {"list", "week", "month"},
        "calendar_list_mode": {"planned", "all"},
        "competition_default": {"week", "month"},
    }
    for key, choices in enums.items():
        if key in result and result[key] not in choices:
            raise vol.Invalid(f"Invalid {key}")
    if "sync_interval" in result:
        result["sync_interval"] = vol.All(vol.Coerce(int), vol.Range(min=5, max=1440))(
            result["sync_interval"]
        )
    if "default_reminder_minutes" in result:
        result["default_reminder_minutes"] = vol.All(vol.Coerce(int), vol.Range(min=0, max=10080))(
            result["default_reminder_minutes"]
        )
    if "reminders_enabled" in result:
        result["reminders_enabled"] = bool(result["reminders_enabled"])
    if "notify_service" in result:
        service = str(result["notify_service"] or "").strip()
        if service and not vol.Match(r"^(notify\.)?[a-z0-9_]+$")(service):
            raise vol.Invalid("Invalid notify service")
        result["notify_service"] = service.removeprefix("notify.")
    if "daily_agenda_time" in result:
        value = str(result["daily_agenda_time"] or "").strip()
        if value and not vol.Match(r"^([01]\d|2[0-3]):[0-5]\d$")(value):
            raise vol.Invalid("Invalid daily agenda time")
        result["daily_agenda_time"] = value
    if "floating_navigation" in result:
        result["floating_navigation"] = bool(result["floating_navigation"])
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
        result = {key: data.get(key) for key in SETTING_KEYS}
        result["current_user"] = {
            "person_id": (person_for(user, settings) or {}).get("id"),
            "capabilities": capabilities_for(user, settings),
        }
        return result
    result = {}
    for key, value in data.items():
        if isinstance(value, list):
            result[key] = [
                _sanitize_item(resource, item) for item in value
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
    if not can_view(_user(connection), _settings(manager), _people(manager)):
        raise vol.Invalid("User is not linked to a family person")
    if resource == "people" and _sync_pictures(hass, _people(manager).get("items", [])):
        await manager["people"].async_save()
    connection.send_result(
        msg["id"],
        _public_payload(resource, manager[resource].data, _user(connection), {
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
    user = _user(connection)
    settings = _settings(manager)
    people = _people(manager)
    person = _person(manager, user)
    if not can_view(user, settings, people):
        raise vol.Invalid("User is not linked to a family person")
    capability = {
        "people": "manage_people",
        "calendar": "manage_calendar_all",
        "groceries": "manage_meal_plan" if collection in {"meal_slots", "meal_plans"} else "manage_groceries",
        "todos": "manage_todos",
        "chores": "manage_chores",
        "recipes": "manage_recipes",
        "journal": "manage_journal",
        "contacts": "manage_contacts",
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
            item["sync_picture"] = bool(item.get("sync_picture")) and bool(item.get("user_id"))
            if item["sync_picture"]:
                item["profile_picture"] = _ha_user_pictures(hass).get(item["user_id"]) or item["profile_picture"]
            item["permissions"] = {
                key: value for key, value in item.get("permissions", {}).items()
                if key in capabilities_for(user, settings, people) and isinstance(value, bool)
            }
            pin = str(item.pop("pin", "") or "").strip()
            if pin:
                if not pin.isdigit() or len(pin) < 4 or len(pin) > 8:
                    raise vol.Invalid("PIN must be 4 to 8 digits")
                item["pin_hash"] = _hash_pin(pin)
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
                pin = str(patch.pop("pin", "") or "").strip()
                if pin:
                    if not pin.isdigit() or len(pin) < 4 or len(pin) > 8:
                        raise vol.Invalid("PIN must be 4 to 8 digits")
                    patch["pin_hash"] = _hash_pin(pin)
                if patch.get("clear_pin"):
                    patch["pin_hash"] = None
                patch.pop("clear_pin", None)
                if patch.get("user_id") and any(
                    existing is not item and existing.get("user_id") == patch["user_id"]
                    for existing in items
                ):
                    raise vol.Invalid("Home Assistant user is already linked")
                if "sync_picture" in patch or "user_id" in patch:
                    user_id = patch.get("user_id", item.get("user_id"))
                    patch["sync_picture"] = bool(patch.get("sync_picture", item.get("sync_picture"))) and bool(user_id)
                    if patch["sync_picture"]:
                        picture = _ha_user_pictures(hass).get(user_id)
                        if picture:
                            patch["profile_picture"] = picture
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
            if resource == "calendar" and collection == "categories":
                for event in manager["calendar"].data.get("items", []):
                    if event.get("category") == item["id"]:
                        event["category"] = None
            if resource == "groceries" and collection == "lists":
                if not items:
                    items.insert(index, item)
                    raise vol.Invalid("At least one grocery list is required")
                manager["groceries"].data["items"] = [
                    value for value in manager["groceries"].data.get("items", [])
                    if value.get("list_id") != item["id"]
                ]
            if resource == "todos" and collection == "lists":
                if not items:
                    items.insert(index, item)
                    raise vol.Invalid("At least one to-do list is required")
                manager["todos"].data["items"] = [
                    value for value in manager["todos"].data.get("items", [])
                    if value.get("list_id") != item["id"]
                ]
    await manager[resource].async_save()
    hass.bus.async_fire(EVENT_UPDATED, {
        "resource": resource, "collection": collection, "operation": operation, "item": item
    })
    connection.send_result(msg["id"], _sanitize_item(resource, item))


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
        _user(connection), "groceries", "manage_groceries", settings,
        people=_people(manager),
    )
    recipe = next(
        (item for item in manager["recipes"].data["items"] if item.get("id") == msg["recipe_id"]),
        None,
    )
    if recipe is None or not _can_view(_user(connection), "recipes", settings, recipe, _people(manager)):
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
        (_person(manager, _user(connection)) or {}).get("id"),
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
    person = _person(manager, _user(connection))
    caps = capabilities_for(_user(connection), settings, people)
    completion_person = msg.get("person_id") or (person or {}).get("id")
    if not caps["complete_any_chore"]:
        check_capability(
            _user(connection), "chores", "complete_own_chores", settings, chore, people
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
        _user(connection), "chores", "manage_chores", _settings(manager),
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
    if not can_view(_user(connection), _settings(manager), _people(manager)):
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
        _user(connection), "settings", "manage_settings", _settings(manager),
        people=_people(manager),
    )
    manager["settings"].data.update(_validate_settings(msg["settings"]))
    await manager["settings"].async_save()
    hass.bus.async_fire(EVENT_UPDATED, {"resource": "settings", "operation": "update"})
    connection.send_result(
        msg["id"], _public_payload("settings", manager["settings"].data, _user(connection), {
            **_settings(manager), "people": _people(manager).get("items", [])
        })
    )


@websocket_api.websocket_command({
    vol.Required("type"): f"{DOMAIN}/verify_pin",
    vol.Required("person_id"): str,
    vol.Required("pin"): str,
})
@websocket_api.async_response
async def ws_verify_pin(hass, connection, msg):
    manager = _manager(hass)
    settings = _settings(manager)
    people = _people(manager)
    if not can_view(_user(connection), settings, people):
        raise vol.Invalid("User is not linked to a family person")
    person = next((item for item in people.get("items", []) if item.get("id") == msg["person_id"]), None)
    if person is None:
        connection.send_error(msg["id"], "not_found", "Family member not found")
        return
    pin_hash = person.get("pin_hash")
    if not pin_hash:
        connection.send_error(msg["id"], "pin_not_set", "This family member has no PIN yet")
        return
    if not _verify_pin(pin_hash, msg["pin"]):
        connection.send_error(msg["id"], "invalid_pin", "Incorrect PIN")
        return
    key = id(connection)
    _PIN_SESSIONS[key] = person["id"]

    @callback
    def forget():
        _PIN_SESSIONS.pop(key, None)

    connection.subscriptions[msg["id"]] = forget
    connection.send_result(msg["id"], {
        "person_id": person["id"],
        "name": person.get("name", ""),
        "role": person.get("role", "child"),
        "capabilities": _person_capabilities(person),
    })


@websocket_api.websocket_command({
    vol.Required("type"): f"{DOMAIN}/import_recipe",
    vol.Required("url"): vol.All(str, vol.Match(r"^https?://")),
})
@websocket_api.async_response
async def ws_import_recipe(hass, connection, msg):
    manager = _manager(hass)
    check_capability(
        _user(connection), "recipes", "manage_recipes", _settings(manager),
        people=_people(manager),
    )
    try:
        async with asyncio.timeout(20):
            response = await async_get_clientsession(hass).get(
                msg["url"], headers={"User-Agent": "Mozilla/5.0 (compatible; FamilyOrganizer/1.0)"}
            )
            response.raise_for_status()
            body = await response.text(errors="replace")
    except (asyncio.TimeoutError, aiohttp.ClientError) as err:
        connection.send_error(msg["id"], "fetch_failed", f"Could not download the page: {err}")
        return
    recipe = recipe_from_html(body, msg["url"])
    if recipe is None:
        connection.send_error(
            msg["id"], "no_recipe", "No recipe data was found on that page. Try copying it in manually."
        )
        return
    connection.send_result(msg["id"], recipe)


@websocket_api.websocket_command({vol.Required("type"): f"{DOMAIN}/ha_users"})
@websocket_api.async_response
async def ws_ha_users(hass, connection, msg):
    """List Home Assistant users that can be copied into a family member."""
    manager = _manager(hass)
    check_capability(
        _user(connection), "people", "manage_people", _settings(manager),
        people=_people(manager),
    )
    linked = {
        person.get("user_id"): person.get("id")
        for person in _people(manager).get("items", []) if person.get("user_id")
    }
    pictures = _ha_user_pictures(hass)
    users = []
    for user in await hass.auth.async_get_users():
        if user.system_generated or not user.is_active:
            continue
        users.append({
            "id": user.id,
            "name": user.name or "",
            "picture": pictures.get(user.id),
            "person_id": linked.get(user.id),
        })
    users.sort(key=lambda entry: entry["name"].lower())
    connection.send_result(msg["id"], users)


def async_register(hass):
    for command in (
        ws_list, ws_create, ws_update, ws_delete, ws_recipe_to_groceries,
        ws_complete_chore, ws_adjust_points, ws_subscribe, ws_settings,
        ws_verify_pin, ws_import_recipe, ws_ha_users,
    ):
        websocket_api.async_register_command(hass, command)
