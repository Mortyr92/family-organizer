import { css } from "lit";

export const panelStyles = css`
  :host { display:block; min-height:100vh; font:14px/1.5 Inter, "Segoe UI", system-ui, -apple-system, sans-serif; color:var(--primary-text-color,#2f2a24); }
  * { box-sizing:border-box; }
  .app { --bg:var(--primary-background-color,#f6f0e8); --surface:var(--card-background-color,#fffaf4); --text:var(--primary-text-color,#2f2a24); --muted:var(--secondary-text-color,#71665d); --line:var(--divider-color,#e8ddd1); --soft:var(--secondary-background-color,#f4e9dd); --orange:#c85a23; --orange-soft:color-mix(in srgb,var(--orange) 12%,var(--surface)); --green:#3f7654; --shadow:0 16px 48px rgba(45, 28, 12, .08); display:flex; position:relative; min-height:100vh; background:radial-gradient(circle at top left, rgba(255,255,255,.72), transparent 34%), radial-gradient(circle at top right, rgba(232, 187, 146, .2), transparent 28%), var(--bg); color:var(--text); }
  .app::before { content:""; position:fixed; inset:0; pointer-events:none; background:linear-gradient(180deg, rgba(255,255,255,.34), transparent 24%); }
  .app[data-theme=light] { --bg:#f6f0e8; --surface:#fffaf4; --text:#2f2a24; --muted:#74695f; --line:#e7dbcf; --soft:#f3e8da; }
  .app[data-theme=dark] { --bg:#161412; --surface:#201c18; --text:#f4eee7; --muted:#c5b8ab; --line:#42372f; --soft:#2c241e; --orange:#f0a15e; --orange-soft:#39271b; --green:#95d0ad; --shadow:0 16px 48px rgba(0, 0, 0, .28); }
  button,input,select,textarea { font:inherit; color:inherit; }
  button,a,input,select,textarea,summary { -webkit-tap-highlight-color:transparent; }
  button,.button-link { display:inline-flex; align-items:center; justify-content:center; gap:7px; min-height:40px; padding:9px 14px; border:1px solid var(--line); border-radius:999px; background:var(--surface); color:var(--text); cursor:pointer; font-weight:650; text-decoration:none; transition:background .15s,border-color .15s,transform .15s,box-shadow .15s; box-shadow:0 1px 0 rgba(255,255,255,.45) inset; }
  button:hover:not(:disabled),.button-link:hover { background:var(--soft); border-color:color-mix(in srgb,var(--text) 20%,var(--line)); transform:translateY(-1px); }
  button:disabled { opacity:.5; cursor:not-allowed; }
  button:focus-visible,a:focus-visible,summary:focus-visible,input:focus-visible,select:focus-visible,textarea:focus-visible { outline:3px solid var(--orange); outline-offset:3px; }
  input,select,textarea { width:100%; min-height:42px; padding:10px 12px; background:var(--surface); border:1px solid var(--line); border-radius:14px; box-shadow:0 1px 0 rgba(255,255,255,.45) inset; }
  input[type=checkbox] { width:19px; height:19px; min-height:19px; padding:0; accent-color:var(--orange); flex-shrink:0; }
  input[type=color] { padding:4px; }
  input[type=date] { min-width:140px; width:auto; color-scheme:light dark; }
  [data-theme=light] input { color-scheme:light; }
  [data-theme=dark] input { color-scheme:dark; }
  textarea { resize:vertical; }
  label { display:flex; flex-direction:column; gap:6px; font-weight:600; font-size:13px; }
  h1,h2,h3,p { margin:0; }
  h1 { font-size:34px; letter-spacing:-1.3px; font-weight:760; line-height:1.15; }
  h2 { font-size:24px; letter-spacing:-.55px; line-height:1.28; }
  h3 { font-size:18px; letter-spacing:-.25px; }
  p { margin:8px 0; }
  small { font-size:12px; }
  hr { border:0; border-top:1px solid var(--line); margin:28px 0; }
  .muted { color:var(--muted); font-weight:400; }
  .eyebrow { font-size:10px; letter-spacing:2.1px; color:var(--muted); font-weight:760; text-transform:uppercase; }
  .primary,.quick-add { background:linear-gradient(135deg,#c85a23,#a33b18); color:#fff; border-color:#a33b18; box-shadow:0 10px 24px rgba(200,90,35,.18); }
  .primary:hover:not(:disabled),.quick-add:hover:not(:disabled) { background:linear-gradient(135deg,#b84d1d,#922f11); border-color:#922f11; }
  .danger { color:var(--error-color,#bb342f); }
  [data-theme=dark] .danger { color:#ffb4ab; }
  .danger-primary { color:#fff; background:#af302c; border-color:#af302c; }
  .icon-button { min-width:40px; padding:5px 10px; font-size:21px; line-height:1; }
  .text-button { padding:0; min-height:28px; background:none; border:0; font-size:12px; justify-content:flex-start; box-shadow:none; }
  .subtle { border:0; background:none; color:var(--muted); box-shadow:none; }
  .wide { width:100%; }
  .sr-only { position:absolute; width:1px; height:1px; padding:0; margin:-1px; overflow:hidden; clip:rect(0,0,0,0); white-space:nowrap; border:0; }
  .skip-link { position:fixed; top:-80px; left:16px; background:var(--surface); color:var(--text); padding:12px 14px; z-index:100; border-radius:999px; border:1px solid var(--line); box-shadow:var(--shadow); }
  .skip-link:focus { top:12px; }
  .sidebar { width:280px; min-width:280px; padding:24px 18px 18px; background:color-mix(in srgb,var(--surface) 90%,transparent); border-right:1px solid var(--line); position:sticky; height:100vh; top:0; display:flex; flex-direction:column; overflow-y:auto; backdrop-filter:blur(18px); box-shadow:12px 0 40px rgba(33, 23, 13, .05); }
  .sidebar nav button .nav-icon { font-size:20px; width:25px; text-align:center; }
  .brand { display:flex; align-items:center; gap:11px; text-decoration:none; color:var(--text); font-size:18px; line-height:1.15; letter-spacing:-.4px; padding:10px 12px; border-radius:22px; background:var(--surface); border:1px solid var(--line); box-shadow:var(--shadow); }
  .brand-symbol { width:46px; height:46px; border-radius:16px; background:linear-gradient(135deg,#d96f2d,#aa4217); color:#fff; display:grid; place-items:center; font-size:30px; box-shadow:0 8px 18px rgba(170,66,23,.22); }
  .sidebar>.eyebrow { margin:10px 12px 4px; font-size:9px; }
  .sidebar nav { display:flex; flex-direction:column; gap:8px; margin-top:8px; flex:0 0 auto; }
  .sidebar nav button { display:flex; width:100%; justify-content:flex-start; gap:11px; padding:13px 14px; border:1px solid transparent; background:transparent; border-radius:18px; font-size:13px; color:var(--muted); text-align:left; }
  .sidebar nav button.active { color:var(--orange); background:var(--orange-soft); border-color:color-mix(in srgb,var(--orange) 18%,var(--line)); box-shadow:0 10px 20px rgba(200,90,35,.08); }
  .sidebar nav button:hover:not(.active) { background:color-mix(in srgb,var(--surface) 80%,var(--soft)); color:var(--text); }
  .nav-icon { font-size:22px; width:25px; text-align:center; }
  .sidebar-family { margin-top:10px; padding:18px 14px; border:1px solid var(--line); border-radius:20px; background:var(--surface); box-shadow:var(--shadow); }
  .avatar-stack { display:flex; margin-top:15px; padding-left:3px; flex-wrap:wrap; }
  .avatar-stack .avatar { border:2px solid var(--surface); margin-left:-3px; width:33px; height:33px; }
  .sidebar-family p { font-size:11px; color:var(--muted); margin-top:10px; }
  .sidebar-feature-links { display:flex; flex-direction:column; gap:10px; margin-top:14px; }
  .sidebar-feature-links strong { display:block; }
  .sidebar-feature-links small { display:block; margin-top:4px; }
  .sidebar-note { color:var(--muted); padding:16px 12px 0; font-size:10px; }
  .sidebar-ha-menu { margin:12px 0 0; min-height:44px; justify-content:flex-start; font-size:12px; color:var(--muted); border:1px solid var(--line); background:var(--surface); border-radius:16px; box-shadow:var(--shadow); }
  .ha-menu-icon { display:inline-block; position:relative; width:20px; height:16px; border-top:2px solid currentColor; border-bottom:2px solid currentColor; }
  .ha-menu-icon:after { content:""; position:absolute; left:0; right:0; top:5px; height:2px; background:currentColor; }
  .workspace { width:calc(100% - 280px); min-width:0; overflow-x:hidden; position:relative; z-index:1; }
  .topbar { padding:28px 32px 18px; display:flex; align-items:center; justify-content:space-between; gap:20px; max-width:1400px; margin:0 auto; }
  .topbar h1 { margin-top:4px; }
  .topbar p { color:var(--muted); margin-bottom:0; font-size:13px; }
  .quick-add { position:sticky; top:10px; left:auto; width:100%; z-index:3; flex-shrink:0; border-radius:999px; padding:10px 17px; margin:10px 8px 14px; }
  .quick-add>span { font-size:24px; font-weight:400; line-height:1; }
  main { padding:0 32px 40px; outline:none; max-width:1400px; margin:auto; }
  .app[data-floating-nav=true] main { padding-bottom:120px; }
  .floating-nav { display:none; }
  .mobile-nav { display:none; }
  .banner { display:flex; justify-content:space-between; align-items:center; gap:14px; padding:14px 18px; border-radius:18px; margin-bottom:18px; background:var(--surface); border:1px solid var(--line); box-shadow:var(--shadow); }
  .banner.error { color:var(--error-color,#bc302b); background:color-mix(in srgb,var(--error-color,#bc302b) 10%,var(--surface)); overflow-wrap:anywhere; }
  [data-theme=dark] .banner.error { color:#ffb4ab; }
  .banner.success { color:var(--green); }
  .saving { color:var(--muted); }
  .surface,.calendar-surface,.agenda { background:var(--surface); border:1px solid var(--line); border-radius:24px; box-shadow:var(--shadow); }
  .surface { padding:26px; }
  .surface-heading { display:flex; align-items:center; justify-content:space-between; gap:15px; margin-bottom:20px; }
  .surface-heading h2 { margin-top:5px; }
  .section-toolbar { display:flex; flex-wrap:wrap; justify-content:space-between; align-items:center; gap:16px; margin:0 0 20px; padding:18px 20px; border:1px solid var(--line); border-radius:24px; background:linear-gradient(180deg,var(--surface),color-mix(in srgb,var(--soft) 52%,var(--surface))); box-shadow:var(--shadow); }
  .date-navigation,.toolbar-actions { display:flex; align-items:center; gap:8px; flex-wrap:wrap; }
  .date-navigation h2 { margin-left:9px; font-size:21px; }
  .segmented { display:inline-flex; background:var(--soft); border:1px solid var(--line); border-radius:999px; padding:4px; }
  .segmented button { min-height:32px; border:0; background:transparent; color:var(--muted); padding:5px 13px; font-size:12px; box-shadow:none; }
  .segmented button.active { background:var(--surface); color:var(--text); box-shadow:0 4px 12px rgba(0,0,0,.05); }
  .family-filters { display:flex; flex-wrap:wrap; gap:8px; align-items:center; margin-bottom:18px; }
  .chip { border-radius:999px; font-size:12px; min-height:36px; padding:4px 12px 4px 5px; font-weight:550; }
  .chip:first-child { padding-left:13px; }
  .chip.active { color:var(--orange); border-color:var(--orange); background:var(--orange-soft); }
  .avatar { display:inline-grid; place-items:center; width:29px; height:29px; min-width:29px; border-radius:50%; object-fit:cover; vertical-align:middle; box-shadow:0 0 0 2px var(--surface), 0 0 0 4px var(--person-color,#64748b); }
  .avatar-stack .avatar,.agenda-event .avatar,.chip .avatar { box-shadow:0 0 0 1.5px var(--surface), 0 0 0 3px var(--person-color,#64748b); }
  .person-strip { display:flex; gap:14px; align-items:flex-start; overflow-x:auto; padding:6px 4px 14px; margin-bottom:10px; scrollbar-width:thin; }
  .person-pick { display:flex; flex-direction:column; align-items:center; gap:7px; min-width:64px; border:0; background:none; padding:4px 2px; border-radius:12px; color:var(--muted); font-size:11px; font-weight:600; opacity:.55; transition:opacity .15s, transform .15s; }
  .person-pick .avatar { width:50px; height:50px; min-width:50px; font-size:16px; }
  .person-pick.everyone .avatar { background:var(--soft); color:var(--text); font-size:20px; box-shadow:0 0 0 2px var(--surface), 0 0 0 4px var(--line); }
  .person-pick.active { opacity:1; color:var(--text); }
  .person-pick.active .avatar { box-shadow:0 0 0 3px var(--surface), 0 0 0 6px var(--person-color,var(--orange)); transform:scale(1.04); }
  .person-pick:hover:not(:disabled) { opacity:1; background:none; }
  .calendar-search { display:flex; align-items:center; gap:8px; }
  .calendar-search input { min-width:180px; border-radius:999px; padding:8px 14px; }
  .list-view { display:flex; flex-direction:column; gap:0; padding:0; border:1px solid var(--line); border-radius:24px; overflow:hidden; background:var(--surface); }
  .list-hero { display:grid; grid-template-columns:auto 1fr auto; gap:10px 20px; align-items:start; padding:22px 22px 18px; color:#fff; background:linear-gradient(135deg,#5e7fc6 0%,#8ca5d6 100%); }
  .list-hero p { margin:0; font-size:18px; opacity:.95; text-transform:capitalize; }
  .list-hero strong { display:block; font-size:48px; line-height:1; font-weight:700; margin-top:2px; }
  .list-hero span { font-size:28px; text-transform:capitalize; }
  .list-hero time { justify-self:end; font-size:36px; font-weight:650; letter-spacing:.5px; }
  .list-hero-weather { grid-column:1/-1; display:flex; flex-direction:column; gap:2px; margin-top:4px; }
  .list-hero-weather strong { font-size:44px; line-height:1; margin:0; }
  .list-hero-weather span { font-size:22px; }
  .list-hero-weather small { font-size:16px; opacity:.9; }
  .list-day { background:#fff; }
  .list-day h3 { display:grid; grid-template-columns:1fr auto auto; align-items:center; gap:12px; margin:0; padding:12px 16px; background:color-mix(in srgb,var(--soft) 70%,var(--surface)); border-top:1px solid var(--line); font-size:28px; font-weight:650; text-transform:lowercase; }
  .list-day h3 small { font-size:22px; font-weight:550; color:#111827; }
  .list-day-icon { color:#88a1cf; font-size:20px; }
  .list-day .muted.empty-day { font-size:16px; padding:10px 14px; }
  .list-event { display:grid; grid-template-columns:190px 48px minmax(0,1fr) auto; gap:14px; align-items:center; width:100%; text-align:left; border:0; border-top:1px solid #eceff4; border-radius:0; padding:14px 14px; margin:0; background:#fff; font-size:34px; color:#111827; }
  .list-event:hover:not(:disabled) { background:#f8fafc; }
  .list-event .event-time { font-size:34px; color:#1f2937; letter-spacing:.1px; }
  .list-event .event-type { display:inline-grid; place-items:center; width:38px; height:38px; border-radius:10px; background:var(--event-color); font-size:22px; }
  .list-event .event-copy strong { display:block; font-weight:650; line-height:1.15; }
  .list-event .event-copy .muted { display:block; font-size:24px; margin-top:2px; color:#6b7280; }
  .list-event .event-people { display:flex; justify-content:flex-end; gap:6px; }
  .list-event .event-people .avatar { width:34px; height:34px; min-width:34px; box-shadow:0 0 0 2px #fff, 0 0 0 4px var(--person-color,#64748b); }
  .fallback { background:var(--person-color,#64748b); color:#fff; font-size:10px; font-weight:750; text-shadow:0 1px 2px #0007; box-shadow:inset 0 0 0 1px #0001; }
  .calendar-shell { display:grid; grid-template-columns:minmax(0,1fr) 250px; gap:20px; align-items:start; }
  .calendar-shell.overview-left { grid-template-columns:250px minmax(0,1fr); }
  .overview-left .agenda { order:-1; }
  .calendar-shell.overview-closed,.calendar-shell.overview-left.overview-closed { grid-template-columns:minmax(0,1fr); }
  .overview-closed .agenda { order:2; padding:5px 14px; }
  .calendar-surface { overflow:hidden; }
  .weekday-row { display:grid; grid-template-columns:repeat(7,minmax(0,1fr)); background:var(--soft); border-bottom:1px solid var(--line); }  .weekday-row span { padding:13px 7px; text-align:center; font-size:11px; color:var(--muted); text-transform:uppercase; letter-spacing:.7px; font-weight:700; }
  .month-grid { display:grid; grid-template-columns:repeat(7,minmax(0,1fr)); }
  .month-cell { position:relative; min-height:120px; border-right:1px solid var(--line); border-bottom:1px solid var(--line); padding:7px 5px; background:var(--surface); }
  .month-cell:nth-child(7n) { border-right:0; }
  .month-cell:nth-last-child(-n+7) { border-bottom:0; }
  .month-cell.outside { background:color-mix(in srgb,var(--soft) 70%,var(--surface)); }
  .outside .day-number { color:var(--muted); }
  .month-cell.selected { box-shadow:inset 0 0 0 2px var(--orange); background:color-mix(in srgb,var(--orange) 3%,var(--surface)); }
  .cell-heading { display:flex; justify-content:space-between; align-items:center; position:relative; z-index:2; pointer-events:none; margin-bottom:6px; }
  .cell-heading button { pointer-events:auto; }
  .day-number { border:0; background:none; border-radius:50%; width:27px; min-height:27px; padding:0; font-size:11px; }
  .day-number.today,.time-header .today { background:#c45013; color:#fff; border-radius:50%; }
  .date-add { padding:0 5px; min-height:27px; font-size:16px; border:0; background:transparent; color:var(--muted); opacity:0; }
  .month-cell:hover .date-add,.date-add:focus-visible { opacity:1; }
  .cell-create { position:absolute; inset:0; border:0; border-radius:0; background:none; width:100%; opacity:1!important; }
  .cell-create:hover:not(:disabled) { background:color-mix(in srgb,var(--orange) 3%,transparent); }
  .cell-events { position:relative; z-index:2; pointer-events:none; }
  .cell-events>* { pointer-events:auto; }
  .event-chip { display:flex; justify-content:flex-start; align-items:flex-start; gap:4px; width:100%; min-height:22px; padding:3px 5px; margin:2px 0; font-size:10px; line-height:1.35; border:0; border-left:3px solid var(--event-color); border-radius:4px; background:color-mix(in srgb,var(--event-color) 12%,var(--surface)); overflow:hidden; text-align:left; font-weight:400; }
  .event-chip>span:nth-child(2) { overflow:hidden; text-overflow:ellipsis; }
  .event-chip strong { font-weight:600; }
  .event-chip:hover:not(:disabled) { background:color-mix(in srgb,var(--event-color) 22%,var(--surface)); }
  .event-dot { display:inline-block; background:var(--event-color,var(--orange)); height:6px; width:6px; min-width:6px; border-radius:50%; margin-top:4px; }
  .event-chip .event-dot { display:none; }
  .all-day-event { border-left:0; background:color-mix(in srgb,var(--event-color) 20%,var(--surface)); }
  .more-events { min-height:22px; padding:2px 5px; border:0; color:var(--muted); background:none; font-size:10px; }
  .agenda { padding:17px; }
  .agenda-toggle { border:0; padding:0 0 13px; margin-bottom:13px; border-bottom:1px solid var(--line); border-radius:0; justify-content:space-between; background:none; width:100%; color:var(--muted); font-size:11px; }
  .overview-closed .agenda-toggle { border:0; padding:5px 0; margin:0; }
  .agenda h2 { font-size:22px; margin-top:7px; }
  .agenda .muted { font-size:11px; }
  .agenda-events { margin:20px 0; }
  .agenda-event { width:100%; padding:10px 11px; margin:10px 0; align-items:flex-start; display:flex; flex-direction:column; gap:5px; border:1px solid var(--line); border-left:3px solid var(--event-color); text-align:left; font-size:12px; }
  .event-time { color:var(--muted); font-size:12px; font-weight:600; }
  .event-start { font-size:11px; font-weight:700; white-space:nowrap; }
  .event-people { display:flex; gap:5px; flex-wrap:wrap; }
  .agenda-event .avatar { width:23px; height:23px; min-width:23px; }
  .agenda>.primary { width:100%; font-size:12px; }
  .calendar-hint { color:var(--muted); font-size:11px; margin-top:16px; }
  .recurrence-warning { display:block; font-size:12px; }
  .recurrence-warning code { overflow-wrap:anywhere; white-space:normal; }
  .recurrence-warning ul { margin:10px 0 0; padding-left:20px; }
  .time-scroll { overflow:auto; max-height:740px; }
  .time-calendar { min-width:calc(55px + var(--days) * 100px); }
  .time-header,.all-day-row { display:grid; grid-template-columns:55px repeat(var(--days),minmax(0,1fr)); }
  .time-header { background:var(--surface); position:sticky; top:0; z-index:30; border-bottom:1px solid var(--line); }
  .time-header button { border:0; border-right:1px solid var(--line); border-radius:0; flex-direction:column; padding:8px; font-weight:400; }
  .time-header button.active { background:var(--orange-soft); }
  .time-header button strong { font-size:18px; min-width:30px; }
  .all-day-row { min-height:45px; border-bottom:1px solid var(--line); background:var(--soft); }
  .all-day-row>span { font-size:9px; color:var(--muted); padding:9px 4px; }
  .all-day-row>div { padding:5px; border-left:1px solid var(--line); }
  .all-day-row .subtle { padding:0 6px; min-height:24px; }
  .time-body { display:grid; grid-template-columns:55px repeat(var(--days),minmax(0,1fr)); }
  .time-labels span { display:block; height:52px; padding:0 4px; font-size:9px; color:var(--muted); }
  .time-column { position:relative; border-left:1px solid var(--line); }
  .hour-slot { display:block; width:100%; height:52px; min-height:52px; border:0; border-bottom:1px solid var(--line); border-radius:0; background:none; padding:0; }
  .positioned-events { position:absolute; inset:0; pointer-events:none; }
  .positioned-events .event-chip { position:absolute; margin:0; pointer-events:auto; font-size:10px; }
  .now-line { position:absolute; left:0; right:0; height:1px; background:#d64238; z-index:25; pointer-events:none; }
  .now-line:before { content:""; position:absolute; left:-3px; top:-3px; width:7px; height:7px; border-radius:50%; background:#d64238; }
  .empty { padding:35px 20px; text-align:center; color:var(--muted); }
  .empty h3,.empty h2 { color:var(--text); margin:7px 0; }
  .empty p { max-width:420px; margin:8px auto 18px; font-size:13px; }
  .empty-icon { display:inline-grid; place-items:center; width:46px; height:46px; font-size:27px; color:var(--orange); border-radius:50%; background:var(--orange-soft); }
  .agenda .empty { padding:16px 0; }
  .agenda .empty h3 { font-size:14px; }
  .agenda .empty p { font-size:11px; }
  .loading { padding:100px 20px; }
  .spinner { display:inline-block; width:32px; height:32px; border:3px solid var(--line); border-top-color:var(--orange); border-radius:50%; animation:spin 1s linear infinite; }
  @keyframes spin { to { transform:rotate(360deg); } }
  .shopping-layout { display:grid; grid-template-columns:minmax(0,1fr) 260px; gap:22px; }
  .shopping-aside { display:flex; flex-direction:column; align-items:stretch; align-self:start; gap:10px; }
  .shopping-aside h3 { margin-top:6px; }
  .shopping-aside p { font-size:12px; }
  .list-tabs { display:flex; gap:6px; flex-wrap:wrap; border-bottom:1px solid var(--line); padding-bottom:15px; margin-bottom:16px; }
  .list-tabs button { font-size:12px; border:0; background:var(--soft); }
  .list-tabs button.active { color:var(--orange); background:var(--orange-soft); }
  .list-tools { display:flex; flex-wrap:wrap; gap:15px; align-items:center; margin-bottom:15px; }
  .list-tools label:not(.check) { min-width:140px; }
  .list-tools>button { margin-left:auto; font-size:11px; }
  .check { display:flex; flex-direction:row; align-items:center; gap:8px; font-weight:450; }
  .grocery-row { display:flex; gap:13px; align-items:center; padding:15px 0; border-bottom:1px solid var(--line); }
  .grocery-row:last-child { border-bottom:0; }
  .row-copy { min-width:0; flex:1; display:flex; flex-direction:column; gap:4px; overflow-wrap:anywhere; }
  .row-copy>.muted { font-size:12px; }
  .grocery-row.checked .row-copy strong { text-decoration:line-through; color:var(--muted); }
  .grocery-row>.icon-button { border:0; background:transparent; }
  .store-heading { background:var(--soft); padding:9px 12px; margin:12px -7px 0; border-radius:7px; font-size:12px; }
  .meal-heading { margin:32px 0 20px; }
  .meal-heading h2 { margin-top:5px; }
  .meal-heading .date-navigation>span { color:var(--muted); font-size:12px; margin-left:5px; }
  .meal-grid { display:grid; grid-template-columns:repeat(7,minmax(0,1fr)); gap:10px; }
  .meal-day { background:var(--surface); border:1px solid var(--line); border-radius:12px; overflow:hidden; }
  .meal-day>header { background:var(--soft); padding:13px; display:flex; flex-direction:column; border-bottom:1px solid var(--line); }
  .meal-day>header>span { font-size:11px; text-transform:uppercase; color:var(--muted); }
  .meal-day>header>strong { font-size:21px; }
  .meal-today { border-color:var(--orange); }
  .meal-today>header { background:var(--orange-soft); color:var(--orange); }
  .meal-slot { min-height:128px; padding:12px 9px; border-bottom:1px solid var(--line); display:flex; flex-direction:column; align-items:flex-start; gap:6px; }
  .meal-slot:last-child { border-bottom:0; }
  .meal-slot>.eyebrow { font-size:8px; letter-spacing:1px; }
  .meal-title { display:flex; flex-direction:column; align-items:flex-start; text-align:left; border:0; background:none; padding:0; border-radius:4px; font-size:12px; overflow-wrap:anywhere; }
  .meal-title small { font-size:10px; font-weight:400; color:var(--muted); }
  .meal-empty { margin-top:10px; padding:4px 7px; border:1px dashed var(--line); color:var(--muted); font-size:11px; font-weight:400; }
  .meal-slot .text-button { min-height:20px; font-size:10px; }
  .chore-layout { display:grid; grid-template-columns:minmax(0,1fr) 330px; gap:22px; }
  .chore-card { display:flex; flex-wrap:wrap; gap:12px; align-items:center; padding:17px 0; border-bottom:1px solid var(--line); }
  .chore-card>.row-copy { min-width:150px; }
  .chore-symbol { width:40px; height:40px; border-radius:12px; background:var(--orange-soft); color:var(--orange); display:grid; place-items:center; font-size:22px; }
  .chore-symbol ha-icon { --mdc-icon-size:22px; width:22px; height:22px; }
  .chore-symbol ha-icon:not(:defined) { display:none; }
  .chore-symbol ha-icon:defined+.chore-icon-fallback { display:none; }
  .chore-card.done .chore-symbol { background:color-mix(in srgb,var(--green) 15%,var(--surface)); color:var(--green); }
  .chore-card.overdue .chore-symbol { color:var(--error-color,#b33930); }
  .assignee { display:flex; align-items:center; gap:7px; color:var(--muted); font-size:11px; margin-top:4px; }
  .assignee .avatar { width:22px; height:22px; min-width:22px; font-size:8px; }
  .points-badge { color:var(--orange); background:var(--orange-soft); padding:4px 8px; border-radius:7px; font-size:11px; font-weight:650; }
  .chore-card button { font-size:11px; }
  .chore-card .icon-button { font-size:19px; padding:4px; min-width:25px; border:0; }
  .leaderboard { align-self:start; }
  .leaderboard h2 { margin:9px 0 20px; }
  .leaderboard>.segmented { display:flex; }
  .leaderboard>.segmented button { flex:1; }
  .leaderboard>.muted { font-size:11px; margin:14px 0; }
  .score-row { display:flex; align-items:center; gap:10px; margin:23px 0; }
  .rank { width:15px; color:var(--orange); }
  .score-row .row-copy { font-size:12px; }
  .score-row progress { width:100%; height:6px; accent-color:var(--orange); border:0; overflow:hidden; border-radius:5px; }
  progress::-webkit-progress-bar { background:var(--soft); }
  progress::-webkit-progress-value { background:var(--orange); border-radius:5px; }
  progress::-moz-progress-bar { background:var(--orange); }
  .score-row>strong { font-size:15px; }
  .score-row>strong>small { display:block; font-size:10px; color:var(--muted); font-weight:400; }
  .prior-winner { display:flex; align-items:center; gap:12px; padding:16px; border-radius:9px; background:var(--orange-soft); margin-top:24px; font-size:12px; }
  .prior-winner>span { font-size:25px; color:var(--orange); }
  .prior-winner p { margin:4px 0 0; color:var(--muted); font-size:11px; }
  .history { margin-top:23px; }
  .compact-row { display:flex; align-items:center; gap:12px; padding:13px 0; border-bottom:1px solid var(--line); }
  .compact-row:last-child { border-bottom:0; }
  .compact-row>time { font-size:11px; color:var(--muted); }
  .compact-row>strong { font-size:12px; }
  .compact-row button { font-size:11px; }
  .all-chores { margin-top:20px; }
  summary { cursor:pointer; font-weight:600; }
  .recipe-toolbar { display:flex; gap:15px; align-items:flex-end; margin:22px 0; }
  .search-label { flex:1; max-width:430px; }
  .recipe-toolbar>label:not(.search-label) { min-width:180px; }
  .recipe-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(250px,1fr)); gap:22px; }
  .recipe-grid>.empty { grid-column:1/-1; }
  .recipe-card { display:block; padding:0; overflow:hidden; text-align:left; border-radius:14px; box-shadow:var(--shadow); }
  .recipe-card>img,.recipe-placeholder { width:100%; height:175px; object-fit:cover; background:var(--soft); }
  .recipe-placeholder { display:flex; align-items:center; justify-content:center; flex-direction:column; color:var(--green); font-size:62px; font-weight:400; }
  .recipe-placeholder span { font-size:9px; letter-spacing:2px; margin-top:4px; }
  .recipe-card:nth-child(3n+2) .recipe-placeholder { background:var(--orange-soft); color:var(--orange); }
  .recipe-card-copy { padding:20px; }
  .recipe-card h3 { margin:8px 0 7px; font-size:20px; }
  .recipe-card .muted { font-size:12px; }
  .tags { display:flex; flex-wrap:wrap; gap:6px; margin:10px 0 0; }
  .tags>span { background:var(--soft); color:var(--muted); padding:4px 8px; border-radius:5px; font-size:10px; font-weight:450; }
  .recipe-hero { display:grid; grid-template-columns:330px 1fr; align-items:center; gap:36px; margin:26px 0; }
  .recipe-hero>img,.recipe-hero-art { width:100%; height:250px; object-fit:cover; border-radius:15px; }
  .recipe-hero-art { display:grid; place-items:center; background:var(--orange-soft); color:var(--orange); font-size:100px; }
  .recipe-hero h2 { margin:10px 0; font-size:34px; letter-spacing:-1px; }
  .recipe-hero .primary { margin-top:15px; }
  .recipe-detail-grid { display:grid; grid-template-columns:minmax(0,1fr) minmax(0,1fr); gap:25px; align-items:start; }
  .ingredient-panel>.muted { font-size:12px; }
  .serving-control { display:flex; align-items:center; gap:4px; }
  .serving-control input { width:65px; text-align:center; padding:7px 4px; }
  .serving-control button { padding:5px 10px; }
  .ingredient-row { display:flex; align-items:center; justify-content:space-between; gap:14px; padding:15px 0; border-bottom:1px solid var(--line); font-size:12px; }
  .ingredient-row>.check { flex:1; }
  .ingredient-row select { width:120px; font-size:11px; padding:6px; }
  .ingredient-panel>.primary { margin-top:20px; }
  .method-panel h3 { margin:8px 0 20px; }
  .method-panel ol { counter-reset:steps; list-style:none; padding:0; margin:0; }
  .method-panel li { counter-increment:steps; display:flex; gap:15px; padding:17px 0; border-bottom:1px solid var(--line); white-space:pre-line; }
  .method-panel li:before { content:counter(steps); display:inline-grid; place-items:center; width:29px; height:29px; min-width:29px; border-radius:50%; background:var(--orange-soft); color:var(--orange); font-weight:700; font-size:12px; }
  .settings-intro { margin-bottom:26px; }
  .settings-intro h2 { margin:8px 0; }
  .people-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(330px,1fr)); gap:15px; }
  .people-grid>.empty { grid-column:1/-1; }
  .person-card { display:flex; align-items:center; gap:13px; padding:18px; }
  .person-card>.avatar { width:43px; height:43px; min-width:43px; font-size:14px; }
  .person-card h3 { font-size:16px; }
  .person-card p { font-size:10px; margin:0; }
  .person-card small { font-size:10px; }
  .person-card button { font-size:11px; }
  .settings-grid { display:grid; grid-template-columns:minmax(0,1fr) minmax(0,1fr); gap:23px; margin-top:28px; align-items:start; }
  .settings-grid h3 { margin:9px 0; }
  dl { margin:19px 0; }
  dl>div { display:flex; gap:15px; padding:10px 0; border-bottom:1px solid var(--line); font-size:12px; }
  dt { min-width:110px; font-weight:600; }
  dd { margin:0; color:var(--muted); overflow-wrap:anywhere; }
  .theme-options { display:flex; gap:10px; margin:20px 0; }
  .theme-options>button { flex:1; display:flex; flex-direction:column; padding:15px 8px; }
  .theme-options>button>span { font-size:25px; font-weight:400; }
  .theme-options>button.active { color:var(--orange); border-color:var(--orange); background:var(--orange-soft); }
  .editor-dialog { color:var(--text); background:var(--surface); border:1px solid var(--line); border-radius:18px; box-shadow:0 25px 100px #0004; width:620px; max-width:calc(100vw - 32px); max-height:calc(100dvh - 40px); padding:0; overflow:auto; }
  .editor-dialog::backdrop { background:#11231c80; backdrop-filter:blur(3px); }
  .dialog-heading { padding:23px 25px; display:flex; align-items:center; gap:20px; justify-content:space-between; border-bottom:1px solid var(--line); position:sticky; top:0; background:var(--surface); z-index:2; }
  .dialog-heading h2 { margin-top:5px; font-size:23px; overflow-wrap:anywhere; }
  .dialog-heading>.icon-button { border:0; color:var(--muted); font-size:28px; }
  .editor-dialog>.banner { margin:15px 24px 0; }
  .dialog-content { padding:24px; }
  .form-fields { padding:24px; border:0; margin:0; display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:18px; min-width:0; }
  .form-fields fieldset { border:1px solid var(--line); border-radius:10px; padding:15px; min-width:0; }
  .form-fields legend { font-size:12px; font-weight:600; padding:0 5px; }
  .form-field { display:flex; flex-direction:column; gap:6px; }
  .full { grid-column:1/-1; }
  .checkbox-group { display:flex; flex-wrap:wrap; gap:13px 20px; }
  .checkbox-group .check { font-size:12px; }
  .permissions { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:15px; }
  .permissions label { text-transform:capitalize; font-size:11px; }
  .dialog-footer { padding:17px 24px; border-top:1px solid var(--line); display:flex; align-items:center; gap:10px; position:sticky; bottom:0; background:var(--surface); z-index:2; }
  .dialog-footer>.muted { margin-right:auto; font-size:11px; }
  .quick-menu { display:flex; flex-direction:column; gap:10px; }
  .quick-menu button { justify-content:flex-start; border:1px solid var(--line); padding:16px; text-align:left; border-radius:12px; }
  .quick-menu button>span:nth-child(2) { flex:1; }
  .quick-menu strong { display:block; font-size:14px; }
  .quick-menu small { display:block; color:var(--muted); font-weight:400; font-size:11px; margin-top:3px; }
  .quick-icon { width:40px; height:40px; display:grid; place-items:center; color:var(--orange); background:var(--orange-soft); border-radius:11px; font-size:23px; }
  .event-detail { display:flex; align-items:center; gap:18px; }
  .detail-date { border:1px solid var(--event-color); background:color-mix(in srgb,var(--event-color) 12%,var(--surface)); border-radius:10px; display:flex; align-items:center; flex-direction:column; padding:8px 18px; }
  .detail-date>span { font-size:12px; text-transform:uppercase; color:var(--muted); }
  .detail-date>strong { font-size:29px; }
  .event-description { white-space:pre-wrap; margin:25px 0; }
  .detail-actions { display:flex; flex-wrap:wrap; gap:10px; margin-top:24px; }
  .detail-actions .danger { margin-left:auto; }
  .category-list { margin-top:20px; }
  .today-member-strip { display:flex; flex-direction:column; gap:12px; padding:16px 18px; margin-bottom:18px; border-radius:18px; border:1px solid var(--line); background:linear-gradient(180deg,var(--surface),color-mix(in srgb,var(--soft) 55%,var(--surface))); box-shadow:var(--shadow); }
  .today-member-strip h3 { margin-top:4px; }
  .today-member-strip .person-strip { margin:0; padding:6px 2px 2px; }
  .today-member-strip .person-pick { min-width:72px; opacity:.6; }
  .today-member-strip .person-pick.active { opacity:1; }
  .today-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(300px,1fr)); gap:18px; }
  .today-grid .surface { display:flex; flex-direction:column; gap:4px; }
  .today-grid .surface>.primary { margin-top:auto; align-self:flex-start; }
  .today-grid .agenda-event { width:100%; }
  .today-grid .compact-row { padding:9px 0; }
  .today-grid .compact-row.done { opacity:.55; text-decoration:line-through; }
  .today-grid .eyebrow { margin-top:12px; }
  .journal-excerpt { display:-webkit-box; -webkit-line-clamp:3; -webkit-box-orient:vertical; overflow:hidden; }
  .journal-feed { display:flex; flex-direction:column; gap:16px; margin-top:22px; }
  .journal-entry { display:flex; gap:20px; align-items:flex-start; --event-color:var(--orange); }
  .journal-body { flex:1; min-width:0; }
  .journal-body p { white-space:pre-wrap; }
  .journal-photos { display:grid; grid-template-columns:repeat(auto-fill,minmax(140px,1fr)); gap:8px; margin:12px 0; }
  .journal-photos img { width:100%; height:140px; object-fit:cover; border-radius:10px; }
  .journal-actions { display:flex; gap:6px; }
  .contact-group { margin:22px 0 10px; font-size:.95rem; letter-spacing:.04em; text-transform:uppercase; color:var(--muted); }
  .contact-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(260px,1fr)); gap:14px; }
  .contact-card { display:flex; gap:12px; align-items:flex-start; padding:14px 16px; }
  .contact-card .row-copy { display:grid; gap:4px; flex:1; min-width:0; }
  .contact-card h3 { margin:0 0 2px; }
  .contact-card a { color:var(--accent); text-decoration:none; font-weight:600; overflow-wrap:anywhere; }
  .contact-card a:hover { text-decoration:underline; }
  .contact-avatar { width:44px; height:44px; border-radius:50%; display:grid; place-items:center; font-weight:700; background:var(--accent-soft, rgba(240,120,40,.16)); color:var(--accent); flex-shrink:0; }
  .import-row { display:flex; gap:8px; align-items:center; flex-wrap:wrap; margin:12px 0; }
  .import-row input { flex:1; min-width:220px; }
  .birthday-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(280px,1fr)); gap:16px; }
  .birthday-card { display:flex; align-items:center; gap:14px; border-left:5px solid var(--person-color); }
  .birthday-card .avatar { width:46px; height:46px; min-width:46px; font-size:15px; }
  .birthday-card.today { background:var(--orange-soft); }
  .countdown { white-space:nowrap; color:var(--orange); }
  .list-tools .check { flex-direction:row; align-items:center; }
  @media(min-width:1600px) { .month-cell { min-height:145px; } .calendar-shell { grid-template-columns:minmax(0,1fr) 280px; } .calendar-shell.overview-left { grid-template-columns:280px minmax(0,1fr); } }
  @media(max-width:1200px) { .sidebar { width:190px; min-width:190px; padding:25px 12px 15px; } .quick-add { width:100%; font-size:12px; margin:8px 4px 12px; } .workspace { width:calc(100% - 190px); } .topbar { padding:24px; } main { padding:0 24px 30px; } .calendar-shell,.calendar-shell.overview-left { grid-template-columns:minmax(0,1fr); } .calendar-shell .agenda { order:2; } .agenda-events { display:grid; grid-template-columns:repeat(auto-fit,minmax(180px,1fr)); gap:12px; margin:15px 0; } .agenda-event { margin:0; } .agenda>.primary { width:auto; } .agenda .empty { grid-column:1/-1; } .month-cell { min-height:118px; } .shopping-layout { grid-template-columns:minmax(0,1fr) 220px; } .chore-layout { grid-template-columns:minmax(0,1fr) 285px; } .meal-grid { overflow-x:auto; grid-template-columns:repeat(7,minmax(140px,1fr)); padding-bottom:8px; } }
  @media(max-width:950px) { .sidebar { width:170px; min-width:170px; } .quick-add { width:100%; margin:8px 2px 12px; } .workspace { width:calc(100% - 170px); } .brand { font-size:15px; gap:7px; } .brand-symbol { width:34px; height:38px; font-size:26px; } .sidebar nav button { font-size:11px; gap:7px; } .sidebar>.eyebrow { font-size:8px; } .shopping-layout,.chore-layout,.settings-grid { grid-template-columns:minmax(0,1fr); } .shopping-list { padding:20px; } .chore-layout .leaderboard { order:2; } .leaderboard .score-row { margin:16px 0; } .recipe-detail-grid { grid-template-columns:minmax(0,1fr); } .recipe-hero { grid-template-columns:230px 1fr; gap:22px; } .recipe-hero>img,.recipe-hero-art { height:210px; } .recipe-hero h2 { font-size:28px; } .date-navigation h2 { font-size:19px; } .section-toolbar { gap:12px; } .recipe-toolbar { flex-wrap:wrap; } .search-label { min-width:220px; } }
  @media(max-width:700px) {
    .sidebar { display:none; } .quick-add { position:fixed; top:43px; left:auto; right:16px; width:auto; margin:0; z-index:45; } .app { max-width:100vw; overflow-x:hidden; } .workspace { width:100%; } .topbar { padding:23px 130px 21px 16px; align-items:flex-start; gap:10px; }
    .event-start { font-size:9px; }
    .mobile-nav { display:grid; grid-auto-flow:column; grid-auto-columns:minmax(62px,1fr); overflow-x:auto; scrollbar-width:none; position:fixed; bottom:0; left:0; right:0; padding:6px 4px max(6px,env(safe-area-inset-bottom)); background:var(--surface); border-top:1px solid var(--line); z-index:40; box-shadow:0 -3px 15px #00000014; -webkit-overflow-scrolling:touch; }
    .mobile-nav::-webkit-scrollbar { display:none; }
    .mobile-nav button { background:none; border:0; border-radius:8px; padding:4px 2px; flex-direction:column; gap:1px; color:var(--muted); font-size:9px; font-weight:500; min-height:50px; white-space:nowrap; } .mobile-nav button>span { font-size:21px; line-height:1.2; } .mobile-nav button.active { color:var(--orange); background:var(--orange-soft); }
    .floating-nav { left:12px; right:12px; transform:none; bottom:10px; padding:8px 10px; max-width:none; }
    .floating-nav button { min-height:48px; padding:9px 11px; font-size:10px; }
    main { padding:0 14px calc(132px + env(safe-area-inset-bottom)); }
    .today-grid,.contact-grid,.recipe-grid,.people-grid,.settings-grid { grid-template-columns:minmax(0,1fr); }
    .lock-screen { margin:0; }
    .surface,.section-toolbar,.toolbar-actions,.recipe-toolbar,.list-tools,.compact-row,.chore-card,.grocery-row { min-width:0; max-width:100%; }
    .section-toolbar,.toolbar-actions { flex-wrap:wrap; }
    .topbar h1,.topbar p,.surface h2,.surface h3,.row-copy,.row-copy * { overflow-wrap:anywhere; }
    img { max-width:100%; }
    .mobile-nav .ha-shell-menu { gap:6px; } .mobile-nav .ha-shell-menu>span:last-child { font-size:9px; line-height:1.2; }
    .floating-nav { position:fixed; left:50%; bottom:16px; transform:translateX(-50%); z-index:50; display:flex; align-items:center; gap:6px; padding:8px; max-width:min(calc(100vw - 24px), 980px); overflow-x:auto; scrollbar-width:none; border:1px solid var(--line); border-radius:999px; background:color-mix(in srgb,var(--surface) 90%,transparent); box-shadow:0 20px 48px rgba(33,23,13,.18); backdrop-filter:blur(18px); -webkit-overflow-scrolling:touch; }
    .floating-nav::-webkit-scrollbar { display:none; }
    .floating-nav button { border-radius:999px; min-height:52px; padding:10px 14px; gap:4px; flex-direction:column; font-size:11px; line-height:1.1; white-space:nowrap; background:transparent; border-color:transparent; box-shadow:none; }
    .floating-nav button>span:first-child { font-size:22px; line-height:1; }
    .floating-nav button.active { color:var(--orange); background:var(--orange-soft); border-color:color-mix(in srgb,var(--orange) 18%,var(--line)); box-shadow:0 10px 20px rgba(200,90,35,.12); }
    .floating-nav .ha-shell-menu { gap:5px; }
    .floating-nav .ha-shell-menu>span:last-child { font-size:11px; line-height:1.1; }
    .skip-link { left:10px; } .family-filters { gap:6px; margin-bottom:14px; } .chip { font-size:11px; min-height:33px; padding-right:9px; } .chip .avatar { width:24px; height:24px; min-width:24px; font-size:9px; } .section-toolbar { margin-bottom:15px; } .date-navigation h2 { width:100%; margin:7px 0 0; font-size:22px; order:2; } .toolbar-actions { width:100%; justify-content:space-between; } .segmented button { padding:5px 11px; } .calendar-shell { gap:15px; } .calendar-surface { border-radius:11px; } .month-cell { min-height:101px; padding:4px 2px; } .weekday-row span { padding:10px 2px; font-size:9px; letter-spacing:0; } .day-number { width:25px; min-height:25px; font-size:10px; } .date-add { display:none; } .event-chip { padding:2px 3px; font-size:8px; min-height:21px; gap:2px; border-left-width:2px; } .event-chip>span:nth-child(2) { display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; line-clamp:2; } .event-chip>span:last-child:not(:nth-child(2)) { display:none; } .more-events { font-size:8px; padding:1px 2px; } .agenda { padding:18px; } .agenda>.primary { width:100%; } .agenda .muted { font-size:12px; } .agenda-events { grid-template-columns:repeat(auto-fit,minmax(150px,1fr)); } .calendar-hint { font-size:10px; } .time-scroll { max-height:650px; } .time-calendar { min-width:calc(50px + var(--days) * 95px); }
    .surface { padding:18px; border-radius:12px; } .surface-heading { flex-wrap:wrap; margin-bottom:17px; } .surface-heading .primary { font-size:12px; } .surface-heading h2 { font-size:21px; } .list-tabs { gap:5px; } .list-tabs button { padding:7px 10px; font-size:11px; } .grocery-row { gap:8px; } .grocery-row .avatar { width:23px; height:23px; min-width:23px; font-size:8px; } .grocery-row .row-copy strong { font-size:13px; } .grocery-row .row-copy>.muted { font-size:10px; } .grocery-row .icon-button { min-width:28px; padding:4px; font-size:18px; } .list-tools { gap:12px; } .list-tools>.check { font-size:11px; } .list-tools>button { margin-left:0; } .meal-heading h2 { font-size:22px; } .meal-grid { gap:8px; grid-template-columns:repeat(7,145px); } .meal-slot { min-height:120px; }
    .chore-card { gap:9px; } .chore-card>.row-copy { min-width:140px; } .chore-symbol { width:34px; height:34px; } .chore-card>.primary { margin-left:43px; } .chore-card>.points-badge { margin-left:auto; } .compact-row { flex-wrap:wrap; } .compact-row>time { font-size:10px; } .history .compact-row>.row-copy { min-width:170px; } .recipe-grid { grid-template-columns:repeat(auto-fill,minmax(150px,1fr)); gap:12px; } .recipe-card>img,.recipe-placeholder { height:130px; } .recipe-placeholder { font-size:45px; } .recipe-placeholder>span { font-size:7px; letter-spacing:1px; } .recipe-card-copy { padding:14px; } .recipe-card h3 { font-size:17px; } .recipe-card .eyebrow { font-size:8px; letter-spacing:1px; } .recipe-card .muted { font-size:10px; } .recipe-card .tags>span { font-size:9px; } .recipe-toolbar { gap:10px; } .recipe-toolbar>label:not(.search-label) { min-width:150px; } .recipe-toolbar>button { font-size:11px; } .search-label { width:100%; max-width:none; min-width:100%; } .recipe-hero { grid-template-columns:1fr; gap:18px; } .recipe-hero>img,.recipe-hero-art { height:230px; } .recipe-hero h2 { font-size:29px; } .ingredient-row { gap:10px; } .ingredient-row select { width:110px; } .people-grid { grid-template-columns:minmax(0,1fr); } .person-card { padding:15px; gap:10px; } .person-card>.avatar { width:37px; height:37px; min-width:37px; } .person-card>.icon-button { padding:2px; min-width:25px; } .settings-grid { gap:16px; } .theme-options { gap:8px; } dl>div { font-size:11px; } dt { min-width:90px; }
    .editor-dialog { max-width:100%; width:100%; max-height:92dvh; margin:auto 0 0; border-radius:20px 20px 0 0; border-bottom:0; } .dialog-heading { padding:21px 20px; } .dialog-heading h2 { font-size:21px; } .form-fields { padding:20px; grid-template-columns:1fr; gap:15px; } .form-fields .full { grid-column:auto; } .permissions { grid-template-columns:1fr; } .dialog-footer { padding:15px 20px max(15px,env(safe-area-inset-bottom)); flex-wrap:wrap; } .dialog-footer>.muted { max-width:170px; font-size:10px; } .dialog-content { padding:20px; } .event-detail h3 { font-size:15px; } .event-metadata dt { min-width:70px; } .quick-menu button { padding:15px 12px; } .quick-menu small { font-size:10px; } .detail-actions .danger { margin-left:0; }
  }
  @media(max-width:700px),(pointer:coarse) {
    .app button,.app input:not([type=checkbox]),.app select,.app textarea { min-height:44px; min-width:44px; }
    .app .event-chip { min-height:22px; min-width:0; }
    .app .mobile-nav button { min-height:50px; }
    .app .day-number { width:44px; min-width:44px; min-height:44px; position:relative; z-index:3; }
    .app .month-cell { padding-bottom:44px; }
    .app .cell-heading { position:static; justify-content:flex-start; }
    .app .date-add { display:inline-flex; position:absolute; right:0; bottom:0; width:44px; height:44px; opacity:1; z-index:3; padding:0; align-items:center; justify-content:center; font-size:20px; }
    .app .cell-events { z-index:4; }
    .app .month-grid,.app .weekday-row { min-width:322px; }
    .app .calendar-surface { overflow:auto; }
    .app .icon-button { min-width:44px; }
    .app .check { min-height:44px; }
    .app input[type=checkbox] { appearance:none; position:relative; display:grid; place-items:center; width:44px; min-width:44px; height:44px; min-height:44px; border:0; padding:0; background:transparent; border-radius:6px; }
    .app input[type=checkbox]:before { content:""; width:20px; height:20px; border:1px solid var(--muted); border-radius:4px; background:var(--surface); }
    .app input[type=checkbox]:checked:before { background:#c45013; border-color:#c45013; }
    .app input[type=checkbox]:checked:after { content:"✓"; position:absolute; color:white; font-size:17px; font-weight:700; }
    .app input[type=checkbox]:disabled { opacity:.5; }
  }
  @media(max-width:700px) {
    .qudoo-list .list-hero { padding:14px; grid-template-columns:1fr auto; }
    .qudoo-list .list-hero p { font-size:14px; }
    .qudoo-list .list-hero strong { font-size:34px; }
    .qudoo-list .list-hero span { font-size:20px; }
    .qudoo-list .list-hero time { font-size:24px; }
    .qudoo-list .list-hero-weather strong { font-size:30px; }
    .qudoo-list .list-hero-weather span { font-size:16px; }
    .qudoo-list .list-day h3 { font-size:22px; padding:8px 10px; }
    .qudoo-list .list-day h3 small { font-size:16px; }
    .qudoo-list .list-event { grid-template-columns:120px 32px minmax(0,1fr) auto; font-size:18px; padding:10px; }
    .qudoo-list .list-event .event-time { font-size:18px; }
    .qudoo-list .list-event .event-type { width:28px; height:28px; font-size:16px; }
    .qudoo-list .list-event .event-copy .muted { font-size:14px; }
  }
  @media(hover:none) { .date-add { opacity:1; } }
  @media(prefers-reduced-motion:reduce) { *,*::before,*::after { animation:none!important; transition:none!important; scroll-behavior:auto!important; } }
`;
