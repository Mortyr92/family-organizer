DOMAIN = "family_organizer"
PANEL_URL = "/family-organizer"
PANEL_TITLE = "Family Organizer"
PANEL_ICON = "mdi:home-heart"
STORE_VERSION = 4
STORES = ("people", "calendar", "groceries", "todos", "chores", "recipes", "journal", "settings")
DEFAULT_SETTINGS = {
    "theme": "auto",
    "permissions": {},
    "roles": {},
    "sync_interval": 30,
    "overview_position": "left",
    "overview_collapsed": False,
    "week_start": "monday",
    "time_format": "24",
    "default_calendar_view": "month",
    "default_grocery_list_id": "default",
    "meal_slots": ["breakfast", "lunch", "dinner"],
    "competition_default": "week",
    "language": "en",
    "stores": [],
}
PERMISSION_LEVELS = {"view": 1, "edit": 2, "admin": 3}
EVENT_UPDATED = f"{DOMAIN}_updated"
