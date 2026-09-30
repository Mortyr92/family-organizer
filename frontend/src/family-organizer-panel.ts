import { LitElement, css, html, nothing, TemplateResult } from "lit";
import { customElement, state } from "lit/decorators.js";

type Item = Record<string, any>;
type Hass = {
  callWS<T>(message: Item): Promise<T>;
  connection: { subscribeMessage(cb: () => void, message: Item): Promise<() => void> };
};
const resources = ["people", "calendar", "groceries", "chores", "recipes", "settings"];
const capabilities = ["manage_people","manage_calendar_all","manage_calendar_own","manage_groceries","manage_meal_plan","manage_chores","complete_own_chores","complete_any_chore","manage_recipes","manage_settings","manage_calendar_sync"];
const iso = (value: Date) => `${value.getFullYear()}-${String(value.getMonth()+1).padStart(2,"0")}-${String(value.getDate()).padStart(2,"0")}`;
const shift = (value: string, amount: number) => { const d=new Date(`${value}T12:00:00`); d.setDate(d.getDate()+amount); return iso(d); };
const monday = (value: string, sunday=false) => { const d=new Date(`${value}T12:00:00`), n=sunday?d.getDay():(d.getDay()+6)%7; d.setDate(d.getDate()-n); return iso(d); };
const fraction = (value: number) => {
  const whole=Math.floor(value), rest=value-whole;
  const common:[[number,string],[number,string],[number,string],[number,string],[number,string]]=[[.25,"¼"],[.333,"⅓"],[.5,"½"],[.667,"⅔"],[.75,"¾"]];
  const found=common.find(([n])=>Math.abs(rest-n)<.03);
  return `${whole||""}${found?.[1]||(!whole?Math.round(value*100)/100:"")}` || "0";
};

@customElement("family-organizer-panel")
export class FamilyOrganizerPanel extends LitElement {
  @state() private page="calendar";
  @state() private data:Record<string,Item>={};
  @state() private selectedDay=iso(new Date());
  @state() private calendarView="month";
  @state() private personFilter=new Set<string>();
  @state() private listId="default";
  @state() private groceryAssignee="";
  @state() private groupStores=false;
  @state() private mealWeek=0;
  @state() private scorePeriod:"week"|"month"="week";
  @state() private servings:Record<string,number>={};
  @state() private selectedIngredients:Record<string,Set<number>>={};
  @state() private theme=localStorage.getItem("family-organizer-theme")||"auto";
  @state() private error="";
  private _hass?:Hass;
  private unsubscribe?:()=>void;

  set hass(value:Hass){const first=!this._hass;this._hass=value;if(first)void this.load();}
  disconnectedCallback(){this.unsubscribe?.();super.disconnectedCallback();}
  private form(e:SubmitEvent){e.preventDefault();return Object.fromEntries(new FormData(e.currentTarget as HTMLFormElement));}
  private async action(work:Promise<unknown>){try{await work;this.error="";}catch(e){this.error=String(e);}}
  private async load(){
    try{
      const values=await Promise.all(resources.map(resource=>this._hass!.callWS<Item>({type:"family_organizer/list",resource})));
      this.data=Object.fromEntries(resources.map((resource,i)=>[resource,values[i]]));
      const s=this.data.settings||{};
      this.calendarView=s.default_calendar_view||this.calendarView;
      this.scorePeriod=s.competition_default||this.scorePeriod;
      this.listId=(this.data.groceries?.lists||[]).some((x:Item)=>x.id===this.listId)?this.listId:s.default_grocery_list_id||"default";
      this.theme=localStorage.getItem("family-organizer-theme")||s.theme||"auto";
      if(!this.unsubscribe)this.unsubscribe=await this._hass!.connection.subscribeMessage(()=>void this.load(),{type:"family_organizer/subscribe"});
      this.error="";
    }catch(e){this.error=String(e);}
  }
  private create(resource:string,item:Item,collection="items"){return this.action(this._hass!.callWS({type:"family_organizer/create",resource,collection,item}));}
  private updateItem(resource:string,item:Item,patch:Item,collection="items"){return this.action(this._hass!.callWS({type:"family_organizer/update",resource,collection,item_id:item.id,item:patch}));}
  private removeItem(resource:string,item:Item,collection="items"){return this.action(this._hass!.callWS({type:"family_organizer/delete",resource,collection,item_id:item.id}));}
  private person(id?:string){return(this.data.people?.items||[]).find((x:Item)=>x.id===id);}
  private avatar(id?:string){
    const p=this.person(id),picture=p?.profile_picture||p?.avatar_url;
    return picture?html`<img class="avatar" src=${picture} alt=${p.name}>`:html`<span class="avatar fallback" style=${`background:${p?.color||"#64748b"}`}>${p?.initials||p?.name?.[0]||"?"}</span>`;
  }
  private peopleOptions(selected?:string){return(this.data.people.items||[]).map((p:Item)=>html`<option value=${p.id} ?selected=${p.id===selected}>${p.name}</option>`);}

