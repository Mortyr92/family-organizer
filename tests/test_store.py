from custom_components.family_organizer.store import migrate_payload


def test_migrates_legacy_list_and_defaults():
    assert migrate_payload("people", 1, [{"id": "one"}]) == {"items": [{"id": "one"}]}
    groceries = migrate_payload("groceries", 1, None)
    assert groceries == {"items": [], "meal_plans": []}


def test_settings_migration_preserves_values():
    settings = migrate_payload("settings", 1, {"theme": "dark"})
    assert settings["theme"] == "dark"
    assert settings["sync_interval"] == 30
    assert settings["permissions"] == {}

