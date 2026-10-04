"""Panel registration compatibility and upgrade cache regressions."""
from __future__ import annotations

import ast
import asyncio
import json
from pathlib import Path
import sys
import types

import pytest

ROOT = Path(__file__).parents[1]
INTEGRATION = ROOT / "custom_components" / "family_organizer"
VERSION = json.loads((INTEGRATION / "manifest.json").read_text())["version"]
URL = f"/family_organizer/{VERSION}/family-organizer-panel.js"
BUNDLE = str(INTEGRATION / "panel" / "family-organizer-panel.js")


def load_function(name, **namespace):
    """Exercise the actual function without importing unrelated HA services."""
    module = ast.parse((INTEGRATION / "__init__.py").read_text())
    func = next(node for node in module.body if isinstance(node, ast.AsyncFunctionDef) and node.name == name)
    namespace.update(Path=Path, json=json, DOMAIN="family_organizer", __file__=str(INTEGRATION / "__init__.py"))
    exec(compile(ast.Module(body=[func], type_ignores=[]), "__init__.py", "exec"), namespace)
    return namespace[name]


class PanelCustom:
    def __init__(self):
        self.calls = []

    async def async_register_panel(self, hass, **kwargs):
        self.calls.append(kwargs)


class Hass:
    def __init__(self, http):
        self.http = http
        self.data = {}

    async def async_add_executor_job(self, func):
        return func()


@pytest.mark.parametrize("modern", [True, False])
def test_registration_compatibility_and_reload(monkeypatch, modern):
    class StaticPathConfig:
        def __init__(self, url_path, path, cache_headers):
            self.url_path, self.path, self.cache_headers = url_path, path, cache_headers

    module = types.ModuleType("homeassistant.components.http")
    if modern:
        module.StaticPathConfig = StaticPathConfig
    monkeypatch.setitem(sys.modules, "homeassistant.components", types.ModuleType("homeassistant.components"))
    monkeypatch.setitem(sys.modules, "homeassistant.components.http", module)
    registered = []

    class ModernHttp:
        async def async_register_static_paths(self, configs):
            registered.extend((c.url_path, c.path, c.cache_headers) for c in configs)

    class LegacyHttp:
        def register_static_path(self, url, path, cache):
            registered.append((url, path, cache))

    hass = Hass(ModernHttp() if modern else LegacyHttp())
    panel = PanelCustom()
    register = load_function(
        "_async_register_panel", panel_custom=panel, PANEL_URL="/family-organizer",
        PANEL_TITLE="Family Organizer", PANEL_ICON="mdi:home-heart",
    )
    asyncio.run(register(hass))
    asyncio.run(register(hass))
    assert registered == [(URL, BUNDLE, True)]
    assert len(panel.calls) == 1
    assert panel.calls[0]["module_url"] == URL
    assert panel.calls[0]["frontend_url_path"] == "family-organizer"
    assert panel.calls[0]["require_admin"] is False
    assert "/0.1.0/" not in URL


def test_modern_registration_errors_are_not_hidden(monkeypatch):
    module = types.ModuleType("homeassistant.components.http")
    module.StaticPathConfig = lambda *args: args
    monkeypatch.setitem(sys.modules, "homeassistant.components.http", module)

    class Http:
        async def async_register_static_paths(self, configs):
            raise RuntimeError("registration failed")

    hass = Hass(Http())
    register = load_function("_async_register_panel")
    with pytest.raises(RuntimeError, match="registration failed"):
        asyncio.run(register(hass))
    assert not hass.data["family_organizer"].get("panel_registered")


def test_unload_preserves_shared_stores_and_panel_on_reload():
    async def unload(entry, platforms):
        return True

    stores = object()
    hass = types.SimpleNamespace(
        data={"family_organizer": {"stores": stores, "panel_registered": True, "coordinators": {"entry": object()}}},
        config_entries=types.SimpleNamespace(async_unload_platforms=unload),
    )
    result = asyncio.run(load_function("async_unload_entry", PLATFORMS=[])(hass, types.SimpleNamespace(entry_id="entry")))
    assert result is True
    assert hass.data["family_organizer"]["stores"] is stores
    assert hass.data["family_organizer"]["panel_registered"]
    assert hass.data["family_organizer"]["coordinators"] == {}
