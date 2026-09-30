import { LitElement, css, html, nothing } from "lit";
import { customElement, state } from "lit/decorators.js";

type Item = Record<string, any>;
type Hass = {
  callWS<T>(message: Item): Promise<T>;
  connection: { subscribeMessage(cb: (data: Item) => void, message: Item): Promise<() => void> };
};
const resources = ["people", "calendar", "groceries", "chores", "recipes", "settings"];
const day = (offset = 0) => {
  const value = new Date(); value.setDate(value.getDate() + offset);
  return value.toISOString().slice(0, 10);
};

@customElement("family-organizer-panel")
export class FamilyOrganizerPanel extends LitElement {
  @state() private page = "calendar";
  @state() private data: Record<string, Item> = {};
  @state() private selectedDay = day();
  @state() private calendarView = "month";
  @state() private listId = "default";
  @state() private scorePeriod: "week" | "month" = "week";
  @state() private servings: Record<string, number> = {};
  @state() private selectedIngredients: Record<string, Set<number>> = {};
  @state() private theme = localStorage.getItem("family-organizer-theme") || "auto";
  @state() private error = "";
  private _hass?: Hass;
  private unsubscribe?: () => void;

  set hass(value: Hass) { const first = !this._hass; this._hass = value; if (first) void this.load(); }
  disconnectedCallback() { this.unsubscribe?.(); super.disconnectedCallback(); }
  private form(event: SubmitEvent) {
    event.preventDefault(); return Object.fromEntries(new FormData(event.currentTarget as HTMLFormElement));
  }
  private async load() {
    try {
      const values = await Promise.all(resources.map(resource =>
        this._hass!.callWS<Item>({ type: "family_organizer/list", resource })));
      this.data = Object.fromEntries(resources.map((resource, index) => [resource, values[index]]));
      this.theme = localStorage.getItem("family-organizer-theme") || this.data.settings.theme || "auto";
      if (!this.unsubscribe) this.unsubscribe = await this._hass!.connection.subscribeMessage(
        () => void this.load(), { type: "family_organizer/subscribe" });
      this.error = "";
    } catch (error) { this.error = String(error); }
  }
  private async create(resource: string, item: Item, collection = "items") {
    await this._hass!.callWS({ type: "family_organizer/create", resource, collection, item });
  }
  private async updateItem(resource: string, item: Item, patch: Item, collection = "items") {
    await this._hass!.callWS({ type: "family_organizer/update", resource, collection, item_id: item.id, item: patch });
  }
  private async removeItem(resource: string, item: Item, collection = "items") {
    await this._hass!.callWS({ type: "family_organizer/delete", resource, collection, item_id: item.id });
  }
  private person(id?: string) { return (this.data.people?.items || []).find((value: Item) => value.id === id); }
  private avatar(id?: string) {
    const person = this.person(id);
    return person?.avatar_url
      ? html`<img class="avatar" src=${person.avatar_url} alt=${person.name}>`
      : html`<span class="avatar fallback">${person?.name?.[0] || "?"}</span>`;
  }

