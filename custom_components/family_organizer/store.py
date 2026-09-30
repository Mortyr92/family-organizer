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
    if name == "groceries":
        result.setdefault("meal_plans", [])
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
