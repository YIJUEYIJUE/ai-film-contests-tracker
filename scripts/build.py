#!/usr/bin/env python3
"""AI赛事助手 v6 · 数据构建

读取赛事 / 电影节快照 → 清洗校验 → 生成 public/data/data.js、contests.json、deadlines.ics、feed.xml。
规则见 docs/03-数据规范.md。校验不过会中止，不覆盖已有产物。

  python3 scripts/build.py                 在线读取最新快照
  python3 scripts/build.py --local DIR     读取本地 DIR/data、DIR/festivals
只依赖 Python 标准库。
"""
import datetime as dt
import json, os, pathlib, re, sys, urllib.request
from collections import Counter
from email.utils import format_datetime
from xml.sax.saxutils import escape

REPO = os.environ.get("DATA_REPO", "YIJUEYIJUE/ai-film-contests-tracker")
BRANCH = os.environ.get("DATA_BRANCH", "main")
SITE_URL = os.environ.get("SITE_URL", "").rstrip("/")
ROOT = pathlib.Path(__file__).resolve().parent.parent
PUB = ROOT / "public"
TZ = dt.timezone(dt.timedelta(hours=8))
AGGREGATORS = ("toujiang.today", "aitop100", "aigcsubmission")
STATUS = {"开放征集中": "open", "待公布": "pending", "即将开放": "soon", "已截止": "closed"}
warns = []


def warn(msg):
    warns.append(msg)


class FetchError(Exception):
    pass


def fetch(url, tries=3, timeout=40, fatal=True):
    h = {"User-Agent": "AIContestAssistant-build/6"}
    if os.environ.get("GITHUB_TOKEN") and "api.github.com" in url:
        h["Authorization"] = "Bearer " + os.environ["GITHUB_TOKEN"]
    for i in range(tries):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=h), timeout=timeout) as r:
                return r.read().decode("utf-8")
        except Exception as e:  # 网络抖动重试，最终失败则中止且不覆盖产物
            if i == tries - 1:
                if not fatal:
                    raise FetchError(str(e)) from e
                sys.exit(f"✗ 读取失败（{e}）：{url}，已中止构建，网站保持上一版")
            __import__("time").sleep(3 * (i + 1))


def latest(paths, folder, prefix):
    pat = re.compile(rf"^{folder}/{prefix}_(\d{{4}}-\d{{2}}-\d{{2}})\.json$")
    hits = sorted(p for p in paths if pat.match(p))
    return hits[-1] if hits else None


def load():
    if "--local" in sys.argv:
        base = pathlib.Path(sys.argv[sys.argv.index("--local") + 1]).resolve()
        paths = [p.relative_to(base).as_posix() for p in base.rglob("*.json")]
        read = lambda p, t=40, fatal=True: (base / p).read_text("utf-8")
    else:
        tree = json.loads(fetch(f"https://api.github.com/repos/{REPO}/git/trees/{BRANCH}?recursive=1"))
        paths = [t["path"] for t in tree["tree"]]
        read = lambda p, t=40, fatal=True: fetch(f"https://raw.githubusercontent.com/{REPO}/{BRANCH}/{p}", tries=3 if fatal else 2, timeout=t, fatal=fatal)
    c = latest(paths, "data", "contests")
    if not c:
        sys.exit("✗ 找不到赛事快照 data/contests_YYYY-MM-DD.json")
    f = latest(paths, "festivals", "festivals")
    # 历史快照（最多 45 份）：用来算「首次收录日」和「截止日调整」，读不到不影响主流程
    pat = re.compile(r"^data/contests_(\d{4}-\d{2}-\d{2})\.json$")
    hist, missing = [], []
    for p in sorted(p for p in paths if pat.match(p) and p != c)[-45:]:
        try:
            d = json.loads(read(p, 20, False))
            hist.append((d.get("snapshot_date") or pat.match(p).group(1), d.get("records") or []))
        except Exception as e:  # noqa: BLE001
            missing.append(pat.match(p).group(1))
            warn(f"历史快照读取失败，跳过：{p}（{e}）")
    return json.loads(read(c)), (json.loads(read(f)) if f else {"records": []}), hist, missing


