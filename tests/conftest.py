"""Lightweight module stubs for pure unit tests."""
from pathlib import Path
import sys
import types

ROOT = Path(__file__).parents[1]
package = types.ModuleType("custom_components.family_organizer")
package.__path__ = [str(ROOT / "custom_components" / "family_organizer")]
sys.modules["custom_components.family_organizer"] = package

homeassistant = types.ModuleType("homeassistant")
helpers = types.ModuleType("homeassistant.helpers")
storage = types.ModuleType("homeassistant.helpers.storage")
exceptions = types.ModuleType("homeassistant.exceptions")


class Store:
    def __init__(self, *args, **kwargs):
        pass


class Unauthorized(Exception):
    def __init__(self, context=None):
        super().__init__("Unauthorized")


storage.Store = Store
exceptions.Unauthorized = Unauthorized
core = types.ModuleType("homeassistant.core")
core.HomeAssistant = object
core.callback = lambda func: func
event_helpers = types.ModuleType("homeassistant.helpers.event")
event_helpers.async_track_time_interval = lambda *args, **kwargs: (lambda: None)
sys.modules.setdefault("homeassistant", homeassistant)
sys.modules.setdefault("homeassistant.helpers", helpers)
sys.modules.setdefault("homeassistant.helpers.storage", storage)
sys.modules.setdefault("homeassistant.helpers.event", event_helpers)
sys.modules.setdefault("homeassistant.core", core)
sys.modules.setdefault("homeassistant.exceptions", exceptions)

