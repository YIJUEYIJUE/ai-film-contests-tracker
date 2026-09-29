#!/usr/bin/env python3
"""影赛雷达 CineCall 数据构建。

从 ai-film-contests-tracker 取最新快照，生成：
  public/data/data.js      网页读取的数据
  public/data/contests.json
  public/deadlines.ics     可订阅的截止日历（所有在征赛事，提前 3 天提醒）
  public/feed.xml          RSS：在征赛事，按截止日排序

用法：
  python3 scripts/build.py                     # 在线拉 GitHub 最新快照
  python3 scripts/build.py --local path/to/dir # 用本地 data/ festivals/ sources/
只用 Python 标准库。
"""
import datetime as dt, json, os, pathlib, re, sys, urllib.request
from email.utils import format_datetime
from xml.sax.saxutils import escape

REPO = os.environ.get("DATA_REPO", "YIJUEYIJUE/ai-film-contests-tracker")
BRANCH = os.environ.get("DATA_BRANCH", "main")
SITE_URL = os.environ.get("SITE_URL", "").rstrip("/")
ROOT = pathlib.Path(__file__).resolve().parent.parent
PUB = ROOT / "public"


def fetch(url):
    headers = {"User-Agent": "CineCallBot/1.0"}
    if os.environ.get("GITHUB_TOKEN") and "api.github.com" in url:
        headers["Authorization"] = f"Bearer {os.environ['GITHUB_TOKEN']}"
    with urllib.request.urlopen(urllib.request.Request(url, headers=headers), timeout=40) as r:
        return r.read().decode("utf-8")


def latest(paths, folder, prefix, required=True):
    pat = re.compile(rf"^{folder}/{prefix}_(\d{{4}}-\d{{2}}-\d{{2}})\.json$")
    hits = sorted((m.group(1), p) for p in paths if (m := pat.match(p)))
    if not hits:
        if required:
            sys.exit(f"找不到 {folder}/{prefix}_YYYY-MM-DD.json")
        return None
    return hits[-1][1]


def load():
    if "--local" in sys.argv:
        base = pathlib.Path(sys.argv[sys.argv.index("--local") + 1]).resolve()
        paths = [p.relative_to(base).as_posix() for p in base.rglob("*.json")]
        read = lambda p: (base / p).read_text("utf-8")
    else:
        tree = json.loads(fetch(f"https://api.github.com/repos/{REPO}/git/trees/{BRANCH}?recursive=1"))
        paths = [t["path"] for t in tree["tree"]]
        read = lambda p: fetch(f"https://raw.githubusercontent.com/{REPO}/{BRANCH}/{p}")
    out = {"contests": json.loads(read(latest(paths, "data", "contests")))}
    for key, folder, prefix in (("festivals", "festivals", "festivals"), ("sources", "sources", "feishu_sources")):
        p = latest(paths, folder, prefix, required=False)
        out[key] = json.loads(read(p)) if p else {"records": []}
    return out


def validate(data):
    recs = data["contests"].get("records")
    if not isinstance(recs, list) or not recs:
        sys.exit("赛事数据为空，停止构建（避免把线上站点清空）")
    need = {"record_id", "名称"}
    bad = [i for i, r in enumerate(recs) if not need <= r.keys()]
    if bad:
        sys.exit(f"有 {len(bad)} 条赛事缺少 record_id 或 名称，例如第 {bad[0]} 条")
    for r in recs:
        d = r.get("截止日期")
        if d and not re.match(r"^\d{4}-\d{2}-\d{2}$", str(d)):
            print(f"  ! 截止日期格式异常，按待公布处理：{r['名称']} → {d}")
            r["截止日期"] = None
    return recs


