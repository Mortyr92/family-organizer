"""Versioned per-feature stores."""
from __future__ import annotations

from copy import deepcopy
from typing import Any

from homeassistant.helpers.storage import Store

from .const import DEFAULT_SETTINGS, DOMAIN, STORE_VERSION, STORES


def migrate_payload(name: str, version: int, data: Any) -> dict[str, Any]:
    """Migrate persisted payloads to the current shape."""
    if data is None:
        data = {}
    if version <= 1 and isinstance(data, list):
        data = {"items": data}
    if not isinstance(data, dict):
        data = {}
    result = deepcopy(data)
    result.setdefault("items", [])
    if name == "people":
        for person in result["items"]:
            person.setdefault("user_id", person.pop("ha_user_id", None))
            person.setdefault("profile_picture", person.pop("avatar_url", None))
            person.setdefault("permissions", {})
            role = person.get("role")
            person["role"] = {
                "admin": "parent_admin", "member": "parent", "guest": "child"
            }.get(role, role if role in ("parent_admin", "parent", "child") else "child")
            if not person.get("initials"):
                person["initials"] = "".join(
                    part[0] for part in person.get("name", "").split() if part
                )[:2].upper()
    if name == "calendar":
        result.setdefault("sources", [])
    if name == "groceries":
        result.setdefault("lists", [{"id": "default", "name": "Groceries", "store": "", "shared": True}])
        for item in result["items"]:
            item.setdefault("list_id", "default")
        result.setdefault("meal_plans", [])
        result.setdefault("meal_slots", result["meal_plans"])
    if name == "chores":
        result.setdefault("completions", [])
        result.setdefault("point_adjustments", [])
        for chore in result["items"]:
            if "assignee_ids" not in chore:
                chore["assignee_ids"] = [chore["assignee_id"]] if chore.get("assignee_id") else []
    if name == "recipes":
        result.setdefault("categories", [])
        for recipe in result["items"]:
            recipe.setdefault("category_ids", [recipe["category"]] if recipe.get("category") else [])
            recipe.setdefault("tags", [])
            recipe.setdefault("steps", recipe.get("instructions", []))
    if name == "settings":
        result = {**DEFAULT_SETTINGS, **result}
        result.setdefault("items", [])
    return result


class VersionedStore(Store):
    def __init__(self, hass, name: str) -> None:
        self.name = name
        super().__init__(hass, STORE_VERSION, f"{DOMAIN}.{name}", minor_version=1)

    async def _async_migrate_func(self, old_major_version, old_minor_version, old_data):
        return migrate_payload(self.name, int(old_major_version), old_data)


class FamilyStore:
    def __init__(self, hass, name: str) -> None:
        if name not in STORES:
            raise ValueError(f"Unknown store: {name}")
        self.name = name
        self._store = VersionedStore(hass, name)
        self.data: dict[str, Any] = {}

    async def async_load(self) -> dict[str, Any]:
        loaded = await self._store.async_load()
        self.data = migrate_payload(self.name, STORE_VERSION, loaded)
        return self.data

    async def async_save(self) -> None:
        await self._store.async_save(self.data)


class StoreManager:
    def __init__(self, hass) -> None:
        self.stores = {name: FamilyStore(hass, name) for name in STORES}

    async def async_load(self) -> None:
        for store in self.stores.values():
            await store.async_load()

    def __getitem__(self, name: str) -> FamilyStore:
        return self.stores[name]
