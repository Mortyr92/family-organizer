"""Granular permissions tied to Home Assistant users."""
from __future__ import annotations

from homeassistant.exceptions import Unauthorized

from .const import PERMISSION_LEVELS

ROLE_CAPABILITIES = {
    "guest": frozenset({"view_shared"}),
    "child": frozenset({"view_shared", "create", "edit_own", "delete_own", "complete_own"}),
    "member": frozenset(
        {"view_shared", "create", "edit_own", "delete_own", "complete_own", "complete_shared"}
    ),
    "parent": frozenset(
        {"view_shared", "create", "edit", "delete", "complete", "assign", "manage_lists"}
    ),
    "admin": frozenset({"*"}),
}
# Minimum role per sensitive area/action. Item-level ownership is checked in
# addition to this table.
PERMISSION_MATRIX = {
    "settings": {"view": "guest", "admin": "admin"},
    "people": {"view": "guest", "create": "parent", "edit": "parent", "delete": "parent"},
    "calendar": {"view": "guest", "create": "child", "edit": "child", "delete": "child"},
    "groceries": {"view": "guest", "create": "child", "edit": "child", "delete": "child"},
    "chores": {"view": "guest", "create": "parent", "edit": "child", "delete": "parent", "complete": "child"},
    "recipes": {"view": "guest", "create": "member", "edit": "member", "delete": "member"},
}
_ROLE_LEVEL = {"guest": 0, "child": 1, "member": 2, "parent": 3, "admin": 4}


def permission_for(user, resource: str, settings: dict) -> str:
    if user and user.is_admin:
        return "admin"
    user_id = getattr(user, "id", None)
    grants = settings.get("permissions", {}).get(user_id, {})
    role = settings.get("roles", {}).get(user_id)
    if role in ("child", "member", "parent"):
        default = "edit"
    elif role == "admin":
        default = "admin"
    else:
        default = "view"
    if isinstance(grants, str):
        return grants
    return grants.get(resource, grants.get("*", default))


def check_permission(user, resource: str, required: str, settings: dict) -> None:
    actual = permission_for(user, resource, settings)
    if PERMISSION_LEVELS.get(actual, 0) < PERMISSION_LEVELS[required]:
        raise Unauthorized(context=None)


def role_for(user, settings: dict) -> str:
    """Return the configured role, preserving legacy permission grants."""
    if user and user.is_admin:
        return "admin"
    user_id = getattr(user, "id", None)
    explicit = settings.get("roles", {}).get(user_id)
    if explicit in ROLE_CAPABILITIES:
        return explicit
    grants = settings.get("permissions", {}).get(user_id, {})
    values = [grants] if isinstance(grants, str) else list(grants.values())
    if "admin" in values:
        return "admin"
    if "edit" in values:
        return "parent"
    level = permission_for(user, "*", settings)
    return {"admin": "admin", "edit": "parent"}.get(level, "guest")


def has_capability(user, capability: str, settings: dict, item: dict | None = None) -> bool:
    capabilities = ROLE_CAPABILITIES[role_for(user, settings)]
    if capability == "view" and "view_shared" in capabilities:
        return True
    if "*" in capabilities or capability in capabilities:
        return True
    user_id = getattr(user, "id", None)
    owner = item and item.get("creator_id")
    assignee = item and item.get("assignee_id")
    own = bool(user_id and user_id in (owner, assignee))
    return own and f"{capability}_own" in capabilities


def check_capability(
    user, resource: str, capability: str, settings: dict, item: dict | None = None
) -> None:
    """Enforce role capabilities plus per-area legacy access and visibility."""
    required = "view" if capability == "view" else "edit"
    check_permission(user, resource, required, settings)
    role = role_for(user, settings)
    minimum = PERMISSION_MATRIX.get(resource, {}).get(capability, "guest")
    if _ROLE_LEVEL[role] < _ROLE_LEVEL[minimum]:
        raise Unauthorized(context=None)
    if capability == "view" and item is not None:
        user_id = getattr(user, "id", None)
        if not item.get("shared", True) and user_id not in (
            item.get("creator_id"),
            item.get("assignee_id"),
        ) and not getattr(user, "is_admin", False):
            raise Unauthorized(context=None)
        return
    if not has_capability(user, capability, settings, item):
        raise Unauthorized(context=None)
