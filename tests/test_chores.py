from datetime import date

from custom_components.family_organizer.logic import chore_due, leaderboard, points_by_person


def test_chore_schedules():
    assert chore_due({"schedule": "daily"}, date(2026, 9, 30))
    assert chore_due({"schedule": "weekly:wednesday"}, date(2026, 9, 30))
    assert not chore_due({"schedule": "weekly:monday"}, date(2026, 9, 30))
    assert chore_due({"schedule": "interval:3", "created": "2026-09-27"}, date(2026, 9, 30))


def test_points_only_count_requested_window():
    chores = [{
        "assignee_id": "p1", "points": 5,
        "completed": ["2026-09-30T12:00:00", "2026-10-02T12:00:00", "2026-10-10T12:00:00"],
    }]
    assert points_by_person(chores, date(2026, 9, 30), 7) == {"p1": 10}


def test_calendar_period_leaderboards():
    chores = [{"assignee_id": "p1", "points": 2, "completed": [
        "2026-09-01T10:00:00", "2026-09-28T10:00:00", "2026-09-30T10:00:00"
    ]}]
    assert leaderboard(chores, "week", date(2026, 9, 30)) == {"p1": 4}
    assert leaderboard(chores, "month", date(2026, 9, 30)) == {"p1": 6}