  render(){
    const labels:Item={calendar:"Calendar",groceries:"Groceries & meals",chores:"Chores",recipes:"Recipes",settings:"Settings"};
    return html`<div data-theme=${this.theme}><header><h1>Family Organizer</h1><nav>${Object.entries(labels).map(([id,label])=>html`<button class=${this.page===id?"active":""} @click=${()=>this.page=id}>${label}</button>`)}</nav></header>
      <main>${this.error?html`<p class="error">${this.error}</p>`:nothing}${!this.data.people?html`Loading…`:this.renderPage()}</main></div>`;
  }
  private renderPage(){return this.page==="calendar"?this.calendar():this.page==="groceries"?this.groceries():this.page==="chores"?this.chores():this.page==="recipes"?this.recipes():this.settings();}

  private calendarDates(){
    if(this.calendarView==="day")return[this.selectedDay];
    const start=this.calendarView==="week"?monday(this.selectedDay,this.data.settings.week_start==="sunday"):(()=>{
      const d=new Date(`${this.selectedDay}T12:00:00`);d.setDate(1);
      return monday(iso(d),this.data.settings.week_start==="sunday");
    })();
    return Array.from({length:this.calendarView==="week"?7:42},(_,i)=>shift(start,i));
  }
  private calendar(){
    const all=this.data.calendar.items||[], people=this.data.people.items||[];
    const events=all.filter((e:Item)=>!this.personFilter.size||(e.person_ids||[]).some((id:string)=>this.personFilter.has(id)));
    const dates=this.calendarDates(), overview=events.filter((e:Item)=>String(e.start).startsWith(this.selectedDay));
    const move=this.calendarView==="month"?31:this.calendarView==="week"?7:1;
    const grid=html`<div class=${`calendar-grid ${this.calendarView}`}>
      ${this.calendarView!=="month"?html`<div class="all-day"><b>All day</b>${events.filter((e:Item)=>e.all_day&&dates.some(d=>String(e.start).startsWith(d))).map((e:Item)=>html`<span>${e.title}</span>`)}</div>`:nothing}
      ${dates.map(date=>html`<div class=${`calendar-day ${date===iso(new Date())?"today":""}`} @click=${()=>this.selectedDay=date}><b>${date.slice(5)}</b>
        ${events.filter((e:Item)=>String(e.start).startsWith(date)&&(!e.all_day||this.calendarView==="month")).map((e:Item)=>html`<span class="event">${e.title}</span>`)}
        ${this.calendarView!=="month"?Array.from({length:24},(_,h)=>html`<i class="hour">${h}:00</i>`):nothing}
        ${date===iso(new Date())&&this.calendarView!=="month"?html`<em class="now" style=${`top:${54+new Date().getHours()*32+new Date().getMinutes()*32/60}px`}></em>`:nothing}
      </div>`)}</div>`;
    const overviewPanel=html`<aside class=${this.data.settings.overview_collapsed?"collapsed":""}><button @click=${()=>this.saveSettings({overview_collapsed:!this.data.settings.overview_collapsed})}>${this.data.settings.overview_collapsed?"›":"‹"} Day overview</button>
      ${this.data.settings.overview_collapsed?nothing:html`<h3>${this.selectedDay}</h3>${overview.map((e:Item)=>html`<article><b>${e.title}</b><small>${e.all_day?"All day":String(e.start).slice(11,16)} · ${(e.person_ids||[]).map((id:string)=>this.person(id)?.name).join(", ")}</small><button @click=${()=>this.removeItem("calendar",e)}>×</button></article>`)}`}</aside>`;
    return html`<section><div class="toolbar"><h2>Calendar</h2><button @click=${()=>this.selectedDay=shift(this.selectedDay,-move)}>←</button><button @click=${()=>this.selectedDay=iso(new Date())}>Today</button><button @click=${()=>this.selectedDay=shift(this.selectedDay,move)}>→</button>
      ${["month","week","day"].map(v=>html`<button class=${v===this.calendarView?"active":""} @click=${()=>this.calendarView=v}>${v}</button>`)}
      <input type="date" .value=${this.selectedDay} @change=${(e:Event)=>this.selectedDay=(e.target as HTMLInputElement).value}></div>
      <div class="chips">${people.map((p:Item)=>html`<button class=${this.personFilter.has(p.id)?"active":""} @click=${()=>{const n=new Set(this.personFilter);n.has(p.id)?n.delete(p.id):n.add(p.id);this.personFilter=n;}}>${p.name}</button>`)}</div>
      <div class=${`calendar-shell overview-${this.data.settings.overview_position}`}>${overviewPanel}${grid}</div>
      <form @submit=${(e:SubmitEvent)=>{const f=e.currentTarget as HTMLFormElement,v=this.form(e);void this.create("calendar",{title:v.title,start:`${this.selectedDay}T${v.start}:00`,end:`${this.selectedDay}T${v.end}:00`,all_day:v.all_day==="on",person_ids:[...new FormData(f).getAll("person_ids")],recurrence:v.recurrence||null,shared:true});}}>
        <input name="title" placeholder="Event" required><input name="start" type="time" value="18:00"><input name="end" type="time" value="19:00"><label><input name="all_day" type="checkbox">All day</label>
        ${people.map((p:Item)=>html`<label><input name="person_ids" type="checkbox" value=${p.id}>${p.name}</label>`)}
        <select name="recurrence"><option value="">Once</option><option value="FREQ=DAILY">Daily</option><option value="FREQ=WEEKLY">Weekly</option><option value="FREQ=MONTHLY">Monthly</option></select><button>Add event</button></form></section>`;
  }

