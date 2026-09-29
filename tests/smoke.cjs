// 冒烟测试：用 jsdom 加载页面，逐个路由渲染并做关键交互。需要 `npm i -D jsdom`。
const { JSDOM } = require("jsdom");
const fs = require("fs"), path = require("path");
const pub = path.join(__dirname, "..", "public");
const html = fs.readFileSync(path.join(pub, "index.html"), "utf8")
  .replace('<script src="data/data.js"></script>', () => `<script>${fs.readFileSync(path.join(pub, "data/data.js"), "utf8")}</script>`)
  .replace('<script src="assets/app.js"></script>', () => `<script>${fs.readFileSync(path.join(pub, "assets/app.js"), "utf8")}</script>`);
const errors = [];
const dom = new JSDOM(html, { runScripts: "dangerously", url: "http://localhost/#/home", pretendToBeVisual: true,
  beforeParse(w) { w.matchMedia = () => ({ matches: false, addEventListener() {} }); w.scrollTo = () => {}; w.Element.prototype.scrollIntoView = () => {};
    w.addEventListener("error", e => errors.push(e.message)); w.console.error = (...a) => errors.push(a.join(" ")); } });
const w = dom.window, d = w.document, $ = s => d.querySelector(s), $$ = s => [...d.querySelectorAll(s)];
const go = h => { w.location.hash = h; w.dispatchEvent(new w.HashChangeEvent("hashchange")); };
const ok = (c, m) => { if (!c) { errors.push("✗ " + m); } else console.log("✓", m); };
const wait = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  await wait(50);
  ok($$("#view .card").length > 0, `首页卡片 ${$$("#view .card").length}`);
  ok($$(".strip .day").length === 14, "14 天时间条");
  ok(/\d/.test($("#cd")?.textContent || ""), "首页倒计时");
  $(".strip .day:nth-child(2)").click(); await wait(10); ok(w.location.hash.includes("day="), "点击日期筛选");
  go("#/contests"); await wait(10); const n0 = $$("#rows .row").length; ok(n0 > 50, `全部赛事列表 ${n0}`);
  $('[data-f="fee"][data-v="free"]').click(); await wait(10); const n1 = $$("#rows .row").length; ok(n1 > 0 && n1 < n0, `免费筛选 ${n1}`);
  go("#/contests?q=可灵"); await wait(10); ok($$("#rows .row").length >= 1, `搜索可灵 ${$$("#rows .row").length}`);
  go("#/contests?sort=prize&cash=1"); await wait(10); ok($$("#rows .row").length > 5, "奖金排序");
  $("[data-view=grid]").click(); await wait(10); ok($$("#view .card").length > 5, "卡片视图");
  $("[data-view=list]").click();
  const first = $("#rows .row"); first.click(); await wait(20);
  ok($("#drawer").classList.contains("on"), "打开详情抽屉：" + $(".dr-t").textContent);
  $('[data-set="making"]').click(); await wait(10); ok($('[data-set="making"]').classList.contains("on"), "设置状态：制作中");
  $("[data-dr-nav='1']").click(); await wait(10); ok($(".dr-t").textContent !== first.querySelector("h3").textContent, "抽屉下一个");
  d.dispatchEvent(new w.KeyboardEvent("keydown", { key: "Escape" })); await wait(10); ok(!$("#drawer").classList.contains("on"), "Esc 关闭抽屉");
  $$("#rows .row [data-star]:not(.on)")[0].click(); await wait(10);
  go("#/tracker"); await wait(10); ok($$(".kcard").length >= 1, `看板卡片 ${$$(".kcard").length}`);
  go("#/calendar"); await wait(10); ok($$(".cal .cell").length >= 28, `日历格 ${$$(".cal .cell").length}，事件 ${$$(".ev").length}`);
  $("[data-cal='1']").click(); await wait(10); ok(/月/.test($(".cal-head .h1").textContent), "日历翻页 " + $(".cal-head .h1").textContent);
  go("#/brief"); await wait(10); ok($$(".bi").length > 5, `简报条目 ${$$(".bi").length}`);
  go("#/festivals"); await wait(10); ok($$("tbody tr").length > 10, "电影节表");
  go("#/sources"); await wait(10); ok($$("tbody tr").length > 30, "信源表");
  go("#/about"); await wait(10); ok($(".weights"), "关于页");
  d.dispatchEvent(new w.KeyboardEvent("keydown", { key: "k", metaKey: true })); await wait(10);
  const q = $("#palQ"); q.value = "金鸡"; q.dispatchEvent(new w.Event("input")); await wait(10);
  ok($$(".pal-i").length >= 1, "命令面板搜索 金鸡");
  q.dispatchEvent(new w.KeyboardEvent("keydown", { key: "Enter" })); await wait(20); ok($("#drawer").classList.contains("on"), "面板回车打开赛事");
  go("#/c/recvs8rH4W0X0x"); await wait(20); ok($(".dr-t")?.textContent.includes("北海道"), "深链接打开详情");
  ok(JSON.parse(w.localStorage.getItem("cinecall.v1")).marks, "本地保存");
  if (errors.length) { console.error("\n" + errors.join("\n")); process.exit(1); } else console.log("\n全部通过");
})();
