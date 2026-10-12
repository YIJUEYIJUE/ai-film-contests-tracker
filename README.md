# AI赛事助手 v6（全新重写）

只做一件事：把 AI 视频 / 影像赛事收成一张随时可查的表，告诉你哪些现在能投、什么时候截止。

- 不含作品库、投递看板、信源页，也不显示任何「数据来源」。
- 需求、设计、数据三份文档在 `docs/`。以后任何改动先改文档，再按文档改代码。

## 目录
```
docs/
  01-功能文档.md     页面、功能、交互、验收清单（唯一需求来源）
  02-设计规范.md     颜色、字体、间距、组件、断点、动效
  03-数据规范.md     字段取值、核实状态、构建校验规则
public/              网站本体（直接部署这个文件夹）
  index.html  assets/app.js  assets/styles.css
  data/data.js  data/contests.json  deadlines.ics  feed.xml
scripts/
  build.py           读取赛事快照 → 清洗校验 → 生成 public/ 里的数据
  overrides.json     官网核对后的修正与核实状态
tests/e2e.py         真实浏览器交互测试（52 项）
.github/workflows/deploy.yml  每天自动更新并发布
```

## 本地打开
```bash
python3 -m http.server -d public 8080
# 浏览器打开 http://localhost:8080
```

## 更新数据
```bash
python3 scripts/build.py                  # 从 GitHub 读最新快照
python3 scripts/build.py --local 某目录    # 读本地 data/ festivals/
```
构建会先检查数据：赛事数为 0、比上一版少三成以上，或缺名称的记录超过 5%，都会直接停下，不覆盖网站。其他问题（比如链接指向聚合站、日期格式不对）会写进 `build-warnings.txt`。

## 部署（GitHub Pages，每天自动更新）
1. 把整个文件夹推到 GitHub 仓库。
2. 仓库 Settings → Pages → Source 选 **GitHub Actions**。
3. Actions 里手动运行一次 `deploy`，之后每天北京时间 08:05 自动更新。
