/* 影赛雷达 CineCall — 单页应用，无依赖。数据来自 data/data.js（window.CINECALL）。 */
(() => {
"use strict";
const D = window.CINECALL || { contests: { records: [] }, festivals: { records: [] }, sources: { records: [] } };
const C = D.contests.records || [], F = (D.festivals && D.festivals.records) || [], SRC = (D.sources && D.sources.records) || [];
const byId = new Map(C.map(c => [c.record_id, c]));

/* ───────── utils ───────── */
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const ico = {
  search: '<svg viewBox="0 0 20 20"><circle cx="9" cy="9" r="6"/><path d="m14 14 4 4"/></svg>',
  radar: '<svg viewBox="0 0 20 20"><circle cx="10" cy="10" r="7"/><circle cx="10" cy="10" r="3"/><path d="M10 10l5-5"/></svg>',
  list: '<svg viewBox="0 0 20 20"><path d="M7 5h10M7 10h10M7 15h10M3 5h.01M3 10h.01M3 15h.01"/></svg>',
  grid: '<svg viewBox="0 0 20 20"><rect x="3" y="3" width="6" height="6" rx="1.5"/><rect x="11" y="3" width="6" height="6" rx="1.5"/><rect x="3" y="11" width="6" height="6" rx="1.5"/><rect x="11" y="11" width="6" height="6" rx="1.5"/></svg>',
  cal: '<svg viewBox="0 0 20 20"><rect x="3" y="4" width="14" height="13" rx="2"/><path d="M3 8h14M7 2v4M13 2v4"/></svg>',
  board: '<svg viewBox="0 0 20 20"><rect x="3" y="3" width="4" height="14" rx="1.2"/><rect x="8.5" y="3" width="4" height="9" rx="1.2"/><rect x="14" y="3" width="3" height="11" rx="1.2"/></svg>',
  doc: '<svg viewBox="0 0 20 20"><path d="M5 2.5h7l3.5 3.5v11.5h-10.5z"/><path d="M12 2.5V6h3.5M7.5 10h5M7.5 13h5"/></svg>',
  film: '<svg viewBox="0 0 20 20"><rect x="3" y="3" width="14" height="14" rx="2"/><path d="M7 3v14M13 3v14M3 7h4M3 13h4M13 7h4M13 13h4"/></svg>',
  rss: '<svg viewBox="0 0 20 20"><path d="M4 4a12 12 0 0 1 12 12M4 9a7 7 0 0 1 7 7"/><circle cx="5" cy="15" r="1.3"/></svg>',
  info: '<svg viewBox="0 0 20 20"><circle cx="10" cy="10" r="7.5"/><path d="M10 9v5M10 6.3h.01"/></svg>',
  star: '<svg viewBox="0 0 20 20"><path d="m10 2.8 2.2 4.6 5 .7-3.6 3.5.9 5-4.5-2.4-4.5 2.4.9-5L2.8 8.1l5-.7z"/></svg>',
  trophy: '<svg viewBox="0 0 20 20"><path d="M6 3h8v4a4 4 0 0 1-8 0zM6 5H3v1a3 3 0 0 0 3 3M14 5h3v1a3 3 0 0 1-3 3M10 11v3M7 17h6M8 14h4v3H8z"/></svg>',
  ticket: '<svg viewBox="0 0 20 20"><path d="M3 6a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v2a2 2 0 0 0 0 4v2a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-2a2 2 0 0 0 0-4z"/><path d="M12 5v10" stroke-dasharray="2 2"/></svg>',
  pin: '<svg viewBox="0 0 20 20"><path d="M10 18s-5.5-5-5.5-9a5.5 5.5 0 0 1 11 0c0 4-5.5 9-5.5 9z"/><circle cx="10" cy="9" r="2"/></svg>',
  ext: '<svg viewBox="0 0 20 20"><path d="M11 3h6v6M17 3l-8 8M14 12v4a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h4"/></svg>',
  x: '<svg viewBox="0 0 20 20"><path d="M5 5l10 10M15 5 5 15"/></svg>',
  l: '<svg viewBox="0 0 20 20"><path d="m12 4-6 6 6 6"/></svg>',
  r: '<svg viewBox="0 0 20 20"><path d="m8 4 6 6-6 6"/></svg>',
  up: '<svg viewBox="0 0 20 20"><path d="m5 12 5-5 5 5"/></svg>',
  down: '<svg viewBox="0 0 20 20"><path d="m5 8 5 5 5-5"/></svg>',
  copy: '<svg viewBox="0 0 20 20"><rect x="7" y="7" width="10" height="10" rx="2"/><path d="M13 7V4a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h3"/></svg>',
  link: '<svg viewBox="0 0 20 20"><path d="M8.5 11.5a3.5 3.5 0 0 0 5 0l2.5-2.5a3.5 3.5 0 0 0-5-5l-1 1M11.5 8.5a3.5 3.5 0 0 0-5 0L4 11a3.5 3.5 0 0 0 5 5l1-1"/></svg>',
  dl: '<svg viewBox="0 0 20 20"><path d="M10 3v10M6 9l4 4 4-4M4 16h12"/></svg>',
  up2: '<svg viewBox="0 0 20 20"><path d="M10 14V4M6 8l4-4 4 4M4 16h12"/></svg>',
  bell: '<svg viewBox="0 0 20 20"><path d="M5 8a5 5 0 0 1 10 0c0 5 2 6 2 6H3s2-1 2-6M8.5 17a1.8 1.8 0 0 0 3 0"/></svg>',
  empty: '<svg viewBox="0 0 48 48"><rect x="8" y="10" width="32" height="28" rx="4"/><path d="M8 18h32M16 26h16M16 31h10"/></svg>',
  home: '<svg viewBox="0 0 20 20"><path d="M3 9.5 10 3l7 6.5V17a1 1 0 0 1-1 1h-4v-5H8v5H4a1 1 0 0 1-1-1z"/></svg>',
};
const debounce = (fn, ms) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };

/* ───────── dates ───────── */
const now = () => new Date();
const T0 = (() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; })();
const parseD = s => { if (!s) return null; const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s); return m ? new Date(+m[1], +m[2] - 1, +m[3]) : null; };
const ymd = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const daysLeft = c => { const d = parseD(c["截止日期"]); return d ? Math.round((d - T0) / 864e5) : null; };
const WD = "日一二三四五六";
const fmtMD = s => { const d = parseD(s); return d ? `${d.getMonth() + 1}月${d.getDate()}日` : "待公布"; };
const fmtFull = s => { const d = parseD(s); return d ? `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日 周${WD[d.getDay()]}` : "待公布"; };
const urg = l => l === null ? "" : l <= 3 ? "u-red" : l <= 7 ? "u-amber" : "";

/* ───────── classification ───────── */
const G = { S: 0, A: 1, B: 2, C: 3 };
const gr = c => (c["分级"] in G ? c["分级"] : "C");
const feeTxt = c => String(c["报名费"] || "").trim();
const isFree = c => { const f = feeTxt(c); return /^(免费|无$|无（|￥0|¥0|0元)/.test(f) || /^免费/.test(f); };
const NOCASH = /^(无现金|非现金|无固定现金|非奖金制|官方未公布|未公布|待核实|积分非现金|荣誉|数字桂冠|Crystal|Grand Prix|Close-Up|无（|无$)/i;
const hasCash = c => { const p = String(c["最高奖金"] || ""); if (NOCASH.test(p)) return false; return /[¥￥$€£₹]|\d\s*万|元|美元|澳元|港元|现金/.test(p); };
const FX = { usd: 7.1, eur: 7.8, gbp: 9.2, aud: 4.7, hkd: 0.91, inr: 0.085 };
const cashCNY = c => {
  if (!hasCash(c)) return 0; const p = String(c["最高奖金"]); let m;
  if ((m = p.match(/(\d+(?:\.\d+)?)\s*万美元/))) return +m[1] * 1e4 * FX.usd;
  if ((m = p.match(/\$\s?([\d,.]+)\s*(k|K|M)?/))) return +m[1].replace(/,/g, "") * (m[2] === "M" ? 1e6 : m[2] ? 1e3 : 1) * FX.usd;
  if ((m = p.match(/€\s?([\d,]+)/))) return +m[1].replace(/,/g, "") * FX.eur;
  if ((m = p.match(/£\s?([\d,]+)/))) return +m[1].replace(/,/g, "") * FX.gbp;
  if ((m = p.match(/([\d.]+)\s*万澳元/))) return +m[1] * 1e4 * FX.aud;
  if ((m = p.match(/([\d.]+)\s*万港元/))) return +m[1] * 1e4 * FX.hkd;
  if ((m = p.match(/₹\s?([\d,]+)/))) return +m[1].replace(/,/g, "") * FX.inr;
  if ((m = p.match(/(\d+(?:\.\d+)?)\s*万/))) return +m[1] * 1e4;
  if ((m = p.match(/[¥￥]\s?([\d,]+)/))) return +m[1].replace(/,/g, "");
  if ((m = p.match(/(\d[\d,]*)\s*元/))) return +m[1].replace(/,/g, "");
  return 1;
};
const fmtCNY = v => v >= 1e4 ? `≈¥${(v / 1e4).toFixed(v >= 1e5 ? 0 : 1)}万` : v > 1 ? `≈¥${Math.round(v)}` : "";
const CN_RE = /中国|北京|上海|深圳|广州|广东|山东|香港|澳门|徽州|安徽|湖南|长沙|杭州|浙江|江苏|四川|成都|重庆|大湾区|内地|广西|天津|武汉|福建|厦门|西安|青岛|南京|苏州/;
const isCN = c => CN_RE.test(`${c["地区"] || ""}${c["名称"] || ""}${c["主办方"] || ""}`) && !/海外/.test(c["名称"] || "");
const isOpen = c => { const l = daysLeft(c); return c["征集状态"] !== "已截止" && (l === null || l >= 0); };
const FORMS = [["短片", /短片|short/i], ["短剧", /短剧|漫剧/], ["长片", /长片|feature/i], ["广告", /广告|商业|ads?\b|品牌/i], ["MV", /\bMV\b|音乐视频|music video/i], ["动画", /动画|动漫|animation/i], ["公益", /公益|正向|for good/i]];
const formsOf = c => { const t = `${c["名称"]} ${c["类别"]} ${c["赛事说明"] || ""}`; return FORMS.filter(([, r]) => r.test(t)).map(([n]) => n); };
const hay = c => `${c["名称"]} ${c["主办方"]} ${c["地区"]} ${c["类别"]} ${c["赛事说明"]} ${c["计划备注"]} ${c["最高奖金"]}`.toLowerCase();

