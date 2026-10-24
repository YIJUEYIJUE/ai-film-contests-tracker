// 冒烟测试（v6 侧栏版）：jsdom 加载页面，逐个路由渲染并验证关键交互。运行：npm i && npm test
const { JSDOM } = require("jsdom");
const fs = require("fs"), path = require("path");
const pub = path.join(__dirname, "..", "public");
const html = fs.readFileSync(path.join(pub, "index.html"), "utf8")
  .replace('<script src="data/data.js"></script>', () => `<script>${fs.readFileSync(path.join(pub, "data/data.js"), "utf8")}</script>`)
  .replace('<script src="assets/app.js"></script>', () => `<script>${fs.readFileSync(path.join(pub, "assets/app.js"), "utf8")}</script>`);
const errors = [];
const dom = new JSDOM(html, { runScripts: "dangerously", url: "http://localhost/#/home", pretendToBeVisual: true,
  beforeParse(w) {
    w.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} });
    w.scrollTo = () => {}; w.Element.prototype.scrollIntoView = () => {};
    w.CSS = { escape: s => s };
    w.HTMLCanvasElement.prototype.getContext = () => new Proxy({}, { get: (t, k) => k === "measureText" ? () => ({ width: 10 }) : k.startsWith("create") ? () => ({ addColorStop() {} }) : () => {}, set: () => true });
    w.HTMLCanvasElement.prototype.toDataURL = () => "data:image/png;base64,";
    w.IntersectionObserver = class { observe() {} unobserve() {} disconnect() {} };
    w.ResizeObserver = class { observe() {} unobserve() {} disconnect() {} };
    w.addEventListener("error", e => errors.push("JS 错误：" + e.message));
    w.console.error = (...a) => errors.push("console.error: " + a.join(" "));
  } });
