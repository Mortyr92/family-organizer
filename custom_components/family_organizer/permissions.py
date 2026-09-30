"""Granular permissions tied to Home Assistant users."""
from __future__ import annotations

from homeassistant.exceptions import Unauthorized

from .const import PERMISSION_LEVELS


def permission_for(user, resource: str, settings: dict) -> str:
    if user and user.is_admin:
        return "admin"
    user_id = getattr(user, "id", None)
    grants = settings.get("permissions", {}).get(user_id, {})
    return grants.get(resource, grants.get("*", "view"))


def check_permission(user, resource: str, required: str, settings: dict) -> None:
    actual = permission_for(user, resource, settings)
    if PERMISSION_LEVELS.get(actual, 0) < PERMISSION_LEVELS[required]:
        raise Unauthorized(context=None)