/* ───────── store ───────── */
const KEY = "cinecall.v1";
const ST = (() => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; } })();
ST.marks ||= {}; ST.prefs ||= { theme: "auto", view: "list" }; ST.seen ||= null;
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(ST)); } catch {} };
const STATUSES = [
  { k: "want", n: "想投", c: "#ca8a04" }, { k: "making", n: "制作中", c: "#6366f1" },
  { k: "submitted", n: "已投", c: "#16a34a" }, { k: "result", n: "已出结果", c: "#dc2626" },
];
const SN = Object.fromEntries(STATUSES.map(s => [s.k, s.n])); SN.skip = "已忽略";
const mk = id => ST.marks[id] || null;
const status = id => (ST.marks[id] || {}).status || null;
const isMine = id => { const s = status(id); return s && s !== "skip"; };
function setStatus(id, s, { silent } = {}) {
  const prev = ST.marks[id] ? { ...ST.marks[id] } : null;
  if (!s) { if (ST.marks[id]?.note) ST.marks[id].status = null; else delete ST.marks[id]; }
  else ST.marks[id] = { ...(ST.marks[id] || {}), status: s, updated: Date.now() };
  save(); refresh();
  if (!silent) {
    const c = byId.get(id);
    toast(s ? `「${short(c["名称"])}」→ ${SN[s]}` : `已取消标记`, () => { if (prev) ST.marks[id] = prev; else delete ST.marks[id]; save(); refresh(); });
  }
}
const short = (s, n = 14) => (s = String(s || "")).length > n ? s.slice(0, n) + "…" : s;
// new since last visit
const prevSeen = ST.seen ? new Set(ST.seen) : null;
ST.seen = C.map(c => c.record_id); save();
const isNew = c => prevSeen && !prevSeen.has(c.record_id);

/* ───────── toast ───────── */
function toast(msg, undo) {
  const el = document.createElement("div"); el.className = "toast";
  el.innerHTML = `<span>${esc(msg)}</span>${undo ? "<button>撤销</button>" : ""}`;
  $("#toasts").append(el);
  if (undo) el.querySelector("button").onclick = () => { undo(); kill(); };
  const kill = () => { el.classList.add("out"); setTimeout(() => el.remove(), 260); };
  setTimeout(kill, undo ? 4200 : 2400);
}
async function copy(txt, msg = "已复制") { try { await navigator.clipboard.writeText(txt); } catch { const t = document.createElement("textarea"); t.value = txt; document.body.append(t); t.select(); document.execCommand("copy"); t.remove(); } toast(msg); }
function download(name, text, type = "text/plain") { const u = URL.createObjectURL(new Blob([text], { type })); const a = Object.assign(document.createElement("a"), { href: u, download: name }); document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(u), 800); }

/* ───────── shared bits ───────── */
const gBadge = c => `<span class="g g-${gr(c)}" title="${gr(c)} 级">${gr(c)}</span>`;
function tags(c, { max = 4 } = {}) {
  const t = [];
  if (isNew(c)) t.push('<span class="tag soon">新</span>');
  if (c["征集状态"] && c["征集状态"] !== "开放征集中") t.push(`<span class="tag soon">${esc(c["征集状态"])}</span>`);
  if (isFree(c)) t.push('<span class="tag free">免费</span>');
  if (hasCash(c)) t.push('<span class="tag cash">现金奖</span>');
  if (c["命题"] === "命题") t.push('<span class="tag topic">命题</span>');
  const s = status(c.record_id); if (s && s !== "skip") t.push(`<span class="tag st-${s}">${SN[s]}</span>`);
  return t.slice(0, max).join("");
}
const starBtn = c => { const on = isMine(c.record_id); return `<button class="star ${on ? "on" : ""}" data-star="${c.record_id}" aria-label="${on ? "取消收藏" : "加入想投"}" title="${on ? SN[status(c.record_id)] + " · 点击取消" : "加入想投（S）"}">${ico.star}</button>`; };
const dlBig = c => { const l = daysLeft(c); if (l === null) return `<div class="dl-big none"><b>待定</b><span>截止待公布</span></div>`; if (l < 0) return `<div class="dl-big"><b class="num">—</b><span>已截止</span></div>`; return `<div class="dl-big ${urg(l)}"><b class="num">${l === 0 ? "今天" : l}</b><span>${l === 0 ? fmtMD(c["截止日期"]) : "天 · " + fmtMD(c["截止日期"])}</span></div>`; };
const hl = (s, q) => { s = esc(s); if (!q) return s; const i = s.toLowerCase().indexOf(q.toLowerCase()); return i < 0 ? s : s.slice(0, i) + '<mark class="hl">' + s.slice(i, i + q.length) + "</mark>" + s.slice(i + q.length); };
function row(c, q = "") {
  const l = daysLeft(c);
  return `<div class="row ${l !== null && l < 0 ? "past" : ""}" data-open="${c.record_id}" tabindex="-1">
    ${dlBig(c)}
    <div style="min-width:0"><div class="row-t">${gBadge(c)}<h3>${hl(c["名称"], q)}</h3>${tags(c)}</div>
      <div class="row-m"><span>${ico.pin}${esc(c["地区"] || "—")}</span><span>${ico.ticket}${esc(short(feeTxt(c) || "—", 22))}</span><span class="muted">${esc(short(c["类别"], 16))}</span></div></div>
    <div class="row-prize"><em>最高奖励</em>${esc(c["最高奖金"] || "—")}</div>
    ${starBtn(c)}</div>`;
}
function card(c) {
  const l = daysLeft(c);
  return `<article class="card ${urg(l)}" data-open="${c.record_id}">
    <div class="card-top">${gBadge(c)}${tags(c, { max: 3 })}${starBtn(c)}</div>
    <h3 class="card-t">${esc(c["名称"])}</h3>
    <div class="card-org">${esc(c["主办方"] || c["地区"] || "")}</div>
    <div class="prize">${ico.trophy}<span>${esc(c["最高奖金"] || "—")}</span></div>
    <div class="card-f"><span class="dl-pill">${l === null ? "<small>截止待公布</small>" : l === 0 ? "<b>今天</b><small>截止</small>" : `<b class="num">${l}</b><small>天后 · ${fmtMD(c["截止日期"])}</small>`}</span></div>
  </article>`;
}
const emptyBox = (t, s = "") => `<div class="empty">${ico.empty}<b>${t}</b>${s ? `<span>${s}</span>` : ""}</div>`;
const byDl = (a, b) => (daysLeft(a) ?? 1e4) - (daysLeft(b) ?? 1e4);
const live = () => C.filter(isOpen);

/* ───────── routing ───────── */
const ROUTES = [
  { k: "home", n: "截止雷达", i: "radar", g: "发现" },
  { k: "contests", n: "全部赛事", i: "list", g: "发现" },
  { k: "calendar", n: "截止日历", i: "cal", g: "发现" },
  { k: "tracker", n: "我的投递", i: "board", g: "我的" },
  { k: "brief", n: "今日简报", i: "doc", g: "我的" },
  { k: "festivals", n: "知名电影节", i: "film", g: "资料" },
  { k: "sources", n: "信源", i: "rss", g: "资料" },
  { k: "about", n: "收录与分级", i: "info", g: "资料" },
];
function parseHash() {
  const h = location.hash.replace(/^#\/?/, ""); const [path, qs] = h.split("?");
  const parts = (path || "home").split("/"); const params = Object.fromEntries(new URLSearchParams(qs || ""));
  return { page: parts[0] || "home", arg: parts[1] ? decodeURIComponent(parts[1]) : null, params };
}
let R = parseHash(), lastPage = null;
function nav(page, params = {}, { replace } = {}) {
  const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => v !== "" && v != null)).toString();
  const h = `#/${page}${qs ? "?" + qs : ""}`;
  if (replace) history.replaceState(null, "", h); else location.hash = h;
  if (replace) route();
}
window.addEventListener("hashchange", route);
function route() {
  R = parseHash();
  if (R.page === "c" && R.arg) { openDrawer(R.arg, { fromRoute: true }); if (!lastPage) { R.page = "home"; render(); } return; }
  if (!ROUTES.find(r => r.k === R.page)) R.page = "home";
  closeDrawer({ fromRoute: true });
  const changed = R.page !== lastPage; lastPage = R.page;
  render(changed);
}

