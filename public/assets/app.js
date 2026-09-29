/* AI赛事助手 — 单页应用，无第三方依赖。数据：data/data.js（window.AICONTEST） */
(() => {
"use strict";
const D = window.AICONTEST || { contests: { records: [] }, festivals: { records: [] }, sources: { records: [] } };
const C = D.contests.records || [], F = (D.festivals && D.festivals.records) || [], SRC = (D.sources && D.sources.records) || [];
const byId = new Map(C.map(c => [c.record_id, c]));

/* ───────── utils ───────── */
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const debounce = (fn, ms) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };
const short = (s, n = 14) => (s = String(s || "")).length > n ? s.slice(0, n) + "…" : s;
const I = {
  search: '<svg viewBox="0 0 20 20"><circle cx="9" cy="9" r="6"/><path d="m14 14 4 4"/></svg>',
  radar: '<svg viewBox="0 0 20 20"><circle cx="10" cy="10" r="7.5"/><circle cx="10" cy="10" r="3.5"/><path d="M10 10l5.3-5.3"/></svg>',
  list: '<svg viewBox="0 0 20 20"><path d="M7 5h10M7 10h10M7 15h10M3 5h.01M3 10h.01M3 15h.01"/></svg>',
  grid: '<svg viewBox="0 0 20 20"><rect x="3" y="3" width="6" height="6" rx="1.8"/><rect x="11" y="3" width="6" height="6" rx="1.8"/><rect x="3" y="11" width="6" height="6" rx="1.8"/><rect x="11" y="11" width="6" height="6" rx="1.8"/></svg>',
  cal: '<svg viewBox="0 0 20 20"><rect x="3" y="4" width="14" height="13" rx="2.5"/><path d="M3 8.5h14M7 2.5v3M13 2.5v3"/></svg>',
  board: '<svg viewBox="0 0 20 20"><rect x="3" y="3" width="4" height="14" rx="1.4"/><rect x="8.5" y="3" width="4" height="9" rx="1.4"/><rect x="14" y="3" width="3" height="11" rx="1.4"/></svg>',
  doc: '<svg viewBox="0 0 20 20"><path d="M5 2.5h7l3.5 3.5v11.5h-10.5z"/><path d="M12 2.5V6h3.5M7.5 10h5M7.5 13h5"/></svg>',
  film: '<svg viewBox="0 0 20 20"><rect x="3" y="3" width="14" height="14" rx="2.5"/><path d="M7 3v14M13 3v14M3 7h4M3 13h4M13 7h4M13 13h4"/></svg>',
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
  check: '<svg viewBox="0 0 20 20"><path d="m4.5 10.5 3.5 3.5 7.5-8"/></svg>',
  shield: '<svg viewBox="0 0 20 20"><path d="M10 2.5 16 5v5c0 4-3 6.5-6 7.5-3-1-6-3.5-6-7.5V5z"/><path d="m7.5 10 2 2 3.5-4"/></svg>',
  alert: '<svg viewBox="0 0 20 20"><path d="M10 3 2.5 16.5h15z"/><path d="M10 8.5v3.5M10 14.3h.01"/></svg>',
  edit: '<svg viewBox="0 0 20 20"><path d="M13.5 3.5l3 3L7 16H4v-3z"/></svg>',
  image: '<svg viewBox="0 0 20 20"><rect x="3" y="3" width="14" height="14" rx="2.5"/><circle cx="8" cy="8" r="1.5"/><path d="m17 13-4-4-8 8"/></svg>',
  print: '<svg viewBox="0 0 20 20"><path d="M6 7V3h8v4M6 14H4a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1h-2"/><rect x="6" y="11" width="8" height="6" rx="1"/></svg>',
  spark: '<svg viewBox="0 0 20 20"><path d="M10 2.5v4M10 13.5v4M2.5 10h4M13.5 10h4M5 5l2.2 2.2M12.8 12.8 15 15M15 5l-2.2 2.2M7.2 12.8 5 15"/></svg>',
  plus: '<svg viewBox="0 0 20 20"><path d="M10 4v12M4 10h12"/></svg>',
  flame: '<svg viewBox="0 0 20 20"><path d="M10 17.5c3 0 5.5-2.2 5.5-5.3 0-3.3-2.7-5-3.7-8.7-1.4 1.4-2 3-2 4.5-1-.7-1.6-1.8-1.8-3C5.6 7 4.5 9.4 4.5 12.2c0 3.1 2.5 5.3 5.5 5.3z"/></svg>',
  gift: '<svg viewBox="0 0 20 20"><rect x="3" y="7" width="14" height="4" rx="1"/><path d="M4.5 11v6h11v-6M10 7v10M10 7S8.5 3 6.5 3.5 6 7 10 7zm0 0s1.5-4 3.5-3.5S14 7 10 7z"/></svg>',
  globe: '<svg viewBox="0 0 20 20"><circle cx="10" cy="10" r="7.5"/><path d="M2.5 10h15M10 2.5c2.2 2.2 3 4.8 3 7.5s-.8 5.3-3 7.5c-2.2-2.2-3-4.8-3-7.5s.8-5.3 3-7.5z"/></svg>',
  target: '<svg viewBox="0 0 20 20"><circle cx="10" cy="10" r="7.5"/><circle cx="10" cy="10" r="4"/><circle cx="10" cy="10" r=".8" fill="currentColor"/></svg>',
  clock: '<svg viewBox="0 0 20 20"><circle cx="10" cy="10" r="7.5"/><path d="M10 6v4l2.5 2.5"/></svg>',
  inbox: '<svg viewBox="0 0 20 20"><path d="M3 11h4l1 2h4l1-2h4M3 11l2-7h10l2 7v5H3z"/></svg>',
  chart: '<svg viewBox="0 0 20 20"><path d="M3 17h14M5 14V9M9 14V5M13 14v-7M17 14v-3"/></svg>',
  bellon: '<svg viewBox="0 0 20 20"><path d="M5 8a5 5 0 0 1 10 0c0 5 2 6 2 6H3s2-1 2-6M8.5 17a1.8 1.8 0 0 0 3 0"/><circle cx="15.5" cy="4.5" r="2.5" fill="currentColor" stroke="none"/></svg>',
  kbd: '<svg viewBox="0 0 20 20"><rect x="2.5" y="5" width="15" height="10" rx="2"/><path d="M5.5 8h.01M8.5 8h.01M11.5 8h.01M14.5 8h.01M6 12h8"/></svg>',
  menu: '<svg viewBox="0 0 20 20"><path d="M3 6h14M3 10h14M3 14h9"/></svg>',
};

/* ───────── dates ───────── */
const T0 = (() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; })();
const parseD = s => { if (!s) return null; const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s); return m ? new Date(+m[1], +m[2] - 1, +m[3]) : null; };
const ymd = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const daysLeft = c => { const d = parseD(c["截止日期"]); return d ? Math.round((d - T0) / 864e5) : null; };
const WD = "日一二三四五六";
const fmtMD = s => { const d = parseD(s); return d ? `${d.getMonth() + 1}月${d.getDate()}日` : "待公布"; };
const fmtFull = s => { const d = parseD(s); return d ? `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日 周${WD[d.getDay()]}` : "待公布"; };
const urg = l => l === null || l < 0 ? "" : l <= 3 ? "u-red" : l <= 7 ? "u-amber" : "";

/* ───────── classification ───────── */
const G = { S: 0, A: 1, B: 2, C: 3 };
const GN = { S: "顶级", A: "优先投", B: "值得投", C: "按需投" };
const gr = c => (c["分级"] in G ? c["分级"] : "C");
const feeTxt = c => String(c["报名费"] || "").trim();
const isFree = c => /^(免费|无$|无（|￥0|¥0|0元)/.test(feeTxt(c));
const NOCASH = /^(无现金|非现金|无固定现金|非奖金制|官方未公布|未公布|待核实|积分非现金|荣誉|数字桂冠|Crystal|Grand Prix|Close-Up|无（|无$)/i;
const hasCash = c => { const p = String(c["最高奖金"] || ""); return !NOCASH.test(p) && /[¥￥$€£₹]|\d\s*万|元|美元|澳元|港元|现金/.test(p); };
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
const FORMS = [["短片", /短片|short/i], ["短剧", /短剧|漫剧/], ["长片", /长片|feature/i], ["广告", /广告|商业|\bads?\b|品牌/i], ["MV", /\bMV\b|音乐视频|music video/i], ["动画", /动画|动漫|animation/i], ["公益", /公益|正向|for good/i]];
const formsOf = c => { const t = `${c["名称"]} ${c["类别"]} ${c["赛事说明"] || ""}`; return FORMS.filter(([, r]) => r.test(t)).map(([n]) => n); };
const hay = c => `${c["名称"]} ${c["主办方"]} ${c["地区"]} ${c["类别"]} ${c["赛事说明"]} ${c["计划备注"]} ${c["最高奖金"]}`.toLowerCase();
const glyph = c => { const n = String(c["名称"] || "").replace(/^(第[^届]+届|首届|20\d\d|“|「|《|\(|（)+/g, "").trim(); const m = n.match(/^[A-Za-z]{1,3}/); return m ? m[0].toUpperCase().slice(0, 2) : n.slice(0, 1); };
const vf = c => c._verify || null;

/* ───────── store ───────── */
const KEY = "aicontest.v1";
const ST = (() => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; } })();
ST.prefs ||= { theme: "auto", view: "grid" }; ST.films ||= {}; ST.plans ||= {}; ST.custom ||= {};
const uid = p => p + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
if (!Object.keys(ST.films).length) { const id = uid("f"); ST.films[id] = { id, fields: {}, crew: [], awards: [], created: Date.now() }; ST.active = id; ST.plans[id] = ST.marks || {}; }
delete ST.marks;
if (!ST.films[ST.active]) ST.active = Object.keys(ST.films)[0];
const PL = () => (ST.plans[ST.active] ||= {});
const FILM = () => ST.films[ST.active];
const filmName = f => (f && (f.fields.nameZh || f.fields.nameEn)) || "未命名影片";
for (const c of Object.values(ST.custom)) { C.push(c); byId.set(c.record_id, c); }
let SV = 0;
const save = () => { SV++; try { localStorage.setItem(KEY, JSON.stringify(ST)); } catch {} };
const STATUSES = [
  { k: "want", n: "想投", c: "#f59e0b" }, { k: "making", n: "制作中", c: "#6d5efc" },
  { k: "submitted", n: "已投", c: "#10b981" }, { k: "result", n: "已出结果", c: "#f0443a" },
];
const SN = Object.fromEntries(STATUSES.map(s => [s.k, s.n])); SN.skip = "已忽略";
const OUTCOMES = ["审核中", "入围", "获奖", "未入围", "撤回"];
const OC = { "审核中": "var(--acc)", "入围": "var(--amber)", "获奖": "var(--red)", "未入围": "var(--ink-4)", "撤回": "var(--ink-4)" };
const SC = Object.fromEntries(STATUSES.map(s => [s.k, s.c]));
const mk = id => PL()[id] || null;
const status = id => (PL()[id] || {}).status || null;
const isMine = id => { const s = status(id); return !!s && s !== "skip"; };
const mineAll = () => Object.entries(PL()).filter(([id, m]) => byId.has(id) && m.status && m.status !== "skip");
function setStatus(id, s, { silent } = {}) {
  const prev = PL()[id] ? { ...PL()[id] } : null;
  if (!s) { if (PL()[id]?.note) PL()[id].status = null; else delete PL()[id]; }
  else PL()[id] = { ...(PL()[id] || {}), status: s, updated: Date.now() };
  save(); refresh();
  $$(`[data-star="${CSS.escape(id)}"]`).forEach(b => { b.classList.remove("pop"); void b.offsetWidth; b.classList.add("pop"); });
  if (!silent) {
    const c = byId.get(id);
    toast(s ? `「${short(c["名称"], 16)}」已标记为${SN[s]}` : "已取消标记", () => { if (prev) PL()[id] = prev; else delete PL()[id]; save(); refresh(); });
  }
}
const prevSeen = Array.isArray(ST.seen) ? new Set(ST.seen) : null;
ST.seen = C.map(c => c.record_id); save();
const isNew = c => !!prevSeen && !prevSeen.has(c.record_id);

/* ───────── toast / clipboard / download ───────── */
function toast(msg, undo) {
  const el = document.createElement("div"); el.className = "toast";
  el.innerHTML = `<i>${I.check}</i><span>${esc(msg)}</span>${undo ? "<button>撤销</button>" : ""}`;
  $("#toasts").append(el);
  const kill = () => { el.classList.add("out"); setTimeout(() => el.remove(), 260); };
  if (undo) el.querySelector("button").onclick = () => { undo(); kill(); };
  setTimeout(kill, undo ? 4200 : 2400);
}
async function copy(txt, msg = "已复制") { try { await navigator.clipboard.writeText(txt); } catch { const t = document.createElement("textarea"); t.value = txt; document.body.append(t); t.select(); document.execCommand("copy"); t.remove(); } toast(msg); }
function download(name, data, type = "text/plain") { const u = typeof data === "string" && data.startsWith("data:") ? data : URL.createObjectURL(new Blob([data], { type })); const a = Object.assign(document.createElement("a"), { href: u, download: name }); document.body.append(a); a.click(); a.remove(); if (!u.startsWith("data:")) setTimeout(() => URL.revokeObjectURL(u), 800); }

/* ───────── atoms ───────── */
const gB = c => `<span class="g g-${gr(c)}" title="${gr(c)} 级 · ${GN[gr(c)]}">${gr(c)}</span>`;
function tags(c, { max = 4, verify = false } = {}) {
  const t = [];
  if (isNew(c)) t.push('<span class="tag new">新收录</span>');
  if (c["征集状态"] && c["征集状态"] !== "开放征集中") t.push(`<span class="tag soon">${esc(c["征集状态"])}</span>`);
  if (isFree(c)) t.push('<span class="tag free">免费</span>');
  if (hasCash(c)) t.push('<span class="tag cash">现金奖</span>');
  if (c["命题"] === "命题") t.push('<span class="tag topic">命题</span>');
  if (verify && vf(c)) t.push(vf(c).level === "warn" ? `<span class="tag warn">${I.alert}待确认</span>` : `<span class="tag ok">${I.shield}已核实</span>`);
  const s = status(c.record_id); if (s && s !== "skip") t.unshift(`<span class="tag st-${s}">${SN[s]}</span>`);
  return t.slice(0, max).join("");
}
const starBtn = c => { const on = isMine(c.record_id); return `<button class="star ${on ? "on" : ""}" data-star="${c.record_id}" aria-label="${on ? "取消标记" : "加入想投"}" title="${on ? SN[status(c.record_id)] + " · 点击取消" : "加入想投"}">${I.star}</button>`; };
const dlBox = c => {
  const l = daysLeft(c);
  if (l === null) return `<div class="dl-box none"><b>待定</b><span>截止待公布</span></div>`;
  if (l < 0) return `<div class="dl-box"><b class="num">—</b><span>已截止</span></div>`;
  const w = Math.max(4, Math.min(100, 100 - l / 60 * 100));
  return `<div class="dl-box ${urg(l)}"><b class="num">${l === 0 ? "今天" : l}</b><span>${l === 0 ? "截止" : "天 · " + fmtMD(c["截止日期"])}</span><i class="fill" style="width:${w}%"></i></div>`;
};
const hl = (s, q) => { s = esc(s); if (!q) return s; for (const w of q.trim().split(/\s+/).filter(Boolean)) { const i = s.toLowerCase().indexOf(w.toLowerCase()); if (i >= 0) s = s.slice(0, i) + '<mark class="hl">' + s.slice(i, i + w.length) + "</mark>" + s.slice(i + w.length); } return s; };
function row(c, q = "") {
  const l = daysLeft(c);
  return `<div class="row ${l !== null && l < 0 ? "past" : ""}" data-open="${c.record_id}" tabindex="0" role="button" aria-label="${esc(c["名称"])}">
    ${dlBox(c)}
    <div style="min-width:0"><div class="row-t">${gB(c)}<h3>${hl(c["名称"], q)}</h3>${tags(c, { verify: true })}</div>
      <div class="row-m"><span>${I.pin}${esc(short(c["地区"] || "—", 18))}</span><span>${I.ticket}${esc(short(feeTxt(c) || "—", 24))}</span><span>${I.film}${esc(short(c["类别"] || "—", 18))}</span>${(() => { const mt = matchFilm(c); if (!mt.hasFilm) return ""; const x = mt.score === "ok" ? "适合当前影片" : (mt.list.find(y => y.lv === mt.score) || {}).t || "有待确认项"; return `<span class="mt-line ${mt.score}" style="padding:1px 8px">${mt.score === "ok" ? I.check : I.alert}<span>${esc(short(x, 20))}</span></span>`; })()}</div></div>
    <div class="row-prize"><span class="pi">${I.trophy}</span><div><em>${cashCNY(c) > 1 ? fmtCNY(cashCNY(c)) : hasCash(c) ? "现金奖" : "荣誉 / 资源"}</em>${esc(c["最高奖金"] || "—")}</div></div>
    <div class="row-act">${cmpBtn(c).replace('class="cmp-b', 'class="cmp-b rw')}${starBtn(c)}</div></div>`;
}
function card(c) {
  const l = daysLeft(c);
  return `<article class="card" data-open="${c.record_id}" tabindex="0" aria-label="${esc(c["名称"])}">
    <div class="poster pb-${gr(c)}"><span class="glyph">${esc(glyph(c))}</span>
      <div class="p-top">${gB(c)}${isFree(c) ? '<span class="tag">免费</span>' : ""}${c["命题"] === "命题" ? '<span class="tag">命题</span>' : ""}${isNew(c) ? '<span class="tag">新</span>' : ""}<span style="margin-left:auto;display:flex;gap:4px">${cmpBtn(c)}${starBtn(c)}</span></div>
      <div class="p-dl">${l === null ? "<b style='font-size:22px'>截止待公布</b>" : l < 0 ? "<b style='font-size:22px'>已截止</b>" : l === 0 ? "<b>今天</b><small>截止</small>" : `<b class="num">${l}</b><small>天后截止 · ${fmtMD(c["截止日期"])}</small>`}</div>
    </div>
    <div class="body">
      <h3 class="card-t">${esc(c["名称"])}</h3>
      <div class="card-org">${esc(c["主办方"] || c["地区"] || "")}</div>
      <div class="prize"><span class="pi">${I.trophy}</span><span>${esc(c["最高奖金"] || "—")}</span></div>
      ${(() => { const mt = matchFilm(c); return mt.hasFilm && mt.score !== "ok" || mt.hasFilm ? `<div class="mt-line ${mt.score}">${mt.score === "ok" ? I.check : I.alert}<span>${mt.score === "ok" ? "适合当前影片" : mt.score === "warn" ? esc(short((mt.list.find(x => x.lv === "warn") || {}).t || "有待确认项", 22)) : esc(short((mt.list.find(x => x.lv === "bad") || {}).t, 22))}</span></div>` : ""; })()}
      <div class="card-f"><span class="fee">${I.ticket.replace("<svg", '<svg style="width:13px;height:13px;vertical-align:-2px;margin-right:4px;color:var(--ink-4)"')}${esc(short(feeTxt(c) || "—", 22))}</span>${tags(c, { max: 2, verify: true }).replace(/<span class="tag (free|cash|topic|new|soon)">[^<]*<\/span>/g, "")}</div>
    </div></article>`;
}
const emptyBox = (t, s = "", icon = "inbox") => `<div class="empty glass"><div class="ill">${I[icon]}</div><b>${t}</b>${s ? `<span>${s}</span>` : ""}</div>`;
const byDl = (a, b) => (daysLeft(a) ?? 1e4) - (daysLeft(b) ?? 1e4);
const live = () => C.filter(isOpen);
const secH = (icon, title, sub, link) => `<div class="sec-h"><div><h2 class="h2"><span class="ic">${I[icon]}</span>${title}</h2>${sub ? `<p>${sub}</p>` : ""}</div>${link || ""}</div>`;
const more = (href, t = "查看全部") => `<a class="link" href="${href}">${t}${I.r}</a>`;
function spark(vals, color = "url(#sg)") { const mx = Math.max(1, ...vals), w = 88, h = 34, st = w / (vals.length - 1); const p = vals.map((v, i) => `${(i * st).toFixed(1)},${(h - 3 - v / mx * (h - 6)).toFixed(1)}`).join(" "); const lx = ((vals.length - 1) * st).toFixed(1), ly = (h - 3 - vals[vals.length - 1] / mx * (h - 6)).toFixed(1), mxI = vals.indexOf(mx), mxx = (mxI * st).toFixed(1); return `<svg class="spark" viewBox="0 0 ${w} ${h}"><line x1="0" x2="${w}" y1="${h - 1}" y2="${h - 1}" stroke="var(--line-2)" stroke-dasharray="2 3"/><circle cx="${mxx}" cy="3" r="2.6" fill="#6d5efc"/><defs><linearGradient id="sg" x1="0" x2="1"><stop offset="0" stop-color="#6d5efc"/><stop offset="1" stop-color="#22c3e6"/></linearGradient><linearGradient id="sf" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#6d5efc" stop-opacity=".25"/><stop offset="1" stop-color="#6d5efc" stop-opacity="0"/></linearGradient></defs><polygon points="0,${h} ${p} ${w},${h}" fill="url(#sf)" stroke="none"/><polyline points="${p}" stroke="${color}" stroke-width="2" fill="none"/><circle cx="${lx}" cy="${ly}" r="2.2" fill="#22c3e6"/></svg>`; }

