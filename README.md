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
- Home Assistant users mapped to guest, child, member, parent, or admin capabilities
- Per-area permissions plus private/shared and creator/assignee ownership checks
- Live websocket updates after UI, service, todo-entity, and calendar-sync changes
- Home Assistant theme following or a persistent local light/dark preference

## Screens

![Family Organizer calendar dashboard](docs/family-organizer-calendar.png)

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

Calendar connection data is optional. Choose ICS for a subscription URL or
CalDAV for a calendar collection URL. The polling interval is configurable
(minimum five minutes). Usernames and app-specific passwords are retained only
in Home Assistant config-entry data and are never returned by
the websocket API.

### Apple iCloud

1. Create an app-specific password at `account.apple.com`.
2. Use the Apple ID as username and that app-specific password as password.
3. Supply the calendar's CalDAV collection URL. Do not use the normal Apple ID password.

### Proton Calendar

Proton does not expose a general remote CalDAV endpoint. Export or publish a
calendar in Proton Calendar and configure its read-only ICS subscription URL.
Treat a published URL as a secret because anyone holding it can read the calendar.

## Roles and privacy

Guests can see shared data. Children can create and modify their own calendar
and grocery records and complete assigned chores. Members additionally manage
their own recipes and shared completions. Parents can schedule and administer
family content. Home Assistant administrators can change roles and permissions.
Private records are returned only to their creator, assignee, or an administrator.

## Services

- `family_organizer.add_grocery`: name, quantity, list, store, and assignee
- `family_organizer.complete_chore`: chore ID
- `family_organizer.sync_calendar`: request an immediate sync

Service calls enforce the same user permissions as panel mutations.

## Development

```bash
python -m pip install caldav==3.3.1 icalendar==7.3.0 pytest==9.1.1
pytest -q
./scripts/build_frontend.sh
```

The generated
`custom_components/family_organizer/panel/family-organizer-panel.js` is committed,
so production installations do not require Node.js.