/* ───────── chrome ───────── */
function renderNav() {
  const urgent = live().filter(c => { const l = daysLeft(c); return l !== null && l <= 3 && status(c.record_id) !== "submitted" && status(c.record_id) !== "skip"; }).length;
  const mine = Object.values(ST.marks).filter(m => m.status && m.status !== "skip").length;
  const counts = { home: urgent ? `<span class="ct hot">${urgent}</span>` : "", contests: `<span class="ct">${live().length}</span>`, tracker: mine ? `<span class="ct">${mine}</span>` : "", festivals: `<span class="ct">${F.length}</span>`, sources: `<span class="ct">${SRC.length}</span>` };
  let g = "", h = "";
  for (const r of ROUTES) { if (r.g !== g) { g = r.g; h += `<div class="nav-g">${g}</div>`; } h += `<a href="#/${r.k}" class="${R.page === r.k ? "on" : ""}">${ico[r.i]}<span>${r.n}</span>${counts[r.k] || ""}</a>`; }
  $("#nav").innerHTML = h;
  $("#tabbar").innerHTML = ["home", "contests", "calendar", "tracker", "brief"].map(k => { const r = ROUTES.find(x => x.k === k); return `<a href="#/${k}" class="${R.page === k ? "on" : ""}">${ico[r.i]}<span>${r.n.replace("全部", "").replace("今日", "")}</span>${k === "home" && urgent ? `<i class="b">${urgent}</i>` : ""}</a>`; }).join("");
  const cur = ROUTES.find(r => r.k === R.page); $("#crumb").textContent = cur ? cur.n : "";
  document.title = `${cur ? cur.n + " · " : ""}影赛雷达 CineCall`;
  $$(".theme-seg button").forEach(b => b.classList.toggle("on", b.dataset.themeSet === (ST.prefs.theme || "auto")));
}
function applyTheme() { let t = ST.prefs.theme || "auto"; if (t === "auto") t = matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"; document.documentElement.dataset.theme = t; }
matchMedia("(prefers-color-scheme: dark)").addEventListener?.("change", applyTheme);

/* ───────── pages ───────── */
const V = {};
let tick = null;

V.home = () => {
  const L = live();
  const pool = L.filter(c => { const l = daysLeft(c), s = status(c.record_id); return l !== null && s !== "submitted" && s !== "skip" && s !== "result"; }).sort(byDl);
  const hero = pool.find(c => isMine(c.record_id)) || pool.find(c => G[gr(c)] <= 2) || pool[0];
  const w7 = L.filter(c => { const l = daysLeft(c); return l !== null && l <= 7; });
  const mineSoon = C.filter(c => ["want", "making"].includes(status(c.record_id)) && isOpen(c)).sort(byDl);
  const top = L.filter(c => G[gr(c)] <= 1 && status(c.record_id) !== "skip").sort((a, b) => G[gr(a)] - G[gr(b)] || byDl(a, b));
  const fc = L.filter(c => isFree(c) && hasCash(c) && status(c.record_id) !== "skip").sort((a, b) => cashCNY(b) - cashCNY(a));
  const newOnes = L.filter(isNew);
  const sel = R.params.day || null;
  // 14-day strip
  let strip = "";
  for (let i = 0; i < 14; i++) {
    const d = new Date(T0); d.setDate(d.getDate() + i); const k = ymd(d);
    const ev = L.filter(c => c["截止日期"] === k).sort((a, b) => G[gr(a)] - G[gr(b)]);
    strip += `<button class="day ${i === 0 ? "t" : ""} ${sel === k ? "sel" : ""}" data-day="${k}" aria-label="${fmtMD(k)} ${ev.length} 个截止"><span class="wd">${i === 0 ? "今天" : "周" + WD[d.getDay()]}</span><span class="dn">${d.getDate()}</span><span class="dots">${ev.slice(0, 8).map(c => `<i class="dot ${gr(c)}"></i>`).join("")}</span>${ev.length ? `<span class="c">${ev.length}</span>` : ""}</button>`;
  }
  const selList = sel ? L.filter(c => c["截止日期"] === sel).sort((a, b) => G[gr(a)] - G[gr(b)]) : [];
  return `<div class="page-in">
  <section class="hero">
    ${hero ? `<div class="hero-main" data-open="${hero.record_id}">
      <div class="hero-k"><span class="pulse"></span>${isMine(hero.record_id) ? "你的下一个截止" : "最近截止的值得投赛事"}</div>
      <div class="hero-t">${esc(hero["名称"])}</div>
      <div class="hero-s">${gr(hero)} 级 · ${esc(short(hero["最高奖金"], 40))} · 报名 ${esc(short(feeTxt(hero), 18))}</div>
      <div class="hero-cd"><div class="cd" id="cd" data-to="${hero["截止日期"]}"></div>
      <div class="hero-cta">${hero["投递链接"] || hero["官网"] ? `<a class="btn-light" href="${esc(hero["投递链接"] || hero["官网"])}" target="_blank" rel="noopener" data-stop>去投递 ${ico.ext}</a>` : ""}<button class="btn-ghost-l ${isMine(hero.record_id) ? "on" : ""}" data-star="${hero.record_id}">${ico.star}${isMine(hero.record_id) ? SN[status(hero.record_id)] : "想投"}</button></div></div>
    </div>` : `<div class="hero-main"><div class="hero-t">暂时没有可追踪的截止</div></div>`}
    <div class="stats">
      <a class="stat" href="#/contests"><span>在征赛事</span><b class="num">${L.length}</b><i>含即将开放 / 待公布</i></a>
      <a class="stat red" href="#/contests?when=7"><span>7 天内截止</span><b class="num">${w7.length}</b><i>其中 3 天内 ${w7.filter(c => daysLeft(c) <= 3).length} 个</i></a>
      <a class="stat" href="#/contests?grade=SA"><span>S / A 级</span><b class="num">${L.filter(c => G[gr(c)] <= 1).length}</b><i>含金量高</i></a>
      <a class="stat acc" href="#/tracker"><span>我的投递</span><b class="num">${Object.values(ST.marks).filter(m => m.status && m.status !== "skip").length}</b><i>${mineSoon.length ? `${mineSoon.length} 个待完成` : "点 ☆ 开始追踪"}</i></a>
    </div>
  </section>

  <section class="sec"><div class="sec-h"><div><h2 class="h2">未来 14 天</h2><p>每个点是一个截止的赛事，颜色表示分级；点日期看当天截止的赛事</p></div><a class="link" href="#/calendar">完整日历 ${ico.r}</a></div>
    <div class="strip">${strip}</div>
    ${sel ? `<div class="strip-list list" style="margin-top:10px">${selList.length ? selList.map(c => row(c)).join("") : emptyBox(`${fmtMD(sel)} 没有截止的赛事`)}</div>` : ""}
  </section>

  ${mineSoon.length ? `<section class="sec"><div class="sec-h"><div><h2 class="h2">我在准备的</h2><p>标记为「想投」「制作中」、还没截止的赛事</p></div><a class="link" href="#/tracker">看板 ${ico.r}</a></div><div class="list">${mineSoon.slice(0, 5).map(c => row(c)).join("")}</div></section>` : ""}

  ${newOnes.length ? `<section class="sec"><div class="sec-h"><div><h2 class="h2">上次来之后新收录 <span class="tag soon">${newOnes.length}</span></h2></div></div><div class="cards">${newOnes.sort(byDl).slice(0, 6).map(card).join("")}</div></section>` : ""}

  <section class="sec"><div class="sec-h"><div><h2 class="h2">精选 · S / A 级</h2><p>认可度、可信度、资源回报、成本加权后含金量最高的一档</p></div><a class="link" href="#/contests?grade=SA">全部 ${ico.r}</a></div>
    <div class="cards">${top.slice(0, 9).map(card).join("") || emptyBox("暂无")}</div></section>

  <section class="sec"><div class="sec-h"><div><h2 class="h2">免费报名 · 有现金奖</h2><p>零成本就能投、而且写明了现金奖金，按奖金从高到低排</p></div><a class="link" href="#/contests?fee=free&cash=1&sort=prize">全部 ${ico.r}</a></div>
    <div class="cards">${fc.slice(0, 6).map(card).join("") || emptyBox("暂无")}</div></section>
  </div>`;
};
V.home.after = () => {
  const el = $("#cd"); if (!el) return;
  const to = parseD(el.dataset.to); if (!to) { el.innerHTML = `<div><b>—</b><span>截止待公布</span></div>`; return; }
  to.setHours(23, 59, 59, 0);
  const upd = () => {
    let ms = Math.max(0, to - now()); const d = Math.floor(ms / 864e5); ms -= d * 864e5; const h = Math.floor(ms / 36e5); ms -= h * 36e5; const m = Math.floor(ms / 6e4); const s = Math.floor((ms - m * 6e4) / 1e3);
    el.innerHTML = [[d, "天"], [h, "时"], [m, "分"], [s, "秒"]].map(([v, u]) => `<div><b class="num">${String(v).padStart(2, "0")}</b><span>${u}</span></div>`).join("");
  };
  upd(); tick = setInterval(upd, 1000);
};

/* contests */
const FDEF = { q: "", when: "open", grade: "", topic: "", fee: "", cash: "", region: "", form: "", mine: "", sort: "dl" };
const filt = () => ({ ...FDEF, ...R.params });
function applyFilters(p, { ignore } = {}) {
  const q = (p.q || "").trim().toLowerCase();
  return C.filter(c => {
    const l = daysLeft(c), f = k => ignore !== k;
    if (f("when")) {
      if (p.when === "open" && !isOpen(c)) return false;
      if (["3", "7", "30"].includes(p.when) && !(isOpen(c) && l !== null && l <= +p.when)) return false;
      if (p.when === "tba" && l !== null) return false;
    }
    if (f("grade") && p.grade && !p.grade.includes(gr(c))) return false;
    if (f("topic") && p.topic && c["命题"] !== p.topic) return false;
    if (f("fee") && p.fee === "free" && !isFree(c)) return false;
    if (f("cash") && p.cash && !hasCash(c)) return false;
    if (f("region") && p.region === "cn" && !isCN(c)) return false;
    if (f("region") && p.region === "intl" && isCN(c)) return false;
    if (f("form") && p.form && !formsOf(c).includes(p.form)) return false;
    if (f("mine") && p.mine && !isMine(c.record_id)) return false;
    if (!p.mine && status(c.record_id) === "skip" && p.when === "open") return false;
    if (q && !q.split(/\s+/).every(w => hay(c).includes(w))) return false;
    return true;
  });
}
const SORTS = { dl: ["截止最近", byDl], grade: ["分级最高", (a, b) => G[gr(a)] - G[gr(b)] || byDl(a, b)], prize: ["奖金最高", (a, b) => cashCNY(b) - cashCNY(a) || byDl(a, b)], name: ["名称", (a, b) => a["名称"].localeCompare(b["名称"], "zh")] };
V.contests = () => {
  const p = filt();
  const res = applyFilters(p).sort(SORTS[p.sort]?.[1] || byDl);
  const cnt = (k, v) => applyFilters({ ...p, [k]: v }, {}).length;
  const chip = (k, v, label) => { const on = (p[k] || "") === v; const n = cnt(k, v); return `<button class="chip ${on ? "on" : ""}" data-f="${k}" data-v="${v}">${label}<span class="n">${n}</span></button>`; };
  const toggleChip = (k, v, label) => { const on = p[k] === v; return `<button class="chip ${on ? "on" : ""}" data-f="${k}" data-v="${on ? "" : v}">${label}<span class="n">${applyFilters({ ...p, [k]: v }).length}</span></button>`; };
  const active = Object.keys(FDEF).filter(k => k !== "sort" && k !== "q" && (p[k] || "") !== FDEF[k]).length + (p.q ? 1 : 0);
  const view = ST.prefs.view || "list";
  return `<div class="page-in">
    <div class="eyebrow">全部赛事</div><h1 class="h1">找到适合你的片子的赛事</h1>
    <div class="toolbar">
      <div class="tb-r">
        <label class="field ${p.q ? "has" : ""}">${ico.search}<input id="fq" value="${esc(p.q)}" placeholder="搜名称、主办方、题材…空格分隔多个词" aria-label="搜索"><button class="clr" data-clear-q aria-label="清空">${ico.x}</button></label>
        <select class="sel" id="fsort" aria-label="排序">${Object.entries(SORTS).map(([k, [n]]) => `<option value="${k}" ${p.sort === k ? "selected" : ""}>${n}</option>`).join("")}</select>
        <div class="seg" role="group" aria-label="视图"><button data-view="list" class="${view === "list" ? "on" : ""}" title="列表">${ico.list}</button><button data-view="grid" class="${view === "grid" ? "on" : ""}" title="卡片">${ico.grid}</button></div>
      </div>
      <div class="chips">
        ${chip("when", "open", "在征")}${chip("when", "3", "3 天内")}${chip("when", "7", "7 天内")}${chip("when", "30", "30 天内")}${chip("when", "tba", "截止待公布")}${chip("when", "all", "含已截止")}
        <span class="chip-sep"></span>
        ${chip("grade", "", "全部分级")}${chip("grade", "SA", "S+A")}${chip("grade", "S", "S")}${chip("grade", "A", "A")}${chip("grade", "B", "B")}${chip("grade", "C", "C")}
      </div>
      <div class="chips">
        ${toggleChip("fee", "free", "免费报名")}${toggleChip("cash", "1", "有现金奖")}${toggleChip("topic", "自由投稿", "自由投稿")}${toggleChip("topic", "命题", "命题")}
        <span class="chip-sep"></span>${toggleChip("region", "cn", "国内")}${toggleChip("region", "intl", "海外 / 线上")}
        <span class="chip-sep"></span>${FORMS.map(([n]) => toggleChip("form", n, n)).join("")}
        <span class="chip-sep"></span>${toggleChip("mine", "1", "★ 我标记的")}
      </div>
    </div>
    <div class="result-h"><span>共 <b class="num" style="color:var(--ink)">${res.length}</b> 个赛事 · ${SORTS[p.sort]?.[0] || "截止最近"}${view === "list" ? ' · <span class="muted">J/K 上下移动，Enter 打开，S 标记</span>' : ""}</span>${active ? `<button class="btn-txt" data-reset>清除 ${active} 个筛选</button>` : ""}</div>
    ${res.length ? (view === "grid" ? `<div class="cards">${res.map(card).join("")}</div>` : `<div class="list" id="rows">${res.map(c => row(c, p.q)).join("")}</div>`) : emptyBox("没有符合条件的赛事", `<button class="btn sm" data-reset style="margin-top:6px">清除筛选</button>`)}
  </div>`;
};
V.contests.after = () => {
  const q = $("#fq"); if (!q) return;
  const push = debounce(() => { const p = filt(); p.q = q.value; nav("contests", clean(p), { replace: true }); }, 220);
  q.addEventListener("input", () => { q.closest(".field").classList.toggle("has", !!q.value); push(); });
  if (R.params.q && document.activeElement !== q && R.params._f) q.focus();
  $("#fsort").onchange = e => nav("contests", clean({ ...filt(), sort: e.target.value }), { replace: true });
  listCtx = $$("#rows [data-open], .cards [data-open]").map(e => e.dataset.open);
};
const clean = p => Object.fromEntries(Object.entries(p).filter(([k, v]) => v !== "" && v != null && FDEF[k] !== v && !k.startsWith("_")));
let listCtx = [];

/* calendar */
let calM = null;
V.calendar = () => {
  if (!calM) calM = new Date(T0.getFullYear(), T0.getMonth(), 1);
  const scope = R.params.scope || "all";
  const pool = C.filter(c => scope === "mine" ? isMine(c.record_id) : scope === "top" ? G[gr(c)] <= 2 : true);
  const start = new Date(calM); start.setDate(1 - ((calM.getDay() + 6) % 7));
  let h = "一二三四五六日".split("").map(x => `<div class="wd">周${x}</div>`).join("");
  const dayOpen = R.params.day;
  for (let i = 0; i < 42; i++) {
    const d = new Date(start); d.setDate(start.getDate() + i); const k = ymd(d);
    const ev = pool.filter(c => c["截止日期"] === k).sort((a, b) => (isMine(b.record_id) - isMine(a.record_id)) || G[gr(a)] - G[gr(b)]);
    const out = d.getMonth() !== calM.getMonth(); if (i >= 35 && out && d.getDate() >= 7 && i % 7 === 0) break;
    h += `<div class="cell ${out ? "out" : ""} ${+d === +T0 ? "t" : ""} ${d < T0 ? "past" : ""}"><div class="n"><b>${d.getDate()}</b>${ev.length > 3 ? `<span class="muted" style="font-weight:500">${ev.length}</span>` : ""}</div>
      ${ev.slice(0, 3).map(c => `<div class="ev ${gr(c)} ${isMine(c.record_id) ? "mine" : ""}" data-open="${c.record_id}" title="${esc(c["名称"])}"><span>${isMine(c.record_id) ? "★ " : ""}${esc(c["名称"])}</span></div>`).join("")}
      ${ev.length > 3 ? `<a class="ev-more" href="#/calendar?${new URLSearchParams({ ...R.params, day: k })}">+${ev.length - 3} 个</a>` : ""}${ev.length && innerWidth <= 860 ? `<a class="ev-more" style="display:block;position:absolute;inset:0" href="#/calendar?${new URLSearchParams({ ...R.params, day: k })}" aria-label="查看"></a>` : ""}</div>`;
  }
  const dayList = dayOpen ? pool.filter(c => c["截止日期"] === dayOpen).sort((a, b) => G[gr(a)] - G[gr(b)]) : [];
  const monthN = pool.filter(c => { const d = parseD(c["截止日期"]); return d && d.getMonth() === calM.getMonth() && d.getFullYear() === calM.getFullYear(); }).length;
  return `<div class="page-in">
    <div class="eyebrow">截止日历</div>
    <div class="cal-head">
      <button class="icon-btn" data-cal="-1" aria-label="上个月">${ico.l}</button><h1 class="h1">${calM.getFullYear()} 年 ${calM.getMonth() + 1} 月</h1><button class="icon-btn" data-cal="1" aria-label="下个月">${ico.r}</button>
      <button class="btn sm" data-cal="0">回到本月</button>
      <span class="muted" style="font-size:12.5px">本月 ${monthN} 个截止</span>
      <div class="legend"><span><i class="dot S"></i>S</span><span><i class="dot A"></i>A</span><span><i class="dot B"></i>B</span><span><i class="dot"></i>C</span><span>★ 我标记的</span></div>
    </div>
    <div class="tb-r" style="margin-bottom:12px">
      <div class="seg" role="group">${[["all", "全部"], ["top", "B 级以上"], ["mine", "我标记的"]].map(([k, n]) => `<button class="${scope === k ? "on" : ""}" data-scope="${k}">${n}</button>`).join("")}</div>
      <span style="flex:1"></span>
      <button class="btn" data-ics>${ico.bell}导出到手机日历（.ics）</button>
    </div>
    <div class="cal" style="position:relative">${h}</div>
    ${dayOpen ? `<section class="sec" style="margin-top:18px"><div class="sec-h"><h2 class="h2">${fmtFull(dayOpen)} 截止 · ${dayList.length} 个</h2><a class="link" href="#/calendar${scope !== "all" ? "?scope=" + scope : ""}">收起 ${ico.x}</a></div><div class="list">${dayList.map(c => row(c)).join("") || emptyBox("当天没有截止")}</div></section>` : ""}
  </div>`;
};
function exportICS(list, name = "ai-contest-deadlines.ics") {
  const e = s => String(s || "").replace(/[\\;,]/g, m => "\\" + m).replace(/\r?\n/g, "\\n");
  const f = d => ymd(d).replace(/-/g, "");
  const stamp = new Date().toISOString().replace(/[-:]/g, "").slice(0, 15) + "Z";
  let t = "BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//CineCall//AI Contest Radar//ZH\r\nCALSCALE:GREGORIAN\r\nX-WR-CALNAME:AI 影像赛事截止\r\n";
  for (const c of list) {
    const d = parseD(c["截止日期"]); if (!d) continue; const d2 = new Date(d); d2.setDate(d.getDate() + 1);
    t += `BEGIN:VEVENT\r\nUID:${c.record_id}@cinecall\r\nDTSTAMP:${stamp}\r\nDTSTART;VALUE=DATE:${f(d)}\r\nDTEND;VALUE=DATE:${f(d2)}\r\nSUMMARY:${e(`【${gr(c)}】截止 · ${c["名称"]}`)}\r\nDESCRIPTION:${e(`最高奖励：${c["最高奖金"]}\n报名费：${c["报名费"]}\n投递：${c["投递链接"] || c["官网"] || "—"}`)}\r\n${c["投递链接"] || c["官网"] ? `URL:${c["投递链接"] || c["官网"]}\r\n` : ""}BEGIN:VALARM\r\nTRIGGER:-P3D\r\nACTION:DISPLAY\r\nDESCRIPTION:${e("3 天后截止：" + c["名称"])}\r\nEND:VALARM\r\nBEGIN:VALARM\r\nTRIGGER:-PT15H\r\nACTION:DISPLAY\r\nDESCRIPTION:${e("今天截止：" + c["名称"])}\r\nEND:VALARM\r\nEND:VEVENT\r\n`;
  }
  download(name, t + "END:VCALENDAR\r\n", "text/calendar");
}

/* tracker */
V.tracker = () => {
  const cols = STATUSES.map(s => {
    const items = C.filter(c => status(c.record_id) === s.k).sort(byDl);
    return `<div class="col" data-col="${s.k}"><div class="col-h"><i style="background:${s.c}"></i>${s.n}<span class="n">${items.length}</span></div>
      ${items.map(c => { const l = daysLeft(c), m = mk(c.record_id); return `<div class="kcard" draggable="true" data-kid="${c.record_id}" data-open="${c.record_id}">
        <div class="km">${gBadge(c)}${isFree(c) ? '<span class="tag free">免费</span>' : ""}<span class="d ${urg(l)}" style="${l !== null && l <= 3 ? "color:var(--red)" : l !== null && l <= 7 ? "color:var(--amber)" : ""}">${l === null ? "待定" : l < 0 ? "已截止" : l === 0 ? "今天截止" : l + " 天"}</span></div>
        <h4>${esc(c["名称"])}</h4>${m?.note ? `<div class="note">${esc(m.note)}</div>` : ""}</div>`; }).join("") || `<div class="col-empty">${s.k === "want" ? "在任意赛事上点 ☆ 加进来" : "把卡片拖到这里"}</div>`}
    </div>`;
  }).join("");
  const skipped = C.filter(c => status(c.record_id) === "skip");
  return `<div class="page-in">
    <div class="eyebrow">我的投递</div><h1 class="h1">投递看板</h1>
    <p class="lede">从「想投」拖到「制作中」「已投」「已出结果」。点卡片可以写备注：版本、字幕、投稿编号、账号。记录只存在这个浏览器里，换设备前记得导出。</p>
    <div class="btns" style="margin-bottom:14px"><button class="btn" data-export>${ico.dl}导出备份</button><label class="btn">${ico.up2}导入备份<input type="file" accept=".json" data-import hidden></label><button class="btn" data-ics-mine>${ico.bell}我的截止导出到日历</button></div>
    <div class="board">${cols}</div>
    ${skipped.length ? `<section class="sec" style="margin-top:26px"><div class="sec-h"><div><h2 class="h2">已忽略 <span class="muted" style="font-weight:500">${skipped.length}</span></h2><p>这些赛事不会出现在首页和默认列表里</p></div></div><div class="list">${skipped.map(c => row(c)).join("")}</div></section>` : ""}
  </div>`;
};
V.tracker.after = () => {
  let dragId = null;
  $$(".kcard").forEach(k => {
    k.addEventListener("dragstart", e => { dragId = k.dataset.kid; k.classList.add("drag"); e.dataTransfer.effectAllowed = "move"; e.dataTransfer.setData("text/plain", dragId); });
    k.addEventListener("dragend", () => k.classList.remove("drag"));
  });
  $$(".col").forEach(col => {
    col.addEventListener("dragover", e => { e.preventDefault(); col.classList.add("over"); });
    col.addEventListener("dragleave", () => col.classList.remove("over"));
    col.addEventListener("drop", e => { e.preventDefault(); col.classList.remove("over"); const id = e.dataTransfer.getData("text/plain") || dragId; if (id && status(id) !== col.dataset.col) setStatus(id, col.dataset.col); });
  });
};

/* brief */
function briefData() {
  const L = live(); const rng = (a, b) => L.filter(c => { const l = daysLeft(c); return l !== null && l >= a && l <= b && status(c.record_id) !== "skip"; }).sort((x, y) => byDl(x, y) || G[gr(x)] - G[gr(y)]);
  return { L, t01: rng(0, 1), t23: rng(2, 3), wk: rng(4, 7), mo: rng(8, 30).filter(c => G[gr(c)] <= 1), fc: L.filter(c => isFree(c) && hasCash(c) && (daysLeft(c) ?? 99) > 7 && (daysLeft(c) ?? 0) <= 45).sort((a, b) => cashCNY(b) - cashCNY(a)).slice(0, 5) };
}
V.brief = () => {
  const b = briefData(); const urgentTop = [...b.t01, ...b.t23, ...b.wk].filter(c => G[gr(c)] <= 1 && status(c.record_id) !== "submitted");
  const mineDue = [...b.t01, ...b.t23, ...b.wk].filter(c => ["want", "making"].includes(status(c.record_id)));
  const item = c => { const l = daysLeft(c); return `<div class="bi" data-open="${c.record_id}"><div class="bd num ${urg(l)}" style="${l <= 3 ? "color:var(--red)" : ""}">${fmtMD(c["截止日期"]).replace("月", "/").replace("日", "")}</div><div><div class="bt">${gBadge(c)}${esc(c["名称"])}${tags(c, { max: 3 })}</div><div class="bs">🏆 ${esc(short(c["最高奖金"], 60))} · 报名 ${esc(short(feeTxt(c), 24))}</div></div></div>`; };
  const sec = (t, a, e = "没有") => `<div class="brief-sec"><h3>${t}<span class="n">${a.length}</span></h3>${a.length ? a.map(item).join("") : `<p class="muted" style="margin:6px 0">${e}</p>`}</div>`;
  const d = T0;
  return `<div class="page-in brief">
    <div class="btns" style="justify-content:flex-end;margin:10px 0 12px"><button class="btn" data-copy-brief="text">${ico.copy}复制纯文本</button><button class="btn" data-copy-brief="md">${ico.copy}复制 Markdown</button><button class="btn" onclick="print()">${ico.doc}打印 / 存 PDF</button></div>
    <article class="brief-card">
      <div class="eyebrow">AI 影像赛事日报 · ${d.getFullYear()}.${d.getMonth() + 1}.${d.getDate()} 周${WD[d.getDay()]}</div>
      <h1 class="h1" style="margin-bottom:0">今天还有 ${b.t01.length + b.t23.length} 个赛事在 3 天内截止</h1>
      <p class="lead">在征 <b>${b.L.length}</b> 个赛事，一周内截止 <b>${b.t01.length + b.t23.length + b.wk.length}</b> 个。${mineDue.length ? `你标记的有 <b>${mineDue.length}</b> 个本周截止：${mineDue.slice(0, 3).map(c => `<b>${esc(c["名称"])}</b>`).join("、")}。` : ""}${urgentTop.length ? `最值得优先处理的高分级赛事：${urgentTop.slice(0, 3).map(c => `<b>${esc(c["名称"])}</b>（${fmtMD(c["截止日期"])}）`).join("、")}。` : "本周没有未投的 S/A 级赛事。"}</p>
      ${sec("⏰ 今天 / 明天截止", b.t01)}${sec("🔥 2–3 天内截止", b.t23)}${sec("📌 本周截止（4–7 天）", b.wk)}${sec("⭐ 30 天内的 S / A 级", b.mo)}${sec("💰 免费 + 现金奖 · 时间还充裕", b.fc)}
      <p class="muted" style="font-size:12px;margin-top:24px">剩余天数按本机日期计算；截止时间以各主办方官网公布的时区为准。数据快照 ${esc(D.contests.snapshot_date || "")}。</p>
    </article></div>`;
};
function briefText(md) {
  const b = briefData(), d = T0;
  const line = c => md ? `- **${c["名称"]}**（${gr(c)} 级）— ${fmtMD(c["截止日期"])}截止；${c["最高奖金"]}；报名 ${feeTxt(c)}${c["投递链接"] || c["官网"] ? `；[投递](${c["投递链接"] || c["官网"]})` : ""}` : `· ${c["名称"]}【${gr(c)}】${fmtMD(c["截止日期"])}截止｜${short(c["最高奖金"], 40)}｜报名${short(feeTxt(c), 16)}`;
  const sec = (t, a) => a.length ? `\n${md ? "## " : "【"}${t}${md ? "" : "】"}\n${a.map(line).join("\n")}\n` : "";
  return `${md ? "# " : ""}AI 影像赛事日报 ${d.getFullYear()}.${d.getMonth() + 1}.${d.getDate()}\n在征 ${b.L.length} 个 · 3 天内截止 ${b.t01.length + b.t23.length} 个 · 一周内 ${b.t01.length + b.t23.length + b.wk.length} 个\n` +
    sec("今天/明天截止", b.t01) + sec("2–3 天内截止", b.t23) + sec("本周截止", b.wk) + sec("30 天内 S/A 级", b.mo) + sec("免费+现金奖", b.fc) + `\n截止以官网为准`;
}

/* festivals */
V.festivals = () => `<div class="page-in"><div class="eyebrow">资料</div><h1 class="h1">全球知名电影节</h1><p class="lede">FIAPF 认证等传统电影节。想让 AI 作品走长片或短片节路线时，用来规划档期。</p>
  <div class="tbl-wrap"><table><thead><tr><th>电影节</th><th>国家 / 城市</th><th>类别</th><th>每年举办</th><th>最高奖</th><th>最新档期</th></tr></thead><tbody>
  ${F.map(f => `<tr><td><b>${esc(f["电影节"])}</b>${f["备注"] ? `<div class="sub">${esc(f["备注"])}</div>` : ""}</td><td>${esc(f["国家/城市"])}</td><td><span class="tag ${/A类/.test(f["类别"]) ? "cash" : ""}">${esc(f["类别"])}</span></td><td>${esc(f["每年举办时间"])}</td><td>${esc(f["最高奖"])}</td><td style="min-width:220px">${esc(f["最新档期"])}</td></tr>`).join("")}
  </tbody></table></div></div>`;

/* sources */
V.sources = () => {
  const pf = R.params.pf || "", q = (R.params.q || "").toLowerCase();
  const plats = [...new Set(SRC.map(s => (s["平台"] || "其他").replace(/.+官网$/, "平台官网")))];
  const cnt = p => SRC.filter(s => (s["平台"] || "其他").replace(/.+官网$/, "平台官网") === p).length;
  const list = SRC.filter(s => (!pf || (s["平台"] || "其他").replace(/.+官网$/, "平台官网") === pf) && (!q || `${s["名称"]} ${s["代表内容"]} ${s["简介"]}`.toLowerCase().includes(q))).sort((a, b) => String(b["发布时间"] || "").localeCompare(String(a["发布时间"] || "")));
  return `<div class="page-in"><div class="eyebrow">资料</div><h1 class="h1">赛事线索从哪来</h1><p class="lede">${SRC.length} 个信源，每个是一个账号主体。每天巡检，发现新赛事后回到主办方官网核实，再收进赛事表。</p>
  <div class="toolbar"><div class="tb-r"><label class="field ${q ? "has" : ""}">${ico.search}<input id="sq" value="${esc(R.params.q || "")}" placeholder="搜信源名称或代表内容"><button class="clr" data-clear-sq>${ico.x}</button></label></div>
  <div class="chips"><button class="chip ${!pf ? "on" : ""}" data-pf="">全部<span class="n">${SRC.length}</span></button>${plats.map(p => `<button class="chip ${pf === p ? "on" : ""}" data-pf="${esc(p)}">${esc(p)}<span class="n">${cnt(p)}</span></button>`).join("")}</div></div>
  <div class="tbl-wrap"><table><thead><tr><th>信源</th><th>平台</th><th>代表内容</th><th>最近发布</th><th>IP 属地</th></tr></thead><tbody>
  ${list.map(s => `<tr><td>${s["主页链接"] ? `<a class="ext" href="${esc(s["主页链接"])}" target="_blank" rel="noopener"><b>${esc(s["名称"])}</b>${ico.ext}</a>` : `<b>${esc(s["名称"])}</b>`}${s["简介"] && s["简介"] !== s["名称"] ? `<div class="sub">${esc(short(s["简介"], 40))}</div>` : ""}</td><td><span class="tag">${esc(s["平台"] || "—")}</span></td><td>${esc(s["代表内容"] || "—")}</td><td class="num muted" style="white-space:nowrap">${esc(s["发布时间"] || "—")}</td><td class="muted">${esc(s["IP属地"] || "—")}</td></tr>`).join("") || `<tr><td colspan="5">${emptyBox("没有匹配的信源")}</td></tr>`}
  </tbody></table></div></div>`;
};
V.sources.after = () => { const i = $("#sq"); if (!i) return; const push = debounce(() => nav("sources", clean2({ ...R.params, q: i.value }), { replace: true }), 220); i.addEventListener("input", () => { i.closest(".field").classList.toggle("has", !!i.value); push(); }); if (R.params._f) i.focus(); };
const clean2 = p => Object.fromEntries(Object.entries(p).filter(([k, v]) => v && !k.startsWith("_")));

/* about */
V.about = () => {
  const gc = { S: 0, A: 0, B: 0, C: 0 }; C.forEach(c => gc[gr(c)]++);
  return `<div class="page-in about"><div class="eyebrow">收录与分级</div><h1 class="h1">影赛雷达是怎么工作的</h1>
  <p class="lede">把散在公众号、小红书、FilmFreeway 和官网上的 AI 视频赛事收到一处；同一个赛事被十个号转发，这里只出现一次，截止日一律以官方页面为准。</p>
  <div class="steps"><div class="step"><b>01 · 巡检</b><p>每天看一遍 ${SRC.length} 个信源，捞出新赛事、延期和规则变化。</p></div><div class="step"><b>02 · 核实</b><p>回到主办方官网逐条核对截止日、奖金和报名费；多档截止取最后一档。</p></div><div class="step"><b>03 · 分级</b><p>按四个维度加权打分，分成 S / A / B / C 四档。</p></div><div class="step"><b>04 · 提醒</b><p>截止雷达、日历、日报；标记后在看板里跟进到出结果。</p></div></div>
  <h2>分级怎么算</h2>
  <div class="weights"><div style="flex:35;background:#4338ca">认可度 35%</div><div style="flex:30;background:#6366f1">可信度 30%</div><div style="flex:20;background:#ca8a04">资源回报 20%</div><div style="flex:15;background:#16a34a">成本 15%</div></div>
  <div class="tbl-wrap grade-tbl"><table><tbody>
    <tr><td><span class="g g-S">S</span></td><td><b>顶级</b>：老牌电影节 AI 单元、头部平台的大额基金或赛事。当前 ${gc.S} 个</td></tr>
    <tr><td><span class="g g-A">A</span></td><td><b>优先投</b>：认可度高、规则清楚、回报明确。首届赛事没有往届可以交叉验证，最高只给 A。当前 ${gc.A} 个</td></tr>
    <tr><td><span class="g g-B">B</span></td><td><b>值得投</b>：有真实展映或奖金，但影响力或回报一般。当前 ${gc.B} 个</td></tr>
    <tr><td><span class="g g-C">C</span></td><td><b>按需投</b>：收费投奖型节展、只有电子证书、或信息不全。当前 ${gc.C} 个</td></tr>
  </tbody></table></div>
  <h2>收录红线</h2>
  <ul><li>只收 AI 视频 / 影像类，不收 AI 音乐类</li><li>官网必须是官方站；确实没有独立官网时，填平台直达页并备注</li><li>只收有明确在征窗口的赛事</li><li>截止超过 7 天清理，删之前逐条核实是否延期</li></ul>
  <h2>这个页面上的小约定</h2>
  <ul><li>剩余天数按你的设备当天日期实时计算；首页倒计时按截止当天 23:59（本地时间）计。</li><li>「免费」「有现金奖」由报名费和奖金文字自动识别，奖金排序按大致汇率折成人民币，只用来比较，不代表实际金额。</li><li>你的标记和备注只存在本浏览器，不会上传。</li><li>快捷键：<kbd>/</kbd> 或 <kbd>⌘K</kbd> 搜索，<kbd>J</kbd><kbd>K</kbd> 列表上下，<kbd>Enter</kbd> 打开，<kbd>S</kbd> 标记想投，<kbd>←</kbd><kbd>→</kbd> 详情里切换上一个 / 下一个，<kbd>Esc</kbd> 关闭。</li></ul>
  </div>`;
};

/* ───────── render ───────── */
function render(changed = true) {
  clearInterval(tick);
  const y = scrollY;
  $("#view").innerHTML = (V[R.page] || V.home)();
  V[R.page]?.after?.();
  if (!listCtx.length || R.page !== "contests") listCtx = $$("#view [data-open]").map(e => e.dataset.open).filter((v, i, a) => a.indexOf(v) === i);
  renderNav();
  if (changed) { scrollTo(0, 0); $("#side").classList.remove("on"); $("#scrim").classList.remove("on"); } else scrollTo(0, y);
}
function refresh() { render(false); if ($("#drawer").classList.contains("on")) fillDrawer(curId); }

/* ───────── drawer ───────── */
let curId = null;
function openDrawer(id, { fromRoute } = {}) {
  if (!byId.has(id)) return;
  curId = id; fillDrawer(id);
  $("#drawer").classList.add("on"); $("#mask").classList.add("on"); document.body.style.overflow = "hidden";
  if (!fromRoute) history.pushState({ drawer: 1 }, "", `#/c/${encodeURIComponent(id)}`);
  setTimeout(() => $("#drawer .dr-x")?.focus({ preventScroll: true }), 50);
}
function closeDrawer({ fromRoute } = {}) {
  if (!$("#drawer").classList.contains("on")) return;
  $("#drawer").classList.remove("on"); $("#mask").classList.remove("on"); document.body.style.overflow = "";
  curId = null;
  if (!fromRoute && location.hash.startsWith("#/c/")) { if (history.state?.drawer) history.back(); else history.replaceState(null, "", `#/${lastPage || "home"}`); }
}
function milestones(c) {
  const t = String(c["计划备注"] || "") + "\n" + String(c["赛事说明"] || "");
  const out = []; const re = /([^\s；;，,。()（）]{0,10})\s*(\d{4})[-./年](\d{1,2})[-./月](\d{1,2})日?/g; let m;
  while ((m = re.exec(t))) { const d = new Date(+m[2], +m[3] - 1, +m[4]); if (isNaN(d)) continue; out.push({ d, label: (m[1] || "").replace(/[：:至\-–]$/, "").trim() || "节点" }); }
  const dl = parseD(c["截止日期"]); if (dl) out.push({ d: dl, label: "最终截止", main: 1 });
  const seen = new Set(); return out.filter(x => { const k = ymd(x.d) + (x.main ? "m" : ""); if (seen.has(ymd(x.d))) { if (x.main) { const o = out.find(y => ymd(y.d) === ymd(x.d)); if (o) o.main = 1; } return false; } seen.add(ymd(x.d)); return true; }).sort((a, b) => a.d - b.d).slice(0, 8);
}
function ring(l) {
  if (l === null || l < 0) return "";
  const frac = Math.max(0.03, Math.min(1, 1 - l / 60)); const r = 24, cir = 2 * Math.PI * r;
  const col = l <= 3 ? "var(--red)" : l <= 7 ? "var(--amber)" : "var(--accent)";
  return `<svg class="ring" viewBox="0 0 56 56"><circle cx="28" cy="28" r="${r}" stroke="var(--line)" stroke-width="5" fill="none"/><circle cx="28" cy="28" r="${r}" stroke="${col}" stroke-width="5" fill="none" stroke-dasharray="${cir}" stroke-dashoffset="${cir * (1 - frac)}" transform="rotate(-90 28 28)" stroke-linecap="round"/></svg>`;
}
function fillDrawer(id) {
  const c = byId.get(id); if (!c) return; const l = daysLeft(c), m = mk(id) || {}, s = m.status || null;
  const url = c["投递链接"] || c["官网"]; const ln = u => u && /^https?:/.test(u) ? `<a href="${esc(u)}" target="_blank" rel="noopener">${esc(u.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, ""))}</a>` : esc(u || "—");
  const idx = listCtx.indexOf(id); const ms = milestones(c); const cash = cashCNY(c);
  const [intro, ...rest] = String(c["赛事说明"] || "").split(/\n+/);
  $("#drawer").innerHTML = `
  <div class="dr-head">${gBadge(c)}${tags(c, { max: 5 })}<span class="sp"></span>
    ${idx >= 0 ? `<div class="dr-nav"><button class="icon-btn" data-dr-nav="-1" ${idx <= 0 ? "disabled style=opacity:.3" : ""} title="上一个（←）">${ico.up}</button><button class="icon-btn" data-dr-nav="1" ${idx >= listCtx.length - 1 ? "disabled style=opacity:.3" : ""} title="下一个（→）">${ico.down}</button></div>` : ""}
    <button class="icon-btn" data-share title="复制链接">${ico.link}</button><button class="icon-btn dr-x" data-act="closeDrawer" title="关闭（Esc）">${ico.x}</button></div>
  <div class="dr-body">
    <h2 class="dr-t">${esc(c["名称"])}</h2>
    <div class="dr-org">${esc(c["主办方"] || "")}${c["地区"] ? ` · ${esc(c["地区"])}` : ""}</div>
    <div class="dr-cd ${urg(l)}">
      <div class="big num">${l === null ? "待定" : l < 0 ? "已截止" : l === 0 ? "今天" : l}${l > 0 ? "<small>天</small>" : ""}</div>
      <div class="meta">截止 <b>${fmtFull(c["截止日期"])}</b><br>${esc(c["征集状态"] || "")}${c["剩余天数"] != null ? "" : ""}</div>${ring(l)}
    </div>
    <dl class="kv">
      <div class="wide"><dt>${ico.trophy} 最高奖励 ${cash > 1 ? `<span class="muted">${fmtCNY(cash)}</span>` : ""}</dt><dd>${esc(c["最高奖金"] || "—")}</dd></div>
      <div><dt>${ico.ticket} 报名费</dt><dd>${esc(feeTxt(c) || "—")}</dd></div>
      <div><dt>命题</dt><dd>${esc(c["命题"] || "—")}</dd></div>
      <div><dt>类别</dt><dd>${esc(c["类别"] || "—")}</dd></div>
      <div><dt>${ico.pin} 地区</dt><dd>${esc(c["地区"] || "—")}</dd></div>
      <div class="wide"><dt>官网</dt><dd>${ln(c["官网"])}</dd></div>
      ${c["投递链接"] && c["投递链接"] !== c["官网"] ? `<div class="wide"><dt>投递入口</dt><dd>${ln(c["投递链接"])}</dd></div>` : ""}
    </dl>
    ${ms.length > 1 ? `<div class="dr-h">时间节点</div><ul class="timeline">${(() => { const nx = ms.findIndex(x => x.d >= T0); return ms.map((x, i) => `<li class="${x.d < T0 ? "done" : i === nx ? "next" : ""}"><i></i><b>${ymd(x.d)}</b><span>${esc(x.label)}${x.main ? " · <b>最终截止</b>" : ""}</span></li>`).join(""); })()}</ul>` : ""}
    <div class="dr-h">我的进度</div>
    <div class="status-pick">${STATUSES.map(x => `<button data-set="${x.k}" class="${s === x.k ? "on" : ""}">${x.n}</button>`).join("")}<button data-set="skip" class="${s === "skip" ? "on" : ""}">忽略</button></div>
    <textarea class="note-in" id="noteIn" placeholder="备注：投哪个版本、字幕是否齐、投稿编号、账号…（自动保存）" style="margin-top:8px">${esc(m.note || "")}</textarea>
    ${intro ? `<div class="dr-h">赛事说明</div><div class="prose">${esc(intro)}${rest.length ? "\n\n" + esc(rest.join("\n")) : ""}</div>` : ""}
    ${c["计划备注"] ? `<div class="dr-h">档期与备注</div><div class="prose">${esc(c["计划备注"])}</div>` : ""}
  </div>
  <div class="dr-foot">${url ? `<a class="btn pri" href="${esc(url)}" target="_blank" rel="noopener">去投递 ${ico.ext}</a>` : ""}
    <button class="btn" data-ics-one title="加入日历，提前 3 天提醒">${ico.bell}提醒我</button>
    <button class="btn" data-copy-one>${ico.copy}复制信息</button></div>`;
  const ta = $("#noteIn");
  ta.addEventListener("input", debounce(() => { const v = ta.value.trim(); if (v) ST.marks[id] = { ...(ST.marks[id] || {}), note: v, updated: Date.now() }; else if (ST.marks[id]) { delete ST.marks[id].note; if (!ST.marks[id].status) delete ST.marks[id]; } save(); render(false); }, 400));
}
const infoText = c => `${c["名称"]}（${gr(c)} 级）\n截止：${fmtFull(c["截止日期"])}\n奖励：${c["最高奖金"]}\n报名费：${c["报名费"]}\n命题：${c["命题"]}\n官网：${c["官网"] || "—"}${c["投递链接"] && c["投递链接"] !== c["官网"] ? `\n投递：${c["投递链接"]}` : ""}`;

/* ───────── palette ───────── */
let palSel = 0, palItems = [];
function openPalette(q = "") { $("#palette").classList.add("on"); const i = $("#palQ"); i.value = q; palRender(); setTimeout(() => i.focus(), 10); }
function closePalette() { $("#palette").classList.remove("on"); }
function palRender() {
  const q = $("#palQ").value.trim().toLowerCase();
  const pages = ROUTES.filter(r => !q || r.n.includes(q) || r.k.includes(q)).map(r => ({ t: "page", k: r.k, n: r.n, i: r.i }));
  const acts = [
    { n: "只看 7 天内截止", go: () => nav("contests", { when: "7" }) }, { n: "只看免费报名", go: () => nav("contests", { fee: "free" }) },
    { n: "只看 S / A 级", go: () => nav("contests", { grade: "SA" }) }, { n: "切换深色 / 浅色", go: () => { ST.prefs.theme = document.documentElement.dataset.theme === "dark" ? "light" : "dark"; save(); applyTheme(); renderNav(); } },
    { n: "复制今日简报", go: () => copy(briefText(false), "已复制今日简报") },
  ].filter(a => !q || a.n.toLowerCase().includes(q)).map(a => ({ t: "act", ...a }));
  let cs = [];
  if (q) { const ws = q.split(/\s+/); cs = C.map(c => { const n = c["名称"].toLowerCase(); let sc = 0; if (n.startsWith(q)) sc = 3; else if (n.includes(q)) sc = 2; else if (ws.every(w => hay(c).includes(w))) sc = 1; return [sc, c]; }).filter(x => x[0]).sort((a, b) => b[0] - a[0] || byDl(a[1], b[1])).slice(0, 12).map(x => ({ t: "c", c: x[1] })); }
  else cs = live().filter(c => daysLeft(c) !== null).sort(byDl).slice(0, 6).map(c => ({ t: "c", c }));
  const fs = q ? F.filter(f => `${f["电影节"]} ${f["国家/城市"]}`.toLowerCase().includes(q)).slice(0, 4).map(f => ({ t: "f", f })) : [];
  palItems = [...cs, ...fs, ...pages, ...acts]; palSel = Math.min(palSel, Math.max(0, palItems.length - 1));
  let h = "", g = ""; palItems.forEach((it, i) => {
    const grp = it.t === "c" ? (q ? "赛事" : "最近截止") : it.t === "f" ? "电影节" : it.t === "page" ? "页面" : "快捷操作";
    if (grp !== g) { g = grp; h += `<div class="pal-g">${grp}</div>`; }
    const inner = it.t === "c" ? `${gBadge(it.c)}<span class="pt">${hl(it.c["名称"], q)}</span><span class="pd">${daysLeft(it.c) === null ? "待定" : daysLeft(it.c) < 0 ? "已截止" : daysLeft(it.c) + " 天"}</span>` : it.t === "f" ? `${ico.film}<span class="pt">${esc(it.f["电影节"])}</span><span class="pd">${esc(it.f["每年举办时间"])}</span>` : it.t === "page" ? `${ico[it.i]}<span class="pt">${it.n}</span>` : `${ico.r}<span class="pt">${it.n}</span>`;
    h += `<div class="pal-i ${i === palSel ? "on" : ""}" data-pi="${i}">${inner}</div>`;
  });
  $("#palList").innerHTML = h || `<div class="pal-empty">没有找到「${esc(q)}」</div>`;
  $(".pal-i.on")?.scrollIntoView({ block: "nearest" });
}
function palGo(i) { const it = palItems[i]; if (!it) return; closePalette(); if (it.t === "c") openDrawer(it.c.record_id); else if (it.t === "f") nav("festivals"); else if (it.t === "page") nav(it.k); else it.go(); }
$("#palQ").addEventListener("input", () => { palSel = 0; palRender(); });
$("#palQ").addEventListener("keydown", e => {
  if (e.key === "ArrowDown") { e.preventDefault(); palSel = Math.min(palItems.length - 1, palSel + 1); palRender(); }
  else if (e.key === "ArrowUp") { e.preventDefault(); palSel = Math.max(0, palSel - 1); palRender(); }
  else if (e.key === "Enter") { e.preventDefault(); palGo(palSel); }
  else if (e.key === "Escape") closePalette();
});
$("#palList").addEventListener("mousemove", e => { const p = e.target.closest("[data-pi]"); if (p && +p.dataset.pi !== palSel) { palSel = +p.dataset.pi; $$(".pal-i").forEach(x => x.classList.toggle("on", +x.dataset.pi === palSel)); } });
$("#palList").addEventListener("click", e => { const p = e.target.closest("[data-pi]"); if (p) palGo(+p.dataset.pi); });
$("#palette").addEventListener("click", e => { if (e.target.id === "palette") closePalette(); });

/* ───────── events ───────── */
document.addEventListener("click", e => {
  const t = e.target;
  const st = t.closest("[data-star]"); if (st) { e.preventDefault(); e.stopPropagation(); const id = st.dataset.star; setStatus(id, isMine(id) ? null : "want"); return; }
  if (t.closest("[data-stop]")) { e.stopPropagation(); return; }
  const act = t.closest("[data-act]");
  if (act) { const a = act.dataset.act; if (a === "palette") openPalette(); if (a === "closeDrawer") closeDrawer(); if (a === "openSide") { $("#side").classList.add("on"); $("#scrim").classList.add("on"); } if (a === "closeSide") { $("#side").classList.remove("on"); $("#scrim").classList.remove("on"); } return; }
  const th = t.closest("[data-theme-set]"); if (th) { ST.prefs.theme = th.dataset.themeSet; save(); applyTheme(); renderNav(); return; }
  // filters
  const f = t.closest("[data-f]"); if (f) { const p = filt(); p[f.dataset.f] = f.dataset.v; nav("contests", clean(p), { replace: true }); return; }
  if (t.closest("[data-reset]")) { nav("contests", {}, { replace: true }); return; }
  if (t.closest("[data-clear-q]")) { e.preventDefault(); nav("contests", clean({ ...filt(), q: "", _f: 1 }), { replace: true }); $("#fq")?.focus(); return; }
  if (t.closest("[data-clear-sq]")) { e.preventDefault(); nav("sources", clean2({ ...R.params, q: "" }), { replace: true }); $("#sq")?.focus(); return; }
  const v = t.closest("[data-view]"); if (v) { ST.prefs.view = v.dataset.view; save(); render(false); return; }
  const pf = t.closest("[data-pf]"); if (pf) { nav("sources", clean2({ ...R.params, pf: pf.dataset.pf }), { replace: true }); return; }
  const dy = t.closest("[data-day]"); if (dy) { const k = dy.dataset.day; nav("home", R.params.day === k ? {} : { day: k }, { replace: true }); return; }
  const cal = t.closest("[data-cal]"); if (cal) { const n = +cal.dataset.cal; calM = n === 0 ? new Date(T0.getFullYear(), T0.getMonth(), 1) : new Date(calM.getFullYear(), calM.getMonth() + n, 1); const p = { ...R.params }; delete p.day; nav("calendar", p, { replace: true }); return; }
  const sc = t.closest("[data-scope]"); if (sc) { nav("calendar", sc.dataset.scope === "all" ? {} : { scope: sc.dataset.scope }, { replace: true }); return; }
  if (t.closest("[data-ics]")) { const scope = R.params.scope || "all"; const l = C.filter(c => isOpen(c) && daysLeft(c) !== null && (scope === "mine" ? isMine(c.record_id) : scope === "top" ? G[gr(c)] <= 2 : true)); exportICS(l); toast(`已导出 ${l.length} 个截止日，每个提前 3 天提醒`); return; }
  if (t.closest("[data-ics-mine]")) { const l = C.filter(c => isMine(c.record_id) && isOpen(c) && daysLeft(c) !== null); if (!l.length) return toast("还没有标记的赛事"); exportICS(l, "my-contest-deadlines.ics"); toast(`已导出 ${l.length} 个截止日`); return; }
  if (t.closest("[data-ics-one]")) { const c = byId.get(curId); if (!parseD(c["截止日期"])) return toast("这个赛事的截止日还没公布"); exportICS([c], `deadline-${curId}.ics`); if (!isMine(curId)) setStatus(curId, "want", { silent: true }); toast("已生成日历提醒，并加入想投"); return; }
  if (t.closest("[data-copy-one]")) { copy(infoText(byId.get(curId)), "赛事信息已复制"); return; }
  if (t.closest("[data-share]")) { copy(location.href.split("#")[0] + `#/c/${encodeURIComponent(curId)}`, "链接已复制"); return; }
  const sset = t.closest("[data-set]"); if (sset) { const k = sset.dataset.set; setStatus(curId, status(curId) === k ? null : k); return; }
  const dn = t.closest("[data-dr-nav]"); if (dn) { drNav(+dn.dataset.drNav); return; }
  const cb = t.closest("[data-copy-brief]"); if (cb) { copy(briefText(cb.dataset.copyBrief === "md"), cb.dataset.copyBrief === "md" ? "已复制 Markdown" : "已复制，可以直接发群"); return; }
  if (t.closest("[data-export]")) { download(`cinecall-backup-${ymd(T0)}.json`, JSON.stringify({ app: "cinecall", v: 1, exported: new Date().toISOString(), marks: ST.marks }, null, 2), "application/json"); toast("备份已导出"); return; }
  const op = t.closest("[data-open]"); if (op && !t.closest("a[href]:not([data-open])") && !t.closest("button:not([data-open])")) { openDrawer(op.dataset.open); return; }
});
document.addEventListener("change", e => {
  if (e.target.matches("[data-import]")) { const f = e.target.files[0]; if (!f) return; f.text().then(t => { try { const j = JSON.parse(t); const m = j.marks || j; let n = 0; for (const [k, v] of Object.entries(m)) { if (!byId.has(k) && !v) continue; ST.marks[k] = typeof v === "string" ? { status: v === "done" ? "submitted" : v, updated: Date.now() } : v; n++; } save(); refresh(); toast(`已导入 ${n} 条记录`); } catch { toast("文件格式不对"); } }); }
});
function drNav(d) { const i = listCtx.indexOf(curId) + d; if (i < 0 || i >= listCtx.length) return; curId = listCtx[i]; history.replaceState(history.state, "", `#/c/${encodeURIComponent(curId)}`); fillDrawer(curId); $("#drawer .dr-body").scrollTop = 0; }
let kIdx = -1;
document.addEventListener("keydown", e => {
  const typing = /INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName);
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); $("#palette").classList.contains("on") ? closePalette() : openPalette(); return; }
  if (e.key === "Escape") { if ($("#palette").classList.contains("on")) closePalette(); else if ($("#drawer").classList.contains("on")) closeDrawer(); else if (typing) document.activeElement.blur(); return; }
  if (typing || $("#palette").classList.contains("on")) return;
  if (e.key === "/") { e.preventDefault(); openPalette(); return; }
  if ($("#drawer").classList.contains("on")) {
    if (e.key === "ArrowLeft" || e.key === "ArrowUp" || e.key === "k") { e.preventDefault(); drNav(-1); }
    if (e.key === "ArrowRight" || e.key === "ArrowDown" || e.key === "j") { e.preventDefault(); drNav(1); }
    if (e.key.toLowerCase() === "s") setStatus(curId, isMine(curId) ? null : "want");
    return;
  }
  const rows = $$("#view .row"); if (!rows.length) return;
  if (e.key === "j" || e.key === "k") { e.preventDefault(); kIdx = Math.max(0, Math.min(rows.length - 1, kIdx + (e.key === "j" ? 1 : -1))); rows.forEach((r, i) => r.classList.toggle("kfocus", i === kIdx)); rows[kIdx].scrollIntoView({ block: "center", behavior: "smooth" }); }
  if (e.key === "Enter" && rows[kIdx]) openDrawer(rows[kIdx].dataset.open);
  if (e.key.toLowerCase() === "s" && rows[kIdx]) { const id = rows[kIdx].dataset.open; setStatus(id, isMine(id) ? null : "want"); setTimeout(() => $$("#view .row")[kIdx]?.classList.add("kfocus"), 0); }
});
addEventListener("scroll", () => $(".topbar").classList.toggle("scrolled", scrollY > 4), { passive: true });
window.addEventListener("storage", e => { if (e.key === KEY) { try { Object.assign(ST, JSON.parse(e.newValue)); refresh(); } catch {} } });