/* ───────── routing ───────── */
const ROUTES = [
  { k: "home", n: "截止雷达", i: "radar", g: "发现" },
  { k: "contests", n: "全部赛事", i: "grid", g: "发现" },
  { k: "calendar", n: "截止日历", i: "cal", g: "发现" },
  { k: "insights", n: "数据洞察", i: "chart", g: "发现" },
  { k: "films", n: "我的影片", i: "film", g: "工作台" },
  { k: "tracker", n: "投递计划", i: "board", g: "工作台" },
  { k: "brief", n: "今日简报", i: "doc", g: "工作台" },
  { k: "festivals", n: "知名电影节", i: "globe", g: "资料库" },
  { k: "sources", n: "信源", i: "rss", g: "资料库" },
  { k: "about", n: "收录与分级", i: "info", g: "资料库" },
];
const parseHash = () => { const h = location.hash.replace(/^#\/?/, ""); const [path, qs] = h.split("?"); const parts = (path || "home").split("/"); return { page: parts[0] || "home", arg: parts[1] ? decodeURIComponent(parts[1]) : null, params: Object.fromEntries(new URLSearchParams(qs || "")) }; };
let R = parseHash(), lastPage = null, routeTok = 0;
function nav(page, params = {}, { replace } = {}) {
  const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => v !== "" && v != null)).toString();
  const h = `#/${page}${qs ? "?" + qs : ""}`;
  if (replace) { history.replaceState(null, "", h); route(); } else location.hash = h;
}
window.addEventListener("hashchange", route);
function route() {
  R = parseHash();
  if (R.page === "c" && R.arg) { if (!lastPage) { R = { page: "home", params: {} }; lastPage = "home"; render(true); } openDrawer(parseHash().arg, { fromRoute: true }); return; }
  if (!ROUTES.find(r => r.k === R.page)) R.page = "home";
  closeDrawer({ fromRoute: true });
  const changed = R.page !== lastPage; lastPage = R.page;
  const tok = ++routeTok;
  const go2 = () => { if (tok !== routeTok) return; R = parseHash(); if (!ROUTES.find(r => r.k === R.page)) R.page = "home"; render(true); };
  if (changed && document.startViewTransition && !document.hidden && !matchMedia("(prefers-reduced-motion: reduce)").matches) { try { document.startViewTransition(go2); } catch { go2(); } } else render(changed);
}

