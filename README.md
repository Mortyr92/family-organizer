# Family Organizer

A local-first Home Assistant integration and responsive dashboard for a family's
calendar, groceries, seven-day meal plan, chores competition, and recipes.

## Features

- Month, week, and day calendar with recurring events, ICS/CalDAV import, and a day sidebar
- Grocery todo entity and seven-day dinner planner
- Scheduled chores, completion history, points, and leaderboard sensor
- Categorized recipes with serving scaling
- People linked to Home Assistant users and per-area `view`, `edit`, or `admin` permissions
- Home Assistant calendar, sensor, and todo entities; websocket live updates; automation services
- Versioned, migrated Home Assistant stores; English and Dutch setup translations

## Installation

### HACS

1. Add this repository as a HACS **Integration** custom repository.
2. Install **Family Organizer** and restart Home Assistant.
3. Go to **Settings → Devices & services → Add integration → Family Organizer**.

### Manual

Copy `custom_components/family_organizer` into Home Assistant's
`config/custom_components` directory, restart, and add the integration.

The **Family Organizer** item then appears in the sidebar. An ICS URL can be
public, or use the username/password fields for HTTP Basic authentication.
Credentials are stored in config-entry data and never exposed through the
websocket API. The calendar sync interval is configurable from integration
options (minimum five minutes).

## Services

- `family_organizer.add_grocery` (`name`, optional `quantity`)
- `family_organizer.complete_chore` (`chore_id`)
- `family_organizer.sync_calendar`

## Development

Python business logic is tested with `pytest -q`. Build and type-check the
frontend with:

```bash
./scripts/build_frontend.sh
```

The generated `custom_components/family_organizer/frontend/family-organizer.js`
is intentionally committed so installations do not need Node.js.

## Notes

The built-in recurrence expander supports daily, weekly, and approximate
monthly intervals plus `COUNT`. Imported events remain read-only in practice
and are replaced on every sync. Back up Home Assistant's `.storage` directory
as part of your normal backup routine.
