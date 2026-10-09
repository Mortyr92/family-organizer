from types import SimpleNamespace

import pytest

from custom_components.family_organizer.permissions import (
    CAPABILITIES,
    capabilities_for,
    check_capability,
    role_for,
)


def user(user_id="user", admin=False):
    return SimpleNamespace(id=user_id, is_admin=admin)


PEOPLE = {"items": [
    {"id": "p1", "user_id": "parent-user", "role": "parent", "permissions": {}},
    {"id": "c1", "user_id": "child-user", "role": "child", "permissions": {}},
]}


def test_exact_roles_capabilities_and_admin():
    assert role_for(user(admin=True), {}, PEOPLE) == "parent_admin"
    assert all(capabilities_for(user(admin=True), {}, PEOPLE).values())
    assert set(capabilities_for(user("child-user"), {}, PEOPLE)) == set(CAPABILITIES)
    assert capabilities_for(user("child-user"), {}, PEOPLE)["manage_calendar_own"]
    assert not capabilities_for(user("child-user"), {}, PEOPLE)["manage_calendar_all"]
    assert capabilities_for(user("child-user"), {}, PEOPLE)["manage_todos"]
    assert all(capabilities_for(user("parent-user"), {}, PEOPLE).values())
    # Any other authenticated Home Assistant account (not linked to a family
    # person) is treated as a parent; only Settings is gated by the PIN lock.
    assert all(capabilities_for(user("unknown"), {}, PEOPLE).values())
    pin_user = SimpleNamespace(id="tablet", is_admin=False, pin_person_id="p1")
    assert role_for(pin_user, {}, PEOPLE) == "parent"
    assert all(capabilities_for(pin_user, {}, PEOPLE).values())


def test_unlinked_allowed_and_person_override_authoritative():
    # Unlinked accounts now default to parent-level access rather than being denied.
    check_capability(user("unknown"), "groceries", "manage_groceries", {}, people=PEOPLE)
    people = {"items": [{**PEOPLE["items"][1], "permissions": {"manage_groceries": False}}]}
    with pytest.raises(Exception):
        check_capability(
            user("child-user"), "groceries", "manage_groceries", {}, people=people
        )


def test_own_calendar_and_chore_assignment():
    child = user("child-user")
    check_capability(
        child, "calendar", "manage_calendar_own", {},
        {"creator_id": "c1", "person_ids": ["c1"]}, PEOPLE,
    )
    with pytest.raises(Exception):
        check_capability(
            child, "calendar", "manage_calendar_own", {},
            {"creator_id": "p1", "person_ids": ["p1"]}, PEOPLE,
        )
    check_capability(
        child, "chores", "complete_own_chores", {},
        {"assignee_ids": ["c1"]}, PEOPLE,
    )
