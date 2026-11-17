# تست‌های سخت‌سازی پیش از APK: ذخیره هنگام خروج، داده خراب، بازیابی نامعتبر، آفلاین، کش SW، یادآوری پشتیبان، خطاگیر
import sys, tempfile, shutil
from playwright.sync_api import sync_playwright
B = "http://localhost:8765"; res = []
def check(n, c, i=""): res.append(bool(c)); print(("PASS " if c else "FAIL ") + n + ("" if c else " — %s" % (i,)))
def cfg(pg): pg.route("**/js/config.js", lambda r: r.fulfill(body="window.AIX_CONFIG={activation:false};", content_type="application/javascript"))
with sync_playwright() as p:
    br = p.chromium.launch()
    # ذخیره هنگام رفتن به پس‌زمینه
    d = tempfile.mkdtemp(); c = p.chromium.launch_persistent_context(d); pg = c.pages[0]; cfg(pg); pg.goto(B + "/app/")
    pg.evaluate("AIX.store.get().xp=77; AIX.store.save(); window.dispatchEvent(new Event('pagehide'))"); c.close()
    c = p.chromium.launch_persistent_context(d); pg = c.pages[0]; cfg(pg); pg.goto(B + "/app/")
    check("امتیاز لحظهٔ آخر هنگام pagehide ذخیره می‌شود", pg.evaluate("AIX.store.get().xp") == 77); c.close(); shutil.rmtree(d)
    # داده خراب
    c = br.new_context(); pg = c.new_page(); cfg(pg); errs = []; pg.on("pageerror", lambda e: errs.append(str(e)))
    pg.goto(B + "/app/"); pg.evaluate("localStorage.setItem('aihub-ai-explorers:v1','{bad json'); AIX.store.load(); AIX.store.get().xp=5; AIX.store.save(true)")
    check("نسخهٔ خراب قبل از بازنویسی نگه داشته می‌شود", pg.evaluate("localStorage.getItem('aihub-ai-explorers:v1:corrupt')") == "{bad json")
    pg.evaluate("location.hash='#/settings'"); pg.wait_for_timeout(300); check("تنظیمات: هشدار داده خراب", "خراب بود" in pg.inner_text("main"))
    # بازیابی نامعتبر نباید بشکند
    bad = [{"xp":10,"days":{"c1d1":"x"},"notes":{},"profile":{}}, {"xp":10,"days":{"c1d1":{"quiz":5,"done":"yes"}},"notes":{"a":5},"profile":{"fontScale":99999,"nick":123}}, {"xp":10,"days":{"__proto__":{"x":1}},"notes":{},"profile":{},"badges":[1],"projects":{"1":3}}]
    for i, data in enumerate(bad):
        pg.goto(B + "/app/"); errs.clear()
        r = pg.evaluate("t=>AIX.store.importJSON(JSON.stringify({app:'aihub-ai-explorers',data:t}))", data)
        for h in ["#/map", "#/lesson/c1d1", "#/achievements", "#/settings", "#/"]: pg.evaluate("h=>location.hash=h", h); pg.wait_for_timeout(120)
        check("بازیابی نامعتبر %d بدون خطا" % (i + 1), r.get("ok") and not errs, errs[:1])
    fs = pg.evaluate("AIX.store.get().profile.fontScale"); check("اندازهٔ نوشته محدود می‌شود", fs <= 1.3, fs)
    check("آلودگی prototype نیست", pg.evaluate("({}).x") is None)
    # یادآوری پشتیبان
    pg.goto(B + "/app/"); pg.evaluate("AIX.store.reset(); AIX.store.get().xp=100; AIX.store.save(true)"); pg.evaluate("location.hash='#/'"); pg.wait_for_timeout(300)
    check("یادآوری پشتیبان با امتیاز کافی", pg.locator(".backup-due").count() == 1)
    pg.evaluate("AIX.store.markBackup()"); pg.evaluate("AIX.router.render()"); check("بعد از پشتیبان یادآوری برداشته می‌شود", pg.locator(".backup-due").count() == 0)
    # خطای رندر → صفحهٔ جایگزین
    pg.evaluate("(()=>{AIX.views.map = function(){ throw new Error('x') }})()"); pg.evaluate("location.hash='#/map'"); pg.wait_for_timeout(300)
    check("خطای رندر: صفحهٔ بازگشت به خانه", "مشکل پیش آمد" in pg.inner_text("main") and pg.locator("main a[href='#/']").count() >= 1)
    c.close()
    # آفلاین + کش SW
    c = br.new_context(); pg = c.new_page(); pg.goto(B + "/app/"); pg.wait_for_timeout(1500); pg.reload(); pg.wait_for_timeout(1000)
    n = pg.evaluate("caches.keys().then(k=>k.length?caches.open(k[0]).then(c=>c.keys()).then(x=>[k[0],x.length]):[null,0])")
    check("همهٔ فایل‌ها در کش (نسخهٔ ۱۷، ۴۵ فایل)", n == ["aix-v17", 45], n)
    pg.evaluate("fetch('/app/nope-404.js?x=1').catch(()=>0)"); pg.wait_for_timeout(500)
    hit = pg.evaluate("caches.open('aix-v17').then(c=>c.match('/app/nope-404.js?x=1')).then(r=>!!r)"); check("پاسخ ۴۰۴ در کش نمی‌ماند", not hit)
    c.set_offline(True); pg.reload(); pg.wait_for_selector(".topbar", timeout=8000); pg.evaluate("location.hash='#/labs'"); pg.wait_for_timeout(400)
    check("آفلاین: برنامه و آزمایشگاه‌ها بالا می‌آیند", pg.locator(".topbar").count() == 1 and "آزمایشگاه" in pg.inner_text("main"))
    pg2 = c.new_page(); pg2.goto(B + "/app/?utm_source=twa"); pg2.wait_for_selector(".topbar", timeout=8000); check("آفلاین با query (راه‌اندازی TWA) باز می‌شود", pg2.locator(".topbar").count() == 1)
    c.close()
    # سرعت
    c = br.new_context(viewport={"width": 390, "height": 844}); pg = c.new_page(); cfg(pg)
    pg.add_init_script("window.__cls=0;new PerformanceObserver(l=>{for(const e of l.getEntries())if(!e.hadRecentInput)window.__cls+=e.value}).observe({type:'layout-shift',buffered:true})")
    pg.goto(B + "/app/"); pg.wait_for_timeout(1500); cls = pg.evaluate("window.__cls"); print("CLS:", cls)
    check("CLS زیر ۰٫۱", cls < 0.1, cls); check("اسکریپت مسدودکننده نیست", pg.evaluate("[...document.scripts].filter(s=>s.src&&!s.defer&&!s.async).length") == 0)
    br.close()
print("جمع: %d، موفق: %d" % (len(res), sum(res))); sys.exit(0 if all(res) else 1)
