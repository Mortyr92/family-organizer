import { LitElement, css, html, nothing } from "lit";
import { customElement, state } from "lit/decorators.js";

type Item = Record<string, any>;
type Hass = {
  callWS<T>(message: Item): Promise<T>;
  connection: { subscribeMessage(cb: (data: Item) => void, message: Item): Promise<() => void> };
};

const resources = ["people", "calendar", "groceries", "chores", "recipes", "settings"];
const isoDay = (offset = 0) => {
  const value = new Date();
  value.setDate(value.getDate() + offset);
  return value.toISOString().slice(0, 10);
};
const addHour = (day: string, time: string) => {
  const value = new Date(`${day}T${time}:00`);
  value.setHours(value.getHours() + 1);
  return `${day}T${value.toTimeString().slice(0, 8)}`;
};

@customElement("family-organizer-panel")
export class FamilyOrganizerPanel extends LitElement {
  @state() private page = "calendar";
  @state() private calendarView = "month";
  @state() private selectedDay = isoDay();
  @state() private data: Record<string, Item> = {};
  @state() private error = "";
  @state() private recipeServings: Record<string, number> = {};
  private _hass?: Hass;
  private unsubscribe?: () => void;

  set hass(value: Hass) {
    const first = !this._hass;
    this._hass = value;
    if (first) void this.load();
  }

  disconnectedCallback() {
    this.unsubscribe?.();
    super.disconnectedCallback();
  }

  private async load() {
    if (!this._hass) return;
    try {
      const results = await Promise.all(resources.map(resource =>
        this._hass!.callWS<Item>({ type: "family_organizer/list", resource })
      ));
      this.data = Object.fromEntries(resources.map((resource, i) => [resource, results[i]]));
      if (!this.unsubscribe) {
        this.unsubscribe = await this._hass.connection.subscribeMessage(() => void this.load(), {
          type: "family_organizer/subscribe",
        });
      }
    } catch (error) {
      this.error = String(error);
    }
  }

  private async create(resource: string, item: Item, collection?: string) {
    await this._hass!.callWS({
      type: "family_organizer/create", resource, collection,
      item: { id: crypto.randomUUID(), ...item },
    });
    await this.load();
  }

  private async updateItem(resource: string, item: Item, patch: Item, collection?: string) {
    await this._hass!.callWS({
      type: "family_organizer/update", resource, collection, item_id: item.id, item: patch,
    });
    await this.load();
  }

  private async removeItem(resource: string, item: Item, collection?: string) {
    await this._hass!.callWS({
      type: "family_organizer/delete", resource, collection, item_id: item.id,
    });
    await this.load();
  }

  private form(event: SubmitEvent): Item {
    event.preventDefault();
    return Object.fromEntries(new FormData(event.currentTarget as HTMLFormElement));
  }

  render() {
    const labels: Record<string, string> = {
      calendar: "Calendar", groceries: "Groceries & meals", chores: "Chores",
      recipes: "Recipes", settings: "Settings",
    };
    return html`
      <header><h1>Family Organizer</h1><nav>${Object.entries(labels).map(([id, label]) =>
        html`<button class=${this.page === id ? "active" : ""} @click=${() => this.page = id}>${label}</button>`
      )}</nav></header>
      <main>${this.error ? html`<p class="error">${this.error}</p>` : nothing}
        ${!this.data.people ? html`<p>Loading…</p>` : this.renderPage()}
      </main>`;
  }

  private renderPage() {
    if (this.page === "calendar") return this.renderCalendar();
    if (this.page === "groceries") return this.renderGroceries();
    if (this.page === "chores") return this.renderChores();
    if (this.page === "recipes") return this.renderRecipes();
    return this.renderSettings();
  }

  private renderCalendar() {
    const events = this.data.calendar.items ?? [];
    const filtered = events.filter((event: Item) => String(event.start).slice(0, 10) === this.selectedDay);
    return html`<section>
      <div class="toolbar"><h2>Calendar</h2>
        ${["month", "week", "day"].map(view => html`
          <button class=${this.calendarView === view ? "active" : ""} @click=${() => this.calendarView = view}>${view}</button>`)}
        <input type="date" .value=${this.selectedDay} @change=${(e: Event) => this.selectedDay = (e.target as HTMLInputElement).value}>
      </div>
      <div class="calendar ${this.calendarView}">
        ${Array.from({ length: this.calendarView === "month" ? 35 : this.calendarView === "week" ? 7 : 1 }, (_, i) => {
          const day = this.calendarView === "day" ? this.selectedDay : isoDay(i);
          return html`<button class="day" @click=${() => this.selectedDay = day}><b>${day}</b>
            ${events.filter((event: Item) => String(event.start).startsWith(day)).map((event: Item) => html`<span>${event.title}</span>`)}
          </button>`;
        })}
      </div>
      <aside><h3>${this.selectedDay}</h3>${filtered.map((event: Item) => html`
        <article><b>${event.title}</b><small>${event.start} – ${event.end}</small>
        <button @click=${() => this.removeItem("calendar", event)}>Delete</button></article>`)}
        <form @submit=${(e: SubmitEvent) => {
          const value = this.form(e); void this.create("calendar", {
            title: value.title, start: `${this.selectedDay}T${value.time}:00`, end: addHour(this.selectedDay, value.time),
            all_day: false, person_ids: [], recurrence: value.recurrence || null,
          }); (e.target as HTMLFormElement).reset();
        }}><input name="title" placeholder="New event" required><input name="time" type="time" value="18:00">
          <select name="recurrence"><option value="">Once</option><option value="FREQ=DAILY">Daily</option><option value="FREQ=WEEKLY">Weekly</option></select>
          <button>Add</button></form>
      </aside>
    </section>`;
  }