def ics(recs, today):
    def e(s):
        return re.sub(r"([\\;,])", r"\\\1", str(s or "")).replace("\n", "\\n")
    stamp = dt.datetime.utcnow().strftime("%Y%m%dT%H%M%SZ")
    lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//CineCall//AI Contest Radar//ZH", "CALSCALE:GREGORIAN",
             "METHOD:PUBLISH", "X-WR-CALNAME:AI 影像赛事截止 · 影赛雷达", "X-WR-TIMEZONE:Asia/Shanghai", "REFRESH-INTERVAL;VALUE=DURATION:PT12H"]
    for r in recs:
        d = r.get("截止日期")
        if not d or r.get("征集状态") == "已截止":
            continue
        day = dt.date.fromisoformat(d)
        if day < today:
            continue
        url = r.get("投递链接") or r.get("官网") or ""
        lines += ["BEGIN:VEVENT", f"UID:{r['record_id']}@cinecall", f"DTSTAMP:{stamp}",
                  f"DTSTART;VALUE=DATE:{day:%Y%m%d}", f"DTEND;VALUE=DATE:{day + dt.timedelta(days=1):%Y%m%d}",
                  f"SUMMARY:{e('【' + (r.get('分级') or '-') + '】截止 · ' + r['名称'])}",
                  f"DESCRIPTION:{e('最高奖励：' + str(r.get('最高奖金') or '—') + chr(10) + '报名费：' + str(r.get('报名费') or '—') + chr(10) + '投递：' + (url or '—'))}"]
        if url:
            lines.append(f"URL:{url}")
        lines += ["BEGIN:VALARM", "TRIGGER:-P3D", "ACTION:DISPLAY", f"DESCRIPTION:{e('3 天后截止：' + r['名称'])}", "END:VALARM", "END:VEVENT"]
    lines.append("END:VCALENDAR")
    # 按 RFC 5545 折行（75 字节）
    out = []
    for ln in lines:
        b = ln.encode("utf-8")
        while len(b) > 75:
            cut = 75
            while cut > 0 and (b[cut] & 0xC0) == 0x80:
                cut -= 1
            out.append(b[:cut].decode("utf-8")); b = b" " + b[cut:]
        out.append(b.decode("utf-8"))
    return "\r\n".join(out) + "\r\n"


def rss(recs, snap, today):
    base = SITE_URL or "."
    items = [r for r in recs if r.get("征集状态") != "已截止" and (not r.get("截止日期") or dt.date.fromisoformat(r["截止日期"]) >= today)]
    items.sort(key=lambda r: r.get("截止日期") or "9999")
    pub = format_datetime(dt.datetime.combine(dt.date.fromisoformat(snap), dt.time(8), dt.timezone(dt.timedelta(hours=8))))
    x = ['<?xml version="1.0" encoding="UTF-8"?>', '<rss version="2.0"><channel>',
         "<title>影赛雷达 · 在征 AI 影像赛事</title>", f"<link>{escape(base)}/</link>",
         "<description>AI 视频 / 影像赛事，按截止日排序</description>", "<language>zh-cn</language>", f"<lastBuildDate>{pub}</lastBuildDate>"]
    for r in items:
        t = f"【{r.get('分级') or '-'}】{r['名称']} · {r.get('截止日期') or '截止待公布'}"
        desc = f"最高奖励：{r.get('最高奖金') or '—'}<br>报名费：{r.get('报名费') or '—'}<br>命题：{r.get('命题') or '—'}<br><br>{(r.get('赛事说明') or '').replace(chr(10), '<br>')}"
        x += ["<item>", f"<title>{escape(t)}</title>", f"<link>{escape(base)}/#/c/{escape(r['record_id'])}</link>",
              f'<guid isPermaLink="false">{escape(r["record_id"])}</guid>', f"<pubDate>{pub}</pubDate>",
              f"<description>{escape(desc)}</description>", "</item>"]
    x.append("</channel></rss>")
    return "\n".join(x)


def main():
    data = load()
    recs = validate(data)
    snap = data["contests"].get("snapshot_date") or dt.date.today().isoformat()
    today = dt.datetime.now(dt.timezone(dt.timedelta(hours=8))).date()
    (PUB / "data").mkdir(parents=True, exist_ok=True)
    blob = json.dumps(data, ensure_ascii=False, separators=(",", ":")).replace("</", "<\\/")
    (PUB / "data" / "data.js").write_text(f"/* 自动生成：scripts/build.py · 快照 {snap} */\nwindow.CINECALL={blob};\n", "utf-8")
    (PUB / "data" / "contests.json").write_text(json.dumps(data["contests"], ensure_ascii=False, indent=1), "utf-8")
    (PUB / "deadlines.ics").write_text(ics(recs, today), "utf-8", newline="")
    (PUB / "feed.xml").write_text(rss(recs, snap, today), "utf-8")
    print(f"✓ 快照 {snap} · 赛事 {len(recs)} · 电影节 {len(data['festivals'].get('records', []))} · 信源 {len(data['sources'].get('records', []))}")
    print(f"  → {PUB.relative_to(ROOT)}/  （本地预览：python3 -m http.server -d public 8080）")


if __name__ == "__main__":
    main()
