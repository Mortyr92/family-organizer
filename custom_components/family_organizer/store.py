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
            person.setdefault("pin_hash", None)
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
        if not result.get("categories"):
            result["categories"] = [
                {"id": "work", "name": "Work", "icon": "💼", "color": "#f59e0b"},
                {"id": "school", "name": "School", "icon": "🎒", "color": "#3b82f6"},
                {"id": "sport", "name": "Sport", "icon": "🏋", "color": "#10b981"},
                {"id": "family", "name": "Family", "icon": "👪", "color": "#ec4899"},
                {"id": "home", "name": "Home", "icon": "🏠", "color": "#8b5cf6"},
                {"id": "other", "name": "Other", "icon": "🗒", "color": "#64748b"},
            ]
    if name == "groceries":
        result.setdefault(
            "lists", [{"id": "default", "name": "Groceries", "list_type": "groceries", "store": "", "shared": True}]
        )
        for lst in result["lists"]:
            lst.setdefault("list_type", "groceries")
            lst.setdefault("deadline", None)
        for item in result["items"]:
            item.setdefault("list_id", "default")
            item.setdefault("deadline", None)
        result.setdefault("meal_plans", [])
        result.setdefault("meal_slots", result["meal_plans"])
    if name == "todos_legacy":
        result.setdefault("lists", [{"id": "default", "name": "To Do", "shared": True}])
        for todo in result["items"]:
            todo.setdefault("list_id", "default")
            todo.setdefault("done", False)
    if name == "contacts":
        for contact in result["items"]:
            contact.setdefault("phones", [])
            contact.setdefault("emails", [])
            contact.setdefault("group", "")
            contact.setdefault("shared", True)
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
        self.hass = hass
        self.stores = {name: FamilyStore(hass, name) for name in STORES}

    async def async_load(self) -> None:
        for store in self.stores.values():
            await store.async_load()
        await self._async_migrate_legacy_stores()

    async def _async_migrate_legacy_stores(self) -> None:
        """One-time migration of the retired todos/journal stores into groceries."""
        groceries = self.stores["groceries"].data
        migrated_marker = "_migrated_legacy_todos"
        if groceries.get(migrated_marker):
            return
        legacy_todos = VersionedStore(self.hass, "todos")
        legacy_data = await legacy_todos.async_load()
        if legacy_data:
            legacy_data = migrate_payload("todos_legacy", STORE_VERSION, legacy_data)
            existing_list_ids = {lst["id"] for lst in groceries.setdefault("lists", [])}
            for lst in legacy_data.get("lists", []):
                if lst["id"] in existing_list_ids:
                    lst = {**lst, "id": f"todo-{lst['id']}"}
                groceries["lists"].append({
                    "id": lst["id"], "name": lst.get("name", "To Do"), "list_type": "todo",
                    "store": "", "deadline": None, "shared": lst.get("shared", True),
                    "creator_id": lst.get("creator_id"),
                })
            list_id_map = {
                original.get("id"): migrated.get("id")
                for original, migrated in zip(legacy_data.get("lists", []), groceries["lists"][-len(legacy_data.get("lists", [])):])
            } if legacy_data.get("lists") else {}
            for todo in legacy_data.get("items", []):
                groceries["items"].append({
                    "id": todo["id"], "name": todo.get("title", ""), "quantity": 1, "unit": "",
                    "checked": bool(todo.get("done")), "category": "Other",
                    "notes": todo.get("notes", ""), "list_id": list_id_map.get(todo.get("list_id"), todo.get("list_id", "default")),
                    "store": "", "deadline": todo.get("due_date"),
                    "assignee_id": todo.get("assignee_id"), "creator_id": todo.get("creator_id"),
                    "shared": todo.get("shared", True),
                })
            await self.stores["groceries"].async_save()
        groceries[migrated_marker] = True
        await self.stores["groceries"].async_save()
        await legacy_todos.async_remove()

    def __getitem__(self, name: str) -> FamilyStore:
        return self.stores[name]