def history(hist, cur_snap, cur_raw, missing=()):
    """按快照先后比对：首次出现的日期 = 上新日；截止日变化 = 调整记录。
    最早一份快照里已有的赛事视为「基线」，上新日记为空（不知道真实收录时间，不冒充新收录）。"""
    snaps = sorted(hist, key=lambda x: x[0]) + [(cur_snap, cur_raw)]
    missing = sorted(missing)
    first, by_name, last_dl, changes = {}, {}, {}, {}
    for i, (d, recs) in enumerate(snaps):
        # 与上一份成功读取的快照之间有读失败的快照：这批「首次出现」的真实日期可能更早，
        # 记为缺口里最早的那天，宁可显得旧一点，也不把前几天的赛事冒充成今天上新
        gap = [m for m in missing if (i and snaps[i - 1][0] < m < d) or (not i and m < d)]
        seen_at = gap[0] if gap else d
        for r in recs:
            rid, nm = s(r.get("record_id")), re.sub(r"\s+", "", s(r.get("名称")))
            if not rid:
                continue
            if rid not in first:
                first[rid] = by_name.get(nm, None if i == 0 else seen_at)  # 换了 ID 但同名，沿用原收录日
                by_name.setdefault(nm, first[rid])
            dl = s(r.get("截止日期")) or None
            if rid in last_dl and last_dl[rid] != dl:
                changes.setdefault(rid, []).append({"date": seen_at, "from": last_dl[rid], "to": dl})
            last_dl[rid] = dl
    return first, changes, (snaps[0][0] if len(snaps) > 1 else None)


def s(v):
    return re.sub(r"[ \t]+\n", "\n", str(v or "").replace("\r", "")).strip()


def clean_url(u, name, field):
    u = s(u)
    if not u:
        return ""
    if re.match(r"^[\w.+-]+@[\w-]+\.[\w.]+$", u):
        return "mailto:" + u
    m = re.search(r"[\w.+-]+@[\w-]+\.[\w.]+", u)
    if not re.match(r"^(https?://|mailto:)", u):
        if m:
            return "mailto:" + m.group(0)
        if re.match(r"^[\w-]+(\.[\w-]+)+(/|$)", u):
            return "https://" + u
        warn(f"{field}不是链接，已置空：{name} → {u[:40]}")
        return ""
    if any(a in u for a in AGGREGATORS):
        warn(f"{field}指向聚合站：{name}")
    return u


# 备注里的内部工作记录（采集来源、核对流程、录入规则）不给用户看，见 docs/03 §5
INTERNAL = re.compile(
    r"来源|源[:：]|入库|收录|聚合|第三方|aifilmcontests|aigcsubmission|toujiang|aitop100\.cn/infomation|"
    r"红线|用户澄清|按模型定|表内|底表|补录|重收|清理|官网填|填入|改为官方|置空|清空|维持|详情页\s*ID|"
    r"非第三方|不违规|投奖", re.I)
TAG = re.compile(r"【[^】]{0,40}】")


def public_notes(t):
    t = TAG.sub("", s(t))
    keep = []
    for seg in re.split(r"[；;｜|\n。]+", t):
        seg = seg.strip(" ，,。——-")
        if seg and not INTERNAL.search(seg) and not re.fullmatch(r"https?://\S+", seg):
            keep.append(seg)
    return "；".join(dict.fromkeys(keep))


def iso_date(v):
    try:
        return dt.date.fromisoformat(v)
    except ValueError:
        return None


def normalize(raw, overrides, today):
    out = []
    for r in raw:
        name, rid = s(r.get("名称")), s(r.get("record_id"))
        if not name or not rid:
            continue
        o = overrides.get(rid, {})
        for k, v in (o.get("fix") or {}).items():
            r[k] = v
        dl = s(r.get("截止日期"))
        if dl and not (re.match(r"^\d{4}-\d{2}-\d{2}$", dl) and iso_date(dl)):
            warn(f"截止日期格式异常，按待公布处理：{name} → {dl}")
            dl = ""
        grade = s(r.get("分级")).upper()
        if grade not in ("S", "A", "B", "C"):
            warn(f"分级异常，降为 C：{name} → {grade or '空'}")
            grade = "C"
        st = STATUS.get(s(r.get("征集状态")), "open")
        if dl and dt.date.fromisoformat(dl) < today and st in ("open", "soon"):
            st = "closed"
        if st == "open" and not dl:
            st = "pending"
        topic = s(r.get("命题"))
        if topic not in ("命题", "自由投稿"):
            topic = ""
        fee = re.sub(r"^[￥¥]0（免费）$", "免费", s(r.get("报名费")))
        fee = "免费" if fee in ("无", "0", "免费报名") else fee
        if not fee:
            fee = "未核实"; warn(f"报名费为空：{name}")
        fee = re.sub(r"第三方(数据|称)[：:]?", "未经官方确认：", fee).replace("：）", "）").replace("投奖价", "代投平台价")
        fee = re.sub(r"（[^）]*(?:聚合站|投奖)[^）]*）", "（投递前请到官网确认）", fee)
        prize_raw = s(r.get("最高奖金"))
        r["最高奖金"] = re.sub(r"[，,；;]?\s*各源口径不一", "，各渠道口径不一", prize_raw)
        prize = s(r.get("最高奖金")) or "官方未公布"
        site = clean_url(r.get("官网"), name, "官网")
        submit = clean_url(r.get("投递链接"), name, "投递链接") or site
        if not site and not submit:
            warn(f"官网与投递链接都为空：{name}")
        desc = re.sub(r"(^|\n)\s*来源[:：][^\n]*", "", s(r.get("赛事说明")))
        v = o.get("verify") or {}
        raw_notes = s(r.get("计划备注"))
        mark = "star" if "⭐" in raw_notes else "caution" if "⚠" in raw_notes else "note" if "🔍" in raw_notes else ""
        notes = public_notes(raw_notes)
        desc = public_notes(desc).replace("；", "\n") if INTERNAL.search(desc) else desc
        m_op = re.search(r"\d{4}-\d{2}-\d{2}", s(r.get("征片开始")))
        out.append({"id": rid, "name": name, "grade": grade, "deadline": dl or None, "status": st,
                    "organizer": s(r.get("主办方")), "region": s(r.get("地区")), "category": s(r.get("类别")), "topic": topic,
                    "fee": fee, "prize": prize, "site": site, "submit": submit, "desc": desc, "notes": notes, "mark": mark,
                    "verified": v.get("level") or "none", "verifyNote": public_notes(v.get("note")),
                    "opened": m_op.group(0) if m_op else None})
    return out