const w = dom.window, d = w.document, $ = s => d.querySelector(s), $$ = s => [...d.querySelectorAll(s)];
const go = h => { w.location.hash = h; w.dispatchEvent(new w.HashChangeEvent("hashchange")); };
const ok = (c, m) => { if (!c) errors.push("✗ " + m); else console.log("✓", m); };
const wait = ms => new Promise(r => setTimeout(r, ms));
const byText = (sel, t) => $$(sel).find(e => (e.textContent || "").includes(t));
(async () => {
  await wait(350);
  const A = w.AIC || {};
  ok(Array.isArray(A.contests) && A.contests.length > 100, `数据载入：赛事 ${A.contests && A.contests.length}`);
  ok(Array.isArray(A.festivals) && A.festivals.length > 10, `电影节 ${A.festivals && A.festivals.length}`);
  ok(/AI赛事助手/.test(d.title), "标题：" + d.title);
  ok(!$(".brand-mark") && $(".brand-t b").textContent === "AI赛事助手", "品牌区仅保留文字，无图标");
  ok($(".m-brand").textContent.trim() === "AI赛事助手", "移动端品牌文字：" + $(".m-brand").textContent.trim());
  ok($$("#tabs a, #tabs button").length >= 7, `侧栏导航 ${$$("#tabs a, #tabs button").length} 项`);
  ok($$("#tabbar a, #tabbar button").length >= 5, `底部快捷导航 ${$$("#tabbar a, #tabbar button").length} 项`);
  ok(/数据更新于/.test($("#snap").textContent), "快照信息：" + $("#snap").textContent.trim());
  ok(/\d+月\d+日/.test($("#today").textContent), "顶栏日期：" + $("#today").textContent.trim());

  go("#/home"); await wait(80);
  ok($("#view .hero") || $("#view .lead"), "首页主卡片");
  ok(/\d/.test(($("#view .clock") || {}).textContent || ""), "倒计时：" + (($("#view .clock") || {}).textContent || "").replace(/\s+/g, " ").slice(0, 26));
  ok($$("#view .rk").length >= 3, `即将截止排行 ${$$("#view .rk").length} 条`);

  go("#/contests"); await wait(80);
  const n0 = $$("#rows > *").length;
  ok(n0 > 50, `全部赛事 ${n0} 条`);
  const chip = byText(".chip", "免费报名");
  ok(!!chip, "筛选：免费报名");
  if (chip) { chip.click(); await wait(80); const n1 = $$("#rows > *").length; ok(n1 > 0 && n1 < n0, `免费筛选 ${n0} → ${n1}`); }
  const clr = $(".clr") || byText("button", "清除");
  if (clr) { clr.click(); await wait(80); }
  go("#/contests?q=AI"); await wait(300); ok($$("#rows > *").length > 0, `搜索 AI → ${$$("#rows > *").length} 条`);
  go("#/contests"); await wait(80);

  const row = $("#rows > *");
  row.click(); await wait(180);
  ok($("#drawer").classList.contains("on"), "打开详情：" + (($(".dr-t") || {}).textContent || "").slice(0, 22));
  ok(/\/|·/.test($("#drawer").textContent || ""), "详情含主办方与截止");
  d.dispatchEvent(new w.KeyboardEvent("keydown", { key: "Escape" })); await wait(80);
  ok(!$("#drawer").classList.contains("on"), "Esc 关闭详情");

  go("#/calendar"); await wait(80);
  ok($$("#view .cell").length >= 28, `日历 ${$$("#view .cell").length} 格 · 事件 ${$$("#view .ev").length}`);
  ok($$("#view .agenda > *").length > 0, "本月截止清单");
  const nx = $$("#view [data-cal]").find(b => b.dataset.cal !== "0");
  if (nx) { nx.click(); await wait(80); ok(/月/.test($("#view .cal-head").textContent), "日历翻页"); }

  go("#/insights"); await wait(80);
  ok($$("#view .vb").length > 3 && $("#view .donut"), "数据洞察图表");
  ok($$("#view .gcard, #view .hbars a").length > 0, "洞察分项");

  go("#/brief"); await wait(80);
  ok($("#view .paper"), "简报正文");
  ok($$("#view .pi").length > 3, `简报条目 ${$$("#view .pi").length}`);
  ok($$("#view [data-copy], #view .btn").length > 0, "简报复制/打印入口");

  // v7：今日截止 / 今日上新、分享卡片、时间线
  ok(A.contests.every(c => "added" in c && Array.isArray(c.changes)), "每条赛事带收录日与改期记录字段");
  go("#/home"); await wait(80);
  ok($$("#view .duo-c").length === 2, "首页今日截止 / 上新双栏：" + $$("#view .duo-h b").map(e => e.textContent).join(" / "));
  go("#/brief"); await wait(120);
  ok($("#cardImg") && !/^data:image/.test($("#cardImg").src || ""), "进入简报页不自动生成图片");
  $('[data-act="cardgen"]').click(); await wait(160);
  ok($("#cardImg") && /^data:image\/png/.test($("#cardImg").src || ""), "点「生成图片」后卡片已生成");
  { const mv = $$("#view .p-chg .row").length; ok(mv === 0 || $$("#view .p-chg .why").length === mv, `截止日调整条目均带原因 ${mv} 条`);
    ok($$("#view .p-chg .row").every(e => !/→\s*待公布/.test(e.textContent)), "调整区块不再出现「→ 待公布」"); }
  ok(!/本届已结束/.test($("#view").textContent) || A.contests.some(c => c.cycle === "ended"), "已结束标记与数据一致");
  ok($$("#view .p-col").length === 2, "简报文字版左右两栏");
  for (const sz of ["tall", "wide"]) { go("#/brief?size=" + sz); await wait(100); ok($(`#view [data-card="size:${sz}"].on`), "卡片尺寸切换 " + sz); }
  go("#/brief?theme=dark"); await wait(100); ok($('#view [data-card="theme:dark"].on'), "卡片深色");
  go("#/contests?new=7&sort=new"); await wait(100);
  { const n = $$("#rows > *").length; ok(n >= 0 && $('#view [data-f="new"].on'), `上新筛选 近 7 天 ${n} 条`); }
  go("#/timeline"); await wait(120);
  { const n = $$("#view .tl-r").length; ok(n > 20, `时间线全景 ${n} 行`); ok($("#view .tl-now") && $("#view .tk.today"), "时间线今天标线"); }
  go("#/timeline?zoom=all&past=1"); await wait(100); ok($$("#view .tl-r.past").length > 0, "时间线含已截止");
  go("#/timeline?grade=SA"); await wait(100); ok($$("#view .tl-r").length > 0 && $$("#view .tl-r").every(r => /\b[SA]\b/.test(r.querySelector(".g").textContent)), "时间线按分级筛选");
  go("#/timeline?mode=feed"); await wait(120); ok($$("#view .fd-day").length > 0 && $("#fd-today"), `每日动态 ${$$("#view .fd-day").length} 天`);
  go("#/timeline"); await wait(80); $("#view .tl-r").click(); await wait(150); ok($("#drawer").classList.contains("on"), "时间线点击打开详情");
  d.dispatchEvent(new w.KeyboardEvent("keydown", { key: "Escape" })); await wait(60);

  go("#/festivals"); await wait(80);
  ok($$("#view .fest").length > 10, `电影节卡片 ${$$("#view .fest").length}`);

  go("#/about"); await wait(80);
  ok($("#view .weights") && $$("#view .gcard").length >= 4, "收录与分级页");

  const first = A.contests[0];
  go("#/c/" + first.id); await wait(300);
  const dr = $("#drawer");
  ok(dr.classList.contains("on") && dr.textContent.includes(first.name.slice(0, 6)), "深链接打开详情：" + first.name.slice(0, 20));
  d.dispatchEvent(new w.KeyboardEvent("keydown", { key: "Escape" })); await wait(60);

  $("#sq").value = "AI";
  $("#sq").dispatchEvent(new w.Event("input")); await wait(320);
  ok($$("#sres > *").length > 0, `命令面板搜索 ${$$("#sres > *").length} 条`);
  d.dispatchEvent(new w.KeyboardEvent("keydown", { key: "Escape" })); await wait(60);

  const t0 = d.documentElement.dataset.theme;
  $('[data-act="theme"]').click(); await wait(60);
  ok(d.documentElement.dataset.theme !== t0, `主题切换 ${t0} → ${d.documentElement.dataset.theme}`);

  ok(!/我的影片|投递看板|作品库/.test(d.documentElement.innerHTML), "无旧版残留模块");
  // v7 回归：原型键、脏参数、坏存储、待公布标题
  go("#/contests?sort=__proto__&new=-3"); await wait(80); ok(!/undefined/.test($("#view").textContent), "排序参数为 __proto__ 时不显示 undefined");
  go("#/brief?size=__proto__&theme=constructor"); await wait(120); $('[data-act="cardgen"]').click(); await wait(160); ok($("#cardImg") && /^data:image/.test($("#cardImg").src || ""), "卡片参数为原型键时仍能生成");
  go("#/brief"); await wait(60);
  ok(!/还剩 null 天|NaN/.test($("#view").textContent), "简报无「还剩 null 天」");
  const allPend = A.contests.filter(c => !c.deadline).length; ok(allPend > 0 && !/剩余天数 0 天/.test($("#view").textContent), `待公布 ${allPend} 个不显示剩余天数`);
  go("#/timeline?mode=feed"); await wait(80); ok(!/NaN|undefined/.test($("#view").textContent), "每日动态无 NaN / undefined");
  if (errors.length) { console.error("\n" + errors.join("\n")); process.exit(1); } else console.log("\n全部通过");
})();
