"""HTTP views: authenticated iCalendar export of the family calendar."""
from __future__ import annotations

from aiohttp import web
from homeassistant.components.http import HomeAssistantView

from .const import DOMAIN
from .ics import build_ics
from .permissions import can_view

EXPORT_URL = f"/api/{DOMAIN}/calendar.ics"


class CalendarExportView(HomeAssistantView):
    """Serve the shared family calendar as an .ics file for other calendar apps."""

    url = EXPORT_URL
    name = f"api:{DOMAIN}:calendar"
    requires_auth = True

    def __init__(self, stores) -> None:
        self.stores = stores

    async def get(self, request: web.Request) -> web.Response:
        user = request["hass_user"]
        settings = self.stores["settings"].data
        people = self.stores["people"].data.get("items", [])
        if not can_view(user, settings, people):
            return web.Response(status=403, text="User is not linked to a family person")
        person_filter = request.query.get("person")
        items = [
            item for item in self.stores["calendar"].data.get("items", [])
            if (item.get("shared", True) or getattr(user, "is_admin", False))
            and (not person_filter or person_filter in (item.get("person_ids") or []))
        ]
        body = build_ics(items, people)
        return web.Response(
            body=body,
            content_type="text/calendar",
            charset="utf-8",
            headers={"Content-Disposition": 'attachment; filename="family-organizer.ics"'},
        )
