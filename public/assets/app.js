/* AI赛事助手 v6 —— 以赛事为中心的单页应用（无第三方依赖）
   需求见 docs/01-功能文档.md；数据见 window.AIC（scripts/build.py 生成） */
(() => {
"use strict";

/* ═════════ 数据 ═════════ */
const RAW = window.AIC || { contests: [], festivals: [], snapshot: "" };
const C = RAW.contests, FEST = RAW.festivals;
const byId = new Map(C.map(c => [c.id, c]));

/* ═════════ 工具 ═════════ */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? "").replace(/[&<>"']/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]));
const debounce = (fn, ms) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };
const cut = (s, n) => { s = String(s || ""); return s.length > n ? s.slice(0, n) + "…" : s; };
const svg = d => `<svg viewBox="0 0 20 20">${d}</svg>`;
const I = {
  search: svg('<circle cx="9" cy="9" r="6"/><path d="m14 14 4 4"/>'),
  radar: svg('<circle cx="10" cy="10" r="7.5"/><circle cx="10" cy="10" r="3.5"/><path d="M10 10l5.3-5.3"/>'),
  list: svg('<path d="M7 5h10M7 10h10M7 15h10M3 5h.01M3 10h.01M3 15h.01"/>'),
  grid: svg('<rect x="3" y="3" width="6" height="6" rx="1.5"/><rect x="11" y="3" width="6" height="6" rx="1.5"/><rect x="3" y="11" width="6" height="6" rx="1.5"/><rect x="11" y="11" width="6" height="6" rx="1.5"/>'),
  cal: svg('<rect x="3" y="4" width="14" height="13" rx="2.5"/><path d="M3 8.5h14M7 2.5v3M13 2.5v3"/>'),
  chart: svg('<path d="M3 17h14M5 14V9M9 14V5M13 14v-7M17 14v-3"/>'),
  doc: svg('<path d="M5 2.5h7l3.5 3.5v11.5h-10.5z"/><path d="M12 2.5V6h3.5M7.5 10h5M7.5 13h5"/>'),
  globe: svg('<circle cx="10" cy="10" r="7.5"/><path d="M2.5 10h15M10 2.5c2.2 2.2 3 4.8 3 7.5s-.8 5.3-3 7.5c-2.2-2.2-3-4.8-3-7.5s.8-5.3 3-7.5z"/>'),
  info: svg('<circle cx="10" cy="10" r="7.5"/><path d="M10 9v5M10 6.3h.01"/>'),
  star: svg('<path d="m10 2.8 2.2 4.6 5 .7-3.6 3.5.9 5-4.5-2.4-4.5 2.4.9-5L2.8 8.1l5-.7z"/>'),
  trophy: svg('<path d="M6 3h8v4a4 4 0 0 1-8 0zM6 5H3v1a3 3 0 0 0 3 3M14 5h3v1a3 3 0 0 1-3 3M10 11v3M7 17h6M8 14h4v3H8z"/>'),
  ticket: svg('<path d="M3 6a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v2a2 2 0 0 0 0 4v2a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-2a2 2 0 0 0 0-4z"/>'),
  pin: svg('<path d="M10 18s-5.5-5-5.5-9a5.5 5.5 0 0 1 11 0c0 4-5.5 9-5.5 9z"/><circle cx="10" cy="9" r="2"/>'),
  film: svg('<rect x="3" y="3" width="14" height="14" rx="2.5"/><path d="M7 3v14M13 3v14M3 7h4M3 13h4M13 7h4M13 13h4"/>'),
  target: svg('<circle cx="10" cy="10" r="7.5"/><circle cx="10" cy="10" r="4"/>'),
  ext: svg('<path d="M11 3h6v6M17 3l-8 8M14 12v4a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h4"/>'),
  mail: svg('<rect x="3" y="4.5" width="14" height="11" rx="2"/><path d="m3.5 5.5 6.5 5 6.5-5"/>'),
  x: svg('<path d="M5 5l10 10M15 5 5 15"/>'),
  l: svg('<path d="m12 4-6 6 6 6"/>'), r: svg('<path d="m8 4 6 6-6 6"/>'),
  up: svg('<path d="m5 12 5-5 5 5"/>'), down: svg('<path d="m5 8 5 5 5-5"/>'),
  copy: svg('<rect x="7" y="7" width="10" height="10" rx="2"/><path d="M13 7V4a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h3"/>'),
  link: svg('<path d="M8.5 11.5a3.5 3.5 0 0 0 5 0l2.5-2.5a3.5 3.5 0 0 0-5-5l-1 1M11.5 8.5a3.5 3.5 0 0 0-5 0L4 11a3.5 3.5 0 0 0 5 5l1-1"/>'),
  bell: svg('<path d="M5 8a5 5 0 0 1 10 0c0 5 2 6 2 6H3s2-1 2-6M8.5 17a1.8 1.8 0 0 0 3 0"/>'),
  check: svg('<path d="m4.5 10.5 3.5 3.5 7.5-8"/>'),
  edit: svg('<path d="M13.5 3.5l3 3L7 16H4v-3z"/>'),
  alert: svg('<path d="M10 3 2.5 16.5h15z"/><path d="M10 8.5v3.5M10 14.3h.01"/>'),
  print: svg('<path d="M6 7V3h8v4M6 14H4a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1h-2"/><rect x="6" y="11" width="8" height="6" rx="1"/>'),
  filter: svg('<path d="M3 5h14M6 10h8M8.5 15h3"/>'),
  inbox: svg('<path d="M3 11h4l1 2h4l1-2h4M3 11l2-7h10l2 7v5H3z"/>'),
  clock: svg('<circle cx="10" cy="10" r="7.5"/><path d="M10 6v4l2.5 2.5"/>'),
  gift: svg('<rect x="3" y="7" width="14" height="4" rx="1"/><path d="M4.5 11v6h11v-6M10 7v10M10 7S8.5 3 6.5 3.5 6 7 10 7zm0 0s1.5-4 3.5-3.5S14 7 10 7z"/>'),
  plus: svg('<path d="M10 4v12M4 10h12"/>'),
};

/* ═════════ 日期 ═════════ */
const T0 = (() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; })();
const WD = "日一二三四五六";
const parseD = s => { const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s || ""); return m ? new Date(+m[1], +m[2] - 1, +m[3]) : null; };
const ymd = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const daysLeft = c => { const d = parseD(c.deadline); return d ? Math.round((d - T0) / 864e5) : null; };
const md = s => { const d = parseD(s); return d ? `${d.getMonth() + 1}月${d.getDate()}日` : "待公布"; };
const full = s => { const d = parseD(s); return d ? `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日 · 周${WD[d.getDay()]}` : "截止待公布"; };
const urg = l => l == null || l < 0 ? "" : l <= 3 ? "u-red" : l <= 7 ? "u-amber" : "";

/* ═════════ 分类 ═════════ */
const G = { S: 0, A: 1, B: 2, C: 3 };
const GN = { S: "顶级", A: "优先投", B: "值得投", C: "按需投" };
const GCOL = () => { const cs = getComputedStyle(document.documentElement); return { S: cs.getPropertyValue("--gS").trim(), A: cs.getPropertyValue("--gA").trim(), B: cs.getPropertyValue("--gB").trim(), C: cs.getPropertyValue("--gC").trim() }; };
const isOpen = c => c.status !== "closed" && (daysLeft(c) == null || daysLeft(c) >= 0);
const isFree = c => /^(免费|0元|￥0|¥0)/.test(c.fee);
const NOCASH = /^(无现金|非现金|无固定现金|非奖金制|官方未公布|未公布|待核实|积分非现金|荣誉|数字桂冠|无（|无$)/;
const hasCash = c => !NOCASH.test(c.prize) && /[¥￥$€£₹]|\d\s*万|\d\s*元|美元|澳元|港元|现金/.test(c.prize);
const FX = { usd: 7.1, eur: 7.8, gbp: 9.2, aud: 4.7, hkd: 0.91, inr: 0.085 };
const cashCNY = c => {
  if (!hasCash(c)) return 0; const p = c.prize; let m;
  if ((m = p.match(/(\d+(?:\.\d+)?)\s*万美元/))) return +m[1] * 1e4 * FX.usd;
  if ((m = p.match(/\$\s?([\d,.]+)\s*(k|K|M)?/))) return +m[1].replace(/,/g, "") * (m[2] === "M" ? 1e6 : m[2] ? 1e3 : 1) * FX.usd;
  if ((m = p.match(/€\s?([\d,]+)/))) return +m[1].replace(/,/g, "") * FX.eur;
  if ((m = p.match(/£\s?([\d,]+)/))) return +m[1].replace(/,/g, "") * FX.gbp;
  if ((m = p.match(/([\d.]+)\s*万澳元/))) return +m[1] * 1e4 * FX.aud;
  if ((m = p.match(/([\d.]+)\s*万?澳元/))) return +m[1] * FX.aud * (/万/.test(m[0]) ? 1e4 : 1);
  if ((m = p.match(/([\d.]+)\s*万港元/))) return +m[1] * 1e4 * FX.hkd;
  if ((m = p.match(/₹\s?([\d,]+)/))) return +m[1].replace(/,/g, "") * FX.inr;
  if ((m = p.match(/(\d+(?:\.\d+)?)\s*万/))) return +m[1] * 1e4;
  if ((m = p.match(/[¥￥]\s?([\d,]+)/))) return +m[1].replace(/,/g, "");
  if ((m = p.match(/(\d[\d,]*)\s*元/))) return +m[1].replace(/,/g, "");
  return 1;
};
const fmtCNY = v => v >= 1e4 ? `≈ ¥${(v / 1e4).toFixed(v >= 1e5 ? 0 : 1)} 万` : v > 1 ? `≈ ¥${Math.round(v)}` : "";
const CN = /中国|北京|上海|深圳|广州|广东|山东|香港|澳门|徽州|安徽|湖南|长沙|杭州|浙江|江苏|四川|成都|重庆|大湾区|内地|广西|天津|武汉|福建|厦门|西安|青岛|南京|苏州|海南|眉山|海门|黄山/;
const isCN = c => CN.test(`${c.region} ${c.name} ${c.organizer}`) && !/海外/.test(c.name);
const FORMS = [["短片", /短片|short/i], ["短剧", /短剧|漫剧/], ["长片", /长片|feature/i], ["广告", /广告|\bads?\b|品牌/i], ["MV", /\bMV\b|音乐视频|music video/i], ["动画", /动画|动漫|animation/i], ["公益", /公益|for good|正向/i]];
const formsOf = c => { const t = `${c.name} ${c.category} ${c.desc}`; return FORMS.filter(([, r]) => r.test(t)).map(([n]) => n); };
const hay = c => `${c.name} ${c.organizer} ${c.region} ${c.category} ${c.desc} ${c.prize}`.toLowerCase();
const byDl = (a, b) => (daysLeft(a) ?? 1e4) - (daysLeft(b) ?? 1e4) || G[a.grade] - G[b.grade];
const live = () => C.filter(isOpen);
const STATE = { open: "征集中", pending: "截止待公布", soon: "即将开放", closed: "已截止" };