/* ───────── chrome ───────── */
function renderChrome() {
  const L = live();
  const urgent = L.filter(c => { const l = daysLeft(c), s = status(c.record_id); return l !== null && l <= 3 && s !== "submitted" && s !== "skip" && s !== "result"; }).length;
  const mine = mineAll().length;
  const counts = { home: urgent ? `<span class="ct hot">${urgent}</span>` : "", contests: `<span class="ct">${L.length}</span>`, tracker: mine ? `<span class="ct">${mine}</span>` : "", films: `<span class="ct">${readiness(FILM()).pct}%</span>`, festivals: `<span class="ct">${F.length}</span>`, sources: `<span class="ct">${SRC.length}</span>` };
  let g = "", h = "";
  for (const r of ROUTES) { if (r.g !== g) { g = r.g; h += `<div class="nav-g">${g}</div>`; } h += `<a href="#/${r.k}" class="${R.page === r.k ? "on" : ""}">${I[r.i]}<span>${r.n}</span>${counts[r.k] || ""}</a>`; }
  $("#nav").innerHTML = h;
  $("#tabbar").innerHTML = ["home", "contests", "films", "tracker", "brief"].map(k => { const r = ROUTES.find(x => x.k === k); return `<a href="#/${k}" class="${R.page === k ? "on" : ""}">${I[r.i]}<span>${r.n.replace("全部", "").replace("今日", "").replace("我的", "").replace("投递计划", "投递")}</span>${k === "home" && urgent ? `<i class="b">${urgent}</i>` : ""}</a>`; }).join("");
  const cur = ROUTES.find(r => r.k === R.page); $("#crumb").textContent = cur ? cur.n : ""; document.body.dataset.page = R.page;
  document.title = `${cur && cur.k !== "home" ? cur.n + " · " : ""}AI赛事助手`;
  renderTray();
  $$(".theme-seg button").forEach(b => b.classList.toggle("on", b.dataset.themeSet === (ST.prefs.theme || "auto")));
  const done = mineAll().filter(([, m]) => ["submitted", "result"].includes(m.status)).length;
  const fl = Object.values(ST.films), af = FILM(), rdy = readiness(af);
  $("#filmBar").innerHTML = `<span class="fb-l">当前影片</span><button class="fb-cur" data-act="filmMenu"><span class="fposter sm pb-${["S", "B", "A", "C"][fl.indexOf(af) % 4]}">${esc(filmName(af).slice(0, 1))}</span><b>${esc(short(filmName(af), 12))}</b>${I.down}</button><div class="fb-menu" id="filmMenu">${fl.map(x => `<button data-film="${x.id}" class="${x.id === ST.active ? "on" : ""}"><span>${esc(filmName(x))}</span><em>${readiness(x).pct}%</em></button>`).join("")}<button data-new-film>${I.plus}新建影片</button></div>`;
  $("#sideCard").innerHTML = mine ? `<b>《${esc(short(filmName(af), 10))}》投递进度</b><p>已投 ${done} / 计划 ${mine} 个赛事 · 资料 ${rdy.pct}%</p><div class="mini-bar"><i style="width:${Math.round(done / mine * 100)}%"></i></div><small>${urgent ? `${urgent} 个赛事 3 天内截止` : "近 3 天没有要截止的"}</small>`
    : `<b>开始追踪赛事</b><p>在任意赛事上点 ☆，就会出现在投递看板和日历提醒里。</p><a class="link" style="padding:0" href="#/contests?grade=SA">从 S/A 级开始挑${I.r}</a>`;
}
function applyTheme() { let t = ST.prefs.theme || "auto"; if (t === "auto") t = matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"; document.documentElement.dataset.theme = t; }
matchMedia("(prefers-color-scheme: dark)").addEventListener?.("change", applyTheme);

/* ═════════ pages ═════════ */
const V = {}; let tick = null;

/* ── home ── */
V.home = () => {
  const L = live();
  const pool = L.filter(c => { const l = daysLeft(c), s = status(c.record_id); return l !== null && !["submitted", "skip", "result"].includes(s); }).sort(byDl);
  const hero = pool.find(c => isMine(c.record_id) && daysLeft(c) <= 14) || pool.find(c => G[gr(c)] <= 1) || pool.find(c => G[gr(c)] <= 2) || pool[0];
  const w7 = L.filter(c => { const l = daysLeft(c); return l !== null && l <= 7; });
  const w3 = w7.filter(c => daysLeft(c) <= 3);
  const sa = L.filter(c => G[gr(c)] <= 1);
  const free = L.filter(isFree);
  const mineSoon = C.filter(c => ["want", "making"].includes(status(c.record_id)) && isOpen(c)).sort(byDl);
  const top = sa.filter(c => status(c.record_id) !== "skip" && c !== hero).sort((a, b) => G[gr(a)] - G[gr(b)] || byDl(a, b));
  const fc = L.filter(c => isFree(c) && hasCash(c) && status(c.record_id) !== "skip").sort((a, b) => cashCNY(b) - cashCNY(a));
  const newOnes = L.filter(isNew);
  const sel = R.params.day || null;
  const weekly = Array.from({ length: 10 }, (_, i) => L.filter(c => { const l = daysLeft(c); return l !== null && l >= i * 7 && l < i * 7 + 7; }).length);
  const gc = ["S", "A", "B", "C"].map(g => [g, L.filter(c => gr(c) === g).length]);
  let strip = "";
  for (let i = 0; i < 21; i++) {
    const d = new Date(T0); d.setDate(d.getDate() + i); const k = ymd(d);
    const ev = L.filter(c => c["截止日期"] === k).sort((a, b) => G[gr(b)] - G[gr(a)]);
    strip += `<button class="bar-d ${i === 0 ? "t" : ""} ${sel === k ? "sel" : ""} ${d.getDay() % 6 === 0 ? "we" : ""}" data-day="${k}"><span class="tip">${fmtMD(k)} · ${ev.length} 个截止</span><span class="stk">${ev.length ? ev.slice(0, 9).map(c => `<i class="i-${gr(c)}"></i>`).join("") : "<em></em>"}</span><span class="dn">${d.getDate()}</span><span class="wd">${i === 0 ? "今天" : WD[d.getDay()]}</span></button>`;
  }
  const selList = sel ? L.filter(c => c["截止日期"] === sel).sort((a, b) => G[gr(a)] - G[gr(b)]) : [];
  const h = new Date().getHours(); const hi = h < 6 ? "夜深了" : h < 11 ? "早上好" : h < 14 ? "中午好" : h < 18 ? "下午好" : "晚上好";
  const suggest = mineSoon.length ? null : L.filter(c => G[gr(c)] <= 1 && isFree(c) && daysLeft(c) !== null && daysLeft(c) >= 3 && !isMine(c.record_id)).sort(byDl).slice(0, 4);
  return `<div class="page-in">
  <div class="greet"><div><span class="eyebrow">${T0.getMonth() + 1}月${T0.getDate()}日 · 周${WD[T0.getDay()]}</span><h1 class="display">${hi}，今天有 <span class="grad-t">${w3.length}</span> 个赛事即将截止</h1><p>在征 ${L.length} 个 AI 影像赛事，其中 S/A 级 ${sa.length} 个、免费报名 ${free.length} 个。</p></div>
    <div class="btns"><a class="btn" href="#/films">${I.film}${readiness(FILM()).pct ? `《${esc(short(filmName(FILM()), 8))}》资料 ${readiness(FILM()).pct}%` : "添加我的影片"}</a><a class="btn pri" href="#/contests${matchFilm(C[0] || {}).hasFilm ? "?fit=1" : ""}">${I.grid}${matchFilm(C[0] || {}).hasFilm ? "找适合我影片的赛事" : "浏览全部赛事"}</a></div></div>
  <section class="bento">
    ${hero ? `<div class="hero" data-open="${hero.record_id}"><span class="reel"></span>
      <div class="hero-k"><span class="live"><i></i>${isMine(hero.record_id) ? "你的下一个截止" : "最近截止 · 值得投"}</span><span>${gr(hero)} 级 · ${GN[gr(hero)]}</span></div>
      <div class="hero-t">${esc(hero["名称"])}</div>
      <div class="hero-sub">${esc(short((hero["赛事说明"] || "").split(/\n/)[0], 70))}</div>
      <div class="hero-facts">${[["trophy", "最高奖励", short(hero["最高奖金"], 40)], ["ticket", "报名费", short(feeTxt(hero), 16)], ["pin", "地区", short(hero["地区"], 14)], ["check", "当前影片", (() => { const m = matchFilm(hero); return m.hasFilm ? (m.score === "ok" ? "条件符合" : m.score === "warn" ? "有待确认项" : "条件不符") : "未填写影片"; })()]].map(([i, k, v]) => `<div><span>${I[i]}${k}</span><b>${esc(v)}</b></div>`).join("")}</div>
      ${(() => { const l = daysLeft(hero); const w = Math.max(4, Math.min(100, 100 - l / 30 * 100)); return `<div class="hero-time"><div class="ht-bar"><i style="width:${w}%"></i></div><span>距截止 ${l} 天 · ${fmtFull(hero["截止日期"])}</span></div>`; })()}
      <div class="hero-bottom"><div class="cd" id="cd" data-to="${hero["截止日期"]}"></div>
        <div class="hero-cta">${hero["投递链接"] || hero["官网"] ? `<a class="btn-w" href="${esc(hero["投递链接"] || hero["官网"])}" target="_blank" rel="noopener" data-stop>去投递${I.ext}</a>` : ""}<button class="btn-gl ${isMine(hero.record_id) ? "on" : ""}" data-star="${hero.record_id}">${I.star}${isMine(hero.record_id) ? SN[status(hero.record_id)] : "想投"}</button></div></div>
    </div>` : ""}
    <div class="kpis">
      <a class="tile glass kpi" href="#/contests"><div class="tile-h">在征赛事<span class="ar">${I.r}</span></div><b class="num">${L.length}</b><div class="sub">未来 10 周截止分布</div>${spark(weekly)}</a>
      <a class="tile glass kpi red" href="#/contests?when=7"><div class="tile-h">7 天内截止<span class="ar">${I.r}</span></div><b class="num">${w7.length}</b><div class="sub">${I.flame}其中 3 天内 ${w3.length} 个</div></a>
      <a class="tile glass kpi" href="#/contests?grade=SA"><div class="tile-h">分级构成<span class="ar">${I.r}</span></div><b class="num">${sa.length}<span style="font-size:14px;color:var(--ink-4);font-weight:600;letter-spacing:0"> S/A</span></b><div class="meter">${gc.map(([g, n]) => `<i class="i-${g}" style="flex:${n}" title="${g} ${n}"></i>`).join("")}</div><div class="gdots">${gc.map(([g, n]) => `<span><i class="i-${g}"></i>${g} ${n}</span>`).join("")}</div></a>
      <a class="tile glass kpi grad" href="#/tracker"><div class="tile-h">我的投递<span class="ar">${I.r}</span></div><b class="num">${mineAll().length}</b><div class="sub">${mineSoon.length ? `${mineSoon.length} 个正在准备 · 已投 ${mineAll().filter(([, m]) => ["submitted", "result"].includes(m.status)).length}` : "点 ☆ 开始追踪"}</div><div class="kfun">${STATUSES.map(st => `<i style="flex:${mineAll().filter(([, m]) => m.status === st.k).length};background:${st.c}"></i>`).join("")}</div></a>
    </div>
    <div class="glass wide strip-wrap">
      <div class="sec-h" style="margin:0"><div><h2 class="h2"><span class="ic">${I.clock}</span>未来 21 天截止分布</h2><p>柱子越高，当天截止的赛事越多；点某一天查看</p></div><div class="legend"><span><i class="i-S"></i>S</span><span><i class="i-A"></i>A</span><span><i class="i-B"></i>B</span><span><i class="i-C"></i>C</span></div></div>
      <div class="strip">${strip}</div>
      ${sel ? `<div class="list glass" style="margin-top:12px;box-shadow:none">${selList.length ? selList.map(c => row(c)).join("") : `<div class="empty" style="padding:26px"><b>${fmtMD(sel)} 没有截止的赛事</b></div>`}</div>` : ""}
    </div>
  </section>

  ${todoSection()}
  <section class="sec">${mineSoon.length ? secH("target", "我在准备的", "标记为想投、制作中且还没截止的赛事", more("#/tracker", "打开看板")) + `<div class="list glass">${mineSoon.slice(0, 5).map(c => row(c)).join("")}</div>`
    : secH("spark", "为你推荐", "免费报名、S/A 级、还有 3 天以上时间准备的赛事，点 ☆ 加入投递清单", more("#/contests?grade=SA&fee=free")) + `<div class="cards">${(suggest || []).map(card).join("")}</div>`}</section>

  ${newOnes.length ? `<section class="sec">${secH("plus", `上次来之后新收录 <span class="tag new">${newOnes.length}</span>`, "")}<div class="cards">${newOnes.sort(byDl).slice(0, 8).map(card).join("")}</div></section>` : ""}

  <section class="sec">${secH("trophy", "精选 · S / A 级", "按认可度、可信度、资源回报、成本加权后含金量最高的一档", more("#/contests?grade=SA"))}<div class="cards">${top.slice(0, 8).map(card).join("")}</div></section>

  <section class="sec">${secH("gift", "零成本 · 有现金奖", "免费报名，而且写明了现金奖金，按奖金从高到低排", more("#/contests?fee=free&cash=1&sort=prize"))}<div class="list glass">${fc.slice(0, 6).map(c => row(c)).join("")}</div></section>
  </div>`;
};
V.home.after = () => {
  const el = $("#cd"); if (!el) return;
  const to = parseD(el.dataset.to); if (!to) { el.innerHTML = `<div><b style="font-size:22px">待公布</b><span>截止</span></div>`; return; }
  to.setHours(23, 59, 59, 0);
  const upd = () => { let ms = Math.max(0, to - new Date()); const d = Math.floor(ms / 864e5); ms -= d * 864e5; const h = Math.floor(ms / 36e5); ms -= h * 36e5; const m = Math.floor(ms / 6e4); const s = Math.floor((ms - m * 6e4) / 1e3);
    el.innerHTML = [[d, "天"], [h, "时"], [m, "分"], [s, "秒"]].map(([v, u], i) => `${i ? '<em>:</em>' : ""}<div><b class="num">${String(v).padStart(2, "0")}</b><span>${u}</span></div>`).join(""); };
  upd(); tick = setInterval(upd, 1000);
};

/* ── contests ── */
const FDEF = { q: "", fit: "", when: "open", grade: "", topic: "", fee: "", cash: "", region: "", form: "", mine: "", sort: "dl" };
const filt = () => ({ ...FDEF, ...R.params });
function applyFilters(p) {
  const q = (p.q || "").trim().toLowerCase();
  return C.filter(c => {
    const l = daysLeft(c);
    if (p.when === "open" && !isOpen(c)) return false;
    if (["3", "7", "30"].includes(p.when) && !(isOpen(c) && l !== null && l <= +p.when)) return false;
    if (p.when === "tba" && (l !== null || !isOpen(c))) return false;
    if (p.grade && !p.grade.includes(gr(c))) return false;
    if (p.topic && c["命题"] !== p.topic) return false;
    if (p.fee === "free" && !isFree(c)) return false;
    if (p.cash && !hasCash(c)) return false;
    if (p.region === "cn" && !isCN(c)) return false;
    if (p.region === "intl" && isCN(c)) return false;
    if (p.form && !formsOf(c).includes(p.form)) return false;
    if (p.mine && !isMine(c.record_id)) return false;
    if (p.fit && matchFilm(c).score === "bad") return false;
    if (!p.mine && status(c.record_id) === "skip" && p.when !== "all") return false;
    if (q && !q.split(/\s+/).every(w => hay(c).includes(w))) return false;
    return true;
  });
}
const SORTS = { dl: ["截止最近", byDl], grade: ["分级最高", (a, b) => G[gr(a)] - G[gr(b)] || byDl(a, b)], prize: ["奖金最高", (a, b) => cashCNY(b) - cashCNY(a) || byDl(a, b)], name: ["按名称", (a, b) => a["名称"].localeCompare(b["名称"], "zh")] };
const FLABEL = { when: { "3": "3 天内", "7": "7 天内", "30": "30 天内", tba: "截止待公布", all: "含已截止" }, grade: { SA: "S+A 级", S: "S 级", A: "A 级", B: "B 级", C: "C 级" }, fee: { free: "免费报名" }, cash: { "1": "有现金奖" }, topic: { "自由投稿": "自由投稿", "命题": "命题" }, region: { cn: "国内", intl: "海外/线上" }, mine: { "1": "已加入计划" }, fit: { "1": "适合当前影片" } };
V.contests = () => {
  const p = filt(), res = applyFilters(p).sort(SORTS[p.sort]?.[1] || byDl);
  const n = (k, v) => applyFilters({ ...p, [k]: v }).length;
  const chip = (k, v, label) => { const on = (p[k] || "") === v; const c = n(k, v); return `<button class="chip ${on ? "on" : ""} ${!c && !on ? "zero" : ""}" data-f="${k}" data-v="${v}">${label}<span class="n">${c}</span></button>`; };
  const tchip = (k, v, label) => { const on = p[k] === v; const c = n(k, v); return `<button class="chip ${on ? "on" : ""} ${!c && !on ? "zero" : ""}" data-f="${k}" data-v="${on ? "" : v}">${label}<span class="n">${c}</span></button>`; };
  const act = Object.keys(FDEF).filter(k => !["sort", "q"].includes(k) && (p[k] || "") !== FDEF[k]);
  const view = ST.prefs.view || "grid";
  return `<div class="page-in">
    <div><span class="eyebrow">全部赛事</span><h1 class="h1">找到适合你作品的赛事</h1><p class="lede">组合筛选截止时间、分级、报名费、命题与作品形态；筛选条件会写进网址，可以直接分享给队友。</p></div>
    <div class="filter-bar glass">
      <div class="tb-r">
        <label class="field ${p.q ? "has" : ""}">${I.search}<input id="fq" value="${esc(p.q)}" placeholder="搜名称、主办方、题材…多个词用空格分隔" aria-label="搜索"><button class="clr" data-clear-q aria-label="清空">${I.x}</button></label>
        <select class="sel" id="fsort" aria-label="排序">${Object.entries(SORTS).map(([k, [nm]]) => `<option value="${k}" ${p.sort === k ? "selected" : ""}>排序：${nm}</option>`).join("")}</select>
        <div class="seg" role="group" aria-label="视图"><button data-view="grid" class="${view === "grid" ? "on" : ""}">${I.grid}卡片</button><button data-view="list" class="${view === "list" ? "on" : ""}">${I.list}列表</button></div>
      </div>
      <button class="ftoggle" data-ftoggle>${I.list}筛选条件${act.length ? `<em>${act.length}</em>` : ""}${I.down}</button>
      <div class="fgroups">
        <div class="fg"><label>时间</label><div class="chips">${chip("when", "open", "全部在征")}${chip("when", "3", "3 天内")}${chip("when", "7", "7 天内")}${chip("when", "30", "30 天内")}${chip("when", "tba", "截止待公布")}${chip("when", "all", "含已截止")}</div></div>
        <div class="fg"><label>分级</label><div class="chips">${chip("grade", "", "不限")}${chip("grade", "SA", "S + A")}${chip("grade", "S", "S")}${chip("grade", "A", "A")}${chip("grade", "B", "B")}${chip("grade", "C", "C")}</div></div>
        <div class="fg"><label>条件</label><div class="chips">${tchip("fee", "free", "免费报名")}${tchip("cash", "1", "有现金奖")}${tchip("topic", "自由投稿", "自由投稿")}${tchip("topic", "命题", "命题")}${tchip("region", "cn", "国内")}${tchip("region", "intl", "海外/线上")}${tchip("mine", "1", "★ 已加入计划")}${tchip("fit", "1", "✓ 适合当前影片")}</div></div>
        <div class="fg"><label>形态</label><div class="chips">${FORMS.map(([nm]) => tchip("form", nm, nm)).join("")}</div></div>
      </div>
    </div>
    <div class="result-h"><span>找到 <b class="num">${res.length}</b> 个赛事 · ${SORTS[p.sort]?.[0] || "截止最近"}</span>
      <div class="active-f">${act.map(k => `<span class="af">${esc((FLABEL[k] && FLABEL[k][p[k]]) || p[k])}<button data-f="${k}" data-v="${FDEF[k]}" aria-label="移除">${I.x}</button></span>`).join("")}${act.length || p.q ? `<button class="btn-txt" data-reset>全部清除</button>` : `<span class="kbd-hint"><kbd>J</kbd><kbd>K</kbd> 移动 <kbd>Enter</kbd> 打开 <kbd>S</kbd> 标记 <kbd>C</kbd> 对比</span>`}</div></div>
    ${res.length ? (view === "grid" ? `<div class="cards" id="rows">${res.map(card).join("")}</div>` : `<div class="list glass" id="rows">${res.map(c => row(c, p.q)).join("")}</div>`) : emptyBox("没有符合条件的赛事", `换个关键词，或者<button class="btn-txt" data-reset>清除全部筛选</button>`, "search")}
  </div>`;
};
V.contests.after = () => {
  const q = $("#fq"); if (!q) return;
  const push = debounce(() => nav("contests", clean({ ...filt(), q: q.value, _f: 1 }), { replace: true }), 240);
  q.addEventListener("input", () => { q.closest(".field").classList.toggle("has", !!q.value); push(); });
  if (R.params._f) { q.focus(); q.setSelectionRange(q.value.length, q.value.length); }
  $("#fsort").onchange = e => nav("contests", clean({ ...filt(), sort: e.target.value }), { replace: true });
};
const clean = p => Object.fromEntries(Object.entries(p).filter(([k, v]) => v !== "" && v != null && (FDEF[k] !== v || k === "_f")));

/* ── calendar ── */
let calM = null;
V.calendar = () => {
  if (!calM) calM = new Date(T0.getFullYear(), T0.getMonth(), 1);
  const scope = R.params.scope || "all";
  const pool = C.filter(c => scope === "mine" ? isMine(c.record_id) : scope === "top" ? G[gr(c)] <= 2 : true);
  const start = new Date(calM); start.setDate(1 - ((calM.getDay() + 6) % 7));
  const weeks = Math.ceil(((calM.getDay() + 6) % 7 + new Date(calM.getFullYear(), calM.getMonth() + 1, 0).getDate()) / 7);
  let h = "一二三四五六日".split("").map(x => `<div class="wd">周${x}</div>`).join("");
  const counts = [];
  for (let i = 0; i < weeks * 7; i++) { const d = new Date(start); d.setDate(start.getDate() + i); counts.push(pool.filter(c => c["截止日期"] === ymd(d)).length); }
  const mx = Math.max(1, ...counts);
  for (let i = 0; i < weeks * 7; i++) {
    const d = new Date(start); d.setDate(start.getDate() + i); const k = ymd(d);
    const ev = pool.filter(c => c["截止日期"] === k).sort((a, b) => (isMine(b.record_id) - isMine(a.record_id)) || G[gr(a)] - G[gr(b)]);
    const out = d.getMonth() !== calM.getMonth();
    h += `<div class="cell ${out ? "out" : ""} ${+d === +T0 ? "t" : ""} ${d < T0 ? "past" : ""}" ${ev.length ? `data-cday="${k}"` : ""}><span class="heat" style="opacity:${ev.length ? (.25 + ev.length / mx * .75).toFixed(2) : 0}"></span><div class="n"><b>${d.getDate()}</b>${ev.length ? `<span class="muted" style="font-size:11px;font-weight:600;position:relative">${ev.length} 个</span>` : ""}</div>
      <div class="evs">${ev.slice(0, 3).map(c => `<div class="ev ${isMine(c.record_id) ? "mine" : ""}" data-open="${c.record_id}" title="${esc(c["名称"])}"><i class="i-${gr(c)}"></i><span>${isMine(c.record_id) ? "★ " : ""}${esc(c["名称"])}</span></div>`).join("")}</div>
      ${ev.length > 3 ? `<a class="ev-more" href="#/calendar?${new URLSearchParams({ ...R.params, day: k })}">还有 ${ev.length - 3} 个</a>` : ""}</div>`;
  }
  const dayOpen = R.params.day;
  const upcoming = pool.filter(c => { const d = parseD(c["截止日期"]); return d && d >= T0 && isOpen(c); }).sort(byDl);
  const groups = {}; (dayOpen ? pool.filter(c => c["截止日期"] === dayOpen) : upcoming.filter(c => { const d = parseD(c["截止日期"]); return d.getMonth() === calM.getMonth() && d.getFullYear() === calM.getFullYear(); })).forEach(c => (groups[c["截止日期"]] ||= []).push(c));
  const monthN = pool.filter(c => { const d = parseD(c["截止日期"]); return d && d.getMonth() === calM.getMonth() && d.getFullYear() === calM.getFullYear(); }).length;
  const gkeys = Object.keys(groups).sort();
  return `<div class="page-in">
    <div><span class="eyebrow">截止日历</span>
    <div class="cal-head"><h1 class="h1">${calM.getFullYear()} 年 ${calM.getMonth() + 1} 月</h1>
      <div class="cal-nav"><button class="icon-btn" data-cal="-1" aria-label="上个月">${I.l}</button><button class="btn sm" data-cal="0" style="border:0;box-shadow:none">今天</button><button class="icon-btn" data-cal="1" aria-label="下个月">${I.r}</button></div>
      <span class="tag">本月 ${monthN} 个截止</span>
      <span style="flex:1"></span>
      <div class="seg" role="group">${[["all", "全部"], ["top", "B 级以上"], ["mine", "我标记的"]].map(([k, nm]) => `<button class="${scope === k ? "on" : ""}" data-scope="${k}">${nm}</button>`).join("")}</div>
      <button class="btn" data-ics>${I.bell}导出到手机日历</button>
    </div></div>
    <div class="cal-grid glass">${h}</div>
    <section class="sec agenda">${secH("list", dayOpen ? `${fmtFull(dayOpen)} 截止` : `${calM.getMonth() + 1} 月截止清单`, dayOpen ? "" : "按日期排列，点任意赛事看详情", dayOpen ? `<a class="link" href="#/calendar${scope !== "all" ? "?scope=" + scope : ""}">看整月${I.r}</a>` : "")}
      ${gkeys.length ? gkeys.map(k => `<div style="margin-bottom:14px"><div class="muted" style="font-size:12px;font-weight:700;margin:0 4px 8px;letter-spacing:.06em">${fmtFull(k)} · ${groups[k].length} 个</div><div class="list glass">${groups[k].sort((a, b) => G[gr(a)] - G[gr(b)]).map(c => row(c)).join("")}</div></div>`).join("") : emptyBox(scope === "mine" ? "这个月没有你标记的截止" : "这个月没有截止的赛事", `<a class="btn-txt" href="#/contests">去挑几个赛事</a>`, "cal")}
    </section>
  </div>`;
};
function exportICS(list, name = "ai-contest-deadlines.ics") {
  const e = s => String(s || "").replace(/[\\;,]/g, m => "\\" + m).replace(/\r?\n/g, "\\n");
  const f = d => ymd(d).replace(/-/g, "");
  const stamp = new Date().toISOString().replace(/[-:]/g, "").slice(0, 15) + "Z";
  let t = "BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//AIContest//Assistant//ZH\r\nCALSCALE:GREGORIAN\r\nX-WR-CALNAME:AI 赛事截止\r\n";
  for (const c of list) {
    const d = parseD(c["截止日期"]); if (!d) continue; const d2 = new Date(d); d2.setDate(d.getDate() + 1); const u = c["投递链接"] || c["官网"] || "";
    t += `BEGIN:VEVENT\r\nUID:${c.record_id}@aicontest\r\nDTSTAMP:${stamp}\r\nDTSTART;VALUE=DATE:${f(d)}\r\nDTEND;VALUE=DATE:${f(d2)}\r\nSUMMARY:${e(`【${gr(c)}】截止 · ${c["名称"]}`)}\r\nDESCRIPTION:${e(`最高奖励：${c["最高奖金"]}\n报名费：${c["报名费"]}\n投递：${u || "—"}`)}\r\n${/^https?:/.test(u) ? `URL:${u}\r\n` : ""}BEGIN:VALARM\r\nTRIGGER:-P3D\r\nACTION:DISPLAY\r\nDESCRIPTION:${e("3 天后截止：" + c["名称"])}\r\nEND:VALARM\r\nBEGIN:VALARM\r\nTRIGGER:-PT15H\r\nACTION:DISPLAY\r\nDESCRIPTION:${e("今天截止：" + c["名称"])}\r\nEND:VALARM\r\nEND:VEVENT\r\n`;
  }
  download(name, t + "END:VCALENDAR\r\n", "text/calendar");
}

/* ── tracker ── */
V.tracker = () => {
  const counts = STATUSES.map(s => C.filter(c => status(c.record_id) === s.k).length);
  const total = counts.reduce((a, b) => a + b, 0);
  const cols = STATUSES.map((s, si) => {
    const items = C.filter(c => status(c.record_id) === s.k).sort(byDl);
    return `<div class="col glass" data-col="${s.k}"><div class="col-h"><i style="background:${s.c}"></i>${s.n}<span class="n">${items.length}${total ? ` · ${Math.round(items.length / total * 100)}%` : ""}</span></div>${si === 3 && items.length ? `<div class="col-sum">入围 ${items.filter(c => mk(c.record_id)?.outcome === "入围").length} · 获奖 ${items.filter(c => mk(c.record_id)?.outcome === "获奖").length}</div>` : ""}
      ${items.map(c => { const l = daysLeft(c), m = mk(c.record_id); const w = l === null ? 0 : Math.max(4, Math.min(100, 100 - l / 45 * 100)); const col = l !== null && l <= 3 ? "var(--red)" : l !== null && l <= 7 ? "var(--amber)" : "var(--acc)";
        return `<div class="kcard" draggable="true" data-kid="${c.record_id}" data-open="${c.record_id}" style="--kc:${s.c}">
        <div class="km">${gB(c)}${isFree(c) ? '<span class="tag free">免费</span>' : ""}<span class="d" style="color:${col}">${l === null ? "待定" : l < 0 ? "已截止" : l === 0 ? "今天截止" : l + " 天"}</span></div>
        <h4>${esc(c["名称"])}</h4>${m?.outcome ? `<span class="tag" style="color:${OC[m.outcome]};align-self:flex-start">${m.outcome}</span>` : ""}${m?.d?.conf ? `<small class="muted" style="font-size:11.5px">回执 ${esc(m.d.conf)}</small>` : ""}${l !== null && l >= 0 && si < 2 ? `<div class="kbar-w"><div class="kbar"><i style="width:${w}%;background:${col}"></i></div><small>${fmtMD(c["截止日期"])}截止</small></div>` : ""}${m?.note ? `<div class="note">${esc(m.note)}</div>` : ""}</div>`; }).join("") || `<div class="col-empty">${I[["star", "edit", "check", "trophy"][si]]}<span>${["在任意赛事上点 ☆<br>就会出现在这里", "开始做片后<br>把卡片拖到这里", "投递完成后<br>拖到这里记录", "出结果后<br>拖到这里归档"][si]}</span></div>`}
    </div>`;
  }).join("");
  const sug = live().filter(c => !PL()[c.record_id] && daysLeft(c) !== null && daysLeft(c) >= 3 && G[gr(c)] <= 1).sort(byDl).slice(0, 6);
  const skipped = C.filter(c => status(c.record_id) === "skip");
  return `<div class="page-in">
    <div class="greet" style="margin-top:0"><div><span class="eyebrow">投递计划 · 《${esc(filmName(FILM()))}》</span><h1 class="h1">从想投到拿奖，一眼看清进度</h1><p>每部影片有自己的投递计划，在顶部「当前影片」切换。拖动卡片切换阶段；点卡片记录单元、费用、确认编号、结果。</p></div>
      <div class="btns"><button class="btn" data-add-custom>${I.plus}添加未收录赛事</button><button class="btn" data-plan-csv>${I.dl}导出 CSV</button><button class="btn" data-plan-md>${I.copy}复制档案</button><button class="btn" data-ics-mine>${I.bell}截止提醒</button></div></div>
    <div class="funnel glass" hidden>${STATUSES.map((s, i) => `<div class="fn"><span><i style="background:${s.c}"></i>${s.n}</span><b class="num">${counts[i]}</b><small>${i === 3 ? `入围 ${Object.values(PL()).filter(x => x.outcome === "入围").length} · 获奖 ${Object.values(PL()).filter(x => x.outcome === "获奖").length}` : total ? Math.round(counts[i] / total * 100) + "%" : "—"}</small></div>`).join("")}</div>
    <div class="board">${cols}</div>
    ${sug.length ? `<section class="sec" style="margin-top:30px">${secH("spark", "可以加进来的", "还没标记、至少还有 3 天准备时间的 S/A 级赛事", more("#/contests?grade=SA"))}<div class="suggest">${sug.map(c => `<div class="sg glass" data-open="${c.record_id}">${gB(c)}<div class="t"><b>${esc(c["名称"])}</b><span>${daysLeft(c)} 天后截止 · ${esc(c["最高奖金"])}</span></div><button class="add" data-quick="${c.record_id}">${I.plus}想投</button></div>`).join("")}</div></section>` : ""}
    <section class="sec" style="margin-top:26px">${secH("inbox", "备份与迁移", "所有影片资料和投递计划都保存在这台设备的浏览器里。换电脑、清缓存之前请先导出备份。")}<div class="btns"><button class="btn" data-export>${I.dl}导出全部备份</button><label class="btn">${I.up2}导入备份<input type="file" accept=".json" data-import hidden></label></div></section>
    ${skipped.length ? `<section class="sec">${secH("x", `已忽略 <span class="muted" style="font-weight:500">${skipped.length}</span>`, "这些赛事不会出现在首页和默认列表里")}<div class="list glass">${skipped.map(c => row(c)).join("")}</div></section>` : ""}
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
    col.addEventListener("dragleave", e => { if (!col.contains(e.relatedTarget)) col.classList.remove("over"); });
    col.addEventListener("drop", e => { e.preventDefault(); col.classList.remove("over"); const id = e.dataTransfer.getData("text/plain") || dragId; if (id && status(id) !== col.dataset.col) setStatus(id, col.dataset.col); });
  });
};

/* ═════════ 我的影片 · 资料 / 准备度 / 识别 / 匹配 ═════════ */
const FSEC = [
  { k: "basic", n: "基础信息", d: "片名、类型、时长等常用内容", i: "film", f: [
    ["nameZh", "影片中文名", "text", "如：一粒种子", 1], ["nameEn", "影片英文名", "text", "如：A Seed", 1],
    ["type", "作品类型", ["动画短片", "剧情短片", "实验影像", "纪录片", "音乐影像", "系列短剧", "广告/品牌片", "其他"], "", 1],
    ["genre", "类型标签", "text", "如：动画、奇幻、成长"], ["keywords", "内容关键词", "text", "如：传统文化、人与自然"],
    ["duration", "影片时长", "text", "如：00:03:30", 1], ["ratio", "画幅", ["16:9", "9:16", "2.39:1", "1:1", "4:3", "其他"], ""],
    ["doneDate", "完成日期", "date", ""], ["country", "国家 / 地区", "text", "如：中国"], ["language", "对白语言", "text", "如：中文对白，中英字幕", 1],
    ["student", "创作时是否学生", ["是", "否", "待确认"], "", 1], ["school", "院校 / 专业", "text", "学生作品填写"],
  ] },
  { k: "intro", n: "中英文介绍", d: "一句话梗概、故事简介和导演阐述", i: "doc", f: [
    ["logline", "一句话梗概", "text", "30 字以内，说清谁、想要什么、遇到什么", 1],
    ["synZh", "中文简介", "area", "150–300 字，大多数赛事都要", 1], ["synEn", "英文简介 Synopsis", "area", "海外赛事必填，建议 100–200 words", 1],
    ["statement", "导演阐述", "area", "为什么拍、想表达什么、AI 在其中的角色"],
  ] },
  { k: "crew", n: "主创与联系人", d: "主创履历和联系方式", i: "target", f: [
    ["director", "导演（中 / 英）", "text", "如：张三 / Zhang San", 1], ["bioZh", "导演中文简介", "area", "100 字左右"], ["bioEn", "导演英文简介", "area", "Director bio"],
    ["team", "团队名称", "text", ""], ["contact", "投递联系人", "text", "", 1], ["email", "联系邮箱", "text", "", 1], ["phone", "联系电话", "text", ""], ["wechat", "微信", "text", ""], ["social", "网站 / 社交媒体", "text", ""],
  ] },
  { k: "ai", n: "AIGC 与版权", d: "AI 使用方式、人工贡献和权利说明", i: "shield", f: [
    ["aiTools", "使用的 AI 工具", "text", "如：即梦、可灵、Midjourney、Suno", 1], ["aiFlow", "AI 制作流程", "area", "文生图→图生视频→剪辑…每一步用了什么", 1],
    ["aiRatio", "AI 生成占比", ["100%", "80% 以上", "50–80%", "50% 以下"], ""], ["selfModel", "是否使用自训练模型", ["否", "是（LoRA / 微调）", "待确认"], ""],
    ["human", "人工创作贡献", "area", "剧本、分镜、筛选、剪辑、声音等由谁完成", 1], ["copyright", "版权与素材来源", "area", "音乐、字体、素材授权；平台商用条款", 1],
    ["premiere", "首映状态", ["未公开放映", "仅线上公开", "已有线下放映"], "", 1],
  ] },
  { k: "files", n: "文件与证明", d: "成片、海报、字幕和规格", i: "image", f: [
    ["filmLink", "成片链接（带密码）", "text", "Vimeo / B站 / 网盘", 1], ["trailer", "预告片链接", "text", ""], ["drive", "素材网盘", "text", ""],
    ["poster", "海报", ["已准备", "需要调整", "未准备"], "", 1], ["stills", "剧照（3–5 张）", ["已准备", "需要调整", "未准备"], ""],
    ["subZh", "中文字幕 SRT", ["已准备", "需要调整", "未准备"], ""], ["subEn", "英文字幕 SRT", ["已准备", "需要调整", "未准备"], "", 1],
    ["final", "是否最终完成版", ["是", "否"], ""], ["res", "分辨率", ["4K", "1080p", "720p", "其他"], ""], ["fps", "帧率", ["24", "25", "30", "60", "其他"], ""], ["audio", "声音制式", ["立体声", "5.1", "单声道"], ""],
  ] },
];
const FDEFS = Object.fromEntries(FSEC.flatMap(s => s.f.map(f => [f[0], { k: f[0], n: f[1], t: f[2], ph: f[3], core: !!f[4], sec: s.k }])));
const CORE = Object.values(FDEFS).filter(f => f.core);
const filled = (f, k) => { const v = String(f.fields[k] ?? "").trim(); return !!v && !["未准备", "待确认"].includes(v); };
function readiness(f) {
  const done = CORE.filter(d => filled(f, d.k)).length; const pct = Math.round(done / CORE.length * 100);
  const gaps = CORE.filter(d => !filled(f, d.k)).map(d => d.n);
  const warn = [];
  if (f.fields.subEn === "未准备" || !f.fields.subEn) warn.push("英文字幕尚未准备，海外赛事大多要求");
  if (!f.fields.aiFlow) warn.push("AI 制作流程还没写成可核验的说明");
  if (!f.fields.human) warn.push("人工创作贡献没有单独说明");
  if (!f.fields.premiere) warn.push("首映状态未确认，可能影响资格");
  if (f.fields.poster === "未准备" || !f.fields.poster) warn.push("海报还没准备");
  if (!f.crew?.length) warn.push("还没有添加主创人员");
  const secPct = Object.fromEntries(FSEC.map(s => { const fs = s.f.map(x => x[0]); const d = fs.filter(k => filled(f, k)).length; return [s.k, Math.round(d / fs.length * 100)]; }));
  return { pct, gaps, warn, secPct, level: pct < 50 ? "先补齐核心信息，再处理具体赛事的报名表" : pct < 90 ? "已经可以开始填报名表，专业材料还能继续补" : "材料准备充分，提交前重点确认资格和权利" };
}
const durSec = s => { s = String(s || ""); let m; if ((m = s.match(/(\d{1,2}):(\d{2}):(\d{2})/))) return +m[1] * 3600 + +m[2] * 60 + +m[3]; if ((m = s.match(/^(\d{1,3}):(\d{2})$/))) return +m[1] * 60 + +m[2]; let t = 0; if ((m = s.match(/(\d+(?:\.\d+)?)\s*(分钟|分|min)/i))) t += +m[1] * 60; if ((m = s.match(/(\d+)\s*(秒|s\b|sec)/i))) t += +m[1]; return t || null; };
const fmtDur = t => t == null ? "" : t >= 60 ? `${Math.floor(t / 60)} 分 ${t % 60 ? (t % 60) + " 秒" : ""}`.trim() : `${t} 秒`;
/* 从赛事说明里读出规则 */
function rulesOf(c) {
  const t = `${c["名称"]} ${c["赛事说明"] || ""} ${c["计划备注"] || ""} ${c["类别"] || ""}`;
  const r = {}; let m;
  const U = "(分钟|分|秒|min(?:utes)?(?![a-z])|s(?:ec)?(?![a-z]))";
  const sec = (n, u) => +n * (/^(秒|s)/i.test(u) && !/^min/i.test(u) ? 1 : 60);
  if ((m = t.match(new RegExp(`(\\d+(?:\\.\\d+)?)\\s*(?:${U})?\\s*(?:-|–|—|~|至|到)\\s*(\\d+(?:\\.\\d+)?)\\s*${U}`, "i"))) ) { r.max = sec(m[3], m[4]); r.min = sec(m[1], m[2] || m[4]); if (!r.min || r.min >= r.max) delete r.min; }
  else if ((m = t.match(new RegExp(`(?:不超过|不得超过|不长于|≤|<=|最长|限时|under|up to|max(?:imum)?|less than|within)\\s*(\\d+(?:\\.\\d+)?)\\s*${U}`, "i")))) r.max = sec(m[1], m[2]);
  else if ((m = t.match(new RegExp(`(\\d+(?:\\.\\d+)?)\\s*${U}\\s*(?:以内|内|以下|or less|max)`, "i")))) r.max = sec(m[1], m[2]);
  if (/仅限[^，。；]{0,8}学生|高校学生|在校(学)?生|学生组|student/i.test(t)) r.student = /仅限[^，。；]{0,8}学生|面向[^，。；]{0,6}学生|高校学生/.test(t) ? "only" : "track";
  if (/中英(文)?(双语)?字幕|英文字幕|english subtitles/i.test(t)) r.subEn = 1;
  if (/首映|未(在|曾)?公开|未发布|world premiere|premiere/i.test(t)) r.premiere = 1;
  if (/竖屏|9:16|vertical/i.test(t)) r.vertical = 1;
  if ((m = t.match(/AI[^，。；]{0,6}(?:占比|比例|使用率|创作量|生成比例|含量)[^，。；\d]{0,4}(\d{2})\s*%/i))) r.aiMin = +m[1];
  if (c["命题"] === "命题") r.topic = 1;
  if ((m = t.match(/(仅限|限)(澳大利亚|美国|北京|在京|香港|澳门|山东|广东|英国|加拿大|印度)[^，。；]{0,10}(居民|创作者|申请人|注册|机构|境内|常驻)/))) r.region = m[0];
  if (/不接受个人报名|需(由)?学校|机构统一报送|主申报单位须为/.test(t)) r.org = 1;
  return r;
}
function matchFilm(c, f = FILM()) {
  const mk2 = `${c.record_id}|${f.id}|${SV}`; if (MM.has(mk2)) return MM.get(mk2); const res = matchFilmRaw(c, f); if (MM.size > 4000) MM.clear(); MM.set(mk2, res); return res;
}
function matchFilmRaw(c, f) {
  const r = rulesC(c), out = [], ff = f.fields; const d = durSec(ff.duration);
  const add = (lv, t) => out.push({ lv, t });
  if (r.max || r.min) { if (d == null) add("warn", `时长要求 ${r.min ? fmtDur(r.min) + "–" : "≤ "}${fmtDur(r.max)}，影片时长还没填`); else if ((r.max && d > r.max) || (r.min && d < r.min)) add("bad", `时长不符：要求 ${r.min ? fmtDur(r.min) + "–" : "≤ "}${fmtDur(r.max)}，影片 ${fmtDur(d)}`); else add("ok", `时长符合（${fmtDur(d)}）`); }
  if (r.student === "only") { if (ff.student === "是") add("ok", "学生身份符合"); else if (ff.student === "否") add("bad", "仅限学生参加"); else add("warn", "仅限学生，请确认创作时身份"); }
  if (r.subEn) { if (ff.subEn === "已准备") add("ok", "英文字幕已准备"); else add(ff.subEn === "需要调整" ? "warn" : "bad", "要求中英 / 英文字幕"); }
  if (r.premiere) { if (ff.premiere === "未公开放映") add("ok", "首映状态符合"); else if (ff.premiere) add("warn", `有首映要求，影片${ff.premiere}，请看规则`); else add("warn", "有首映要求，影片首映状态未填"); }
  if (r.vertical) { if (ff.ratio === "9:16") add("ok", "竖屏画幅符合"); else if (ff.ratio) add("warn", `偏好竖屏，影片是 ${ff.ratio}`); }
  if (r.aiMin) { const map = { "100%": 100, "80% 以上": 80, "50–80%": 50, "50% 以下": 0 }; const v = map[ff.aiRatio]; if (v == null) add("warn", `要求 AI 占比 ≥${r.aiMin}%，影片占比未填`); else add(v >= r.aiMin ? "ok" : "bad", `AI 占比要求 ≥${r.aiMin}%`); }
  if (r.region) add("warn", `地区限制：${r.region}`);
  if (r.org) add("warn", "需要机构 / 学校申报，个人不能直接投");
  if (r.topic) add("warn", "命题赛事，确认影片内容贴合主题");
  if (!isFree(c)) add("info", `报名费：${short(feeTxt(c), 26)}`);
  const score = out.some(x => x.lv === "bad") ? "bad" : out.some(x => x.lv === "warn") ? "warn" : "ok";
  return { list: out, score, hasFilm: !!(ff.nameZh || ff.nameEn || ff.duration) };
}
/* 粘贴识别 */
const ALIAS = {
  nameZh: ["影片中文名", "中文片名", "片名", "作品名称", "作品名", "影片名称"], nameEn: ["影片英文名", "英文片名", "英文名", "english title", "title"],
  type: ["作品类型", "影片类型", "作品类别", "类别"], genre: ["类型标签", "题材", "作品标签", "标签"], keywords: ["内容关键词", "关键词", "主题"],
  duration: ["影片时长", "时长", "片长", "running time", "duration"], doneDate: ["完成日期", "完成时间", "制作完成日期"], country: ["国家 / 地区", "国家/地区", "制作国家", "国家", "地区"], language: ["对白语言", "语言", "language"],
  logline: ["一句话梗概", "一句话简介", "logline"], synZh: ["中文简介", "影片简介", "故事梗概", "内容梗概", "简介", "梗概"], synEn: ["英文简介", "英文梗概", "synopsis"], statement: ["导演阐述", "创作阐述", "作者阐述", "创作说明", "director's statement", "director statement"],
  director: ["导演"], bioZh: ["导演中文简介", "导演简介", "作者简介"], bioEn: ["导演英文简介", "director bio", "biography"], team: ["团队名称", "申报团队名称", "参赛团队"],
  contact: ["投递人姓名", "联系人", "负责人"], email: ["联系邮箱", "邮箱", "email", "e-mail"], phone: ["联系电话", "手机", "电话"], wechat: ["联系微信", "微信号", "微信"], social: ["网站或社交媒体", "社交媒体", "网站"],
  aiTools: ["使用的ai工具", "ai工具", "生成工具", "使用工具"], aiFlow: ["ai制作流程", "ai流程", "制作流程", "技术路径", "技术阐述", "作品技术阐述"], human: ["人工创作贡献", "人工贡献"], copyright: ["版权与素材来源说明", "版权说明", "素材来源", "权利说明"],
  filmLink: ["成片链接", "影片链接", "作品链接"], trailer: ["预告片链接", "预告链接"], drive: ["作品集 / 网盘链接", "网盘链接", "百度网盘链接", "作品集链接"], school: ["院校", "学校", "专业"],
};
const TOOLS = ["即梦", "可灵", "Kling", "Midjourney", "Runway", "Sora", "Veo", "Vidu", "海螺", "Hailuo", "Seedance", "梦宝", "万相", "Wan", "Pika", "Luma", "Stable Diffusion", "ComfyUI", "Flux", "GPT", "ChatGPT", "DeepSeek", "Suno", "Udio", "ElevenLabs", "剪映", "Premiere", "DaVinci", "达芬奇", "After Effects", "Photoshop", "PixVerse", "拍我AI", "LibLib", "Nano Banana", "豆包", "混元"];
function parsePaste(txt) {
  const res = {}; const src = String(txt || "").replace(/\r/g, "");
  const keys = Object.entries(ALIAS).flatMap(([k, a]) => a.map(x => [x.toLowerCase(), k])).sort((a, b) => b[0].length - a[0].length);
  const lines = src.split("\n"); let cur = null, buf = [];
  const flush = () => { if (cur && buf.join("").trim() && !res[cur]) res[cur] = buf.join("\n").trim(); buf = []; };
  for (const raw of lines) {
    const ln = raw.trim(); const head = ln.replace(/^[#>*\-\s【\[（(]*|[】\]）)]/g, "").trim();
    let hit = null, rest = "";
    for (const [a, k] of keys) { const low = head.toLowerCase(); if (low.startsWith(a)) { const after = head.slice(a.length); const m = after.match(/^\s*(?:[:：]\s*|\s*$)/); if (m) { hit = k; rest = after.slice(m[0].length); break; } } }
    if (hit && head.length <= 40 + rest.length) { flush(); cur = hit; if (rest) buf.push(rest); }
    else if (cur) buf.push(ln);
  }
  flush();
  const all = src; let m;
  if (!res.duration && (m = all.match(/(\d{1,2}:\d{2}:\d{2})|(?:时长|片长)[^\d]{0,4}(\d+\s*分(?:钟)?(?:\s*\d+\s*秒)?)/))) res.duration = m[1] || m[2];
  if (!res.email && (m = all.match(/[\w.+-]+@[\w-]+\.[\w.]+/))) res.email = m[0];
  if (!res.phone && (m = all.match(/(?<!\d)1[3-9]\d{9}(?!\d)/))) res.phone = m[0];
  if ((m = all.match(/\b(4K|2160p|1080p|720p)\b/i))) res.res = /4k|2160/i.test(m[1]) ? "4K" : m[1].toLowerCase();
  if ((m = all.match(/\b(24|25|30|60)\s*(?:fps|帧)/i))) res.fps = m[1];
  if (/5\.1/.test(all)) res.audio = "5.1"; else if (/立体声|stereo/i.test(all)) res.audio = "立体声";
  if (/英文字幕|english subtitles|中英字幕/i.test(all)) res.subEn = "已准备";
  if (/在读|研究生|本科生|硕士|学生/.test(all) && !res.student) res.student = "是";
  if (!res.aiTools) { const t = TOOLS.filter(x => new RegExp(x.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i").test(all)); if (t.length) res.aiTools = [...new Set(t)].join("、"); }
  if (!res.type) { if (/动画|动漫/.test(all)) res.type = "动画短片"; else if (/纪录/.test(all)) res.type = "纪录片"; else if (/\bMV\b|音乐/.test(all)) res.type = "音乐影像"; else if (/短剧/.test(all)) res.type = "系列短剧"; }
  if (!res.nameZh && (m = all.match(/《([^》]{1,30})》/))) res.nameZh = m[1];
  for (const k of Object.keys(res)) { const def = FDEFS[k]; if (def && Array.isArray(def.t) && !def.t.includes(res[k])) { const hit = def.t.find(o => String(res[k]).includes(o) || o.includes(String(res[k]))); if (hit) res[k] = hit; else if (k !== "type") delete res[k]; else res[k] = "其他"; } }
  return res;
}
/* 资料卡 */
function materialMD(f) {
  const x = f.fields, L = [];
  L.push(`# 《${x.nameZh || "未命名影片"}》${x.nameEn ? " " + x.nameEn : ""}｜通用投奖资料卡`, "");
  const row = (k) => x[k] ? `- **${FDEFS[k].n}**：${String(x[k]).replace(/\n/g, " ")}` : null;
  for (const s of FSEC) { const rows = s.f.map(z => z[0]).filter(k => x[k] && !["synZh", "synEn", "statement", "bioZh", "bioEn", "aiFlow", "human", "copyright"].includes(k)).map(row); const longs = s.f.map(z => z[0]).filter(k => x[k] && ["synZh", "synEn", "statement", "bioZh", "bioEn", "aiFlow", "human", "copyright"].includes(k));
    if (!rows.length && !longs.length && !(s.k === "crew" && f.crew?.length)) continue;
    L.push(`## ${s.n}`, ...rows); for (const k of longs) L.push("", `**${FDEFS[k].n}**`, "", String(x[k]));
    if (s.k === "crew" && f.crew?.length) { L.push("", "| 职务 | 中文名 | 英文名 | 学生 | 院校 |", "|---|---|---|---|---|", ...f.crew.map(p => `| ${p.role || ""} | ${p.zh || ""} | ${p.en || ""} | ${p.stu || ""} | ${p.school || ""} |`)); }
    L.push(""); }
  if (f.awards?.length) L.push("## 获奖与入围", "| 电影节 | 时间 | 结果 |", "|---|---|---|", ...f.awards.map(a => `| ${a.fest || ""} | ${a.date || ""} | ${a.result || ""} |`), "");
  L.push("> 本资料卡由 AI赛事助手 生成。权利、首映、获奖状态和联系方式请在每次提交前由本人确认。");
  return L.join("\n");
}
function mdToHtml(md) { return md.split("\n").map(l => l.startsWith("# ") ? `<h1>${esc(l.slice(2))}</h1>` : l.startsWith("## ") ? `<h2>${esc(l.slice(3))}</h2>` : l.startsWith("- ") ? `<p>• ${esc(l.slice(2)).replace(/\*\*(.+?)\*\*/g, "<b>$1</b>")}</p>` : l.startsWith("|") ? (/^\|[-| ]+\|$/.test(l) ? "" : `<tr>${l.split("|").slice(1, -1).map(c => `<td>${esc(c.trim())}</td>`).join("")}</tr>`) : l.startsWith("> ") ? `<p style="color:#888">${esc(l.slice(2))}</p>` : l.trim() ? `<p>${esc(l).replace(/\*\*(.+?)\*\*/g, "<b>$1</b>")}</p>` : "").join("\n").replace(/(<tr>[\s\S]*?<\/tr>\n?)+/g, m => `<table border="1" cellspacing="0" cellpadding="6" style="border-collapse:collapse">${m}</table>`); }
function planCSV(fid) {
  const pl = ST.plans[fid] || {}, f = ST.films[fid]; const cols = ["赛事", "分级", "截止日期", "状态", "结果", "投稿单元", "投稿平台", "提交日期", "结果公布", "费用", "币种", "确认编号", "影片版本", "材料版本", "回执链接", "备注", "官网"];
  const q = v => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const rows = Object.entries(pl).filter(([id, m]) => byId.has(id) && m.status && m.status !== "skip").map(([id, m]) => { const c = byId.get(id), d = m.d || {}; return [c["名称"], gr(c), c["截止日期"] || "", SN[m.status], m.outcome || "", d.unit, d.platform, d.subDate, d.resDate, d.fee, d.cur, d.conf, d.ver, d.mat, d.receipt, m.note, c["官网"]].map(q).join(","); });
  return "\ufeff" + [cols.map(q).join(","), ...rows].join("\r\n");
}
function planMD(fid) {
  const pl = ST.plans[fid] || {}, f = ST.films[fid]; const items = Object.entries(pl).filter(([id, m]) => byId.has(id) && m.status && m.status !== "skip").map(([id, m]) => [byId.get(id), m]).sort((a, b) => byDl(a[0], b[0]));
  return [`# 《${filmName(f)}》投奖档案`, "", `共 ${items.length} 个目标 · 已提交 ${items.filter(([, m]) => ["submitted", "result"].includes(m.status)).length} 个 · 获奖 ${items.filter(([, m]) => m.outcome === "获奖").length} 个`, "", "| 赛事 | 截止 | 状态 | 结果 | 确认编号 | 备注 |", "|---|---|---|---|---|---|",
    ...items.map(([c, m]) => `| ${c["名称"]} | ${c["截止日期"] || "待定"} | ${SN[m.status]} | ${m.outcome || ""} | ${m.d?.conf || ""} | ${(m.note || "").replace(/\n/g, " ")} |`)].join("\n");
}

V.films = () => {
  const f = FILM(), rd = readiness(f), sec = R.params.sec || "basic", S = FSEC.find(s => s.k === sec) || FSEC[0];
  const films = Object.values(ST.films);
  const fit = live().filter(c => daysLeft(c) !== null).map(c => [c, matchFilm(c, f)]).filter(([, m]) => m.score !== "bad").sort((a, b) => (a[1].score === "ok" ? 0 : 1) - (b[1].score === "ok" ? 0 : 1) || G[gr(a[0])] - G[gr(b[0])] || byDl(a[0], b[0]));
  const inp = d => { const v = f.fields[d.k] ?? ""; const lab = `<label class="fl ${d.t === "area" ? "wide" : ""}"><span>${d.n}${d.core ? '<i class="core">核心</i>' : ""}</span>`;
    if (Array.isArray(d.t)) return `${lab}<div class="opt">${d.t.map(o => `<button type="button" class="${v === o ? "on" : ""}" data-fv="${d.k}" data-o="${esc(o)}">${esc(o)}</button>`).join("")}</div></label>`;
    if (d.t === "area") return `${lab}<textarea data-fk="${d.k}" placeholder="${esc(d.ph)}" rows="4">${esc(v)}</textarea><small class="cnt">${String(v).length} 字</small></label>`;
    return `${lab}<input data-fk="${d.k}" type="${d.t === "date" ? "date" : "text"}" value="${esc(v)}" placeholder="${esc(d.ph)}"></label>`; };
  const ring = (p, sz = 120) => { const r = sz / 2 - 9, cc = 2 * Math.PI * r; return `<svg class="ring" viewBox="0 0 ${sz} ${sz}" width="${sz}" height="${sz}"><defs><linearGradient id="rg" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="#6d5efc"/><stop offset="1" stop-color="#22c3e6"/></linearGradient></defs><circle cx="${sz / 2}" cy="${sz / 2}" r="${r}" stroke="var(--line)" stroke-width="10" fill="none"/><circle cx="${sz / 2}" cy="${sz / 2}" r="${r}" stroke="url(#rg)" stroke-width="10" fill="none" stroke-linecap="round" stroke-dasharray="${cc}" stroke-dashoffset="${cc * (1 - p / 100)}" transform="rotate(-90 ${sz / 2} ${sz / 2})" style="transition:stroke-dashoffset .8s var(--ease)"/><text x="50%" y="50%" text-anchor="middle" dominant-baseline="central" font-size="${sz / 4.4}" font-weight="800" fill="var(--ink)">${p}%</text></svg>`; };
  const planN = Object.values(PL()).filter(m => m.status && m.status !== "skip").length;
  return `<div class="page-in">
    <div class="greet" style="margin-top:0"><div><span class="eyebrow">我的影片</span><h1 class="h1">一部影片，一套资料，投遍所有赛事</h1><p>每部影片单独保存资料和投递计划。可以直接粘贴已有的申报材料，系统会自动识别整理。资料只保存在这台设备的浏览器里。</p></div>
      <div class="btns"><button class="btn" data-paste>${I.copy}粘贴已有资料</button><button class="btn pri" data-card>${I.doc}预览并导出资料卡</button></div></div>
    <div class="film-tabs">${films.map(x => { const r = readiness(x); return `<button class="ftab glass ${x.id === ST.active ? "on" : ""}" data-film="${x.id}"><span class="fposter pb-${["S", "B", "A", "C"][films.indexOf(x) % 4]}">${esc((filmName(x)).slice(0, 1))}</span><span class="fmeta"><b>${esc(filmName(x))}</b><small>${esc(x.fields.type || "未填类型")} · ${x.fields.duration ? esc(x.fields.duration) : "时长未填"}</small><i class="mini-bar"><i style="width:${r.pct}%"></i></i></span></button>`; }).join("")}<button class="ftab add glass" data-new-film>${I.plus}<span>新建影片</span></button></div>
    <div class="film-grid">
      <div class="film-main glass">
        <div class="sec-tabs">${FSEC.map(s => `<a href="#/films?sec=${s.k}" class="${s.k === S.k ? "on" : ""}">${I[s.i]}<span>${s.n}</span><em>${rd.secPct[s.k]}%</em></a>`).join("")}</div>
        <div class="form-h"><div><h2 class="h2">${S.n}</h2><p class="muted" style="margin:4px 0 0;font-size:12.5px">${S.d}</p></div><span class="saved" id="fsaved">✓ 已自动保存</span></div>
        <div class="form">${S.f.map(z => inp(FDEFS[z[0]])).join("")}</div>
        ${S.k === "crew" ? `<div class="sub-list"><div class="sl-h"><div><b>主创人员</b><small>每人只填自己实际承担的职务，报名表会按职务匹配</small></div><button class="btn sm" data-add-crew>${I.plus}添加主创</button></div>
          ${(f.crew || []).map((p, i) => `<div class="sl-row" data-crew="${i}">${[["role", "职务，如：导演"], ["zh", "中文姓名"], ["en", "英文姓名"], ["school", "院校 / 专业"]].map(([k, ph]) => `<input data-ck="${k}" value="${esc(p[k] || "")}" placeholder="${ph}">`).join("")}<select data-ck="stu"><option value="">创作时是否学生</option>${["是", "否"].map(o => `<option ${p.stu === o ? "selected" : ""}>${o}</option>`).join("")}</select><button class="icon-btn" data-del-crew="${i}" title="删除">${I.x}</button></div>`).join("") || `<p class="muted sl-empty">还没有主创人员。至少添加导演和一位实际主创。</p>`}</div>` : ""}
        ${S.k === "files" ? `<div class="sub-list"><div class="sl-h"><div><b>获奖与入围经历</b><small>电影节、时间、奖项分开填，报名表才能正确对应</small></div><button class="btn sm" data-add-award>${I.plus}添加经历</button></div>
          ${(f.awards || []).map((a, i) => `<div class="sl-row aw" data-award="${i}">${[["fest", "电影节 / 赛事"], ["date", "时间，如：2026-05"], ["result", "奖项或入围结果"]].map(([k, ph]) => `<input data-ak="${k}" value="${esc(a[k] || "")}" placeholder="${ph}">`).join("")}<button class="icon-btn" data-del-award="${i}" title="删除">${I.x}</button></div>`).join("") || `<p class="muted sl-empty">暂无经历，可以跳过。</p>`}</div>` : ""}
        <div class="form-foot"><button class="btn-txt" data-clear-film>清空这部影片的资料</button>${films.length > 1 ? `<button class="btn-txt" style="color:var(--red-ink)" data-del-film>删除影片</button>` : ""}<span style="flex:1"></span>${FSEC.findIndex(s => s.k === S.k) < FSEC.length - 1 ? `<a class="btn sm" href="#/films?sec=${FSEC[FSEC.findIndex(s => s.k === S.k) + 1].k}">下一部分：${FSEC[FSEC.findIndex(s => s.k === S.k) + 1].n}${I.r}</a>` : `<button class="btn sm pri" data-card>${I.doc}完成，导出资料卡</button>`}</div>
      </div>
      <aside class="film-side">
        <div class="glass ready"><div class="rd-h">投奖准备度</div>${ring(rd.pct)}<p>${rd.level}</p>
          <div class="rd-bars">${FSEC.map(s => `<a href="#/films?sec=${s.k}"><span>${s.n}</span><i><i style="width:${rd.secPct[s.k]}%"></i></i><em>${rd.secPct[s.k]}%</em></a>`).join("")}</div></div>
        <div class="glass gap-box"><div class="rd-h">${rd.gaps.length ? `优先补这 ${Math.min(5, rd.gaps.length)} 项` : "核心资料已齐全"}</div>
          ${rd.gaps.length ? `<ul>${rd.gaps.slice(0, 5).map(g => { const d = Object.values(FDEFS).find(x => x.n === g); return `<li><a href="#/films?sec=${d.sec}">${I.plus}${esc(g)}</a></li>`; }).join("")}</ul>` : `<p class="muted" style="margin:0;font-size:12.5px">仍需按每个赛事确认资格要求。</p>`}
          ${rd.warn.length ? `<div class="rd-h" style="margin-top:14px">提交前注意</div><ul class="w">${rd.warn.slice(0, 4).map(w => `<li>${I.alert}${esc(w)}</li>`).join("")}</ul>` : ""}</div>
        <div class="glass fit-box"><div class="rd-h">为这部影片找赛事 <a class="link" style="padding:0;margin-left:auto" href="#/contests?fit=1">全部 ${fit.length}${I.r}</a></div>
          ${fit.slice(0, 5).map(([c, m]) => `<div class="fit" data-open="${c.record_id}">${gB(c)}<div><b>${esc(short(c["名称"], 22))}</b><small>${daysLeft(c)} 天后截止 · ${m.score === "ok" ? "条件符合" : "有待确认项"}</small></div><span class="mt ${m.score}">${m.score === "ok" ? I.check : I.alert}</span></div>`).join("") || `<p class="muted" style="font-size:12.5px;margin:0">先填片名和时长，这里会列出条件合适的赛事。</p>`}
          <a class="btn sm" style="width:100%;justify-content:center;margin-top:10px" href="#/tracker">${I.board}这部影片的投递计划 · ${planN} 个</a></div>
      </aside>
    </div></div>`;
};
function updateFilmSide() {
  if (R.page !== "films") return; const tmp = document.createElement("div"); tmp.innerHTML = V.films();
  const ns = tmp.querySelector(".film-side"), os = $(".film-side"); if (ns && os) os.innerHTML = ns.innerHTML;
  const nt = tmp.querySelector(".sec-tabs"), ot = $(".sec-tabs"); if (nt && ot) ot.innerHTML = nt.innerHTML;
  const nf = tmp.querySelector(".film-tabs"), of = $(".film-tabs"); if (nf && of) of.innerHTML = nf.innerHTML;
  renderChrome();
}
V.films.after = () => {
  const f = FILM();
  const sv = () => { const e = $("#fsaved"); e?.classList.add("on"); clearTimeout(sv.t); sv.t = setTimeout(() => e?.classList.remove("on"), 1300); };
  const persist = debounce(() => { save(); renderChrome(); }, 400);
  $$("[data-fk]").forEach(el => el.addEventListener("input", () => { f.fields[el.dataset.fk] = el.value; const c = el.parentElement.querySelector(".cnt"); if (c) c.textContent = el.value.length + " 字"; persist(); sv(); }));
  $$("[data-ck]").forEach(el => el.addEventListener("input", () => { const i = +el.closest("[data-crew]").dataset.crew; f.crew[i][el.dataset.ck] = el.value; persist(); sv(); }));
  $$("[data-ak]").forEach(el => el.addEventListener("input", () => { const i = +el.closest("[data-award]").dataset.award; f.awards[i][el.dataset.ak] = el.value; persist(); sv(); }));
  $$("select[data-ck]").forEach(el => el.addEventListener("change", () => { const i = +el.closest("[data-crew]").dataset.crew; f.crew[i].stu = el.value; save(); sv(); }));
  $$("[data-fk]").forEach(el => el.addEventListener("input", debounce(updateFilmSide, 500)));
};
function openPaste() {
  const m = $("#modal");
  m.innerHTML = `<div class="dlg"><div class="dlg-h"><div><b>粘贴作品资料</b><small>创作阐述、项目介绍、导演简介，或以前填过的报名表都可以。能识别「字段名：内容」格式、章节标题，也能从正文里找出时长、邮箱、AI 工具、分辨率等。</small></div><button class="icon-btn" data-act="closeModal">${I.x}</button></div>
    <textarea id="pasteIn" class="note-in" style="min-height:260px" placeholder="例如：&#10;片名：一粒种子&#10;英文片名：A Seed&#10;时长：00:03:30&#10;简介：……&#10;导演阐述：……&#10;使用工具：即梦、可灵、Suno"></textarea>
    <div id="pasteOut"></div>
    <div class="dlg-f"><button class="btn" data-act="closeModal">取消</button><button class="btn" data-parse>开始识别</button><button class="btn pri" data-apply disabled>填入影片资料</button></div></div>`;
  m.classList.add("on"); setTimeout(() => $("#pasteIn").focus(), 30);
}
function showParse() {
  const r = parsePaste($("#pasteIn").value); const ks = Object.keys(r); $("#modal")._parsed = r;
  $("#pasteOut").innerHTML = ks.length ? `<div class="parsed"><div class="rd-h">识别出 ${ks.length} 项 · 勾选要填入的</div>${ks.map(k => `<label class="pr"><input type="checkbox" checked data-pk="${k}"><span class="pn">${FDEFS[k]?.n || k}</span><span class="pv">${esc(short(String(r[k]).replace(/\n/g, " "), 80))}</span>${FILM().fields[k] ? '<em>会覆盖已有内容</em>' : ""}</label>`).join("")}</div>`
    : `<div class="b-empty" style="margin-top:12px">暂时没有识别出可填写的内容。可以继续粘贴片名、简介、主创介绍、AI 工具或联系方式。</div>`;
  $("[data-apply]").disabled = !ks.length;
}
function openCard() {
  const f = FILM(), md = materialMD(f), m = $("#modal");
  m.innerHTML = `<div class="dlg wide"><div class="dlg-h"><div><b>通用投奖资料卡 ·《${esc(filmName(f))}》</b><small>适合留档、发给合作者，或作为填写不同赛事报名表时的统一底稿。可以先在这里改，再选保存格式。</small></div><button class="icon-btn" data-act="closeModal">${I.x}</button></div>
    <textarea id="cardMd" class="note-in mono-in" style="min-height:48vh">${esc(md)}</textarea>
    <div class="dlg-f"><button class="btn" data-card-copy>${I.copy}复制文字</button><button class="btn" data-card-md>${I.dl}Markdown</button><button class="btn" data-card-doc>${I.dl}Word 兼容版</button><button class="btn pri" data-card-print>${I.print}打印 / 存 PDF</button></div></div>`;
  m.classList.add("on");
}
function newFilm() { const id = uid("f"); ST.films[id] = { id, fields: {}, crew: [], awards: [], created: Date.now() }; ST.plans[id] = {}; ST.active = id; save(); toast("已新建影片，先填片名和时长"); nav("films", { sec: "basic" }); }
function addCustom() {
  const m = $("#modal");
  m.innerHTML = `<div class="dlg"><div class="dlg-h"><div><b>添加暂未收录的赛事</b><small>会加入《${esc(filmName(FILM()))}》的投递计划，只保存在你的浏览器里。</small></div><button class="icon-btn" data-act="closeModal">${I.x}</button></div>
    <div class="form" style="padding:0">${[["name", "赛事名称", "如：某某 AI 短片大赛", 1], ["deadline", "截止日期", "", 0, "date"], ["url", "官网 / 投递链接", "https://…"], ["prize", "最高奖励", "如：一等奖 1 万元"], ["fee", "报名费", "如：免费"], ["region", "地区", "如：中国·线上"]].map(([k, n, ph, w, t]) => `<label class="fl ${w ? "wide" : ""}"><span>${n}</span><input data-cu="${k}" type="${t || "text"}" placeholder="${ph}"></label>`).join("")}</div>
    <div class="dlg-f"><button class="btn" data-act="closeModal">取消</button><button class="btn pri" data-save-custom>加入投递计划</button></div></div>`;
  m.classList.add("on"); setTimeout(() => $('[data-cu="name"]').focus(), 30);
}

/* ═════════ 增强：待办 / 清单 / 对比 / 洞察 / 引导 / 动效 ═════════ */
const RC = new Map(); const rulesC = c => { if (!RC.has(c.record_id)) RC.set(c.record_id, rulesOf(c)); return RC.get(c.record_id); };
const MM = new Map();
function checklist(c, f = FILM()) {
  const r = rulesC(c), ff = f.fields, intl = !isCN(c), m = (PL()[c.record_id] || {}), ck = m.ck || {};
  const it = [["film", "最终版成片（带密码的观看链接）", filled(f, "filmLink")], ["poster", "海报", ff.poster === "已准备"], ["synZh", "中文简介", filled(f, "synZh")], ["statement", "导演阐述", filled(f, "statement")], ["ai", "AI 使用说明 / 制作流程", filled(f, "aiFlow")], ["copy", "版权与素材来源说明", filled(f, "copyright")]];
  if (r.subEn || intl) it.push(["subEn", "英文字幕 SRT", ff.subEn === "已准备"], ["synEn", "英文简介 Synopsis", filled(f, "synEn")]);
  if (intl) it.push(["bioEn", "导演英文简介", filled(f, "bioEn")]);
  if (r.max || r.min) it.push(["dur", `片长符合要求（${r.min ? fmtDur(r.min) + "–" : "≤ "}${fmtDur(r.max)}）`, (() => { const d = durSec(ff.duration); return d != null && (!r.max || d <= r.max) && (!r.min || d >= r.min); })()]);
  if (r.premiere) it.push(["prem", "确认首映状态符合规则", ff.premiere === "未公开放映"]);
  if (r.topic) it.push(["topic", "内容贴合命题方向", false]);
  if (r.region || r.org || r.student) it.push(["elig", "确认报名资格（地区 / 机构 / 学生）", false]);
  if (!isFree(c)) it.push(["fee", "支付报名费并保存回执", !!(m.d && m.d.conf)]);
  it.push(["form", "在官网填写并提交报名表", ["submitted", "result"].includes(m.status)]);
  return it.map(([k, n, auto]) => ({ k, n, auto: !!auto, done: !!auto || !!ck[k] }));
}
function todos() {
  const out = [], f = FILM(), pl = PL();
  const mine = Object.entries(pl).filter(([id, m]) => byId.has(id) && ["want", "making"].includes(m.status)).map(([id]) => byId.get(id)).filter(isOpen).sort(byDl);
  for (const c of mine) { const l = daysLeft(c); if (l === null || l > 10) continue; const cl = checklist(c); const left = cl.filter(x => !x.done).length;
    out.push({ lv: l <= 3 ? "red" : "amber", ic: "flame", t: `${esc(short(c["名称"], 20))} ${l === 0 ? "今天" : l + " 天后"}截止`, s: left ? `投递清单还差 ${left} 项` : "清单已齐，可以去提交了", open: c.record_id }); }
  for (const [id, m] of Object.entries(pl)) { const c = byId.get(id); if (!c || m.status !== "submitted" || m.outcome && m.outcome !== "审核中") continue; const rd = parseD(m.d?.resDate); if (rd && rd <= T0) out.push({ lv: "acc", ic: "trophy", t: `${esc(short(c["名称"], 20))} 结果应该公布了`, s: "去官网看看，然后记录入围 / 获奖", open: id }); }
  const rd = readiness(f); if (rd.pct < 70) out.push({ lv: "acc", ic: "film", t: `把《${esc(short(filmName(f), 10))}》资料补到 70%`, s: `现在 ${rd.pct}%，先补：${rd.gaps.slice(0, 2).join("、") || "核心项"}`, href: "#/films" });
  if (!mine.length) { const sg = live().filter(c => G[gr(c)] <= 1 && daysLeft(c) !== null && daysLeft(c) >= 5 && matchFilm(c).score !== "bad" && !pl[c.record_id]).sort(byDl)[0]; if (sg) out.push({ lv: "green", ic: "spark", t: `试试加入「${esc(short(sg["名称"], 18))}」`, s: `${gr(sg)} 级 · ${daysLeft(sg)} 天后截止 · ${isFree(sg) ? "免费报名" : esc(short(feeTxt(sg), 14))}`, open: sg.record_id, quick: sg.record_id }); }
  const w = live().filter(c => daysLeft(c) !== null && daysLeft(c) <= 1 && G[gr(c)] <= 1 && !pl[c.record_id]); if (w.length) out.push({ lv: "red", ic: "clock", t: `${w.length} 个 S/A 级赛事明天前截止`, s: w.slice(0, 2).map(c => esc(short(c["名称"], 12))).join("、"), href: "#/contests?when=3&grade=SA" });
  return out.slice(0, 6);
}
function todoSection() {
  const td = todos(); if (!td.length) return "";
  return `<section class="sec">${secH("check", `今日待办 <span class="tag new">${td.length}</span>`, "根据你的投递计划、影片资料和截止时间自动生成")}<div class="todo-grid">${td.map(x => `<${x.href ? `a href="${x.href}"` : `div data-open="${x.open}"`} class="todo glass lv-${x.lv}"><span class="ti">${I[x.ic]}</span><div><b>${x.t}</b><small>${x.s}</small></div>${x.quick ? `<button class="add sg-add" data-quick="${x.quick}">${I.plus}加入</button>` : `<span class="ar">${I.r}</span>`}</${x.href ? "a" : "div"}>`).join("")}</div></section>`;
}
/* 对比 */
ST.prefs.cmp = (ST.prefs.cmp || []).filter(id => byId.has(id));
const cmpBtn = c => `<button class="cmp-b ${ST.prefs.cmp.includes(c.record_id) ? "on" : ""}" data-cmp="${c.record_id}" title="加入对比（最多 3 个）">${I.grid}</button>`;
function renderTray() {
  let t = $("#tray"); if (!t) { t = document.createElement("div"); t.id = "tray"; t.className = "tray"; document.body.append(t); }
  const ids = ST.prefs.cmp; t.classList.toggle("on", ids.length > 0);
  t.innerHTML = ids.length ? `<span class="tr-l">对比</span>${ids.map(id => { const c = byId.get(id); return `<span class="tr-c">${gB(c)}<b>${esc(short(c["名称"], 10))}</b><button data-cmp="${id}" aria-label="移除">${I.x}</button></span>`; }).join("")}${ids.length < 3 ? `<span class="tr-e">还可以加 ${3 - ids.length} 个</span>` : ""}<button class="btn pri sm" data-cmp-open ${ids.length < 2 ? "disabled" : ""}>开始对比</button><button class="icon-btn" data-cmp-clear title="清空">${I.x}</button>` : "";
}
function openCompare() {
  const cs = ST.prefs.cmp.map(id => byId.get(id)); if (cs.length < 2) return;
  const best = (fn, hi = true) => { const v = cs.map(fn); const t = hi ? Math.max(...v) : Math.min(...v); return v.map(x => x === t && v.filter(y => y === t).length < v.length); };
  const dls = cs.map(c => daysLeft(c) ?? 9999), cash = cs.map(cashCNY), gs = cs.map(c => G[gr(c)]);
  const bDl = best(c => daysLeft(c) ?? -1), bCash = best(cashCNY), bG = best(c => -G[gr(c)]), bFree = cs.map(isFree);
  const rows = [
    ["分级", cs.map((c, i) => `${gB(c)} <span class="muted">${GN[gr(c)]}</span>`), bG],
    ["截止", cs.map(c => `<b>${fmtFull(c["截止日期"])}</b>`), null],
    ["剩余时间", cs.map(c => { const l = daysLeft(c); return l === null ? "待定" : l < 0 ? "已截止" : `<b class="num">${l}</b> 天`; }), bDl],
    ["最高奖励", cs.map(c => esc(c["最高奖金"] || "—")), null],
    ["折合人民币", cs.map(c => cashCNY(c) > 1 ? `<b>${fmtCNY(cashCNY(c))}</b>` : `<span class="muted">无现金</span>`), bCash],
    ["报名费", cs.map(c => esc(feeTxt(c) || "—")), bFree],
    ["命题", cs.map(c => esc(c["命题"] || "—")), null], ["地区", cs.map(c => esc(c["地区"] || "—")), null], ["类别", cs.map(c => esc(c["类别"] || "—")), null],
    ["与当前影片", cs.map(c => { const m = matchFilm(c); return m.hasFilm ? `<span class="mt-line ${m.score}">${m.score === "ok" ? I.check : I.alert}<span>${m.score === "ok" ? "符合" : m.score === "warn" ? "需确认" : "不符合"}</span></span>` : '<span class="muted">未填影片</span>'; }), cs.map(c => matchFilm(c).score === "ok")],
    ["核实状态", cs.map(c => vf(c) ? `<span class="tag ${vf(c).level === "warn" ? "warn" : "ok"}">${vf(c).level === "warn" ? "待确认" : "已核实"}</span>` : '<span class="muted">未核实</span>'), null],
  ];
  const m = $("#modal");
  m.innerHTML = `<div class="dlg wide cmp-dlg"><div class="dlg-h"><div><b>赛事对比</b><small>高亮的格子是这一项里表现最好的。</small></div><button class="icon-btn" data-act="closeModal">${I.x}</button></div>
    <div class="cmp-wrap"><table class="cmp"><thead><tr><th></th>${cs.map(c => `<th><div class="cmp-h pb-${gr(c)}"><span class="glyph">${esc(glyph(c))}</span><b>${esc(c["名称"])}</b></div></th>`).join("")}</tr></thead>
    <tbody>${rows.map(([n, v, b]) => `<tr><td class="cmp-n">${n}</td>${v.map((x, i) => `<td class="${b && b[i] ? "best" : ""}">${x}</td>`).join("")}</tr>`).join("")}
    <tr><td></td>${cs.map(c => `<td><div class="btns" style="flex-direction:column">${isMine(c.record_id) ? `<span class="tag st-${status(c.record_id)}" style="align-self:flex-start">${SN[status(c.record_id)]}</span>` : `<button class="btn sm pri" data-quick="${c.record_id}">${I.plus}加入计划</button>`}<button class="btn sm" data-open="${c.record_id}">查看详情</button></div></td>`).join("")}</tr></tbody></table></div></div>`;
  m.classList.add("on");
}
/* 洞察 */
V.insights = () => {
  const L = live(); const months = Array.from({ length: 8 }, (_, i) => { const d = new Date(T0.getFullYear(), T0.getMonth() + i, 1); return { d, k: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`, n: `${d.getMonth() + 1}月` }; });
  const mc = months.map(m => ["S", "A", "B", "C"].map(g => L.filter(c => (c["截止日期"] || "").startsWith(m.k) && gr(c) === g).length));
  const mx = Math.max(1, ...mc.map(a => a.reduce((x, y) => x + y, 0)));
  const bars = months.map((m, i) => { let y = 0; const tot = mc[i].reduce((a, b) => a + b, 0); return `<div class="vb" title="${m.n} ${tot} 个"><div class="vb-s">${["S", "A", "B", "C"].map((g, j) => mc[i][j] ? `<i class="i-${g}" style="height:${mc[i][j] / mx * 100}%"></i>` : "").join("")}</div><b class="num">${tot}</b><span>${m.n}</span></div>`; }).join("");
  const gc = ["S", "A", "B", "C"].map(g => [g, L.filter(c => gr(c) === g).length]); const tot = L.length || 1;
  let acc = 0; const CLR = { S: "#f0443a", A: "#f59e0b", B: "#6d5efc", C: "#8b91a5" }; const R0 = 54, CC = 2 * Math.PI * R0;
  const donut = `<svg viewBox="0 0 140 140" class="donut">${gc.map(([g, n]) => { const s = `<circle cx="70" cy="70" r="${R0}" fill="none" stroke="${CLR[g]}" stroke-width="18" stroke-dasharray="${n / tot * CC} ${CC}" stroke-dashoffset="${-acc / tot * CC}" transform="rotate(-90 70 70)"/>`; acc += n; return s; }).join("")}<text x="70" y="66" text-anchor="middle" font-size="28" font-weight="800" fill="var(--ink)">${L.length}</text><text x="70" y="88" text-anchor="middle" font-size="11" fill="var(--ink-4)">在征赛事</text></svg>`;
  const split = (a, b, na, nb, ca, cb) => { const t = a + b || 1; return `<div class="split"><div class="sp-bar"><i style="flex:${a};background:${ca}"></i><i style="flex:${b};background:${cb}"></i></div><div class="sp-l"><span><i style="background:${ca}"></i>${na} <b class="num">${a}</b> · ${Math.round(a / t * 100)}%</span><span><i style="background:${cb}"></i>${nb} <b class="num">${b}</b></span></div></div>`; };
  const free = L.filter(isFree).length, cn = L.filter(isCN).length, topic = L.filter(c => c["命题"] === "命题").length, cash = L.filter(hasCash).length;
  const top = L.filter(c => cashCNY(c) > 1).sort((a, b) => cashCNY(b) - cashCNY(a)).slice(0, 8); const tmx = cashCNY(top[0] || {}) || 1;
  const forms = FORMS.map(([n]) => [n, L.filter(c => formsOf(c).includes(n)).length]).sort((a, b) => b[1] - a[1]); const fmx = Math.max(1, ...forms.map(x => x[1]));
  const allPl = Object.values(ST.plans).flatMap(p => Object.values(p)).filter(m => m.status && m.status !== "skip");
  const fees = Object.values(ST.plans).flatMap(p => Object.values(p)).map(m => parseFloat(m.d?.fee)).filter(x => x > 0);
  return `<div class="page-in"><div><span class="eyebrow">数据洞察</span><h1 class="h1">AI 影像赛事全景</h1><p class="lede">在征赛事的截止节奏、含金量结构、门槛与奖金分布，以及你自己的投递战绩。</p></div>
  <div class="ins-grid">
    <div class="glass ins wide2"><div class="ins-h"><h3>未来 8 个月截止分布</h3><div class="legend"><span><i class="i-S"></i>S</span><span><i class="i-A"></i>A</span><span><i class="i-B"></i>B</span><span><i class="i-C"></i>C</span></div></div><div class="vbars">${bars}</div></div>
    <div class="glass ins"><div class="ins-h"><h3>分级构成</h3></div><div class="donut-w">${donut}<ul class="dl-leg">${gc.map(([g, n]) => `<li><i style="background:${CLR[g]}"></i>${g} 级 · ${GN[g]}<b class="num">${n}</b></li>`).join("")}</ul></div></div>
    <div class="glass ins"><div class="ins-h"><h3>门槛结构</h3></div>${split(free, L.length - free, "免费", "收费", "#10b981", "var(--line-2)")}${split(cash, L.length - cash, "有现金奖", "荣誉/资源", "#f0443a", "var(--line-2)")}${split(L.length - topic, topic, "自由投稿", "命题", "#6d5efc", "#f59e0b")}${split(cn, L.length - cn, "国内", "海外/线上", "#22c3e6", "#8b7cff")}</div>
    <div class="glass ins"><div class="ins-h"><h3>作品形态</h3></div><div class="hbars">${forms.map(([n, v]) => `<a href="#/contests?form=${encodeURIComponent(n)}"><span>${n}</span><i><i style="width:${v / fmx * 100}%"></i></i><b class="num">${v}</b></a>`).join("")}</div></div>
    <div class="glass ins wide2"><div class="ins-h"><h3>现金奖金排行</h3><span class="muted" style="font-size:12px">按大致汇率折合人民币</span></div><div class="hbars prize">${top.map(c => `<a data-open="${c.record_id}">${gB(c)}<span>${esc(short(c["名称"], 22))}</span><i><i style="width:${cashCNY(c) / tmx * 100}%"></i></i><b>${fmtCNY(cashCNY(c))}</b></a>`).join("")}</div></div>
    <div class="glass ins"><div class="ins-h"><h3>我的投递战绩</h3><span class="muted" style="font-size:12px">全部影片</span></div>
      <div class="my-stats">${[["影片", Object.keys(ST.films).length], ["计划", allPl.length], ["已提交", allPl.filter(m => ["submitted", "result"].includes(m.status)).length], ["入围", allPl.filter(m => m.outcome === "入围").length], ["获奖", allPl.filter(m => m.outcome === "获奖").length], ["报名费合计", fees.length ? Math.round(fees.reduce((a, b) => a + b, 0)) : 0]].map(([n, v]) => `<div><b class="num">${v}</b><span>${n}</span></div>`).join("")}</div>
      ${allPl.length ? "" : `<p class="muted" style="font-size:12.5px;margin:12px 0 0">还没有投递记录。<a class="btn-txt" href="#/contests">去挑赛事</a></p>`}</div>
  </div></div>`;
};
/* 引导 / 帮助 */
function openOnboard() {
  const m = $("#modal"); let i = 0;
  const S = [["radar", "所有 AI 影像赛事，一处看全", `收录 ${C.length} 个赛事和 ${F.length} 个知名电影节，按截止时间倒排，分成 S / A / B / C 四档，官网逐条核对过。`], ["film", "先建一部影片", "把片名、时长、简介、字幕、AI 使用说明填好，或者直接粘贴以前的申报材料，系统会自动识别。"], ["check", "自动判断能不能投", "每个赛事都会对照你影片的时长、学生身份、字幕、首映等条件，给出「符合 / 需要确认 / 不符合」。"], ["board", "一路跟进到拿奖", "加入投递计划后，有截止提醒、投递清单、确认编号和结果记录，还能导出资料卡和投奖档案。"]];
  const draw = () => { m.innerHTML = `<div class="dlg onb"><div class="onb-art"><span class="reel"></span><span class="onb-ic">${I[S[i][0]]}</span></div><div class="onb-b"><span class="eyebrow">第 ${i + 1} / ${S.length} 步</span><h2>${S[i][1]}</h2><p>${S[i][2]}</p><div class="onb-dots">${S.map((_, j) => `<i class="${j === i ? "on" : ""}"></i>`).join("")}</div></div><div class="dlg-f"><button class="btn" data-onb="skip">跳过</button>${i ? `<button class="btn" data-onb="prev">上一步</button>` : ""}${i < S.length - 1 ? `<button class="btn pri" data-onb="next">下一步</button>` : `<button class="btn" data-onb="browse">先逛逛</button><button class="btn pri" data-onb="film">${I.film}添加我的影片</button>`}</div></div>`; };
  m._onb = d => { if (d === "next") i++; else if (d === "prev") i--; else { ST.onboarded = 1; save(); m.classList.remove("on"); if (d === "film") nav("films"); return; } draw(); };
  draw(); m.classList.add("on");
}
function openHelp() {
  const m = $("#modal"); m.innerHTML = `<div class="dlg"><div class="dlg-h"><div><b>键盘快捷键</b><small>在任何页面都能用</small></div><button class="icon-btn" data-act="closeModal">${I.x}</button></div><div class="kbd-list">${[["全局搜索", "<kbd>/</kbd> 或 <kbd>⌘</kbd><kbd>K</kbd>"], ["列表上下移动", "<kbd>J</kbd> <kbd>K</kbd>"], ["打开选中赛事", "<kbd>Enter</kbd>"], ["加入 / 移出计划", "<kbd>S</kbd>"], ["加入对比", "<kbd>C</kbd>"], ["详情里上 / 下一个", "<kbd>←</kbd> <kbd>→</kbd>"], ["跳到首页 / 赛事 / 影片", "<kbd>G</kbd> 然后 <kbd>H</kbd> / <kbd>C</kbd> / <kbd>F</kbd>"], ["关闭弹窗", "<kbd>Esc</kbd>"], ["显示本帮助", "<kbd>?</kbd>"]].map(([a, b]) => `<div class="glass"><span>${a}</span><span>${b}</span></div>`).join("")}</div></div>`; m.classList.add("on");
}
/* 动效 */
function countUp(root = document) {
  $$(".kpi b.num, .mh-stats b.num, .fn b.num, .my-stats b.num", root).forEach(el => { const t = el.firstChild; if (!t || t.nodeType !== 3) return; const to = parseInt(t.textContent, 10); if (!(to > 1) || matchMedia("(prefers-reduced-motion: reduce)").matches) return; const t0 = performance.now(), dur = 700; const step = n => { const p = Math.min(1, (n - t0) / dur); t.textContent = Math.round(to * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(step); }; t.textContent = "0"; requestAnimationFrame(step); });
}
document.addEventListener("pointermove", e => { const el = e.target.closest?.(".card,.tile,.todo,.fest,.ftab"); if (!el) return; const r = el.getBoundingClientRect(); el.style.setProperty("--mx", `${e.clientX - r.left}px`); el.style.setProperty("--my", `${e.clientY - r.top}px`); }, { passive: true });
function notifyDue() {
  try { if (!("Notification" in window) || Notification.permission !== "granted" || ST.notified === ymd(T0)) return;
    const due = Object.values(ST.films).flatMap(f => Object.entries(ST.plans[f.id] || {}).filter(([id, m]) => ["want", "making"].includes(m.status) && byId.has(id)).map(([id]) => byId.get(id))).filter(c => { const l = daysLeft(c); return l !== null && l >= 0 && l <= 3; });
    if (due.length) new Notification("AI赛事助手 · 截止提醒", { body: due.slice(0, 3).map(c => `${c["名称"]}：${daysLeft(c) === 0 ? "今天" : daysLeft(c) + " 天后"}截止`).join("\n"), tag: "due-" + ymd(T0) });
    ST.notified = ymd(T0); save(); } catch {}
}

/* ── brief ── */
function briefData() {
  const L = live(); const rng = (a, b) => L.filter(c => { const l = daysLeft(c); return l !== null && l >= a && l <= b && status(c.record_id) !== "skip"; }).sort((x, y) => byDl(x, y) || G[gr(x)] - G[gr(y)]);
  const t01 = rng(0, 1), t23 = rng(2, 3), wk = rng(4, 7), mo = rng(8, 30).filter(c => G[gr(c)] <= 1);
  const fc = L.filter(c => isFree(c) && hasCash(c) && (daysLeft(c) ?? 99) > 7 && (daysLeft(c) ?? 0) <= 60).sort((a, b) => cashCNY(b) - cashCNY(a)).slice(0, 6);
  const lead = [...t01, ...t23, ...wk].filter(c => status(c.record_id) !== "submitted").sort((a, b) => G[gr(a)] - G[gr(b)] || byDl(a, b))[0] || mo[0] || L.sort(byDl)[0];
  return { L, t01, t23, wk, mo, fc, lead };
}
V.brief = () => {
  const b = briefData(), d = T0, lead = b.lead;
  const mineDue = [...b.t01, ...b.t23, ...b.wk].filter(c => ["want", "making"].includes(status(c.record_id)));
  const hdrCol = { S: "linear-gradient(135deg,#ff6b4a,#f0443a)", A: "linear-gradient(135deg,#fbbf24,#f59e0b)", B: "linear-gradient(135deg,#8b7cff,#6d5efc)", C: "linear-gradient(135deg,#9aa1b4,#6b7285)" };
  const item = c => { const x = parseD(c["截止日期"]); return `<div class="bi" data-open="${c.record_id}"><div class="cal-ic"><small style="background:${hdrCol[gr(c)]}">${x ? x.getMonth() + 1 + "月" : "待定"}</small><b class="num">${x ? x.getDate() : "?"}</b></div><div style="min-width:0"><div class="bt">${esc(c["名称"])}</div><div class="bs">${gB(c)}${tags(c, { max: 2 })}<span>${esc(short(c["最高奖金"], 24))}</span></div></div></div>`; };
  const sec = (no, icon, t, a, e) => `<section class="b-sec"><div class="b-sec-h"><span class="no">${no}</span><h3>${I[icon]}${t}</h3><span class="line"></span><span class="n">${a.length} 个</span></div>${a.length ? `<div class="b-items">${a.map(item).join("")}</div>` : `<div class="b-empty">${e}</div>`}</section>`;
  const leadWhy = lead ? [`${gr(lead)} 级（${GN[gr(lead)]}）`, isFree(lead) ? "免费报名" : `报名费 ${short(feeTxt(lead), 20)}`, lead["命题"] === "命题" ? "有命题" : "自由投稿", cashCNY(lead) > 1 ? `最高 ${fmtCNY(cashCNY(lead))}` : ""].filter(Boolean).join("，") : "";
  return `<div class="page-in brief-wrap">
    <div class="brief-tools"><div class="bt-l">${I.doc}<span>可以复制成文字发群、导出 PDF，或者生成一张分享海报</span></div><div class="btns"><button class="btn" data-copy-brief="text">${I.copy}复制文字版</button><button class="btn" data-copy-brief="md">${I.copy}Markdown</button><button class="btn" onclick="print()">${I.print}打印 / PDF</button><button class="btn pri" data-poster>${I.image}生成分享海报</button></div></div>
    <article class="paper" id="paper">
      <header class="masthead">
        <div class="mh-top"><span>AI 赛事日报 · DAILY BRIEF</span><span>NO.${String(Math.floor((T0 - new Date(T0.getFullYear(), 0, 0)) / 864e5)).padStart(3, "0")}</span></div>
        <div class="mh-title"><div class="mh-date"><small>${d.getFullYear()} · 周${WD[d.getDay()]}</small>${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}</div>
          <div class="mh-h"><h1>${b.t01.length + b.t23.length ? `${b.t01.length + b.t23.length} 个赛事 3 天内截止` : "近 3 天没有截止，适合安心做片"}</h1>
          <p>${mineDue.length ? `你标记的有 ${mineDue.length} 个本周截止：${mineDue.slice(0, 2).map(c => esc(short(c["名称"], 16))).join("、")}。` : ""}一周内共 ${b.t01.length + b.t23.length + b.wk.length} 个截止，30 天内还有 ${b.mo.length} 个 S/A 级赛事。</p></div></div>
        <div class="mh-stats"><div><b class="num">${b.L.length}</b><span>在征赛事</span></div><div><b class="num">${b.t01.length + b.t23.length}</b><span>3 天内截止</span></div><div><b class="num">${b.L.filter(c => G[gr(c)] <= 1).length}</b><span>S / A 级</span></div><div><b class="num">${b.L.filter(isFree).length}</b><span>免费报名</span></div></div>
      </header>
      <div class="paper-body">
        ${lead ? `<section class="lead-story"><div><div class="ls-k">${I.flame}今日头条</div><h2 data-open="${lead.record_id}">${esc(lead["名称"])}</h2><p>${fmtFull(lead["截止日期"])}截止。${esc(leadWhy)}。${esc(short((lead["赛事说明"] || "").split(/\n/)[0], 90))}</p>
          <div class="btns" style="margin-top:14px">${lead["投递链接"] || lead["官网"] ? `<a class="btn pri sm" href="${esc(lead["投递链接"] || lead["官网"])}" target="_blank" rel="noopener">去投递${I.ext}</a>` : ""}<button class="btn sm" data-open="${lead.record_id}">查看详情</button></div></div>
          <div class="ls-card" data-open="${lead.record_id}"><div class="poster pb-${gr(lead)}"><span class="glyph">${esc(glyph(lead))}</span><div class="p-top">${gB(lead)}${isFree(lead) ? '<span class="tag">免费</span>' : ""}</div><div class="p-dl">${daysLeft(lead) === 0 ? "<b>今天</b><small>截止</small>" : `<b class="num">${daysLeft(lead) ?? "?"}</b><small>天后截止</small>`}</div></div></div></section>` : ""}
        ${sec("01", "clock", "今天 / 明天截止", b.t01, "今明两天没有截止的赛事")}
        ${sec("02", "flame", "2–3 天内截止", b.t23, "这个区间没有截止的赛事")}
        ${sec("03", "cal", "本周截止（4–7 天）", b.wk, "本周剩下的日子没有截止")}
        ${sec("04", "trophy", "30 天内的 S / A 级", b.mo, "30 天内没有 S/A 级截止")}
        ${sec("05", "gift", "免费 + 现金奖 · 时间还充裕", b.fc, "暂时没有符合条件的赛事")}
      </div>
      <footer class="paper-foot"><span>AI赛事助手 · 数据快照 ${esc(D.contests.snapshot_date || "")}</span><span>剩余天数按本机日期计算；截止时间以主办方官网公布的时区为准</span></footer>
    </article></div>`;
};
function briefText(md) {
  const b = briefData(), d = T0;
  const line = c => md ? `- **${c["名称"]}**（${gr(c)} 级）— ${fmtMD(c["截止日期"])}截止；${c["最高奖金"]}；报名 ${feeTxt(c)}${/^https?:/.test(c["投递链接"] || c["官网"] || "") ? `；[投递](${c["投递链接"] || c["官网"]})` : ""}` : `· ${c["名称"]}【${gr(c)}】${fmtMD(c["截止日期"])}截止｜${short(c["最高奖金"], 40)}｜报名${short(feeTxt(c), 16)}`;
  const sec = (t, a) => a.length ? `\n${md ? "## " : "【"}${t}${md ? "" : "】"}\n${a.map(line).join("\n")}\n` : "";
  return `${md ? "# " : ""}AI 赛事日报 ${d.getFullYear()}.${d.getMonth() + 1}.${d.getDate()}\n在征 ${b.L.length} 个 · 3 天内截止 ${b.t01.length + b.t23.length} 个 · 一周内 ${b.t01.length + b.t23.length + b.wk.length} 个\n` + sec("今天/明天截止", b.t01) + sec("2–3 天内截止", b.t23) + sec("本周截止", b.wk) + sec("30 天内 S/A 级", b.mo) + sec("免费+现金奖", b.fc) + `\n—— AI赛事助手 · 截止以官网为准`;
}
function posterPNG() {
  const b = briefData(), W = 1080, H = 1440, cv = document.createElement("canvas"); cv.width = W; cv.height = H; const x = cv.getContext("2d");
  const F = "'PingFang SC','HarmonyOS Sans SC','Microsoft YaHei',system-ui,sans-serif";
  x.fillStyle = "#0b0c16"; x.fillRect(0, 0, W, H);
  const rg = (cx, cy, r, col) => { const g = x.createRadialGradient(cx, cy, 0, cx, cy, r); g.addColorStop(0, col); g.addColorStop(1, "rgba(0,0,0,0)"); x.fillStyle = g; x.fillRect(0, 0, W, H); };
  rg(W, 0, 900, "rgba(109,94,252,.75)"); rg(0, H * .55, 800, "rgba(34,195,230,.35)"); rg(W * .7, H, 700, "rgba(255,107,74,.35)");
  x.strokeStyle = "rgba(255,255,255,.05)"; x.lineWidth = 1; for (let i = 0; i < W; i += 48) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i, H); x.stroke(); } for (let i = 0; i < H; i += 48) { x.beginPath(); x.moveTo(0, i); x.lineTo(W, i); x.stroke(); }
  x.fillStyle = "rgba(255,255,255,.7)"; x.font = `700 26px ${F}`; x.fillText("AI 赛事日报 · DAILY BRIEF", 72, 100);
  x.textAlign = "right"; x.fillText(`${T0.getFullYear()} · 周${WD[T0.getDay()]}`, W - 72, 100); x.textAlign = "left";
  x.fillStyle = "rgba(255,255,255,.18)"; x.fillRect(72, 128, W - 144, 2);
  x.fillStyle = "#fff"; x.font = `800 210px ${F}`; x.fillText(`${String(T0.getMonth() + 1).padStart(2, "0")}.${String(T0.getDate()).padStart(2, "0")}`, 60, 330);
  x.font = `800 54px ${F}`; x.fillText(b.t01.length + b.t23.length ? `${b.t01.length + b.t23.length} 个赛事 3 天内截止` : "近 3 天没有截止", 72, 430);
  const stats = [[b.L.length, "在征赛事"], [b.t01.length + b.t23.length + b.wk.length, "一周内截止"], [b.L.filter(c => G[gr(c)] <= 1).length, "S / A 级"], [b.L.filter(isFree).length, "免费报名"]];
  stats.forEach(([n, t], i) => { const bx = 72 + i * 240; x.fillStyle = "rgba(255,255,255,.08)"; rr(x, bx, 480, 222, 130, 22); x.fill(); x.fillStyle = "#fff"; x.font = `800 58px ${F}`; x.fillText(n, bx + 24, 555); x.fillStyle = "rgba(255,255,255,.65)"; x.font = `500 24px ${F}`; x.fillText(t, bx + 24, 590); });
  const list = [...b.t01, ...b.t23, ...b.wk, ...b.mo].slice(0, 7);
  x.fillStyle = "rgba(255,255,255,.75)"; x.font = `700 26px ${F}`; x.fillText("近期截止", 72, 680);
  const gcol = { S: ["#ff6b4a", "#f0443a"], A: ["#fbbf24", "#f59e0b"], B: ["#8b7cff", "#6d5efc"], C: ["#9aa1b4", "#6b7285"] };
  list.forEach((c, i) => { const y = 710 + i * 92, l = daysLeft(c); x.fillStyle = "rgba(255,255,255,.06)"; rr(x, 72, y, W - 144, 78, 18); x.fill();
    const g = x.createLinearGradient(92, y, 140, y + 50); g.addColorStop(0, gcol[gr(c)][0]); g.addColorStop(1, gcol[gr(c)][1]); x.fillStyle = g; rr(x, 92, y + 17, 44, 44, 11); x.fill();
    x.fillStyle = "#fff"; x.font = `800 24px ${F}`; x.textAlign = "center"; x.fillText(gr(c), 114, y + 48); x.textAlign = "left";
    x.font = `650 30px ${F}`; let t = c["名称"]; while (x.measureText(t).width > 680 && t.length > 4) t = t.slice(0, -2); if (t !== c["名称"]) t += "…"; x.fillText(t, 158, y + 50);
    x.textAlign = "right"; x.fillStyle = l <= 3 ? "#ff8a70" : l <= 7 ? "#fcd34d" : "#c4bfff"; x.font = `800 32px ${F}`; x.fillText(l === 0 ? "今天" : `${l}天`, W - 96, y + 51); x.textAlign = "left"; });
  x.fillStyle = "rgba(255,255,255,.18)"; x.fillRect(72, H - 130, W - 144, 2);
  const lg = x.createLinearGradient(72, H - 100, 124, H - 48); lg.addColorStop(0, "#6d5efc"); lg.addColorStop(1, "#22c3e6"); x.fillStyle = lg; rr(x, 72, H - 100, 52, 52, 14); x.fill();
  x.fillStyle = "#fff"; x.beginPath(); x.moveTo(91, H - 86); x.lineTo(91, H - 62); x.lineTo(111, H - 74); x.closePath(); x.fill();
  x.font = `800 32px ${F}`; x.fillText("AI赛事助手", 142, H - 64); x.fillStyle = "rgba(255,255,255,.55)"; x.font = `500 22px ${F}`; x.fillText("截止雷达 · 分级精选 · 投递看板", 142, H - 34);
  x.textAlign = "right"; x.fillText("截止时间以主办方官网为准", W - 72, H - 50);
  return cv;
}
function rr(x, a, b, w, h, r) { x.beginPath(); x.moveTo(a + r, b); x.arcTo(a + w, b, a + w, b + h, r); x.arcTo(a + w, b + h, a, b + h, r); x.arcTo(a, b + h, a, b, r); x.arcTo(a, b, a + w, b, r); x.closePath(); }
function openPoster() {
  let cv; try { cv = posterPNG(); } catch (e) { toast("当前浏览器不支持生成海报"); return; }
  const m = $("#modal"); m.innerHTML = `<div class="share-box"></div>`; $(".share-box", m).append(cv);
  $(".share-box", m).insertAdjacentHTML("beforeend", `<div class="btns"><button class="btn" data-act="closeModal">关闭</button><button class="btn pri" data-save-poster>${I.dl}保存图片</button></div>`);
  m.classList.add("on"); m._cv = cv;
}

/* ── festivals ── */
const MONTHS = t => { const s = new Set(); String(t || "").replace(/(\d{1,2})\s*月/g, (_, n) => s.add(+n)); const rng = String(t || "").match(/(\d{1,2})\s*[月]?\s*[-–~至]\s*(\d{1,2})\s*月/); if (rng) for (let i = +rng[1]; i <= +rng[2]; i++) s.add(i); return s; };
V.festivals = () => {
  const cat = R.params.cat || ""; const cats = [...new Set(F.map(f => f["类别"]).filter(Boolean))];
  const list = F.filter(f => !cat || f["类别"] === cat);
  const cols = ["linear-gradient(135deg,#ff6b4a,#f0443a)", "linear-gradient(135deg,#8b7cff,#6d5efc)", "linear-gradient(135deg,#22c3e6,#2f7fe0)", "linear-gradient(135deg,#fbbf24,#f59e0b)", "linear-gradient(135deg,#34d399,#0f9f76)"];
  return `<div class="page-in"><div><span class="eyebrow">资料库</span><h1 class="h1">全球知名电影节</h1><p class="lede">FIAPF 认证等传统电影节。想让 AI 作品走长片或短片节路线时，用来规划全年档期。下方色条表示举办月份。</p></div>
  <div class="chips" style="margin-bottom:16px"><button class="chip ${!cat ? "on" : ""}" data-fcat="">全部<span class="n">${F.length}</span></button>${cats.map(c => `<button class="chip ${cat === c ? "on" : ""}" data-fcat="${esc(c)}">${esc(c)}<span class="n">${F.filter(f => f["类别"] === c).length}</span></button>`).join("")}</div>
  <div class="fest-grid">${list.map((f, i) => { const ms = MONTHS(f["每年举办时间"]); return `<article class="fest glass"><div class="fest-h"><span class="fest-ic" style="background:${cols[i % cols.length]}">${esc(String(f["电影节"] || "?").replace(/^[^A-Za-z\u4e00-\u9fa5]+/, "").slice(0, 1))}</span><div><h3>${esc(f["电影节"])}</h3><div class="loc">${esc(f["国家/城市"])} · <span class="tag" style="height:18px;font-size:10.5px">${esc(f["类别"])}</span></div></div></div>
    <div><div class="month-bar">${Array.from({ length: 12 }, (_, m) => `<i class="${ms.has(m + 1) ? "on" : ""}" title="${m + 1}月"></i>`).join("")}</div><div class="muted" style="font-size:10.5px;display:flex;justify-content:space-between;margin-top:3px"><span>1月</span><span>6月</span><span>12月</span></div></div>
    <dl><dt>举办</dt><dd>${esc(f["每年举办时间"] || "—")}</dd><dt>最高奖</dt><dd>${esc(f["最高奖"] || "—")}</dd><dt>最新档期</dt><dd>${esc(f["最新档期"] || "—")}</dd></dl>${f["备注"] ? `<div class="note">${esc(f["备注"])}</div>` : ""}</article>`; }).join("")}</div></div>`;
};

/* ── sources ── */
const PFC = { "公众号": "#10b981", "小红书": "#f0443a", "微博": "#f59e0b", "平台官网": "#6d5efc" };
const pfOf = s => (s["平台"] || "其他").replace(/.+官网$/, "平台官网");
V.sources = () => {
  const pf = R.params.pf || "", q = (R.params.q || "").toLowerCase();
  const plats = [...new Set(SRC.map(pfOf))];
  const list = SRC.filter(s => (!pf || pfOf(s) === pf) && (!q || `${s["名称"]} ${s["代表内容"]} ${s["简介"]}`.toLowerCase().includes(q))).sort((a, b) => String(b["发布时间"] || "").localeCompare(String(a["发布时间"] || "")));
  return `<div class="page-in"><div><span class="eyebrow">资料库</span><h1 class="h1">赛事线索从哪来</h1><p class="lede">${SRC.length} 个信源，每个是一个账号主体。每天巡检一遍，发现新赛事后回到主办方官网核实，再收进赛事表。</p></div>
  <div class="src-stats">${[["全部信源", SRC.length, "var(--acc)"], ...plats.map(p => [p, SRC.filter(s => pfOf(s) === p).length, PFC[p] || "var(--ink-3)"])].map(([n, v, c]) => `<div class="src-stat glass"><span class="pf-dot"><i style="background:${c}"></i>${esc(n)}</span><b class="num">${v}</b></div>`).join("")}</div>
  <div class="filter-bar glass"><div class="tb-r"><label class="field ${q ? "has" : ""}">${I.search}<input id="sq" value="${esc(R.params.q || "")}" placeholder="搜信源名称或代表内容"><button class="clr" data-clear-sq>${I.x}</button></label>
  <div class="chips"><button class="chip ${!pf ? "on" : ""}" data-pf="">全部</button>${plats.map(p => `<button class="chip ${pf === p ? "on" : ""}" data-pf="${esc(p)}">${esc(p)}</button>`).join("")}</div></div></div>
  <div class="tbl-wrap glass"><table><thead><tr><th>信源</th><th>平台</th><th>代表内容</th><th>最近发布</th><th>IP 属地</th></tr></thead><tbody>
  ${list.map(s => `<tr><td>${s["主页链接"] ? `<a class="ext" href="${esc(s["主页链接"])}" target="_blank" rel="noopener"><b>${esc(s["名称"])}</b>${I.ext}</a>` : `<b>${esc(s["名称"])}</b>`}${s["简介"] && s["简介"] !== s["名称"] ? `<div class="sub">${esc(short(s["简介"], 44))}</div>` : ""}</td><td><span class="pf-dot"><i style="background:${PFC[pfOf(s)] || "var(--ink-4)"}"></i>${esc(s["平台"] || "—")}</span></td><td>${esc(s["代表内容"] || "—")}</td><td class="num muted" style="white-space:nowrap">${esc(s["发布时间"] || "—")}</td><td class="muted">${esc(s["IP属地"] || "—")}</td></tr>`).join("") || `<tr><td colspan="5"><div class="empty" style="padding:30px"><b>没有匹配的信源</b></div></td></tr>`}
  </tbody></table></div></div>`;
};
V.sources.after = () => { const i = $("#sq"); if (!i) return; const push = debounce(() => nav("sources", clean2({ ...R.params, q: i.value, _f: 1 }), { replace: true }), 240); i.addEventListener("input", () => { i.closest(".field").classList.toggle("has", !!i.value); push(); }); if (R.params._f) { i.focus(); i.setSelectionRange(i.value.length, i.value.length); } };
const clean2 = p => Object.fromEntries(Object.entries(p).filter(([, v]) => v));

/* ── about ── */
V.about = () => {
  const gc = { S: 0, A: 0, B: 0, C: 0 }; C.forEach(c => gc[gr(c)]++);
  const vc = { ok: 0, fixed: 0, warn: 0 }; C.forEach(c => vf(c) && vc[vf(c).level]++);
  const GD = { S: "老牌电影节 AI 单元、头部平台的大额基金或赛事", A: "认可度高、规则清楚、回报明确。首届赛事最高只给 A", B: "有真实展映或奖金，但影响力或回报一般", C: "收费投奖型节展、只有电子证书、或信息不全" };
  return `<div class="page-in about"><div><span class="eyebrow">收录与分级</span><h1 class="h1">AI赛事助手是怎么工作的</h1><p class="lede">把散在公众号、小红书、FilmFreeway 和官网上的 AI 视频赛事收到一处；同一个赛事被十个号转发，这里只出现一次，截止日一律以官方页面为准。</p></div>
  <div class="steps">${[["radar", "巡检", `每天看一遍 ${SRC.length} 个信源，捞出新赛事、延期和规则变化。`], ["shield", "核实", "回到主办方官网逐条核对截止日、奖金和报名费；多档截止取最后一档。"], ["target", "分级", "按四个维度加权打分，分成 S / A / B / C 四档。"], ["bell", "提醒", "截止雷达、日历、日报；标记后在看板里一路跟进到出结果。"]].map(([ic, t, d], i) => `<div class="step glass"><span class="sn">0${i + 1}</span><span class="si">${I[ic]}</span><b>${t}</b><p>${d}</p></div>`).join("")}</div>
  <h2>分级怎么算</h2>
  <div class="weights"><div style="flex:35;background:linear-gradient(135deg,#6d5efc,#5b4cf0)">认可度<br>35%</div><div style="flex:30;background:linear-gradient(135deg,#8b7cff,#7c6cff)">可信度<br>30%</div><div style="flex:20;background:linear-gradient(135deg,#22c3e6,#1ba8c8)">资源回报<br>20%</div><div style="flex:15;background:linear-gradient(135deg,#34d399,#10b981)">成本<br>15%</div></div>
  <div class="grade-cards">${["S", "A", "B", "C"].map(g => `<div class="gcard glass"><span class="cnt num">${gc[g]}</span><span class="g g-${g}">${g}</span><b>${GN[g]}</b><p>${GD[g]}</p></div>`).join("")}</div>
  <h2>数据核对状态</h2>
  <div class="grade-cards" style="grid-template-columns:repeat(3,1fr)"><div class="gcard glass"><span class="cnt num" style="color:var(--green)">${vc.ok}</span><span class="tag ok">${I.shield}已核实</span><p style="margin-top:10px">官网原文里找到了与表中一致的截止日。</p></div><div class="gcard glass"><span class="cnt num" style="color:var(--acc)">${vc.fixed}</span><span class="tag soon">${I.edit}已更正</span><p style="margin-top:10px">和官网不一致的报名费、投递方式已按官网改正。</p></div><div class="gcard glass"><span class="cnt num" style="color:var(--amber)">${vc.warn}</span><span class="tag warn">${I.alert}待确认</span><p style="margin-top:10px">官网页面过期、跳转或查不到截止日，投递前务必自己再看一眼。</p></div></div>
  <h2>收录红线</h2>
  <ul><li>只收 AI 视频 / 影像类，不收 AI 音乐类</li><li>官网必须是官方站；确实没有独立官网时，填平台直达页并备注</li><li>只收有明确在征窗口的赛事</li><li>截止超过 7 天清理，删之前逐条核实是否延期</li></ul>
  <h2>快捷键</h2>
  <div class="kbd-list">${[["全局搜索", "<kbd>/</kbd> 或 <kbd>⌘</kbd><kbd>K</kbd>"], ["列表上下移动", "<kbd>J</kbd> <kbd>K</kbd>"], ["打开选中赛事", "<kbd>Enter</kbd>"], ["标记想投", "<kbd>S</kbd>"], ["详情里切换上/下一个", "<kbd>←</kbd> <kbd>→</kbd>"], ["关闭弹窗", "<kbd>Esc</kbd>"]].map(([a, b]) => `<div class="glass"><span>${a}</span><span>${b}</span></div>`).join("")}</div>
  <h2>小约定</h2>
  <ul><li>剩余天数按你的设备当天日期实时计算；首页倒计时按截止当天 23:59（本地时间）计。</li><li>「免费」「现金奖」由报名费和奖金文字自动识别；奖金折合人民币按大致汇率，只用于比较。</li><li>你的标记和备注只保存在本浏览器，不会上传。</li></ul>
  </div>`;
};

/* ═════════ render ═════════ */
let listCtx = [];
function render(changed = true) {
  clearInterval(tick);
  const y = scrollY;
  $("#view").innerHTML = (V[R.page] || V.home)();
  if (!changed) $$("#view .page-in > *").forEach(e => e.style.animation = "none");
  V[R.page]?.after?.();
  if (changed) countUp($("#view"));
  listCtx = [...new Set($$("#view [data-open]").map(e => e.dataset.open))];
  renderChrome();
  if (changed) { scrollTo(0, 0); $("#side").classList.remove("on"); $("#scrim").classList.remove("on"); } else scrollTo(0, y);
}
function refresh() { render(false); if ($("#drawer").classList.contains("on") && curId) fillDrawer(curId, true); }

/* ═════════ drawer ═════════ */
let curId = null, lastFocus = null;
function openDrawer(id, { fromRoute } = {}) {
  if (!byId.has(id)) return;
  if (!listCtx.includes(id)) listCtx = [...new Set($$("#view [data-open]").map(e => e.dataset.open))];
  curId = id; fillDrawer(id);
  if (!$("#drawer").classList.contains("on")) lastFocus = document.activeElement;
  $("#drawer").classList.add("on"); $("#mask").classList.add("on"); document.body.style.overflow = "hidden"; $(".app").inert = true;
  if (!fromRoute) history.pushState({ drawer: 1 }, "", `#/c/${encodeURIComponent(id)}`);
  setTimeout(() => $("#drawer .dr-x")?.focus({ preventScroll: true }), 60);
}
function closeDrawer({ fromRoute } = {}) {
  if (!$("#drawer").classList.contains("on")) return;
  $("#drawer").classList.remove("on"); $("#mask").classList.remove("on"); document.body.style.overflow = ""; $(".app").inert = false;
  curId = null; try { lastFocus?.focus?.({ preventScroll: true }); } catch {}
  if (!fromRoute && location.hash.startsWith("#/c/")) { if (history.state?.drawer) history.back(); else history.replaceState(null, "", `#/${lastPage || "home"}`); }
}
function milestones(c) {
  const t = String(c["计划备注"] || "") + "\n" + String(c["赛事说明"] || "");
  const out = []; const re = /([^\s；;，,。()（）|｜]{0,10})\s*(20\d{2})[-./年](\d{1,2})[-./月](\d{1,2})日?/g; let m;
  while ((m = re.exec(t))) { const d = new Date(+m[2], +m[3] - 1, +m[4]); if (isNaN(d) || d.getMonth() !== +m[3] - 1) continue; out.push({ d, label: (m[1] || "").replace(/[：:至\-–]$/, "").trim() || "节点" }); }
  const dl = parseD(c["截止日期"]); if (dl) out.push({ d: dl, label: "最终截止", main: 1 });
  const map = new Map(); out.forEach(x => { const k = ymd(x.d); if (!map.has(k) || x.main) map.set(k, x); });
  return [...map.values()].sort((a, b) => a.d - b.d).slice(-8);
}
function fillDrawer(id, keepScroll) {
  const c = byId.get(id); if (!c) return; const l = daysLeft(c), m = mk(id) || {}, s = m.status || null;
  const url = c["投递链接"] || c["官网"]; const isMail = /^mailto:/.test(url || "");
  const ln = u => u && /^https?:/.test(u) ? `<a href="${esc(u)}" target="_blank" rel="noopener">${esc(u.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, ""))}</a>` : u && /^mailto:/.test(u) ? `<a href="${esc(u)}">${esc(u.slice(7))}</a>` : esc(u || "—");
  const idx = listCtx.indexOf(id); const ms = milestones(c); const cash = cashCNY(c); const v = vf(c);
  const st = keepScroll ? $("#drawer .dr-body")?.scrollTop : 0;
  const vIcon = { ok: I.shield, fixed: I.edit, warn: I.alert };
  const vHead = { ok: "官网已核实", fixed: "已按官网更正", warn: "需要你再确认" };
  $("#drawer").innerHTML = `
  <div class="dr-hero pb-${gr(c)}"><span class="glyph">${esc(glyph(c))}</span>
    <span class="grab" aria-hidden="true"></span>
    <div class="dr-bar">${gB(c)}<span class="tag" style="background:rgba(255,255,255,.16);color:#fff;border-color:transparent">${GN[gr(c)]}</span><span class="sp"></span>
      <div class="dr-grp"><button class="icon-btn" data-dr-nav="-1" ${idx <= 0 ? "disabled" : ""} title="上一个（←）">${I.up}</button>${idx >= 0 ? `<span class="dr-pos num">${idx + 1}/${listCtx.length}</span>` : ""}<button class="icon-btn" data-dr-nav="1" ${idx < 0 || idx >= listCtx.length - 1 ? "disabled" : ""} title="下一个（→）">${I.down}</button></div>
      <div class="dr-grp"><button class="icon-btn" data-share title="复制链接">${I.link}</button><button class="icon-btn dr-x" data-act="closeDrawer" title="关闭（Esc）">${I.x}</button></div></div>
    <h2 class="dr-t">${esc(c["名称"])}</h2>
    <div class="dr-org">${esc(c["主办方"] || "")}${c["地区"] ? ` · ${esc(c["地区"])}` : ""}</div>
    <div class="dr-cdrow"><div class="dr-cd">${l === null ? "<b style='font-size:30px'>截止待公布</b>" : l < 0 ? "<b style='font-size:30px'>已截止</b>" : l === 0 ? "<b>今天</b><small>截止</small>" : `<b class="num">${l}</b><small>天后截止</small>`}</div>
      <div class="dr-cdmeta">截止 <b>${fmtFull(c["截止日期"])}</b><br>${esc(c["征集状态"] || "")} · ${esc(c["命题"] || "")}</div></div>
  </div>
  <div class="dr-body">
    <div class="verify ${v ? v.level : "none"}"><span class="vi">${v ? vIcon[v.level] : I.info}</span><div><b>${v ? vHead[v.level] : "未自动核实"}</b><span>${esc(v ? v.note : "官网需要人工打开核对（常见于 FilmFreeway 或需要登录的平台）")}</span></div></div>
    <dl class="kv">
      <div class="wide big"><dt>${I.trophy}最高奖励${cash > 1 ? `<span class="cny">${fmtCNY(cash)}</span>` : ""}</dt><dd>${esc(c["最高奖金"] || "—")}</dd></div>
      <div><dt>${I.ticket}报名费</dt><dd>${esc(feeTxt(c) || "—")}</dd></div>
      <div><dt>${I.target}命题</dt><dd>${esc(c["命题"] || "—")}</dd></div>
      <div><dt>${I.film}类别</dt><dd>${esc(c["类别"] || "—")}</dd></div>
      <div><dt>${I.pin}地区</dt><dd>${esc(c["地区"] || "—")}</dd></div>
      <div class="wide links">${[["官网", c["官网"], "globe"], c["投递链接"] && c["投递链接"] !== c["官网"] ? ["投递入口", c["投递链接"], "ext"] : null].filter(Boolean).filter(x => x[1]).map(([n, u, ic]) => /^(https?|mailto):/.test(u) ? `<a class="lchip" href="${esc(u)}" ${/^mailto/.test(u) ? "" : 'target="_blank" rel="noopener"'}><span class="lic">${I[ic]}</span><span class="lt"><small>${n}</small><b>${esc(u.replace(/^(https?:\/\/(www\.)?|mailto:)/, "").split(/[/?#]/)[0])}</b></span>${I.ext}</a>` : `<div class="lchip"><span class="lic">${I[ic]}</span><span class="lt"><small>${n}</small><b>${esc(u)}</b></span></div>`).join("") || `<div class="lchip"><span class="lic">${I.globe}</span><span class="lt"><small>官网</small><b>暂无</b></span></div>`}</div>
    </dl>
    ${(() => { const mt = matchFilm(c); if (!mt.hasFilm) return `<div class="dr-h">与我的影片匹配</div><div class="match none"><span>还没有填写影片资料，填好片名、时长、字幕等信息后，这里会自动检查资格。</span><a class="btn sm" href="#/films">${I.film}填写影片资料</a></div>`;
      return `<div class="dr-h">与《${esc(short(filmName(FILM()), 12))}》匹配</div><div class="match ${mt.score}"><div class="mh">${mt.score === "ok" ? I.check : I.alert}<b>${mt.score === "ok" ? "条件符合，可以投" : mt.score === "warn" ? "基本可投，有几项要确认" : "有硬性条件不符合"}</b></div>${mt.list.length ? `<ul>${mt.list.map(x => `<li class="${x.lv}">${x.lv === "ok" ? I.check : x.lv === "bad" ? I.x : x.lv === "info" ? I.info : I.alert}${esc(x.t)}</li>`).join("")}</ul>` : `<p>赛事说明里没有写明时长、学生、字幕等限制，请以官网规则为准。</p>`}</div>`; })()}
    <div class="dr-h">《${esc(short(filmName(FILM()), 10))}》的投递进度<span class="saved" id="saved">✓ 已保存</span></div>
    <div class="status-pick">${STATUSES.map(x => `<button data-set="${x.k}" class="${s === x.k ? "on" : ""}"><i style="background:${x.c}"></i>${x.n}</button>`).join("")}<button data-set="skip" class="${s === "skip" ? "on" : ""}">忽略</button></div>
    ${s && s !== "skip" ? `<div class="oc-pick">${OUTCOMES.map(o => `<button data-oc="${o}" class="${m.outcome === o ? "on" : ""}" style="--oc:${OC[o]}">${o}</button>`).join("")}</div>` : ""}
    ${s && s !== "skip" ? `<details class="subd" ${m.d && Object.values(m.d).some(Boolean) ? "open" : ""}><summary>${I.edit}投稿详情<span>单元、平台、费用、回执和版本</span></summary><div class="form" style="padding:12px 0 0">${[["unit", "投稿单元 / 类别", "如：AI 短片竞赛"], ["platform", "投稿平台", "官网、FilmFreeway…"], ["subDate", "实际提交日期", "", "date"], ["resDate", "结果公布日期", "", "date"], ["fee", "投稿费用", "如：20 或 免费"], ["cur", "币种", "CNY / USD / EUR"], ["conf", "确认编号", "订单号或回执编号"], ["ver", "影片版本", "如：Final v3"], ["mat", "材料版本", "如：英文材料 2026-09"], ["receipt", "回执或凭证链接", "只保存链接，不上传文件"]].map(([k, n, ph, t]) => `<label class="fl"><span>${n}</span><input data-sd="${k}" type="${t || "text"}" value="${esc((m.d || {})[k] || "")}" placeholder="${ph}"></label>`).join("")}</div></details>` : ""}
    <textarea class="note-in" id="noteIn" placeholder="备注：投哪个版本、字幕是否齐、投稿编号、账号…（自动保存）">${esc(m.note || "")}</textarea>
    ${s && s !== "skip" ? (() => { const cl = checklist(c); const d = cl.filter(x => x.done).length; return `<div class="dr-h">投递清单 · ${d}/${cl.length}</div><div class="cl-bar"><i style="width:${d / cl.length * 100}%"></i></div><ul class="cl">${cl.map(x => `<li class="${x.done ? "done" : ""}"><button data-ck-item="${x.k}" ${x.auto ? "disabled" : ""} aria-label="${x.n}">${x.done ? I.check : ""}</button><span>${esc(x.n)}</span>${x.auto ? '<em>已从影片资料确认</em>' : ""}</li>`).join("")}</ul>`; })() : ""}
    ${ms.length > 1 ? `<div class="dr-h">时间节点</div><ul class="tl">${(() => { const nx = ms.findIndex(x => x.d >= T0); return ms.map((x, i) => `<li class="${x.d < T0 ? "done" : i === nx ? "next" : ""}"><i></i><b>${ymd(x.d)}</b><span>${esc(x.label)}${x.main ? " · <b>最终截止</b>" : ""}</span></li>`).join(""); })()}</ul>` : ""}
    ${c["赛事说明"] ? `<div class="dr-h">赛事说明</div><div class="prose">${esc(String(c["赛事说明"]).trim())}</div>` : ""}
    ${c["计划备注"] ? `<div class="dr-h">档期与备注</div><div class="prose">${esc(String(c["计划备注"]).trim())}</div>` : ""}
  </div>
  <div class="dr-foot">${url ? `<a class="btn pri" href="${esc(url)}" ${isMail ? "" : 'target="_blank" rel="noopener"'}>${isMail ? "发邮件投稿" : "去投递"}${I.ext}</a>` : ""}
    <button class="btn" data-ics-one title="加入日历，提前 3 天提醒">${I.bell}提醒我</button>
    <button class="btn ${ST.prefs.cmp.includes(id) ? "on" : ""}" data-cmp="${id}" title="加入对比">${I.grid}<span>对比</span></button><button class="btn" data-copy-one title="复制赛事信息">${I.copy}<span>复制</span></button></div>`;
  if (st) $("#drawer .dr-body").scrollTop = st;
  $$("[data-sd]").forEach(el => el.addEventListener("input", debounce(() => { const mm = PL()[id] ||= {}; (mm.d ||= {})[el.dataset.sd] = el.value; mm.updated = Date.now(); save(); const sv = $("#saved"); sv?.classList.add("on"); setTimeout(() => sv?.classList.remove("on"), 1200); }, 350)));
  const ta = $("#noteIn");
  ta.addEventListener("input", debounce(() => { const val = ta.value.trim(); if (val) PL()[id] = { ...(PL()[id] || {}), note: val, updated: Date.now() }; else if (PL()[id]) { delete PL()[id].note; if (!PL()[id].status) delete PL()[id]; } save(); render(false); const sv = $("#saved"); sv?.classList.add("on"); setTimeout(() => sv?.classList.remove("on"), 1200); }, 450));
}
const infoText = c => `${c["名称"]}（${gr(c)} 级）\n截止：${fmtFull(c["截止日期"])}\n奖励：${c["最高奖金"]}\n报名费：${c["报名费"]}\n命题：${c["命题"]}\n官网：${c["官网"] || "—"}${c["投递链接"] && c["投递链接"] !== c["官网"] ? `\n投递：${c["投递链接"]}` : ""}`;
function drNav(d) { const i = listCtx.indexOf(curId) + d; if (i < 0 || i >= listCtx.length) return; curId = listCtx[i]; history.replaceState(history.state, "", `#/c/${encodeURIComponent(curId)}`); fillDrawer(curId); }

/* ═════════ palette ═════════ */
let palSel = 0, palItems = [];
function openPalette(q = "") { $("#palette").classList.add("on"); const i = $("#palQ"); i.value = q; palSel = 0; palRender(); setTimeout(() => i.focus(), 10); }
function closePalette() { $("#palette").classList.remove("on"); }
function palRender() {
  const q = $("#palQ").value.trim().toLowerCase();
  const pages = ROUTES.filter(r => !q || r.n.includes(q) || r.k.includes(q)).map(r => ({ t: "page", k: r.k, n: r.n, i: r.i }));
  const acts = [
    { n: "只看 7 天内截止", i: "flame", go: () => nav("contests", { when: "7" }) }, { n: "只看免费报名", i: "gift", go: () => nav("contests", { fee: "free" }) },
    { n: "只看 S / A 级", i: "trophy", go: () => nav("contests", { grade: "SA" }) },
    { n: "切换深色 / 浅色", i: "spark", go: () => { ST.prefs.theme = document.documentElement.dataset.theme === "dark" ? "light" : "dark"; save(); applyTheme(); renderChrome(); } },
    { n: "新建影片", i: "plus", go: newFilm }, { n: "粘贴影片资料自动识别", i: "copy", go: () => { nav("films"); setTimeout(openPaste, 60); } }, { n: "导出影片资料卡", i: "doc", go: openCard }, { n: "只看适合当前影片的赛事", i: "check", go: () => nav("contests", { fit: "1" }) },
    { n: "复制今日简报", i: "copy", go: () => copy(briefText(false), "已复制今日简报") }, { n: "生成简报分享海报", i: "image", go: () => { nav("brief"); setTimeout(openPoster, 60); } },
  ].filter(a => !q || a.n.toLowerCase().includes(q)).map(a => ({ t: "act", ...a }));
  let cs;
  if (q) { const ws = q.split(/\s+/); cs = C.map(c => { const n = c["名称"].toLowerCase(); const sc = n.startsWith(q) ? 3 : n.includes(q) ? 2 : ws.every(w => hay(c).includes(w)) ? 1 : 0; return [sc, c]; }).filter(x => x[0]).sort((a, b) => b[0] - a[0] || byDl(a[1], b[1])).slice(0, 12).map(x => ({ t: "c", c: x[1] })); }
  else cs = live().filter(c => daysLeft(c) !== null).sort(byDl).slice(0, 6).map(c => ({ t: "c", c }));
  const fs = q ? F.filter(f => `${f["电影节"]} ${f["国家/城市"]}`.toLowerCase().includes(q)).slice(0, 4).map(f => ({ t: "f", f })) : [];
  palItems = [...cs, ...fs, ...pages, ...acts]; palSel = Math.min(palSel, Math.max(0, palItems.length - 1));
  let h = "", g = "";
  palItems.forEach((it, i) => {
    const grp = it.t === "c" ? (q ? "赛事" : "最近截止") : it.t === "f" ? "电影节" : it.t === "page" ? "页面" : "快捷操作";
    if (grp !== g) { g = grp; h += `<div class="pal-g">${grp}</div>`; }
    const l = it.t === "c" ? daysLeft(it.c) : null;
    const inner = it.t === "c" ? `${gB(it.c)}<span class="pt">${hl(it.c["名称"], q)}</span><span class="pd">${l === null ? "待定" : l < 0 ? "已截止" : l === 0 ? "今天截止" : l + " 天"}</span>` : it.t === "f" ? `${I.film}<span class="pt">${esc(it.f["电影节"])}</span><span class="pd">${esc(it.f["每年举办时间"])}</span>` : `${I[it.i] || I.r}<span class="pt">${it.n}</span>`;
    h += `<div class="pal-i ${i === palSel ? "on" : ""}" data-pi="${i}">${inner}</div>`;
  });
  $("#palList").innerHTML = h || `<div class="pal-empty">没有找到「${esc(q)}」</div>`;
  $(".pal-i.on")?.scrollIntoView?.({ block: "nearest" });
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
$("#modal").addEventListener("click", e => { if (e.target.id === "modal") $("#modal").classList.remove("on"); });

/* ═════════ events ═════════ */
document.addEventListener("click", e => {
  const t = e.target;
  const st = t.closest("[data-star]"); if (st) { e.preventDefault(); e.stopPropagation(); const id = st.dataset.star; setStatus(id, isMine(id) ? null : "want"); return; }
  const qk = t.closest("[data-quick]"); if (qk) { e.stopPropagation(); setStatus(qk.dataset.quick, "want"); return; }
  if (t.closest("[data-stop]")) { e.stopPropagation(); return; }
  if (!t.closest("#filmBar")) $("#filmMenu")?.classList.remove("on");
  const cb2 = t.closest("[data-cmp]"); if (cb2) { e.stopPropagation(); const id = cb2.dataset.cmp, a = ST.prefs.cmp; const i = a.indexOf(id); if (i >= 0) a.splice(i, 1); else { if (a.length >= 3) { toast("最多对比 3 个赛事"); return; } a.push(id); } save(); refresh(); if ($("#modal").classList.contains("on") && $(".cmp-dlg")) { if (a.length >= 2) openCompare(); else $("#modal").classList.remove("on"); } return; }
  if (t.closest("[data-cmp-open]")) { openCompare(); return; }
  if (t.closest("[data-ftoggle]")) { $(".filter-bar")?.classList.toggle("open"); return; }
  if (t.closest("[data-cmp-clear]")) { ST.prefs.cmp = []; save(); refresh(); return; }
  const cki = t.closest("[data-ck-item]"); if (cki) { const mm = PL()[curId]; (mm.ck ||= {})[cki.dataset.ckItem] = !mm.ck[cki.dataset.ckItem]; save(); refresh(); return; }
  const ob = t.closest("[data-onb]"); if (ob) { $("#modal")._onb(ob.dataset.onb); return; }
  if (t.closest("[data-help]")) { openHelp(); return; }
  if (t.closest("[data-notify]")) { if (!("Notification" in window)) return toast("这个浏览器不支持通知"); Notification.requestPermission().then(p => { toast(p === "granted" ? "已开启：计划里的赛事 3 天内截止时提醒你" : "没有获得通知权限"); ST.notified = null; notifyDue(); renderChrome(); }); return; }
  if (t.closest("[data-top]")) { scrollTo({ top: 0, behavior: "smooth" }); return; }
  const fm = t.closest("[data-film]"); if (fm) { ST.active = fm.dataset.film; save(); $("#filmMenu")?.classList.remove("on"); refresh(); toast(`已切换到《${short(filmName(FILM()), 14)}》`); return; }
  if (t.closest("[data-new-film]")) { newFilm(); return; }
  const fv = t.closest("[data-fv]"); if (fv) { const k = fv.dataset.fv; FILM().fields[k] = FILM().fields[k] === fv.dataset.o ? "" : fv.dataset.o; save(); render(false); const e2 = $("#fsaved"); e2?.classList.add("on"); setTimeout(() => e2?.classList.remove("on"), 1200); return; }
  if (t.closest("[data-add-crew]")) { (FILM().crew ||= []).push({ role: FILM().crew.length ? "" : "导演" }); save(); render(false); $$("[data-crew]").at(-1)?.querySelector("input")?.focus(); return; }
  const dc = t.closest("[data-del-crew]"); if (dc) { FILM().crew.splice(+dc.dataset.delCrew, 1); save(); render(false); return; }
  if (t.closest("[data-add-award]")) { (FILM().awards ||= []).push({}); save(); render(false); $$("[data-award]").at(-1)?.querySelector("input")?.focus(); return; }
  const da = t.closest("[data-del-award]"); if (da) { FILM().awards.splice(+da.dataset.delAward, 1); save(); render(false); return; }
  if (t.closest("[data-clear-film]")) { if (!confirm(`确认清空《${filmName(FILM())}》的资料吗？投递计划会保留。`)) return; const f = FILM(); const bak = JSON.parse(JSON.stringify(f)); f.fields = {}; f.crew = []; f.awards = []; save(); refresh(); toast("已清空影片资料", () => { ST.films[bak.id] = bak; save(); refresh(); }); return; }
  if (t.closest("[data-del-film]")) { const f = FILM(); const n = Object.values(ST.plans[f.id] || {}).filter(x => x.status).length; if (!confirm(`确认删除《${filmName(f)}》${n ? `以及它的 ${n} 条投递记录` : ""}吗？`)) return; const bak = [f, ST.plans[f.id]]; delete ST.films[f.id]; delete ST.plans[f.id]; ST.active = Object.keys(ST.films)[0]; save(); refresh(); toast("影片已删除", () => { ST.films[bak[0].id] = bak[0]; ST.plans[bak[0].id] = bak[1] || {}; ST.active = bak[0].id; save(); refresh(); }); return; }
  if (t.closest("[data-paste]")) { openPaste(); return; }
  if (t.closest("[data-parse]")) { showParse(); return; }
  if (t.closest("[data-apply]")) { const r = $("#modal")._parsed || {}; const f = FILM(); let n = 0; $$("[data-pk]").forEach(cb => { if (cb.checked) { f.fields[cb.dataset.pk] = r[cb.dataset.pk]; n++; } }); if (r.director && !(f.crew || []).length) { f.crew = [{ role: "导演", zh: r.director.split(/[\/／]/)[0].trim(), en: (r.director.split(/[\/／]/)[1] || "").trim(), stu: r.student === "是" ? "是" : "" }]; } save(); $("#modal").classList.remove("on"); if (R.page !== "films") nav("films"); else refresh(); toast(`已填入 ${n} 项资料`); return; }
  if (t.closest("[data-card]")) { openCard(); return; }
  if (t.closest("[data-card-copy]")) { copy($("#cardMd").value, "资料卡已复制"); return; }
  if (t.closest("[data-card-md]")) { download(`${filmName(FILM())}-投奖资料卡.md`, $("#cardMd").value, "text/markdown"); toast("已保存 Markdown"); return; }
  if (t.closest("[data-card-doc]")) { download(`${filmName(FILM())}-投奖资料卡.doc`, `<html><head><meta charset="utf-8"></head><body style="font-family:'Microsoft YaHei',sans-serif;line-height:1.7">${mdToHtml($("#cardMd").value)}</body></html>`, "application/msword"); toast("已保存 Word 兼容版"); return; }
  if (t.closest("[data-card-print]")) { const w2 = window.open("", "_blank"); if (!w2) return toast("浏览器拦截了弹窗，请允许后再试"); w2.document.write(`<html><head><meta charset="utf-8"><title>${esc(filmName(FILM()))} 投奖资料卡</title><style>body{font-family:'PingFang SC','Microsoft YaHei',sans-serif;max-width:760px;margin:40px auto;line-height:1.75;color:#111}h1{font-size:24px}h2{font-size:16px;border-bottom:1px solid #ddd;padding-bottom:4px;margin-top:26px}table{width:100%;font-size:13px}</style></head><body>${mdToHtml($("#cardMd").value)}</body></html>`); w2.document.close(); setTimeout(() => w2.print(), 300); return; }
  if (t.closest("[data-plan-csv]")) { download(`${filmName(FILM())}-投递计划-${ymd(T0)}.csv`, planCSV(ST.active), "text/csv"); toast("已导出 CSV，可用 Excel 打开"); return; }
  if (t.closest("[data-plan-md]")) { copy(planMD(ST.active), "投奖档案已复制"); return; }
  if (t.closest("[data-add-custom]")) { addCustom(); return; }
  if (t.closest("[data-save-custom]")) { const g = k => ($(`[data-cu="${k}"]`)?.value || "").trim(); if (!g("name")) { toast("请填写赛事名称"); return; } const id = uid("cus"); const c = { record_id: id, "名称": g("name"), "截止日期": g("deadline") || null, "官网": g("url"), "投递链接": g("url"), "最高奖金": g("prize") || "—", "报名费": g("fee") || "—", "地区": g("region") || "—", "分级": "C", "命题": "—", "类别": "自己添加", "征集状态": "开放征集中", "主办方": "自己添加", "赛事说明": "你自己添加的赛事，信息以官网为准。", _custom: 1, _verify: { level: "warn", note: "你自己添加的赛事，还没有经过核验" } }; ST.custom[id] = c; C.push(c); byId.set(id, c); PL()[id] = { status: "want", updated: Date.now() }; save(); $("#modal").classList.remove("on"); refresh(); toast(`已把「${short(c["名称"], 14)}」加入投递计划`); return; }
  const oc = t.closest("[data-oc]"); if (oc) { const mm = PL()[curId]; mm.outcome = mm.outcome === oc.dataset.oc ? "" : oc.dataset.oc; if (mm.outcome && !["submitted", "result"].includes(mm.status)) mm.status = ["入围", "获奖", "未入围"].includes(mm.outcome) ? "result" : "submitted"; save(); refresh(); toast(mm.outcome ? `结果已记录：${mm.outcome}` : "已清除结果"); return; }
  const act = t.closest("[data-act]");
  if (act) { const a = act.dataset.act;
    if (a === "filmMenu") { $("#filmMenu").classList.toggle("on"); return; }
    if (a === "palette") openPalette(); if (a === "closeDrawer") closeDrawer(); if (a === "closeModal") $("#modal").classList.remove("on");
    if (a === "openSide") { $("#side").classList.add("on"); $("#scrim").classList.add("on"); } if (a === "closeSide") { $("#side").classList.remove("on"); $("#scrim").classList.remove("on"); } return; }
  const th = t.closest("[data-theme-set]"); if (th) { ST.prefs.theme = th.dataset.themeSet; save(); applyTheme(); renderChrome(); return; }
  const f = t.closest("[data-f]"); if (f) { const p = filt(); p[f.dataset.f] = f.dataset.v; delete p._f; nav("contests", clean(p), { replace: true }); return; }
  if (t.closest("[data-reset]")) { nav("contests", {}, { replace: true }); return; }
  if (t.closest("[data-clear-q]")) { e.preventDefault(); nav("contests", clean({ ...filt(), q: "", _f: 1 }), { replace: true }); return; }
  if (t.closest("[data-clear-sq]")) { e.preventDefault(); nav("sources", clean2({ ...R.params, q: "", _f: 1 }), { replace: true }); return; }
  const v = t.closest("[data-view]"); if (v) { ST.prefs.view = v.dataset.view; save(); render(false); return; }
  const pf = t.closest("[data-pf]"); if (pf) { const p = { ...R.params, pf: pf.dataset.pf }; delete p._f; nav("sources", clean2(p), { replace: true }); return; }
  const fc = t.closest("[data-fcat]"); if (fc) { nav("festivals", clean2({ cat: fc.dataset.fcat }), { replace: true }); return; }
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
  if (t.closest("[data-poster]")) { openPoster(); return; }
  if (t.closest("[data-save-poster]")) { const cv = $("#modal")._cv; try { download(`AI赛事日报-${ymd(T0)}.png`, cv.toDataURL("image/png")); toast("海报已保存"); } catch { toast("保存失败，可以长按图片保存"); } return; }
  if (t.closest("[data-export]")) { download(`ai-contest-backup-${ymd(T0)}.json`, JSON.stringify({ app: "aicontest", v: 2, exported: new Date().toISOString(), films: ST.films, plans: ST.plans, custom: ST.custom, active: ST.active }, null, 2), "application/json"); toast("备份已导出"); return; }
  const cd = t.closest("[data-cday]"); if (cd && !t.closest("[data-open]") && !t.closest("a")) { nav("calendar", { ...clean2(R.params), day: cd.dataset.cday }, { replace: true }); return; }
  if (t.closest("#modal [data-open]")) $("#modal").classList.remove("on");
  const op = t.closest("[data-open]"); if (op && !t.closest("a[href]:not([data-open])") && !t.closest("button:not([data-open])")) { openDrawer(op.dataset.open); return; }
});
document.addEventListener("change", e => {
  if (e.target.matches("[data-import]")) { const f = e.target.files[0]; if (!f) return; f.text().then(t => { try { const j = JSON.parse(t); if (j.v === 2 && j.films) { Object.assign(ST.films, j.films); for (const [fid, pl] of Object.entries(j.plans || {})) ST.plans[fid] = { ...(ST.plans[fid] || {}), ...pl }; for (const c of Object.values(j.custom || {})) if (!byId.has(c.record_id)) { ST.custom[c.record_id] = c; C.push(c); byId.set(c.record_id, c); } save(); refresh(); toast(`已导入 ${Object.keys(j.films).length} 部影片的资料和投递计划`); return; } const m = j.marks || j; let n = 0; for (const [k, v] of Object.entries(m)) { if (!byId.has(k) || !v) continue; PL()[k] = typeof v === "string" ? { status: v === "done" ? "submitted" : v, updated: Date.now() } : v; n++; } save(); refresh(); toast(`已导入 ${n} 条记录`); } catch { toast("文件格式不对"); } }); }
});
let kIdx = -1, gPend = 0;
document.addEventListener("keydown", e => {
  const typing = /INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName);
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); $("#palette").classList.contains("on") ? closePalette() : openPalette(); return; }
  if (e.key === "Escape") { if ($("#modal").classList.contains("on")) $("#modal").classList.remove("on"); else if ($("#palette").classList.contains("on")) closePalette(); else if ($("#drawer").classList.contains("on")) closeDrawer(); else if (typing) document.activeElement.blur(); return; }
  if (typing || $("#palette").classList.contains("on")) return;
  if (e.key === "/") { e.preventDefault(); openPalette(); return; }
  if (e.key === "?") { openHelp(); return; }
  if (gPend) { gPend = 0; const map = { h: "home", c: "contests", f: "films", t: "tracker", b: "brief", l: "calendar", i: "insights" }; if (map[e.key]) { nav(map[e.key]); return; } }
  if (e.key === "g") { gPend = 1; setTimeout(() => gPend = 0, 900); return; }
  if ($("#drawer").classList.contains("on")) {
    if (["ArrowLeft", "ArrowUp", "k"].includes(e.key)) { e.preventDefault(); drNav(-1); }
    if (["ArrowRight", "ArrowDown", "j"].includes(e.key)) { e.preventDefault(); drNav(1); }
    if (e.key.toLowerCase() === "s") setStatus(curId, isMine(curId) ? null : "want");
    return;
  }
  const rows = $$("#view .row, #view .card"); if (!rows.length) return;
  if (e.key === "j" || e.key === "k") { e.preventDefault(); kIdx = Math.max(0, Math.min(rows.length - 1, kIdx + (e.key === "j" ? 1 : -1))); rows.forEach((r, i) => r.classList.toggle("kfocus", i === kIdx)); rows[kIdx].scrollIntoView?.({ block: "center", behavior: "smooth" }); }
  if (e.key === "Enter" && document.activeElement?.matches?.("[data-open]")) { openDrawer(document.activeElement.dataset.open); return; }
  if (e.key === "Enter" && rows[kIdx]) openDrawer(rows[kIdx].dataset.open);
  if (e.key.toLowerCase() === "c" && rows[kIdx]) { rows[kIdx].querySelector("[data-cmp]")?.click() || (() => { const a = ST.prefs.cmp, id = rows[kIdx].dataset.open; if (!a.includes(id) && a.length < 3) { a.push(id); save(); refresh(); } })(); return; }
  if (e.key.toLowerCase() === "s" && rows[kIdx]) { const id = rows[kIdx].dataset.open; setStatus(id, isMine(id) ? null : "want"); setTimeout(() => $$("#view .row, #view .card")[kIdx]?.classList.add("kfocus"), 0); }
});
addEventListener("scroll", () => { $("#topbar").classList.toggle("scrolled", scrollY > 6); const h = document.documentElement.scrollHeight - innerHeight; $("#prog").style.transform = `scaleX(${h > 0 ? scrollY / h : 0})`; $("#totop").classList.toggle("on", scrollY > 900); }, { passive: true });
addEventListener("popstate", () => { if (!location.hash.startsWith("#/c/")) closeDrawer({ fromRoute: true }); });
window.addEventListener("storage", e => { if (e.key === KEY) { try { Object.assign(ST, JSON.parse(e.newValue)); refresh(); } catch {} } });

/* ═════════ boot ═════════ */
$("#kbd").textContent = /Mac|iPhone|iPad/.test(navigator.platform) ? "⌘K" : "Ctrl K";
$("#today").textContent = `${T0.getMonth() + 1}月${T0.getDate()}日 周${WD[T0.getDay()]}`;
$("#snap").innerHTML = `数据 ${esc(D.contests.snapshot_date || "—")}<br>${C.length} 赛事 · ${F.length} 电影节`;
$("#foot").innerHTML = `<span><b style="color:var(--ink-2)">AI赛事助手</b> · 数据来自 <a href="https://github.com/YIJUEYIJUE/ai-film-contests-tracker" target="_blank" rel="noopener">ai-film-contests-tracker</a>，每日自动更新</span><span>截止日、奖金与规则以主办方官网为准，本站只做整理与提醒</span>`;
const age = D.contests.snapshot_date ? Math.round((T0 - parseD(D.contests.snapshot_date)) / 864e5) : 0;
if (age > 3) $("#banner").innerHTML = `<div class="banner">${I.alert}数据快照已是 ${age} 天前（${esc(D.contests.snapshot_date)}），部分赛事可能已截止或延期，投递前请先看官网。</div>`;
if (!C.length) $("#banner").innerHTML = `<div class="banner">${I.alert}没有读到数据：请先运行 python3 scripts/build.py 生成 public/data/data.js。</div>`;
applyTheme(); route();
if (!ST.onboarded && !/[?&]noonb/.test(location.search)) setTimeout(openOnboard, 400);
notifyDue();
if ("serviceWorker" in navigator && /^https?:$/.test(location.protocol) && !/localhost:0/.test(location.host)) navigator.serviceWorker.register("sw.js").catch(() => {});
})();
