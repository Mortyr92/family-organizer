from custom_components.family_organizer.store import migrate_payload


def test_migrates_legacy_list_and_defaults():
    people = migrate_payload("people", 1, [
        {"id": "one", "name": "Ada Lovelace", "ha_user_id": "ha", "role": "member"}
    ])
    assert people["items"][0]["user_id"] == "ha"
    assert people["items"][0]["initials"] == "AL"
    assert people["items"][0]["role"] == "parent"
    groceries = migrate_payload("groceries", 1, None)
    assert groceries["items"] == []
    assert groceries["meal_plans"] == groceries["meal_slots"] == []
    assert groceries["lists"][0]["id"] == "default"


def test_settings_migration_preserves_values():
    settings = migrate_payload("settings", 1, {"theme": "dark"})
    assert settings["theme"] == "dark"
    assert settings["sync_interval"] == 30
    assert settings["permissions"] == {}
    assert settings["meal_slots"] == ["breakfast", "lunch", "dinner"]