/* ═════════ 本地偏好（只存主题、视图、收藏） ═════════ */
const KEY = "aicontest.v6";
const P = (() => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; } })();
P.fav ||= []; P.view ||= "list";
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(P)); } catch {} };
const isFav = id => P.fav.includes(id);
const prevSeen = Array.isArray(P.seen) ? new Set(P.seen) : null;
P.seen = C.map(c => c.id); save();
const isNew = c => !!prevSeen && !prevSeen.has(c.id);

/* ═════════ 反馈 ═════════ */
function toast(msg, undo) {
  const el = document.createElement("div"); el.className = "toast";
  el.innerHTML = `<span>${esc(msg)}</span>${undo ? "<button>撤销</button>" : ""}`;
  $("#toasts").append(el);
  const kill = () => { el.classList.add("out"); setTimeout(() => el.remove(), 260); };
  if (undo) el.querySelector("button").onclick = () => { undo(); kill(); };
  setTimeout(kill, undo ? 4000 : 2400);
}
async function copy(t, msg = "已复制") { try { await navigator.clipboard.writeText(t); } catch { const a = document.createElement("textarea"); a.value = t; document.body.append(a); a.select(); document.execCommand("copy"); a.remove(); } toast(msg); }
function download(name, text, type) { const u = URL.createObjectURL(new Blob([text], { type })); const a = Object.assign(document.createElement("a"), { href: u, download: name }); document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(u), 800); }
function toggleFav(id) {
  const was = isFav(id); P.fav = was ? P.fav.filter(x => x !== id) : [...P.fav, id]; save(); refresh();
  toast(was ? "已取消收藏" : "已收藏，可在全部赛事里筛选「已收藏」", () => { P.fav = was ? [...P.fav, id] : P.fav.filter(x => x !== id); save(); refresh(); });
}

/* ═════════ 原子组件 ═════════ */
const gB = c => `<span class="g g-${c.grade}" title="${c.grade} 级 · ${GN[c.grade]}">${c.grade}</span>`;
function tags(c, max = 4) {
  const t = [];
  if (c.status === "pending" || c.status === "soon") t.push(`<span class="tag state">${STATE[c.status]}</span>`);
  if (isNew(c)) t.push('<span class="tag new">新收录</span>');
  if (isFree(c)) t.push('<span class="tag free">免费</span>');
  if (hasCash(c)) t.push('<span class="tag cash">现金奖</span>');
  if (c.topic === "命题") t.push('<span class="tag topic">命题</span>');
  if (c.verified === "warn") t.push('<span class="tag warn">待确认</span>');
  return t.slice(0, max).join("");
}
const favBtn = c => `<button class="star ${isFav(c.id) ? "on" : ""}" data-fav="${c.id}" aria-label="${isFav(c.id) ? "取消收藏" : "收藏"}" title="${isFav(c.id) ? "取消收藏" : "收藏（S）"}">${I.star}</button>`;
const hl = (s, q) => { s = esc(s); if (!q) return s; for (const w of q.trim().split(/\s+/).filter(Boolean)) { const i = s.toLowerCase().indexOf(w.toLowerCase()); if (i >= 0) s = s.slice(0, i) + '<mark class="hl">' + s.slice(i, i + w.length) + "</mark>" + s.slice(i + w.length); } return s; };
function daysBox(c) {
  const l = daysLeft(c);
  if (l == null) return `<div class="days none"><b>待公布</b><span>截止</span></div>`;
  if (l < 0) return `<div class="days"><b>—</b><span>已截止</span></div>`;
  return `<div class="days ${urg(l)}"><b class="num">${l === 0 ? "今天" : l}</b><span>${l === 0 ? "截止" : md(c.deadline)}</span></div>`;
}
function row(c, q = "") {
  const l = daysLeft(c);
  return `<div class="row ${l != null && l < 0 ? "past" : ""}" data-open="${c.id}" tabindex="0" role="button" aria-label="${esc(c.name)}">
    ${daysBox(c)}
    <div class="row-main"><div class="row-t">${gB(c)}<h3>${hl(c.name, q)}</h3>${tags(c)}</div>
      <div class="row-m"><span>${I.pin}${esc(c.region || "地区未注明")}</span><span>${I.ticket}${esc(c.fee)}</span></div>${c.organizer ? `<div class="row-org" title="${esc(c.organizer)}">${esc(c.organizer)}</div>` : ""}</div>
    <div class="row-prize" title="${esc(c.prize)}"><em>${cashCNY(c) > 1 ? fmtCNY(cashCNY(c)) : "最高奖励"}</em>${esc(c.prize)}</div>
    ${favBtn(c)}</div>`;
}
function card(c) {
  const l = daysLeft(c);
  const dd = l == null ? `<div class="card-days"><b style="font-size:17px">截止待公布</b></div>` : l < 0 ? `<div class="card-days"><b style="font-size:17px">已截止</b></div>`
    : `<div class="card-days ${urg(l)}"><b class="num">${l === 0 ? "今天" : l}</b><small>${l === 0 ? "截止" : "天后截止 · " + md(c.deadline)}</small></div>`;
  return `<article class="card" data-open="${c.id}" tabindex="0" aria-label="${esc(c.name)}">
    <div class="card-top">${dd}<span style="display:flex;gap:4px;align-items:center">${gB(c)}${favBtn(c)}</span></div>
    <div class="card-body"><h3>${esc(c.name)}</h3><div class="card-org">${esc(c.organizer || c.region)}</div>
      <div class="card-prize">${I.trophy}<span>${esc(c.prize)}</span></div>
      <div class="card-f"><span class="fee">${esc(cut(c.fee, 18))}</span>${tags(c, 3)}</div></div></article>`;
}
const empty = (t, s = "", ic = "inbox") => `<div class="empty"><div class="ill">${I[ic]}</div><b>${t}</b>${s ? `<span>${s}</span>` : ""}</div>`;
const secH = (title, sub, right = "") => `<div class="sec-h"><div><h2><span class="bar"></span>${title}</h2>${sub ? `<p>${sub}</p>` : ""}</div>${right ? `<div class="right">${right}</div>` : ""}</div>`;
const more = (href, t = "查看全部") => `<a class="more" href="${href}">${t}${I.r}</a>`;

/* ═════════ 路由 ═════════ */
const ROUTES = [
  { k: "home", n: "截止雷达", i: "radar" }, { k: "contests", n: "全部赛事", i: "list" }, { k: "calendar", n: "截止日历", i: "cal" },
  { k: "insights", n: "数据洞察", i: "chart" }, { k: "brief", n: "今日简报", i: "doc" }, { k: "festivals", n: "知名电影节", i: "globe" }, { k: "about", n: "收录与分级", i: "info" },
];
const parseHash = () => { const h = location.hash.replace(/^#\/?/, ""); const [p, q] = h.split("?"); const parts = (p || "home").split("/"); return { page: parts[0] || "home", arg: parts[1] ? decodeURIComponent(parts[1]) : null, params: Object.fromEntries(new URLSearchParams(q || "")) }; };
let R = parseHash(), curPage = null;
function go(page, params = {}, replace = false) {
  const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => v !== "" && v != null)).toString();
  const h = `#/${page}${qs ? "?" + qs : ""}`;
  if (replace) { history.replaceState(null, "", h); route(); } else location.hash = h;
}
addEventListener("hashchange", route);
function route() {
  R = parseHash();
  if (R.page === "c" && R.arg) { if (!curPage) { curPage = "home"; R.page = "home"; render(true); } openDrawer(R.arg, true); return; }
  if (!ROUTES.some(r => r.k === R.page)) R.page = "home";
  const wasOpen = $("#drawer").classList.contains("on"); const back = curId || openedFrom;
  closeDrawer(true);
  const changed = R.page !== curPage; curPage = R.page; render(changed);
  const fid = (wasOpen && back) || pendingFocus; pendingFocus = null;
  if (fid && !changed) { const el = $(`#view [data-open="${CSS.escape(fid)}"]`); if (el) { el.focus({ preventScroll: true }); const r = el.getBoundingClientRect(); if (r.top < 120 || r.bottom > innerHeight) el.scrollIntoView({ block: "center" }); } }
}