def validate(recs, raw_n):
    if not recs:
        sys.exit("✗ 赛事数据为空，已中止构建")
    if raw_n and (raw_n - len(recs)) / raw_n > 0.05:
        sys.exit(f"✗ {raw_n - len(recs)} 条记录缺少名称或标识（超过 5%），已中止构建")
    prev = PUB / "data" / "contests.json"
    if prev.exists() and "--force" not in sys.argv:
        try:
            pn = len(json.loads(prev.read_text("utf-8"))["contests"])
            if pn and len(recs) < pn * 0.7:
                sys.exit(f"✗ 赛事数从 {pn} 降到 {len(recs)}（减少超过 30%），已中止构建。确认无误可加 --force")
        except (KeyError, ValueError):
            pass


def festivals(raw):
    return [{"name": s(f.get("电影节")), "place": s(f.get("国家/城市")), "type": s(f.get("类别")), "when": s(f.get("每年举办时间")),
             "award": s(f.get("最高奖")), "latest": s(f.get("最新档期")), "note": s(f.get("备注"))} for f in raw if s(f.get("电影节"))]


def ics(recs, today):
    e = lambda t: re.sub(r"([\\;,])", r"\\\1", str(t or "")).replace("\n", "\\n")
    stamp = dt.datetime.now(dt.timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    L = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//AIContestAssistant//v6//ZH", "CALSCALE:GREGORIAN", "METHOD:PUBLISH",
         "X-WR-CALNAME:AI 赛事截止", "X-WR-TIMEZONE:Asia/Shanghai", "REFRESH-INTERVAL;VALUE=DURATION:PT12H"]
    for r in recs:
        if not r["deadline"] or r["status"] == "closed":
            continue
        d = dt.date.fromisoformat(r["deadline"])
        if d < today:
            continue
        u = r["submit"] or r["site"]
        L += ["BEGIN:VEVENT", f"UID:{r['id']}@aicontest", f"DTSTAMP:{stamp}", f"DTSTART;VALUE=DATE:{d:%Y%m%d}",
              f"DTEND;VALUE=DATE:{d + dt.timedelta(days=1):%Y%m%d}", f"SUMMARY:{e('【' + r['grade'] + '】截止 · ' + r['name'])}",
              f"DESCRIPTION:{e('最高奖励：' + r['prize'] + chr(10) + '报名费：' + r['fee'] + chr(10) + '投递：' + (u or '—'))}"]
        if u.startswith("http"):
            L.append("URL:" + u)
        L += ["BEGIN:VALARM", "TRIGGER:-P3D", "ACTION:DISPLAY", f"DESCRIPTION:{e('3 天后截止：' + r['name'])}", "END:VALARM", "END:VEVENT"]
    L.append("END:VCALENDAR")
    out = []
    for ln in L:
        b = ln.encode("utf-8")
        while len(b) > 75:
            cut = 75
            while cut > 0 and (b[cut] & 0xC0) == 0x80:
                cut -= 1
            out.append(b[:cut].decode("utf-8")); b = b" " + b[cut:]
        out.append(b.decode("utf-8"))
    return "\r\n".join(out) + "\r\n"


