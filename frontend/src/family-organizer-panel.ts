import { LitElement, html, nothing, type TemplateResult } from "lit";
import { customElement, state } from "lit/decorators.js";
import { calendarDates, calendarPayload, choreDue, dayDate, duplicateEvent, eventLayout, eventsOnDay, fraction, iso, localeName, mergeIngredients, moveDate, nextBirthday, occurrences, organizerRoute, presetCapability, resolveGroceryList, serializeIngredients, shift, unsupportedRecurrence, weekStart, weekStartIndex, type Item } from "./helpers";
import { panelStyles } from "./styles";

type Hass = {
  user?: { id: string; is_admin: boolean };
  locale?: { language?: string };
  themes?: { darkMode?: boolean };
  callWS<T>(message: Item): Promise<T>;
  connection: { subscribeMessage(cb: () => void, message: Item): Promise<() => void> };
};
type Editor = { kind: string; item: Item; resource?: string; collection?: string };
type BirthdayRow = { person: Item; next: ReturnType<typeof nextBirthday> };
const resources = ["people", "calendar", "groceries", "todos", "chores", "recipes", "journal", "settings"];
const capabilities = ["manage_people", "manage_calendar_all", "manage_calendar_own", "manage_groceries", "manage_todos", "manage_meal_plan", "manage_chores", "complete_own_chores", "complete_any_chore", "manage_recipes", "manage_journal", "manage_settings", "manage_calendar_sync"];
const pages = [
  { id: "today", name: "Today", icon: "☀", subtitle: "Everything your family has going on, at a glance." },
  { id: "calendar", name: "Calendar", icon: "▦", subtitle: "A little less juggling. A little more together." },
  { id: "groceries", name: "Shopping", icon: "▤", subtitle: "From the weekly plan to the shopping basket." },
  { id: "todos", name: "To Do", icon: "☑", subtitle: "Lists for everything that isn’t groceries." },
  { id: "recipes", name: "Meals", icon: "♧", subtitle: "Good food worth making again." },
  { id: "chores", name: "Chores", icon: "✓", subtitle: "Small contributions. A happier home." },
  { id: "journal", name: "Journal", icon: "✎", subtitle: "Capture the little moments worth remembering." },
  { id: "birthdays", name: "Birthdays", icon: "♡", subtitle: "Never miss a chance to celebrate." },
  { id: "settings", name: "Settings", icon: "⚙", subtitle: "Make your organizer feel like home." },
];

@customElement("family-organizer-panel")
export class FamilyOrganizerPanel extends LitElement {
  @state() private page = "today";
  @state() private data: Record<string, Item> = {};
  @state() private selectedDay = iso(new Date());
  @state() private calendarView = "month";
  @state() private personFilter = new Set<string>();
  @state() private listId = "default";
  @state() private todoListId = "default";
  @state() private showDoneTodos = false;
  @state() private journalPerson = "";
  @state() private groceryAssignee = "";
  @state() private groupStores = false;
  @state() private mealWeek = 0;
  @state() private scorePeriod = "week";
  @state() private recipeSearch = "";
  @state() private recipeCategory = "";
  @state() private recipeId = "";
  @state() private servings: Record<string, number> = {};
  @state() private selectedIngredients: Record<string, Set<number>> = {};
  @state() private routes: Record<string, Record<string, string>> = {};
  @state() private theme = localStorage.getItem("family-organizer-theme") || "auto";
  @state() private error = "";
  @state() private notice = "";
  @state() private loading = true;
  @state() private saving = false;
  @state() private editor?: Editor;
  private _hass?: Hass;
  private unsubscribe?: () => void;
  private subscribing = false;
  private initialized = false;
  private loadSequence = 0;
  private returnFocus?: HTMLElement;
  private localOverview?: boolean;