/* ═════════ 页面：截止雷达 ═════════ */
const V = {}; let tick = null;
V.home = () => {
  const L = live();
  const dated = L.filter(c => daysLeft(c) != null).sort(byDl);
  const w7 = dated.filter(c => daysLeft(c) <= 7), w3 = w7.filter(c => daysLeft(c) <= 3);
  const sa = L.filter(c => G[c.grade] <= 1);
  const free = L.filter(isFree);
  const lead = dated.find(c => G[c.grade] <= 1) || dated.find(c => G[c.grade] <= 2) || dated[0];
  const gc = ["S", "A", "B", "C"].map(g => [g, L.filter(c => c.grade === g).length]);
  const sel = R.params.day || "";
  let tl = "";
  for (let i = 0; i < 14; i++) {
    const d = new Date(T0); d.setDate(d.getDate() + i); const k = ymd(d);
    const ev = L.filter(c => c.deadline === k).sort((a, b) => G[b.grade] - G[a.grade]);
    tl += `<button class="dcol ${i === 0 ? "t" : ""} ${d.getDay() === 6 ? "sat" : ""} ${d.getDay() === 0 ? "sun" : ""} ${sel === k ? "sel" : ""}" data-day="${k}" aria-label="${md(k)} ${ev.length} 个截止">
      <span class="tip">${md(k)} · ${ev.length ? ev.length + " 个截止" : "无截止"}</span>
      <div class="bars" style="height:${ev.length ? Math.min(8, ev.length) * 10 - 2 : 2}px">${ev.length ? ev.slice(0, 8).map(c => `<i style="background:var(--g${c.grade})"></i>`).join("") : '<i class="nil"></i>'}</div>${ev.length ? `<em class="cnt">${ev.length}</em>` : ""}
      <b>${d.getDate()}</b><span>${i === 0 ? "今天" : "周" + WD[d.getDay()]}</span></button>`;
  }
  const selList = sel ? L.filter(c => c.deadline === sel).sort((a, b) => G[a.grade] - G[b.grade]) : [];
  const fc = L.filter(c => isFree(c) && hasCash(c)).sort((a, b) => cashCNY(b) - cashCNY(a) || byDl(a, b));
  const fresh = L.filter(isNew).sort(byDl);
  return `
  <div class="page-h"><div class="kicker">${T0.getMonth() + 1}月${T0.getDate()}日 · 周${WD[T0.getDay()]}</div>
    <h1>${w3.length ? `${w3.length} 个赛事将在 3 天内截止` : w7.length ? `本周有 ${w7.length} 个赛事截止` : "近期没有赛事截止"}</h1>
    <p class="lede">目前在征 ${L.length} 个 AI 影像赛事，其中 S / A 级 ${sa.length} 个、免费报名 ${free.length} 个。截止日以主办方官网为准。</p></div>
  <section class="hero">
    ${lead ? `<div class="lead" data-open="${lead.id}" tabindex="0" role="button" aria-label="${esc(lead.name)}">
      <div class="lead-top">${gB(lead)}<span>${GN[lead.grade]} · 最近截止的高分级赛事</span>${tags(lead, 3)}</div>
      <h3>${esc(lead.name)}</h3>
      <div class="lead-sub">${esc(lead.organizer)}${lead.region ? " · " + esc(lead.region) : ""}</div>
      <div class="lead-facts"><div title="${esc(lead.prize)}"><span>最高奖励</span><b>${esc(lead.prize)}</b></div><div><span>报名费</span><b>${esc(lead.fee)}</b></div><div><span>截止</span><b>${full(lead.deadline)}</b></div></div>
      <div class="lead-cd"><div class="clock" id="clock" data-to="${lead.deadline}"></div>
        <div class="lead-acts">${lead.submit ? `<a class="btn pri" href="${esc(lead.submit)}" target="_blank" rel="noopener" data-stop>${/^mailto:/.test(lead.submit) ? "发邮件投稿" : "去投递"}${I.ext}</a>` : ""}<button class="btn" data-open="${lead.id}">查看详情</button></div></div>
    </div>` : `<div class="lead">${empty("暂时没有已公布截止日的赛事")}</div>`}
    <div class="kpis">
      <a class="kpi" href="#/contests"><span class="k-top">在征赛事</span><b class="num">${L.length}</b><i>含截止待公布 ${L.filter(c => c.status === "pending").length} 个</i><div class="bar2"><i style="width:100%;background:var(--ink-3)"></i></div></a>
      <a class="kpi hot" href="#/contests?when=7"><span class="k-top">7 天内截止</span><b class="num">${w7.length}</b><i>其中 3 天内 ${w3.length} 个</i><div class="bar2"><i style="width:${Math.round(w7.length / Math.max(1, L.length) * 100)}%;background:var(--red)"></i></div></a>
      <a class="kpi acc" href="#/contests?grade=SA"><span class="k-top">S / A 级</span><b class="num">${sa.length}<small>/ ${L.length}</small></b><div class="meter">${gc.map(([g, n]) => `<i style="flex:${n};background:var(--g${g})" title="${g} 级 ${n} 个"></i>`).join("")}</div></a>
      <a class="kpi" href="#/contests?fee=free"><span class="k-top">免费报名</span><b class="num">${free.length}</b><i>其中有现金奖 ${fc.length} 个</i><div class="bar2"><i style="width:${Math.round(free.length / Math.max(1, L.length) * 100)}%;background:var(--green)"></i></div></a>
    </div>
  </section>

  <section class="sec panel pad">
    <div class="tl-head"><div><h2 style="margin:0;font-size:15px;font-weight:650">未来 14 天截止分布</h2><p style="margin:4px 0 0;font-size:12.5px;color:var(--ink-4)">每个色块代表一个赛事，点某一天查看当天截止的赛事</p></div>
      <div class="legend">${["S", "A", "B", "C"].map(g => `<span><i style="background:var(--g${g})"></i>${g} 级</span>`).join("")}</div></div>
    <div class="tl">${tl}</div>
    ${sel ? `<div class="list" style="margin-top:14px">${selList.length ? selList.map(c => row(c)).join("") : empty(`${md(sel)} 没有截止的赛事`, "", "cal")}</div>` : ""}
  </section>

  <section class="sec">${secH("最近截止", "按截止时间排序，红色为 3 天内、黄色为 7 天内", more("#/contests"))}<div class="list">${dated.slice(0, 8).map(c => row(c)).join("")}</div></section>
  ${fresh.length ? `<section class="sec">${secH(`新收录 <span class="tag new">${fresh.length}</span>`, "上次打开之后新增的赛事")}<div class="cards">${fresh.slice(0, 8).map(card).join("")}</div></section>` : ""}
  <section class="sec">${secH("值得投 · S / A 级", "按认可度、可信度、资源回报、成本加权后分级最高的赛事", more("#/contests?grade=SA"))}<div class="cards">${sa.sort(byDl).slice(0, 8).map(card).join("")}</div></section>
  <section class="sec">${secH("零门槛 · 免费且有现金奖", "不收报名费、并写明现金奖金的赛事，按奖金从高到低", more("#/contests?fee=free&cash=1&sort=prize"))}<div class="list">${fc.slice(0, 6).map(c => row(c)).join("") || empty("暂无")}</div></section>`;
};
V.home.after = () => {
  const el = $("#clock"); if (!el) return;
  const to = parseD(el.dataset.to); if (!to) return; to.setHours(23, 59, 59, 0);
  const up = () => { let ms = Math.max(0, to - new Date()); const d = Math.floor(ms / 864e5); ms -= d * 864e5; const h = Math.floor(ms / 36e5); ms -= h * 36e5; const m = Math.floor(ms / 6e4); const s = Math.floor((ms - m * 6e4) / 1e3);
    el.innerHTML = [[d, "天"], [h, "时"], [m, "分"], [s, "秒"]].map(([v, u], i) => `${i ? "<em>:</em>" : ""}<div><b>${String(v).padStart(2, "0")}</b><span>${u}</span></div>`).join(""); };
  up(); tick = setInterval(up, 1000);
};

