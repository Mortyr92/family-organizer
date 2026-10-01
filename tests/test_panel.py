"""Tests for panel static path registration."""
from __future__ import annotations

import ast
import asyncio
from pathlib import Path
import sys
import types

ROOT = Path(__file__).parents[1]
INTEGRATION = ROOT / "custom_components" / "family_organizer"
URL = "/family_organizer/family-organizer-panel.js"
BUNDLE = str(INTEGRATION / "panel" / "family-organizer-panel.js")


class PanelCustom:
    def __init__(self):
        self.calls = []

    async def async_register_panel(self, hass, **kwargs):
        self.calls.append(kwargs)


def _load_register_panel(panel_custom):
    source = (INTEGRATION / "__init__.py").read_text()
    module = ast.parse(source)
    func = next(
        node
        for node in module.body
        if isinstance(node, ast.AsyncFunctionDef)
        and node.name == "_async_register_panel"
    )
    namespace = {
        "Path": Path,
        "__file__": str(INTEGRATION / "__init__.py"),
        "panel_custom": panel_custom,
        "PANEL_URL": "/family-organizer",
        "PANEL_TITLE": "Family Organizer",
        "PANEL_ICON": "mdi:home-heart",
    }
    exec(compile(ast.Module(body=[func], type_ignores=[]), "__init__.py", "exec"), namespace)
    return namespace["_async_register_panel"]


def test_registers_static_path_with_async_api(monkeypatch) -> None:
    """Modern Home Assistant only offers async_register_static_paths."""

    class StaticPathConfig:
        def __init__(self, url_path, path, cache_headers=True):
            self.url_path = url_path
            self.path = path
            self.cache_headers = cache_headers

    http_module = types.ModuleType("homeassistant.components.http")
    http_module.StaticPathConfig = StaticPathConfig
    monkeypatch.setitem(
        sys.modules, "homeassistant.components", types.ModuleType("homeassistant.components")
    )
    monkeypatch.setitem(sys.modules, "homeassistant.components.http", http_module)

    registered = []

    class Http:
        async def async_register_static_paths(self, configs):
            registered.extend(configs)

    hass = types.SimpleNamespace(http=Http())
    panel_custom = PanelCustom()
    asyncio.run(_load_register_panel(panel_custom)(hass))

    assert [(c.url_path, c.path, c.cache_headers) for c in registered] == [
        (URL, BUNDLE, True)
    ]
    assert panel_custom.calls[0]["module_url"] == URL


def test_falls_back_to_sync_api_on_old_home_assistant(monkeypatch) -> None:
    """Home Assistant < 2024.7 has no StaticPathConfig."""
    monkeypatch.setitem(
        sys.modules, "homeassistant.components", types.ModuleType("homeassistant.components")
    )
    monkeypatch.setitem(
        sys.modules, "homeassistant.components.http", types.ModuleType("homeassistant.components.http")
    )

    registered = []

    class Http:
        def register_static_path(self, url_path, path, cache_headers=True):
            registered.append((url_path, path, cache_headers))

    hass = types.SimpleNamespace(http=Http())
    panel_custom = PanelCustom()
    asyncio.run(_load_register_panel(panel_custom)(hass))

    assert registered == [(URL, BUNDLE, True)]
    assert panel_custom.calls[0]["module_url"] == URL
