import "../../custom_components/family_organizer/panel/family-organizer-panel.js";

const today = new Date();
const day = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
const initial = {
  people: { items: [
    { id: "alex", name: "Alex Morgan", initials: "AM", color: "#4f7a9c", role: "parent_admin", user_id: "demo", permissions: {} },
    { id: "jamie", name: "Jamie Morgan", initials: "JM", color: "#9a6187", role: "parent", permissions: {} },
    { id: "riley", name: "Riley Morgan", initials: "RM", color: "#378265", role: "child", permissions: {} },
  ] },
  calendar: { items: [
    { id: "school", title: "School drop-off", start: `${day}T08:30:00`, end: `${day}T09:00:00`, person_ids: ["alex", "riley"], shared: true, recurrence: "FREQ=WEEKLY", location: "School entrance" },
    { id: "dinner", title: "Dinner with grandparents", start: `${day}T18:00:00`, end: `${day}T19:30:00`, person_ids: ["jamie", "riley"], shared: true, description: "Bring something to share." },
  ], sources: [] },
  groceries: { lists: [{ id: "default", name: "Weekly groceries", store: "Market" }, { id: "pantry", name: "Pantry", store: "" }], items: [
    { id: "milk", name: "Oat milk", quantity: 2, unit: "cartons", list_id: "default", assignee_id: "alex", creator_id: "jamie", checked: false },
    { id: "apples", name: "Apples", quantity: 6, unit: "x", list_id: "default", checked: true, creator_id: "alex" },
  ], meal_slots: [] },
  chores: { items: [{ id: "plants", title: "Water the plants", points: 5, schedule: "daily", created: day, assignee_ids: ["riley"], rotation_index: 0 }], completions: [] },
  recipes: { items: [{ id: "pasta", title: "Weeknight tomato pasta", tags: ["quick", "vegetarian"], servings: 4, prep_time: 10, cook_time: 20, category_ids: ["favorites"], ingredients: [{ amount: 2, unit: "cups", name: "pasta" }, { amount: .5, unit: "tsp", name: "salt" }], steps: ["Bring a pot of salted water to the boil.", "Cook the pasta and toss with tomato sauce."] }], categories: [{ id: "favorites", name: "Family favorites", parent_id: null }] },
  settings: { theme: "light", overview_position: "right", overview_collapsed: false, week_start: "monday", time_format: "24", default_calendar_view: "month", default_grocery_list_id: "default", meal_slots: ["breakfast", "lunch", "dinner"], competition_default: "week", language: "en", stores: ["Market", "Farm stand"], sync_interval: 30 },
};
const panel = document.querySelector("family-organizer-panel");
let data, requests, failNext;
function reset() {
  data = structuredClone(initial); requests = []; failNext = false;
}
reset();
panel.hass = {
  user: { id: "demo", is_admin: true }, locale: { language: "en" }, themes: { darkMode: false },
  connection: { subscribeMessage: async () => () => {} },
  callWS: async message => {
    requests.push(structuredClone(message));
    if (failNext && !["family_organizer/list", "family_organizer/subscribe"].includes(message.type)) { failNext = false; throw new Error("Test save rejected"); }
    const { resource, collection = "items" } = message;
    if (message.type === "family_organizer/list") return structuredClone(data[resource]);
    if (message.type === "family_organizer/settings") { Object.assign(data.settings, message.settings); return structuredClone(data.settings); }
    if (message.type === "family_organizer/create") {
      const item = { ...message.item, id: `test-${requests.length}`, creator_id: "alex" };
      data[resource][collection] ||= []; data[resource][collection].push(item); return structuredClone(item);
    }
    if (message.type === "family_organizer/update") {
      const item = data[resource][collection].find(item => item.id === message.item_id);
      Object.assign(item, message.item); return structuredClone(item);
    }
    if (message.type === "family_organizer/delete") {
      data[resource][collection] = data[resource][collection].filter(item => item.id !== message.item_id); return {};
    }
    if (message.type === "family_organizer/complete_chore") {
      data.chores.completions.push({ id: `test-${requests.length}`, chore_id: message.chore_id, person_id: message.person_id || "alex", points: data.chores.items.find(c => c.id === message.chore_id).points, completed_at: new Date().toISOString() }); return {};
    }
    if (message.type === "family_organizer/adjust_points") {
      data.chores.completions.push({ id: `test-${requests.length}`, person_id: message.person_id, points: message.points, note: message.note, adjustment: true, completed_at: new Date().toISOString() }); return {};
    }
    if (message.type === "family_organizer/recipe_to_groceries") return [];
    throw new Error(`Unexpected command ${message.type}`);
  },
};