  private groceries(){
    const grocery=this.data.groceries,lists=grocery.lists||[],stores=this.data.settings.stores||[];
    let items=(grocery.items||[]).filter((x:Item)=>x.list_id===this.listId&&(!this.groceryAssignee||x.assignee_id===this.groceryAssignee));
    if(this.groupStores)items=[...items].sort((a:Item,b:Item)=>(a.store||"").localeCompare(b.store||""));
    const current=lists.find((x:Item)=>x.id===this.listId),slots=grocery.meal_slots||grocery.meal_plans||[],weekStart=shift(monday(iso(new Date())),this.mealWeek*7);
    return html`<section><div class="toolbar"><h2>Groceries</h2><select .value=${this.listId} @change=${(e:Event)=>this.listId=(e.target as HTMLSelectElement).value}>${lists.map((x:Item)=>html`<option value=${x.id}>${x.name}</option>`)}</select>
      ${current?html`<button @click=${()=>{const name=prompt("List name",current.name);if(name)void this.updateItem("groceries",current,{name},"lists");}}>Rename</button><button ?disabled=${lists.length<2} @click=${()=>void this.removeItem("groceries",current,"lists")}>Delete list</button>`:nothing}
      <select .value=${this.groceryAssignee} @change=${(e:Event)=>this.groceryAssignee=(e.target as HTMLSelectElement).value}><option value="">All assignees</option>${this.peopleOptions()}</select>
      <label><input type="checkbox" .checked=${this.groupStores} @change=${()=>this.groupStores=!this.groupStores}>Group by store</label>
      <button @click=${()=>items.filter((x:Item)=>x.checked).forEach((x:Item)=>void this.removeItem("groceries",x))}>Clear bought</button></div>
      <form @submit=${(e:SubmitEvent)=>{const v=this.form(e);void this.create("groceries",{name:v.name,store:v.store,shared:true},"lists");}}><input name="name" placeholder="New list" required><input name="store" list="stores" placeholder="Default store"><button>Create list</button></form>
      <datalist id="stores">${stores.map((s:string)=>html`<option value=${s}>`)}</datalist>
      <form @submit=${(e:SubmitEvent)=>{const v=this.form(e);void this.create("groceries",{name:v.name,quantity:Number(v.quantity),unit:v.unit,notes:v.notes,list_id:this.listId,store:v.store,assignee_id:v.assignee_id||null,checked:false,shared:true});}}>
        <input name="name" placeholder="Item" required><input name="quantity" type="number" value="1" step="any"><input name="unit" placeholder="Unit"><input name="notes" placeholder="Notes"><input name="store" list="stores" placeholder="Store"><select name="assignee_id"><option value="">Anyone</option>${this.peopleOptions()}</select><button>Add / merge</button></form>
      <div class="cards">${items.map((x:Item,i:number)=>html`${this.groupStores&&(i===0||items[i-1].store!==x.store)?html`<h3>${x.store||"No store"}</h3>`:nothing}<article><input type="checkbox" .checked=${!!x.checked} @change=${()=>this.updateItem("groceries",x,{checked:!x.checked})}><b>${x.quantity} ${x.unit} ${x.name}</b><small>${x.notes||""}${x.store?` · ${x.store}`:""}</small><span title="Created by">${this.avatar(x.creator_id)}</span>${x.assignee_id?html`<span title="Assigned to">${this.avatar(x.assignee_id)}</span>`:nothing}<button @click=${()=>this.removeItem("groceries",x)}>×</button></article>`)}</div>
      <div class="toolbar"><h2>Meal plan</h2><button @click=${()=>this.mealWeek--}>←</button><button @click=${()=>this.mealWeek=0}>This week</button><button @click=${()=>this.mealWeek++}>→</button></div>
      <div class="horizontal meals">${Array.from({length:7},(_,i)=>{const d=shift(weekStart,i);return html`<article><b>${d}</b>${(this.data.settings.meal_slots||["breakfast","lunch","dinner"]).map((slot:string)=>{
        const plan=slots.find((x:Item)=>x.day===d&&(x.slot||x.meal)===slot);return plan?html`<div><small>${slot}</small> ${plan.title}<button @click=${()=>this.removeItem("groceries",plan,"meal_slots")}>×</button></div>`:html`<form @submit=${(e:SubmitEvent)=>{const v=this.form(e),recipe=(this.data.recipes.items||[]).find((x:Item)=>x.id===v.recipe_id);void this.create("groceries",{day:d,slot,recipe_id:v.recipe_id||null,title:recipe?.title||v.title,servings:recipe?.servings||1},"meal_slots");}}><small>${slot}</small><select name="recipe_id"><option value="">Free text</option>${(this.data.recipes.items||[]).map((r:Item)=>html`<option value=${r.id}>${r.title}</option>`)}</select><input name="title" placeholder="Meal"><button>+</button></form>`;})}</article>`;})}</div></section>`;
  }