  private renderGroceries() {
    const groceries = this.data.groceries.items ?? [];
    const plans = this.data.groceries.meal_plans ?? [];
    return html`<section><h2>Groceries</h2>
      <form @submit=${(e: SubmitEvent) => {
        const value = this.form(e); void this.create("groceries", { name: value.name, quantity: Number(value.quantity), checked: false, category: value.category });
        (e.target as HTMLFormElement).reset();
      }}><input name="name" placeholder="Item" required><input name="quantity" type="number" value="1" min="0"><input name="category" placeholder="Category"><button>Add</button></form>
      <div class="cards">${groceries.map((item: Item) => html`<article>
        <label><input type="checkbox" .checked=${!!item.checked} @change=${() => this.updateItem("groceries", item, { checked: !item.checked })}>
          ${item.quantity} ${item.name}</label><small>${item.category}</small><button @click=${() => this.removeItem("groceries", item)}>×</button>
      </article>`)}</div>
      <h2>7-day meal plan</h2><div class="week">${Array.from({ length: 7 }, (_, offset) => {
        const day = isoDay(offset); const meal = plans.find((plan: Item) => plan.day === day);
        return html`<article><b>${day}</b>${meal ? html`<span>${meal.title}</span><button @click=${() => this.removeItem("groceries", meal, "meal_plans")}>Clear</button>` :
          html`<form @submit=${(e: SubmitEvent) => { const value = this.form(e); void this.create("groceries", { day, meal: "dinner", title: value.title }, "meal_plans"); }}>
            <input name="title" placeholder="Dinner"><button>Plan</button></form>`}</article>`;
      })}</div>
    </section>`;
  }

