/* AI赛事助手 v6 —— 以赛事为中心的单页应用（无第三方依赖）
   需求见 docs/01-功能文档.md；数据见 window.AIC（scripts/build.py 生成） */
(() => {
"use strict";

/* ═════════ 数据 ═════════ */
const RAW = window.AIC || { contests: [], festivals: [], snapshot: "" };
const C = RAW.contests, FEST = RAW.festivals;
const byId = new Map(C.map(c => [c.id, c]));

/* ═════════ 工具 ═════════ */
const safeUrl = u => /^(https?:\/\/|mailto:)/i.test(String(u || "").trim()) ? String(u).trim() : "";
const own = (o, k) => k != null && Object.prototype.hasOwnProperty.call(o, k);
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
  timeline: svg('<path d="M3 5h7M6 10h10M4 15h6"/><circle cx="12.5" cy="5" r="1.6"/><circle cx="17" cy="10" r="1.6"/><circle cx="11.5" cy="15" r="1.6"/>'),
};

/* ═════════ 日期 ═════════ */
const T0 = (() => { const p = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Shanghai" }).format(new Date()).split("-"); return new Date(+p[0], +p[1] - 1, +p[2]); })();
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
const isOpen = c => c.status !== "closed" && c.cycle !== "ended" && (daysLeft(c) == null || daysLeft(c) >= 0);
const isFree = c => /^(免费|0元|￥0|¥0)/.test(c.fee);
const NOCASH = /^(无现金|非现金|无固定现金|非奖金制|官方未公布|未公布|待核实|积分非现金|荣誉|数字桂冠|无（|无$)/;
const hasCash = c => !NOCASH.test(c.prize) && !/无现金|非现金|不设现金/.test(c.prize) && /[¥￥$€£₹]|\d\s*万|\d\s*元|美元|澳元|港元|现金/.test(c.prize);
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
const isPool = c => /总奖金|奖金池|总池|合计|总额/.test(c.prize.split(/[：:（(]/)[0] + c.prize.slice(0, 12));
const cnyLabel = c => (isPool(c) ? "总池 " : "") + fmtCNY(cashCNY(c));
const fmtCNY = v => v >= 1e4 ? `≈ ¥${(v / 1e4).toFixed(v >= 1e5 ? 0 : 1)} 万` : v > 1 ? `≈ ¥${Math.round(v)}` : "";
const CN = /中国|北京|上海|深圳|广州|广东|山东|香港|澳门|徽州|安徽|湖南|长沙|杭州|浙江|江苏|四川|成都|重庆|大湾区|内地|广西|天津|武汉|福建|厦门|西安|青岛|南京|苏州|海南|眉山|海门|黄山/;
const isCN = c => CN.test(`${c.region} ${c.name} ${c.organizer}`) && !/海外/.test(c.name);
const FORMS = [["短片", /短片|short/i], ["短剧", /短剧|漫剧/], ["长片", /长片|feature/i], ["广告", /广告|\bads?\b|品牌/i], ["MV", /\bMV\b|音乐视频|music video/i], ["动画", /动画|动漫|animation/i], ["公益", /公益|for good|正向/i]];
const formsOf = c => { const t = `${c.name} ${c.category} ${c.desc}`; return FORMS.filter(([, r]) => r.test(t)).map(([n]) => n); };
const hay = c => `${c.name} ${c.organizer} ${c.region} ${c.category} ${c.desc} ${c.prize}`.toLowerCase();
const byDl = (a, b) => (daysLeft(a) ?? 1e4) - (daysLeft(b) ?? 1e4) || G[a.grade] - G[b.grade];
const live = () => C.filter(isOpen);
const STATE = { open: "征集中", pending: "截止待公布", soon: "即将开放", closed: "已截止" };
// cycle：ended＝本届已结束、下届未公布（不可投，默认不显示）；rolling＝常年滚动随时可投
const stateText = c => c.cycle === "ended" ? "本届已结束" : c.cycle === "rolling" ? "常年开放" : (c.status === "pending" && c.changeLabel ? c.changeLabel : (STATE[c.status] || ""));

/* ═════════ 本地偏好（只存主题、视图、收藏） ═════════ */
const KEY = "aicontest.v6";
const P = (() => { try { const v = JSON.parse(localStorage.getItem(KEY)); return v && typeof v === "object" && !Array.isArray(v) ? v : {}; } catch { return {}; } })();
if (!Array.isArray(P.fav)) P.fav = []; if (!/^(list|grid)$/.test(P.view)) P.view = "list";
P.fav ||= []; P.view ||= "list";
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(P)); } catch {} };
const isFav = id => P.fav.includes(id);
delete P.seen; save();
const addedAgo = c => { const d = parseD(c.added); return d ? Math.round((T0 - d) / 864e5) : null; };
const isNew = c => { const a = addedAgo(c); return a != null && a >= 0 && a <= 2; };

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
  if (c.status === "pending" || c.status === "soon") t.push(`<span class="tag state">${stateText(c)}</span>`);
  if (isNew(c)) t.push(`<span class="tag new">${addedAgo(c) === 0 ? "今日上新" : "上新"}</span>`);
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
    <div class="row-prize" title="${esc(c.prize)}"><em>${cashCNY(c) > 1 ? cnyLabel(c) : "最高奖励"}</em>${esc(c.prize)}</div>
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
const secH = (title, sub, right = "") => `<div class="sec-h"><div><h2>${title}</h2>${sub ? `<p>${sub}</p>` : ""}</div>${right ? `<div class="right">${right}</div>` : ""}</div>`;
const more = (href, t = "查看全部") => `<a class="more" href="${href}">${t}${I.r}</a>`;

/* ═════════ 路由 ═════════ */
const ROUTES = [
  { k: "home", n: "截止雷达", i: "radar" }, { k: "contests", n: "全部赛事", i: "list" }, { k: "timeline", n: "时间线", i: "timeline" }, { k: "calendar", n: "截止日历", i: "cal" },
  { k: "insights", n: "数据洞察", i: "chart" }, { k: "brief", n: "今日简报", i: "doc" }, { k: "festivals", n: "知名电影节", i: "globe" }, { k: "about", n: "收录与分级", i: "info" },
];
const safeDec = s => { try { return decodeURIComponent(s); } catch { return s; } };
const parseHash = () => { const h = location.hash.replace(/^#\/?/, ""); const [p, q] = h.split("?"); const parts = (p || "home").split("/"); const params = Object.create(null); for (const [k, v] of new URLSearchParams(q || "")) if (!/^(__proto__|constructor|prototype)$/.test(k)) params[k] = v.slice(0, 200); return { page: parts[0] || "home", arg: parts[1] ? safeDec(parts[1]) : null, params }; };
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
  const sa = L.filter(c => G[c.grade] <= 1), free = L.filter(isFree);
  const fc = L.filter(c => isFree(c) && hasCash(c));
  const sel = R.params.day || "";
  const hot = dated.slice(0, 5);
  const RK = ["rk1", "rk2", "rk3"];
  const left = c => { const l = daysLeft(c); return l === 0 ? "今天" : l + " 天"; };
  let tl = "";
  for (let i = 0; i < 14; i++) {
    const d = new Date(T0); d.setDate(d.getDate() + i); const k = ymd(d);
    const ev = L.filter(c => c.deadline === k).sort((a, b) => G[a.grade] - G[b.grade]);
    tl += `<button class="dcol ${i === 0 ? "t" : ""} ${sel === k ? "sel" : ""} ${ev.length ? "has" : ""}" data-day="${k}" aria-label="${md(k)} ${ev.length} 个截止">
      <span class="tip">${md(k)} · ${ev.length ? ev.length + " 个截止" : "无截止"}</span>
      <div class="bars">${ev.length ? ev.slice(0, 6).map(c => `<i class="b-${c.grade}"></i>`).join("") : '<i class="nil"></i>'}</div>
      <b>${d.getDate()}</b><span>${i === 0 ? "今天" : WD[d.getDay()]}</span></button>`;
  }
  const selList = sel ? L.filter(c => c.deadline === sel).sort((a, b) => G[a.grade] - G[b.grade]) : [];
  const feed = dated.filter(c => daysLeft(c) <= 75).slice(0, 30);
  const days = []; feed.forEach(c => { const g = days[days.length - 1]; if (g && g.k === c.deadline) g.list.push(c); else days.push({ k: c.deadline, list: [c] }); });
  const first = s => String(s || "").split(/\n+/)[0].replace(/^【[^】]*】/, "");
  const item = c => `<li class="slot"><span class="slot-t tier-${c.grade}">${c.grade} 级</span><span class="rail" aria-hidden="true"><i></i></span>
    <article class="fi" data-open="${c.id}" tabindex="0" role="button" aria-label="${esc(c.name)}">
      <header class="fi-src"><span class="fi-org">${esc(c.organizer || c.region || "主办方未注明")}</span>${c.region && c.organizer ? `<span class="fi-reg">· ${esc(c.region)}</span>` : ""}<span class="fi-r">${favBtn(c)}</span></header>
      <h3>${esc(c.name)}</h3>
      ${c.desc ? `<p class="fi-sum">${esc(first(c.desc))}</p>` : ""}
      <div class="fi-tags">${isFree(c) ? "" : `<span>报名 ${esc(cut(c.fee, 22))}</span>`}${tags(c, 4)}</div>
      <div class="fi-why"><span>最高奖励：</span>${esc(c.prize)}${cashCNY(c) > 1 ? `<em>${cnyLabel(c)}</em>` : ""}</div>
    </article></li>`;
  return `
  <div class="page-h"><div class="kicker"><i></i>截止雷达</div>
    <h1>${w3.length ? `${w3.length} 个赛事将在 3 天内截止` : w7.length ? `本周有 ${w7.length} 个赛事截止` : "近期没有赛事截止"}</h1>
    <p class="lede">${T0.getMonth() + 1}月${T0.getDate()}日 周${WD[T0.getDay()]} · 未截止 ${L.length} 个 AI 影像赛事（在征 ${L.filter(c => c.status === "open" || c.status === "soon").length} · 待公布 ${L.filter(c => c.status === "pending").length}），截止日以主办方官网为准。</p></div>
  ${(() => { const b = briefData(); const li = (c, mode) => `<li><a data-open="${c.id}" tabindex="0" role="button">${gB(c)}<span class="duo-t">${esc(c.name)}</span><span class="duo-m ${mode === "due" ? urg(daysLeft(c)) : "acc"}">${mode === "due" ? (daysLeft(c) === 0 ? "今天" : daysLeft(c) + " 天") : md(c.added)}</span></a></li>`;
    const box = (cls, t, a, mode, href, e) => `<div class="duo-c ${cls}"><div class="duo-h"><b>${t}</b><em class="num">${a.length}</em><a href="${href}">全部${I.r}</a></div>${a.length ? `<ol>${a.slice(0, 5).map(c => li(c, mode)).join("")}</ol>` : `<p class="duo-e">${e}</p>`}</div>`;
    return `<section class="duo" aria-label="今日速览">${box("due", b.dueT, b.due, "due", `#/contests?when=${b.dueK === "today" ? "3" : b.dueK}`, "近 7 天没有截止")}${box("new", b.freshT, b.fresh, "new", `#/contests?new=${b.freshK}&sort=new`, "近 7 天没有新开征")}<a class="duo-share" href="#/brief">${I.doc}<span><b>生成今日分享卡片</b><small>竖版长图 / 3:4 / 横版，一键保存</small></span>${I.r}</a></section>`; })()}
  <section class="hero">
    <div class="lead">
      <div class="lead-h"><h2><span class="ping" aria-hidden="true"><i></i><i></i></span>即将截止</h2>
        ${hot[0] ? `<span class="lead-cd">距第 1 个截止 <span class="clock" id="clock" data-to="${hot[0].deadline}"></span></span>` : ""}</div>
      ${hot.length ? `<ol class="hot">${hot.map((c, i) => `<li><a data-open="${c.id}" tabindex="0" role="button">
        <span class="rk ${RK[i] || ""}">${i + 1}</span>
        <span class="hot-t">${esc(c.name)}</span>
        <span class="hot-g">${gB(c)}</span>
        <span class="hot-d ${daysLeft(c) <= 3 ? "u-red" : ""}"><b class="num">${left(c)}</b><small>${md(c.deadline)}</small></span></a></li>`).join("")}</ol>` : empty("暂时没有已公布截止日的赛事")}
      <a class="lead-more" href="#/contests">全部 ${L.length} 个赛事${I.r}</a>
    </div>
    <div class="pulse">
      <div class="kpis">
        <a class="kpi" href="#/contests?when=7"><span>7 天内截止</span><b class="num ${w7.length ? "hot" : ""}">${w7.length}</b><i>3 天内 ${w3.length} 个</i></a>
        <a class="kpi" href="#/contests?grade=SA"><span>S / A 级</span><b class="num">${sa.length}</b><i>占未截止 ${Math.round(sa.length / Math.max(1, L.length) * 100)}%</i></a>
        <a class="kpi" href="#/contests?fee=free"><span>免费报名</span><b class="num">${free.length}</b><i>含现金奖 ${fc.length} 个</i></a>
        <a class="kpi" href="#/contests?when=tba"><span>截止待公布</span><b class="num">${L.length - dated.length}</b><i>长期征集</i></a>
      </div>
      <div class="tl-box"><div class="tl-head"><b>未来 14 天</b><a class="tl-all" href="#/timeline">完整时间线${I.r}</a><span class="legend"><span><i class="b-S"></i>S</span><span><i class="b-A"></i>A</span><span><i class="b-B"></i>B</span><span><i class="b-C"></i>C</span></span></div>
        <div class="tl">${tl}</div></div>
    </div>
  </section>
  ${sel ? `<section class="sec"><div class="dayh"><b>${md(sel)}</b><span>周${WD[parseD(sel).getDay()]} · ${selList.length} 个截止</span><a class="more" href="#/home">收起${I.x}</a></div><div class="list">${selList.length ? selList.map(c => row(c)).join("") : empty(`${md(sel)} 没有截止的赛事`, "", "cal")}</div></section>` : ""}
  <section class="feed" aria-label="截止时间线">
    ${days.map(g => { const l = daysLeft(g.list[0]); return `<div class="dayh"><b>${l === 0 ? "今天" : l === 1 ? "明天" : md(g.k)}</b><span>${l > 1 ? "" : md(g.k) + " · "}周${WD[parseD(g.k).getDay()]} · <span class="num">${g.list.length}</span> 个截止</span><em class="${l <= 3 ? "u-red" : ""}">${l === 0 ? "今天截止" : `还有 ${l} 天`}</em></div><ol class="slots">${g.list.map(item).join("")}</ol>`; }).join("")}
    <div class="feed-end"><a class="pill-btn" href="#/contests">查看全部赛事${I.r}</a></div>
  </section>`;
};
V.home.after = () => {
  const el = $("#clock"); if (!el) return;
  const to = parseD(el.dataset.to); if (!to) return; to.setHours(23, 59, 59, 0);
  const p = n => String(n).padStart(2, "0");
  const up = () => { let ms = Math.max(0, to - new Date()); const d = Math.floor(ms / 864e5); ms -= d * 864e5; const h = Math.floor(ms / 36e5); ms -= h * 36e5; const m = Math.floor(ms / 6e4); const s = Math.floor((ms - m * 6e4) / 1e3);
    el.textContent = `${d ? d + " 天 " : ""}${p(h)}:${p(m)}:${p(s)}`; };
  up(); tick = setInterval(up, 1000);
};

/* ═════════ 页面：全部赛事 ═════════ */
const FD = { q: "", when: "open", grade: "", fee: "", cash: "", topic: "", region: "", form: "", fav: "", new: "", sort: "dl" };
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
    if (p.new) { const a = addedAgo(c); if (a == null || a < 0 || a > +p.new - 1) return false; }
    if (q && !q.split(/\s+/).every(w => hay(c).includes(w))) return false;
    return true;
  });
}
const SORT = { dl: ["截止最近", byDl], grade: ["分级最高", (a, b) => G[a.grade] - G[b.grade] || byDl(a, b)], prize: ["奖金最高", (a, b) => cashCNY(b) - cashCNY(a) || byDl(a, b)], new: ["最新开征", (a, b) => String(b.added || "").localeCompare(String(a.added || "")) || byDl(a, b)], name: ["按名称", (a, b) => a.name.localeCompare(b.name, "zh")] };
const LABEL = { when: { "3": "3 天内", "7": "7 天内", "30": "30 天内", tba: "截止待公布", closed: "已截止", all: "全部（含已截止）" }, grade: { SA: "S + A 级", S: "S 级", A: "A 级", B: "B 级", C: "C 级" }, fee: { free: "免费报名" }, cash: { "1": "有现金奖" }, topic: { "命题": "命题", "自由投稿": "自由投稿" }, region: { cn: "国内", intl: "海外 / 线上" }, new: { "1": "今日上新", "3": "近 3 天上新", "7": "近 7 天上新" }, fav: { "1": "已收藏" } };
const clean = p => Object.fromEntries(Object.entries(p).filter(([k, v]) => v !== "" && v != null && FD[k] !== v && !k.startsWith("_")));
V.contests = () => {
  const p = fp(), res = filter(p).sort((own(SORT, p.sort) ? SORT[p.sort] : SORT.dl)[1]);
  const n = (k, v) => filter({ ...p, [k]: v }).length;
  const chip = (k, v, label, toggle = false) => { const on = (p[k] || "") === v && !(toggle && !v); const c = n(k, v); return `<button class="chip ${on ? "on" : ""} ${!c && !on ? "zero" : ""}" data-f="${k}" data-v="${toggle && on ? "" : v}">${label}<span class="n">${c}</span></button>`; };
  const act = Object.keys(FD).filter(k => !["q", "sort"].includes(k) && (p[k] || "") !== FD[k]);
  const view = P.view;
  return `
  <div class="page-h"><div class="kicker">全部赛事</div><h1>${res.length} 个 AI 影像赛事</h1><p class="lede">全表共 ${C.length} 个，其中 ${C.filter(c => !isOpen(c)).length} 个已截止——默认收起，点下方「含已截止」可查看。筛选条件会写进网址，复制链接即可分享当前结果。</p></div>
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
      <div class="f-group"><label>上新</label><div class="chips">${chip("new", "1", "今日上新", true)}${chip("new", "3", "近 3 天", true)}${chip("new", "7", "近 7 天", true)}</div></div>
      <div class="f-group"><label>形态</label><div class="chips">${FORMS.map(([nm]) => chip("form", nm, nm, true)).join("")}</div></div>
      <button class="btn pri f-done" data-act="ftoggle">查看 ${res.length} 个结果</button>
    </div>
  </div>
  <div class="res-bar"><span>找到 <b class="num">${res.length}</b> 个 · ${(own(SORT, p.sort) ? SORT[p.sort] : SORT.dl)[0]}</span>
    <div class="active-f">${act.map(k => `<span class="af">${esc((own(LABEL, k) && own(LABEL[k], p[k]) && LABEL[k][p[k]]) || p[k])}<button data-f="${k}" data-v="${FD[k]}" aria-label="移除">${I.x}</button></span>`).join("")}${act.length || p.q ? `<button class="link-btn" data-act="reset">清空筛选</button>` : ""}</div></div>
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

/* ═════════ 页面：时间线（全景甘特 + 每日动态） ═════════ */
// 全景：每个赛事一行，横条从「开征日」画到「截止日」，竖线是今天；按截止月份分组。
// 动态：按天排的事件流——哪天上新、哪天截止、哪天改期，一眼看完。
const TLD = { mode: "gantt", zoom: "60", grade: "", fee: "", new: "", q: "", past: "" };
const ZOOM = { "30": ["30 天", 5, 30], "60": ["60 天", 7, 60], "180": ["半年", 14, 180], "all": ["全部", 21, 0] };
const tlp = () => ({ ...TLD, ...R.params });
function tlPool(p) {
  const q = (p.q || "").trim().toLowerCase();
  return C.filter(c => {
    if (p.past ? c.status === "closed" && daysLeft(c) != null && daysLeft(c) < -30 : !isOpen(c)) return false;
    if (p.grade && !p.grade.includes(c.grade)) return false;
    if (p.fee === "free" && !isFree(c)) return false;
    if (p.new) { const a = addedAgo(c); if (a == null || a < 0 || a > +p.new - 1) return false; }
    if (q && !q.split(/\s+/).every(w => hay(c).includes(w))) return false;
    return true;
  });
}
const addD = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
V.timeline = () => {
  const p = tlp(), mode = p.mode === "feed" ? "feed" : "gantt";
  const pool = tlPool(p);
  const ch = (k, v, label, toggle) => { const on = (p[k] || "") === v && !(toggle && !v); return `<button class="chip ${on ? "on" : ""}" data-tl="${k}:${toggle && on ? "" : v}">${label}</button>`; };
  const head = `
  <div class="page-h"><div class="kicker">时间线</div><h1>${mode === "gantt" ? `${pool.length} 个赛事的征集期一览` : "每天发生了什么：上新、截止、改期"}</h1>
    <p class="lede">${mode === "gantt" ? "每一行是一个赛事：横条从开征那天画到截止那天，红色竖线是今天。越靠左越急，点任意一行看详情。" : "以今天为中心，往前看最近的上新和改期，往后看即将到来的截止。"}</p></div>
  <div class="tl-bar-top">
    <div class="seg" role="group" aria-label="时间线视图">${[["gantt", "全景"], ["feed", "每日动态"]].map(([k, n]) => `<button class="${mode === k ? "on" : ""}" data-tl="mode:${k}">${n}</button>`).join("")}</div>
    ${mode === "gantt" ? `<div class="seg" role="group" aria-label="时间范围">${Object.entries(ZOOM).map(([k, [n]]) => `<button class="${(own(ZOOM, p.zoom) ? p.zoom : "60") === k ? "on" : ""}" data-tl="zoom:${k}">${n}</button>`).join("")}</div>` : ""}
    <label class="field tl-q ${p.q ? "has" : ""}">${I.search}<input id="tlq" value="${esc(p.q)}" placeholder="在时间线里找赛事" aria-label="搜索"></label>
  </div>
  <div class="chips tl-chips">${ch("grade", "", "全部分级")}${ch("grade", "SA", "S + A")}${ch("grade", "SAB", "B 级以上")}<span class="sep"></span>${ch("fee", "free", "免费报名", true)}${ch("new", "7", "近 7 天上新", true)}${mode === "gantt" ? ch("past", "1", "含已截止", true) : ""}</div>`;
  return head + (mode === "gantt" ? tlGantt(p, pool) : tlFeed(p, pool));
};
function tlGantt(p, pool) {
  const z = own(ZOOM, p.zoom) ? p.zoom : "60";
  const dated = pool.filter(c => c.deadline).sort(byDl), tba = pool.filter(c => !c.deadline).sort((a, b) => G[a.grade] - G[b.grade]);
  let start = addD(T0, -ZOOM[z][1]);
  if (p.past) { const mn = dated.reduce((m, c) => Math.min(m, +parseD(c.deadline)), +start); if (mn < +start) start = addD(new Date(mn), -5); }
  const maxDl = dated.reduce((m, c) => Math.max(m, parseD(c.deadline)), +addD(T0, 30));
  const end = z === "all" ? addD(new Date(Math.min(maxDl, +addD(T0, 420))), 7) : addD(T0, ZOOM[z][2]);
  const span = end - start, pct = d => Math.max(0, Math.min(100, (d - start) / span * 100));
  const since = parseD(RAW.trackedSince);
  // 刻度：30 天按周、其余按月
  const ticks = [];
  if (z === "30" || z === "60") { for (let d = addD(start, (8 - start.getDay()) % 7); d <= end; d = addD(d, 7)) ticks.push([d, d.getDate() <= 7 ? `${d.getMonth() + 1}月${d.getDate()}日` : `${d.getMonth() + 1}/${d.getDate()}`]); }
  else { for (let d = new Date(start.getFullYear(), start.getMonth() + 1, 1); d <= end; d = new Date(d.getFullYear(), d.getMonth() + 1, 1)) ticks.push([d, d.getMonth() === 0 ? `${d.getFullYear()}年1月` : `${d.getMonth() + 1}月`]); }
  const tp0 = pct(T0), near = z === "all" ? 4 : 3;
  const tickH = ticks.map(([d, t]) => `<span class="tk ${Math.abs(pct(d) - tp0) < near ? "dim" : ""}" style="left:${pct(d)}%">${t}</span>`).join("");
  const grid = ticks.map(([d]) => `<i style="left:${pct(d)}%"></i>`).join("");
  const tp = pct(T0);
  const row = c => {
    const dl = parseD(c.deadline), ad = parseD(c.added), l = daysLeft(c);
    const s0 = ad || since || start, from = Math.max(+s0, +start), to = Math.min(+dl, +end);
    const left = pct(from), w = Math.max(.6, pct(to) - left), cut = +dl > +end, pre = !ad;
    const chg = (c.changes || []).filter(x => parseD(x.date) >= start).map(x => `<b class="tl-chg" style="left:${pct(parseD(x.date))}%" title="${md(x.date)} 截止日调整：${x.from ? md(x.from) : "待公布"} → ${x.to ? md(x.to) : "待公布"}"></b>`).join("");
    return `<div class="tl-r ${l != null && l < 0 ? "past" : ""}" data-open="${c.id}" tabindex="0" role="button" aria-label="${esc(c.name)}，${l == null ? "截止待公布" : l < 0 ? "已截止" : md(c.deadline) + "截止"}">
      <div class="tl-n">${gB(c)}<span class="t">${esc(c.name)}</span>${isNew(c) ? '<span class="tag new">上新</span>' : ""}</div>
      <div class="tl-tr"><span class="tl-b b-${c.grade} ${pre ? "pre" : ""} ${cut ? "cut" : ""} ${urg(l)}" style="left:${left}%;width:${w}%"></span>${ad && +ad >= +start ? `<b class="tl-add" style="left:${pct(ad)}%" title="${md(c.added)}开征"></b>` : ""}${chg}
        <span class="tl-lab ${pct(to) > 78 ? "in" : ""}" style="${pct(to) > 78 ? `right:${100 - pct(to)}%` : `left:${pct(to)}%`}">${cut ? "→ " : ""}${l == null ? "" : l < 0 ? md(c.deadline) : l === 0 ? "今天截止" : `${md(c.deadline)} · 剩 ${l} 天`}</span></div></div>`;
  };
  const groups = []; dated.forEach(c => { const k = c.deadline.slice(0, 7); const g = groups[groups.length - 1]; if (g && g.k === k) g.list.push(c); else groups.push({ k, list: [c] }); });
  const rows = groups.map(g => { const [y, m] = g.k.split("-"); return `<div class="tl-mh"><b>${+y !== T0.getFullYear() ? y + " 年 " : ""}${+m} 月截止</b><span>${g.list.length} 个</span></div>${g.list.map(row).join("")}`; }).join("");
  return `
  <div class="tl-legend" aria-label="图例"><span><i class="lg-bar"></i>征集中（开征 → 截止）</span><span><i class="lg-pre"></i>开征前已开始</span><span><i class="lg-add"></i>开征日</span><span><i class="lg-chg"></i>截止日调整</span><span><i class="lg-today"></i>今天</span><span class="lg-g">${["S", "A", "B", "C"].map(g => `<i class="b-${g}"></i>${g}`).join("")}</span></div>
  <div class="tl-wrap" id="tlwrap"><div class="tl-g" style="--tp:${tp}%">
    <div class="tl-axis"><div class="tl-n">赛事 · 按截止日</div><div class="tl-tr">${tickH}<span class="tk today" style="left:${tp}%">今天</span></div></div>
    <div class="tl-grid" aria-hidden="true">${grid}</div><div class="tl-now" aria-hidden="true"></div>
    ${rows || `<div class="tl-empty">${empty("没有符合条件的赛事", `<button class="link-btn" data-tl="reset:1">清空条件</button>`, "search")}</div>`}
  </div></div>
  ${tba.length ? `<section class="sec tl-tba">${secH(`截止待公布 · ${tba.length} 个`, "长期征集或主办方还没公布截止日，不在时间轴上")}<div class="tba-grid">${tba.map(c => `<a class="tba" data-open="${c.id}" tabindex="0">${gB(c)}<span>${esc(c.name)}</span>${isNew(c) ? '<span class="tag new">上新</span>' : ""}</a>`).join("")}</div></section>` : ""}`;
}
function tlFeed(p, pool) {
  const from = addD(T0, -7), to = addD(T0, 30), ev = {};
  const put = (d, type, c, x) => { const k = ymd(d); (ev[k] ||= []).push({ type, c, x }); };
  const inR = d => d && +d >= +from && +d <= +to;
  pool.forEach(c => {
    const dl = parseD(c.deadline), ad = parseD(c.added);
    if (inR(dl)) put(dl, "due", c);
    if (inR(ad) && +ad <= +T0) put(ad, "new", c);
    (c.changes || []).forEach(x => { const d = parseD(x.date); if (inR(d) && +d <= +T0) put(d, "chg", c, x); });
  });
  const ORD = { chg: 0, new: 1, due: 2 };
  const keys = Object.keys(ev).sort();
  if (!keys.includes(ymd(T0))) keys.push(ymd(T0)), keys.sort();
  const lab = { due: "截止", new: "上新", chg: "改期" };
  const it = e => { const c = e.c, l = daysLeft(c);
    const sub = e.type === "due" ? (l === 0 ? "今天截止" : l < 0 ? "已截止" : `剩 ${l} 天`) : e.type === "new" ? (l == null ? "截止待公布" : `${md(c.deadline)}截止 · 剩 ${l} 天`) : `截止日 ${e.x.from ? md(e.x.from) : "待公布"} → ${e.x.to ? md(e.x.to) : "待公布"}`;
    return `<a class="fd-i ${e.type}" data-open="${c.id}" tabindex="0" role="button"><span class="fd-k">${lab[e.type]}</span>${gB(c)}<span class="fd-t">${esc(c.name)}</span><span class="fd-s">${sub}</span>${isFree(c) ? '<span class="tag free">免费</span>' : ""}</a>`; };
  return `<div class="fd" id="fd">${keys.map(k => { const d = parseD(k), a = (ev[k] || []).sort((x, y) => ORD[x.type] - ORD[y.type] || G[x.c.grade] - G[y.c.grade]); const off = Math.round((d - T0) / 864e5);
    const cnt = t => a.filter(e => e.type === t).length;
    return `<section class="fd-day ${off === 0 ? "today" : off < 0 ? "past" : ""}" ${off === 0 ? 'id="fd-today"' : ""}>
      <div class="fd-d"><b>${off === 0 ? "今天" : off === 1 ? "明天" : off === -1 ? "昨天" : md(k)}</b><span>${off === 0 || Math.abs(off) === 1 ? md(k) + " · " : ""}周${WD[d.getDay()]}</span>
        <div class="fd-c">${cnt("due") ? `<em class="due">截止 ${cnt("due")}</em>` : ""}${cnt("new") ? `<em class="new">上新 ${cnt("new")}</em>` : ""}${cnt("chg") ? `<em class="chg">改期 ${cnt("chg")}</em>` : ""}</div></div>
      <div class="fd-l">${a.length ? a.map(it).join("") : `<p class="fd-none">${off === 0 ? "今天没有截止、上新或改期" : "没有变化"}</p>`}</div></section>`; }).join("")}</div>`;
}
V.timeline.after = () => {
  const q = $("#tlq");
  if (q) { const push = debounce(() => { const pos = q.selectionStart; tlRefocus = pos; go("timeline", tlClean({ ...tlp(), q: q.value }), true); }, 250);
    q.addEventListener("input", () => { q.closest(".field").classList.toggle("has", !!q.value); push(); });
    if (tlRefocus !== false) { const pos = Math.min(tlRefocus, q.value.length); q.focus({ preventScroll: true }); q.setSelectionRange(pos, pos); tlRefocus = false; } }
  // 首次进入「每日动态」时把今天滚到可视区
  const t = $("#fd-today"); if (t && tlScroll) { tlScroll = false; setTimeout(() => { const r = t.getBoundingClientRect(); if (r.top > innerHeight * .6) scrollTo({ top: scrollY + r.top - 140 }); }, 30); }
};
let tlRefocus = false, tlScroll = true;
const tlClean = p => Object.fromEntries(Object.entries(p).filter(([k, v]) => v !== "" && v != null && TLD[k] !== v));

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
  for (const c of list) { const d = parseD(c.deadline); if (!d) continue; const d2 = new Date(d); d2.setDate(d.getDate() + 1); const u = safeUrl(c.submit) || safeUrl(c.site);
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
  const donut = `<svg viewBox="0 0 132 132" class="donut">${gc.map(([g, n]) => { const s = `<circle cx="66" cy="66" r="${R0}" fill="none" stroke="${col[g]}" stroke-width="16" stroke-dasharray="${n / tot * CC} ${CC}" stroke-dashoffset="${-acc / tot * CC}" transform="rotate(-90 66 66)"/>`; acc += n; return s; }).join("")}<text x="66" y="63" text-anchor="middle" font-size="26" font-weight="700" fill="currentColor">${L.length}</text><text x="66" y="84" text-anchor="middle" font-size="11" fill="currentColor" opacity=".55">未截止</text></svg>`;
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
    <div class="ins"><h3>门槛结构</h3>${split(free, L.length - free, "免费", "收费 / 未核实", "var(--accent)", "var(--bg-muted)")}${split(cash, L.length - cash, "有现金奖", "荣誉 / 资源", "var(--gA)", "var(--bg-muted)")}${split(L.length - topic, topic, "自由投稿", "命题", "var(--gB)", "var(--amber)")}${split(cn, L.length - cn, "国内", "海外 / 线上", "var(--accent)", "var(--gC)")}</div>
    <div class="ins"><h3>作品形态 <span>点击查看对应赛事</span></h3><div class="hbars">${forms.map(([nm, v]) => `<a href="#/contests?form=${encodeURIComponent(nm)}"><span>${nm}</span><span class="bwrap"><i style="width:${v / fmx * 100}%"></i></span><b>${v}</b></a>`).join("")}</div></div>
    <div class="ins"><h3>报名成本</h3><div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">${[["免费", free, "var(--accent)"], ["收费", fees, "var(--ink-3)"], ["未核实 / 未公布", L.length - free - fees, "var(--ink-3)"], ["写明现金奖", cash, "var(--hot)"]].map(([nm, v, c]) => `<div style="border:1px solid var(--line);border-radius:10px;padding:12px;background:var(--surface-2)"><b class="num" style="font-size:24px;letter-spacing:-.03em;color:${c}">${v}</b><div style="font-size:12px;color:var(--ink-3)">${nm}</div></div>`).join("")}</div></div>
    <div class="ins w2"><h3>奖金规模排行 <span>按原文折合人民币（含总奖池口径），仅供比较</span></h3><div class="hbars prize">${top.map(c => `<a data-open="${c.id}">${gB(c)}<span>${esc(c.name)}</span><span class="bwrap"><i style="width:${cashCNY(c) / tmx * 100}%"></i></span><b>${cnyLabel(c).replace("≈ ", "")}</b></a>`).join("")}</div></div>
  </div>`;
};