  private choreDue(c:Item,d:string){
    const created=c.created?.slice(0,10)||d;if(d<created)return false;
    if(!c.schedule||c.schedule==="once")return d===(c.due_date||created);
    if(c.schedule==="daily")return true;
    const date=new Date(`${d}T12:00:00`);
    if(c.schedule==="weekly")return(c.weekdays||[]).map(Number).includes((date.getDay()+6)%7);
    if(String(c.schedule).startsWith("weekly:"))return String(c.schedule).split(":")[1].includes(date.toLocaleDateString("en",{weekday:"long"}).toLowerCase());
    if(c.schedule==="monthly")return date.getDate()===Number(c.month_day||new Date(`${created}T12:00:00`).getDate());
    const interval=Number(c.interval_days||String(c.schedule).split(":")[1]||1);
    return Math.floor((date.getTime()-new Date(`${created}T12:00:00`).getTime())/86400000)%interval===0;
  }
  private chores(){
    const chores=this.data.chores.items||[],completions=this.data.chores.completions||[],due=chores.filter((c:Item)=>this.choreDue(c,this.selectedDay));
    const now=new Date(),start=this.scorePeriod==="week"?new Date(`${monday(iso(now))}T00:00:00`):new Date(now.getFullYear(),now.getMonth(),1);
    const priorEnd=new Date(start.getTime()-1),priorStart=this.scorePeriod==="week"?new Date(priorEnd.getTime()-6*86400000):new Date(priorEnd.getFullYear(),priorEnd.getMonth(),1);
    const scores=(this.data.people.items||[]).map((person:Item)=>({person,points:completions.filter((x:Item)=>x.person_id===person.id&&new Date(x.completed_at)>=start).reduce((n:number,x:Item)=>n+Number(x.points),0)})).sort((a:Item,b:Item)=>b.points-a.points);
    const prior=(this.data.people.items||[]).map((person:Item)=>({person,points:completions.filter((x:Item)=>x.person_id===person.id&&new Date(x.completed_at)>=priorStart&&new Date(x.completed_at)<=priorEnd).reduce((n:number,x:Item)=>n+Number(x.points),0)})).sort((a:Item,b:Item)=>b.points-a.points);
    const max=Math.max(1,...scores.map((x:Item)=>x.points));
    return html`<section><div class="toolbar"><h2>Chores</h2><input type="date" .value=${this.selectedDay} @change=${(e:Event)=>this.selectedDay=(e.target as HTMLInputElement).value}><select .value=${this.scorePeriod} @change=${(e:Event)=>this.scorePeriod=(e.target as HTMLSelectElement).value as "week"|"month"}><option value="week">Week</option><option value="month">Month</option></select></div>
      <div class="leaderboard">${scores.map((s:Item,i:number)=>html`<article>${i===0?"👑":nothing}${this.avatar(s.person.id)}<b>${s.person.name}</b><progress max=${max} value=${s.points}></progress><strong>${s.points} pts</strong></article>`)}</div><p>Prior winner: ${prior[0]?.points?`${prior[0].person.name} (${prior[0].points})`:"—"}</p>
      <form @submit=${(e:SubmitEvent)=>{const f=e.currentTarget as HTMLFormElement,v=this.form(e);void this.create("chores",{title:v.title,assignee_ids:[...new FormData(f).getAll("assignee_ids")],rotate:v.rotate==="on",points:Number(v.points),schedule:v.schedule,weekdays:[...new FormData(f).getAll("weekdays")].map(Number),month_day:Number(v.month_day),interval_days:Number(v.interval_days),due_date:v.due_date||null,due_time:v.due_time||null,icon:v.icon,created:iso(new Date()),shared:true});}}>
        <input name="title" placeholder="Chore" required><input name="icon" value="mdi:check-circle-outline" placeholder="Icon"><input name="points" type="number" value="5">
        ${this.data.people.items.map((p:Item)=>html`<label><input name="assignee_ids" type="checkbox" value=${p.id}>${p.name}</label>`)}<label><input name="rotate" type="checkbox">Rotate</label>
        <select name="schedule"><option value="once">Once</option><option value="daily">Daily</option><option value="weekly">Weekly</option><option value="monthly">Monthly</option><option value="custom">Custom interval</option></select>
        ${["M","T","W","T","F","S","S"].map((x,i)=>html`<label><input name="weekdays" type="checkbox" value=${i}>${x}</label>`)}
        <input name="month_day" type="number" min="1" max="31" value="1"><input name="interval_days" type="number" min="1" value="2"><input name="due_date" type="date"><input name="due_time" type="time"><button>Schedule</button></form>
      <div class="cards">${due.map((c:Item)=>{const ids=c.assignee_ids||[c.assignee_id],active=ids[c.rotation_index%ids.length],done=completions.some((x:Item)=>x.chore_id===c.id&&x.completed_at.startsWith(this.selectedDay)),overdue=!done&&this.selectedDay<iso(new Date())||(!done&&this.selectedDay===iso(new Date())&&c.due_time&&c.due_time<now.toTimeString().slice(0,5));return html`<article class=${overdue?"overdue":""}>${this.avatar(active)}<b>${c.icon} ${c.title}</b><small>${done?"Completed":overdue?"Overdue":`Due ${c.due_time||"today"}`} · ${c.points} pts</small><button ?disabled=${done} @click=${()=>this.action(this._hass!.callWS({type:"family_organizer/complete_chore",chore_id:c.id,person_id:active}))}>Complete</button><button @click=${()=>this.removeItem("chores",c)}>×</button></article>`;})}</div>
      <details><summary>History & manual points</summary><form @submit=${(e:SubmitEvent)=>{const v=this.form(e);void this.action(this._hass!.callWS({type:"family_organizer/adjust_points",person_id:v.person_id,points:Number(v.points),note:v.note}));}}><select name="person_id">${this.peopleOptions()}</select><input name="points" type="number" required><input name="note" placeholder="Reason"><button>Adjust</button></form>${completions.slice().reverse().slice(0,30).map((x:Item)=>html`<p>${x.completed_at.slice(0,16)} · ${this.person(x.person_id)?.name||"Unknown"} · ${x.points} pts ${x.note||""}</p>`)}</details></section>`;
  }