/* ───────── boot ───────── */
$("#kbd").textContent = /Mac|iPhone|iPad/.test(navigator.platform) ? "⌘K" : "Ctrl K";
$("#today").textContent = `${T0.getFullYear()}年${T0.getMonth() + 1}月${T0.getDate()}日 周${WD[T0.getDay()]}`;
$("#snap").innerHTML = `数据快照 <b class="num">${esc(D.contests.snapshot_date || "—")}</b><br>赛事 ${C.length} · 电影节 ${F.length} · 信源 ${SRC.length}`;
$("#foot").innerHTML = `影赛雷达 CineCall · 数据来自 <a href="https://github.com/YIJUEYIJUE/ai-film-contests-tracker" target="_blank" rel="noopener">ai-film-contests-tracker</a>，每日更新。截止日、奖金与规则以主办方官网为准，本站只做整理与提醒。`;
const age = D.contests.snapshot_date ? Math.round((T0 - parseD(D.contests.snapshot_date)) / 864e5) : 0;
if (age > 3) $("#banner").innerHTML = `<div class="banner">${ico.info}数据快照已是 ${age} 天前（${esc(D.contests.snapshot_date)}），部分赛事可能已截止或延期，投递前请先看官网。</div>`;
if (!C.length) $("#banner").innerHTML = `<div class="banner">${ico.info}没有读到数据：请先运行 <code>python3 scripts/build.py</code> 生成 public/data/data.js。</div>`;
applyTheme(); route();
})();
