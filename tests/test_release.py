"""Release metadata and non-destructive upgrade invariants."""
import json
from pathlib import Path
from zipfile import ZipFile

from custom_components.family_organizer.const import DOMAIN, STORE_VERSION
from custom_components.family_organizer.store import migrate_payload

ROOT = Path(__file__).parents[1]


def test_release_versions_and_hacs_bundle():
    manifest = json.loads((ROOT / "custom_components/family_organizer/manifest.json").read_text())
    package = json.loads((ROOT / "frontend/package.json").read_text())
    lock = json.loads((ROOT / "frontend/package-lock.json").read_text())
    assert manifest["version"] == package["version"] == lock["version"] == lock["packages"][""]["version"]
    hacs = json.loads((ROOT / "hacs.json").read_text())
    assert hacs["zip_release"] and hacs["filename"] == "family_organizer.zip"
    assert manifest["domain"] == DOMAIN == "family_organizer"
    assert STORE_VERSION == 5


def test_original_settings_and_family_records_survive_upgrade():
    settings = {
        "theme": "dark", "week_start": "sunday", "default_calendar_view": "week",
        "language": "de", "time_format": "12", "default_grocery_list_id": "custom",
        "overview_position": "left", "overview_collapsed": True,
        "roles": {"existing-user": "parent"},
    }
    upgraded = migrate_payload("settings", STORE_VERSION, settings)
    for key, value in settings.items():
        assert upgraded[key] == value
    for feature in ("people", "calendar", "groceries", "chores", "recipes"):
        record = {"id": "existing-id", "name": "Preserved", "notes": "Family data"}
        result = migrate_payload(feature, STORE_VERSION, {"items": [record]})
        for key, value in record.items():
            assert result["items"][0][key] == value


def test_release_zip_layout(tmp_path):
    integration = ROOT / "custom_components/family_organizer"
    archive = tmp_path / "family_organizer.zip"
    with ZipFile(archive, "w") as zipped:
        for path in integration.rglob("*"):
            if path.is_file() and "__pycache__" not in path.parts and path.suffix != ".pyc":
                zipped.write(path, path.relative_to(integration))
    with ZipFile(archive) as zipped:
        assert "panel/family-organizer-panel.js" in zipped.namelist()
        assert "manifest.json" in zipped.namelist()
        assert "__init__.py" in zipped.namelist()
        assert zipped.getinfo("panel/family-organizer-panel.js").file_size > 0
        ["version"] == "0.6.3"