  private categoryTree(parent:string|null=null,depth=0):TemplateResult{
    const categories=(this.data.recipes.categories||[]).filter((x:Item)=>(x.parent_id||null)===parent);
    return html`${categories.map((c:Item)=>html`<div style=${`margin-left:${depth*16}px`}><b>${c.name}</b><button @click=${()=>{const name=prompt("Category name",c.name);if(name)void this.updateItem("recipes",c,{name},"categories");}}>Rename</button><select @change=${(e:Event)=>this.updateItem("recipes",c,{parent_id:(e.target as HTMLSelectElement).value||null},"categories")}><option value="">Root</option>${(this.data.recipes.categories||[]).filter((x:Item)=>x.id!==c.id).map((x:Item)=>html`<option value=${x.id} ?selected=${x.id===c.parent_id}>${x.name}</option>`)}</select><button @click=${()=>this.removeItem("recipes",c,"categories")}>×</button>${this.categoryTree(c.id,depth+1)}</div>`)}`;
  }
  private recipes(){
    const recipes=this.data.recipes.items||[],categories=this.data.recipes.categories||[],lists=this.data.groceries.lists||[];
    return html`<section><h2>Recipe categories</h2><form @submit=${(e:SubmitEvent)=>{const v=this.form(e);void this.create("recipes",{name:v.name,parent_id:v.parent_id||null},"categories");}}><input name="name" required placeholder="Category"><select name="parent_id"><option value="">Root</option>${categories.map((c:Item)=>html`<option value=${c.id}>${c.name}</option>`)}</select><button>Add</button></form>${this.categoryTree()}
      <h2>Recipes</h2><form @submit=${(e:SubmitEvent)=>{const f=e.currentTarget as HTMLFormElement,v=this.form(e);void this.create("recipes",{title:v.title,category_ids:[...new FormData(f).getAll("category_ids")],tags:String(v.tags).split(",").map(x=>x.trim()).filter(Boolean),image:v.image||null,prep_time:Number(v.prep_time),cook_time:Number(v.cook_time),servings:Number(v.servings),ingredients:String(v.ingredients).split("\\n").filter(Boolean).map(line=>{const [amount,unit,...name]=line.trim().split(/\\s+/);return{amount:Number(amount)||1,unit:Number(amount)?unit:"",name:Number(amount)?name.join(" "):line.trim()};}),steps:String(v.steps).split("\\n").filter(Boolean),shared:true});}}>
        <input name="title" placeholder="Recipe" required><input name="tags" placeholder="tags, comma separated"><input name="image" placeholder="Image URL"><input name="prep_time" type="number" placeholder="Prep min"><input name="cook_time" type="number" placeholder="Cook min"><input name="servings" type="number" value="4" step=".25">
        ${categories.map((c:Item)=>html`<label><input name="category_ids" type="checkbox" value=${c.id}>${c.name}</label>`)}<textarea name="ingredients" placeholder="1 cup flour&#10;2 x eggs"></textarea><textarea name="steps" placeholder="One instruction per line"></textarea><button>Add recipe</button></form>
      <div class="cards">${recipes.map((r:Item)=>{const amount=this.servings[r.id]||r.servings,selected=this.selectedIngredients[r.id]||new Set(r.ingredients.map((_:Item,i:number)=>i));return html`<article class="recipe">${r.image?html`<img class="recipe-image" src=${r.image}>`:nothing}<h3>${r.title}</h3><small>${r.tags?.join(" · ")} · ${r.prep_time||0}+${r.cook_time||0} min</small><div><button @click=${()=>this.servings={...this.servings,[r.id]:Math.max(.25,amount-.25)}}>−</button> ${fraction(amount)} servings <button @click=${()=>this.servings={...this.servings,[r.id]:amount+.25}}>+</button></div>
        ${(r.ingredients||[]).map((ing:Item,i:number)=>html`<label><input type="checkbox" .checked=${selected.has(i)} @change=${()=>{const n=new Set(selected);n.has(i)?n.delete(i):n.add(i);this.selectedIngredients={...this.selectedIngredients,[r.id]:n};}}>${fraction(Number(ing.amount)*amount/r.servings)} ${ing.unit} ${ing.name} → <select id=${`route-${r.id}-${i}`}>${lists.map((l:Item)=>html`<option value=${l.id}>${l.name}</option>`)}</select></label>`)}
        <ol>${(r.steps||r.instructions||[]).map((x:string)=>html`<li>${x}</li>`)}</ol><button @click=${()=>{const routes=Object.fromEntries((r.ingredients||[]).map((_:Item,i:number)=>[String(i),(this.renderRoot.querySelector(`#route-${r.id}-${i}`) as HTMLSelectElement).value]));void this.action(this._hass!.callWS({type:"family_organizer/recipe_to_groceries",recipe_id:r.id,servings:amount,list_id:lists[0]?.id,selected:[...selected],routes}));}}>Add selected to groceries</button>
        <button @click=${()=>this.create("groceries",{day:this.selectedDay,slot:(this.data.settings.meal_slots||["dinner"])[0],recipe_id:r.id,title:r.title,servings:amount},"meal_slots")}>Add to meal plan</button><button @click=${()=>this.removeItem("recipes",r)}>Delete</button></article>`;})}</div></section>`;
  }

