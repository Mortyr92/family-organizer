from datetime import date

from datetime import datetime

from custom_components.family_organizer.logic import (
    chore_due, chore_overdue, chore_status, leaderboard, points_by_person,
)


def test_chore_schedules():
    assert chore_due({"schedule": "daily"}, date(2026, 9, 30))
    assert chore_due({"schedule": "weekly:wednesday"}, date(2026, 9, 30))
    assert not chore_due({"schedule": "weekly:monday"}, date(2026, 9, 30))
    assert chore_due({"schedule": "interval:3", "created": "2026-09-27"}, date(2026, 9, 30))
    assert chore_due({"schedule": "monthly", "month_day": 30, "created": "2026-01-01"}, date(2026, 9, 30))
    assert chore_due({"schedule": "weekly", "weekdays": [2], "created": "2026-01-01"}, date(2026, 9, 30))
    assert chore_overdue(
        {"schedule": "daily", "due_time": "08:00", "completed": []},
        date(2026, 9, 30), datetime(2026, 9, 30, 9),
    )


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


def test_routine_due_respects_pause():
    chore = {"schedule": "daily", "created": "2026-01-01"}
    assert chore_due(chore, date(2026, 9, 30))
    assert not chore_due(chore, date(2026, 9, 30), paused=True)
    once = {"schedule": "once", "due_date": "2026-09-30", "created": "2026-01-01"}
    assert chore_due(once, date(2026, 9, 30), paused=True)


def test_chore_status_active_upcoming_late():
    chore = {"daypart": "morning"}
    now = datetime(2026, 9, 30, 8, 0)
    assert chore_status(chore, date(2026, 9, 30), now) == "active"
    early = datetime(2026, 9, 30, 6, 0)
    assert chore_status(chore, date(2026, 9, 30), early) == "upcoming"
    future_day = chore_status(chore, date(2026, 10, 1), now)
    assert future_day == "upcoming"
    past_day = chore_status(chore, date(2026, 9, 29), now)
    assert past_day == "late"


def test_chore_status_done_overrides_everything():
    assert chore_status({}, date(2026, 9, 30), completed=True) == "done"


def test_chore_status_retry_window():
    chore = {"due_time": "08:00", "retry_allowed": True, "retry_minutes": 60}
    within_retry = datetime(2026, 9, 30, 8, 30)
    assert chore_status(chore, date(2026, 9, 30), within_retry) == "retry"
    past_retry = datetime(2026, 9, 30, 10, 0)
    assert chore_status(chore, date(2026, 9, 30), past_retry) == "late"


def test_free_chore_expires():
    chore = {"is_free": True, "expires_at": "2026-09-29"}
    expired = datetime(2026, 9, 30, 10, 0)
    assert chore_status(chore, date(2026, 9, 30), expired) == "expired"


def test_completion_history_includes_adjustments():
    completions = [
        {"person_id": "p1", "completed_at": "2026-09-30T10:00:00", "points": 5},
        {"person_id": "p1", "completed_at": "2026-10-01T10:00:00", "points": -2},
    ]
    assert points_by_person([], date(2026, 9, 30), 2, completions) == {"p1": 3}
