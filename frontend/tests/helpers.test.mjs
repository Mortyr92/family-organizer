import test from "node:test";
import assert from "node:assert/strict";
import { calendarDates, calendarPayload, choreDue, duplicateEvent, eventLayout, eventsOnDay, fraction, iso, localeName, mergeIngredients, moveDate, occurrences, organizerRoute, parseIngredients, presetCapability, resolveGroceryList, serializeIngredients, shift, unsupportedRecurrence, weekStartIndex } from "../src/helpers.ts";

test("month navigation clamps at month end and handles leap years", () => {
  assert.equal(moveDate("2024-01-31", "month", 1), "2024-02-29");
  assert.equal(moveDate("2025-01-31", "month", 1), "2025-02-28");
  assert.equal(moveDate("2025-12-31", "month", 1), "2026-01-31");
  assert.equal(moveDate("2026-03-01", "week", -1), "2026-02-22");
});
test("localized week starts and calendar grids remain contiguous", () => {
  assert.equal(weekStartIndex(undefined, "en-US"), 0);
  assert.equal(weekStartIndex(undefined, "de-DE"), 1);
  assert.equal(weekStartIndex("monday", "en-US"), 1);
  const dates = calendarDates("2026-02-01", "month", 1);
  assert.equal(dates.length, 42);
  assert.equal(dates[0], "2026-01-26");
  assert.equal(dates[41], "2026-03-08");
  assert.deepEqual(calendarDates("2026-02-01", "day"), ["2026-02-01"]);
  assert.equal(localeName("not_a_locale"), "en");
});
test("ingredient parsing uses real line breaks, decimals and fractions", () => {
  assert.deepEqual(parseIngredients("1 cup flour\n1/2 tsp salt\r\n2 x eggs\nFresh herbs"), [
    { amount: 1, unit: "cup", name: "flour" }, { amount: .5, unit: "tsp", name: "salt" },
    { amount: 2, unit: "x", name: "eggs" }, { amount: 1, unit: "", name: "Fresh herbs" },
  ]);
  assert.equal(fraction(1.2), "1.2");
  assert.equal(fraction(2.5), "2½");
  assert.equal(fraction(1 / 3), "⅓");
  assert.equal(fraction(0), "0");
});
test("all-day end is exclusive and spanning events appear each day", () => {
  const events = occurrences([{ id: "holiday", start: "2026-06-01", end: "2026-06-03", all_day: true }], "2026-06-01", "2026-06-07");
  assert.equal(eventsOnDay(events, "2026-06-01").length, 1);
  assert.equal(eventsOnDay(events, "2026-06-02").length, 1);
  assert.equal(eventsOnDay(events, "2026-06-03").length, 0);
  const overnight = occurrences([{ start: "2026-06-01T23:00:00", end: "2026-06-02T01:00:00" }], "2026-06-01", "2026-06-02");
  assert.equal(eventsOnDay(overnight, "2026-06-02").length, 1);
});
test("daily recurrence honors intervals, counts, exclusions and series IDs", () => {
  const events = occurrences([{ id: "series", start: "2026-06-01T10:00:00", end: "2026-06-01T11:00:00", recurrence: "FREQ=DAILY;INTERVAL=2;COUNT=4", exdates: ["2026-06-03"] }], "2026-06-01", "2026-06-30");
  assert.deepEqual(events.map(e => iso(new Date(e.occurrence_start))), ["2026-06-01", "2026-06-05", "2026-06-07"]);
  assert.ok(events.every(e => e.id === "series"));
});
test("weekly recurrence honors BYDAY and UNTIL", () => {
  const events = occurrences([{ start: "2026-06-01T10:00:00", end: "2026-06-01T11:00:00", recurrence: "FREQ=WEEKLY;BYDAY=MO,WE;UNTIL=20260610" }], "2026-06-01", "2026-06-30");
  assert.deepEqual(events.map(e => iso(new Date(e.occurrence_start))), ["2026-06-01", "2026-06-03", "2026-06-08", "2026-06-10"]);
});
test("monthly recurrence skips nonexistent dates and supports ordinal weekdays", () => {
  const endOfMonth = occurrences([{ start: "2026-01-31T10:00:00", recurrence: "FREQ=MONTHLY;COUNT=3" }], "2026-01-01", "2026-06-01");
  assert.deepEqual(endOfMonth.map(e => iso(new Date(e.occurrence_start))), ["2026-01-31", "2026-03-31", "2026-05-31"]);
  const lastFriday = occurrences([{ start: "2026-01-01T10:00:00", recurrence: "FREQ=MONTHLY;BYDAY=-1FR;COUNT=2" }], "2026-01-01", "2026-03-01");
  assert.deepEqual(lastFriday.map(e => iso(new Date(e.occurrence_start))), ["2026-01-30", "2026-02-27"]);
});
test("unsupported rules are explicitly marked instead of inventing recurrences", () => {
  const events = occurrences([{ start: "2026-06-01T10:00:00", recurrence: "FREQ=MONTHLY;BYSETPOS=1;BYDAY=MO" }], "2026-06-01", "2026-06-30");
  assert.equal(events.length, 1);
  assert.equal(events[0].unsupported_recurrence, true);
});
test("unsupported complex rules preserve text, never fabricate dates outside their original occurrence", () => {
  const rules = ["FREQ=MONTHLY;BYDAY=MO,TU,WE,TH,FR;BYSETPOS=-1", "FREQ=DAILY;BYHOUR=9,17", "FREQ=WEEKLY;WKST=ZZ", "FREQ=YEARLY;BYDAY=1MO", "FREQ=YEARLY;BYMONTHDAY=15", "FREQ=WEEKLY;BYDAY=2MO"];
  for (const recurrence of rules) {
    assert.equal(unsupportedRecurrence(recurrence), true, recurrence);
    const event = { start: "2026-01-01T09:00:00", end: "2026-01-01T10:00:00", recurrence };
    const original = occurrences([event], "2026-01-01", "2026-01-31");
    assert.equal(original.length, 1);
    assert.equal(original[0].recurrence, recurrence);
    assert.equal(original[0].unsupported_recurrence, true);
    assert.deepEqual(occurrences([event], "2026-02-01", "2026-02-28"), []);
  }
});
test("supported WKST changes weekly interval boundaries accurately", () => {
  const recurrence = "FREQ=WEEKLY;INTERVAL=2;BYDAY=SU,MO;WKST=SU;COUNT=4";
  assert.equal(unsupportedRecurrence(recurrence), false);
  const events = occurrences([{ start: "2026-06-01T09:00:00", end: "2026-06-01T10:00:00", recurrence }], "2026-06-01", "2026-06-30");
  assert.deepEqual(events.map(event => iso(new Date(event.occurrence_start))), ["2026-06-01", "2026-06-14", "2026-06-15", "2026-06-28"]);
});
test("overnight and multi-day all-day events remain visible in week and day ranges", () => {
  const source = [
    { id: "night", start: "2026-06-01T23:00:00", end: "2026-06-02T01:00:00" },
    { id: "holiday", start: "2026-06-02", end: "2026-06-04", all_day: true },
  ];
  for (const view of ["week", "day"]) {
    const dates = calendarDates("2026-06-02", view);
    const events = occurrences(source, dates[0], dates.at(-1));
    assert.deepEqual(eventsOnDay(events, "2026-06-02").map(event => event.id), ["night", "holiday"]);
  }
  const events = occurrences(source, "2026-06-01", "2026-06-07");
  assert.deepEqual(eventsOnDay(events, "2026-06-03").map(event => event.id), ["holiday"]);
  assert.deepEqual(eventsOnDay(events, "2026-06-04"), []);
});
test("overlapping event chains use stable lanes and nonoverlapping groups reset", () => {
  const make = (id, start, end) => ({ id, occurrence_start: `2026-06-01T${start}:00`, occurrence_end: `2026-06-01T${end}:00` });
  const layout = eventLayout([make("a", "09:00", "10:00"), make("b", "09:30", "10:30"), make("c", "10:00", "11:00"), make("d", "12:00", "13:00")]);
  assert.deepEqual(layout.map(({ lane, columns }) => [lane, columns]), [[0, 2], [1, 2], [0, 2], [0, 1]]);
});
test("chore schedules use full weekdays and safe custom intervals", () => {
  const base = { created: "2026-06-01" };
  assert.equal(choreDue({ ...base, schedule: "weekly", weekdays: [0] }, "2026-06-01"), true);
  assert.equal(choreDue({ ...base, schedule: "weekly", weekdays: [0] }, "2026-06-02"), false);
  assert.equal(choreDue({ ...base, schedule: "custom", interval_days: 3 }, "2026-06-04"), true);
  assert.equal(choreDue({ ...base, schedule: "daily" }, "2026-05-31"), false);
  assert.equal(choreDue({ ...base, schedule: "once", due_date: "2026-06-03" }, "2026-06-03"), true);
});
test("permissions match backend role presets", () => {
  assert.equal(presetCapability("child", "manage_settings"), false);
  assert.equal(presetCapability("child", "manage_calendar_own"), true);
  assert.equal(presetCapability("parent", "manage_people"), false);
  assert.equal(presetCapability("parent", "manage_chores"), true);
  assert.equal(presetCapability("parent_admin", "manage_calendar_sync"), true);
});
test("date shifts and recurrence stay on local dates through DST", () => {
  assert.equal(shift("2026-03-08", 1), "2026-03-09");
  const events = occurrences([{ start: "2026-03-07", end: "2026-03-08", all_day: true, recurrence: "FREQ=DAILY;COUNT=3" }], "2026-03-07", "2026-03-10");
  assert.deepEqual(events.map(e => [iso(new Date(e.occurrence_start)), iso(new Date(e.occurrence_end))]), [["2026-03-07", "2026-03-08"], ["2026-03-08", "2026-03-09"], ["2026-03-09", "2026-03-10"]]);
});
test("duplicate events copy editable fields only, never IDs or external metadata", () => {
  const source = { id: "original", creator_id: "alex", source_id: "remote", external_id: "ical-123", recurrence_id: "20260608T120000Z", etag: "sync-etag", exdates: ["2026-06-02"], title: "Appointment", start: "2026-06-01T12:00:00", end: "2026-06-01T13:00:00", occurrence_start: "2026-06-08T12:00:00", occurrence_end: "2026-06-08T13:00:00", person_ids: ["alex"], all_day: false, description: "Notes", location: "Clinic", recurrence: "FREQ=WEEKLY", shared: true };
  const duplicate = duplicateEvent(source);
  assert.deepEqual(Object.keys(duplicate).sort(), ["all_day", "description", "end", "location", "person_ids", "recurrence", "shared", "start", "title"].sort());
  assert.equal(duplicate.start, source.occurrence_start);
  assert.equal(duplicate.title, "Appointment (copy)");
  assert.equal(source.id, "original");
  assert.deepEqual(calendarPayload({ ...duplicate, day: "2026-06-08", unknown: "ignore", id: "ignore", occurrence_start: source.occurrence_start, occurrence_end: source.occurrence_end, unsupported_recurrence: true, recurrence_id: source.recurrence_id }), duplicate);
});
test("ingredient edit round trips preserve blank units and metadata, including reordered lines", () => {
  const ingredients = [
    { amount: 2, unit: "", name: "ripe apples", category: "Produce", store: "Farm stand", notes: "Organic", selected: false, id: "fruit" },
    { amount: .5, unit: "tsp", name: "salt", category: "Pantry", notes: "Fine", selected: true },
  ];
  const serialized = serializeIngredients(ingredients);
  assert.equal(serialized, "2  ripe apples\n0.5 tsp salt");
  assert.deepEqual(mergeIngredients(serialized, ingredients), ingredients);
  assert.deepEqual(mergeIngredients(serialized.split("\n").reverse().join("\n"), ingredients), [...ingredients].reverse());
  assert.deepEqual(parseIngredients("2 eggs"), [{ amount: 2, unit: "", name: "eggs" }]);
});
test("first load honors a custom grocery default even when default list exists", () => {
  const lists = [{ id: "default" }, { id: "pantry" }];
  assert.equal(resolveGroceryList(lists, "default", "pantry", true), "pantry");
  assert.equal(resolveGroceryList(lists, "default", "pantry", false), "default");
  assert.equal(resolveGroceryList(lists, "deleted", "pantry", false), "pantry");
  assert.equal(resolveGroceryList(lists, "default", "deleted", true), "default");
  assert.equal(resolveGroceryList([], "deleted", "pantry", true), "default");
});
test("recipe routes safely decode valid IDs and handle malformed escapes", () => {
  assert.deepEqual(organizerRoute("#fo/recipes/family%20soup"), { page: "recipes", recipeId: "family soup", malformed: false });
  assert.deepEqual(organizerRoute("#fo/recipes/%E0%A4%A"), { page: "recipes", recipeId: "", malformed: true });
  assert.deepEqual(organizerRoute("#fo/calendar"), { page: "calendar", recipeId: "", malformed: false });
  assert.equal(organizerRoute("#unrelated-home-assistant-route"), undefined);
});
