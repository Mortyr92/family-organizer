"""Tests for integration metadata and brand assets."""
from __future__ import annotations

import ast
import json
from pathlib import Path
import struct


ROOT = Path(__file__).parents[1]
INTEGRATION = ROOT / "custom_components" / "family_organizer"


def test_manifest_hacs_and_hassfest_metadata() -> None:
    """Test metadata required by HACS and hassfest."""
    manifest = json.loads((INTEGRATION / "manifest.json").read_text())

    assert list(manifest) == [
        "domain",
        "name",
        *sorted(set(manifest) - {"domain", "name"}),
    ]
    assert manifest["domain"] == "family_organizer"
    assert manifest["config_flow"] is True
    assert manifest["documentation"] == (
        "https://github.com/Mortyr92/family-organizer"
    )
    assert manifest["issue_tracker"] == (
        "https://github.com/Mortyr92/family-organizer/issues"
    )
    assert manifest["requirements"] == ["caldav>=3.3.0a1", "icalendar>=6.3.1"]


def test_config_entry_only_schema_is_declared() -> None:
    """Ensure YAML configuration is not accepted for this config-flow integration."""
    module = ast.parse((INTEGRATION / "__init__.py").read_text())
    assignment = next(
        node
        for node in module.body
        if isinstance(node, ast.Assign)
        and any(
            isinstance(target, ast.Name) and target.id == "CONFIG_SCHEMA"
            for target in node.targets
        )
    )
    schema_call = assignment.value

    assert isinstance(schema_call, ast.Call)
    assert isinstance(schema_call.func, ast.Attribute)
    assert schema_call.func.attr == "config_entry_only_config_schema"
    assert len(schema_call.args) == 1
    assert isinstance(schema_call.args[0], ast.Name)
    assert schema_call.args[0].id == "DOMAIN"


def test_brand_asset_dimensions() -> None:
    """Test that brand assets have the expected PNG dimensions."""
    expected = {
        "icon.png": (256, 256),
        "icon@2x.png": (512, 512),
        "logo.png": (256, 128),
        "logo@2x.png": (512, 256),
    }

    for filename, dimensions in expected.items():
        data = (INTEGRATION / "brand" / filename).read_bytes()
        assert data[:8] == b"\x89PNG\r\n\x1a\n"
        assert struct.unpack(">II", data[16:24]) == dimensions
