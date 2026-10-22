// 真实浏览器交互测试（Node 版）：npm i -D playwright-core && npx playwright-core install chromium && node tests/e2e.cjs
const { chromium } = require("playwright-core");
const http = require("http"), fs = require("fs"), path = require("path");
const pub = path.resolve(process.argv[2] || path.join(__dirname, "..", "public"));
const srv = http.createServer((q, r) => { let f = path.join(pub, decodeURIComponent(q.url.split("?")[0])); if (f.endsWith("/")) f += "index.html"; fs.readFile(f, (e, b) => { if (e) { r.writeHead(404); return r.end(); } r.writeHead(200, { "content-type": f.endsWith(".js") ? "text/javascript" : f.endsWith(".css") ? "text/css" : f.endsWith(".json") ? "application/json" : "text/html" }); r.end(b); }); }).listen(0);
const res = [], ok = (c, m) => res.push((c ? "✓ " : "✗ ") + m);
(async () => {
  const U = `http://127.0.0.1:${srv.address().port}/`, errs = [];
  const b = await chromium.launch({ args: ["--no-sandbox"] });
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true, permissions: ["clipboard-read", "clipboard-write"] });
  const pg = await ctx.newPage(); pg.on("pageerror", e => errs.push(String(e))); pg.on("console", m => m.type() === "error" && errs.push(m.text()));
  const go = async (h, t = 350) => { await pg.goto(U + h, { waitUntil: "networkidle" }); await pg.waitForTimeout(t); };
  const BAN = /我的影片|投递看板|作品库|信源|来源[:：]|数据来源|toujiang|aitop100|飞书多维/;
  await go("#/home", 600);
  ok(!BAN.test(await pg.innerText("body")), "首页无来源/旧模块字样");
  ok(await pg.locator(".duo-c").count() === 2 && await pg.locator(".lead").count() === 1 && await pg.locator(".kpi").count() === 4, "首页：今日截止/上新双栏 + 热榜 + 4 个数字");
  ok(await pg.locator(".tl .dcol").count() === 14, "首页 14 天条");
  await pg.click(".tl-all"); await pg.waitForTimeout(300); ok(pg.url().includes("#/timeline"), "首页「完整时间线」入口");
  // 全部赛事
  await go("#/contests"); const n0 = await pg.locator("#rows > *").count(); ok(n0 > 50, `全部赛事在征 ${n0}`);
  await pg.click('[data-f="fee"][data-v="free"]'); await pg.waitForTimeout(300); const n1 = await pg.locator("#rows > *").count(); ok(n1 > 0 && n1 < n0, `免费筛选 ${n0}→${n1}`);
  await pg.click(".af button"); await pg.waitForTimeout(300); ok(await pg.locator("#rows > *").count() === n0, "移除条件");
  await pg.fill("#fq", "厦门"); await pg.waitForTimeout(600); ok(await pg.evaluate(() => document.activeElement.id) === "fq", "搜索不丢焦点");
  await go("#/contests?when=all"); const NALL = await pg.evaluate(() => AIC.contests.length); ok(await pg.locator("#rows > *").count() === NALL, `含已截止 ${NALL}`);
  await go("#/contests?new=7&sort=new"); const nn = await pg.locator("#rows > *").count(); ok(nn > 0 && await pg.locator('[data-f="new"].on').count() === 1, `近 7 天上新 ${nn}`);
  ok(await pg.evaluate(() => { const r = [...document.querySelectorAll("#rows > *")].map(e => AIC.contests.find(c => c.id === e.dataset.open).added); return r.every((x, i) => i === 0 || r[i - 1] >= x); }), "「最新收录」排序正确");
  // 详情：逐个打开，检查无来源字样，收录/改期记录
  const ids = await pg.evaluate(() => AIC.contests.map(c => c.id)); const leak = [];
  await go("#/contests?when=all");
  for (const i of ids) { await pg.evaluate(id => location.hash = "#/c/" + id, i); await pg.waitForTimeout(15); const t = await pg.innerText("#drawer"); if (/来源|第三方|聚合站|aifilmcontests|aigcsubmission|toujiang|投奖|飞书多维|红线|入库/.test(t)) leak.push(i); }
  ok(!leak.length, `逐个打开 ${ids.length} 个详情，无内部记录字样 ${leak.slice(0, 3)}`);
  const chgId = await pg.evaluate(() => (AIC.contests.find(c => c.changes.length) || {}).id);
  await pg.evaluate(id => location.hash = "#/c/" + id, chgId); await pg.waitForTimeout(200); ok(/截止日调整/.test(await pg.innerText("#drawer .dr-rec")), "详情显示截止日调整记录");
  await pg.keyboard.press("Escape");
  // 简报 + 分享卡片
  for (const [sz, wh] of [["long", null], ["tall", [1080, 1440]], ["wide", [1920, 1080]]]) for (const th of ["light", "dark"]) {
    const q = new URLSearchParams(); if (sz !== "long") q.set("size", sz); if (th === "dark") q.set("theme", "dark");
    await go("#/brief" + (q + "" ? "?" + q : ""), 500);
    const dim = await pg.evaluate(() => new Promise(r => { const i = document.querySelector("#cardImg"); const im = new Image(); im.onload = () => r([im.naturalWidth, im.naturalHeight]); im.onerror = () => r(null); im.src = i.src; }));
    ok(dim && (wh ? dim[0] === wh[0] && dim[1] === wh[1] : dim[0] === 1080 && dim[1] > 1440), `卡片 ${sz}/${th} ${dim}`);
  }
  await go("#/brief", 500);
  ok(await pg.locator(".p-col").count() === 2, "简报文字版：截止 / 上新两栏");
  const [dl] = await Promise.all([pg.waitForEvent("download"), pg.click('[data-act="cardsave"]')]); ok(/^AI赛事日报-.*\.png$/.test(dl.suggestedFilename()), "保存图片 " + dl.suggestedFilename());
  await pg.click('[data-act="cardcopy"]'); await pg.waitForTimeout(500); ok(/图片已复制|不支持|复制失败/.test(await pg.innerText("#toasts")), "复制图片有反馈：" + (await pg.innerText("#toasts")).split("\n").pop());
  await pg.click('[data-act="caption"]'); await pg.waitForTimeout(300); const cap = await pg.evaluate(() => navigator.clipboard.readText()); ok(/AI 赛事日报/.test(cap) && /⏰/.test(cap) && /🆕/.test(cap) && /http/.test(cap), "复制配文：截止 + 上新 + 网址");
  await pg.click('[data-act="copybrief"]'); await pg.waitForTimeout(300); ok(/上新/.test(await pg.evaluate(() => navigator.clipboard.readText())), "复制文字版含上新");
  await pg.click('[data-card="size:wide"]'); await pg.waitForTimeout(400); ok(pg.url().includes("size=wide"), "切换横版");
  // 时间线
  await go("#/timeline", 500); const nt = await pg.locator(".tl-r").count(); ok(nt > 20, `时间线全景 ${nt} 行`);
  ok(await pg.evaluate(() => { const a = document.querySelector(".tk.today").getBoundingClientRect(), n = document.querySelector(".tl-now").getBoundingClientRect(); const tp = parseFloat(getComputedStyle(document.querySelector(".tl-g")).getPropertyValue("--tp")); return Math.abs(a.left + a.width / 2 - (n.left + n.width * tp / 100)) < 2; }), "「今天」刻度与红线对齐");
  ok(await pg.evaluate(() => { const r = [...document.querySelectorAll(".tl-r")].map(e => AIC.contests.find(c => c.id === e.dataset.open).deadline); return r.every((x, i) => i === 0 || r[i - 1] <= x); }), "时间线按截止日排序");
  await pg.click('[data-tl="grade:SA"]'); await pg.waitForTimeout(300); const ns = await pg.locator(".tl-r").count(); ok(ns > 0 && ns < nt, `S+A 筛选 ${nt}→${ns}`);
  for (const z of ["30", "180", "all"]) { await pg.click(`[data-tl="zoom:${z}"]`); await pg.waitForTimeout(250); ok(pg.url().includes("zoom=" + z) && await pg.locator(".tk:not(.today)").count() >= 2, "范围 " + z); }
  await pg.fill("#tlq", "AI"); await pg.waitForTimeout(600); ok(await pg.evaluate(() => document.activeElement.id) === "tlq", "时间线搜索不丢焦点");
  await pg.locator(".tl-r").first().click(); await pg.waitForTimeout(300); ok(await pg.locator("#drawer.on").count() === 1, "时间线点开详情");
  await pg.keyboard.press("Escape"); await pg.waitForTimeout(200); ok(await pg.locator("#drawer.on").count() === 0 && pg.url().includes("timeline"), "关闭详情回到时间线");
  await go("#/timeline", 300); await pg.locator(".tl-r").first().focus(); await pg.keyboard.press("Enter"); await pg.waitForTimeout(300); ok(await pg.locator("#drawer.on").count() === 1, "键盘回车打开"); await pg.keyboard.press("Escape");
  await go("#/timeline?mode=feed", 500); ok(await pg.locator("#fd-today").count() === 1 && await pg.locator(".fd-i").count() > 5, `每日动态 ${await pg.locator(".fd-i").count()} 条`);
  ok(await pg.locator(".fd-i.new").count() > 0 && await pg.locator(".fd-i.due").count() > 0, "动态里有上新和截止");
  // 其它页 + 深色
  for (const h of ["calendar", "insights", "festivals", "about"]) { await go("#/" + h, 250); ok((await pg.innerText("#view")).length > 200 && !BAN.test(await pg.innerText("body")), h + " 正常"); }
  await go("#/timeline", 300); await pg.click('.side [data-act="theme"]'); await pg.waitForTimeout(300); ok(await pg.evaluate(() => document.documentElement.dataset.theme) === "dark", "切换深色");
  // 手机
  const m = await b.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true }); m.on("pageerror", e => errs.push("m " + e));
  for (const h of ["home", "contests", "timeline", "timeline?mode=feed", "calendar", "brief", "festivals"]) { await m.goto(U + "#/" + h, { waitUntil: "networkidle" }); await m.waitForTimeout(300); ok(await m.evaluate(() => document.documentElement.scrollWidth - innerWidth) <= 1, "手机 " + h + " 无横向溢出"); }
  await m.goto(U + "#/timeline", { waitUntil: "networkidle" }); await m.locator(".tl-r").first().tap(); await m.waitForTimeout(400); ok(await m.locator("#drawer.on").count() === 1, "手机时间线点开详情");
  ok(await m.locator("#tabbar a").count() === 5 && /时间线/.test(await m.innerText("#tabbar")), "手机底栏含时间线");

  // ===== 对抗用例 =====
  const clock = iso => `(()=>{const _D=Date;const off=new _D(${JSON.stringify(iso)})-_D.now();class D extends _D{constructor(...a){a.length?super(...a):super(_D.now()+off)}static now(){return _D.now()+off}};window.Date=D;})();`;
  const BAD = /NaN|undefined|Invalid Date|null 天|\[object/;
  for (const iso of ["2026-10-23T00:00:30+08:00", "2026-12-31T23:59:00+08:00", "2027-01-01T00:01:00+08:00", "2026-10-10T10:00:00+08:00"]) {
    const c2 = await b.newContext(); await c2.addInitScript(clock(iso)); const p2 = await c2.newPage(); const e2 = []; p2.on("pageerror", e => e2.push(e.message));
    let bad = "";
    for (const h of ["home", "timeline", "timeline?mode=feed", "brief", "brief?size=wide", "contests?new=1"]) { await p2.goto(U + "#/" + h, { waitUntil: "networkidle" }); await p2.waitForTimeout(250); const t = await p2.innerText("body"); if (BAD.test(t)) bad += h + " "; }
    ok(!e2.length && !bad, `假时钟 ${iso.slice(0, 16)}：无报错、无 NaN/null ${bad}${e2.slice(0, 1)}`); await c2.close();
  }
  { const c2 = await b.newContext(); await c2.addInitScript("Object.defineProperty(window,'localStorage',{get(){throw new Error('denied')}})"); const p2 = await c2.newPage(); const e2 = []; p2.on("pageerror", e => e2.push(e.message));
    await p2.goto(U + "#/home", { waitUntil: "networkidle" }); await p2.waitForTimeout(300); ok(!e2.length && (await p2.innerText("#view")).length > 100, "浏览器禁用本地存储时正常显示"); await c2.close(); }
  { const c2 = await b.newContext(); await c2.addInitScript("HTMLCanvasElement.prototype.getContext=()=>null"); const p2 = await c2.newPage(); const e2 = []; p2.on("pageerror", e => e2.push(e.message));
    await p2.goto(U + "#/brief", { waitUntil: "networkidle" }); await p2.waitForTimeout(400); ok(!e2.length && /复制配文/.test(await p2.innerText("#cardLd")), "不支持画图时给出替代提示"); await c2.close(); }
  for (const h of ["contests?sort=__proto__", "brief?size=__proto__&theme=constructor", "timeline?zoom=constructor&new=abc", "c/%E0%A4%A", "c/__proto__"]) {
    await go("#/" + h, 300); ok(!BAD.test(await pg.innerText("#view")), "异常网址参数 " + h); }
  { const REC = `(() => { const P = CanvasRenderingContext2D.prototype, o = P.fillText; window.__T = []; P.fillText = function (t, x, y) { const m = this.measureText(t); const x0 = this.textAlign === "right" ? x - m.width : this.textAlign === "center" ? x - m.width / 2 : x; window.__T.push({ t: String(t), x0, x1: x0 + m.width, y0: y - m.actualBoundingBoxAscent, y1: y + m.actualBoundingBoxDescent, W: this.canvas.width, H: this.canvas.height }); return o.apply(this, arguments); }; })();`;
    for (const sz of ["", "?size=tall", "?size=wide"]) { const c2 = await b.newContext(); await c2.addInitScript(REC); const p2 = await c2.newPage(); await p2.goto(U + "#/brief" + sz, { waitUntil: "networkidle" }); await p2.waitForTimeout(700);
      const r = await p2.evaluate(() => { const T = window.__T.filter(x => x.W > 900); if (!T.length) return { n: 0 }; const W = T[0].W, H = T[0].H; let out = 0, ov = 0; T.forEach(a => { if (a.x0 < 30 || a.x1 > W - 30 || a.y0 < 24 || a.y1 > H - 24) out++; }); for (let i = 0; i < T.length; i++) for (let j = i + 1; j < T.length; j++) { const a = T[i], c = T[j]; if (a.x0 < c.x1 - 2 && c.x0 < a.x1 - 2 && a.y0 < c.y1 - 2 && c.y0 < a.y1 - 2) ov++; } return { n: T.length, out, ov }; });
      ok(r.n > 15 && !r.out && !r.ov, `卡片${sz || "长图"}文字：${r.n} 段，越界 ${r.out}，重叠 ${r.ov}`); await c2.close(); } }
  await b.close(); srv.close();
  console.log(res.filter(r => r[0] === "✗").join("\n")); console.log(`通过 ${res.filter(r => r[0] === "✓").length}/${res.length}`); console.log("JS 错误:", errs.length ? errs.slice(0, 5) : "无");
})();