/* ═════════ 页面：全部赛事 ═════════ */
const FD = { q: "", when: "open", grade: "", fee: "", cash: "", topic: "", region: "", form: "", fav: "", sort: "dl" };
const fp = () => ({ ...FD, ...R.params });
function filter(p) {
  const q = (p.q || "").trim().toLowerCase();
  return C.filter(c => {
    const l = daysLeft(c);
    if (p.when === "open" && !isOpen(c)) return false;
    if (["3", "7", "30"].includes(p.when) && !(isOpen(c) && l != null && l <= +p.when)) return false;
    if (p.when === "tba" && !(isOpen(c) && l == null)) return false;
    if (p.when === "closed" && isOpen(c)) return false;
    if (p.grade && !p.grade.includes(c.grade)) return false;
    if (p.fee === "free" && !isFree(c)) return false;
    if (p.cash && !hasCash(c)) return false;
    if (p.topic && c.topic !== p.topic) return false;
    if (p.region === "cn" && !isCN(c)) return false;
    if (p.region === "intl" && isCN(c)) return false;
    if (p.form && !formsOf(c).includes(p.form)) return false;
    if (p.fav && !isFav(c.id)) return false;
    if (q && !q.split(/\s+/).every(w => hay(c).includes(w))) return false;
    return true;
  });
}
const SORT = { dl: ["截止最近", byDl], grade: ["分级最高", (a, b) => G[a.grade] - G[b.grade] || byDl(a, b)], prize: ["奖金最高", (a, b) => cashCNY(b) - cashCNY(a) || byDl(a, b)], name: ["按名称", (a, b) => a.name.localeCompare(b.name, "zh")] };
const LABEL = { when: { "3": "3 天内", "7": "7 天内", "30": "30 天内", tba: "截止待公布", closed: "已截止", all: "全部（含已截止）" }, grade: { SA: "S + A 级", S: "S 级", A: "A 级", B: "B 级", C: "C 级" }, fee: { free: "免费报名" }, cash: { "1": "有现金奖" }, topic: { "命题": "命题", "自由投稿": "自由投稿" }, region: { cn: "国内", intl: "海外 / 线上" }, fav: { "1": "已收藏" } };
const clean = p => Object.fromEntries(Object.entries(p).filter(([k, v]) => v !== "" && v != null && FD[k] !== v && !k.startsWith("_")));
V.contests = () => {
  const p = fp(), res = filter(p).sort((SORT[p.sort] || SORT.dl)[1]);
  const n = (k, v) => filter({ ...p, [k]: v }).length;
  const chip = (k, v, label, toggle = false) => { const on = (p[k] || "") === v && !(toggle && !v); const c = n(k, v); return `<button class="chip ${on ? "on" : ""} ${!c && !on ? "zero" : ""}" data-f="${k}" data-v="${toggle && on ? "" : v}">${label}<span class="n">${c}</span></button>`; };
  const act = Object.keys(FD).filter(k => !["q", "sort"].includes(k) && (p[k] || "") !== FD[k]);
  const view = P.view;
  return `
  <div class="page-h"><div class="kicker">全部赛事</div><h1>${C.length} 个 AI 影像赛事</h1><p class="lede">组合筛选时间、分级、门槛与作品形态。筛选条件会写进网址，复制链接即可分享当前结果。</p></div>
  <div class="filters ${act.length ? "" : ""}" id="filters">
    <div class="f-top">
      <label class="field ${p.q ? "has" : ""}">${I.search}<input id="fq" value="${esc(p.q)}" placeholder="搜索名称、主办方、地区、题材，多个词用空格分隔" aria-label="搜索赛事"><button class="clr" data-act="clearq" aria-label="清空">${I.x}</button></label>
      <select class="sel" id="fsort" aria-label="排序">${Object.entries(SORT).map(([k, [nm]]) => `<option value="${k}" ${p.sort === k ? "selected" : ""}>${nm}</option>`).join("")}</select>
      <div class="seg" role="group" aria-label="视图"><button data-view="list" class="${view === "list" ? "on" : ""}">${I.list}列表</button><button data-view="grid" class="${view === "grid" ? "on" : ""}">${I.grid}卡片</button></div>
    </div>
    <button class="f-toggle" data-act="ftoggle">${I.filter}筛选条件${act.length ? `<em>${act.length}</em>` : ""}<span class="ar">${I.down}</span></button>
    <div class="f-body">
      <div class="f-group"><label>时间</label><div class="chips">${chip("when", "open", "全部在征")}${chip("when", "3", "3 天内")}${chip("when", "7", "7 天内")}${chip("when", "30", "30 天内")}${chip("when", "tba", "截止待公布")}${chip("when", "all", "含已截止")}</div></div>
      <div class="f-group"><label>分级</label><div class="chips">${chip("grade", "", "不限")}${chip("grade", "SA", "S + A")}${chip("grade", "S", "S")}${chip("grade", "A", "A")}${chip("grade", "B", "B")}${chip("grade", "C", "C")}</div></div>
      <div class="f-group"><label>条件</label><div class="chips">${chip("fee", "free", "免费报名", true)}${chip("cash", "1", "有现金奖", true)}${chip("topic", "自由投稿", "自由投稿", true)}${chip("topic", "命题", "命题", true)}${chip("region", "cn", "国内", true)}${chip("region", "intl", "海外 / 线上", true)}${chip("fav", "1", "已收藏", true)}</div></div>
      <div class="f-group"><label>形态</label><div class="chips">${FORMS.map(([nm]) => chip("form", nm, nm, true)).join("")}</div></div>
      <button class="btn pri f-done" data-act="ftoggle">查看 ${res.length} 个结果</button>
    </div>
  </div>
  <div class="res-bar"><span>找到 <b class="num">${res.length}</b> 个 · ${(SORT[p.sort] || SORT.dl)[0]}</span>
    <div class="active-f">${act.map(k => `<span class="af">${esc((LABEL[k] && LABEL[k][p[k]]) || p[k])}<button data-f="${k}" data-v="${FD[k]}" aria-label="移除">${I.x}</button></span>`).join("")}${act.length || p.q ? `<button class="link-btn" data-act="reset">清空筛选</button>` : ""}</div></div>
  ${res.length ? (view === "grid" ? `<div class="cards" id="rows">${res.map(card).join("")}</div>` : `<div class="list" id="rows">${res.map(c => row(c, p.q)).join("")}</div>`)
    : `<div class="panel">${empty("没有符合条件的赛事", `<button class="link-btn" data-act="reset">清空筛选</button>`, "search")}</div>`}`;
};
V.contests.after = () => {
  const q = $("#fq");
  const push = debounce(() => { const pos = q.selectionStart; refocus = pos; go("contests", clean({ ...fp(), q: q.value }), true); }, 250);
  q.addEventListener("input", () => { q.closest(".field").classList.toggle("has", !!q.value); push(); });
  if (refocus !== false) { const pos = typeof refocus === "number" ? Math.min(refocus, q.value.length) : q.value.length; q.focus({ preventScroll: true }); q.setSelectionRange(pos, pos); refocus = false; }
  $("#fsort").onchange = e => go("contests", clean({ ...fp(), sort: e.target.value }), true);
  if (fOpen) $("#filters").classList.add("open");
};
let refocus = false, fOpen = false;

/* ═════════ 页面：截止日历 ═════════ */
let calM = null;
V.calendar = () => {
  if (!calM) calM = new Date(T0.getFullYear(), T0.getMonth(), 1);
  const scope = R.params.scope || "all";
  const pool = C.filter(c => c.deadline && (scope === "top" ? G[c.grade] <= 2 : true) && (scope === "fav" ? isFav(c.id) : true));
  const first = new Date(calM), lead = (calM.getDay() + 6) % 7; first.setDate(1 - lead);
  const dim = new Date(calM.getFullYear(), calM.getMonth() + 1, 0).getDate();
  const cells = Math.ceil((lead + dim) / 7) * 7;
  const per = {}; pool.forEach(c => (per[c.deadline] ||= []).push(c));
  const mx = Math.max(1, ...Object.values(per).map(a => a.length));
  let h = "一二三四五六日".split("").map(x => `<div class="wd">周${x}</div>`).join("");
  for (let i = 0; i < cells; i++) {
    const d = new Date(first); d.setDate(first.getDate() + i); const k = ymd(d);
    const ev = (per[k] || []).sort((a, b) => G[a.grade] - G[b.grade]);
    const out = d.getMonth() !== calM.getMonth();
    const heat = ev.length ? `background:color-mix(in srgb, var(--accent) ${Math.round(4 + ev.length / mx * 10)}%, var(--surface))` : "";
    h += `<div class="cell ${out ? "out" : ""} ${+d === +T0 ? "t" : ""}" style="${heat}" ${ev.length ? `data-cday="${k}"` : ""}>
      <div class="cn"><b>${d.getDate()}</b>${ev.length ? `<span style="font-size:10.5px;color:var(--ink-4)">${ev.length}</span>` : ""}</div>
      <div class="cells-evs">${ev.slice(0, 3).map(c => `<div class="ev ${c.grade}" data-open="${c.id}" title="${esc(c.name)}"><i></i><span>${esc(c.name)}</span></div>`).join("")}</div>
      ${ev.length > 3 ? `<button class="ev-more" data-cday="${k}">还有 ${ev.length - 3} 个</button>` : ""}</div>`;
  }
  const day = R.params.day;
  const mk = `${calM.getFullYear()}-${String(calM.getMonth() + 1).padStart(2, "0")}`;
  const listSrc = day ? (per[day] || []) : pool.filter(c => c.deadline.startsWith(mk));
  const grp = {}; listSrc.forEach(c => (grp[c.deadline] ||= []).push(c));
  const keys = Object.keys(grp).sort();
  return `
  <div class="page-h"><div class="kicker">截止日历</div></div>
  <div class="cal-head"><h1>${calM.getFullYear()} 年 ${calM.getMonth() + 1} 月</h1>
    <div class="cal-nav"><button data-cal="-1" aria-label="上个月">${I.l}</button><button data-cal="0">本月</button><button data-cal="1" aria-label="下个月">${I.r}</button></div>
    <span class="tag">本月 ${pool.filter(c => c.deadline.startsWith(mk)).length} 个截止</span><span style="flex:1"></span>
    <div class="seg" role="group">${[["all", "全部"], ["top", "B 级以上"], ["fav", "已收藏"]].map(([k, nm]) => `<button class="${scope === k ? "on" : ""}" data-scope="${k}">${nm}</button>`).join("")}</div>
    <button class="btn" data-act="ics">${I.bell}导出到手机日历</button></div>
  <div class="cal">${h}</div>
  <section class="sec agenda">${secH(day ? `${full(day)} 截止` : `${calM.getMonth() + 1} 月截止清单`, day ? "" : "按日期分组，点任意赛事查看详情", day ? `<a class="more" href="#/calendar${scope !== "all" ? "?scope=" + scope : ""}">返回整月${I.r}</a>` : "")}
    ${keys.length ? keys.map(k => `<div style="margin-bottom:16px"><div style="font-size:12.5px;font-weight:600;color:var(--ink-3);margin:0 2px 8px">${full(k)} · ${grp[k].length} 个</div><div class="list">${grp[k].sort((a, b) => G[a.grade] - G[b.grade]).map(c => row(c)).join("")}</div></div>`).join("")
      : `<div class="panel">${empty("这个月没有截止的赛事", "", "cal")}</div>`}
  </section>`;
};
function exportICS(list, name) {
  const e = s => String(s || "").replace(/[\\;,]/g, m => "\\" + m).replace(/\n/g, "\\n");
  const f = d => ymd(d).replace(/-/g, ""); const stamp = new Date().toISOString().replace(/[-:]/g, "").slice(0, 15) + "Z";
  let t = "BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//AIContestAssistant//v6//ZH\r\nCALSCALE:GREGORIAN\r\nX-WR-CALNAME:AI 赛事截止\r\n";
  for (const c of list) { const d = parseD(c.deadline); if (!d) continue; const d2 = new Date(d); d2.setDate(d.getDate() + 1); const u = c.submit || c.site;
    t += `BEGIN:VEVENT\r\nUID:${c.id}@aicontest\r\nDTSTAMP:${stamp}\r\nDTSTART;VALUE=DATE:${f(d)}\r\nDTEND;VALUE=DATE:${f(d2)}\r\nSUMMARY:${e(`【${c.grade}】截止 · ${c.name}`)}\r\nDESCRIPTION:${e(`最高奖励：${c.prize}\n报名费：${c.fee}\n投递：${u || "—"}`)}\r\n${/^https?:/.test(u) ? `URL:${u}\r\n` : ""}BEGIN:VALARM\r\nTRIGGER:-P3D\r\nACTION:DISPLAY\r\nDESCRIPTION:${e("3 天后截止：" + c.name)}\r\nEND:VALARM\r\nBEGIN:VALARM\r\nTRIGGER:-PT15H\r\nACTION:DISPLAY\r\nDESCRIPTION:${e("今天截止：" + c.name)}\r\nEND:VALARM\r\nEND:VEVENT\r\n`; }
  download(name, t + "END:VCALENDAR\r\n", "text/calendar");
}