def rss(recs, snap):
    base = SITE_URL or "."
    pub = format_datetime(dt.datetime.combine(dt.date.fromisoformat(snap), dt.time(8), TZ))
    x = ['<?xml version="1.0" encoding="UTF-8"?>', '<rss version="2.0"><channel>', "<title>AI赛事助手 · 在征赛事</title>",
         f"<link>{escape(base)}/</link>", "<description>AI 视频与影像赛事，按截止日排序</description>", "<language>zh-cn</language>", f"<lastBuildDate>{pub}</lastBuildDate>"]
    for r in sorted((r for r in recs if r["status"] != "closed"), key=lambda r: (r.get("added") or "0000", r["deadline"] or "9999"), reverse=True):
        rp = format_datetime(dt.datetime.combine(dt.date.fromisoformat(r["added"]), dt.time(8), TZ)) if r.get("added") else pub
        d = f"最高奖励：{r['prize']}<br>报名费：{r['fee']}<br>主办方：{r['organizer'] or '—'}<br><br>{r['desc'].replace(chr(10), '<br>')}"
        x += ["<item>", f"<title>{escape('【' + r['grade'] + '】' + r['name'] + ' · ' + (r['deadline'] or '截止待公布'))}</title>",
              f"<link>{escape(base)}/#/c/{escape(r['id'])}</link>", f'<guid isPermaLink="false">{escape(r["id"])}</guid>',
              f"<pubDate>{rp}</pubDate>", f"<description>{escape(d)}</description>", "</item>"]
    return "\n".join(x + ["</channel></rss>"])


def main():
    craw, fraw, hist, missing = load()
    ovf = ROOT / "scripts" / "overrides.json"
    overrides = json.loads(ovf.read_text("utf-8")).get("records", {}) if ovf.exists() else {}
    today = dt.datetime.now(TZ).date()
    snap = s(craw.get("snapshot_date")) or today.isoformat()
    raw = craw.get("records") or []
    recs = normalize(raw, overrides, today)
    validate(recs, len(raw))
    first, changes, since = history(hist, snap, raw, missing)
    for r in recs:
        # 「上新」= 赛事自身开征时间（表内「征片开始」），不是我们首次把它收进表的日期。
        # 早就在征集、只是录入得晚的赛事，不应该被冒充成今天上新。
        r["tracked"] = first.get(r["id"])          # 内部保留：入表日期，供审计用，不参与前端展示
        r["added"] = r.get("opened") or None       # 对外：开征日；没有征片开始的赛事留空，不进上新
        r["changes"] = changes.get(r["id"], [])[-3:]
    data = {"snapshot": snap, "built": dt.datetime.now(TZ).strftime("%Y-%m-%d %H:%M"), "trackedSince": since,
            "siteUrl": SITE_URL or "https://yijueyijue.github.io/ai-film-contests-tracker",
            "contests": recs, "festivals": festivals(fraw.get("records") or [])}
    (PUB / "data").mkdir(parents=True, exist_ok=True)
    blob = json.dumps(data, ensure_ascii=False, separators=(",", ":")).replace("</", "<\\/")
    (PUB / "data" / "data.js").write_text(f"/* 自动生成，请勿手改 · {snap} */\nwindow.AIC={blob};\n", "utf-8")
    (PUB / "data" / "contests.json").write_text(json.dumps(data, ensure_ascii=False, indent=1), "utf-8")
    (PUB / "deadlines.ics").write_text(ics(recs, today), "utf-8", newline="")
    (PUB / "feed.xml").write_text(rss(recs, snap), "utf-8")
    st = Counter(r["status"] for r in recs); g = Counter(r["grade"] for r in recs)
    nd = Counter(r["added"] for r in recs if r["added"])
    tk = Counter(r["tracked"] for r in recs if r["tracked"])
    print(f"  新开征（按征片开始日，进「上新」）：" + "、".join(f"{k[5:]} +{v}" for k, v in sorted(nd.items())[-7:])
          + f" · 无征片开始 {sum(1 for r in recs if not r['added'])} 条（不参与上新）")
    print(f"  新入表（按快照比对，仅供审计）：" + "、".join(f"{k[5:]} +{v}" for k, v in sorted(tk.items())[-5:])
          + f" · 起点 {since} · 截止日调整 {sum(1 for r in recs if r['changes'])} 条")
    print(f"✓ 快照 {snap} · 赛事 {len(recs)}（在征 {st['open']} / 待公布 {st['pending']} / 即将开放 {st['soon']} / 已截止 {st['closed']}）· 分级 S{g['S']} A{g['A']} B{g['B']} C{g['C']} · 电影节 {len(data['festivals'])}")
    if warns:
        print(f"  告警 {len(warns)} 条：")
        for w in warns[:40]:
            print("   -", w)
        (ROOT / "build-warnings.txt").write_text("\n".join(warns), "utf-8")


if __name__ == "__main__":
    main()
