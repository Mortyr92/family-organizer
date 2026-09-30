DOMAIN = "family_organizer"
PANEL_URL = "/family-organizer"
PANEL_TITLE = "Family Organizer"
PANEL_ICON = "mdi:home-heart"
STORE_VERSION = 3
STORES = ("people", "calendar", "groceries", "chores", "recipes", "settings")
DEFAULT_SETTINGS = {
    "theme": "auto",
    "permissions": {},
    "roles": {},
    "sync_interval": 30,
}
PERMISSION_LEVELS = {"view": 1, "edit": 2, "admin": 3}
EVENT_UPDATED = f"{DOMAIN}_updated"