  set hass(value: Hass) {
    const first = !this._hass;
    this._hass = value;
    if (first) void this.load();
    this.requestUpdate();
  }
  connectedCallback() {
    super.connectedCallback();
    window.addEventListener("hashchange", this.readRoute);
    this.readRoute();
    if (this._hass) void this.load();
  }
  disconnectedCallback() {
    this.unsubscribe?.();
    this.unsubscribe = undefined;
    window.removeEventListener("hashchange", this.readRoute);
    super.disconnectedCallback();
  }
  private readRoute = () => {
    const route = organizerRoute(location.hash);
    if (route) {
      this.page = route.page; this.recipeId = route.recipeId;
      if (route.malformed) this.notice = "This recipe link is malformed. Showing your cookbook instead.";
    }
  };
  private navigate(page: string, id = "") {
    this.page = page; this.recipeId = id;
    location.hash = `fo/${page}${id ? `/${encodeURIComponent(id)}` : ""}`;
  }
  private get settingsData() { return this.data.settings || {}; }
  private get people() { return this.data.people?.items || []; }
  private get locale() { return localeName(this.settingsData.language || this._hass?.locale?.language); }
  private get firstDay() { return weekStartIndex(this.settingsData.week_start, this.locale); }
  private get me() {
    if (this.settingsData.current_user) return this.people.find((p: Item) => p.id === this.settingsData.current_user.person_id);
    const userId = this._hass?.user?.id;
    return userId ? this.people.find((p: Item) => (p.user_id || p.ha_user_id) === userId) : undefined;
  }
  private can(capability: string) {
    const authoritative = this.settingsData.current_user?.capabilities?.[capability];
    if (typeof authoritative === "boolean") return authoritative;
    if (this._hass?.user?.is_admin) return true;
    const person = this.me;
    return person ? person.permissions?.[capability] ?? presetCapability(person.role, capability) : false;
  }
  private canEvent(item?: Item) {
    return this.can("manage_calendar_all") || (this.can("manage_calendar_own") && (!item || (item.person_ids || []).includes(this.me?.id) || [this.me?.id, this._hass?.user?.id].includes(item.creator_id)));
  }
  private person(id?: string) { return this.people.find((p: Item) => p.id === id); }
  private avatar(id?: string) {
    const person = this.person(id), picture = person?.profile_picture || person?.avatar_url;
    return picture ? html`<img class="avatar" src=${picture} alt=${person.name} loading="lazy" referrerpolicy="no-referrer">`
      : html`<span class="avatar fallback" style=${`--person-color:${this.color(person?.color)}`} aria-label=${person?.name || "Unassigned"}>${person?.initials || person?.name?.split(/\s+/).map((x: string) => x[0]).join("").slice(0, 2).toUpperCase() || "?"}</span>`;
  }
  private color(value?: string) { return /^#[0-9a-f]{3,8}$/i.test(value || "") ? value! : "#64748b"; }
  private date(day: string, options: Intl.DateTimeFormatOptions = { weekday: "long", month: "long", day: "numeric" }) { return dayDate(day).toLocaleDateString(this.locale, options); }
  private time(value: string) { return new Date(value).toLocaleTimeString(this.locale, { hour: "numeric", minute: "2-digit", hour12: this.settingsData.time_format === "12" }); }
  private peopleOptions(selected?: string) { return this.people.map((p: Item) => html`<option value=${p.id} ?selected=${p.id === selected}>${p.name}</option>`); }
  private async load() {
    if (!this._hass) return;
    const sequence = ++this.loadSequence;
    try {
      const values = await Promise.all(resources.map(resource => this._hass!.callWS<Item>({ type: "family_organizer/list", resource })));
      if (sequence !== this.loadSequence) return;
      this.data = Object.fromEntries(resources.map((resource, i) => [resource, values[i]]));
      const settings = this.settingsData;
      this.listId = resolveGroceryList(this.data.groceries.lists || [], this.listId, settings.default_grocery_list_id, !this.initialized);
      this.todoListId = resolveGroceryList(this.data.todos?.lists || [], this.todoListId);
      if (!this.initialized) {
        this.calendarView = settings.default_calendar_view || "month";
        this.scorePeriod = settings.competition_default || "week";
        this.theme = localStorage.getItem("family-organizer-theme") || settings.theme || "auto";
        this.initialized = true;
      }
      this.error = "";
      if (!this.unsubscribe && !this.subscribing && this.isConnected) {
        this.subscribing = true;
        try {
          const unsubscribe = await this._hass.connection.subscribeMessage(() => void this.load(), { type: "family_organizer/subscribe" });
          if (this.isConnected) this.unsubscribe = unsubscribe; else unsubscribe();
        } finally { this.subscribing = false; }
      }
    } catch (error) { if (sequence === this.loadSequence) this.error = this.message(error); }
    finally { if (sequence === this.loadSequence) this.loading = false; }
  }
  private message(error: unknown) { return (error as Item)?.message || String(error); }
  private async action(work: () => Promise<unknown>, success = "Saved", close = false) {
    if (this.saving) return false;
    this.saving = true; this.error = ""; this.notice = "";
    try {
      await work();
      await this.load();
      this.notice = success;
      if (close) this.closeEditor(true);
      return true;
    } catch (error) { this.error = this.message(error); return false; }
    finally { this.saving = false; }
  }
  private mutate(resource: string, item: Item, collection = "items") {
    const payload = resource === "calendar" && collection === "items" ? calendarPayload(item) : item;
    return this._hass!.callWS({ type: `family_organizer/${item.id ? "update" : "create"}`, resource, collection, ...(item.id ? { item_id: item.id } : {}), item: payload });
  }
  private confirmDelete(resource: string, item: Item, collection = "items") {
    this.openEditor("delete", item, resource, collection);
  }
  private openEditor(kind: string, item: Item = {}, resource?: string, collection?: string) {
    if (this.saving) return;
    if (!this.editor) this.returnFocus = (this.renderRoot as ShadowRoot).activeElement as HTMLElement;
    this.error = "";
    this.editor = { kind, item: { ...item }, resource, collection };
    void this.updateComplete.then(() => {
      const dialog = this.renderRoot.querySelector("dialog") as HTMLDialogElement;
      if (!dialog.open) dialog.showModal();
      (dialog.querySelector("[autofocus]") as HTMLElement || dialog.querySelector("input,select,button") as HTMLElement)?.focus();
    });
  }
  private closeEditor(force = false) {
    if (this.saving && !force) return;
    (this.renderRoot.querySelector("dialog") as HTMLDialogElement)?.close();
    this.editor = undefined;
    void this.updateComplete.then(() => this.returnFocus?.isConnected ? this.returnFocus.focus() : (this.renderRoot.querySelector(".quick-add") as HTMLElement)?.focus());
  }
  private async saveEditor(event: SubmitEvent) {
    event.preventDefault();
    if (!this.editor || this.saving) return;
    const form = event.currentTarget as HTMLFormElement, values = new FormData(form), v = Object.fromEntries(values), { kind, item } = this.editor;
    let resource = "", collection = "items", patch: Item = { ...item };
    const number = (name: string) => Number(v[name]) || 0;
    const text = (name: string) => String(v[name] || "").trim();
    const checked = (name: string) => values.has(name);
    if (kind === "delete") {
      const editor = this.editor;
      await this.action(() => this._hass!.callWS({ type: "family_organizer/delete", resource: editor.resource, collection: editor.collection || "items", item_id: item.id }), "Deleted", true);
      return;
    }
    if (kind === "event") {
      resource = "calendar";
      const allDay = checked("all_day"), day = text("day"), endDay = text("end_day");
      patch = { ...patch, title: text("title"), start: allDay ? day : `${day}T${text("start")}:00`, end: allDay ? shift(endDay, 1) : `${endDay}T${text("end")}:00`, all_day: allDay, description: text("description"), location: text("location"), recurrence: text("recurrence") || null, person_ids: values.getAll("person_ids"), shared: checked("shared") };
      if (new Date(patch.end) <= new Date(patch.start)) { this.error = "The event must end after it starts."; return; }
    } else if (kind === "grocery") {
      resource = "groceries";
      patch = { ...patch, name: text("name"), quantity: number("quantity"), unit: text("unit"), notes: text("notes"), store: text("store"), list_id: text("list_id"), assignee_id: text("assignee_id") || null, checked: !!item.checked, shared: checked("shared") };
    } else if (kind === "list") {
      resource = "groceries"; collection = "lists";
      patch = { ...patch, name: text("name"), store: text("store"), shared: checked("shared") };
    } else if (kind === "todo") {
      resource = "todos";
      patch = { ...patch, title: text("title"), notes: text("notes"), list_id: text("list_id"), due_date: text("due_date") || null, assignee_id: text("assignee_id") || null, done: !!item.done, shared: checked("shared") };
    } else if (kind === "todolist") {
      resource = "todos"; collection = "lists";
      patch = { ...patch, name: text("name"), shared: checked("shared") };
    } else if (kind === "journal") {
      resource = "journal";
      patch = { ...patch, title: text("title"), body: text("body"), day: text("day"), person_ids: values.getAll("person_ids"), photos: text("photos").split(/\r?\n/).map(x => x.trim()).filter(Boolean), shared: checked("shared") };
    } else if (kind === "meal") {
      resource = "groceries"; collection = "meal_slots";
      const recipe = (this.data.recipes.items || []).find((r: Item) => r.id === text("recipe_id"));
      patch = { ...patch, day: text("day"), slot: text("slot"), recipe_id: recipe?.id || null, title: recipe?.title || text("title"), servings: number("servings") };
      if (!patch.title) { this.error = "Choose a recipe or enter a meal name."; return; }
      const existing = (this.data.groceries.meal_slots || this.data.groceries.meal_plans || []).find((m: Item) => m.day === patch.day && (m.slot || m.meal) === patch.slot);
      if (existing && existing.id !== item.id) { this.error = "That meal slot is already planned. Edit it from the planner instead."; return; }
    } else if (kind === "chore") {
      resource = "chores";
      patch = { ...patch, title: text("title"), description: text("description"), icon: text("icon"), points: number("points"), assignee_ids: values.getAll("assignee_ids"), rotate: checked("rotate"), schedule: text("schedule"), weekdays: values.getAll("weekdays").map(Number), month_day: number("month_day"), interval_days: number("interval_days"), due_date: text("due_date") || null, due_time: text("due_time") || null, created: item.created || iso(new Date()), shared: checked("shared") };
      if (patch.schedule === "weekly" && !patch.weekdays.length) { this.error = "Choose at least one weekday."; return; }
    } else if (kind === "points") {
      await this.action(() => this._hass!.callWS({ type: "family_organizer/adjust_points", person_id: text("person_id"), points: number("points"), note: text("note") }), "Points adjusted", true); return;
    } else if (kind === "recipe") {
      resource = "recipes";
      const ingredients = mergeIngredients(text("ingredients"), item.ingredients || []);
      patch = { ...patch, title: text("title"), tags: text("tags").split(",").map(x => x.trim()).filter(Boolean), category_ids: values.getAll("category_ids"), image: text("image") || null, prep_time: number("prep_time"), cook_time: number("cook_time"), servings: number("servings"), ingredients, steps: text("steps").split(/\r?\n/).map(x => x.trim()).filter(Boolean), shared: checked("shared") };
    } else if (kind === "category") {
      resource = "recipes"; collection = "categories";
      patch = { ...patch, name: text("name"), parent_id: text("parent_id") || null };
    } else if (kind === "person") {
      resource = "people";
      const permissions: Item = {};
      capabilities.forEach(cap => { const value = text(cap); if (value !== "default") permissions[cap] = value === "allow"; });
      patch = { ...patch, name: text("name"), initials: text("name").split(/\s+/).map(x => x[0]).join("").slice(0, 2).toUpperCase(), color: text("color"), profile_picture: text("profile_picture") || null, user_id: text("user_id") || null, birthday: text("birthday") || null, role: text("role"), permissions, shared: true };
    } else if (kind === "preferences") {
      const settings: Item = {};
      ["overview_position", "week_start", "time_format", "default_calendar_view", "default_grocery_list_id", "competition_default", "language", "theme"].forEach(key => settings[key] = text(key));
      settings.overview_collapsed = checked("overview_collapsed");
      settings.sync_interval = number("sync_interval");
      settings.meal_slots = text("meal_slots").split(",").map(x => x.trim()).filter(Boolean);
      settings.stores = text("stores").split(",").map(x => x.trim()).filter(Boolean);
      if (!settings.meal_slots.length) { this.error = "Enter at least one meal slot."; return; }
      try { new Intl.DateTimeFormat(settings.language); } catch { this.error = "Enter a valid language code, such as en, de or fr."; return; }
      if (await this.action(() => this._hass!.callWS({ type: "family_organizer/settings", settings }), "Preferences saved", true)) {
        this.localOverview = undefined;
        this.theme = settings.theme; localStorage.setItem("family-organizer-theme", this.theme);
      }
      return;
    }
    if (resource) {
      ["occurrence_start", "occurrence_end", "unsupported_recurrence", "day", "start_time", "end_time"].forEach(key => {
        if (resource === "calendar") delete patch[key];
      });
      await this.action(() => this.mutate(resource, patch, collection), item.id ? "Changes saved" : "Added to your family organizer", true);
    }
  }

  render() {
    const current = pages.find(p => p.id === this.page)!;
    const effective = this.theme === "auto" ? (this._hass?.themes?.darkMode ? "dark" : "auto") : this.theme;
    return html`<div class="app" data-theme=${effective}>
      <a class="skip-link" href="#main" @click=${(e: Event) => { e.preventDefault(); (this.renderRoot.querySelector("main") as HTMLElement).focus(); }}>Skip to content</a>
      <button class="quick-add" @click=${() => this.openEditor("quick")} ?disabled=${this.loading || this.saving || !this.data.people}><span aria-hidden="true">+</span> Quick add</button>
      <a class="brand" href="#fo/today" @click=${() => this.navigate("today")}>
        <nav aria-label="Main navigation">${pages.map(page => html`<button class=${this.page === page.id ? "active" : ""} aria-current=${this.page === page.id ? "page" : nothing} @click=${() => this.navigate(page.id)}><span class="nav-icon" aria-hidden="true">${page.icon}</span><span>${page.name}</span></button>`)}</nav>
        <div class="sidebar-family"><span class="eyebrow">OUR PEOPLE</span><div class="avatar-stack">${this.people.map((p: Item) => this.avatar(p.id))}</div><p>${this.people.length ? `${this.people.length} people. One shared home.` : "Your family starts here."}</p></div>
        ${this.haMenuButton()}
        <small class="sidebar-note">Made for everyday together.</small>
      </aside>
      <div class="workspace"><header class="topbar"><div><span class="eyebrow">${this.date(iso(new Date()), { weekday: "long", month: "short", day: "numeric" })}</span><h1>${current.name}</h1><p>${current.subtitle}</p></div></header>
        <main id="main" tabindex="-1" aria-busy=${this.loading || this.saving}>
          ${this.error && !this.editor ? html`<div class="banner error" role="alert"><span>${this.error}</span><button @click=${() => void this.load()}>Retry</button></div>` : nothing}
          ${this.notice ? html`<div class="banner success" role="status">${this.notice}<button aria-label="Dismiss notification" @click=${() => this.notice = ""}>×</button></div>` : nothing}
          ${this.saving ? html`<p class="saving" role="status">Saving your changes…</p>` : nothing}
          ${this.loading ? html`<div class="empty loading" role="status"><span class="spinner"></span><h2>Getting your family together…</h2><p>Loading your calendar, lists and favorite recipes.</p></div>` : !this.data.people ? html`<div class="empty"><h2>Couldn’t load your organizer</h2><p>Check your connection and family permissions.</p><button class="primary" @click=${() => void this.load()}>Try again</button></div>` : this.renderPage()}
        </main>
      </div>
      <nav class="mobile-nav" aria-label="Mobile navigation">${pages.map(page => html`<button class=${this.page === page.id ? "active" : ""} aria-current=${this.page === page.id ? "page" : nothing} @click=${() => this.navigate(page.id)}><span aria-hidden="true">${page.icon}</span>${page.id === "groceries" ? "Shopping" : page.name}</button>`)}${this.haMenuButton(true)}</nav>
      ${this.editor ? this.dialog() : nothing}
    </div>`;
  }
  private haMenuButton(mobile = false) {
    return html`<button type="button" class=${`ha-shell-menu ${mobile ? "" : "sidebar-ha-menu"}`} aria-label="Open Home Assistant navigation" @click=${() => this.dispatchEvent(new CustomEvent("hass-toggle-menu", { bubbles: true, composed: true, detail: {} }))}><span class="ha-menu-icon" aria-hidden="true"></span><span>${mobile ? "HA menu" : "Home Assistant"}</span></button>`;
  }
  private renderPage() {
    switch (this.page) {
      case "today": return this.today();
      case "calendar": return this.calendar();
      case "groceries": return this.groceries();
      case "todos": return this.todos();
      case "chores": return this.chores();
      case "recipes": return this.recipes();
      case "journal": return this.journal();
      case "birthdays": return this.birthdays();
      default: return this.settings();
    }
  }
  private empty(title: string, description: string, button?: TemplateResult | typeof nothing) { return html`<div class="empty"><span class="empty-icon" aria-hidden="true">✧</span><h3>${title}</h3><p>${description}</p>${button || nothing}</div>`; }
  private addButton(label: string, kind: string, enabled: boolean, item: Item = {}) { return enabled ? html`<button class="primary" @click=${() => this.openEditor(kind, item)}>+ ${label}</button>` : nothing; }
  private filters() {
    return html`<div class="family-filters" aria-label="Filter calendar by family member"><button class=${!this.personFilter.size ? "chip active" : "chip"} aria-pressed=${!this.personFilter.size} @click=${() => this.personFilter = new Set()}>Everyone</button>${this.people.map((p: Item) => html`<button class=${this.personFilter.has(p.id) ? "chip active" : "chip"} aria-pressed=${this.personFilter.has(p.id)} @click=${() => { const next = new Set(this.personFilter); next.has(p.id) ? next.delete(p.id) : next.add(p.id); this.personFilter = next; }}>${this.avatar(p.id)}${p.name}</button>`)}</div>`;
  }
  private calendar() {
    const dates = calendarDates(this.selectedDay, this.calendarView, this.firstDay);
    const all = occurrences(this.data.calendar.items || [], dates[0], dates.at(-1)!);
    const events = all.filter(e => !this.personFilter.size || (e.person_ids || []).some((id: string) => this.personFilter.has(id)));
    const selected = eventsOnDay(events, this.selectedDay);
    const unsupported = (this.data.calendar.items || []).filter((event: Item) => unsupportedRecurrence(event.recurrence) && (!this.personFilter.size || (event.person_ids || []).some((id: string) => this.personFilter.has(id))));
    const collapsed = this.localOverview ?? this.settingsData.overview_collapsed;
    const title = this.calendarView === "month" ? this.date(this.selectedDay, { month: "long", year: "numeric" }) : this.calendarView === "day" ? this.date(this.selectedDay) : `${this.date(dates[0], { month: "short", day: "numeric" })} – ${this.date(dates[6], { month: "short", day: "numeric", year: "numeric" })}`;
    return html`<section aria-label="Family calendar"><div class="section-toolbar"><div class="date-navigation"><button class="icon-button" aria-label="Previous period" @click=${() => this.selectedDay = moveDate(this.selectedDay, this.calendarView, -1)}>‹</button><button @click=${() => this.selectedDay = iso(new Date())}>Today</button><button class="icon-button" aria-label="Next period" @click=${() => this.selectedDay = moveDate(this.selectedDay, this.calendarView, 1)}>›</button><h2>${title}</h2></div><div class="toolbar-actions"><div class="segmented" role="group" aria-label="Calendar view">${["month", "week", "day"].map(view => html`<button class=${this.calendarView === view ? "active" : ""} aria-pressed=${this.calendarView === view} @click=${() => this.calendarView = view}>${view[0].toUpperCase() + view.slice(1)}</button>`)}</div><label class="sr-only" for="calendar-date">Go to date</label><input id="calendar-date" type="date" .value=${this.selectedDay} @change=${(e: Event) => { const value = (e.target as HTMLInputElement).value; if (value) this.selectedDay = value; }}></div></div>
      ${this.filters()}
      <div class=${`calendar-shell overview-${this.settingsData.overview_position || "right"} ${collapsed ? "overview-closed" : ""}`}><div class="calendar-surface">
        ${this.calendarView === "month" ? html`<div class="weekday-row">${dates.slice(0, 7).map(day => html`<span>${this.date(day, { weekday: "short" })}</span>`)}</div><div class="month-grid">${dates.map(day => {
          const items = eventsOnDay(events, day);
          return html`<div class=${`month-cell ${day.slice(0, 7) !== this.selectedDay.slice(0, 7) ? "outside" : ""} ${day === this.selectedDay ? "selected" : ""}`}>
            <div class="cell-heading"><button class=${day === iso(new Date()) ? "day-number today" : "day-number"} aria-label=${`Agenda for ${this.date(day)}`} aria-pressed=${day === this.selectedDay} @click=${() => this.selectedDay = day}>${dayDate(day).getDate()}</button>${this.canEvent() ? html`<button class="date-add" aria-label=${`Add event on ${this.date(day)}`} @click=${() => { this.selectedDay = day; this.openEditor("event", { day }); }}>+</button>` : nothing}</div>
            <button class="cell-create" aria-label=${`Create event on ${this.date(day)}`} ?disabled=${!this.canEvent()} @click=${() => { this.selectedDay = day; this.openEditor("event", { day }); }}></button>
            <div class="cell-events">${items.slice(0, 3).map(event => this.eventChip(event))}${items.length > 3 ? html`<button class="more-events" @click=${() => this.selectedDay = day}>+${items.length - 3} more</button>` : nothing}</div>
          </div>`;
        })}</div>` : this.timeGrid(dates, events)}
      </div><aside class="agenda"><button class="agenda-toggle" aria-expanded=${!collapsed} @click=${() => { this.localOverview = !collapsed; this.requestUpdate(); if (this.can("manage_settings")) void this.action(() => this._hass!.callWS({ type: "family_organizer/settings", settings: { overview_collapsed: !collapsed } }), "Overview updated"); }}>${collapsed ? "Show" : "Hide"} day agenda <span aria-hidden="true">${collapsed ? "+" : "−"}</span></button>${collapsed ? nothing : html`<span class="eyebrow">THE DAY AT A GLANCE</span><h2>${this.date(this.selectedDay, { weekday: "long" })}</h2><p class="muted">${this.date(this.selectedDay, { month: "long", day: "numeric" })} · ${selected.length} events</p><div class="agenda-events">${selected.length ? selected.map(event => html`<button class="agenda-event" style=${`--event-color:${this.eventColor(event)}`} @click=${() => this.openEditor("event-detail", event)}><span class="event-time">${event.all_day ? "All day" : this.time(event.occurrence_start)}</span><strong>${event.title}</strong><span class="muted">${event.location || "No location"}</span><span class="event-people">${(event.person_ids || []).map((id: string) => this.avatar(id))}</span></button>`) : this.empty("Room to breathe", this.personFilter.size ? "No events for the selected family members." : "Nothing on the calendar for this day.")}</div>${this.addButton("Add an event", "event", this.canEvent(), { day: this.selectedDay })}`}</aside></div>
      <p class="calendar-hint">Select a day number to see its agenda. Select an empty day or + to add an event.</p>
      ${unsupported.length ? html`<div class="banner recurrence-warning" role="status"><p>These recurrence rules cannot be expanded in this calendar. Their original text is preserved; only the original event is shown when it falls in the displayed period.</p><ul>${unsupported.map((event: Item) => html`<li><strong>${event.title}</strong>: <code>${event.recurrence}</code></li>`)}</ul></div>` : nothing}
    </section>`;
  }
  private eventColor(event: Item) { return this.color(this.person(event.person_ids?.[0])?.color || (this.data.calendar.sources || []).find((s: Item) => s.id === event.source_id)?.color); }
  private eventChip(event: Item, style = "") { return html`<button class=${`event-chip ${event.all_day ? "all-day-event" : ""}`} style=${`--event-color:${this.eventColor(event)};${style}`} @click=${() => this.openEditor("event-detail", event)} title=${`${event.all_day ? "All day" : this.time(event.occurrence_start)} · ${event.title}`}><span class="event-dot" aria-hidden="true"></span><span>${event.all_day ? nothing : html`<time class="event-start" datetime=${event.occurrence_start}>${this.time(event.occurrence_start)}</time> `}<strong>${event.title}</strong></span>${event.recurrence ? html`<span aria-label="Repeating event">↻</span>` : nothing}</button>`; }
  private timeGrid(dates: string[], events: Item[]) {
    const hours = Array.from({ length: 24 }, (_, i) => i), now = new Date();
    return html`<div class="time-scroll"><div class="time-calendar" style=${`--days:${dates.length}`}><div class="time-header"><span></span>${dates.map(day => html`<button class=${day === this.selectedDay ? "active" : ""} @click=${() => this.selectedDay = day}><small>${this.date(day, { weekday: "short" })}</small><strong class=${day === iso(now) ? "today" : ""}>${dayDate(day).getDate()}</strong></button>`)}</div><div class="all-day-row"><span>All day</span>${dates.map(day => html`<div>${eventsOnDay(events, day).filter(e => e.all_day).map(event => this.eventChip(event))}${this.canEvent() ? html`<button class="subtle" aria-label=${`Add all-day event on ${this.date(day)}`} @click=${() => this.openEditor("event", { day, all_day: true })}>+</button>` : nothing}</div>`)}</div>
      <div class="time-body"><div class="time-labels">${hours.map(hour => html`<span>${this.time(`${dates[0]}T${String(hour).padStart(2, "0")}:00:00`)}</span>`)}</div>${dates.map(day => html`<div class="time-column">${hours.map(hour => html`<button class="hour-slot" aria-label=${`Add event ${this.date(day)} at ${hour}:00`} ?disabled=${!this.canEvent()} @click=${() => this.openEditor("event", { day, start_time: `${String(hour).padStart(2, "0")}:00`, end_time: `${String(Math.min(hour + 1, 23)).padStart(2, "0")}:${hour === 23 ? "59" : "00"}` })}></button>`)}<div class="positioned-events">${eventLayout(eventsOnDay(events, day).filter(e => !e.all_day)).map(({ event, lane, columns }, i) => {
        const start = new Date(event.occurrence_start), end = new Date(event.occurrence_end), a = iso(start) < day ? 0 : start.getHours() * 60 + start.getMinutes(), b = iso(end) > day ? 1440 : end.getHours() * 60 + end.getMinutes();
        return this.eventChip(event, `top:${a / 60 * 52}px;height:${Math.max(26, (b - a) / 60 * 52)}px;left:${lane / columns * 100}%;width:${100 / columns}%;z-index:${i + 1}`);
      })}</div>${day === iso(now) ? html`<div class="now-line" style=${`top:${(now.getHours() + now.getMinutes() / 60) * 52}px`} aria-label="Current time"></div>` : nothing}</div>`)}</div></div></div>`;
  }

  private groceries() {
    const grocery = this.data.groceries, lists = grocery.lists || [], current = lists.find((x: Item) => x.id === this.listId);
    let items = (grocery.items || []).filter((x: Item) => x.list_id === this.listId && (!this.groceryAssignee || x.assignee_id === this.groceryAssignee));
    items = [...items].sort((a: Item, b: Item) => (this.groupStores ? (a.store || "").localeCompare(b.store || "") : 0) || Number(a.checked) - Number(b.checked));
    const bought = items.filter((x: Item) => x.checked).length, can = this.can("manage_groceries");
    return html`<section><div class="shopping-layout"><div class="surface shopping-list"><div class="surface-heading"><div><span class="eyebrow">SHOPPING LIST</span><h2>${current?.name || "Groceries"}</h2><p class="muted">${items.length - bought} to buy · ${bought} in the basket</p></div>${this.addButton("Add item", "grocery", can, { list_id: this.listId, store: current?.store || "" })}</div>
      <div class="list-tabs" role="group" aria-label="Grocery lists">
      <div class="list-tools"><label>Assigned to<select .value=${this.groceryAssignee} @change=${(e: Event) => this.groceryAssignee = (e.target as HTMLSelectElement).value}><option value="">Everyone</option>${this.peopleOptions()}</select></label><label class="check"><input type="checkbox" .checked=${this.groupStores} @change=${() => this.groupStores = !this.groupStores}>Group by store</label>${can ? html`<button ?disabled=${!bought || this.saving} @click=${() => void this.action(async () => { for (const item of items.filter((x: Item) => x.checked)) await this._hass!.callWS({ type: "family_organizer/delete", resource: "groceries", item_id: item.id }); }, "Bought items cleared")}>Clear bought</button>` : nothing}</div>
      this.addButton("Add your first item", "grocery", can, { list_id: this.listId }))}</div></div>
      <aside class="surface shopping-aside"><span class="eyebrow">A LITTLE ORGANIZATION</span><h3>One list for every stop</h3><p class="muted">Keep the supermarket, farmers’ market and pantry runs separate. Matching items merge automatically.</p>${this.addButton("New list", "list", can)}${can && current ? html`<button @click=${() => this.openEditor("list", current)}>Edit list</button><button class="danger" ?disabled=${lists.length < 2} @click=${() => this.confirmDelete("groceries", current, "lists")}>Delete list</button><small class="muted">Deleting a list also removes its grocery items. Keep at least one list.</small>` : nothing}<hr><h3>What’s cooking?</h3><p class="muted">Plan the week and shop recipe ingredients straight into this list.</p><button @click=${() => this.navigate("recipes")}>Meal planner & recipes →</button></aside></div></section>`;
  }
  private mealPlanner() {
    const grocery = this.data.groceries, start = shift(weekStart(iso(new Date()), this.firstDay), this.mealWeek * 7), slots = grocery.meal_slots || grocery.meal_plans || [];
    return html`<div class="section-toolbar meal-heading"><div><span class="eyebrow">LESS “WHAT’S FOR DINNER?”</span><h2>Your weekly meal plan</h2></div><div class="date-navigation"><button class="icon-button" aria-label="Previous meal week" @click=${() => this.mealWeek--}>‹</button><button @click=${() => this.mealWeek = 0}>This week</button><button class="icon-button" aria-label="Next meal week" @click=${() => this.mealWeek++}>›</button><span>${this.date(start, { month: "short", day: "numeric" })} – ${this.date(shift(start, 6), { month: "short", day: "numeric" })}</span></div></div>
      <div class="meal-grid">${Array.from({ length: 7 }, (_, i) => {
        const day = shift(start, i);
        return html`<article class=${`meal-day ${day === iso(new Date()) ? "meal-today" : ""}`}><header><span>${this.date(day, { weekday: "short" })}</span><strong>${dayDate(day).getDate()}</strong></header>${(this.settingsData.meal_slots || ["breakfast", "lunch", "dinner"]).map((slot: string) => {
          const plan = slots.find((x: Item) => x.day === day && (x.slot || x.meal) === slot);
          return html`<div class="meal-slot"><span class="eyebrow">${slot}</span>${plan ? html`<button class="meal-title" @click=${() => this.can("manage_meal_plan") ? this.openEditor("meal", plan) : plan.recipe_id ? this.navigate("recipes", plan.recipe_id) : undefined}>${plan.title}<small>${fraction(Number(plan.servings || 1))} servings</small></button>${plan.recipe_id ? html`<button class="text-button" @click=${() => this.navigate("recipes", plan.recipe_id)}>Recipe →</button>` : nothing}${this.can("manage_meal_plan") ? html`<button class="text-button danger" aria-label=${`Remove ${plan.title} from ${day} ${slot}`} @click=${() => this.confirmDelete("groceries", plan, "meal_slots")}>Remove</button>` : nothing}` : this.can("manage_meal_plan") ? html`<button class="meal-empty" aria-label=${`Plan ${slot} on ${this.date(day)}`} @click=${() => this.openEditor("meal", { day, slot, servings: 4 })}>+ Plan meal</button>` : html`<span class="muted">Not planned</span>`}</div>`;
        })}</article>`;
      })}</div>`;
  }

  private choreIcon(chore: Item) {
    return html`<ha-icon .icon=${chore.icon || "mdi:check-circle-outline"} aria-hidden="true"></ha-icon><span class="chore-icon-fallback" aria-hidden="true">✓</span>`;
  }
  private chores() {
    const chores = this.data.chores.items || [], completions = this.data.chores.completions || [], due = chores.filter((c: Item) => choreDue(c, this.selectedDay));
    const today = iso(new Date()), periodStart = this.scorePeriod === "week" ? weekStart(today, this.firstDay) : `${today.slice(0, 7)}-01`;
    const next = this.scorePeriod === "week" ? shift(periodStart, 7) : moveDate(periodStart, "month", 1);
    const priorStart = this.scorePeriod === "week" ? shift(periodStart, -7) : moveDate(periodStart, "month", -1);
    const score = (start: string, end: string) => this.people.map((person: Item) => ({ person, points: completions.filter((x: Item) => x.person_id === person.id && iso(new Date(x.completed_at)) >= start && iso(new Date(x.completed_at)) < end).reduce((n: number, x: Item) => n + Number(x.points || 0), 0) })).sort((a: Item, b: Item) => b.points - a.points);
    const scores = score(periodStart, next), previous = score(priorStart, periodStart), max = Math.max(1, ...scores.map((x: Item) => x.points));
    return html`<section><div class="chore-layout"><div class="surface"><div class="surface-heading"><div><span class="eyebrow">TEAMWORK MAKES HOME WORK</span><h2>The chore board</h2></div>${this.addButton("New chore", "chore", this.can("manage_chores"))}</div><div class="section-toolbar"><label>Chores for<input type="date" .value=${this.selectedDay} @change=${(e: Event) => { const value = (e.target as HTMLInputElement).value; if (value) this.selectedDay = value; }}></label><span class="muted">${due.length} scheduled · ${due.filter((c: Item) => completions.some((x: Item) => x.chore_id === c.id && iso(new Date(x.completed_at)) === this.selectedDay)).length} completed</span></div>
      <div class="chore-list">${due.length ? due.map((chore: Item) => {
        const ids = chore.assignee_ids || (chore.assignee_id ? [chore.assignee_id] : []), active = ids[(Number(chore.rotation_index) || 0) % Math.max(1, ids.length)];
        const done = completions.some((x: Item) => x.chore_id === chore.id && iso(new Date(x.completed_at)) === this.selectedDay);
        const overdue = !done && (this.selectedDay < today || (this.selectedDay === today && chore.due_time && chore.due_time < new Date().toTimeString().slice(0, 5)));
        const own = this.me && (ids.includes(this.me.id) || [this.me.id, this._hass?.user?.id].includes(chore.creator_id));
        const canComplete = this.can("complete_any_chore") || (this.can("complete_own_chores") && own);
        return html`<article class=${`chore-card ${done ? "done" : overdue ? "overdue" : ""}`}><div class="chore-symbol" aria-hidden="true">${this.choreIcon(chore)}</div><div class="row-copy"><strong>${chore.title}</strong><span class="muted">${chore.description || (done ? "Nice work!" : overdue ? "Overdue" : `Due ${chore.due_time || "today"}`)}</span><span class="assignee">${this.avatar(active)}${this.person(active)?.name || "Anyone"}${chore.rotate ? " · rotating" : ""}</span></div><span class="points-badge">${chore.points} pts</span><button class=${done ? "" : "primary"} ?disabled=${done || !canComplete || this.saving || this.selectedDay !== today} title=${this.selectedDay !== today ? "Completions are recorded for today" : ""} @click=${() => void this.action(() => this._hass!.callWS({ type: "family_organizer/complete_chore", chore_id: chore.id, ...(this.can("complete_any_chore") ? active ? { person_id: active } : {} : { person_id: this.me.id }) }), "Chore completed. Thank you!")}>${done ? "Done ✓" : "Complete"}</button>${this.can("manage_chores") ? html`<button class="icon-button" aria-label=${`Edit ${chore.title}`} @click=${() => this.openEditor("chore", chore)}>✎</button><button class="icon-button" aria-label=${`Delete ${chore.title}`} @click=${() => this.confirmDelete("chores", chore)}>×</button>` : nothing}</article>`;
      }) : this.empty("All clear for this day", "Schedule a chore to share the load.", this.addButton("Create a chore", "chore", this.can("manage_chores")))}</div>
      ${this.selectedDay !== today ? html`<p class="muted">You’re browsing another day. Chore completions are recorded for today only.</p>` : nothing}
      <details class="all-chores"><summary>All scheduled chores (${chores.length})</summary>${chores.map((chore: Item) => html`<div class="compact-row"><span>${chore.title} <small class="muted">· ${chore.schedule}</small></span>${this.can("manage_chores") ? html`<button @click=${() => this.openEditor("chore", chore)}>Edit</button>` : nothing}</div>`)}</details></div>
      <aside class="surface leaderboard"><span class="eyebrow">A FRIENDLY LITTLE COMPETITION</span><h2>Family leaderboard</h2><div class="segmented" role="group" aria-label="Score period">${["week", "month"].map(period => html`<button class=${this.scorePeriod === period ? "active" : ""} aria-pressed=${this.scorePeriod === period} @click=${() => this.scorePeriod = period}>This ${period}</button>`)}</div><p class="muted">${this.date(periodStart, { month: "short", day: "numeric" })} – ${this.date(shift(next, -1), { month: "short", day: "numeric" })}</p>${scores.length ? scores.map((s: Item, i: number) => html`<article class="score-row"><span class="rank">${i === 0 && s.points > 0 ? "♛" : i + 1}</span>${this.avatar(s.person.id)}<div class="row-copy"><strong>${s.person.name}</strong><progress max=${max} value=${Math.max(0, s.points)} aria-label=${`${s.person.name}: ${s.points} points`}></progress></div><strong>${s.points}<small> pts</small></strong></article>`) : this.empty("Meet your team", "Add family members in Settings.")}<div class="prior-winner"><span aria-hidden="true">★</span><div><strong>Last ${this.scorePeriod}’s star</strong><p>${previous[0]?.points > 0 ? `${previous[0].person.name} · ${previous[0].points} points` : "A fresh start for everyone"}</p></div></div></aside></div>
      <div class="surface history"><div class="surface-heading"><div><span class="eyebrow">EVERY CONTRIBUTION COUNTS</span><h2>Recent activity</h2></div>${this.addButton("Adjust points", "points", this.can("manage_chores") && this.people.length > 0)}</div>${completions.length ? [...completions].sort((a: Item, b: Item) => b.completed_at.localeCompare(a.completed_at)).slice(0, 30).map((completion: Item) => html`<div class="compact-row">${this.avatar(completion.person_id)}<span class="row-copy"><strong>${this.person(completion.person_id)?.name || "Family member"}</strong><span class="muted">${completion.note || chores.find((c: Item) => c.id === completion.chore_id)?.title || (completion.adjustment ? "Manual adjustment" : "Completed chore")}</span></span><time>${this.date(iso(new Date(completion.completed_at)), { month: "short", day: "numeric" })} · ${this.time(completion.completed_at)}</time><strong>${completion.points > 0 ? "+" : ""}${completion.points} pts</strong></div>`) : this.empty("Your story starts here", "Completed chores and point adjustments will appear here.")}</div>
    </section>`;
  }

  private recipes() {
    const recipes = this.data.recipes.items || [], categories = this.data.recipes.categories || [];
    if (this.recipeId) {
      const recipe = recipes.find((r: Item) => r.id === this.recipeId);
      return recipe ? this.recipeDetail(recipe) : html`<button @click=${() => this.navigate("recipes")}>← All recipes</button>${this.empty("Recipe not found", "It may have been deleted or is no longer shared with you.")}`;
    }
    const visible = recipes.filter((r: Item) => (!this.recipeCategory || (r.category_ids || []).includes(this.recipeCategory)) && `${r.title} ${(r.tags || []).join(" ")}`.toLowerCase().includes(this.recipeSearch.toLowerCase()));
    return html`<section>${this.mealPlanner()}<hr><div class="section-toolbar"><div><span class="eyebrow">THE FAMILY COOKBOOK</span><h2>Favorites, all in one place</h2></div>${this.addButton("New recipe", "recipe", this.can("manage_recipes"))}</div><div class="recipe-toolbar"><label class="search-label"><span class="sr-only">Search recipes or tags</span><input type="search" placeholder="Search recipes or tags…" .value=${this.recipeSearch} @input=${(e: Event) => this.recipeSearch = (e.target as HTMLInputElement).value}></label><label>Category<select .value=${this.recipeCategory} @change=${(e: Event) => this.recipeCategory = (e.target as HTMLSelectElement).value}><option value="">All categories</option>${categories.map((c: Item) => html`<option value=${c.id}>${this.categoryPath(c)}</option>`)}</select></label>${this.can("manage_recipes") ? html`<button @click=${() => this.openEditor("categories")}>Manage categories</button>` : nothing}</div>
      <div class="recipe-grid">${visible.length ? visible.map((recipe: Item) => html`<button class="recipe-card" @click=${() => this.navigate("recipes", recipe.id)}>${recipe.image ? html`<img src=${recipe.image} alt="" loading="lazy" referrerpolicy="no-referrer">` : html`<div class="recipe-placeholder" aria-hidden="true">♧<span>FROM OUR KITCHEN</span></div>`}<div class="recipe-card-copy"><span class="eyebrow">${(recipe.category_ids || []).map((id: string) => categories.find((c: Item) => c.id === id)?.name).filter(Boolean).join(" · ") || "Family favorite"}</span><h3>${recipe.title}</h3><p class="muted">${Number(recipe.prep_time || 0) + Number(recipe.cook_time || 0)} min · ${fraction(Number(recipe.servings || 4))} servings</p><div class="tags">${(recipe.tags || []).slice(0, 3).map((tag: string) => html`<span>${tag}</span>`)}</div></div></button>`) : this.empty(this.recipeSearch || this.recipeCategory ? "No recipes match" : "Start your family cookbook", "Save a favorite recipe, scale its servings and send ingredients to your lists.", this.addButton("Add a recipe", "recipe", this.can("manage_recipes")))}</div></section>`;
  }
  private categoryPath(category: Item) {
    const path = [category.name], seen = new Set([category.id]); let parent = category.parent_id;
    while (parent && !seen.has(parent)) { seen.add(parent); const item = (this.data.recipes.categories || []).find((c: Item) => c.id === parent); if (!item) break; path.unshift(item.name); parent = item.parent_id; }
    return path.join(" / ");
  }
  private recipeDetail(recipe: Item) {
    const amount = this.servings[recipe.id] ?? (Number(recipe.servings) || 4), base = Number(recipe.servings) || 1, ingredients = recipe.ingredients || [];
    const selected = this.selectedIngredients[recipe.id] || new Set<number>(ingredients.map((_: Item, i: number) => i)), lists = this.data.groceries.lists || [];
    return html`<section><div class="section-toolbar"><button @click=${() => this.navigate("recipes")}>← All recipes</button><div class="toolbar-actions">${this.can("manage_recipes") ? html`<button @click=${() => this.openEditor("recipe", recipe)}>Edit recipe</button><button class="danger" @click=${() => this.confirmDelete("recipes", recipe)}>Delete</button>` : nothing}</div></div>
      <div class="recipe-hero">${recipe.image ? html`<img src=${recipe.image} alt=${recipe.title} referrerpolicy="no-referrer">` : html`<div class="recipe-hero-art" aria-hidden="true">♧</div>`}<div><span class="eyebrow">FROM THE FAMILY COOKBOOK</span><h2>${recipe.title}</h2><div class="tags">${(recipe.tags || []).map((tag: string) => html`<span>${tag}</span>`)}</div><p class="muted">Prep ${recipe.prep_time || 0} min · Cook ${recipe.cook_time || 0} min</p>${this.addButton("Plan this meal", "meal", this.can("manage_meal_plan"), { day: this.selectedDay, slot: (this.settingsData.meal_slots || ["dinner"])[0], recipe_id: recipe.id, title: recipe.title, servings: amount })}</div></div>
      <div class="recipe-detail-grid"><div class="surface ingredient-panel"><div class="surface-heading"><h3>Ingredients</h3><div class="serving-control"><button aria-label="Decrease servings" ?disabled=${amount <= .25} @click=${() => this.servings = { ...this.servings, [recipe.id]: Math.max(.25, amount - .25) }}>−</button><label><span class="sr-only">Servings</span><input type="number" min=".25" step=".25" .value=${String(amount)} @change=${(e: Event) => { const n = Number((e.target as HTMLInputElement).value); if (n > 0) this.servings = { ...this.servings, [recipe.id]: n }; }}></label><button aria-label="Increase servings" @click=${() => this.servings = { ...this.servings, [recipe.id]: amount + .25 }}>+</button></div></div><p class="muted">${fraction(amount)} servings · automatically scaled from ${base}</p><p class="muted">Check ingredients to send to your grocery lists.</p>
        ${ingredients.map((ingredient: Item, i: number) => html`<div class="ingredient-row"><label class="check"><input type="checkbox" .checked=${selected.has(i)} @change=${() => { const next = new Set(selected); next.has(i) ? next.delete(i) : next.add(i); this.selectedIngredients = { ...this.selectedIngredients, [recipe.id]: next }; }}><span><strong>${fraction(Number(ingredient.amount || 0) * amount / base)} ${ingredient.unit || ""}</strong> ${ingredient.name}</span></label><label><span class="sr-only">List for ${ingredient.name}</span><select .value=${this.routes[recipe.id]?.[String(i)] || this.listId} @change=${(e: Event) => this.routes = { ...this.routes, [recipe.id]: { ...this.routes[recipe.id], [String(i)]: (e.target as HTMLSelectElement).value } }}>${lists.map((list: Item) => html`<option value=${list.id}>${list.name}</option>`)}</select></label></div>`)}
        <button class="primary wide" ?disabled=${!this.can("manage_groceries") || !selected.size || !lists.length || this.saving} @click=${() => void this.action(() => this._hass!.callWS({ type: "family_organizer/recipe_to_groceries", recipe_id: recipe.id, servings: amount, list_id: this.listId, selected: [...selected].sort((a, b) => a - b), routes: this.routes[recipe.id] || {} }), `${selected.size} ingredients sent to your grocery lists`)}>+ Add selected to groceries</button>
      </div><div class="surface method-panel"><span class="eyebrow">LET’S MAKE SOMETHING GOOD</span><h3>Method</h3><ol>${(recipe.steps || recipe.instructions || []).map((step: string) => html`<li>${step}</li>`)}</ol>${!(recipe.steps || recipe.instructions || []).length ? html`<p class="muted">No instructions yet. Edit this recipe to add the method.</p>` : nothing}</div></div></section>`;
  }

  private today() {
    const today = iso(new Date()), week = shift(today, 6);
    const events = eventsOnDay(occurrences(this.data.calendar.items || [], today, today), today);
    const upcoming = occurrences(this.data.calendar.items || [], shift(today, 1), week).slice(0, 6);
    const groceries = (this.data.groceries.items || []).filter((x: Item) => !x.checked), todos = (this.data.todos?.items || []).filter((x: Item) => !x.done);
    const chores = (this.data.chores.items || []).filter((c: Item) => choreDue(c, today)), completions = this.data.chores.completions || [];
    const meals = (this.data.groceries.meal_slots || this.data.groceries.meal_plans || []).filter((m: Item) => m.day === today);
    const birthdays: BirthdayRow[] = this.people.map((p: Item) => ({ person: p, next: nextBirthday(p.birthday, today) })).filter((x: BirthdayRow) => x.next && x.next.days <= 14).sort((a: BirthdayRow, b: BirthdayRow) => a.next!.days - b.next!.days);
    const greeting = new Date().getHours() < 12 ? "Good morning" : new Date().getHours() < 18 ? "Good afternoon" : "Good evening";
    const summary = `${events.length ? `${events.length} event${events.length === 1 ? "" : "s"}` : "A quiet calendar"} · ${chores.length} chore${chores.length === 1 ? "" : "s"} · ${groceries.length} to buy · ${todos.length} to do`;
    return html`<section class="today-page"><div class="today-hero"><div><span class="eyebrow">${this.date(today)}</span><h2>${greeting}${this.me ? `, ${this.me.name.split(" ")[0]}` : ""}.</h2><p class="muted">${summary}</p></div>
      ${birthdays.length ? html`<div class="birthday-callout">${birthdays.map((b: BirthdayRow) => html`<span>${this.avatar(b.person.id)}<strong>${b.person.name}</strong> ${b.next!.days === 0 ? "turns" : "soon turns"} ${b.next!.age ?? "another year"}${b.next!.days === 0 ? " today 🎉" : ` in ${b.next!.days} day${b.next!.days === 1 ? "" : "s"}`}</span>`)}</div>` : nothing}</div>
      <div class="today-grid">
        <article class="surface"><div class="surface-heading"><div><span class="eyebrow">TODAY’S AGENDA</span><h3>Calendar</h3></div><button @click=${() => { this.selectedDay = today; this.navigate("calendar"); }}>Open calendar →</button></div>${events.length ? events.map(event => html`<button class="agenda-event" style=${`--event-color:${this.eventColor(event)}`} @click=${() => this.openEditor("event-detail", event)}><span class="event-time">${event.all_day ? "All day" : this.time(event.occurrence_start)}</span><strong>${event.title}</strong><span class="event-people">${(event.person_ids || []).map((id: string) => this.avatar(id))}</span></button>`) : html`<p class="muted">Nothing scheduled today.</p>`}${upcoming.length ? html`<span class="eyebrow">COMING UP</span>${upcoming.map(event => html`<div class="compact-row"><span class="event-dot" style=${`background:${this.eventColor(event)}`}></span><span class="row-copy"><strong>${event.title}</strong><span class="muted">${this.date(iso(new Date(event.occurrence_start)), { weekday: "short", month: "short", day: "numeric" })}${event.all_day ? "" : ` · ${this.time(event.occurrence_start)}`}</span></span></div>`)}` : nothing}${this.addButton("Add an event", "event", this.canEvent(), { day: today })}</article>
        <article class="surface"><div class="surface-heading"><div><span class="eyebrow">WHAT’S FOR DINNER?</span><h3>Meals</h3></div><button @click=${() => this.navigate("recipes")}>Meal planner →</button></div>${(this.settingsData.meal_slots || ["breakfast", "lunch", "dinner"]).map((slot: string) => { const plan = meals.find((m: Item) => (m.slot || m.meal) === slot); return html`<div class="compact-row"><span class="eyebrow">${slot}</span><strong>${plan?.title || html`<span class="muted">Not planned</span>`}</strong></div>`; })}</article>
        <article class="surface"><div class="surface-heading"><div><span class="eyebrow">SHOPPING</span><h3>${groceries.length} to buy</h3></div><button @click=${() => this.navigate("groceries")}>Shopping lists →</button></div>${groceries.slice(0, 6).map((item: Item) => html`<div class="compact-row"><span>• ${item.name}</span><small class="muted">${(this.data.groceries.lists || []).find((l: Item) => l.id === item.list_id)?.name || ""}</small></div>`)}${groceries.length > 6 ? html`<small class="muted">+${groceries.length - 6} more</small>` : nothing}${this.addButton("Add item", "grocery", this.can("manage_groceries"), { list_id: this.listId })}</article>
        <article class="surface"><div class="surface-heading"><div><span class="eyebrow">TO DO</span><h3>${todos.length} open</h3></div><button @click=${() => this.navigate("todos")}>To-do lists →</button></div>${todos.slice(0, 6).map((item: Item) => html`<label class="check compact-row"><input type="checkbox" ?disabled=${!this.can("manage_todos") || this.saving} @change=${() => void this.action(() => this.mutate("todos", { ...item, done: true }), "Nice, one less thing")}><span class="row-copy"><strong>${item.title}</strong>${item.due_date ? html`<span class="muted">Due ${this.date(item.due_date, { month: "short", day: "numeric" })}</span>` : nothing}</span>${item.assignee_id ? this.avatar(item.assignee_id) : nothing}</label>`)}${this.addButton("Add to-do", "todo", this.can("manage_todos"), { list_id: this.todoListId })}</article>
        <article class="surface"><div class="surface-heading"><div><span class="eyebrow">CHORES</span><h3>${chores.length} today</h3></div><button @click=${() => { this.selectedDay = today; this.navigate("chores"); }}>Chore board →</button></div>${chores.map((chore: Item) => { const ids = chore.assignee_ids || [], active = ids[(Number(chore.rotation_index) || 0) % Math.max(1, ids.length)], done = completions.some((x: Item) => x.chore_id === chore.id && iso(new Date(x.completed_at)) === today); return html`<div class=${`compact-row ${done ? "done" : ""}`}>${this.avatar(active)}<span class="row-copy"><strong>${chore.title}</strong><span class="muted">${done ? "Done ✓" : `${chore.points} pts`}</span></span></div>`; })}${!chores.length ? html`<p class="muted">No chores due today.</p>` : nothing}</article>
        <article class="surface"><div class="surface-heading"><div><span class="eyebrow">FAMILY JOURNAL</span><h3>Latest moment</h3></div><button @click=${() => this.navigate("journal")}>Journal →</button></div>${(() => { const latest = [...(this.data.journal?.items || [])].sort((a: Item, b: Item) => `${b.day}`.localeCompare(a.day))[0]; return latest ? html`<p class="eyebrow">${this.date(latest.day, { month: "short", day: "numeric", year: "numeric" })}</p><strong>${latest.title}</strong><p class="muted journal-excerpt">${latest.body}</p>` : html`<p class="muted">Write down something worth remembering.</p>`; })()}${this.addButton("New entry", "journal", this.can("manage_journal"), { day: today })}</article>
      </div></section>`;
  }

  private todos() {
    const data = this.data.todos || {}, lists = data.lists || [], current = lists.find((x: Item) => x.id === this.todoListId), can = this.can("manage_todos");
    let items = (data.items || []).filter((x: Item) => x.list_id === this.todoListId);
    const open = items.filter((x: Item) => !x.done), done = items.filter((x: Item) => x.done);
    items = [...open.sort((a: Item, b: Item) => (a.due_date || "9").localeCompare(b.due_date || "9")), ...(this.showDoneTodos ? done : [])];
    return html`<section><div class="shopping-layout"><div class="surface shopping-list"><div class="surface-heading"><div><span class="eyebrow">TO-DO LIST</span><h2>${current?.name || "To Do"}</h2><p class="muted">${open.length} open · ${done.length} done</p></div>${this.addButton("Add to-do", "todo", can, { list_id: this.todoListId })}</div>
      <div class="list-tabs" role="group" aria-label="To-do lists">${lists.map((list: Item) => html`<button class=${list.id === this.todoListId ? "active" : ""} aria-pressed=${list.id === this.todoListId} @click=${() => this.todoListId = list.id}>${list.name}</button>`)}</div>
      <div class="list-tools"><label class="check"><input type="checkbox" .checked=${this.showDoneTodos} @change=${() => this.showDoneTodos = !this.showDoneTodos}>Show completed</label>${can ? html`<button ?disabled=${!done.length || this.saving} @click=${() => void this.action(async () => { for (const item of done) await this._hass!.callWS({ type: "family_organizer/delete", resource: "todos", item_id: item.id }); }, "Completed to-dos cleared")}>Clear completed</button>` : nothing}</div>
      <div class="grocery-items">${items.length ? items.map((item: Item) => html`<article class=${`grocery-row ${item.done ? "checked" : ""}`}><input type="checkbox" aria-label=${`Mark ${item.title} ${item.done ? "open" : "done"}`} .checked=${!!item.done} ?disabled=${!can || this.saving} @change=${() => void this.action(() => this.mutate("todos", { ...item, done: !item.done }), item.done ? "Back on the list" : "Nice, one less thing")}><div class="row-copy"><strong>${item.title}</strong><span class="muted">${item.due_date ? `Due ${this.date(item.due_date, { weekday: "short", month: "short", day: "numeric" })}` : ""}${item.notes ? `${item.due_date ? " · " : ""}${item.notes}` : ""}</span></div>${item.assignee_id ? html`<span title=${`Assigned to ${this.person(item.assignee_id)?.name || "a family member"}`}>${this.avatar(item.assignee_id)}</span>` : nothing}${can ? html`<button class="icon-button" aria-label=${`Edit ${item.title}`} @click=${() => this.openEditor("todo", item)}>✎</button><button class="icon-button" aria-label=${`Delete ${item.title}`} @click=${() => this.confirmDelete("todos", item)}>×</button>` : nothing}</article>`) : this.empty("Nothing to do", "Add a task, assign it to someone and give it a due date.", this.addButton("Add your first to-do", "todo", can, { list_id: this.todoListId }))}</div></div>
      <aside class="surface shopping-aside"><span class="eyebrow">LISTS FOR EVERYTHING</span><h3>Packing, projects, errands</h3><p class="muted">Keep separate lists for holidays, home projects or anything else the family needs to get done.</p>${this.addButton("New list", "todolist", can)}${can && current ? html`<button @click=${() => this.openEditor("todolist", current)}>Edit list</button><button class="danger" ?disabled=${lists.length < 2} @click=${() => this.confirmDelete("todos", current, "lists")}>Delete list</button><small class="muted">Deleting a list also removes its to-dos. Keep at least one list.</small>` : nothing}<hr><h3>Need groceries instead?</h3><button @click=${() => this.navigate("groceries")}>Shopping lists →</button></aside></div></section>`;
  }

  private journal() {
    const entries = [...(this.data.journal?.items || [])].filter((e: Item) => !this.journalPerson || (e.person_ids || []).includes(this.journalPerson)).sort((a: Item, b: Item) => `${b.day}`.localeCompare(a.day)), can = this.can("manage_journal");
    return html`<section><div class="section-toolbar"><div><span class="eyebrow">THE FAMILY JOURNAL</span><h2>Moments worth keeping</h2></div><div class="toolbar-actions"><label>Family member<select .value=${this.journalPerson} @change=${(e: Event) => this.journalPerson = (e.target as HTMLSelectElement).value}><option value="">Everyone</option>${this.peopleOptions()}</select></label>${this.addButton("New entry", "journal", can, { day: iso(new Date()) })}</div></div>
      <div class="journal-feed">${entries.length ? entries.map((entry: Item) => html`<article class="surface journal-entry">
        <div class="detail-date"><span>${this.date(entry.day, { month: "short" })}</span><strong>${dayDate(entry.day).getDate()}</strong></div>
        <div class="journal-body"><span class="eyebrow">${this.date(entry.day, { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</span><h3>${entry.title}</h3><p>${entry.body}</p>
          ${(entry.photos || []).length ? html`<div class="journal-photos">${entry.photos.map((src: string) => html`<img src=${src} alt="" loading="lazy" referrerpolicy="no-referrer">`)}</div>` : nothing}
          <div class="event-people">${(entry.person_ids || []).map((id: string) => html`<span class="check">${this.avatar(id)}${this.person(id)?.name || ""}</span>`)}</div></div>
        ${can ? html`<div class="journal-actions"><button class="icon-button" aria-label=${`Edit ${entry.title}`} @click=${() => this.openEditor("journal", entry)}>✎</button><button class="icon-button" aria-label=${`Delete ${entry.title}`} @click=${() => this.confirmDelete("journal", entry)}>×</button></div>` : nothing}
      </article>`) : this.empty("Your story starts here", this.journalPerson ? "No entries for this family member yet." : "Record first words, big wins and ordinary days you don’t want to forget.", this.addButton("Write the first entry", "journal", can, { day: iso(new Date()) }))}</div></section>`;
  }

  private birthdays() {
    const today = iso(new Date());
    const rows: BirthdayRow[] = this.people.map((p: Item) => ({ person: p, next: nextBirthday(p.birthday, today) })).sort((a: BirthdayRow, b: BirthdayRow) => (a.next?.days ?? 9999) - (b.next?.days ?? 9999));
    const known = rows.filter(r => r.next), unknown = rows.filter(r => !r.next);
    return html`<section><div class="section-toolbar"><div><span class="eyebrow">CELEBRATE TOGETHER</span><h2>Upcoming birthdays</h2></div>${this.addButton("Add a person", "person", this.can("manage_people"))}</div>
      <div class="birthday-grid">${known.length ? known.map(({ person, next }) => html`<article class=${`surface birthday-card ${next!.days === 0 ? "today" : ""}`} style=${`--person-color:${this.color(person.color)}`}>${this.avatar(person.id)}<div class="row-copy"><h3>${person.name}</h3><p class="muted">${this.date(next!.date, { weekday: "long", month: "long", day: "numeric" })}${next!.age !== undefined ? ` · turns ${next!.age}` : ""}</p></div><strong class="countdown">${next!.days === 0 ? "Today 🎉" : next!.days === 1 ? "Tomorrow" : `${next!.days} days`}</strong>${this.can("manage_people") ? html`<button class="icon-button" aria-label=${`Edit ${person.name}`} @click=${() => this.openEditor("person", person)}>✎</button>` : nothing}</article>`) : this.empty("No birthdays yet", "Add a birthday to each family member in Settings and we’ll count down for you.", this.addButton("Add a person", "person", this.can("manage_people")))}</div>
      ${unknown.length ? html`<details class="all-chores"><summary>Family members without a birthday (${unknown.length})</summary>${unknown.map(({ person }) => html`<div class="compact-row">${this.avatar(person.id)}<span>${person.name}</span>${this.can("manage_people") ? html`<button @click=${() => this.openEditor("person", person)}>Add birthday</button>` : nothing}</div>`)}</details>` : nothing}</section>`;
  }

  private settings() {
    const settings = this.settingsData;
    return html`<section><div class="settings-intro"><span class="eyebrow">YOUR HOME, YOUR WAY</span><h2>A place for everyone</h2><p class="muted">Link family members to Home Assistant users, choose their colors and set what they can manage.</p></div><div class="section-toolbar"><h3>Family members</h3>${this.addButton("Add a person", "person", this.can("manage_people"))}</div><div class="people-grid">${this.people.length ? this.people.map((person: Item) => html`<article class="surface person-card">${this.avatar(person.id)}<div class="row-copy"><h3>${person.name}</h3><p class="muted">${person.role === "parent_admin" ? "Family administrator" : person.role === "parent" ? "Parent" : "Child"} · ${person.user_id || person.ha_user_id ? "HA account linked" : "No HA account linked"}</p><small class="muted">${Object.keys(person.permissions || {}).length} permission overrides</small></div>${this.can("manage_people") ? html`<button @click=${() => this.openEditor("person", person)}>Edit</button><button class="icon-button danger" aria-label=${`Remove ${person.name}`} @click=${() => this.confirmDelete("people", person)}>×</button>` : nothing}</article>`) : this.empty("Welcome to your family space", "Add your first family member and link their Home Assistant user ID.", this.addButton("Add a person", "person", this.can("manage_people")))}</div>
      <div class="settings-grid"><article class="surface"><span class="eyebrow">DISPLAY & DEFAULTS</span><h3>Set your everyday rhythm</h3><dl><div><dt>Calendar</dt><dd>${settings.default_calendar_view || "month"} view · week starts ${settings.week_start || "by locale"}</dd></div><div><dt>Day overview</dt><dd>${settings.overview_position || "right"} · ${settings.overview_collapsed ? "collapsed" : "expanded"}</dd></div><div><dt>Time & language</dt><dd>${settings.time_format || "24"} hour · ${settings.language || this.locale}</dd></div><div><dt>Meal slots</dt><dd>${(settings.meal_slots || []).join(", ")}</dd></div><div><dt>Stores</dt><dd>${(settings.stores || []).join(", ") || "No stores yet"}</dd></div><div><dt>Grocery default</dt><dd>${(this.data.groceries.lists || []).find((x: Item) => x.id === settings.default_grocery_list_id)?.name || "First list"}</dd></div><div><dt>Competition</dt><dd>${settings.competition_default || "week"}</dd></div><div><dt>Sync interval</dt><dd>${settings.sync_interval || 30} minutes</dd></div></dl>${this.addButton("Edit preferences", "preferences", this.can("manage_settings"), { ...settings, theme: this.theme })}</article>
      <article class="surface"><span class="eyebrow">MAKE YOURSELF AT HOME</span><h3>Appearance</h3><p class="muted">Choose a look for this device. Auto follows your Home Assistant theme.</p><div class="theme-options" role="group" aria-label="Appearance">${["auto", "light", "dark"].map(theme => html`<button class=${this.theme === theme ? "active" : ""} aria-pressed=${this.theme === theme} @click=${() => { this.theme = theme; localStorage.setItem("family-organizer-theme", theme); }}><span aria-hidden="true">${theme === "auto" ? "◐" : theme === "light" ? "☼" : "☾"}</span>${theme[0].toUpperCase() + theme.slice(1)}</button>`)}</div><hr><span class="eyebrow">CALENDAR CONNECTIONS</span><h3>Keep calendars in sync</h3><p class="muted">Sources and credentials are managed securely in Home Assistant, never in this panel.</p><a class="button-link" href="/config/integrations/integration/family_organizer">Open integration settings →</a><p class="muted">Settings → Devices & services → Family Organizer → Configure.</p>${(this.data.calendar.sources || []).map((source: Item) => html`<div class="compact-row"><span class="event-dot" style=${`background:${this.color(source.color)}`}></span><strong>${source.name}</strong><span class="muted">${source.enabled === false ? "Disabled" : "Connected"}</span></div>`)}</article></div></section>`;
  }

  private field(label: string, name: string, value: unknown = "", type = "text", required = false, extra: Item = {}) {
    return html`<label>${label}<input name=${name} type=${type} .value=${String(value ?? "")} ?required=${required} min=${extra.min ?? nothing} max=${extra.max ?? nothing} step=${extra.step ?? nothing} placeholder=${extra.placeholder ?? nothing} ?autofocus=${extra.autofocus || false}></label>`;
  }
  private select(label: string, name: string, value: string, options: [string, string][]) {
    const id = `editor-${name}`;
    return html`<div class="form-field"><label for=${id}>${label}</label><select id=${id} name=${name}>${options.map(([valueId, title]) => html`<option value=${valueId} ?selected=${valueId === value}>${title}</option>`)}</select></div>`;
  }
  private textarea(label: string, name: string, value = "", placeholder = "") { return html`<label class="full">${label}<textarea name=${name} rows="4" .value=${value} placeholder=${placeholder}></textarea></label>`; }
  private personChecks(name: string, selected: string[] = [], ownOnly = false) { return html`<fieldset class="full"><legend>Family members</legend><div class="checkbox-group">${this.people.filter((p: Item) => !ownOnly || p.id === this.me?.id).map((p: Item) => html`<label class="check"><input type="checkbox" name=${name} value=${p.id} ?checked=${selected.includes(p.id)}>${this.avatar(p.id)}${p.name}</label>`)}</div></fieldset>`; }
  private shared(item: Item) { return html`<label class="check full"><input name="shared" type="checkbox" ?checked=${item.shared !== false}>Share with the family</label>`; }
  private dialog() {
    const { kind, item } = this.editor!;
    const titles: Item = { quick: "What would you like to add?", "event-detail": item.title, event: item.id ? "Edit event series" : "Add an event", grocery: item.id ? "Edit shopping item" : "Add to your shopping list", list: item.id ? "Edit grocery list" : "Create a grocery list", todo: item.id ? "Edit to-do" : "Add a to-do", todolist: item.id ? "Edit to-do list" : "Create a to-do list", journal: item.id ? "Edit journal entry" : "New journal entry", meal: item.id ? "Edit planned meal" : "Plan a meal", chore: item.id ? "Edit chore" : "Schedule a chore", points: "Adjust family points", recipe: item.id ? "Edit recipe" : "Save a favorite recipe", categories: "Recipe categories", category: item.id ? "Edit category" : "Create a category", person: item.id ? "Edit family member" : "Add a family member", preferences: "Display & defaults", delete: "Delete this item?" };
    const isForm = !["quick", "event-detail", "categories"].includes(kind);
    return html`<dialog class=${`editor-dialog ${kind === "event-detail" ? "detail-dialog" : ""}`} aria-labelledby="dialog-title" @cancel=${(e: Event) => { e.preventDefault(); this.closeEditor(); }} @click=${(e: MouseEvent) => { if (e.target === e.currentTarget) { const box = (e.currentTarget as HTMLElement).getBoundingClientRect(); if (e.clientX < box.left || e.clientX > box.right || e.clientY < box.top || e.clientY > box.bottom) this.closeEditor(); } }}>
      <header class="dialog-heading"><div><span class="eyebrow">FAMILY ORGANIZER</span><h2 id="dialog-title">${titles[kind]}</h2></div><button type="button" class="icon-button" aria-label="Close dialog" ?disabled=${this.saving} @click=${() => this.closeEditor()}>×</button></header>
      ${this.error ? html`<div class="banner error" role="alert">${this.error}</div>` : nothing}
      ${isForm ? html`<form @submit=${(e: SubmitEvent) => void this.saveEditor(e)}><fieldset class="form-fields" ?disabled=${this.saving}>${this.editorFields(kind, item)}</fieldset><footer class="dialog-footer"><span class="muted" role="status">${this.saving ? "Saving…" : kind === "event" && item.recurrence ? "Changes apply to the entire series." : ""}</span><button type="button" ?disabled=${this.saving} @click=${() => this.closeEditor()}>Cancel</button><button class=${kind === "delete" ? "danger-primary" : "primary"} ?disabled=${this.saving}>${this.saving ? "Saving…" : kind === "delete" ? "Delete" : "Save"}</button></footer></form>` : html`<div class="dialog-content">${kind === "quick" ? this.quickMenu() : kind === "event-detail" ? this.eventDetail(item) : this.categoryManager()}</div>`}
    </dialog>`;
  }
  private quickMenu() {
    const entries = [{ kind: "event", title: "Calendar event", description: "Make time for what matters", icon: "▦", enabled: this.canEvent(), item: { day: this.selectedDay } }, { kind: "grocery", title: "Shopping item", description: "Remember it before you forget it", icon: "▤", enabled: this.can("manage_groceries"), item: { list_id: this.listId } }, { kind: "todo", title: "To-do", description: "Get it off your mind and onto the list", icon: "☑", enabled: this.can("manage_todos"), item: { list_id: this.todoListId } }, { kind: "meal", title: "Planned meal", description: "Give dinner a little direction", icon: "♧", enabled: this.can("manage_meal_plan"), item: { day: this.selectedDay, slot: (this.settingsData.meal_slots || ["dinner"])[0], servings: 4 } }, { kind: "chore", title: "Family chore", description: "Share the load, celebrate the effort", icon: "✓", enabled: this.can("manage_chores"), item: {} }, { kind: "recipe", title: "Favorite recipe", description: "Keep a good thing close", icon: "♧", enabled: this.can("manage_recipes"), item: {} }, { kind: "journal", title: "Journal entry", description: "Save a moment worth remembering", icon: "✎", enabled: this.can("manage_journal"), item: { day: this.selectedDay } }];
    return html`<div class="quick-menu">${entries.filter(entry => entry.enabled).map(entry => html`<button @click=${() => this.openEditor(entry.kind, entry.item)}><span class="quick-icon" aria-hidden="true">${entry.icon}</span><span><strong>${entry.title}</strong><small>${entry.description}</small></span><span aria-hidden="true">→</span></button>`)}</div>
      ${entries.every(entry => !entry.enabled) ? this.empty("You have a view-only account", "Ask a family administrator to adjust your permissions.") : nothing}`;
  }
  private eventDetail(event: Item) {
    return html`<div class="event-detail"><div class="detail-date" style=${`--event-color:${this.eventColor(event)}`}><span>${this.date(iso(new Date(event.occurrence_start)), { month: "short" })}</span><strong>${new Date(event.occurrence_start).getDate()}</strong></div><div><h3>${this.date(iso(new Date(event.occurrence_start)))}</h3><p>${event.all_day ? "All day" : `${this.time(event.occurrence_start)} – ${this.time(event.occurrence_end)}`}</p>${iso(new Date(event.occurrence_start)) !== iso(new Date(event.occurrence_end)) ? html`<p class="muted">Ends ${this.date(iso(new Date(event.all_day ? new Date(event.occurrence_end).getTime() - 1 : event.occurrence_end)))}</p>` : nothing}</div></div><dl class="event-metadata"><div><dt>Where</dt><dd>${event.location || "No location"}</dd></div><div><dt>Who</dt><dd class="event-people">${(event.person_ids || []).map((id: string) => html`<span class="check">${this.avatar(id)}${this.person(id)?.name || "Family member"}</span>`)}</dd></div><div><dt>Repeats</dt><dd>${event.recurrence || "Does not repeat"}</dd></div><div><dt>Visibility</dt><dd>${event.shared === false ? "Private" : "Shared with family"}</dd></div></dl>${event.description ? html`<p class="event-description">${event.description}</p>` : nothing}${event.source_id ? html`<p class="muted">Imported calendar event. Local edits may be replaced on the next source sync.</p>` : nothing}<div class="detail-actions">${this.canEvent(event) ? html`<button class="primary" @click=${() => this.openEditor("event", event)}>Edit ${event.recurrence ? "series" : "event"}</button>` : nothing}${this.canEvent() ? html`<button @click=${() => { const duplicate: Item = duplicateEvent(event); if (!this.can("manage_calendar_all")) duplicate.person_ids = [this.me?.id].filter(Boolean); this.openEditor("event", duplicate); }}>Duplicate</button>` : nothing}${this.canEvent(event) ? html`<button class="danger" @click=${() => this.confirmDelete("calendar", event)}>Delete ${event.recurrence ? "series" : "event"}</button>` : nothing}</div>`;
  }
  private categoryManager() { return html`${this.addButton("New category", "category", this.can("manage_recipes"))}<div class="category-list">${(this.data.recipes.categories || []).map((category: Item) => html`<div class="compact-row"><strong class="row-copy">${this.categoryPath(category)}</strong><button @click=${() => this.openEditor("category", category)}>Edit</button><button class="danger" @click=${() => this.confirmDelete("recipes", category, "categories")}>Delete</button></div>`)}</div>`; }
  private editorFields(kind: string, item: Item) {
    if (kind === "delete") {
      const reason = this.editor?.collection === "lists" ? `All ${this.editor.resource === "todos" ? "to-dos" : "grocery items"} on this list will also be removed.`
        : this.editor?.collection === "categories" ? "Recipes are kept. Child categories move to the parent."
        : item.recurrence ? "This removes the entire repeating event series." : "This cannot be undone.";
      return html`<div class="full"><p>Delete <strong>${item.title || item.name || "this item"}</strong>?</p><p class="muted">${reason}</p></div>`;
    }
    if (kind === "event") {
      const localInput = (value?: string) => { if (!value) return ""; const date = new Date(value.length === 10 ? `${value}T00:00:00` : value); return `${iso(date)}T${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`; };
      const start = localInput(item.start), end = localInput(item.end), day = item.day || start.slice(0, 10) || this.selectedDay;
      const recurrence: [string, string][] = [["", "Does not repeat"], ["FREQ=DAILY", "Every day"], ["FREQ=WEEKLY", "Every week"], ["FREQ=MONTHLY", "Every month"], ["FREQ=YEARLY", "Every year"]];
      if (item.recurrence && !recurrence.some(([value]) => value === item.recurrence)) recurrence.push([item.recurrence, `Keep existing: ${item.recurrence}`]);
      return html`${this.field("Event title", "title", item.title, "text", true, { autofocus: true })}${this.field("Location", "location", item.location)}${this.field("Starts on", "day", day, "date", true)}${this.field("Ends on (inclusive for all-day)", "end_day", item.all_day && end ? shift(end.slice(0, 10), -1) : end.slice(0, 10) || day, "date", true)}${this.field("Start time", "start", item.start_time || start.slice(11, 16) || "18:00", "time", true)}${this.field("End time", "end", item.end_time || end.slice(11, 16) || "19:00", "time", true)}<label class="check full"><input name="all_day" type="checkbox" ?checked=${!!item.all_day}>All-day event (time fields are ignored)</label>${this.select("Repeat", "recurrence", item.recurrence || "", recurrence)}${this.personChecks("person_ids", item.person_ids || (this.can("manage_calendar_all") ? [] : [this.me?.id]), !this.can("manage_calendar_all"))}${this.textarea("Notes", "description", item.description)}${this.shared(item)}`;
    }
    if (kind === "grocery") return html`${this.field("Item name", "name", item.name, "text", true, { autofocus: true })}${this.field("Quantity", "quantity", item.quantity ?? 1, "number", true, { min: .001, step: "any" })}${this.field("Unit", "unit", item.unit, "text", false, { placeholder: "cups, kg, packs…" })}${this.select("Grocery list", "list_id", item.list_id || this.listId, (this.data.groceries.lists || []).map((x: Item) => [x.id, x.name]))}<label>Store<input name="store" list="store-options" .value=${item.store || ""}><datalist id="store-options">${(this.settingsData.stores || []).map((store: string) => html`<option value=${store}></option>`)}</datalist></label><label>Assigned to<select name="assignee_id"><option value="">Anyone</option>${this.peopleOptions(item.assignee_id)}</select></label>${this.textarea("Notes", "notes", item.notes)}${this.shared(item)}`;
    if (kind === "list") return html`${this.field("List name", "name", item.name, "text", true, { autofocus: true })}${this.field("Default store", "store", item.store)}${this.shared(item)}`;
    if (kind === "todo") return html`${this.field("What needs doing?", "title", item.title, "text", true, { autofocus: true })}${this.select("List", "list_id", item.list_id || this.todoListId, (this.data.todos?.lists || []).map((x: Item) => [x.id, x.name]))}${this.field("Due date", "due_date", item.due_date, "date")}<label>Assigned to<select name="assignee_id"><option value="">Anyone</option>${this.peopleOptions(item.assignee_id)}</select></label>${this.textarea("Notes", "notes", item.notes)}${this.shared(item)}`;
    if (kind === "todolist") return html`${this.field("List name", "name", item.name, "text", true, { autofocus: true })}${this.shared(item)}`;
    if (kind === "journal") return html`${this.field("Title", "title", item.title, "text", true, { autofocus: true })}${this.field("Date", "day", item.day || iso(new Date()), "date", true)}${this.textarea("What happened?", "body", item.body, "First steps, a big win, a funny thing someone said…")}${this.personChecks("person_ids", item.person_ids || [])}${this.textarea("Photo URLs (one per line)", "photos", (item.photos || []).join("\n"), "https://…")}${this.shared(item)}`;
    if (kind === "meal") return html`${this.field("Date", "day", item.day || this.selectedDay, "date", true)}${this.select("Meal slot", "slot", item.slot || item.meal || (this.settingsData.meal_slots || ["dinner"])[0], (this.settingsData.meal_slots || ["breakfast", "lunch", "dinner"]).map((slot: string) => [slot, slot]))}${this.select("Choose a recipe", "recipe_id", item.recipe_id || "", [["", "Use a meal name instead"], ...(this.data.recipes.items || []).map((r: Item): [string, string] => [r.id, r.title])])}${this.field("Meal name (if not using a recipe)", "title", item.title)}${this.field("Servings", "servings", item.servings || 4, "number", true, { min: .25, step: .25 })}`;
    if (kind === "chore") return html`${this.field("Chore title", "title", item.title, "text", true, { autofocus: true })}${this.field("Points", "points", item.points ?? 5, "number", true, { min: 0, step: 1 })}${this.field("Icon (MDI name)", "icon", item.icon || "mdi:check-circle-outline")}${this.select("Schedule", "schedule", item.schedule || "once", [["once", "One time"], ["daily", "Daily"], ["weekly", "Weekly"], ["monthly", "Monthly"], ["custom", "Custom interval"], ...(item.schedule?.startsWith("weekly:") ? [[item.schedule, "Keep existing weekdays"] as [string, string]] : [])])}${this.personChecks("assignee_ids", item.assignee_ids || (item.assignee_id ? [item.assignee_id] : []))}<label class="check full"><input name="rotate" type="checkbox" ?checked=${!!item.rotate}>Rotate between assignees after each completion</label><fieldset class="full"><legend>Weekdays (weekly schedule)</legend><div class="checkbox-group">${Array.from({ length: 7 }, (_, i) => html`<label class="check"><input name="weekdays" type="checkbox" value=${i} ?checked=${(item.weekdays || []).includes(i)}>${this.date(shift("2026-06-01", i), { weekday: "long" })}</label>`)}</div></fieldset>${this.field("Day of month (monthly)", "month_day", item.month_day || 1, "number", true, { min: 1, max: 31 })}${this.field("Every N days (custom)", "interval_days", item.interval_days || 2, "number", true, { min: 1, max: 365 })}${this.field("Due date (one time)", "due_date", item.due_date || this.selectedDay, "date")}${this.field("Due time", "due_time", item.due_time, "time")}${this.textarea("Description", "description", item.description)}${this.shared(item)}`;
    if (kind === "points") return html`<label>Family member<select name="person_id">${this.peopleOptions()}</select></label>${this.field("Points (negative to subtract)", "points", "", "number", true, { step: 1 })}${this.field("Reason", "note", "", "text", true)}`;
    if (kind === "recipe") return html`${this.field("Recipe title", "title", item.title, "text", true, { autofocus: true })}${this.field("Tags (comma separated)", "tags", (item.tags || []).join(", "))}${this.field("Image URL", "image", item.image, "url")}${this.field("Base servings", "servings", item.servings || 4, "number", true, { min: .25, step: .25 })}${this.field("Prep time (minutes)", "prep_time", item.prep_time || 0, "number", true, { min: 0, step: 1 })}${this.field("Cook time (minutes)", "cook_time", item.cook_time || 0, "number", true, { min: 0, step: 1 })}<fieldset class="full"><legend>Categories</legend><div class="checkbox-group">${(this.data.recipes.categories || []).map((category: Item) => html`<label class="check"><input name="category_ids" type="checkbox" value=${category.id} ?checked=${(item.category_ids || []).includes(category.id)}>${this.categoryPath(category)}</label>`)}</div></fieldset>${this.textarea("Ingredients (one per line: quantity, optional unit, name)", "ingredients", serializeIngredients(item.ingredients || []), "1 cup flour\n2  eggs\n1/2 tsp salt")}${this.textarea("Method (one step per line)", "steps", (item.steps || item.instructions || []).join("\n"))}${this.shared(item)}`;
    if (kind === "category") {
      const isDescendant = (candidate: Item) => { const seen = new Set<string>(); let parent = candidate; while (parent) { if (parent.id === item.id || seen.has(parent.id)) return true; seen.add(parent.id); parent = (this.data.recipes.categories || []).find((c: Item) => c.id === parent.parent_id); } return false; };
      return html`${this.field("Category name", "name", item.name, "text", true, { autofocus: true })}${this.select("Parent category", "parent_id", item.parent_id || "", [["", "Root category"], ...(this.data.recipes.categories || []).filter((c: Item) => !isDescendant(c)).map((c: Item): [string, string] => [c.id, this.categoryPath(c)])])}`;
    }
    if (kind === "person") return html`${this.field("Name", "name", item.name, "text", true, { autofocus: true })}${this.field("Family color", "color", this.color(item.color), "color")}${this.field("Home Assistant user ID", "user_id", item.user_id || item.ha_user_id)}
      ${this.field("Profile picture URL", "profile_picture", item.profile_picture || item.avatar_url, "url")}${this.field("Birthday", "birthday", item.birthday, "date")}
      ${this.select("Role preset", "role", item.role || "child", [["parent_admin", "Family administrator"], ["parent", "Parent"], ["child", "Child"]])}
      <p class="muted full">The user ID links this person’s Home Assistant account. Permission overrides take priority over their role preset.</p>
      <fieldset class="full permissions"><legend>Permission overrides</legend>${capabilities.map(capability => this.select(capability.replaceAll("_", " "), capability, typeof item.permissions?.[capability] === "boolean" ? item.permissions[capability] ? "allow" : "deny" : "default", [["default", "Use role preset"], ["allow", "Allow"], ["deny", "Deny"]]))}</fieldset>`;
    if (kind === "preferences") return html`${this.select("Appearance default", "theme", item.theme || "auto", [["auto", "Follow Home Assistant"], ["light", "Light"], ["dark", "Dark"]])}
      ${this.select("Day overview position", "overview_position", item.overview_position || "right", [["left", "Left"], ["right", "Right"]])}
      <label class="check full"><input name="overview_collapsed" type="checkbox" ?checked=${!!item.overview_collapsed}>Collapse day overview by default</label>
      ${this.select("Week starts", "week_start", item.week_start || (this.firstDay === 0 ? "sunday" : "monday"), [["monday", "Monday"], ["sunday", "Sunday"]])}
      ${this.select("Time format", "time_format", item.time_format || "24", [["24", "24 hour"], ["12", "12 hour"]])}
      ${this.select("Default calendar view", "default_calendar_view", item.default_calendar_view || "month", [["month", "Month"], ["week", "Week"], ["day", "Day"]])}
      ${this.select("Default grocery list", "default_grocery_list_id", item.default_grocery_list_id || this.listId, (this.data.groceries.lists || []).map((x: Item) => [x.id, x.name]))}
      ${this.field("Meal slots (comma separated)", "meal_slots", (item.meal_slots || ["breakfast", "lunch", "dinner"]).join(", "), "text", true)}
      ${this.field("Stores (comma separated)", "stores", (item.stores || []).join(", "))}
      ${this.select("Competition default", "competition_default", item.competition_default || "week", [["week", "Weekly"], ["month", "Monthly"]])}
      ${this.field("Language code", "language", item.language || this.locale, "text", true, { placeholder: "en, de, fr…" })}
      ${this.field("Calendar sync interval (minutes)", "sync_interval", item.sync_interval || 30, "number", true, { min: 5, max: 1440, step: 1 })}`;
    return nothing;
  }
  static styles = panelStyles;
}
declare global { interface HTMLElementTagNameMap { "family-organizer-panel": FamilyOrganizerPanel } }
