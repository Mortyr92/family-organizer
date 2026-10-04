"""Frontend permission context uses authoritative server capability decisions."""
import ast
from pathlib import Path
from types import SimpleNamespace

from custom_components.family_organizer.const import SETTING_KEYS
from custom_components.family_organizer.permissions import capabilities_for, person_for

ROOT = Path(__file__).parents[1]


def settings_payload(user, settings):
    source = (ROOT / "custom_components/family_organizer/websocket_api.py").read_text()
    module = ast.parse(source)
    function = next(node for node in module.body if isinstance(node, ast.FunctionDef) and node.name == "_public_payload")
    namespace = {"capabilities_for": capabilities_for, "person_for": person_for, "SETTING_KEYS": SETTING_KEYS}
    exec(compile(ast.Module(body=[function], type_ignores=[]), "websocket_api.py", "exec"), namespace)
    return namespace["_public_payload"]("settings", settings, user, settings)


def test_context_honors_legacy_and_person_overrides_without_exposing_private_settings():
    user = SimpleNamespace(id="ha-child", is_admin=False)
    settings = {
        "theme": "auto",
        "people": [{"id": "child", "user_id": user.id, "role": "child", "permissions": {"manage_recipes": False}}],
        "permissions": {"child": {"manage_groceries": False, "manage_settings": True}},
        "password": "private-setting-not-returned",
    }
    payload = settings_payload(user, settings)
    context = payload["current_user"]
    assert context["person_id"] == "child"
    assert context["capabilities"] == capabilities_for(user, settings)
    assert context["capabilities"]["manage_settings"]
    assert not context["capabilities"]["manage_groceries"]
    assert not context["capabilities"]["manage_recipes"]
    assert "password" not in payload and "permissions" not in payload and "people" not in payload


def test_admin_and_unlinked_context():
    assert all(settings_payload(SimpleNamespace(id="admin", is_admin=True), {})["current_user"]["capabilities"].values())
    context = settings_payload(SimpleNamespace(id="unlinked", is_admin=False), {})["current_user"]
    assert context["person_id"] is None
    assert not any(context["capabilities"].values())
