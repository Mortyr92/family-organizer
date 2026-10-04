export type Item = Record<string, any>;

export const iso = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
export const dayDate = (day: string) => new Date(`${day}T12:00:00`);
export function shift(day: string, amount: number) {
  const date = dayDate(day);
  date.setDate(date.getDate() + amount);
  return iso(date);
}
export function moveDate(day: string, view: string, direction: number) {
  if (view !== "month") return shift(day, direction * (view === "week" ? 7 : 1));
  const date = dayDate(day), wanted = date.getDate();
  date.setDate(1);
  date.setMonth(date.getMonth() + direction);
  const last = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  date.setDate(Math.min(wanted, last));
  return iso(date);
}
export function localeName(language?: string) {
  try { return new Intl.DateTimeFormat(language || navigator.language).resolvedOptions().locale; }
  catch { return "en"; }
}
export function weekStartIndex(setting?: string, locale = "en") {
  if (setting === "sunday") return 0;
  if (setting === "monday") return 1;
  try {
    const info = new Intl.Locale(locale) as Intl.Locale & { getWeekInfo?: () => { firstDay: number }; weekInfo?: { firstDay: number } };
    return (info.getWeekInfo?.() || info.weekInfo)?.firstDay! % 7 || 0;
  } catch { return 1; }
}
export function weekStart(day: string, firstDay = 1) {
  return shift(day, -((dayDate(day).getDay() - firstDay + 7) % 7));
}
export function calendarDates(day: string, view: string, firstDay = 1) {
  if (view === "day") return [day];
  const start = weekStart(view === "month" ? `${day.slice(0, 7)}-01` : day, firstDay);
  return Array.from({ length: view === "month" ? 42 : 7 }, (_, i) => shift(start, i));
}
export function fraction(value: number) {
  if (!Number.isFinite(value)) return "—";
  const whole = Math.floor(value), rest = value - whole;
  const common: [number, string][] = [[.25, "¼"], [1 / 3, "⅓"], [.5, "½"], [2 / 3, "⅔"], [.75, "¾"]];
  const match = common.find(([number]) => Math.abs(rest - number) < .008);
  return match ? `${whole || ""}${match[1]}` : String(Math.round(value * 1000) / 1000);
}
export function parseIngredients(text: string) {
  return text.split(/\r?\n/).map(line => line.trim()).filter(Boolean).map(line => {
    // Two spaces encode an intentionally blank unit in editor round trips.
    const withoutUnit = line.match(/^(\d+(?:\.\d+)?(?:\/\d+)?)\s{2,}(.+)$/);
    const match = line.match(/^(\d+(?:\.\d+)?(?:\/\d+)?)(?:\s+)(\S+)(?:\s+)(.+)$/);
    const quantity = withoutUnit || match || line.match(/^(\d+(?:\.\d+)?(?:\/\d+)?)\s+(.+)$/);
    if (!quantity) return { amount: 1, unit: "", name: line };
    const [top, bottom] = quantity[1].split("/").map(Number);
    return { amount: bottom ? top / bottom : top, unit: withoutUnit || !match ? "" : match[2], name: withoutUnit ? withoutUnit[2] : match ? match[3] : quantity[2] };
  });
}
export function serializeIngredients(ingredients: Item[]) {
  return ingredients.map(ingredient => `${ingredient.amount ?? 1} ${ingredient.unit || ""} ${ingredient.name || ""}`).join("\n");
}
export function mergeIngredients(text: string, original: Item[] = []) {
  const parsed = parseIngredients(text), used = new Set<number>();
  return parsed.map((ingredient, position) => {
    let index = original.findIndex((value, i) => !used.has(i) && value.name === ingredient.name && (value.unit || "") === ingredient.unit && Number(value.amount) === ingredient.amount);
    if (index < 0) index = original.findIndex((value, i) => !used.has(i) && value.name === ingredient.name && (value.unit || "") === ingredient.unit);
    if (index < 0) index = original.findIndex((value, i) => !used.has(i) && value.name === ingredient.name);
    if (index < 0 && parsed.length === original.length && !used.has(position)) index = position;
    if (index >= 0) used.add(index);
    return { ...(index >= 0 ? original[index] : {}), ...ingredient };
  });
}
export function presetCapability(role: string, capability: string) {
  return role === "parent_admin" || (role === "parent" && !["manage_people", "manage_settings", "manage_calendar_sync"].includes(capability))
    || (role === "child" && ["manage_calendar_own", "manage_groceries", "manage_todos", "manage_meal_plan", "complete_own_chores", "manage_recipes", "manage_journal"].includes(capability));
}
export function calendarPayload(item: Item) {
  const fields = ["title", "start", "end", "all_day", "person_ids", "description", "location", "recurrence", "exdates", "source_id", "external_id", "shared"];
  return Object.fromEntries(fields.filter(field => item[field] !== undefined).map(field => [field, item[field]]));
}
export function duplicateEvent(event: Item) {
  const fields = ["all_day", "person_ids", "description", "location", "recurrence", "shared"];
  return {
    ...Object.fromEntries(fields.filter(field => event[field] !== undefined).map(field => [field, event[field]])),
    title: `${event.title} (copy)`,
    start: event.occurrence_start || event.start,
    end: event.occurrence_end || event.end,
  };
}
export function resolveGroceryList(lists: Item[], current: string, preferred?: string, initialize = false) {
  const candidate = initialize && preferred ? preferred : current;
  return lists.find(list => list.id === candidate)?.id || lists.find(list => list.id === preferred)?.id || lists[0]?.id || "default";
}
/** Next occurrence of a birthday (MM-DD or YYYY-MM-DD) on or after `today`, with the age turning if a year is known. */
export function nextBirthday(birthday: string | undefined | null, today: string) {
  const match = String(birthday || "").match(/^(?:(\d{4})-)?(\d{2})-(\d{2})$/);
  if (!match) return undefined;
  const [, year, month, day] = match;
  let next = `${today.slice(0, 4)}-${month}-${day}`;
  if (next < today) next = `${Number(today.slice(0, 4)) + 1}-${month}-${day}`;
  const days = Math.round((dayDate(next).getTime() - dayDate(today).getTime()) / 86400000);
  return { date: next, days, age: year ? Number(next.slice(0, 4)) - Number(year) : undefined };
}
export function organizerRoute(hash: string) {
  const match = hash.match(/^#fo\/(today|calendar|groceries|todos|chores|recipes|journal|birthdays|settings)(?:\/(.+))?$/);
  if (!match) return undefined;
  try { return { page: match[1], recipeId: match[1] === "recipes" ? decodeURIComponent(match[2] || "") : "", malformed: false }; }
  catch { return { page: match[1], recipeId: "", malformed: true }; }
}
export function choreDue(chore: Item, day: string) {
  const created = String(chore.created || chore.due_date || day).slice(0, 10);
  if (day < created) return false;
  const date = dayDate(day);
  if (!chore.schedule || chore.schedule === "once") return day === (chore.due_date || created);
  if (chore.schedule === "daily") return true;
  if (chore.schedule === "weekly") return (chore.weekdays || []).map(Number).includes((date.getDay() + 6) % 7);
  if (String(chore.schedule).startsWith("weekly:")) return String(chore.schedule).split(":")[1].split(",").includes(date.toLocaleDateString("en", { weekday: "long" }).toLowerCase());
  if (chore.schedule === "monthly") return date.getDate() === Number(chore.month_day || dayDate(created).getDate());
  const interval = Math.max(1, Number(chore.interval_days || String(chore.schedule).split(":")[1]) || 1);
  const elapsed = Math.round((Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) - Date.UTC(dayDate(created).getFullYear(), dayDate(created).getMonth(), dayDate(created).getDate())) / 86400000);
  return elapsed % interval === 0;
}

