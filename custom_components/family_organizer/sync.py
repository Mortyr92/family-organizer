"""Asynchronous ICS/CalDAV synchronization."""
from __future__ import annotations

import asyncio
from datetime import timedelta
import logging
from xml.etree import ElementTree

from aiohttp import BasicAuth
from homeassistant.helpers.aiohttp_client import async_get_clientsession
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator

from .const import DOMAIN
from .ics import parse_ics

_LOGGER = logging.getLogger(__name__)


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

    async def _async_update_data(self):
        url = self.entry.data.get("calendar_url")
        if not url:
            return []
        auth = None
        username = self.entry.data.get("username")
        if username:
            auth = BasicAuth(username, self.entry.data.get("password", ""))
        session = async_get_clientsession(self.hass)
        async with asyncio.timeout(30):
            calendar_type = self.entry.data.get("calendar_type", "ics")
            use_caldav = calendar_type == "caldav" or (
                calendar_type == "auto" and not url.lower().split("?")[0].endswith(".ics")
            )
            method = "REPORT" if use_caldav else "GET"
            body = None
            headers = {}
            if use_caldav:
                headers = {"Depth": "1", "Content-Type": "application/xml; charset=utf-8"}
                body = """<?xml version="1.0"?>
<c:calendar-query xmlns:d="DAV:" xmlns:c="urn:ietf:params:xml:ns:caldav">
  <d:prop><c:calendar-data/></d:prop>
  <c:filter><c:comp-filter name="VCALENDAR"><c:comp-filter name="VEVENT"/></c:comp-filter></c:filter>
</c:calendar-query>"""
            async with session.request(method, url, auth=auth, headers=headers, data=body) as response:
                response.raise_for_status()
                text = await response.text()
                if use_caldav:
                    root = ElementTree.fromstring(text)
                    payloads = [
                        node.text or ""
                        for node in root.findall(".//{urn:ietf:params:xml:ns:caldav}calendar-data")
                    ]
                    events = [event for payload in payloads for event in parse_ics(payload)]
                else:
                    events = parse_ics(text)
        local = [item for item in self.stores["calendar"].data["items"] if not item.get("external_id")]
        self.stores["calendar"].data["items"] = local + events
        await self.stores["calendar"].async_save()
        return events
