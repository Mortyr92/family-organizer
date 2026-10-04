"""Role presets and authoritative per-person capability overrides."""
from __future__ import annotations

from typing import Any

from homeassistant.exceptions import Unauthorized

CAPABILITIES = (
    "manage_people",
    "manage_calendar_all",
    "manage_calendar_own",
    "manage_groceries",
    "manage_todos",
    "manage_meal_plan",
    "manage_chores",
    "complete_own_chores",
    "complete_any_chore",
    "manage_recipes",
    "manage_journal",
    "manage_settings",
    "manage_calendar_sync",
)
ROLES = ("parent_admin", "parent", "child")
ROLE_CAPABILITIES: dict[str, dict[str, bool]] = {
    "parent_admin": {capability: True for capability in CAPABILITIES},
    "parent": {
        capability: capability not in {"manage_people", "manage_settings", "manage_calendar_sync"}
        for capability in CAPABILITIES
    },
    "child": {
        capability: capability in {
            "manage_calendar_own", "manage_groceries", "manage_todos", "manage_meal_plan",
            "complete_own_chores", "manage_recipes", "manage_journal",
        }
        for capability in CAPABILITIES
    },
}


def _people(settings: dict, people: Any = None) -> list[dict]:
    value = people if people is not None else settings.get("people", [])
    if isinstance(value, dict):
        value = value.get("items", [])
    return value if isinstance(value, list) else []


def person_for(user, settings: dict, people: Any = None) -> dict | None:
    if not user:
        return None
    user_id = getattr(user, "id", None)
    return next(
        (
            person for person in _people(settings, people)
            if (person.get("user_id") or person.get("ha_user_id")) == user_id
        ),
        None,
    )


def role_for(user, settings: dict, people: Any = None) -> str | None:
    if user and getattr(user, "is_admin", False):
        return "parent_admin"
    person = person_for(user, settings, people)
    if person and person.get("role") in ROLES:
        return person["role"]
    return None


def capabilities_for(user, settings: dict, people: Any = None) -> dict[str, bool]:
    role = role_for(user, settings, people)
    if role is None:
        return {capability: False for capability in CAPABILITIES}
    result = dict(ROLE_CAPABILITIES[role])
    if getattr(user, "is_admin", False):
        return result
    person = person_for(user, settings, people)
    overrides = person.get("permissions", {}) if person else {}
    legacy = settings.get("permissions", {}).get(person.get("id"), {}) if person else {}
    if not legacy:
        legacy = settings.get("permissions", {}).get(getattr(user, "id", None), {})
    for source in (legacy, overrides):
        if isinstance(source, dict):
            for capability, enabled in source.items():
                if capability in result and isinstance(enabled, bool):
                    result[capability] = enabled
    return result


def _person_id(user, settings: dict, people: Any = None) -> str | None:
    person = person_for(user, settings, people)
    return person.get("id") if person else None


def owns_item(user, item: dict | None, settings: dict, people: Any = None) -> bool:
    if not item:
        return False
    person_id = _person_id(user, settings, people)
    user_id = getattr(user, "id", None)
    assigned = item.get("person_ids") or item.get("assignee_ids") or []
    return bool(
        person_id
        and (
            person_id in assigned
            or person_id == item.get("assignee_id")
            or person_id == item.get("person_id")
            or item.get("creator_id") in (person_id, user_id)
        )
    )


def check_capability(
    user,
    resource: str,
    capability: str,
    settings: dict,
    item: dict | None = None,
    people: Any = None,
) -> None:
    """Require an exact capability and, for own capabilities, item ownership."""
    if capability not in CAPABILITIES:
        raise Unauthorized(context=None)
    capabilities = capabilities_for(user, settings, people)
    if capabilities.get(capability):
        if capability.endswith("_own") or capability == "complete_own_chores":
            if item is not None and not owns_item(user, item, settings, people):
                raise Unauthorized(context=None)
        return
    raise Unauthorized(context=None)


def can_view(user, settings: dict, people: Any = None) -> bool:
    """Only linked users and Home Assistant administrators can open the panel."""
    return role_for(user, settings, people) is not None


# Compatibility API for older callers. New code must use exact capabilities.
def permission_for(user, resource: str, settings: dict, people: Any = None) -> str:
    if not can_view(user, settings, people):
        return "none"
    caps = capabilities_for(user, settings, people)
    mapping = {
        "people": "manage_people", "calendar": "manage_calendar_own",
        "groceries": "manage_groceries", "chores": "complete_own_chores",
        "todos": "manage_todos", "journal": "manage_journal",
        "recipes": "manage_recipes", "settings": "manage_settings",
    }
    return "admin" if role_for(user, settings, people) == "parent_admin" else (
        "edit" if caps.get(mapping.get(resource, "")) else "view"
    )


def check_permission(user, resource: str, required: str, settings: dict, people: Any = None) -> None:
    levels = {"none": 0, "view": 1, "edit": 2, "admin": 3}
    if levels[permission_for(user, resource, settings, people)] < levels[required]:
        raise Unauthorized(context=None)
