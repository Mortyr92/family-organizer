DOMAIN = "family_organizer"
PANEL_URL = "/family-organizer"
PANEL_TITLE = "Family Organizer"
PANEL_ICON = "mdi:home-heart"
STORE_VERSION = 4
STORES = ("people", "calendar", "groceries", "todos", "chores", "recipes", "journal", "contacts", "settings")
DEFAULT_SETTINGS = {
    "theme": "auto",
    "permissions": {},
    "roles": {},
    "sync_interval": 30,
    "overview_position": "left",
    "overview_collapsed": False,
    "week_start": "monday",
    "time_format": "24",
    "default_calendar_view": "list",
    "calendar_list_mode": "planned",
    "default_grocery_list_id": "default",
    "meal_slots": ["breakfast", "lunch", "dinner"],
    "competition_default": "week",
    "language": "en",
    "stores": [],
    "reminders_enabled": True,
    "default_reminder_minutes": 15,
    "notify_service": "",
    "daily_agenda_time": "",
    "floating_navigation": False,
}
PERMISSION_LEVELS = {"view": 1, "edit": 2, "admin": 3}
EVENT_UPDATED = f"{DOMAIN}_updated"
EVENT_REMINDER = f"{DOMAIN}_reminder"
SETTING_KEYS = (
    "theme", "sync_interval", "overview_position", "overview_collapsed",
    "week_start", "time_format", "default_calendar_view", "calendar_list_mode",
    "default_grocery_list_id", "meal_slots", "competition_default",
    "language", "stores", "reminders_enabled", "default_reminder_minutes",
    "notify_service", "daily_agenda_time", "floating_navigation",
)