const assert = (condition, message) => { if (!condition) throw new Error(message); };
const pause = () => new Promise(resolve => setTimeout(resolve, 15));
async function settled() {
  for (let i = 0; i < 100; i++) { await panel.updateComplete; await pause(); if (!panel.saving && !panel.loading) return; }
  throw new Error("Panel did not settle");
}
const root = () => panel.shadowRoot;
const query = selector => root().querySelector(selector);
function button(text, scope = root()) {
  const match = [...scope.querySelectorAll("button")].find(element => element.textContent.trim() === text);
  assert(match, `Button not found: ${text}`); return match;
}
async function click(element) { element.click(); await settled(); }
async function go(page) {
  const navigation = innerWidth < 700 ? ".mobile-nav" : ".sidebar nav";
  await click(query(`${navigation} button:nth-child(${["calendar", "groceries", "chores", "recipes", "settings"].indexOf(page) + 1})`));
  assert(document.documentElement.scrollWidth <= innerWidth, `${page} must not overflow the viewport`);
}
async function open(kind, fields = {}) {
  await click(query(".quick-add"));
  const title = { event: "Calendar event", grocery: "Grocery item", meal: "Planned meal", chore: "Family chore", recipe: "Favorite recipe" }[kind];
  const entry = [...query("dialog").querySelectorAll(".quick-menu button")].find(element => element.querySelector("strong").textContent === title);
  await click(entry);
  fill(fields);
}
function fill(fields) {
  for (const [name, value] of Object.entries(fields)) {
    const input = query(`dialog [name="${name}"]`);
    assert(input, `Field not found: ${name}`);
    if (input.type === "checkbox") input.checked = value; else input.value = String(value);
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
  }
}
async function submit() {
  const form = query("dialog form");
  assert(form.checkValidity(), "Dialog form must be valid");
  form.requestSubmit(); await settled();
}
async function close() { const dialog = query("dialog"); if (dialog) await click(dialog.querySelector('[aria-label="Close dialog"]')); }

