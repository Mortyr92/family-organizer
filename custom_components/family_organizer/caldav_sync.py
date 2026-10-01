"""ICS and CalDAV synchronization."""
from __future__ import annotations

import asyncio
from datetime import timedelta
import logging

from aiohttp import BasicAuth
import caldav
from homeassistant.helpers.aiohttp_client import async_get_clientsession
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator, UpdateFailed

from .const import DOMAIN, EVENT_UPDATED
from .ics import parse_ics

_LOGGER = logging.getLogger(__name__)


def _load_caldav(url: str, username: str, password: str) -> list[str]:
    """Fetch calendar payloads with the blocking caldav client."""
    credentials = {"username": username or None, "password": password or None}
    with caldav.DAVClient(url=url, **credentials) as client:
        calendar = client.calendar(url=url)
        try:
            events = calendar.events()
        except Exception:
            calendars = client.principal().calendars()
            events = [event for value in calendars for event in value.events()]
        return [
            value.data.decode() if isinstance(value.data, bytes) else str(value.data)
            for value in events
        ]


class CalendarSyncCoordinator(DataUpdateCoordinator):
    def __init__(self, hass, entry, stores) -> None:
        self.entry = entry
        self.stores = stores
        interval = entry.options.get("sync_interval", entry.data.get("sync_interval", 30))
        super().__init__(
            hass,
            _LOGGER,
            name=f"{DOMAIN} calendar sync",
            update_interval=timedelta(minutes=max(5, int(interval))),
        )

    def _config(self, key: str, default=""):
        return self.entry.options.get(key, self.entry.data.get(key, default))

    async def _payloads(self, url: str, use_caldav: bool) -> list[str]:
        if use_caldav:
            return await self.hass.async_add_executor_job(
                _load_caldav,
                url,
                self._config("username"),
                self._config("password"),
            )
        auth = None
        if self._config("username"):
            auth = BasicAuth(
                self._config("username"), self._config("password")
            )
        async with asyncio.timeout(30):
            async with async_get_clientsession(self.hass).get(url, auth=auth) as response:
                response.raise_for_status()
                return [await response.text()]

    async def _async_update_data(self):
        url = self._config("calendar_url")
        if not url:
            return []
        calendar_type = self._config("calendar_type", "ics")
        use_caldav = calendar_type == "caldav" or (
            calendar_type == "auto" and not url.lower().split("?")[0].endswith(".ics")
        )
        try:
            payloads = await self._payloads(url, use_caldav)
            parsed = await asyncio.gather(*(
                self.hass.async_add_executor_job(parse_ics, payload) for payload in payloads
            ))
            events = [event for group in parsed for event in group]
        except Exception as err:
            raise UpdateFailed(f"Calendar sync failed: {err}") from err
        local = [
            item for item in self.stores["calendar"].data["items"]
            if not item.get("external_id")
        ]
        self.stores["calendar"].data["items"] = local + events
        await self.stores["calendar"].async_save()
        self.hass.bus.async_fire(EVENT_UPDATED, {
            "resource": "calendar", "operation": "sync", "count": len(events)
        })
        return events