  render() {
    const labels: Item = { calendar: "Calendar", groceries: "Groceries & meals", chores: "Chores", recipes: "Recipes", settings: "Settings" };
    return html`<div data-theme=${this.theme}><header><h1>Family Organizer</h1>
      <nav>${Object.entries(labels).map(([id, label]) => html`<button class=${this.page === id ? "active" : ""} @click=${() => this.page = id}>${label}</button>`)}</nav>
      </header><main>${this.error ? html`<p class="error">${this.error}</p>` : nothing}
      ${!this.data.people ? html`Loading…` : this.renderPage()}</main></div>`;
  }
  private renderPage() {
    return this.page === "calendar" ? this.calendar() : this.page === "groceries" ? this.groceries()
      : this.page === "chores" ? this.chores() : this.page === "recipes" ? this.recipes() : this.settings();
  }
  private calendar() {
    const events = this.data.calendar.items || [];
    const count = this.calendarView === "month" ? 35 : this.calendarView === "week" ? 7 : 1;
    return html`<section><div class="toolbar"><h2>Calendar</h2>${["month", "week", "day"].map(value =>
      html`<button class=${value === this.calendarView ? "active" : ""} @click=${() => this.calendarView = value}>${value}</button>`)}
      <input type="date" .value=${this.selectedDay} @change=${(e: Event) => this.selectedDay = (e.target as HTMLInputElement).value}></div>
      <div class="horizontal calendar">${Array.from({length: count}, (_, i) => {
        const date = this.calendarView === "day" ? this.selectedDay : day(i);
        return html`<button class="day" @click=${() => this.selectedDay = date}><b>${date}</b>
          ${events.filter((event: Item) => String(event.start).startsWith(date)).map((event: Item) => html`<span>${event.title}</span>`)}</button>`;
      })}</div><div class="cards">${events.filter((event: Item) => String(event.start).startsWith(this.selectedDay)).map((event: Item) =>
        html`<article><b>${event.title}</b><small>${event.start} – ${event.end}</small>${this.avatar(event.creator_id)}
        <button @click=${() => this.removeItem("calendar", event)}>Delete</button></article>`)}</div>
      <form @submit=${(e: SubmitEvent) => { const v = this.form(e); void this.create("calendar", {
        title: v.title, start: `${this.selectedDay}T${v.time}:00`, end: `${this.selectedDay}T23:59:00`,
        recurrence: v.recurrence || null, shared: v.shared === "on"
      }); }}><input name="title" placeholder="Event" required><input name="time" type="time" value="18:00">
      <select name="recurrence"><option value="">Once</option><option value="FREQ=DAILY">Daily</option><option value="FREQ=WEEKLY">Weekly</option><option value="FREQ=MONTHLY">Monthly</option></select>
      <label><input name="shared" type="checkbox" checked> Shared</label><button>Add</button></form></section>`;
  }
  private groceries() {
    const grocery = this.data.groceries;
    const lists = grocery.lists || [];
    const items = (grocery.items || []).filter((value: Item) => value.list_id === this.listId);
    const slots = grocery.meal_slots || grocery.meal_plans || [];
    return html`<section><div class="toolbar"><h2>Groceries</h2>
      <select .value=${this.listId} @change=${(e: Event) => this.listId = (e.target as HTMLSelectElement).value}>
        ${lists.map((list: Item) => html`<option value=${list.id}>${list.name}${list.store ? ` · ${list.store}` : ""}</option>`)}</select>
      <form @submit=${(e: SubmitEvent) => { const v = this.form(e); void this.create("groceries", {name:v.name,store:v.store,shared:true}, "lists"); }}>
        <input name="name" placeholder="New list" required><input name="store" placeholder="Store"><button>Create list</button></form></div>
      <form @submit=${(e: SubmitEvent) => { const v=this.form(e); void this.create("groceries", {
        name:v.name, quantity:Number(v.quantity), unit:v.unit, category:v.category, list_id:this.listId,
        store:v.store, assignee_id:v.assignee_id || null, checked:false, shared:true
      }); }}><input name="name" placeholder="Item" required><input name="quantity" type="number" value="1" step="any">
      <input name="unit" placeholder="Unit"><input name="category" placeholder="Category"><input name="store" placeholder="Store">
      <select name="assignee_id"><option value="">Anyone</option>${this.peopleOptions()}</select><button>Add / merge</button></form>
      <div class="cards">${items.map((item: Item) => html`<article><input type="checkbox" .checked=${!!item.checked}
        @change=${() => this.updateItem("groceries", item, {checked:!item.checked})}><b>${item.quantity} ${item.unit} ${item.name}</b>
        <small>${item.category}${item.store ? ` · ${item.store}` : ""}</small>${this.avatar(item.assignee_id || item.creator_id)}
        <button @click=${() => this.removeItem("groceries", item)}>×</button></article>`)}</div>
      <h2>7-day meal plan</h2><div class="horizontal meals">${Array.from({length:7},(_,offset) => {
        const date=day(offset); return html`<article><b>${date}</b>${["breakfast","lunch","dinner"].map(slot => {
          const plan=slots.find((value:Item)=>value.day===date&&(value.slot||value.meal)===slot);
          return plan ? html`<div><small>${slot}</small> ${plan.title}<button @click=${()=>this.removeItem("groceries",plan,"meal_slots")}>×</button></div>`
            : html`<form @submit=${(e:SubmitEvent)=>{const v=this.form(e);void this.create("groceries",{day:date,slot,meal:slot,title:v.title},"meal_slots");}}>
              <input name="title" placeholder=${slot}><button>+</button></form>`;
        })}</article>`; })}</div></section>`;
  }
  private peopleOptions() { return (this.data.people.items || []).map((p:Item)=>html`<option value=${p.id}>${p.name}</option>`); }
  private chores() {
    const chores=this.data.chores.items||[], now=new Date();
    const start=this.scorePeriod==="week"
      ? new Date(now.getFullYear(),now.getMonth(),now.getDate()-((now.getDay()+6)%7))
      : new Date(now.getFullYear(),now.getMonth(),1);
    const scores=(this.data.people.items||[]).map((person:Item)=>({person,points:chores.reduce((sum:number,chore:Item)=>
      sum+(chore.assignee_id===person.id?(chore.completed||[]).filter((value:string)=>new Date(value)>=start).length*Number(chore.points):0),0)
    })).sort((a:Item,b:Item)=>b.points-a.points);
    return html`<section><div class="toolbar"><h2>Chores competition</h2><select .value=${this.scorePeriod}
      @change=${(e:Event)=>this.scorePeriod=(e.target as HTMLSelectElement).value as "week"|"month"}><option value="week">This week</option><option value="month">This month</option></select></div>
      <div class="leaderboard">${scores.map((score:Item,i:number)=>html`<article>${this.avatar(score.person.id)}<b>#${i+1} ${score.person.name}</b><strong>${score.points} pts</strong></article>`)}</div>
      <form @submit=${(e:SubmitEvent)=>{const v=this.form(e);void this.create("chores",{title:v.title,assignee_id:v.assignee_id,
        points:Number(v.points),schedule:v.schedule==="weekly"?`weekly:${v.weekday}`:v.schedule==="interval"?`interval:${v.interval}`:v.schedule,
        completed:[],created:day(),shared:true});}}><input name="title" placeholder="Chore" required><select name="assignee_id">${this.peopleOptions()}</select>
      <input name="points" type="number" value="5"><select name="schedule"><option value="daily">Daily</option><option value="weekly">Weekly</option><option value="interval">Every N days</option></select>
      <select name="weekday">${["monday","tuesday","wednesday","thursday","friday","saturday","sunday"].map(v=>html`<option>${v}</option>`)}</select>
      <input name="interval" type="number" min="1" value="2"><button>Schedule</button></form>
      <div class="cards">${chores.map((chore:Item)=>html`<article>${this.avatar(chore.assignee_id)}<b>${chore.title}</b><small>${chore.schedule} · ${chore.points} pts</small>
      <button @click=${()=>this.updateItem("chores",chore,{completed:[...(chore.completed||[]),new Date().toISOString()]})}>Complete</button>
      <button @click=${()=>this.removeItem("chores",chore)}>×</button></article>`)}</div></section>`;
  }
  private recipes() {
    const recipes=this.data.recipes.items||[], lists=this.data.groceries.lists||[];
    return html`<section><h2>Recipes</h2><form @submit=${(e:SubmitEvent)=>{const v=this.form(e);void this.create("recipes",{title:v.title,
      category:v.category||"Other",servings:Number(v.servings),ingredients:String(v.ingredients).split(",").filter(Boolean).map(name=>({name:name.trim(),amount:1,unit:"x",category:"Other"})),instructions:[],shared:true});}}>
      <input name="title" placeholder="Recipe" required><input name="category" placeholder="Category"><input name="servings" type="number" value="4">
      <input name="ingredients" placeholder="Ingredients, comma separated"><button>Add</button></form>
      <div class="cards">${recipes.map((recipe:Item)=>{const amount=this.servings[recipe.id]||recipe.servings;
        const selected=this.selectedIngredients[recipe.id]||new Set(recipe.ingredients.map((_:Item,i:number)=>i));
        return html`<article class="recipe">${this.avatar(recipe.creator_id)}<h3>${recipe.title}</h3><label>Servings <input type="number" min="1" .value=${String(amount)}
          @input=${(e:Event)=>this.servings={...this.servings,[recipe.id]:Number((e.target as HTMLInputElement).value)}}></label>
          ${recipe.ingredients.map((ingredient:Item,i:number)=>html`<label><input type="checkbox" .checked=${selected.has(i)}
            @change=${()=>{const next=new Set(selected);next.has(i)?next.delete(i):next.add(i);this.selectedIngredients={...this.selectedIngredients,[recipe.id]:next};}}>
            ${Math.round(ingredient.amount*amount/recipe.servings*100)/100} ${ingredient.unit} ${ingredient.name}</label>`)}
          <select id=${`list-${recipe.id}`}>${lists.map((list:Item)=>html`<option value=${list.id}>${list.name}</option>`)}</select>
          <button @click=${()=>{const select=this.renderRoot.querySelector(`#list-${recipe.id}`) as HTMLSelectElement;
            void this._hass!.callWS({type:"family_organizer/recipe_to_groceries",recipe_id:recipe.id,servings:amount,list_id:select.value,selected:[...selected]});}}>Add selected to list</button>
          <button @click=${()=>this.removeItem("recipes",recipe)}>Delete</button></article>`;})}</div></section>`;
  }
  private settings() {
    return html`<section><h2>Settings</h2><h3>People</h3><form @submit=${(e:SubmitEvent)=>{const v=this.form(e);void this.create("people",
      {name:v.name,color:v.color,ha_user_id:v.ha_user_id,avatar_url:v.avatar_url,role:v.role,shared:true});}}>
      <input name="name" placeholder="Name" required><input name="color" type="color" value="#3b82f6"><input name="ha_user_id" placeholder="HA user ID">
      <input name="avatar_url" placeholder="Avatar URL"><select name="role"><option>member</option><option>child</option><option>parent</option></select><button>Add</button></form>
      <div class="cards">${(this.data.people.items||[]).map((person:Item)=>html`<article>${this.avatar(person.id)}<b>${person.name}</b><small>${person.role||"member"}</small><button @click=${()=>this.removeItem("people",person)}>×</button></article>`)}</div>
      <h3>Appearance</h3><select .value=${this.theme} @change=${(e:Event)=>{this.theme=(e.target as HTMLSelectElement).value;
        localStorage.setItem("family-organizer-theme",this.theme);void this._hass!.callWS({type:"family_organizer/settings",settings:{theme:this.theme}}).catch(()=>undefined);}}>
        <option value="auto">Follow Home Assistant</option><option value="light">Light</option><option value="dark">Dark</option></select></section>`;
  }
  static styles=css`
    :host{display:block;min-height:100vh;color:var(--primary-text-color);background:var(--primary-background-color);font:14px system-ui}
    [data-theme="dark"]{color:#eee;background:#111;--card-background-color:#242424}[data-theme="light"]{color:#222;background:#f5f5f5;--card-background-color:#fff}
    header{position:sticky;top:0;z-index:2;padding:12px 24px;background:var(--card-background-color,#fff);box-shadow:0 1px 5px #0002}
    h1{margin:0 0 10px}nav,.toolbar,form{display:flex;gap:8px;flex-wrap:wrap;align-items:center}nav{overflow-x:auto;flex-wrap:nowrap;scroll-snap-type:x mandatory}
    button,input,select{border:1px solid var(--divider-color,#bbb);border-radius:8px;padding:8px;background:var(--card-background-color,#fff);color:inherit}
    button{cursor:pointer;scroll-snap-align:start}button.active{background:var(--primary-color,#03a9f4);color:#fff}main{max-width:1200px;margin:auto;padding:20px}
    .horizontal{display:flex;gap:8px;overflow-x:auto;scroll-snap-type:x mandatory;padding:8px 0;touch-action:pan-x}.horizontal>article,.horizontal>.day{min-width:180px;scroll-snap-align:start}
    .calendar .day{min-height:100px;text-align:left;display:flex;flex-direction:column}.day span{background:#03a9f433;margin:2px;padding:3px}
    article{background:var(--card-background-color,#fff);border-radius:10px;padding:12px;display:flex;gap:10px;align-items:center}.cards article{margin:8px 0}.recipe{align-items:flex-start;flex-wrap:wrap}
    article small{flex:1}.leaderboard{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:8px;margin:12px 0}.avatar{width:32px;height:32px;border-radius:50%;object-fit:cover}
    .avatar.fallback{display:grid;place-items:center;background:var(--primary-color,#03a9f4);color:#fff}.meals article{display:block}.meals form{flex-wrap:nowrap}.meals input{min-width:0}.error{color:var(--error-color,#d32f2f)}
    @media(max-width:600px){main{padding:10px}header{padding:10px}.cards article{overflow-x:auto}input{max-width:150px}}
  `;
}
declare global { interface HTMLElementTagNameMap { "family-organizer-panel": FamilyOrganizerPanel } }
