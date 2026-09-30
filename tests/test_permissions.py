from types import SimpleNamespace

import pytest

from custom_components.family_organizer.permissions import check_permission, permission_for


def user(user_id="user", admin=False):
    return SimpleNamespace(id=user_id, is_admin=admin)


def test_admin_always_has_admin_access():
    assert permission_for(user(admin=True), "chores", {}) == "admin"


def test_granular_and_wildcard_permissions():
    settings = {"permissions": {"user": {"*": "view", "groceries": "edit"}}}
    check_permission(user(), "groceries", "edit", settings)
    with pytest.raises(Exception):
        check_permission(user(), "chores", "edit", settings)

