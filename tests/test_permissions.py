from types import SimpleNamespace

import pytest

from custom_components.family_organizer.permissions import (
    check_capability,
    check_permission,
    permission_for,
)


def user(user_id="user", admin=False):
    return SimpleNamespace(id=user_id, is_admin=admin)


def test_admin_always_has_admin_access():
    assert permission_for(user(admin=True), "chores", {}) == "admin"


def test_granular_and_wildcard_permissions():
    settings = {"permissions": {"user": {"*": "view", "groceries": "edit"}}}
    check_permission(user(), "groceries", "edit", settings)
    with pytest.raises(Exception):
        check_permission(user(), "chores", "edit", settings)


def test_role_matrix_and_ownership():
    settings = {"roles": {"kid": "child"}, "permissions": {}}
    kid = user("kid")
    check_capability(kid, "groceries", "create", settings)
    check_capability(kid, "groceries", "edit", settings, {"creator_id": "kid"})
    with pytest.raises(Exception):
        check_capability(kid, "groceries", "edit", settings, {"creator_id": "other"})
    with pytest.raises(Exception):
        check_capability(kid, "chores", "create", settings)


def test_private_items_only_visible_to_owner_or_assignee():
    settings = {"roles": {"kid": "child"}, "permissions": {}}
    with pytest.raises(Exception):
        check_capability(user("kid"), "calendar", "view", settings, {
            "creator_id": "other", "shared": False,
        })
    check_capability(user("kid"), "calendar", "view", settings, {
        "creator_id": "kid", "shared": False,
    })