window.runInteractionTests = async () => {
  const passed = [];
  const check = async (name, work) => { await work(); passed.push(name); document.querySelector("#results").textContent = `${passed.length} passed`; };
  try {
    reset(); await panel.load(); await settled(); await close(); await go("calendar");
    await check("Month grid, localized headings, agenda and family filters", async () => {
      assert(query(".month-grid").children.length === 42, "Expected complete month grid");
      if (innerWidth < 700) assert(getComputedStyle(query(".mobile-nav")).display === "grid", "Mobile navigation must be visible");
      const menuEvents = [];
      const menuListener = event => menuEvents.push({ bubbles: event.bubbles, composed: event.composed });
      document.addEventListener("hass-toggle-menu", menuListener);
      await click(query(innerWidth < 700 ? ".mobile-nav .ha-shell-menu" : ".sidebar-ha-menu"));
      document.removeEventListener("hass-toggle-menu", menuListener);
      assert(menuEvents.length === 1 && menuEvents[0].bubbles && menuEvents[0].composed, "HA menu control must dispatch the supported event beyond the shadow root");
      if (innerWidth < 700) {
        const targets = [...root().querySelectorAll("button,input,select,textarea")].filter(element => element.getClientRects().length && !element.classList.contains("event-chip"));
        for (const target of targets) assert(target.getBoundingClientRect().height >= 44 && target.getBoundingClientRect().width >= 44, `Touch target below 44px: ${target.getAttribute("aria-label") || target.textContent}`);
        assert(getComputedStyle(query(".date-add")).display !== "none" && getComputedStyle(query(".date-add")).opacity === "1", "Date-add must remain visible on touch");
      }
      assert(query(".weekday-row").textContent.includes("Mon"), "Expected localized Monday");
      assert(query(".agenda").textContent.includes("School drop-off"), "Expected selected day agenda");
      await click([...root().querySelectorAll(".family-filters button")].find(b => b.textContent.includes("Jamie")));
      assert(!query(".agenda").textContent.includes("School drop-off"), "Person filter must hide unrelated events");
      await click(button("Everyone"));
      const previous = new Date(`${day}T12:00:00`), next = new Date(previous);
      previous.setDate(previous.getDate() - 1); next.setDate(next.getDate() + 1);
      const localDay = date => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
      data.calendar.items.push(
        { id: "overnight", title: "Overnight fixture event", start: `${localDay(previous)}T23:00:00`, end: `${day}T01:00:00`, person_ids: ["alex"] },
        { id: "all-day", title: "All-day fixture event", start: day, end: localDay(next), all_day: true, person_ids: ["alex"] },
        { id: "advanced", title: "Advanced monthly fixture", start: "2020-01-01T09:00:00", end: "2020-01-01T10:00:00", recurrence: "FREQ=MONTHLY;BYDAY=MO,TU,WE,TH,FR;BYSETPOS=-1", person_ids: ["alex"] },
      );
      await panel.load(); await settled();
      assert(query(".agenda").textContent.includes("Overnight fixture event") && query(".agenda").textContent.includes("All-day fixture event"), "Overnight and all-day events must appear in the selected agenda");
      assert(query(".recurrence-warning").textContent.includes("BYSETPOS=-1"), "Advanced rules must warn even when their original event is outside the current period");
      assert(![...root().querySelectorAll(".event-chip")].some(chip => chip.textContent.includes("Advanced monthly fixture")), "Unsupported recurrence must not fabricate events");
      data.settings.default_grocery_list_id = "pantry";
      const freshPanel = document.createElement("family-organizer-panel");
      freshPanel.style.display = "none"; document.body.append(freshPanel); freshPanel.hass = panel._hass;
      for (let i = 0; i < 100 && freshPanel.loading; i++) { await freshPanel.updateComplete; await pause(); }
      assert(freshPanel.listId === "pantry", "Initial load must use a custom saved grocery default even if default list exists");
      freshPanel.remove(); data.settings.default_grocery_list_id = "default";
    });
    await check("Create repeating event, focus entry/return, detail, edit and duplicate", async () => {
      const trigger = query(".quick-add"); trigger.focus();
      await open("event", { title: "Test family picnic", recurrence: "FREQ=WEEKLY", day, end_day: day, start: "12:00", end: "13:00", location: "Park" });
      assert(query("dialog").open, "Native modal must be open");
      assert(root().activeElement.name === "title", "Event title should receive focus");
      await submit();
      assert(!query("dialog"), "Successful save must close modal");
      assert(root().activeElement === trigger, "Focus must return to quick-add");
      assert(data.calendar.items.some(e => e.title === "Test family picnic"), "Event must persist");
      await click([...root().querySelectorAll(".event-chip")].find(b => b.textContent.includes("Test family picnic")));
      await click(button("Edit series", query("dialog")));
      fill({ title: "Updated picnic" }); await submit();
      assert(data.calendar.items.some(e => e.title === "Updated picnic"), "Edit must update series");
      const editRequest = requests.findLast(r => r.type === "family_organizer/update" && r.resource === "calendar");
      assert(!["occurrence_start", "occurrence_end", "unsupported_recurrence", "recurrence_id"].some(key => key in editRequest.item), "Calendar edits must not persist occurrence presentation or detached import fields");
      await click([...root().querySelectorAll(".event-chip")].find(b => b.textContent.includes("Updated picnic")));
      await click(button("Duplicate", query("dialog"))); await submit();
      assert(data.calendar.items.some(e => e.title === "Updated picnic (copy)"), "Duplicate must create new record");
      assert(new Set(data.calendar.items.map(e => e.id)).size === data.calendar.items.length, "Duplicate IDs must remain unique");
      const duplicateRequest = requests.findLast(r => r.type === "family_organizer/create" && r.resource === "calendar");
      assert(Object.keys(duplicateRequest.item).every(key => ["title", "start", "end", "all_day", "person_ids", "description", "location", "recurrence", "shared"].includes(key)), "Duplicate request must contain only editable backend fields");
    });
    await check("Calendar week/day views and precise navigation", async () => {
      await click(button("Week"));
      assert(root().querySelectorAll(".time-column").length === 7, "Week needs seven time columns");
      assert(query(".all-day-row").textContent.includes("All-day fixture event"), "Week view must show all-day events");
      assert(query(".time-body").textContent.includes("Overnight fixture event"), "Week view must show overnight events");
      await click(button("Day"));
      assert(root().querySelectorAll(".time-column").length === 1, "Day needs one time column");
      assert(query(".all-day-row").textContent.includes("All-day fixture event"), "Day view must show all-day events");
      assert(query(".time-body").textContent.includes("Overnight fixture event"), "Day view must show incoming overnight events");
      const prior = panel.selectedDay;
      await click(query('[aria-label="Next period"]'));
      assert(panel.selectedDay !== prior, "Next day must navigate");
      await click(button("Today")); await click(button("Month"));
    });
    await check("Failed save retains dialog and draft; retry persists grocery item", async () => {
      await go("groceries");
      await open("grocery", { name: "Test oranges", quantity: "3", unit: "x", list_id: "default" });
      failNext = true; await submit();
      assert(query("dialog").open && query("dialog .error").textContent.includes("Test save rejected"), "Failure must be visible in open dialog");
      assert(query('dialog [name="name"]').value === "Test oranges", "Draft must survive failure");
      await submit();
      assert(data.groceries.items.some(i => i.name === "Test oranges"), "Retry must persist item");
      const checkbox = query('[aria-label="Mark Test oranges bought"]');
      await click(checkbox);
      assert(data.groceries.items.find(i => i.name === "Test oranges").checked, "Bought toggle must persist");
    });
    await check("Seven-day planner saves recipe slots and prevents duplicate slots", async () => {
      assert(root().querySelectorAll(".meal-day").length === 7, "Planner needs seven days");
      await open("meal", { day, slot: "dinner", recipe_id: "pasta", servings: 4 }); await submit();
      assert(data.groceries.meal_slots.some(m => m.recipe_id === "pasta" && m.day === day), "Meal must persist");
      await open("meal", { day, slot: "dinner", recipe_id: "pasta", servings: 4 }); await submit();
      assert(query("dialog .error").textContent.includes("already planned"), "Occupied slots must not silently duplicate");
      await close();
    });
    await check("Recipe detail, decimal scaling, per-ingredient routing and recipe parsing", async () => {
      await go("recipes"); await click(query(".recipe-card"));
      assert(query(".method-panel").textContent.includes("Bring a pot"), "Recipe detail needs instructions");
      data.recipes.items[0].ingredients.push({ amount: 2, unit: "", name: "ripe tomatoes", category: "Produce", store: "Market", notes: "Juicy", selected: false, id: "tomato-ingredient" });
      const originalIngredients = structuredClone(data.recipes.items[0].ingredients);
      await panel.load(); await settled();
      await click(button("Edit recipe")); await submit();
      assert(JSON.stringify(data.recipes.items[0].ingredients) === JSON.stringify(originalIngredients), "No-op recipe edit must preserve blank units and every ingredient metadata field");
      const servings = query('.serving-control input'); servings.value = "2"; servings.dispatchEvent(new Event("change")); await settled();
      const select = query(".ingredient-row select"); select.value = "pantry"; select.dispatchEvent(new Event("change")); await settled();
      await click(button("+ Add selected to groceries"));
      const request = requests.findLast(r => r.type === "family_organizer/recipe_to_groceries");
      assert(request.servings === 2 && request.routes["0"] === "pantry", "Scaling and routing must reach existing API");
      await click(button("← All recipes"));
      await open("recipe", { title: "Test pancakes", ingredients: "1 cup flour\n2 x eggs", steps: "Mix.\nCook." }); await submit();
      const recipe = data.recipes.items.find(r => r.title === "Test pancakes");
      assert(recipe.ingredients.length === 2 && recipe.steps.length === 2, "Recipe lines must parse as real lines");
    });
    await check("Chore completion, leaderboard and point adjustments", async () => {
      data.chores.items[0].icon = "mdi:watering-can";
      await panel.load(); await settled(); await go("chores");
      assert(query(".chore-card ha-icon").icon === "mdi:watering-can", "Configured MDI icon must reach the HA icon property");
      if (!customElements.get("ha-icon")) {
        assert(getComputedStyle(query(".chore-icon-fallback")).display !== "none", "Unregistered fixture icon must have a visible fallback");
        customElements.define("ha-icon", class extends HTMLElement { connectedCallback() { this.textContent = "✓"; } });
      }
      assert(getComputedStyle(query(".chore-icon-fallback")).display === "none", "Registered HA icon must replace the fixture fallback");
      await click(button("Complete"));
      assert(data.chores.completions.some(c => c.chore_id === "plants"), "Chore must record completion");
      assert(query(".leaderboard").textContent.includes("5"), "Leaderboard must update");
      await click(button("+ Adjust points"));
      fill({ person_id: "alex", points: "7", note: "Helping out" }); await submit();
      assert(data.chores.completions.some(c => c.adjustment && c.points === 7), "Manual points must persist");
    });
    await check("All display preferences, appearance and per-person permission overrides", async () => {
      await go("settings"); await click(button("+ Edit preferences"));
      fill({ week_start: "sunday", time_format: "12", language: "de", sync_interval: 45, theme: "dark" }); await submit();
      assert(data.settings.week_start === "sunday" && data.settings.sync_interval === 45, "Settings must persist");
      assert(query(".app").dataset.theme === "dark", "Theme must update");
      await click(query(".person-card button"));
      fill({ name: "Alex Updated", manage_calendar_all: "deny" }); await submit();
      assert(data.people.items[0].permissions.manage_calendar_all === false, "Explicit permission deny must persist");
      await click(query(".theme-options button:nth-child(2)"));
    });
    await check("Accessible labels, no inline forms and safe delete confirmation", async () => {
      assert(root().querySelectorAll("main form").length === 0, "Create/edit forms belong in dialogs");
      await go("groceries");
      await click(query('[aria-label="Delete Test oranges"]'));
      assert(query("dialog").textContent.includes("Delete this item?"), "Delete must ask for confirmation");
      await submit();
      assert(!data.groceries.items.some(item => item.name === "Test oranges"), "Confirmed delete must persist");
    });
    await check("Child permissions restrict quick-add and own-event assignments", async () => {
      data.people.items[2].user_id = "child";
      panel.hass = { ...panel._hass, user: { id: "child", is_admin: false } };
      await panel.load(); await settled(); await go("calendar");
      await click(query(".quick-add"));
      assert(!query("dialog").textContent.includes("Family chore"), "Child must not be offered chore management");
      assert(query("dialog").textContent.includes("Favorite recipe"), "Child can manage recipes");
      await close();
      await open("event");
      assert(query("dialog").querySelectorAll('[name="person_ids"]').length === 1, "Own-calendar editor must only offer linked person");
      assert(query('dialog [name="person_ids"]').value === "riley", "Own events must assign the linked person");
      for (const input of query("dialog").querySelectorAll("input,select,textarea")) assert(input.closest("label") || input.labels?.length, `Missing label for ${input.name}`);
      await close();
      await go("settings");
      assert(!root().textContent.includes("+ Add a person"), "Child cannot manage people");
      panel.hass = { ...panel._hass, user: { id: "demo", is_admin: true } };
      await panel.load(); await settled();
      data.settings.current_user = { person_id: "riley", capabilities: Object.fromEntries(["manage_people", "manage_calendar_all", "manage_calendar_own", "manage_groceries", "manage_meal_plan", "manage_chores", "complete_own_chores", "complete_any_chore", "manage_recipes", "manage_settings", "manage_calendar_sync"].map(capability => [capability, false])) };
      await panel.load(); await settled();
      await click(query(".quick-add"));
      assert(query("dialog").textContent.includes("view-only account"), "Authoritative server capabilities must win over HA fallback");
      assert(panel.me.id === "riley", "Authoritative person ID must choose linked person");
      await close();
      delete data.settings.current_user;
      await panel.load(); await settled();
      location.hash = "fo/recipes/%E0%A4%A";
      await pause(); await settled();
      assert(panel.page === "recipes" && panel.recipeId === "", "Malformed recipe routes must recover to the cookbook");
    });
    window.testResult = { passed: passed.length, tests: passed, failed: 0 };
    document.querySelector("#results").textContent = `${passed.length} interaction tests passed`;
    return window.testResult;
  } catch (error) {
    window.testResult = { passed: passed.length, tests: passed, failed: 1, error: error.message, stack: error.stack };
    document.querySelector("#results").textContent = `FAILED after ${passed.length}: ${error.message}`;
    return window.testResult;
  }
};
document.querySelector("#run-tests").addEventListener("click", () => void window.runInteractionTests());
window.demoData = initial;
if (new URLSearchParams(location.search).has("run")) void window.runInteractionTests();