const weekdays = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];
export function unsupportedRecurrence(value?: string | null) {
  if (!value) return false;
  const parts = value.replace(/^RRULE:/, "").split(";").filter(Boolean);
  if (parts.some(part => !/^[A-Z]+=[^=]+$/.test(part))) return true;
  const rule = Object.fromEntries(parts.map(part => part.split("=")));
  const allowed = ["FREQ", "INTERVAL", "COUNT", "UNTIL", "BYDAY", "BYMONTH", "BYMONTHDAY", "WKST"];
  if (Object.keys(rule).length !== parts.length || Object.keys(rule).some(key => !allowed.includes(key))) return true;
  if (!["DAILY", "WEEKLY", "MONTHLY", "YEARLY"].includes(rule.FREQ)) return true;
  if (["INTERVAL", "COUNT"].some(key => rule[key] && !/^[1-9]\d*$/.test(rule[key]))) return true;
  if (rule.UNTIL && !/^\d{8}(T\d{6}Z?)?$/.test(rule.UNTIL)) return true;
  if (rule.WKST && !weekdays.includes(rule.WKST)) return true;
  if (rule.BYMONTH && rule.BYMONTH.split(",").some((n: string) => !/^\d+$/.test(n) || Number(n) < 1 || Number(n) > 12)) return true;
  if (rule.BYMONTHDAY && rule.BYMONTHDAY.split(",").some((n: string) => !/^-?\d+$/.test(n) || Number(n) === 0 || Math.abs(Number(n)) > 31)) return true;
  if (rule.BYDAY && rule.BYDAY.split(",").some((token: string) => {
    if (!/^(-?[1-5])?(SU|MO|TU|WE|TH|FR|SA)$/.test(token)) return true;
    return /\d/.test(token) && !["MONTHLY", "YEARLY"].includes(rule.FREQ);
  })) return true;
  // Year-wide BYDAY/BYMONTHDAY expansion is deliberately not approximated as the start month.
  return rule.FREQ === "YEARLY" && !!(rule.BYDAY || rule.BYMONTHDAY) && !rule.BYMONTH;
}
/** Expand common RFC 5545 day-based rules; original IDs remain the series CRUD target. */
export function occurrences(events: Item[], from: string, to: string): Item[] {
  const rangeStart = new Date(`${from}T00:00:00`), rangeEnd = new Date(`${shift(to, 1)}T00:00:00`);
  const result: Item[] = [];
  for (const event of events) {
    const start = new Date(event.start?.length === 10 ? `${event.start}T00:00:00` : event.start);
    const end = new Date(event.end?.length === 10 ? `${event.end}T00:00:00` : event.end || event.start);
    if (!Number.isFinite(start.getTime())) continue;
    const duration = Math.max(0, end.getTime() - start.getTime()) || (event.all_day ? 86400000 : 0);
    const rule = Object.fromEntries(String(event.recurrence || "").replace(/^RRULE:/, "").split(";").filter(Boolean).map(part => part.split("=")));
    const supported = !unsupportedRecurrence(event.recurrence);
    const emit = (date: Date) => {
      const finish = new Date(date.getTime() + duration);
      if (event.all_day) {
        const dayCount = Math.max(1, Math.round((Date.UTC(end.getFullYear(), end.getMonth(), end.getDate()) - Date.UTC(start.getFullYear(), start.getMonth(), start.getDate())) / 86400000));
        finish.setTime(date.getTime());
        finish.setDate(finish.getDate() + dayCount);
      }
      if (date < rangeEnd && (finish > rangeStart || date >= rangeStart)) {
        if (!(event.exdates || []).some((excluded: string) => excluded === iso(date) || new Date(excluded).getTime() === date.getTime()))
          result.push({ ...event, occurrence_start: date.toISOString(), occurrence_end: finish.toISOString(), unsupported_recurrence: !supported });
      }
    };
    if (!rule.FREQ || !supported) { emit(start); continue; }
    const interval = Math.max(1, Number(rule.INTERVAL) || 1), count = Number(rule.COUNT) || Infinity;
    const until = rule.UNTIL ? new Date(rule.UNTIL.replace(/^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})(Z)?)?$/, (_: string, y: string, m: string, d: string, h?: string, min?: string, s?: string, z?: string) => `${y}-${m}-${d}T${h || "23"}:${min || "59"}:${s || "59"}${z || ""}`)) : rangeEnd;
    const byDay = rule.BYDAY?.split(",") || [], byMonth = rule.BYMONTH?.split(",").map(Number);
    const byMonthDay = rule.BYMONTHDAY?.split(",").map(Number);
    let matched = 0;
    const date = new Date(start);
    for (let scanned = 0; scanned < 50000 && date < rangeEnd && date <= until && matched < count; scanned++, date.setDate(date.getDate() + 1)) {
      const day = iso(date), startDay = iso(start);
      const days = Math.round((Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) - Date.UTC(start.getFullYear(), start.getMonth(), start.getDate())) / 86400000);
      const months = (date.getFullYear() - start.getFullYear()) * 12 + date.getMonth() - start.getMonth();
      const ruleFirstDay = rule.WKST ? Math.max(0, weekdays.indexOf(rule.WKST)) : 1;
      const weeks = Math.round((dayDate(weekStart(day, ruleFirstDay)).getTime() - dayDate(weekStart(startDay, ruleFirstDay)).getTime()) / 604800000);
      let valid = rule.FREQ === "DAILY" ? days % interval === 0 : rule.FREQ === "WEEKLY" ? weeks % interval === 0 : rule.FREQ === "MONTHLY" ? months % interval === 0 : (date.getFullYear() - start.getFullYear()) % interval === 0;
      if (byMonth) valid &&= byMonth.includes(date.getMonth() + 1);
      else if (rule.FREQ === "YEARLY") valid &&= date.getMonth() === start.getMonth();
      const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
      if (byMonthDay) valid &&= byMonthDay.some((n: number) => date.getDate() === (n > 0 ? n : lastDay + n + 1));
      if (byDay.length) valid &&= byDay.some((token: string) => {
        const match = token.match(/^(-?\d+)?([A-Z]{2})$/);
        if (!match || weekdays[date.getDay()] !== match[2]) return false;
        if (!match[1]) return true;
        const n = Number(match[1]);
        return n > 0 ? Math.ceil(date.getDate() / 7) === n : -Math.ceil((lastDay - date.getDate() + 1) / 7) === n;
      });
      else if (rule.FREQ === "WEEKLY") valid &&= date.getDay() === start.getDay();
      if (!byMonthDay && !byDay.length && ["MONTHLY", "YEARLY"].includes(rule.FREQ)) valid &&= date.getDate() === start.getDate();
      if (valid) { matched++; emit(new Date(date)); }
    }
  }
  return result.sort((a, b) => a.occurrence_start.localeCompare(b.occurrence_start));
}
export function eventsOnDay(events: Item[], day: string) {
  const start = new Date(`${day}T00:00:00`).getTime(), end = new Date(`${shift(day, 1)}T00:00:00`).getTime();
  return events.filter(event => {
    const a = new Date(event.occurrence_start || event.start).getTime(), b = new Date(event.occurrence_end || event.end || event.start).getTime();
    return a < end && (b > start || (a >= start && a === b));
  });
}

/** Give each connected overlap group stable lanes, including chained overlaps. */
export function eventLayout(events: Item[]) {
  const ordered = [...events].sort((a, b) => a.occurrence_start.localeCompare(b.occurrence_start));
  const result: { event: Item; lane: number; columns: number }[] = [];
  let group: { event: Item; lane: number; columns: number }[] = [], laneEnds: number[] = [], groupEnd = 0;
  const flush = () => { group.forEach(item => item.columns = laneEnds.length); result.push(...group); group = []; laneEnds = []; groupEnd = 0; };
  for (const event of ordered) {
    const start = new Date(event.occurrence_start).getTime(), end = Math.max(start + 30 * 60000, new Date(event.occurrence_end).getTime());
    if (group.length && start >= groupEnd) flush();
    let lane = laneEnds.findIndex(value => value <= start);
    if (lane < 0) lane = laneEnds.length;
    laneEnds[lane] = end; groupEnd = Math.max(groupEnd, end);
    group.push({ event, lane, columns: 1 });
  }
  flush();
  return result;
}
