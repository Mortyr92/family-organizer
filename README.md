# Family Organizer

A local-first Home Assistant integration and touch-friendly family dashboard.
It provides five complete pages: calendar, groceries and meal planning, chores,
recipes, and administration.

## Highlights

- Month/week/day calendar, RFC 5545 recurrence, and timezone-aware ICS/CalDAV sync
- Multiple grocery lists with store and assignee routing, merging, and todo entities
- Breakfast/lunch/dinner planning across a horizontally swipeable seven-day view
- Recipe serving scaling and selectable ingredients routed to any grocery list
- Scheduled chores and week/month competitions with per-person avatars
- Home Assistant users mapped to `parent_admin`, `parent`, or `child`
- Per-person capability overrides plus creator/assignee ownership checks
- Live websocket updates after UI, service, todo-entity, and calendar-sync changes
- Home Assistant theme following or a persistent local light/dark preference

## Screens

![Family Organizer calendar dashboard](docs/family-organizer-calendar.png)

> Screenshot placeholders: groceries/meal planning, chores leaderboard, recipes,
> and permission settings will be added as those screens are finalized.

The responsive panel uses the Home Assistant theme and card variables. Desktop
views show dense calendars and leaderboards; narrow screens turn navigation,
calendar days, and meal slots into native horizontal scroll/swipe tracks.

| Calendar | Groceries and meals | Chores |
| --- | --- | --- |
| Month/week/day switcher, recurrence, day details | List/store routing and three daily meal slots | Scheduling and week/month ranking |

| Recipes | Settings |
| --- | --- |
| Ingredient selection, scaling, and list routing | People, avatars, roles, and theme |

## Install

### HACS

Add `https://github.com/Mortyr92/family-organizer` as a custom **Integration**
repository, install **Family Organizer**, restart Home Assistant, then use
**Settings → Devices & services → Add integration**.

### Manual

Copy `custom_components/family_organizer` into the matching directory under the
Home Assistant configuration directory, restart, and add the integration.

## Configuration and calendar providers

Calendar connection data is optional. In **Settings → Devices & services →
Family Organizer → Configure**, choose ICS or CalDAV and set the URL, optional
username/password, and polling interval (5–1440 minutes). Credentials stay in
the Home Assistant config entry and are never returned over websocket.

Dashboard settings cover day-overview side/collapse, week start, 12/24-hour
time, default calendar view and grocery list, meal-slot names, managed stores,
week/month competition default, language, people, exact roles, and all granular
capability overrides.

### Apple iCloud

1. Create an app-specific password at `account.apple.com`.
2. Use the Apple ID as username and that app-specific password as password.
3. Supply the calendar's CalDAV collection URL. Do not use the normal Apple ID password.

### Proton Calendar

Proton does not provide a public CalDAV endpoint. Use Proton Calendar through
the locally running Proton Mail Bridge when that Bridge/version exposes a
compatible local endpoint, or export/publish the calendar and configure its
read-only ICS URL. Treat a published URL as a secret.

## Roles and privacy

Users must be linked through `Person.user_id`; legacy `ha_user_id` records are
migrated. Unlinked non-admin users are denied. Home Assistant admins always act
as `parent_admin`. Role presets initialize the exact capability matrix, while
explicit per-person checkbox overrides are authoritative. Own-calendar and
assigned-chore operations enforce the linked person ID.

## Services

- `family_organizer.add_grocery_item`: name, quantity/unit, notes, list, store, and assignee
- `family_organizer.add_grocery`: legacy alias
- `family_organizer.add_event`: title, start/end, all-day flag, people, and details
- `family_organizer.complete_chore`: chore ID
- `family_organizer.sync_calendar`: request an immediate sync

Service calls enforce the same user permissions as panel mutations.

## Development

```bash
python -m pip install caldav==3.3.0a1 icalendar==6.3.1 pytest==9.1.1
pytest -q
cd frontend
npm install && npm run build
npm run typecheck
```

The generated
`custom_components/family_organizer/panel/family-organizer-panel.js` is committed,
so production installations do not require Node.js.