  private saveSettings(patch:Item){this.data={...this.data,settings:{...this.data.settings,...patch}};return this.action(this._hass!.callWS({type:"family_organizer/settings",settings:patch}));}
  private settings(){
    const s=this.data.settings;
    return html`<section><h2>Settings</h2><h3>People and permissions</h3><form @submit=${(e:SubmitEvent)=>{const v=this.form(e);void this.create("people",{name:v.name,color:v.color,user_id:v.user_id||null,profile_picture:v.profile_picture||null,role:v.role,permissions:{},shared:true});}}><input name="name" required placeholder="Name"><input name="color" type="color" value="#3b82f6"><input name="user_id" placeholder="Home Assistant user ID"><input name="profile_picture" placeholder="Profile picture URL"><select name="role"><option value="parent_admin">parent_admin</option><option value="parent">parent</option><option value="child">child</option></select><button>Add person</button></form>
      <div class="permission-table">${(this.data.people.items||[]).map((p:Item)=>html`<article>${this.avatar(p.id)}<input .value=${p.name} @change=${(e:Event)=>this.updateItem("people",p,{name:(e.target as HTMLInputElement).value})}><select .value=${p.role} @change=${(e:Event)=>this.updateItem("people",p,{role:(e.target as HTMLSelectElement).value})}><option>parent_admin</option><option>parent</option><option>child</option></select><input .value=${p.user_id||""} placeholder="HA user ID" @change=${(e:Event)=>this.updateItem("people",p,{user_id:(e.target as HTMLInputElement).value||null})}><div>${capabilities.map(cap=>html`<label><input type="checkbox" .checked=${p.permissions?.[cap]??(p.role==="parent_admin"||(p.role==="parent"&&!["manage_people","manage_settings","manage_calendar_sync"].includes(cap))||(p.role==="child"&&["manage_calendar_own","manage_groceries","manage_meal_plan","complete_own_chores","manage_recipes"].includes(cap)))} @change=${(e:Event)=>this.updateItem("people",p,{permissions:{...(p.permissions||{}),[cap]:(e.target as HTMLInputElement).checked}})}>${cap}</label>`)}</div><button @click=${()=>this.removeItem("people",p)}>Delete</button></article>`)}</div>
      <h3>Display and defaults</h3><form @change=${(e:Event)=>{const form=e.currentTarget as HTMLFormElement,v=Object.fromEntries(new FormData(form));void this.saveSettings({overview_position:v.overview_position,week_start:v.week_start,time_format:v.time_format,default_calendar_view:v.default_calendar_view,default_grocery_list_id:v.default_grocery_list_id,competition_default:v.competition_default,language:v.language,meal_slots:String(v.meal_slots).split(",").map(x=>x.trim()).filter(Boolean),stores:String(v.stores).split(",").map(x=>x.trim()).filter(Boolean)});}}>
        <label>Day overview <select name="overview_position" .value=${s.overview_position}><option>left</option><option>right</option></select></label><label>Week starts <select name="week_start" .value=${s.week_start}><option>monday</option><option>sunday</option></select></label><label>Time <select name="time_format" .value=${s.time_format}><option value="24">24-hour</option><option value="12">12-hour</option></select></label><label>Calendar default <select name="default_calendar_view" .value=${s.default_calendar_view}><option>month</option><option>week</option><option>day</option></select></label><label>Grocery default <select name="default_grocery_list_id" .value=${s.default_grocery_list_id}>${(this.data.groceries.lists||[]).map((x:Item)=>html`<option value=${x.id}>${x.name}</option>`)}</select></label><label>Meal slots <input name="meal_slots" .value=${(s.meal_slots||[]).join(", ")}></label><label>Stores <input name="stores" .value=${(s.stores||[]).join(", ")}></label><label>Competition <select name="competition_default" .value=${s.competition_default}><option>week</option><option>month</option></select></label><label>Language <input name="language" .value=${s.language||"en"}></label></form>
      <h3>Appearance</h3><select .value=${this.theme} @change=${(e:Event)=>{this.theme=(e.target as HTMLSelectElement).value;localStorage.setItem("family-organizer-theme",this.theme);void this.saveSettings({theme:this.theme});}}><option value="auto">Follow Home Assistant</option><option value="light">Light</option><option value="dark">Dark</option></select><p>Calendar sync sources and credentials are configured under Settings → Devices & services → Family Organizer → Configure.</p></section>`;
  }

