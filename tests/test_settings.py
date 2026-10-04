"""Settings validation for reminder/notification preferences (extracted via AST, no HA runtime)."""
import ast
from pathlib import Path

import pytest

from custom_components.family_organizer.const import DEFAULT_SETTINGS, SETTING_KEYS

ROOT = Path(__file__).parents[1]


def validate():
    vol = pytest.importorskip("voluptuous")
    source = (ROOT / "custom_components/family_organizer/websocket_api.py").read_text()
    module = ast.parse(source)
    function = next(n for n in module.body if isinstance(n, ast.FunctionDef) and n.name == "_validate_settings")
    namespace = {"vol": vol, "SETTING_KEYS": SETTING_KEYS}
    exec(compile(ast.Module(body=[function], type_ignores=[]), "websocket_api.py", "exec"), namespace)
    return namespace["_validate_settings"]


def test_defaults_cover_every_public_key():
    assert set(SETTING_KEYS) <= set(DEFAULT_SETTINGS)
    assert DEFAULT_SETTINGS["reminders_enabled"] is True
    assert DEFAULT_SETTINGS["default_reminder_minutes"] == 15


def test_reminder_settings_are_validated():
    vol = pytest.importorskip("voluptuous")
    result = validate()({
        "reminders_enabled": False, "default_reminder_minutes": "30",
        "notify_service": "mobile_app_phone", "daily_agenda_time": "07:30", "secret": "x",
    })
    assert result == {
        "reminders_enabled": False, "default_reminder_minutes": 30,
        "notify_service": "mobile_app_phone", "daily_agenda_time": "07:30",
    }
    with pytest.raises(vol.Invalid):
        validate()({"default_reminder_minutes": 99999})
    with pytest.raises(vol.Invalid):
        validate()({"daily_agenda_time": "7am"})
    with pytest.raises(vol.Invalid):
        validate()({"notify_service": "notify.bad name"})