/* ═════════ 页面：数据洞察 ═════════ */
V.insights = () => {
  const L = live(); const col = GCOL();
  const months = Array.from({ length: 8 }, (_, i) => { const d = new Date(T0.getFullYear(), T0.getMonth() + i, 1); return { k: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`, n: `${d.getMonth() + 1}月` }; });
  const mc = months.map(m => ["S", "A", "B", "C"].map(g => L.filter(c => (c.deadline || "").startsWith(m.k) && c.grade === g).length));
  const mx = Math.max(1, ...mc.map(a => a.reduce((x, y) => x + y, 0)));
  const bars = months.map((m, i) => { const tot = mc[i].reduce((a, b) => a + b, 0); return `<div class="vb" title="${m.n}：${tot} 个"><div class="stk">${["S", "A", "B", "C"].map((g, j) => mc[i][j] ? `<i style="height:${mc[i][j] / mx * 100}%;background:var(--g${g})"></i>` : "").join("")}</div><b class="num">${tot}</b><span>${m.n}</span></div>`; }).join("");
  const gc = ["S", "A", "B", "C"].map(g => [g, L.filter(c => c.grade === g).length]); const tot = L.length || 1;
  let acc = 0; const R0 = 52, CC = 2 * Math.PI * R0;
  const donut = `<svg viewBox="0 0 132 132" class="donut">${gc.map(([g, n]) => { const s = `<circle cx="66" cy="66" r="${R0}" fill="none" stroke="${col[g]}" stroke-width="16" stroke-dasharray="${n / tot * CC} ${CC}" stroke-dashoffset="${-acc / tot * CC}" transform="rotate(-90 66 66)"/>`; acc += n; return s; }).join("")}<text x="66" y="63" text-anchor="middle" font-size="26" font-weight="700" fill="currentColor">${L.length}</text><text x="66" y="84" text-anchor="middle" font-size="11" fill="currentColor" opacity=".55">在征赛事</text></svg>`;
  const split = (a, b, na, nb, ca, cb) => { const t = a + b || 1; return `<div class="split"><div class="sp-bar"><i style="flex:${a || .0001};background:${ca}"></i><i style="flex:${b || .0001};background:${cb}"></i></div><div class="sp-l"><span><i style="background:${ca}"></i>${na} <b class="num">${a}</b> · ${Math.round(a / t * 100)}%</span><span><i style="background:${cb}"></i>${nb} <b class="num">${b}</b></span></div></div>`; };
  const free = L.filter(isFree).length, cash = L.filter(hasCash).length, topic = L.filter(c => c.topic === "命题").length, cn = L.filter(isCN).length;
  const forms = FORMS.map(([nm]) => [nm, L.filter(c => formsOf(c).includes(nm)).length]).sort((a, b) => b[1] - a[1]); const fmx = Math.max(1, ...forms.map(x => x[1]));
  const top = L.filter(c => cashCNY(c) > 1).sort((a, b) => cashCNY(b) - cashCNY(a)).slice(0, 8); const tmx = cashCNY(top[0] || { prize: "" }) || 1;
  const fees = L.filter(c => !isFree(c) && /[$€£¥￥]|\d/.test(c.fee)).length;
  return `
  <div class="page-h"><div class="kicker">数据洞察</div><h1>AI 影像赛事整体结构</h1><p class="lede">基于当前在征的 ${L.length} 个赛事：什么时候截止最集中、含金量怎么分布、门槛高不高、奖金有多少。</p></div>
  <div class="ins-grid">
    <div class="ins w2"><h3>未来 8 个月截止分布 <div class="legend">${["S", "A", "B", "C"].map(g => `<span><i style="background:var(--g${g})"></i>${g}</span>`).join("")}</div></h3><div class="vbars">${bars}</div></div>
    <div class="ins"><h3>分级构成</h3><div class="donut-w">${donut}<ul class="dl-leg">${gc.map(([g, n]) => `<li><i style="background:var(--g${g})"></i>${g} 级 · ${GN[g]}<b class="num">${n}</b></li>`).join("")}</ul></div></div>
    <div class="ins"><h3>门槛结构</h3>${split(free, L.length - free, "免费", "收费 / 未核实", "var(--green)", "var(--line-2)")}${split(cash, L.length - cash, "有现金奖", "荣誉 / 资源", "var(--gA)", "var(--line-2)")}${split(L.length - topic, topic, "自由投稿", "命题", "var(--gB)", "var(--amber)")}${split(cn, L.length - cn, "国内", "海外 / 线上", "var(--accent)", "var(--gC)")}</div>
    <div class="ins"><h3>作品形态 <span>点击查看对应赛事</span></h3><div class="hbars">${forms.map(([nm, v]) => `<a href="#/contests?form=${encodeURIComponent(nm)}"><span>${nm}</span><span class="bwrap"><i style="width:${v / fmx * 100}%"></i></span><b>${v}</b></a>`).join("")}</div></div>
    <div class="ins"><h3>报名成本</h3><div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">${[["免费", free, "var(--green)"], ["收费", fees, "var(--amber)"], ["未核实 / 未公布", L.length - free - fees, "var(--ink-4)"], ["写明现金奖", cash, "var(--gA)"]].map(([nm, v, c]) => `<div style="border:1px solid var(--line);border-radius:10px;padding:12px;background:var(--surface-2)"><b class="num" style="font-size:24px;letter-spacing:-.03em;color:${c}">${v}</b><div style="font-size:12px;color:var(--ink-3)">${nm}</div></div>`).join("")}</div></div>
    <div class="ins w2"><h3>现金奖金排行 <span>按大致汇率折合人民币，仅供比较</span></h3><div class="hbars prize">${top.map(c => `<a data-open="${c.id}">${gB(c)}<span>${esc(c.name)}</span><span class="bwrap"><i style="width:${cashCNY(c) / tmx * 100}%"></i></span><b>${fmtCNY(cashCNY(c)).replace("≈ ", "")}</b></a>`).join("")}</div></div>
  </div>`;
};

/* ═════════ 页面：今日简报 ═════════ */
function briefData() {
  const L = live();
  const rng = (a, b) => L.filter(c => { const l = daysLeft(c); return l != null && l >= a && l <= b; }).sort(byDl);
  return { L, t01: rng(0, 1), t23: rng(2, 3), wk: rng(4, 7), mo: rng(8, 30).filter(c => G[c.grade] <= 1),
    fc: L.filter(c => isFree(c) && hasCash(c) && (daysLeft(c) ?? 99) > 7 && (daysLeft(c) ?? 0) <= 60).sort((a, b) => cashCNY(b) - cashCNY(a)).slice(0, 6) };
}
V.brief = () => {
  const b = briefData(), d = T0;
  const no = String(Math.floor((T0 - new Date(T0.getFullYear(), 0, 0)) / 864e5)).padStart(3, "0");
  const top = [...b.t01, ...b.t23, ...b.wk].sort((x, y) => G[x.grade] - G[y.grade] || byDl(x, y)).slice(0, 2);
  const item = c => { const x = parseD(c.deadline); return `<div class="pi" data-open="${c.id}" tabindex="0"><div class="dt"><b class="num">${x ? x.getDate() : "?"}</b><small>${x ? x.getMonth() + 1 + "月" : ""}</small></div><div style="min-width:0"><div class="tt">${esc(c.name)}</div><div class="ss">${gB(c)}${isFree(c) ? '<span class="tag free">免费</span>' : `<span class="fee">${esc(cut(c.fee, 14))}</span>`}</div><div class="pz" title="${esc(c.prize)}">${esc(c.prize)}</div></div></div>`; };
  const sec = (t, a, e) => `<section class="p-sec"><h3><i></i>${t}<em>${a.length} 个</em></h3>${a.length ? `<div class="p-items">${a.map(item).join("")}</div>` : `<div class="p-empty">${I.check}${e}</div>`}</section>`;
  return `
  <div class="brief">
    <div class="brief-tools"><span style="font-size:12.5px;color:var(--ink-3)">可以复制成文字发到群里，或打印成 PDF 存档</span>
      <div class="btns"><button class="btn" data-act="copybrief">${I.copy}复制文字</button><button class="btn" data-act="copymd">${I.copy}复制 Markdown</button><button class="btn" data-act="print">${I.print}打印 / PDF</button></div></div>
    <article class="paper">
      <header class="p-head"><div class="ph-top"><span>AI 赛事日报</span><span>No.${no} · ${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")} 周${WD[d.getDay()]}</span></div>
        <h1>${b.t01.length + b.t23.length ? `${b.t01.length + b.t23.length} 个赛事 3 天内截止` : "近 3 天没有截止，可以安心做片"}</h1>
        <p>一周内共有 ${b.t01.length + b.t23.length + b.wk.length} 个赛事截止，30 天内还有 ${b.mo.length} 个 S / A 级。${top.length ? `优先关注：${top.map(c => `${esc(c.name)}（${md(c.deadline)}）`).join("、")}。` : ""}</p>
        <div class="p-stats"><div><b class="num">${b.L.length}</b><span>在征赛事</span></div><div><b class="num">${b.t01.length + b.t23.length}</b><span>3 天内截止</span></div><div><b class="num">${b.L.filter(c => G[c.grade] <= 1).length}</b><span>S / A 级</span></div><div><b class="num">${b.L.filter(isFree).length}</b><span>免费报名</span></div></div></header>
      <div class="p-body">
        ${sec("今天 / 明天截止", b.t01, "今明两天没有截止的赛事")}${sec("2–3 天内截止", b.t23, "这个区间没有截止的赛事")}${sec("本周截止（4–7 天）", b.wk, "本周剩余时间没有截止")}${sec("30 天内的 S / A 级", b.mo, "30 天内没有 S / A 级截止")}${sec("免费且有现金奖 · 时间充裕", b.fc, "暂时没有符合条件的赛事")}
      </div>
      <footer class="p-foot"><span>AI赛事助手 · 数据更新于 ${esc(RAW.snapshot)}</span><span>剩余天数按本机日期计算，截止时间以主办方官网公布的时区为准</span></footer>
    </article></div>`;
};
function briefText(mdMode) {
  const b = briefData(), d = T0;
  const line = c => mdMode ? `- **${c.name}**（${c.grade} 级）— ${md(c.deadline)}截止；${c.prize}；报名 ${c.fee}${/^https?:/.test(c.submit) ? `；[投递](${c.submit})` : ""}` : `· ${c.name}【${c.grade}】${md(c.deadline)}截止｜${cut(c.prize, 40)}｜报名${cut(c.fee, 16)}`;
  const sec = (t, a) => a.length ? `\n${mdMode ? "## " : "【"}${t}${mdMode ? "" : "】"}\n${a.map(line).join("\n")}\n` : "";
  return `${mdMode ? "# " : ""}AI 赛事日报 ${d.getFullYear()}.${d.getMonth() + 1}.${d.getDate()}\n在征 ${b.L.length} 个 · 3 天内截止 ${b.t01.length + b.t23.length} 个 · 一周内 ${b.t01.length + b.t23.length + b.wk.length} 个\n` + sec("今天/明天截止", b.t01) + sec("2–3 天内截止", b.t23) + sec("本周截止", b.wk) + sec("30 天内 S/A 级", b.mo) + sec("免费且有现金奖", b.fc) + "\n截止日期与规则以主办方官网为准";
}

/* ═════════ 页面：知名电影节 ═════════ */
const MONTHS = t => { const s = new Set(); String(t || "").replace(/(\d{1,2})\s*月/g, (_, n) => s.add(+n)); const m = String(t || "").match(/(\d{1,2})\s*月?\s*[-–~至]\s*(\d{1,2})\s*月/); if (m) for (let i = +m[1]; i <= +m[2]; i++) s.add(i); return s; };
V.festivals = () => {
  const cat = R.params.cat || ""; const cats = [...new Set(FEST.map(f => f.type).filter(Boolean))];
  const list = FEST.filter(f => !cat || f.type === cat);
  const pal = ["var(--gS)", "var(--gB)", "var(--accent)", "var(--gC)", "var(--green)"];
  return `
  <div class="page-h"><div class="kicker">知名电影节</div><h1>${FEST.length} 个国际电影节档期参考</h1><p class="lede">FIAPF 认证等传统电影节。想让 AI 作品走长片或短片节路线时，可以用来规划全年档期；色条表示每年举办的月份。</p></div>
  <div class="chips" style="margin-bottom:18px"><button class="chip ${!cat ? "on" : ""}" data-fcat="">全部<span class="n">${FEST.length}</span></button>${cats.map(c => `<button class="chip ${cat === c ? "on" : ""}" data-fcat="${esc(c)}">${esc(c)}<span class="n">${FEST.filter(f => f.type === c).length}</span></button>`).join("")}</div>
  <div class="fest-grid">${list.map((f, i) => { const ms = MONTHS(f.when); return `<article class="fest"><div class="fest-h"><span class="fest-ic" style="background:${pal[i % pal.length]}">${esc(f.name.replace(/^[^\u4e00-\u9fa5A-Za-z]+/, "").slice(0, 1))}</span><div><h3>${esc(f.name)}</h3><div class="loc">${esc(f.place)} · ${esc(f.type)}</div></div></div>
    <div><div class="month-bar">${Array.from({ length: 12 }, (_, m) => `<i class="${ms.has(m + 1) ? "on" : ""}" title="${m + 1}月"></i>`).join("")}</div><div class="months-l"><span>1月</span><span>6月</span><span>12月</span></div></div>
    <dl><dt>举办时间</dt><dd>${esc(f.when || "—")}</dd><dt>最高奖</dt><dd>${esc(f.award || "—")}</dd><dt>最新档期</dt><dd>${esc(f.latest || "—")}</dd></dl>${f.note ? `<div class="note">${esc(f.note)}</div>` : ""}</article>`; }).join("")}</div>`;
};

/* ═════════ 页面：收录与分级 ═════════ */
V.about = () => {
  const gc = { S: 0, A: 0, B: 0, C: 0 }; C.forEach(c => gc[c.grade]++);
  const vc = { ok: 0, fixed: 0, warn: 0, none: 0 }; C.forEach(c => vc[c.verified]++);
  const GD = { S: "老牌电影节 AI 单元、头部平台的大额基金或赛事。", A: "认可度高、规则清楚、回报明确。首届赛事最高只给 A。", B: "有真实展映或奖金，但影响力或回报一般。", C: "收费投奖型节展、只有电子证书，或信息不全。" };
  return `<div class="about">
  <div class="page-h"><div class="kicker">收录与分级</div><h1>怎么收录、怎么分级</h1><p class="lede">只收 AI 视频与影像类赛事，每条都回到主办方官网核对截止日、报名费和投递方式；不确定的信息会明确标为「待确认」「未公布」或「未核实」。</p></div>
  <div class="steps">${[["01", "发现", "每天巡检赛事公告，记录新开征、延期和规则变化。"], ["02", "核实", "回到主办方官网逐字段核对；多档截止取最后一档。"], ["03", "分级", "按四个维度加权打分，分成 S / A / B / C 四档。"], ["04", "维护", "截止超过 7 天的条目移除；高分级赛事移除前先确认是否延期。"]].map(([n, t, d]) => `<div class="step"><span class="n">${n}</span><b>${t}</b><p>${d}</p></div>`).join("")}</div>
  <h2>分级模型</h2>
  <div class="weights"><div style="flex:35;background:var(--ink)">认可度<br>35%</div><div style="flex:30;background:var(--ink-2)">可信度<br>30%</div><div style="flex:20;background:var(--accent)">资源回报<br>20%</div><div style="flex:15;background:var(--gB)">成本<br>15%</div></div>
  <div class="grade-list">${["S", "A", "B", "C"].map(g => `<div class="gcard"><div class="gh"><span class="g g-${g}">${g}</span><b>${GN[g]}</b><span class="cnt num">${gc[g]}</span></div><p>${GD[g]}</p></div>`).join("")}</div>
  <h2>核实状态</h2>
  <div class="steps">${[["ok", "check", "官网已核实", "官网原文里找到了与本站一致的截止日。"], ["fixed", "edit", "已按官网更正", "与官网不一致的字段已按官网改正。"], ["warn", "alert", "需要你再确认", "官网页面过期、跳转或查不到本届截止日，投递前请自行核对。"], ["none", "info", "未自动核实", "页面需要登录或无法自动读取，以官网为准。"]].map(([k, ic, t, d]) => `<div class="vcard"><span class="cnt num" style="color:${k === "ok" ? "var(--green)" : k === "fixed" ? "var(--accent)" : k === "warn" ? "var(--amber)" : "var(--ink-4)"}">${vc[k]}</span><div><b>${t}</b><p>${d}</p></div></div>`).join("")}</div>
  <h2>收录红线</h2>
  <ul><li>只收 AI 视频 / 影像类，不收纯 AI 音乐类竞赛。</li><li>官网只认主办方官方站；投递链接优先官方入口。</li><li>只收有明确征集窗口的赛事；长期活动标为「截止待公布」。</li><li>报名费没核实就写「未核实」，官方没公布就写「官方未公布」，不臆测。</li></ul>
  <h2>快捷键</h2>
  <div class="kbd-list">${[["搜索", "<kbd>/</kbd> 或 <kbd>⌘</kbd><kbd>K</kbd>"], ["列表上下移动", "<kbd>J</kbd> <kbd>K</kbd>"], ["打开选中的赛事", "<kbd>Enter</kbd>"], ["收藏", "<kbd>S</kbd>"], ["详情里上 / 下一个", "<kbd>←</kbd> <kbd>→</kbd>"], ["关闭", "<kbd>Esc</kbd>"]].map(([a, b]) => `<div><span>${a}</span><span>${b}</span></div>`).join("")}</div>
  </div>`;
};

/* ═════════ 渲染 ═════════ */
let listCtx = [];
function chrome() {
  const L = live(); const w3 = L.filter(c => { const l = daysLeft(c); return l != null && l <= 3; }).length;
  const cnt = { home: w3 ? `<em>${w3}</em>` : "", contests: `<em>${L.length}</em>` };
  $("#tabs").innerHTML = ROUTES.map(r => `<a href="#/${r.k}" class="${R.page === r.k ? "on" : ""} ${r.k === "home" && w3 ? "hot" : ""}" ${R.page === r.k ? 'aria-current="page"' : ""}>${r.n}${cnt[r.k] || ""}</a>`).join("");
  $("#tabbar").innerHTML = ["home", "contests", "calendar", "insights", "brief"].map(k => { const r = ROUTES.find(x => x.k === k); return `<a href="#/${k}" class="${R.page === k ? "on" : ""}">${I[r.i]}<span>${r.n.replace("全部", "").replace("今日", "").replace("截止", "").replace("数据", "")}</span></a>`; }).join("");
  const cur = ROUTES.find(r => r.k === R.page);
  document.title = `${cur && cur.k !== "home" ? cur.n + " · " : ""}AI赛事助手`;
}
function render(changed = true) {
  clearInterval(tick);
  const y = scrollY;
  $("#view").innerHTML = V[R.page]();
  V[R.page].after?.();
  listCtx = [...new Set($$("#view [data-open]").map(e => e.dataset.open))];
  chrome();
  if (changed) { scrollTo(0, 0); $("#view").focus({ preventScroll: true }); } else scrollTo(0, y);
}
function refresh() { render(false); if (curId) fillDrawer(curId); }

/* ═════════ 详情抽屉 ═════════ */
let curId = null, lastFocus = null, openedFrom = null, pendingFocus = null;
function openDrawer(id, fromRoute = false) {
  if (!byId.has(id)) { if (fromRoute) history.replaceState(null, "", `#/${curPage || "home"}`); toast("这个赛事已下线或链接有误"); return; }
  if (!$("#drawer").classList.contains("on")) { lastFocus = document.activeElement; openedFrom = id; }
  if (!listCtx.includes(id)) listCtx = [...new Set($$("#view [data-open]").map(e => e.dataset.open))];
  curId = id; fillDrawer(id);
  $("#drawer").classList.add("on"); $("#mask").classList.add("on"); document.body.style.overflow = "hidden";
  $("#view").inert = true; $(".masthead").inert = true;
  if (!fromRoute) history.pushState({ d: 1 }, "", `#/c/${encodeURIComponent(id)}`);
  setTimeout(() => $("#drawer [data-act=closeDrawer]")?.focus({ preventScroll: true }), 60);
}
function closeDrawer(fromRoute = false) {
  if (!$("#drawer").classList.contains("on")) return;
  $("#drawer").classList.remove("on"); $("#mask").classList.remove("on"); document.body.style.overflow = "";
  $("#view").inert = false; $(".masthead").inert = false; const curIdBeforeClose = curId; curId = null; pendingFocus = curIdBeforeClose;
  if (!fromRoute && location.hash.startsWith("#/c/")) { if (history.state?.d) history.back(); else history.replaceState(null, "", `#/${curPage || "home"}`); }
  try { const id = curIdBeforeClose || lastFocus?.dataset?.open; const el = lastFocus && document.contains(lastFocus) ? lastFocus : id ? $(`#view [data-open="${CSS.escape(id)}"]`) : null; el?.focus?.({ preventScroll: true }); } catch {}
}
function milestones(c) {
  const t = `${c.notes}\n${c.desc}`; const out = []; const re = /([^\s；;，,。()（）|｜:：]{0,10})[:：]?\s*(20\d{2})[-./年](\d{1,2})[-./月](\d{1,2})日?/g; let m;
  while ((m = re.exec(t))) { const d = new Date(+m[2], +m[3] - 1, +m[4]); if (isNaN(d) || d.getMonth() !== +m[3] - 1) continue; out.push({ d, label: (m[1] || "").replace(/[【】\[\]]/g, "").trim() || "节点" }); }
  const dl = parseD(c.deadline); if (dl) out.push({ d: dl, label: "最终截止", main: 1 });
  const mp = new Map(); out.forEach(x => { const k = ymd(x.d); if (!mp.has(k) || x.main) mp.set(k, x); });
  return [...mp.values()].sort((a, b) => a.d - b.d).filter(x => /截止|征|报名|提交|初审|入围|公布|颁奖|举办|展映|开幕|闭幕|节点|阶段|early|regular|late|final/i.test(x.label) || x.main).slice(-7);
}
function linkChip(name, u, ic) {
  if (!u) return "";
  const mail = /^mailto:/.test(u); const host0 = mail ? u.slice(7) : u.replace(/^https?:\/\/(www\.)?/, "").split(/[/?#]/)[0];
  const host = /feishu|larksuite/.test(host0) ? "官方报名文档（飞书）" : /filmfreeway/.test(host0) ? "FilmFreeway 官方投递页" : /festhome/.test(host0) ? "Festhome 官方投递页" : /mp\.weixin/.test(host0) ? "官方公众号公告" : host0;
  return `<a class="lchip" href="${esc(u)}" ${mail ? "" : 'target="_blank" rel="noopener"'}><span class="lic">${mail ? I.mail : I[ic]}</span><span class="lt"><small>${name}</small><b>${esc(host)}</b></span>${I.ext}</a>`;
}
const VMAP = { ok: ["check", "官网已核实"], fixed: ["edit", "已按官网更正"], warn: ["alert", "需要你再确认"], none: ["info", "未自动核实"] };
function fillDrawer(id) {
  const c = byId.get(id); const l = daysLeft(c), idx = listCtx.indexOf(id), ms = milestones(c), cny = cashCNY(c);
  const [vic, vt] = VMAP[c.verified];
  const sub = c.submit, mail = /^mailto:/.test(sub || "");
  $("#drawer").innerHTML = `
  <div class="dr-head">
    <div class="dr-bar">${gB(c)}<span style="font-size:12.5px;color:var(--ink-3);font-weight:550">${GN[c.grade]} · ${STATE[c.status]}</span>${isFav(id) ? '<span class="tag new">已收藏</span>' : ""}<span class="sp"></span>
      ${idx >= 0 ? `<div class="dr-nav"><button data-nav="-1" ${idx <= 0 ? "disabled" : ""} aria-label="上一个">${I.up}</button><span class="num">${idx + 1} / ${listCtx.length}</span><button data-nav="1" ${idx >= listCtx.length - 1 ? "disabled" : ""} aria-label="下一个">${I.down}</button></div>` : ""}
      <button class="icon-btn" data-act="closeDrawer" aria-label="关闭">${I.x}</button></div>
    <h2>${esc(c.name)}</h2>
    <div class="dr-org">${c.organizer ? `<span>${esc(c.organizer)}</span>` : ""}${c.region ? `<span>${esc(c.region)}</span>` : ""}</div>
    <div class="dr-cd"><div class="big ${urg(l)}">${l == null ? "<b style='font-size:24px'>截止待公布</b>" : l < 0 ? "<b style='font-size:24px'>已截止</b>" : l === 0 ? "<b>今天</b><small>截止</small>" : `<b class="num">${l}</b><small>天后截止</small>`}</div>
      <div class="meta">截止 <b>${full(c.deadline)}</b><br>${esc(c.category || "类别未注明")} · ${esc(c.topic || "命题情况未注明")}</div></div>
  </div>
  <div class="dr-body">
    <div class="vbox ${c.verified}"><span class="vi">${I[vic]}</span><div><b>${vt}</b><span>${esc(c.verifyNote || "需要登录或无法自动读取的页面，请以主办方官网为准。")}</span></div></div>
    <dl class="facts">
      <div class="fact wide prize"><dt>${I.trophy}最高奖励${cny > 1 ? `<span class="cny">${fmtCNY(cny)}</span>` : ""}</dt><dd>${esc(c.prize)}</dd></div>
      <div class="fact"><dt>${I.ticket}报名费</dt><dd>${esc(c.fee)}</dd></div>
      <div class="fact"><dt>${I.target}命题</dt><dd>${esc(c.topic || "未注明")}</dd></div>
      <div class="fact"><dt>${I.film}类别</dt><dd>${esc(c.category || "未注明")}</dd></div>
      <div class="fact"><dt>${I.pin}地区</dt><dd>${esc(c.region || "未注明")}</dd></div>
    </dl>
    ${c.site || sub ? `<div class="links">${linkChip("官网", c.site, "globe")}${sub && sub !== c.site ? linkChip(mail ? "邮箱投稿" : "投递入口", sub, "ext") : ""}</div>` : `<div class="vbox warn"><span class="vi">${I.alert}</span><div><b>暂无官方链接</b><span>主办方暂未公布官网或投递入口，请关注后续公告。</span></div></div>`}
    ${ms.length > 1 ? `<div class="dr-h">时间节点</div><ul class="tl-list">${(() => { const nx = ms.findIndex(x => x.d >= T0); return ms.map((x, i) => `<li class="${x.d < T0 ? "done" : i === nx ? "next" : ""}"><i></i><b>${ymd(x.d)}</b><span>${esc(x.label)}</span></li>`).join(""); })()}</ul>` : ""}
    ${c.desc ? `<div class="dr-h">赛事说明</div><div class="prose">${esc(c.desc)}</div>` : ""}
    ${c.notes ? `<div class="dr-h">档期与备注</div><div class="prose">${esc(c.notes)}</div>` : ""}
  </div>
  <div class="dr-foot">${sub ? `<a class="btn pri" href="${esc(sub)}" ${mail ? "" : 'target="_blank" rel="noopener"'}>${mail ? "发邮件投稿" : "去投递"}${I.ext}</a>` : `<button class="btn pri" disabled style="opacity:.5">暂无投递入口</button>`}
    <button class="btn" data-act="ics1" title="加入日历，提前 3 天提醒">${I.bell}<span>提醒</span></button>
    <button class="btn" data-fav="${id}" title="收藏">${I.star}<span>${isFav(id) ? "已收藏" : "收藏"}</span></button>
    <button class="btn" data-act="share" title="复制链接">${I.link}<span>分享</span></button></div>`;
}
function navDrawer(dir) { const i = listCtx.indexOf(curId) + dir; if (i < 0 || i >= listCtx.length) return; curId = listCtx[i]; history.replaceState(history.state, "", `#/c/${encodeURIComponent(curId)}`); fillDrawer(curId); $("#drawer .dr-body").scrollTop = 0; }

/* ═════════ 搜索面板 ═════════ */
let sSel = 0, sItems = [];
function openSearch(q = "") { $("#search").classList.add("on"); const i = $("#sq"); i.value = q; sSel = 0; sRender(); setTimeout(() => i.focus(), 10); }
function closeSearch() { $("#search").classList.remove("on"); }
function sRender() {
  const q = $("#sq").value.trim().toLowerCase();
  const pages = ROUTES.filter(r => !q || r.n.includes(q)).map(r => ({ t: "page", ...r }));
  const acts = [["只看 7 天内截止", () => go("contests", { when: "7" })], ["只看免费报名", () => go("contests", { fee: "free" })], ["只看 S / A 级", () => go("contests", { grade: "SA" })], ["复制今日简报", () => copy(briefText(false), "已复制今日简报")], ["切换深浅色", toggleTheme]]
    .filter(([n]) => !q || n.toLowerCase().includes(q)).map(([n, f]) => ({ t: "act", n, f }));
  let cs;
  if (q) { const ws = q.split(/\s+/); cs = C.map(c => { const nm = c.name.toLowerCase(); return [nm.startsWith(q) ? 3 : nm.includes(q) ? 2 : ws.every(w => hay(c).includes(w)) ? 1 : 0, c]; }).filter(x => x[0]).sort((a, b) => b[0] - a[0] || byDl(a[1], b[1])).slice(0, 12).map(x => ({ t: "c", c: x[1] })); }
  else cs = live().filter(c => daysLeft(c) != null).sort(byDl).slice(0, 6).map(c => ({ t: "c", c }));
  const fs = q ? FEST.filter(f => `${f.name} ${f.place}`.toLowerCase().includes(q)).slice(0, 4).map(f => ({ t: "f", f })) : [];
  sItems = [...cs, ...fs, ...pages, ...acts]; sSel = Math.min(sSel, Math.max(0, sItems.length - 1));
  let h = "", g = "";
  sItems.forEach((it, i) => {
    const grp = it.t === "c" ? (q ? "赛事" : "最近截止") : it.t === "f" ? "知名电影节" : it.t === "page" ? "页面" : "快捷操作";
    if (grp !== g) { g = grp; h += `<div class="s-group">${grp}</div>`; }
    const l = it.t === "c" ? daysLeft(it.c) : null;
    const inner = it.t === "c" ? `${gB(it.c)}<span class="t">${hl(it.c.name, q)}</span><span class="d">${l == null ? "待公布" : l < 0 ? "已截止" : l === 0 ? "今天截止" : l + " 天"}</span>` : it.t === "f" ? `${I.globe}<span class="t">${esc(it.f.name)}</span><span class="d">${esc(it.f.when)}</span>` : `${I[it.i] || I.r}<span class="t">${it.n}</span>`;
    h += `<div class="s-item ${i === sSel ? "on" : ""}" data-si="${i}">${inner}</div>`;
  });
  $("#sres").innerHTML = h || `<div class="s-empty">没有找到「${esc(q)}」</div>`;
  $(".s-item.on")?.scrollIntoView?.({ block: "nearest" });
}
function sGo(i) { const it = sItems[i]; if (!it) return; closeSearch(); if (it.t === "c") openDrawer(it.c.id); else if (it.t === "f") go("festivals"); else if (it.t === "page") go(it.k); else it.f(); }
$("#sq").addEventListener("input", () => { sSel = 0; sRender(); });
$("#sq").addEventListener("keydown", e => {
  if (e.key === "ArrowDown") { e.preventDefault(); sSel = Math.min(sItems.length - 1, sSel + 1); sRender(); }
  else if (e.key === "ArrowUp") { e.preventDefault(); sSel = Math.max(0, sSel - 1); sRender(); }
  else if (e.key === "Enter") { e.preventDefault(); sGo(sSel); }
  else if (e.key === "Escape") closeSearch();
});
$("#sres").addEventListener("click", e => { const el = e.target.closest("[data-si]"); if (el) sGo(+el.dataset.si); });
$("#search").addEventListener("click", e => { if (e.target.id === "search") closeSearch(); });

/* ═════════ 主题 ═════════ */
function applyTheme() { let t = localStorage.getItem("aicontest.v6.theme") || "auto"; if (t === "auto") t = matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"; document.documentElement.dataset.theme = t; }
function toggleTheme() { const n = document.documentElement.dataset.theme === "dark" ? "light" : "dark"; localStorage.setItem("aicontest.v6.theme", n); applyTheme(); if (R.page === "insights") render(false); }
matchMedia("(prefers-color-scheme: dark)").addEventListener?.("change", applyTheme);

/* ═════════ 事件 ═════════ */
document.addEventListener("click", e => {
  const t = e.target;
  const fv = t.closest("[data-fav]"); if (fv) { e.preventDefault(); e.stopPropagation(); toggleFav(fv.dataset.fav); return; }
  if (t.closest("[data-stop]")) { e.stopPropagation(); return; }
  const a = t.closest("[data-act]")?.dataset.act;
  if (a) {
    if (a === "search") return openSearch();
    if (a === "closeSearch") return closeSearch();
    if (a === "closeDrawer") return closeDrawer();
    if (a === "theme") return toggleTheme();
    if (a === "top") return scrollTo({ top: 0, behavior: "smooth" });
    if (a === "ftoggle") { fOpen = !fOpen; $("#filters").classList.toggle("open", fOpen); if (!fOpen) $(".res-bar")?.scrollIntoView({ behavior: "smooth", block: "start" }); return; }
    if (a === "reset") return go("contests", {}, true);
    if (a === "clearq") { e.preventDefault(); refocus = true; return go("contests", clean({ ...fp(), q: "" }), true); }
    if (a === "ics") { const scope = R.params.scope || "all"; const l = C.filter(c => isOpen(c) && c.deadline && (scope === "top" ? G[c.grade] <= 2 : scope === "fav" ? isFav(c.id) : true)); exportICS(l, "ai-contest-deadlines.ics"); return toast(`已导出 ${l.length} 个截止日，每个提前 3 天提醒`); }
    if (a === "ics1") { const c = byId.get(curId); if (!c.deadline) return toast("这个赛事的截止日还没公布"); exportICS([c], `deadline-${c.id}.ics`); return toast("已生成日历提醒"); }
    if (a === "share") return copy(location.href.split("#")[0] + `#/c/${encodeURIComponent(curId)}`, "链接已复制");
    if (a === "copybrief") return copy(briefText(false), "已复制，可以直接发群");
    if (a === "copymd") return copy(briefText(true), "已复制 Markdown");
    if (a === "print") return print();
  }
  const f = t.closest("[data-f]"); if (f) { const p = fp(); p[f.dataset.f] = f.dataset.v; go("contests", clean(p), true); return; }
  const vw = t.closest("[data-view]"); if (vw) { P.view = vw.dataset.view; save(); render(false); return; }
  const dy = t.closest("[data-day]"); if (dy) { go("home", R.params.day === dy.dataset.day ? {} : { day: dy.dataset.day }, true); return; }
  const cl = t.closest("[data-cal]"); if (cl) { const n = +cl.dataset.cal; calM = n === 0 ? new Date(T0.getFullYear(), T0.getMonth(), 1) : new Date(calM.getFullYear(), calM.getMonth() + n, 1); const p = { ...R.params }; delete p.day; go("calendar", p, true); return; }
  const sc = t.closest("[data-scope]"); if (sc) { go("calendar", sc.dataset.scope === "all" ? {} : { scope: sc.dataset.scope }, true); return; }
  const fc = t.closest("[data-fcat]"); if (fc) { go("festivals", fc.dataset.fcat ? { cat: fc.dataset.fcat } : {}, true); return; }
  const nv = t.closest("[data-nav]"); if (nv) { navDrawer(+nv.dataset.nav); return; }
  const cd = t.closest("[data-cday]"); if (cd && !t.closest("[data-open]")) { const p = { ...R.params, day: cd.dataset.cday }; go("calendar", p, true); setTimeout(() => $(".agenda")?.scrollIntoView({ behavior: "smooth", block: "start" }), 60); return; }
  const op = t.closest("[data-open]"); if (op && !t.closest("a[href]:not([data-open])")) { openDrawer(op.dataset.open); return; }
});
let kIdx = -1;
document.addEventListener("keydown", e => {
  const typing = /INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName);
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); $("#search").classList.contains("on") ? closeSearch() : openSearch(); return; }
  if (e.key === "Escape") { if ($("#search").classList.contains("on")) closeSearch(); else if ($("#drawer").classList.contains("on")) closeDrawer(); else if (typing) document.activeElement.blur(); return; }
  if (typing || $("#search").classList.contains("on")) return;
  if (e.key === "/") { e.preventDefault(); openSearch(); return; }
  if ($("#drawer").classList.contains("on")) {
    if (["ArrowLeft", "ArrowUp"].includes(e.key)) { e.preventDefault(); navDrawer(-1); }
    if (["ArrowRight", "ArrowDown"].includes(e.key)) { e.preventDefault(); navDrawer(1); }
    if (e.key.toLowerCase() === "s") toggleFav(curId);
    return;
  }
  if (e.key === "Enter" && document.activeElement?.matches?.("[data-open]") && !document.activeElement.matches("button")) { e.preventDefault(); openDrawer(document.activeElement.dataset.open); return; }
  const items = $$("#view .row, #view .card"); if (!items.length) return;
  if (e.key === "j" || e.key === "k") { e.preventDefault(); kIdx = Math.max(0, Math.min(items.length - 1, kIdx + (e.key === "j" ? 1 : -1))); items.forEach((r, i) => r.classList.toggle("kfocus", i === kIdx)); items[kIdx].focus({ preventScroll: true }); items[kIdx].scrollIntoView?.({ block: "center", behavior: "smooth" }); }
  if (e.key.toLowerCase() === "s" && items[kIdx]) toggleFav(items[kIdx].dataset.open);
});
addEventListener("scroll", () => { const h = document.documentElement.scrollHeight - innerHeight; $("#prog").style.transform = `scaleX(${h > 0 ? scrollY / h : 0})`; $("#totop").classList.toggle("on", scrollY > 900); }, { passive: true });
addEventListener("popstate", () => { if (!location.hash.startsWith("#/c/")) closeDrawer(true); });
addEventListener("storage", e => { if (e.key === KEY) { try { Object.assign(P, JSON.parse(e.newValue)); refresh(); } catch {} } });

/* ═════════ 启动 ═════════ */
$("#kbd").textContent = /Mac|iPhone|iPad/.test(navigator.platform) ? "⌘K" : "Ctrl K";
const age = RAW.snapshot ? Math.round((T0 - parseD(RAW.snapshot)) / 864e5) : 0;
if (!C.length) $("#notice").innerHTML = `<div class="notice">${I.alert}暂时没有读取到赛事数据，请稍后刷新。</div>`;
else if (age > 3) $("#notice").innerHTML = `<div class="notice">${I.alert}赛事数据已 ${age} 天未更新，部分截止日可能有变，投递前请先核对官网。</div>`;
applyTheme(); route();
})();