  private renderChores() {
    const chores = this.data.chores.items ?? [];
    const people = this.data.people.items ?? [];
    const scores = people.map((person: Item) => ({
      name: person.name,
      points: chores.reduce((sum: number, chore: Item) => sum + (chore.assignee_id === person.id ? (chore.completed?.length ?? 0) * Number(chore.points) : 0), 0),
    })).sort((a: Item, b: Item) => b.points - a.points);
    return html`<section><h2>Chores competition</h2><div class="leaderboard">${scores.map((score: Item, i: number) =>
      html`<article><strong>#${i + 1} ${score.name}</strong><b>${score.points} pts</b></article>`)}</div>
      <form @submit=${(e: SubmitEvent) => {
        const value = this.form(e); void this.create("chores", { title: value.title, assignee_id: value.person, points: Number(value.points), schedule: value.schedule, completed: [] });
      }}><input name="title" placeholder="Chore" required><select name="person">${people.map((p: Item) => html`<option value=${p.id}>${p.name}</option>`)}</select>
        <input name="points" type="number" value="5"><select name="schedule"><option>daily</option><option value="weekly:monday">Weekly</option></select><button>Add</button></form>
      <div class="cards">${chores.map((chore: Item) => html`<article><b>${chore.title}</b><span>${chore.points} pts · ${chore.schedule}</span>
        <button @click=${() => this.updateItem("chores", chore, { completed: [...(chore.completed ?? []), new Date().toISOString()] })}>Complete</button>
        <button @click=${() => this.removeItem("chores", chore)}>×</button></article>`)}</div>
    </section>`;
  }

  private renderRecipes() {
    const recipes = this.data.recipes.items ?? [];
    const categories = [...new Set(recipes.map((recipe: Item) => recipe.category))];
    return html`<section><h2>Recipes</h2>
      <form @submit=${(e: SubmitEvent) => {
        const value = this.form(e); void this.create("recipes", {
          title: value.title, category: value.category, servings: Number(value.servings),
          ingredients: String(value.ingredients).split(",").filter(Boolean).map(name => ({ name: name.trim(), amount: 1, unit: "x" })), instructions: [],
        });
      }}><input name="title" placeholder="Recipe" required><input name="category" placeholder="Category"><input name="servings" type="number" value="4">
        <input name="ingredients" placeholder="Ingredients, comma separated"><button>Add</button></form>
      ${categories.map(category => html`<h3>${category}</h3><div class="cards">${recipes.filter((r: Item) => r.category === category).map((recipe: Item) => {
        const servings = this.recipeServings[recipe.id] ?? recipe.servings;
        return html`<article><b>${recipe.title}</b><label>Servings <input type="number" min="1" .value=${String(servings)}
          @input=${(e: Event) => { this.recipeServings = { ...this.recipeServings, [recipe.id]: Number((e.target as HTMLInputElement).value) }; }}></label>
          <ul>${recipe.ingredients.map((ingredient: Item) => html`<li>${Math.round(ingredient.amount * servings / recipe.servings * 100) / 100} ${ingredient.unit} ${ingredient.name}</li>`)}</ul>
          <button @click=${() => this.removeItem("recipes", recipe)}>Delete</button></article>`;
      })}</div>`)}</section>`;
  }

  private renderSettings() {
    const people = this.data.people.items ?? [];
    const settings = this.data.settings;
    return html`<section><h2>Settings</h2>
      <h3>People</h3><form @submit=${(e: SubmitEvent) => { const value = this.form(e); void this.create("people", { name: value.name, color: value.color, ha_user_id: value.ha_user_id }); }}>
        <input name="name" placeholder="Name" required><input name="color" type="color" value="#3b82f6"><input name="ha_user_id" placeholder="Home Assistant user ID"><button>Add</button></form>
      <div class="cards">${people.map((person: Item) => html`<article style="border-left-color:${person.color}"><b>${person.name}</b><small>${person.ha_user_id || "Not linked"}</small>
        <select @change=${(e: Event) => {
          const permissions = { ...(settings.permissions ?? {}), [person.ha_user_id]: { "*": (e.target as HTMLSelectElement).value } };
          void this.saveSettings({ permissions });
        }}><option>view</option><option>edit</option><option>admin</option></select><button @click=${() => this.removeItem("people", person)}>×</button></article>`)}</div>
      <h3>Sync & appearance</h3><form @submit=${(e: SubmitEvent) => { const value = this.form(e); void this.saveSettings({ theme: value.theme, sync_interval: Number(value.sync_interval) }); }}>
        <select name="theme"><option ?selected=${settings.theme === "auto"}>auto</option><option ?selected=${settings.theme === "light"}>light</option><option ?selected=${settings.theme === "dark"}>dark</option></select>
        <label>Sync interval <input name="sync_interval" type="number" min="5" .value=${String(settings.sync_interval ?? 30)}> minutes</label><button>Save</button>
      </form>
    </section>`;
  }

  private async saveSettings(settings: Item) {
    await this._hass!.callWS({ type: "family_organizer/settings", settings });
    await this.load();
  }

  static styles = css`
    :host { display:block; min-height:100vh; color:var(--primary-text-color); background:var(--primary-background-color); font:14px system-ui; }
    header { position:sticky; top:0; z-index:2; padding:12px 24px; background:var(--card-background-color,#fff); box-shadow:0 1px 5px #0002; }
    h1 { margin:0 0 10px; } nav,.toolbar,form { display:flex; gap:8px; flex-wrap:wrap; align-items:center; }
    button,input,select { border:1px solid var(--divider-color,#ccc); border-radius:8px; padding:8px; background:var(--card-background-color,#fff); color:inherit; }
    button { cursor:pointer; } button.active { background:var(--primary-color,#03a9f4); color:#fff; }
    main { max-width:1200px; margin:auto; padding:20px; } section { position:relative; }
    .calendar { display:grid; grid-template-columns:repeat(7,1fr); gap:5px; margin:15px 320px 15px 0; }
    .calendar.day { grid-template-columns:1fr; } .day { min-height:85px; text-align:left; display:flex; flex-direction:column; gap:3px; }
    .day span { background:color-mix(in srgb,var(--primary-color,#03a9f4) 20%,transparent); border-radius:4px; padding:3px; }
    aside { position:absolute; top:55px; right:0; width:290px; } article { background:var(--card-background-color,#fff); border-radius:10px; padding:12px; display:flex; gap:10px; align-items:center; }
    aside article,.cards article { margin:8px 0; } article small,article span { flex:1; display:block; }
    .week,.leaderboard { display:grid; grid-template-columns:repeat(7,1fr); gap:8px; } .week article { flex-direction:column; align-items:stretch; }
    .leaderboard { grid-template-columns:repeat(auto-fit,minmax(180px,1fr)); margin-bottom:18px; } .cards article { border-left:4px solid var(--primary-color,#03a9f4); }
    .error { color:var(--error-color,#d32f2f); } ul { flex:1; } @media(max-width:800px) { .calendar { margin-right:0; } aside { position:static; width:auto; } .week { grid-template-columns:1fr; } }
  `;
}

declare global { interface HTMLElementTagNameMap { "family-organizer-panel": FamilyOrganizerPanel } }
