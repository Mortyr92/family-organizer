"""Tests for integration metadata and brand assets."""
from __future__ import annotations

import json
from pathlib import Path
import struct


ROOT = Path(__file__).parents[1]
INTEGRATION = ROOT / "custom_components" / "family_organizer"


def test_manifest_hacs_and_hassfest_metadata() -> None:
    """Test metadata required by HACS and hassfest."""
    manifest = json.loads((INTEGRATION / "manifest.json").read_text())

    assert manifest["issue_tracker"] == (
        "https://github.com/Mortyr92/family-organizer/issues"
    )
    assert manifest["requirements"] == ["caldav>=3.3.0a1", "icalendar>=6.3.1"]


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