  static styles=css`
    :host{display:block;min-height:100vh;color:var(--primary-text-color);background:var(--primary-background-color);font:14px system-ui}[data-theme=dark]{color:#eee;background:#111;--card-background-color:#242424}[data-theme=light]{color:#222;background:#f5f5f5;--card-background-color:#fff}
    header{position:sticky;top:0;z-index:4;padding:12px 24px;background:var(--card-background-color,#fff);box-shadow:0 1px 5px #0002}h1{margin:0 0 8px}nav,.toolbar,form,.chips{display:flex;gap:8px;flex-wrap:wrap;align-items:center}nav{overflow-x:auto;flex-wrap:nowrap}main{max-width:1300px;margin:auto;padding:20px}
    button,input,select,textarea{border:1px solid var(--divider-color,#bbb);border-radius:7px;padding:7px;background:var(--card-background-color,#fff);color:inherit}button{cursor:pointer}button.active{background:var(--primary-color,#03a9f4);color:white}.error,.overdue{color:var(--error-color,#d32f2f)}
    .cards article,aside article,.leaderboard article,.permission-table article{margin:8px 0;background:var(--card-background-color,#fff);border-radius:10px;padding:10px;display:flex;gap:9px;align-items:center}.cards article small,aside article small{flex:1}.avatar{width:32px;height:32px;border-radius:50%;object-fit:cover}.fallback{display:inline-grid;place-items:center;color:white}
    .calendar-shell{display:grid;grid-template-columns:220px 1fr;gap:10px}.calendar-shell.overview-right{grid-template-columns:1fr 220px}.overview-right aside{order:2}aside.collapsed{width:36px}.calendar-grid{display:grid;grid-template-columns:repeat(7,minmax(110px,1fr));overflow:auto}.calendar-grid.day{grid-template-columns:1fr}.calendar-day{min-height:110px;border:1px solid var(--divider-color,#ddd);padding:5px;position:relative}.calendar-grid.week .calendar-day,.calendar-grid.day .calendar-day{min-height:822px;padding-top:48px}.calendar-day.today{box-shadow:inset 0 0 0 2px var(--primary-color,#03a9f4)}.event,.all-day span{display:block;background:#03a9f433;padding:3px;margin:2px}.hour{display:block;height:30px;border-top:1px solid #8883;font-style:normal}.now{position:absolute;left:0;right:0;border-top:2px solid #e53935}.all-day{grid-column:1/-1;display:flex;gap:5px;padding:7px}
    .horizontal{display:flex;gap:8px;overflow-x:auto;padding:8px 0}.horizontal>article{min-width:240px;background:var(--card-background-color,#fff);padding:10px;border-radius:9px}.meals article{display:block}.leaderboard{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:8px}.leaderboard article{margin:0}.leaderboard progress{min-width:40px;flex:1}.recipe{align-items:flex-start!important;flex-wrap:wrap}.recipe-image{width:100px;height:70px;object-fit:cover;border-radius:6px}.permission-table article{align-items:flex-start}.permission-table article>div{display:grid;grid-template-columns:repeat(2,minmax(180px,1fr));flex:1}textarea{min-height:65px}
    @media(max-width:700px){main{padding:10px}header{padding:10px}.calendar-shell,.calendar-shell.overview-right{display:block}.calendar-grid{grid-template-columns:repeat(7,minmax(90px,1fr))}.permission-table article{flex-wrap:wrap}.permission-table article>div{grid-template-columns:1fr}.cards article{overflow:auto}}
  `;
}
declare global{interface HTMLElementTagNameMap{"family-organizer-panel":FamilyOrganizerPanel}}
