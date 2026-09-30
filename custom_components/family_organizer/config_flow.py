"""Config and options flows."""
from __future__ import annotations

import voluptuous as vol

from homeassistant import config_entries

from .const import DOMAIN


class FamilyOrganizerConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    VERSION = 1

    async def async_step_user(self, user_input=None):
        if user_input is not None:
            await self.async_set_unique_id(DOMAIN)
            self._abort_if_unique_id_configured()
            return self.async_create_entry(title="Family Organizer", data=user_input)
        schema = vol.Schema({
            vol.Optional("calendar_type", default="ics"): vol.In(["ics", "caldav"]),
            vol.Optional("calendar_url", default=""): str,
            vol.Optional("username", default=""): str,
            vol.Optional("password", default=""): str,
        })
        return self.async_show_form(step_id="user", data_schema=schema)

    @staticmethod
    def async_get_options_flow(config_entry):
        return FamilyOrganizerOptionsFlow()


class FamilyOrganizerOptionsFlow(config_entries.OptionsFlow):
    async def async_step_init(self, user_input=None):
        if user_input is not None:
            return self.async_create_entry(title="", data=user_input)
        return self.async_show_form(
            step_id="init",
            data_schema=vol.Schema({
                vol.Optional(
                    "sync_interval",
                    default=self.config_entry.options.get("sync_interval", 30),
                ): vol.All(vol.Coerce(int), vol.Range(min=5, max=1440))
            }),
        )
