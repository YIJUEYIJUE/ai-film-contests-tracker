# 真实浏览器交互测试：pip install playwright && playwright install chromium && python3 tests/e2e.py
import sys,os,threading,http.server,socketserver,functools,re
from playwright.sync_api import sync_playwright
PUB=os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','public')
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a):pass
srv=socketserver.TCPServer(("127.0.0.1",0),functools.partial(Q,directory=PUB));port=srv.server_address[1]
threading.Thread(target=srv.serve_forever,daemon=True).start()
U=f'http://127.0.0.1:{port}/'
res=[];errs=[]
def ok(c,m): res.append(('✓' if c else '✗')+' '+m)
with sync_playwright() as p:
    b=p.chromium.launch(args=['--no-sandbox'])
    ctx=b.new_context(viewport={'width':1440,'height':900}); pg=ctx.new_page()
    pg.on('pageerror',lambda e:errs.append(str(e))); pg.on('console',lambda m:m.type=='error' and errs.append(m.text))
    pg.goto(U,wait_until='networkidle'); pg.wait_for_timeout(700)
    html=pg.content()
    ok(not re.search(r'我的影片|投递看板|作品库|信源|来源[:：]|数据来源|toujiang|aitop100|飞书多维', pg.inner_text('body')),'全站无作品库/信源/数据来源字样（首页）')
    ok(pg.locator('.lead').count()==1 and pg.locator('.kpi').count()==4 and pg.locator('.fi').count()>3,'首页：热榜 + 4 个数字 + 时间线卡片')
    ok(pg.locator('.tl .dcol').count()==14,'首页：14 天时间轴')
    pg.goto(U+'#/contests?q=魁北克&when=all',wait_until='networkidle'); pg.wait_for_timeout(400); ok(pg.evaluate("[...document.querySelectorAll('#rows > *')].filter(r=>/魁北克城/.test(r.innerText)).every(r=>!r.querySelector('.tag.cash'))"),'「无现金奖」不会被标成现金奖')
    pg.goto(U+'#/contests?q=鲸锐&when=all',wait_until='networkidle'); pg.wait_for_timeout(400); ok('总池' in pg.inner_text('#rows'),'总奖池标注口径')
    pg.goto(U,wait_until='networkidle'); pg.wait_for_timeout(300)
    ok(re.search(r'\d',pg.inner_text('#clock') or '') is not None,'倒计时在走')
    pg.locator('.dcol').nth(3).click(); pg.wait_for_timeout(300); ok('day=' in pg.url,'点时间轴某天展开')
    # 全部赛事
    pg.goto(U+'#/contests',wait_until='networkidle'); pg.wait_for_selector('#rows > *'); n0=pg.locator('#rows > *').count(); ok(n0>50,f'全部赛事 {n0} 条（在征）')
    pg.click('[data-f="fee"][data-v="free"]'); pg.wait_for_timeout(300); n1=pg.locator('#rows > *').count(); ok(0<n1<n0,f'免费筛选 {n0}→{n1}')
    pg.click('.af button'); pg.wait_for_timeout(300); ok(pg.locator('#rows > *').count()==n0,'移除已选条件')
    pg.fill('#fq','厦门'); pg.wait_for_timeout(600); ok(pg.evaluate("document.activeElement.id")=='fq','搜索时不丢焦点'); k=pg.locator('#rows > *').count(); ok(k>=1,f'搜索厦门 {k} 条')
    ok(pg.locator('mark.hl').count()>=1,'搜索词高亮')
    pg.click('[data-act="clearq"]'); pg.wait_for_timeout(400); ok(pg.input_value('#fq')=='','清空搜索')
    pg.goto(U+'#/contests?grade=S&fee=free&form=MV&region=cn',wait_until='networkidle'); pg.wait_for_timeout(300); ok(pg.locator('.empty').count()==1,'无结果空状态')
    pg.goto(U+'#/contests?when=all',wait_until='networkidle'); pg.wait_for_timeout(300); ok(pg.locator('#rows > *').count()==115,'含已截止共 115 条')
    pg.click('[data-view="grid"]'); pg.wait_for_timeout(300); ok(pg.locator('#rows .card').count()==115,'切换卡片视图')
    pg.click('[data-view="list"]'); pg.wait_for_timeout(300)
    # 全部 115 条详情能打开且关键字段非空
    bad=pg.evaluate("""(()=>{const out=[];for(const c of window.AIC.contests){if(!c.name||!c.grade||!c.prize||!c.fee)out.push(c.name);}return out})()""")
    ok(not bad,f'115 条关键字段齐全 {bad[:3]}')
    pg.goto(U+'#/contests',wait_until='networkidle'); pg.wait_for_selector('#rows > *')
    pg.locator('#rows > *').first.click(); pg.wait_for_timeout(600); ok(pg.is_visible('#drawer.on'),'点击打开详情')
    ok(pg.evaluate("document.querySelector('#view').inert")==True,'详情打开时背景不可点')
    t1=pg.inner_text('#drawer h2'); pg.keyboard.press('ArrowDown'); pg.wait_for_timeout(250); ok(pg.inner_text('#drawer h2')!=t1,'键盘切换下一个')
    pg.click('#drawer [data-fav]'); pg.wait_for_timeout(300); ok('已收藏' in pg.inner_text('#drawer'),'详情里收藏')
    pg.click('.toast button'); pg.wait_for_timeout(300); ok('已收藏' not in pg.inner_text('#drawer .dr-head'),'撤销收藏')
    pg.keyboard.press('Escape'); pg.wait_for_timeout(500); ok(not pg.is_visible('#drawer.on') and '#/contests' in pg.url,'Esc 关闭并回到列表')
    ok(pg.evaluate("document.activeElement && document.activeElement.matches('[data-open]')"),'关闭后焦点回到原赛事')
    # 遍历所有赛事详情无报错
    ids=pg.evaluate("window.AIC.contests.map(c=>c.id)")
    BAN=r'来源|第三方|聚合站|aifilmcontests|aigcsubmission|toujiang|投奖|飞书多维|红线|入库'; leak=[]
    for i in ids:
        pg.evaluate(f"location.hash='#/c/{i}'"); pg.wait_for_timeout(25)
        if re.search(BAN, pg.inner_text('#drawer')+' '.join(pg.eval_on_selector_all('#drawer a','e=>e.filter(a=>!/投递|投稿/.test(a.innerText)).map(a=>a.href)'))): leak.append(i)
    pg.wait_for_timeout(300); ok(not errs,f'逐个打开 {len(ids)} 个详情无报错')
    ok(not leak,f'详情页无采集来源/内部流程字样 {leak[:3]}')
    pg.keyboard.press('Escape'); pg.wait_for_timeout(300)
    pg.goto(U+'#/c/notexist',wait_until='networkidle'); pg.wait_for_timeout(400); ok(not pg.is_visible('#drawer.on'),'错误链接不会卡住')
    # 搜索面板
    pg.goto(U+'#/home',wait_until='networkidle'); pg.wait_for_timeout(300)
    pg.keyboard.press('Control+k'); pg.wait_for_timeout(200); pg.keyboard.type('金鸡'); pg.wait_for_timeout(250); pg.keyboard.press('Enter'); pg.wait_for_timeout(600)
    ok('金鸡' in pg.inner_text('#drawer h2'),'⌘K 搜索并打开'); pg.keyboard.press('Escape'); pg.wait_for_timeout(400)
    # 日历 / 洞察 / 简报 / 电影节 / 关于
    pg.goto(U+'#/calendar',wait_until='networkidle'); pg.wait_for_timeout(300); ok(pg.locator('.cell').count()>=28,'日历月视图')
    m0=pg.inner_text('.cal-head h1'); pg.click('[data-cal="1"]'); pg.wait_for_timeout(300); ok(pg.inner_text('.cal-head h1')!=m0,'日历翻月')
    with pg.expect_download() as d: pg.click('[data-act="ics"]')
    ok(d.value.suggested_filename.endswith('.ics'),'导出日历文件')
    pg.goto(U+'#/insights',wait_until='networkidle'); pg.wait_for_timeout(300); ok(pg.locator('.vb').count()==8 and pg.locator('.donut').count()==1,'数据洞察图表')
    pg.goto(U+'#/brief',wait_until='networkidle'); pg.wait_for_timeout(300); ok(pg.locator('.p-sec').count()==5,'简报 5 个分栏')
    pg.context.grant_permissions(['clipboard-read','clipboard-write']); pg.click('[data-act="copybrief"]'); pg.wait_for_timeout(300); ok('AI 赛事日报' in pg.evaluate("navigator.clipboard.readText()"),'复制简报')
    pg.goto(U+'#/festivals',wait_until='networkidle'); pg.wait_for_timeout(300); ok(pg.locator('.fest').count()==24,'24 个电影节')
    pg.goto(U+'#/about',wait_until='networkidle'); pg.wait_for_timeout(300); ok(pg.locator('.gcard').count()==4,'分级说明')
    for h in ['contests','calendar','insights','brief','festivals','about']:
        pg.goto(U+'#/'+h,wait_until='networkidle'); pg.wait_for_timeout(200)
        if re.search(r'我的影片|投递看板|作品库|信源|数据来源|toujiang|aitop100', pg.inner_text('body')): ok(False,f'{h} 出现不该有的字样')
    ok(True,'各页无作品库/信源/数据来源字样')
    pg.click('[data-act="theme"]'); ok(pg.evaluate("document.documentElement.dataset.theme")=='dark','切换深色')
    ctx.close()
    # 手机
    ctx=b.new_context(viewport={'width':390,'height':844},is_mobile=True,has_touch=True,device_scale_factor=2); pg=ctx.new_page(); pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto(U+'#/contests',wait_until='networkidle'); pg.wait_for_timeout(500)
    ok(not pg.is_visible('.f-body'),'手机筛选默认收起'); pg.tap('[data-act="ftoggle"]'); pg.wait_for_timeout(300); ok(pg.is_visible('.f-body'),'点开筛选')
    pg.tap('[data-f="when"][data-v="7"]'); pg.wait_for_timeout(400); ok(pg.is_visible('.f-body'),'选条件后筛选面板保持展开')
    pg.tap('.f-done'); pg.wait_for_timeout(500); ok(not pg.is_visible('.f-body'),'点「查看结果」收起筛选')
    pg.locator('#rows > *').first.tap(timeout=5000); pg.wait_for_timeout(700); ok(pg.is_visible('#drawer.on'),'手机打开详情')
    pg.tap('#drawer [data-act="closeDrawer"]'); pg.wait_for_timeout(600); ok(not pg.is_visible('#drawer.on'),'手机关闭详情')
    for h in ['home','contests','calendar','insights','brief','festivals','about']:
        pg.goto(U+'#/'+h,wait_until='networkidle'); pg.wait_for_timeout(250)
        ok(pg.evaluate("document.documentElement.scrollWidth<=innerWidth+1"),f'手机 {h} 无横向溢出')
    ctx.close(); b.close()
print('\n'.join(res)); print(f"通过 {sum(r[0]=='✓' for r in res)}/{len(res)}"); print('JS 错误:', errs[:5] or '无')
