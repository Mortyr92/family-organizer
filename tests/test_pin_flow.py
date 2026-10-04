"""PIN hashing/verification and payload privacy helpers extracted from websocket_api."""
import ast
from pathlib import Path
from types import SimpleNamespace

import pytest

from custom_components.family_organizer.permissions import (
    can_view,
    capabilities_for,
    owns_item,
    person_for,
)

ROOT = Path(__file__).parents[1]


def _functions(*names):
    source = (ROOT / "custom_components/family_organizer/websocket_api.py").read_text()
    module = ast.parse(source)
    selected = [
        node for node in module.body
        if isinstance(node, ast.FunctionDef) and node.name in names
    ]
    namespace = {
        "hashlib": __import__("hashlib"),
        "hmac": __import__("hmac"),
        "secrets": __import__("secrets"),
        "person_for": person_for,
        "capabilities_for": capabilities_for,
        "can_view": can_view,
        "owns_item": owns_item,
        "SETTING_KEYS": (),
    }
    exec(compile(ast.Module(body=selected, type_ignores=[]), "websocket_api.py", "exec"), namespace)
    return [namespace[name] for name in names]


def test_pin_hash_roundtrip_and_mismatch():
    hash_pin, verify_pin = _functions("_hash_pin", "_verify_pin")
    digest = hash_pin("1234")
    assert "$" in digest
    assert verify_pin(digest, "1234")
    assert not verify_pin(digest, "4321")


def test_people_payload_hides_pin_hash():
    _can_view, _sanitize_item, public_payload = _functions("_can_view", "_sanitize_item", "_public_payload")
    user = SimpleNamespace(id="ha-parent", is_admin=False)
    settings = {
        "people": [{"id": "p1", "user_id": "ha-parent", "role": "parent", "permissions": {}}],
        "permissions": {},
    }
    data = {"items": [{"id": "p1", "name": "Alex", "pin_hash": "secret"}]}
    payload = public_payload("people", data, user, settings)
    assert payload["items"][0]["id"] == "p1"
    assert "pin_hash" not in payload["items"][0]