/* ═════════ 页面：今日简报 + 分享卡片 ═════════ */
// 「今日截止」当天为空时自动放宽到 3 天、再到 7 天；「今日上新」为空时放宽到近 3 天、再到近 7 天，保证卡片两栏都不空。
function briefData() {
  const L = live();
  const rng = (a, b) => L.filter(c => { const l = daysLeft(c); return l != null && l >= a && l <= b; }).sort(byDl);
  let due = rng(0, 0), dueT = "今日截止", dueK = "today";
  if (!due.length) { due = rng(0, 3); dueT = "3 天内截止"; dueK = "3"; }
  if (!due.length) { due = rng(0, 7); dueT = "7 天内截止"; dueK = "7"; }
  const nw = n => L.filter(c => { const a = addedAgo(c); return a != null && a >= 0 && a <= n; })
    .sort((a, b) => String(b.added).localeCompare(String(a.added)) || G[a.grade] - G[b.grade] || byDl(a, b));
  let fresh = nw(0), freshT = "今日上新", freshK = "1";
  if (!fresh.length) { fresh = nw(2); freshT = "近 3 天上新"; freshK = "3"; }
  if (!fresh.length) { fresh = nw(6); freshT = "近 7 天上新"; freshK = "7"; }
  const inDue = new Set(due.map(c => c.id));
  const w7 = rng(0, 7);
  return { L, due, dueT, dueK, fresh, freshT, freshK, w7, wk: w7.filter(c => !inDue.has(c.id)),
    mo: rng(8, 30).filter(c => G[c.grade] <= 1),
    fc: L.filter(c => { const l = daysLeft(c); return isFree(c) && hasCash(c) && l != null && l > 7 && l <= 60; }).sort((a, b) => cashCNY(b) - cashCNY(a)).slice(0, 6),
    moved: C.filter(c => c.cycle !== "ended" && (c.changes || []).some(x => { const d = parseD(x.date); return x.to && d && (T0 - d) / 864e5 <= 7 && (T0 - d) >= 0; })).slice(0, 8) };
}
const dayNo = () => String(Math.floor((T0 - new Date(T0.getFullYear(), 0, 0)) / 864e5)).padStart(3, "0");
const dueLabel = c => { const l = daysLeft(c); return l == null ? "截止待公布" : l < 0 ? `已截止 · ${md(c.deadline)}` : l === 0 ? "今天截止" : l === 1 ? `明天截止 · ${md(c.deadline)}` : `还剩 ${l} 天 · ${md(c.deadline)}`; };
const newLabel = (c, short) => { const l = daysLeft(c); const tail = l == null ? "截止待公布" : l === 0 ? "今天截止" : short ? `剩 ${l} 天截止` : `${md(c.deadline)}截止（剩 ${l} 天）`; return `${md(c.added)}上新 · ${tail}`; };
const prizeShort = c => { const p = String(c.prize || "").replace(/\s+/g, " ").split(/[；;。\n]/)[0]; return cashCNY(c) > 1 ? `${cnyLabel(c).replace("≈ ", "")} · ${p}` : p; };
const chgLabel = (x, alt) => `${x.from ? md(x.from) : "新公布"} → ${x.to ? md(x.to) : (alt || "待公布")}`;
// 调整粒度：把「档位 / 赛道 / 阶段」从变更原因里抽出来单独显示。
// 只写「几号 → 几号」看不出改的是整场、某一档还是某条赛道，卡片和列表都要带上这个标签。
const chgScope = c => {
  const s = String(c && c.changeReason || "");
  const grab = k => { const m = s.match(new RegExp(k + "\\s*[：:]\\s*([^；;。\\n]+)")); return m ? m[1] : ""; };
  const cut = t => String(t).split(/[（(，,、；;]/)[0].replace(/[*`]/g, "").trim().slice(0, 18);
  const parts = [grab("档位"), grab("赛道"), grab("阶段")].map(cut).filter(Boolean);
  if (!parts.length) return "";
  const uniq = parts.filter((p, i) => parts.indexOf(p) === i);
  const out = uniq.join(" · ");
  return out.length > 34 ? out.slice(0, 33) + "…" : out;
};
// 原因正文去掉已被 chgScope 抽走的部分，避免同一行重复
const chgRest = c => String(c && c.changeReason || "")
  .replace(/档位\s*[：:][^；;。\n]*[；;。]?/g, "")
  .replace(/赛道\s*[：:][^；;。\n]*[；;。]?/g, "")
  .replace(/阶段\s*[：:][^；;。\n]*[；;。]?/g, "")
  .replace(/^[；;、\s]+/, "").trim();
// 行高：基础一行 + 粒度标签一行 + 原因最多两行（卡片与 extraFor 必须用同一算法，否则长图会溢出）
const mvRowH = c => { const r = chgRest(c); return 52 + (chgScope(c) ? 26 : 0) + (r ? 26 * (r.length > 46 ? 2 : 1) : 0); };

V.brief = () => {
  const b = briefData(), d = T0;
  const size = own(CARD_SIZES, R.params.size) ? R.params.size : "long", theme = R.params.theme === "dark" ? "dark" : "light";
  const item = (c, mode) => { const x = parseD(mode === "new" ? c.added : c.deadline); const l = daysLeft(c);
    return `<div class="pi" data-open="${c.id}" tabindex="0"><div class="dt ${mode === "new" ? "nw" : urg(l)}"><b class="num">${x ? x.getDate() : "?"}</b><small>${x ? x.getMonth() + 1 + "月" : "待定"}</small><i>${mode === "new" ? "上新" : "截止"}</i></div><div style="min-width:0"><div class="tt">${esc(c.name)}</div>
      <div class="ss">${gB(c)}${isFree(c) ? '<span class="tag free">免费</span>' : `<span class="fee">${esc(cut(c.fee, 14))}</span>`}<span class="fee ${mode === "new" ? "" : urg(l)}">${mode === "new" ? (l == null ? "截止待公布" : `${md(c.deadline)}截止`) : dueLabel(c)}</span></div>
      <div class="pz">${esc(prizeShort(c))}</div></div></div>`; };
  const sec = (t, a, e, mode = "due", extra = "") => `<section class="p-sec"><h3><i></i>${t}<em>${a.length} 个</em></h3>${extra}${a.length ? `<div class="p-items">${a.map(c => item(c, mode)).join("")}</div>` : `<div class="p-empty">${I.check}${e}</div>`}</section>`;
  const col = (cls, t, a, mode, e, href) => `<section class="p-col ${cls}"><h3><i></i>${t}<em>${a.length} 个</em></h3>${a.length ? `<div class="p-list">${a.slice(0, 8).map(c => item(c, mode)).join("")}</div>${a.length > 8 ? `<a class="p-more" href="${href}">还有 ${a.length - 8} 个${I.r}</a>` : ""}` : `<div class="p-empty">${I.check}${e}</div>`}</section>`;
  const seg = (k, v, cur, label) => `<button class="${cur === v ? "on" : ""}" data-card="${k}:${v}">${label}</button>`;
  return `
  <div class="brief">
    <div class="page-h"><div class="kicker">今日简报</div><h1>每日赛事日报 · 一键生成分享卡片</h1><p class="lede">这里汇总${b.dueT}与${b.freshT}：生成图片直接发朋友圈、群聊或公众号；也能复制成文字。</p></div>
    <section class="share">
      <div class="share-pv"><img id="cardImg" alt="分享卡片预览" class="${size}" style="display:none"><div class="share-ld" id="cardLd">选好尺寸与配色后，点下方「生成图片」。<br><small>不点就不生成，避免每次进页面都跑一遍 Canvas。</small></div></div>
      <div class="share-op">
        <div class="op-g"><label>尺寸</label><div class="seg">${Object.entries(CARD_SIZES).map(([k, v]) => seg("size", k, size, v.n)).join("")}</div><small>${CARD_SIZES[size].tip}</small></div>
        <div class="op-g"><label>配色</label><div class="seg">${seg("theme", "light", theme, "浅色")}${seg("theme", "dark", theme, "深色")}</div></div>
        <div class="op-g"><label>卡片内容</label><ul class="op-sum">
          <li><i class="d-hot"></i>${b.dueT} <b class="num">${b.due.length}</b> 个${b.dueK !== "today" ? "<small>（今天没有截止，自动放宽）</small>" : ""}</li>
          <li><i class="d-acc"></i>${b.freshT} <b class="num">${b.fresh.length}</b> 个${b.freshK !== "1" ? "<small>（今天没有新开征，自动放宽）</small>" : ""}</li>
          <li><i></i>顶部：在征 ${b.L.length} · 7 天内截止 ${b.w7.length}</li>
          ${size === "long" ? `<li><i></i>底部：本周还要截止 ${b.wk.length} · 截止日调整 ${b.moved.length}</li>` : ""}</ul></div>
        <div class="op-btns"><button class="btn pri" data-act="cardgen">${I.edit || ""}生成图片</button><button class="btn" data-act="cardsave">${I.down}保存图片</button><button class="btn" data-act="cardcopy">${I.copy}复制图片</button><button class="btn" data-act="caption">${I.copy}复制配文</button></div>
        <p class="op-tip">手机上也可以长按上方预览图保存。图片里每栏放不下的条目会提示「还有 N 个」，引导到网站查看。</p>
      </div>
    </section>
    <div class="brief-tools"><span>文字版</span><div class="btns"><button class="btn" data-act="copybrief">${I.copy}复制文字</button><button class="btn" data-act="copymd">${I.copy}复制 Markdown</button><button class="btn" data-act="print">${I.print}打印 / PDF</button></div></div>
    <article class="paper">
      <header class="p-head"><div class="ph-top"><span>AI 赛事日报</span><span>No.${dayNo()} · ${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")} 周${WD[d.getDay()]}</span></div>
        <h1>${b.dueT} ${b.due.length} 个，${b.freshT} ${b.fresh.length} 个</h1>
        <p>一周内共有 ${b.w7.length} 个赛事截止，30 天内还有 ${b.mo.length} 个 S / A 级。${b.moved.length ? `近 3 天有 ${b.moved.length} 个赛事调整了截止日，投递前请再看一眼。` : ""}</p>
        <div class="p-stats"><div><b class="num">${b.L.length}</b><span>未截止</span></div><div><b class="num">${b.w7.length}</b><span>7 天内截止</span></div><div><b class="num u-red">${b.due.length}</b><span>${b.dueT}</span></div><div><b class="num acc">${b.fresh.length}</b><span>${b.freshT}</span></div></div></header>
      <div class="p-duo">${col("due", b.dueT, b.due, "due", "近 7 天没有截止的赛事", `#/contests?when=${b.dueK === "today" ? "3" : b.dueK}`)}${col("new", b.freshT, b.fresh, "new", "近 7 天没有新开征", `#/contests?new=${b.freshK}&sort=new`)}</div>
      <div class="p-body">
        ${sec("本周还要截止", b.wk, "本周没有其他截止的赛事")}${sec("30 天内的 S / A 级", b.mo, "30 天内没有 S / A 级截止")}${sec("免费且有现金奖 · 时间充裕", b.fc, "暂时没有符合条件的赛事")}
        ${b.moved.length ? `<section class="p-sec"><h3><i></i>截止日有调整<em>${b.moved.length} 个</em></h3><p class="p-chg-hint">「→ 待公布」不等于取消：多半是上一届已结束、下一届还没公布，或官方征片页未上线，具体原因写在每条下面。</p><div class="p-chg">${b.moved.map(c => { const x = c.changes[c.changes.length - 1]; return `<div class="p-chg-i"><a class="row" data-open="${c.id}" tabindex="0">${gB(c)}<span>${esc(c.name)}</span><b>${chgLabel(x, c.changeLabel)}</b></a>${c.changeReason ? `<em class="why">${chgScope(c) ? `<b class="scope">${esc(chgScope(c))}</b>` : ""}${esc(chgRest(c) || c.changeReason)}</em>` : ""}</div>`; }).join("")}</div></section>` : ""}
      </div>
      <footer class="p-foot"><span>AI赛事助手 · 数据更新于 ${esc(RAW.snapshot)}</span><span>剩余天数按北京时间计算，截止时间以主办方官网公布的时区为准</span></footer>
    </article></div>`;
};
V.brief.after = () => { cardCanvas = null; };
let cardCanvas = null;
function cardOpts() { return { size: own(CARD_SIZES, R.params.size) ? R.params.size : "long", theme: R.params.theme === "dark" ? "dark" : "light" }; }
function cardRender() {
  const img = $("#cardImg"); if (!img) return null;
  const ld = $("#cardLd");
  try {
    cardCanvas = drawCard(cardOpts());
    img.src = cardCanvas.toDataURL("image/png");
    img.style.display = "block";
    if (ld) ld.style.display = "none";
    return cardCanvas;
  } catch (e) {
    cardCanvas = null;
    if (ld) { ld.style.display = "block"; ld.textContent = "这个浏览器没能生成图片，可以改用「复制文字」把内容带走"; }
    return null;
  }
}
const cardName = () => { const o = cardOpts(); return `AI赛事日报-${ymd(T0)}-${CARD_SIZES[o.size].n.replace(/\s|:/g, "")}.png`; };
// toBlob 在部分浏览器/隐私模式下会静默失败，这里留一条 toDataURL 的兜底路径，导出必须能成。
function cardBlob(cb) {
  if (!cardCanvas) { cb(null); return; }
  let settled = false;
  const fallback = () => {
    if (settled) return; settled = true;
    try {
      const du = cardCanvas.toDataURL("image/png"), bin = atob(du.split(",")[1]);
      const u8 = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
      cb(new Blob([u8], { type: "image/png" }));
    } catch (e) { cb(null); }
  };
  try { cardCanvas.toBlob(b => b ? (settled = true, cb(b)) : fallback(), "image/png"); }
  catch (e) { fallback(); }
}
function cardSave() {
  if (!cardCanvas && !cardRender()) return toast("图片还没生成，请先点「生成图片」");
  cardBlob(bl => {
    if (!bl) return toast("导出失败，请长按预览图保存");
    const u = URL.createObjectURL(bl);
    const a = Object.assign(document.createElement("a"), { href: u, download: cardName(), rel: "noopener" });
    document.body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(u), 2e3);
    toast("图片已保存");
  });
}
function cardCopy() {
  if (!cardCanvas && !cardRender()) return toast("图片还没生成，请先点「生成图片」");
  if (!window.ClipboardItem || !navigator.clipboard?.write) return toast("这个浏览器不支持复制图片，请用「保存图片」");
  cardBlob(bl => {
    if (!bl) return toast("复制失败，请用「保存图片」");
    navigator.clipboard.write([new ClipboardItem({ "image/png": bl })]).then(() => toast("图片已复制，可以直接粘贴")).catch(() => toast("复制失败，请用「保存图片」"));
  });
}

/* —— 分享卡片绘制（纯 Canvas，无第三方依赖） —— */
const CARD_SIZES = { long: { w: 1080, h: 0, n: "竖版长图", tip: "1080 宽，高度随内容；适合朋友圈、小红书、群聊" }, tall: { w: 1080, h: 1440, n: "竖版 3:4", tip: "1080×1440；适合小红书封面、视频号图文" }, wide: { w: 1920, h: 1080, n: "横版 16:9", tip: "1920×1080；适合公众号头图、PPT、横屏展示" } };
const CT = {
  light: { bg: "#f5f3ed", card: "#ffffff", line: "#e2e5e0", soft: "#f1f2ee", ink: "#1d272c", ink2: "#37434a", ink3: "#66737a", hot: "#b3402a", hotSoft: "rgba(179,64,42,.08)", acc: "#176b75", accSoft: "rgba(23,107,117,.08)", g: { S: "#b3402a", A: "#176b75", B: "#59656b", C: "#88939a" }, ok: "#2f7d5c" },
  dark: { bg: "#11171a", card: "#1a2226", line: "rgba(255,255,255,.09)", soft: "rgba(255,255,255,.04)", ink: "#eaefee", ink2: "#cfd8d8", ink3: "#9aa7ac", hot: "#ef8a71", hotSoft: "rgba(239,138,113,.1)", acc: "#3fd0d9", accSoft: "rgba(63,208,217,.1)", g: { S: "#ef8a71", A: "#3fd0d9", B: "#a5b0b3", C: "#7f8c91" }, ok: "#5fc79a" },
};
const CFONT = '"PingFang SC","Hiragino Sans GB","Noto Sans CJK SC","Source Han Sans SC","Microsoft YaHei","HarmonyOS Sans SC",system-ui,sans-serif';
function wrapText(ctx, text, maxW, maxLines) {
  const toks = String(text || "").replace(/\s+/g, " ").match(/[A-Za-z0-9][A-Za-z0-9.,'’&+\-_/:%]*\s?|\s|./gu) || [];
  const lines = []; let cur = "";
  const push = () => { lines.push(cur.trimEnd()); cur = ""; };
  for (let t of toks) {
    if (!cur && t === " ") continue;
    if (ctx.measureText(cur + t).width <= maxW) { cur += t; continue; }
    if (ctx.measureText(t).width > maxW) { for (const ch of t) { if (ctx.measureText(cur + ch).width > maxW && cur) push(); cur += ch; } continue; }
    push(); cur = t.trimStart();
  }
  if (cur.trim()) push();
  if (lines.length > maxLines) { const k = lines.slice(0, maxLines); let last = k[maxLines - 1]; while (last && ctx.measureText(last + "…").width > maxW) last = last.slice(0, -1); k[maxLines - 1] = last + "…"; return k; }
  return lines;
}
function rrect(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
function drawCard({ size = "long", theme = "light" } = {}) {
  const S = CARD_SIZES[size], T = CT[theme], b = briefData(), wide = size === "wide";
  const W = S.w, P = wide ? 80 : 64, GAP = wide ? 32 : 24;
  const cv = document.createElement("canvas"), ctx = cv.getContext("2d");
  const f = (px, w = 400) => `${w} ${px}px ${CFONT}`;
  const F = wide ? { date: 76, head: 34, num: 50, colT: 32, name: 30, meta: 23, foot: 22, item: 22 } : { date: 84, head: 34, num: 52, colT: 32, name: 30, meta: 23, foot: 22, item: 22 };
  const colW = (W - 2 * P - GAP) / 2, ipad = 24, nameW = colW - ipad * 2 - 46;
  // —— 先排版（测量），再绘制 ——
  ctx.font = f(F.name, 700);
  const lay = (list, mode) => list.map(c => { ctx.font = f(F.name, 700); const nl = wrapText(ctx, c.name, nameW, 2); ctx.font = f(F.meta); const pz = wrapText(ctx, prizeShort(c), colW - ipad * 2 - 46, 1); return { c, nl, pz, mode, h: 22 + nl.length * 42 + 8 + 34 + (pz[0] ? 34 : 0) + 20 }; });
  const headH = (wide ? 44 + 30 + F.date + 14 + 46 : 44 + 40 + F.date + 18 + 48) + 34, statH = wide ? 118 : 128, colHead = 76, footH = wide ? 96 : 124;
  const top = P + headH + statH + 32;
  const fit = (items, limitH) => { const out = []; let h = 0; for (const it of items) { if (h + it.h > limitH) break; out.push(it); h += it.h; } return { out, h }; };
  let A = lay(b.due, "due"); const B = lay(b.fresh, "new");
  // 截止栏条目少、上新栏多时，用「随后截止」补齐左栏，避免左右一轻一重
  const sumH = a => a.reduce((t, x) => t + x.h, 0);
  const tgt = size === "long" ? sumH(B.slice(0, 10)) : Math.min(sumH(B), S.h - top - colHead - footH - P - 56);
  const nextUp = lay(b.wk, "due");
  let filler = [];
  if (sumH(A) + 60 < tgt && nextUp.length) { let h = sumH(A) + 54; for (const it of nextUp) { if (h + it.h > tgt) break; filler.push(it); h += it.h; } }
  if (filler.length) { A = [...A, { sep: true, h: 54 }, ...filler]; }
  const shownNextIds = new Set(filler.map(x => x.c.id));
  const extraFor = () => { if (size !== "long") return { h: 0 }; const wk = b.wk.filter(c => !shownNextIds.has(c.id)).slice(0, 8), mv = b.moved.slice(0, 4); let h = 0; if (wk.length) h += 70 + wk.length * 52 + 16; if (mv.length) h += 70 + mv.reduce((t, c) => t + mvRowH(c), 0) + 16; return { h: h ? h + 28 : 0, wk, mv }; };
  const EX = extraFor();
  let H, avail;
  if (size === "long") { const cap = 10; const fa = fit(A.some(x => x.sep) ? A : A.slice(0, cap), 1e9), fb = fit(B.slice(0, cap), 1e9); avail = Math.max(fa.h, fb.h, 150) + 64; H = top + colHead + avail + 12 + EX.h + footH + P - 24; }
  else { H = S.h; avail = H - top - colHead - footH - P + 8; }
  const moreH = 56;
  const real = a => a.filter(x => !x.sep).length;
  const pick = (items, total) => { if (size === "long") { const cap = items.some(x => x.sep) ? items : items.slice(0, 10); const sepAt = cap.findIndex(y => y.sep); return { out: cap, more: Math.max(0, total - (sepAt < 0 ? cap.length : sepAt)) }; }
    let r = fit(items, avail - 8); if (r.out.length < items.length) r = fit(items, avail - 8 - moreH); if (r.out.length && r.out[r.out.length - 1].sep) r.out.pop(); const sepAt = r.out.findIndex(y => y.sep); const ownN = sepAt < 0 ? r.out.length : sepAt; return { out: r.out, more: Math.max(0, total - ownN) }; };
  const PA = pick(A, b.due.length), PB = pick(B, b.fresh.length);
  cv.width = W; cv.height = Math.round(H);
  // —— 背景 ——
  ctx.fillStyle = T.bg; ctx.fillRect(0, 0, W, H);
  const gr = ctx.createRadialGradient(W, 0, 0, W, 0, W * .9); gr.addColorStop(0, T.accSoft); gr.addColorStop(1, "rgba(0,0,0,0)"); ctx.fillStyle = gr; ctx.fillRect(0, 0, W, H * .5);
  ctx.textBaseline = "alphabetic";
  let y = P;
  // 品牌行（纯文字，不绘制图标）
  ctx.fillStyle = T.ink; ctx.font = f(28, 700); ctx.fillText("AI赛事助手", P, y + 32);
  ctx.font = f(24, 500); ctx.fillStyle = T.ink3; ctx.textAlign = "right"; ctx.fillText(`AI 赛事日报 · No.${dayNo()}`, W - P, y + 31); ctx.textAlign = "left";
  y += 44 + (wide ? 30 : 40);
  // 日期
  ctx.font = f(F.date, 800); ctx.fillStyle = T.ink; const dTxt = `${T0.getMonth() + 1}月${T0.getDate()}日`; ctx.fillText(dTxt, P - 2, y + F.date * .86);
  const dw = ctx.measureText(dTxt).width; ctx.font = f(40, 500); ctx.fillStyle = T.ink3; ctx.fillText(`周${WD[T0.getDay()]} · ${T0.getFullYear()}`, P + dw + 18, y + F.date * .86);
  y += F.date + (wide ? 14 : 18);
  ctx.font = f(F.head, 500); ctx.fillStyle = T.ink2;
  ctx.fillText(`${b.dueT} ${b.due.length} 个，${b.freshT} ${b.fresh.length} 个${b.moved.length ? `，${b.moved.length} 个调整了截止日` : "，近 7 天无截止日调整"}`, P, y + F.head);
  y += headH - (wide ? 44 + 30 + F.date + 14 : 44 + 40 + F.date + 18);
  // 数据条
  const stats = [["未截止", b.L.length, T.ink], ["7 天内截止", b.w7.length, T.ink], [b.dueT, b.due.length, T.hot], [b.freshT, b.fresh.length, T.acc]];
  rrect(ctx, P, y, W - 2 * P, statH, 22); ctx.fillStyle = T.card; ctx.fill(); ctx.strokeStyle = T.line; ctx.lineWidth = 2; ctx.stroke();
  const sw = (W - 2 * P) / 4;
  stats.forEach(([k, v, col], i) => { const x = P + sw * i; if (i) { ctx.strokeStyle = T.line; ctx.beginPath(); ctx.moveTo(x, y + 24); ctx.lineTo(x, y + statH - 24); ctx.stroke(); }
    ctx.font = f(F.num, 800); ctx.fillStyle = col; ctx.fillText(String(v), x + 30, y + 22 + F.num * .9); ctx.font = f(22, 500); ctx.fillStyle = T.ink3; ctx.fillText(k, x + 30, y + statH - 26); });
  y = top;
  // 两栏
  const colH = colHead + avail;
  const drawCol = (x, title, sub, col, colSoft, P2, empty, href) => {
    rrect(ctx, x, y, colW, colH, 24); ctx.fillStyle = T.card; ctx.fill(); ctx.strokeStyle = T.line; ctx.lineWidth = 2; ctx.stroke();
    ctx.save(); rrect(ctx, x, y, colW, colHead, 24); ctx.clip(); ctx.fillStyle = colSoft; ctx.fillRect(x, y, colW, colHead); ctx.fillStyle = col; ctx.fillRect(x, y, colW, 6); ctx.restore();
    ctx.fillStyle = col; rrect(ctx, x + ipad, y + 28, 8, 30, 4); ctx.fill();
    ctx.font = f(F.colT, 800); ctx.fillStyle = T.ink; ctx.fillText(title, x + ipad + 20, y + 54);
    ctx.font = f(24, 600); ctx.fillStyle = col; ctx.textAlign = "right"; ctx.fillText(sub, x + colW - ipad, y + 53); ctx.textAlign = "left";
    let yy = y + colHead + 8;
    if (!P2.out.length) { ctx.font = f(26, 500); ctx.fillStyle = T.ink3; ctx.fillText(empty, x + ipad, yy + 60); return; }
    P2.out.forEach((it, i) => {
      if (it.sep) { ctx.font = f(22, 700); ctx.fillStyle = T.ink3; ctx.fillText("随后截止", x + ipad, yy + 36); const tw = ctx.measureText("随后截止").width; ctx.strokeStyle = T.line; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x + ipad + tw + 14, yy + 28); ctx.lineTo(x + colW - ipad, yy + 28); ctx.stroke(); yy += it.h; return; }
      if (i && !P2.out[i - 1].sep) { ctx.strokeStyle = T.line; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x + ipad, yy); ctx.lineTo(x + colW - ipad, yy); ctx.stroke(); }
      const c = it.c, gc = T.g[c.grade], l = daysLeft(c);
      let iy = yy + 22;
      rrect(ctx, x + ipad, iy + 4, 32, 32, 8); ctx.fillStyle = gc; ctx.globalAlpha = theme === "dark" ? .22 : .12; ctx.fill(); ctx.globalAlpha = 1;
      ctx.font = f(20, 800); ctx.fillStyle = gc; ctx.textAlign = "center"; ctx.fillText(c.grade, x + ipad + 16, iy + 28); ctx.textAlign = "left";
      ctx.font = f(F.name, 700); ctx.fillStyle = T.ink; it.nl.forEach((ln, k) => ctx.fillText(ln, x + ipad + 46, iy + 32 + k * 42));
      iy += it.nl.length * 42 + 8;
      // 状态行
      const urgent = it.mode === "due" && l != null && l <= 1;
      const stW = colW - ipad * 2 - 46 - 70;
      let st = it.mode === "due" ? dueLabel(c) : newLabel(c), fs = F.meta;
      ctx.font = f(fs, 650); if (it.mode === "new" && ctx.measureText(st).width > stW) st = newLabel(c, true);
      while (ctx.measureText(st).width > stW + 60 && fs > 18) { fs--; ctx.font = f(fs, 650); } ctx.fillStyle = it.mode === "due" ? (urgent || l <= 3 ? T.hot : T.ink2) : T.acc; ctx.fillText(st, x + ipad + 46, iy + 24);
      let sx = x + ipad + 46 + ctx.measureText(st).width + 14;
      ctx.font = f(F.meta, 650);
      if (isFree(c)) { ctx.font = f(20, 700); const tw = ctx.measureText("免费").width + 18; if (sx + tw < x + colW - ipad) { rrect(ctx, sx, iy + 1, tw, 30, 8); ctx.fillStyle = theme === "dark" ? "rgba(95,199,154,.16)" : "rgba(47,125,92,.1)"; ctx.fill(); ctx.fillStyle = T.ok; ctx.fillText("免费", sx + 9, iy + 23); } }
      iy += 34;
      if (it.pz[0]) { ctx.font = f(F.meta, 400); ctx.fillStyle = T.ink3; ctx.fillText(it.pz[0], x + ipad + 46, iy + 24); }
      yy += it.h;
    });
    if (P2.more > 0) { ctx.font = f(23, 600); ctx.fillStyle = col; ctx.fillText(`还有 ${P2.more} 个 · 到网站查看全部 →`, x + ipad, y + colH - 26); }
  };
  drawCol(P, b.dueT, `${b.due.length} 个`, T.hot, T.hotSoft, PA, "近 7 天没有截止的赛事", "");
  drawCol(P + colW + GAP, b.freshT, `${b.fresh.length} 个`, T.acc, T.accSoft, PB, "近 7 天没有新开征", "");
  y += colH + 28;
  // 长图专属：本周还要截止 / 截止日调整
  if (size === "long" && EX.h) {
    const block = (title, rows, render, rowH = () => 52) => { if (!rows.length) return; const bh = 70 + rows.reduce((t, r) => t + rowH(r), 0) + 16; rrect(ctx, P, y, W - 2 * P, bh, 24); ctx.fillStyle = T.card; ctx.fill(); ctx.strokeStyle = T.line; ctx.lineWidth = 2; ctx.stroke();
      ctx.font = f(28, 800); ctx.fillStyle = T.ink; ctx.fillText(title, P + ipad, y + 48); let ry = y + 70; rows.forEach(r => { render(r, ry); ry += rowH(r); }); y += bh + 16; };
    block(`本周还要截止 · ${b.wk.length} 个`, EX.wk, (c, ry) => { ctx.font = f(22, 800); ctx.fillStyle = T.g[c.grade]; ctx.fillText(c.grade, P + ipad, ry + 34); ctx.font = f(F.item + 2, 500); ctx.fillStyle = T.ink2;
      const right = `${md(c.deadline)} · 剩 ${daysLeft(c)} 天`; const rw = (ctx.font = f(F.item + 2, 650), ctx.measureText(right).width); ctx.font = f(F.item + 2, 500); const nm = wrapText(ctx, c.name, W - 2 * P - ipad * 2 - 40 - rw - 24, 1)[0]; ctx.fillText(nm, P + ipad + 36, ry + 34);
      ctx.font = f(F.item + 2, 650); ctx.fillStyle = daysLeft(c) <= 3 ? T.hot : T.ink3; ctx.textAlign = "right"; ctx.fillText(right, W - P - ipad, ry + 34); ctx.textAlign = "left"; });
    block(`截止日有调整 · ${b.moved.length} 个`, EX.mv, (c, ry) => { const x = c.changes[c.changes.length - 1]; const sc = chgScope(c), rest = chgRest(c); ctx.font = f(22, 800); ctx.fillStyle = T.g[c.grade]; ctx.fillText(c.grade, P + ipad, ry + 34);
      const right = chgLabel(x, c.changeLabel); ctx.font = f(F.item + 2, 650); const rw = ctx.measureText(right).width; ctx.font = f(F.item + 2, 500); ctx.fillStyle = T.ink2; ctx.fillText(wrapText(ctx, c.name, W - 2 * P - ipad * 2 - 40 - rw - 24, 1)[0], P + ipad + 36, ry + 34);
      ctx.font = f(F.item + 2, 650); ctx.fillStyle = T.acc; ctx.textAlign = "right"; ctx.fillText(right, W - P - ipad, ry + 34); ctx.textAlign = "left";
      let ly = ry + 68;
      if (sc) { ctx.font = f(20, 700); ctx.fillStyle = T.acc; ctx.fillText(wrapText(ctx, `调整范围：${sc}`, W - 2 * P - ipad * 2 - 40, 1)[0], P + ipad + 36, ly); ly += 26; }
      if (rest) { ctx.font = f(20, 400); ctx.fillStyle = T.ink3; wrapText(ctx, rest, W - 2 * P - ipad * 2 - 40, 2).forEach((ln2, k) => ctx.fillText(ln2, P + ipad + 36, ly + k * 26)); } }, mvRowH);
    y += 12;
  }
  // 页脚
  const fy = H - P - 40, url = String(RAW.siteUrl || location.host).replace(/^https?:\/\//, ""), note = `数据更新于 ${RAW.snapshot} · 截止日与规则以主办方官网为准`;
  ctx.font = f(24, 700); const uw = ctx.measureText(url).width; ctx.font = f(F.foot, 400); const nw2 = ctx.measureText(note).width;
  const stack = nw2 + uw + 40 > W - 2 * P;
  ctx.strokeStyle = T.line; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(P, fy - (stack ? 52 : 22)); ctx.lineTo(W - P, fy - (stack ? 52 : 22)); ctx.stroke();
  ctx.font = f(24, 700); ctx.fillStyle = T.acc; if (stack) ctx.fillText("全部赛事 → " + url, P, fy - 8); else { ctx.textAlign = "right"; ctx.fillText(url, W - P, fy + 20); ctx.textAlign = "left"; }
  ctx.font = f(F.foot, 400); ctx.fillStyle = T.ink3; ctx.fillText(note, P, fy + 24);
  return cv;
}
// 配文：和卡片同一结构，发图时一起贴
function shareCaption() {
  const b = briefData(), url = RAW.siteUrl || location.href.split("#")[0];
  const ln = (c, mode) => `· 【${c.grade}】${c.name}｜${mode === "new" ? (daysLeft(c) == null ? "截止待公布" : md(c.deadline) + "截止") : dueLabel(c)}${isFree(c) ? "｜免费" : ""}`;
  return `AI 赛事日报｜${T0.getMonth() + 1}月${T0.getDate()}日 周${WD[T0.getDay()]}\n在征 ${b.L.length} 个 · 7 天内截止 ${b.w7.length} 个\n\n⏰ ${b.dueT}（${b.due.length}）\n${b.due.slice(0, 8).map(c => ln(c, "due")).join("\n") || "· 无"}${b.due.length > 8 ? `\n…另有 ${b.due.length - 8} 个` : ""}\n\n🆕 ${b.freshT}（${b.fresh.length}）\n${b.fresh.slice(0, 8).map(c => ln(c, "new")).join("\n") || "· 无"}${b.fresh.length > 8 ? `\n…另有 ${b.fresh.length - 8} 个` : ""}\n\n全部赛事与投递入口：${url}`;
}
function briefText(mdMode) {
  const b = briefData(), d = T0;
  const line = (c, mode) => { const st = mode === "new" ? newLabel(c) : dueLabel(c); return mdMode ? `- **${c.name}**（${c.grade} 级）— ${st}；${c.prize}；报名 ${c.fee}${/^https?:/.test(c.submit) ? `；[投递](${c.submit})` : ""}` : `· ${c.name}【${c.grade}】${st}｜${cut(c.prize, 40)}｜报名${cut(c.fee, 16)}`; };
  const sec = (t, a, mode) => a.length ? `\n${mdMode ? "## " : "【"}${t}${mdMode ? "" : "】"}（${a.length}）\n${a.map(c => line(c, mode)).join("\n")}\n` : "";
  const mv = b.moved.length ? `\n${mdMode ? "## " : "【"}截止日有调整${mdMode ? "" : "】"}\n${b.moved.map(c => `${mdMode ? "- " : "· "}${c.name}：${chgLabel(c.changes[c.changes.length - 1], c.changeLabel)}`).join("\n")}\n` : "";
  return `${mdMode ? "# " : ""}AI 赛事日报 ${d.getFullYear()}.${d.getMonth() + 1}.${d.getDate()}\n在征 ${b.L.length} 个 · ${b.dueT} ${b.due.length} 个 · ${b.freshT} ${b.fresh.length} 个 · 一周内截止 ${b.w7.length} 个\n` + sec(b.dueT, b.due, "due") + sec(b.freshT, b.fresh, "new") + sec("本周还要截止", b.wk, "due") + sec("30 天内 S/A 级", b.mo, "due") + sec("免费且有现金奖", b.fc, "due") + mv + `\n截止日以主办方官网为准 · ${RAW.siteUrl || location.href.split("#")[0]}`;
}

/* ═════════ 页面：知名电影节 ═════════ */
const MONTHS = t => { const s = new Set(); String(t || "").replace(/(\d{1,2})\s*月/g, (_, n) => s.add(+n)); const m = String(t || "").match(/(\d{1,2})\s*月?\s*[-–~至]\s*(\d{1,2})\s*月/); if (m) for (let i = +m[1]; i <= +m[2]; i++) s.add(i); return s; };
V.festivals = () => {
  const cat = R.params.cat || ""; const cats = [...new Set(FEST.map(f => f.type).filter(Boolean))];
  const list = FEST.filter(f => !cat || f.type === cat);
  const pal = ["var(--gS)", "var(--gB)", "var(--accent)", "var(--gC)", "var(--ok)"];
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
  <div class="steps">${[["ok", "check", "官网已核实", "官网原文里找到了与本站一致的截止日。"], ["fixed", "edit", "已按官网更正", "与官网不一致的字段已按官网改正。"], ["warn", "alert", "需要你再确认", "官网页面过期、跳转或查不到本届截止日，投递前请自行核对。"], ["none", "info", "未自动核实", "页面需要登录或无法自动读取，以官网为准。"]].map(([k, ic, t, d]) => `<div class="vcard"><span class="cnt num" style="color:${k === "ok" ? "var(--ok)" : k === "fixed" ? "var(--accent-ink)" : k === "warn" ? "var(--amber)" : "var(--ink-4)"}">${vc[k]}</span><div><b>${t}</b><p>${d}</p></div></div>`).join("")}</div>
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
  const grp = { home: "赛事", timeline: "", calendar: "", insights: "", brief: "", festivals: "资料", about: "" };
  $("#tabs").innerHTML = ROUTES.map(r => `${grp[r.k] && r.k !== "home" ? `<div class="nav-g">${grp[r.k]}</div>` : ""}<a href="#/${r.k}" class="${R.page === r.k ? "on" : ""} ${r.k === "home" && w3 ? "hot" : ""}" ${R.page === r.k ? 'aria-current="page"' : ""}>${I[r.i]}<span>${r.n}</span>${cnt[r.k] || ""}</a>`).join("");
  { const hid = C.length - L.length;
    $("#snap").innerHTML = `数据更新于 ${esc(RAW.snapshot)} · 共 ${C.length} 个赛事` + (hid > 0 ? `<br><span class="snap-hint">默认收起 ${hid} 个已截止／本届结束（<a href="#/contests?when=all">查看全部</a>）</span>` : ""); }
  $("#today").textContent = `${T0.getMonth() + 1}月${T0.getDate()}日 周${WD[T0.getDay()]}`;
  $("#tabbar").innerHTML = ["home", "contests", "timeline", "calendar", "brief"].map(k => { const r = ROUTES.find(x => x.k === k); return `<a href="#/${k}" class="${R.page === k ? "on" : ""}">${I[r.i]}<span>${r.n.replace("全部", "").replace("今日", "").replace("截止", "").replace("数据", "")}</span></a>`; }).join("");
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
  $("#view").inert = true; $(".side").inert = true; $(".topbar").inert = true;
  if (!fromRoute) history.pushState({ d: 1 }, "", `#/c/${encodeURIComponent(id)}`);
  setTimeout(() => $("#drawer [data-act=closeDrawer]")?.focus({ preventScroll: true }), 60);
}
function closeDrawer(fromRoute = false) {
  if (!$("#drawer").classList.contains("on")) return;
  $("#drawer").classList.remove("on"); $("#mask").classList.remove("on"); document.body.style.overflow = "";
  $("#view").inert = false; $(".side").inert = false; $(".topbar").inert = false; const curIdBeforeClose = curId; curId = null; pendingFocus = curIdBeforeClose;
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
  u = safeUrl(u);
  if (!u) return "";
  const mail = /^mailto:/.test(u); const host0 = mail ? u.slice(7) : u.replace(/^https?:\/\/(www\.)?/, "").split(/[/?#]/)[0];
  const host = /feishu|larksuite/.test(host0) ? "官方报名文档（飞书）" : /filmfreeway/.test(host0) ? "FilmFreeway 官方投递页" : /festhome/.test(host0) ? "Festhome 官方投递页" : /mp\.weixin/.test(host0) ? "官方公众号公告" : /toujiang|aitop100/.test(host0) ? "指定代投平台" : host0;
  return `<a class="lchip" href="${esc(u)}" ${mail ? "" : 'target="_blank" rel="noopener"'}><span class="lic">${mail ? I.mail : I[ic]}</span><span class="lt"><small>${name}</small><b>${esc(host)}</b></span>${I.ext}</a>`;
}
const VMAP = { ok: ["check", "官网已核实"], fixed: ["edit", "已按官网更正"], warn: ["alert", "需要你再确认"], none: ["info", "未自动核实"] };
function fillDrawer(id) {
  const c = byId.get(id); const l = daysLeft(c), idx = listCtx.indexOf(id), ms = milestones(c), cny = cashCNY(c);
  const [vic, vt] = VMAP[c.verified];
  const sub = safeUrl(c.submit), website = safeUrl(c.site), siteOnly = !!sub && !!website && sub === website, mail = /^mailto:/.test(sub || "");
  $("#drawer").innerHTML = `
  <div class="dr-head">
    <div class="dr-bar">${gB(c)}<span style="font-size:12.5px;color:var(--ink-3);font-weight:550">${GN[c.grade]} · ${stateText(c)}</span>${isFav(id) ? '<span class="tag new">已收藏</span>' : ""}<span class="sp"></span>
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
      <div class="fact wide prize"><dt>${I.trophy}最高奖励${cny > 1 ? `<span class="cny">${cnyLabel(c)}</span>` : ""}</dt><dd>${esc(c.prize)}</dd></div>
      <div class="fact"><dt>${I.ticket}报名费</dt><dd>${esc(c.fee)}</dd></div>
      <div class="fact"><dt>${I.target}命题</dt><dd>${esc(c.topic || "未注明")}</dd></div>
      <div class="fact"><dt>${I.film}类别</dt><dd>${esc(c.category || "未注明")}</dd></div>
      <div class="fact"><dt>${I.pin}地区</dt><dd>${esc(c.region || "未注明")}</dd></div>
    </dl>
    ${safeUrl(c.site) || sub ? `<div class="links">${linkChip("官网", c.site, "globe")}${sub && sub !== safeUrl(c.site) ? linkChip(mail ? "邮箱投稿" : "投递入口", sub, "ext") : ""}</div>` : `<div class="vbox warn"><span class="vi">${I.alert}</span><div><b>暂无官方链接</b><span>主办方暂未公布官网或投递入口，请关注后续公告。</span></div></div>`}
    ${c.added || (c.changes || []).length ? `<div class="dr-rec">${c.added ? `<span>${I.plus}${md(c.added)}开征${addedAgo(c) <= 2 ? '<em class="tag new">上新</em>' : ""}</span>` : ""}${(c.changes || []).map(x => `<span>${I.edit}${md(x.date)}截止日调整：${chgLabel(x, c.changeLabel)}</span>`).join("")}</div>${c.changeReason ? `<p class="dr-why">${chgScope(c) ? `调整范围：<b>${esc(chgScope(c))}</b>｜` : ""}${esc(chgRest(c) || c.changeReason)}</p>` : ""}` : ""}
    ${ms.length > 1 ? `<div class="dr-h">时间节点</div><ul class="tl-list">${(() => { const nx = ms.findIndex(x => x.d >= T0); return ms.map((x, i) => `<li class="${x.d < T0 ? "done" : i === nx ? "next" : ""}"><i></i><b>${ymd(x.d)}</b><span>${esc(x.label)}</span></li>`).join(""); })()}</ul>` : ""}
    ${c.desc ? `<div class="dr-h">赛事说明</div><div class="prose">${esc(c.desc)}</div>` : ""}
    ${c.notes ? `<div class="dr-h">档期与备注</div><div class="prose">${esc(c.notes)}</div>` : ""}
  </div>
  <div class="dr-foot">${sub ? `<a class="btn pri" href="${esc(sub)}" ${mail ? "" : 'target="_blank" rel="noopener"'}>${mail ? "发邮件投稿" : siteOnly ? "查看官网" : "去投递"}${I.ext}</a>` : `<button class="btn pri" disabled style="opacity:.5">暂无投递入口</button>`}
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
  const acts = [["打开时间线全景", () => go("timeline")], ["今天的上新与截止", () => go("timeline", { mode: "feed" })], ["只看 7 天内截止", () => go("contests", { when: "7" })], ["只看免费报名", () => go("contests", { fee: "free" })], ["只看 S / A 级", () => go("contests", { grade: "SA" })], ["复制今日简报", () => copy(briefText(false), "已复制今日简报")], ["切换深浅色", toggleTheme]]
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
const lsGet = k => { try { return localStorage.getItem(k); } catch { return null; } };
const lsSet = (k, v) => { try { localStorage.setItem(k, v); } catch {} };
function applyTheme() { let t = lsGet("aicontest.v6.theme") || "auto"; if (!/^(auto|light|dark)$/.test(t)) t = "auto"; if (t === "auto") t = matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"; document.documentElement.dataset.theme = t; }
function toggleTheme() { const n = document.documentElement.dataset.theme === "dark" ? "light" : "dark"; lsSet("aicontest.v6.theme", n); applyTheme(); if (R.page === "insights") render(false); }
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
    if (a === "cardgen") return cardRender() ? toast("图片已生成，可保存或复制") : toast("生成失败，换一个尺寸试试");
    if (a === "cardsave") return cardSave();
    if (a === "cardcopy") return cardCopy();
    if (a === "caption") return copy(shareCaption(), "配文已复制，发图时一起贴上");
  }
  const tlk = t.closest("[data-tl]"); if (tlk) { const [k, v] = tlk.dataset.tl.split(":"); if (k === "reset") { go("timeline", {}, true); return; } if (k === "mode" && v === "feed") tlScroll = true; go("timeline", tlClean({ ...tlp(), [k]: v }), true); return; }
  const cdk = t.closest("[data-card]"); if (cdk) { const [k, v] = cdk.dataset.card.split(":"); const p = { ...R.params }; p[k] = v; if (p.size === "long") delete p.size; if (p.theme === "light") delete p.theme; go("brief", p, true); return; }
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
addEventListener("scroll", () => { $(".topbar").classList.toggle("scrolled", scrollY > 4); const h = document.documentElement.scrollHeight - innerHeight; $("#prog").style.transform = `scaleX(${h > 0 ? scrollY / h : 0})`; $("#totop").classList.toggle("on", scrollY > 900); }, { passive: true });
addEventListener("popstate", () => { if (!location.hash.startsWith("#/c/")) closeDrawer(true); });
addEventListener("storage", e => { if (e.key === KEY) { try { Object.assign(P, JSON.parse(e.newValue)); refresh(); } catch {} } });

/* ═════════ 启动 ═════════ */
$("#kbd").textContent = /Mac|iPhone|iPad/.test(navigator.platform) ? "⌘K" : "Ctrl K";
const age = RAW.snapshot ? Math.round((T0 - parseD(RAW.snapshot)) / 864e5) : 0;
if (!C.length) $("#notice").innerHTML = `<div class="notice">${I.alert}暂时没有读取到赛事数据，请稍后刷新。</div>`;
else if (age > 3) $("#notice").innerHTML = `<div class="notice">${I.alert}赛事数据已 ${age} 天未更新，部分截止日可能有变，投递前请先核对官网。</div>`;
applyTheme(); route();
})();
