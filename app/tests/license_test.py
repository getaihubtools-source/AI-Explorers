# تست کامل فعال‌سازی امضاشده: کلیدساز → نسخهٔ فروش → صدور کد → فعال‌سازی روی همان دستگاه و رد شدن روی دستگاه دیگر
import sys, pathlib
from playwright.sync_api import sync_playwright
BASE = "http://localhost:8765"; ROOT = pathlib.Path(__file__).resolve().parent.parent
res = []
def check(n, c, i=""): res.append(bool(c)); print(("PASS " if c else "FAIL ") + n + ("" if c else " — %s" % (i,)))
with sync_playwright() as p:
    b = p.chromium.launch()
    kc = b.new_context(accept_downloads=True); kg = kc.new_page(); kg.on("dialog", lambda d: d.accept())
    kg.goto("file:///home/claude/v2/seller-tools/AIhub-AI-Explorers-Keygen.html")
    kg.fill("#kpass", "pass-1234567"); kg.fill("#kpass2", "pass-1234567")
    with kg.expect_download(): kg.click("#gen")
    with kg.expect_download() as dl: kg.set_input_files("#appfile", str(ROOT / "js/core/license.js"))
    built = pathlib.Path("/tmp/built_license.js"); dl.value.save_as(str(built))
    check("نسخهٔ فروش کلید عمومی دارد", 'LICENSE_PUBKEY = "{' in built.read_text())
    def newapp(ctx):
        pg = ctx.new_page()
        pg.route("**/js/core/license.js", lambda r: r.fulfill(path=str(built), content_type="application/javascript"))
        pg.route("**/js/config.js", lambda r: r.fulfill(body="window.AIX_CONFIG={activation:true};", content_type="application/javascript"))
        return pg
    ctx = b.new_context(); pg = newapp(ctx); pg.goto(BASE + "/app/index.html#/map"); pg.wait_for_selector("main")
    pg.evaluate("location.hash='#/lesson/c1d2'"); pg.wait_for_timeout(300)
    check("بدون کد: درس دوم قفل است", pg.evaluate("AIX.license.locked()") and "فعال" in pg.inner_text("main"))
    dev = pg.evaluate("AIX.license.deviceCode()")
    def issue(devcode, name="والد تست"):
        kg.fill("#buyer", name); kg.fill("#vdev", devcode); kg.fill("#kpass", "pass-1234567"); kg.click("#unlock"); kg.wait_for_timeout(500)
        kg.click("#issue"); kg.wait_for_timeout(500); return kg.input_value("#out")
    code = issue(dev)
    check("کدی با پیشوند AIX1 صادر شد", code.startswith("AIX1."), code[:20])
    pg.evaluate("location.hash='#/activate'"); pg.wait_for_selector("#akey")
    pg.fill("#akey", code[:-3] + "AAA"); pg.click("button:has-text('فعال‌سازی')"); pg.wait_for_timeout(400)
    check("کد دستکاری‌شده رد می‌شود", pg.evaluate("AIX.license.locked()"))
    pg.fill("#akey", code); pg.click("button:has-text('فعال‌سازی')"); pg.wait_for_timeout(600)
    check("کد درست همان دستگاه فعال می‌کند", not pg.evaluate("AIX.license.locked()"))
    pg.evaluate("location.hash='#/lesson/c1d2'"); pg.wait_for_timeout(300)
    check("بعد از فعال‌سازی درس دوم باز است", "این بخش با کد" not in pg.inner_text("main"))
    pg.reload(); pg.wait_for_selector("main"); pg.wait_for_timeout(500)
    check("بعد از بارگذاری دوباره هم فعال می‌ماند", not pg.evaluate("AIX.license.locked()"))
    ctx2 = b.new_context(); pg2 = newapp(ctx2); pg2.goto(BASE + "/app/index.html#/activate"); pg2.wait_for_selector("#akey")
    pg2.fill("#akey", code); pg2.click("button:has-text('فعال‌سازی')"); pg2.wait_for_timeout(500)
    check("همان کد روی دستگاه دیگر رد می‌شود", pg2.evaluate("AIX.license.locked()") and "دستگاه دیگری" in pg2.inner_text("#amsg"), pg2.inner_text("#amsg"))
    d2 = pg2.evaluate("AIX.license.deviceCode()"); code2 = issue(d2)
    pg2.fill("#akey", code2); pg2.click("button:has-text('فعال‌سازی')"); pg2.wait_for_timeout(500)
    check("دستگاه دوم با کد خودش فعال می‌شود", not pg2.evaluate("AIX.license.locked()"))
    # سقف ۳ دستگاه سمت کلیدساز
    issue("AAAA2222"); issue("BBBB3333"); kg.fill("#buyer", "والد تست"); kg.fill("#vdev", "CCCC4444"); kg.click("#issue"); kg.wait_for_timeout(300)
    check("کلیدساز سقف ۳ دستگاه را هشدار می‌دهد", "۳ دستگاه" in kg.inner_text("#dsum"), kg.inner_text("#dsum"))
    b.close()
print("جمع: %d، موفق: %d" % (len(res), sum(res))); sys.exit(0 if all(res) else 1)
