# تست خودکار (Playwright): python3 tests/smoke_test.py  — اول سرور محلی را اجرا کن: python3 -m http.server 8765
import pathlib, json, sys, re, pathlib, time
from playwright.sync_api import sync_playwright
BASE = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:8765/app/"
OUT = pathlib.Path(__file__).resolve().parent / "out"; OUT.mkdir(exist_ok=True)
results = []
def P_done(pg, k): return bool(pg.evaluate("AIX.progress.labDone('%s')" % k))

def check(name, cond, info=""):
    results.append((name, bool(cond), info)); print(("PASS " if cond else "FAIL ") + name + (" — " + str(info) if info and not cond else ""))

def state(pg): return pg.evaluate("AIX.store.get()")
def goto(pg, h): pg.evaluate("h => { location.hash = h }", h); pg.wait_for_timeout(120)

with sync_playwright() as p:
    b = p.chromium.launch(); ctx = b.new_context(viewport={"width": 1280, "height": 800}, accept_downloads=True); pg = ctx.new_page()
    ctx.route("**/js/config.js", lambda r: r.fulfill(body="window.AIX_CONFIG={activation:false};", content_type="application/javascript"))
    errors = []
    pg.on("console", lambda m: errors.append(m.text) if m.type == "error" else None); pg.on("pageerror", lambda e: errors.append(str(e)))
    pg.goto(BASE); pg.wait_for_selector(".hero")
    check("خانه بارگذاری شد", pg.locator(".hero h1").count() == 1)
    check("هفت فصل و کارت ایستگاه خانواده نمایش داده می‌شود", pg.locator(".chap:not(.family-card)").count() == 7 and pg.locator(".family-card").count() == 1)
    check("فصل ۲ در ابتدا بسته است", pg.locator(".chap:not(.family-card)").nth(1).get_attribute("class").find("locked") >= 0)
    check("جهت RTL و زبان فارسی", pg.evaluate("document.documentElement.dir") == "rtl" and pg.evaluate("document.documentElement.lang") == "fa")

    # ---- بازشدن مراحل ----
    goto(pg, "#/lesson/c1d2"); pg.wait_for_selector(".card.center")
    check("روز دوم قبل از روز اول بسته است", "هنوز بسته" in pg.inner_text("main"))

    # ---- روز اول: درس ← آزمون ← چالش ----
    goto(pg, "#/lesson/c1d1"); pg.wait_for_selector(".lesson-body .content")
    check("محتوای درس نمایش داده می‌شود", pg.locator(".lesson-body .card").count() >= 3)
    xp0 = state(pg)["xp"]
    pg.click("button:has-text(\"درس را خواندم\")"); pg.wait_for_timeout(250)
    check("خواندن درس ۱۰ امتیاز داد", state(pg)["xp"] == xp0 + 10, state(pg)["xp"])
    # آزمون: اول پاسخ‌های غلط
    goto(pg, "#/lesson/c1d1/quiz"); pg.wait_for_selector(".q")
    qs = pg.evaluate("AIX.quizzes.c1d1")
    def answer(correct):
        for i in range(pg.locator(".q").count()):
            box = pg.locator(".q").nth(i); legend = box.locator("legend").inner_text(); text = re.sub(r"^[^\.]*\.\s*", "", legend).strip()
            q = [x for x in qs if x["q"] == text][0]
            opts = box.locator(".opt")
            for j in range(opts.count()):
                t = opts.nth(j).inner_text().strip()
                if (t == q["ok"]) == correct: opts.nth(j).click(); break
        pg.click("text=بررسی پاسخ‌ها"); pg.wait_for_selector(".quiz-result.show")
    answer(False)
    check("آزمون با پاسخ غلط رد شد", "نزدیک بود" in pg.inner_text(".quiz-result") and state(pg)["days"]["c1d1"]["quiz"]["best"] == 0)
    check("روز با آزمون ناموفق کامل نشد", not state(pg)["days"]["c1d1"]["done"])
    pg.click("text=تلاش دوباره"); pg.wait_for_selector(".q"); answer(True)
    d = state(pg)["days"]["c1d1"]
    check("آزمون با پاسخ درست قبول شد و ۳۰ امتیاز داد", d["quiz"]["best"] == 3 and state(pg)["awards"]["quiz:c1d1"] == 30, d["quiz"])
    check("ثبت تلاش‌ها", d["quiz"]["attempts"] == 2 and d["quiz"]["perfectFirst"] is False)
    # چالش کوتاه نباید ثبت شود
    goto(pg, "#/lesson/c1d1/challenge"); pg.wait_for_selector(".chall textarea")
    pg.fill(".chall textarea", "کوتاه"); pg.click("text=ثبت پاسخ چالش"); pg.wait_for_timeout(100)
    check("پاسخ کوتاه چالش رد شد", not state(pg)["days"]["c1d1"]["chDone"].get("1") and "کوتاه" in pg.inner_text(".form-msg.show"))
    pg.click(".tab[data-l='2']"); pg.fill(".chall textarea", "یک نمونه که انسان و هوش مصنوعی در کنار هم بهتر عمل می‌کنند: مسیریابی و راننده."); pg.click("text=ثبت پاسخ چالش"); pg.wait_for_timeout(500)
    d = state(pg)["days"]["c1d1"]
    check("چالش سطح ۲ ثبت و ۲۵ امتیاز داده شد", d["chDone"].get("2") and state(pg)["awards"]["ch:c1d1:2"] == 25)
    check("روز اول کامل شد (درس+آزمون+چالش)", d["done"] and state(pg)["awards"]["day:c1d1"] == 20)
    check("پنجرهٔ تبریک نمایش داده شد", pg.locator("#modal .modal-box").count() == 1)
    pg.keyboard.press("Escape"); pg.wait_for_timeout(100)
    check("پنجرهٔ تبریک با Escape بسته شد", pg.locator("#modal").get_attribute("hidden") is not None)
    # ثبت دوباره همان چالش امتیاز تکراری ندهد
    xp1 = state(pg)["xp"]; goto(pg, "#/lesson/c1d1/challenge"); pg.wait_for_selector(".chall textarea"); pg.click(".tab[data-l='2']")
    pg.fill(".chall textarea", "ویرایش جدید برای همین چالش که طولانی است و دوباره ثبت می‌شود."); pg.click("text=ذخیرهٔ ویرایش"); pg.wait_for_timeout(100)
    check("ثبت دوبارهٔ چالش امتیاز تکراری نداد", state(pg)["xp"] == xp1)
    goto(pg, "#/lesson/c1d2"); pg.wait_for_timeout(150)
    check("بعد از روز اول، روز دوم باز شد", pg.locator(".lesson-body .card").count() >= 1 and "هنوز بسته" not in pg.inner_text("main"))

    # ---- ذخیره و بازیابی با بارگذاری دوباره ----
    pg.reload(); pg.wait_for_selector("#app > *")
    check("پیشرفت بعد از بارگذاری دوباره مانده است", state(pg)["days"]["c1d1"]["done"] and state(pg)["xp"] == 85, state(pg)["xp"])

    # ---- پشتیبان‌گیری و بازیابی ----
    backup = pg.evaluate("AIX.store.exportJSON()"); data = json.loads(backup)
    check("فایل پشتیبان ساختار درست دارد", data["app"] == "aihub-ai-explorers" and data["data"]["xp"] == state(pg)["xp"])
    res_bad = pg.evaluate("t => AIX.store.importJSON(t)", "{خراب")
    res_bad2 = pg.evaluate("t => AIX.store.importJSON(t)", json.dumps({"app": "x", "data": {}}))
    res_bad3 = pg.evaluate("t => AIX.store.importJSON(t)", json.dumps({"app": "aihub-ai-explorers", "data": {"xp": -5, "days": {}, "notes": {}, "profile": {}}}))
    check("بازیابی فایل خراب یا نامعتبر رد می‌شود", not res_bad["ok"] and not res_bad2["ok"] and not res_bad3["ok"])
    xpb = state(pg)["xp"]; pg.evaluate("AIX.store.reset()")
    check("پاک کردن پیشرفت کار می‌کند", state(pg)["xp"] == 0 and not state(pg)["days"])
    ok = pg.evaluate("t => AIX.store.importJSON(t)", backup)
    check("بازیابی پشتیبان سالم موفق است", ok["ok"] and state(pg)["xp"] == xpb and state(pg)["days"]["c1d1"]["done"])
    # بازیابی از طریق صفحهٔ تنظیمات (انتخاب فایل)
    (OUT / "backup.json").write_text(backup, encoding="utf-8"); goto(pg, "#/settings"); pg.wait_for_selector("#restore-file")
    pg.evaluate("AIX.store.reset()")
    pg.once("dialog", lambda d_: d_.accept()); pg.set_input_files("#restore-file", str(OUT / "backup.json")); pg.wait_for_timeout(400)
    check("بازیابی از فایل در تنظیمات", state(pg)["xp"] == xpb)
    with pg.expect_download() as dl: pg.click("text=دانلود پشتیبان")
    check("دانلود پشتیبان انجام شد", dl.value.suggested_filename.startswith("aihub-explorers-backup-"))

    # ---- حالت آزاد، همهٔ درس‌ها و مرحله‌ها بدون خطا ----
    pg.evaluate("AIX.store.get().profile.open = true; AIX.store.save(true)")
    ids = pg.evaluate("AIX.progress.course().reduce((a,c)=>a.concat(c.lessons.map(l=>l.id)),[])")
    check("۴۲ درس بارگذاری شد", len(ids) == 42, len(ids))
    bad = []
    for lid in ids:
        info = pg.evaluate("id => { const i = AIX.progress.lesson(id); const L=i.lesson.data; return {q: AIX.progress.quizFor(id).length, ch: L.challenges.length, rf: L.reflect.length, pg: L.progress.length, secs: L.sections.length, act: !!AIX.progress.activityFor(id)} }", lid)
        if info["q"] < 3 or info["ch"] < 3 or info["rf"] < 1 or info["pg"] < 1 or info["secs"] < 2: bad.append((lid, info))
        steps = ["learn", "explore", "practice", "quiz", "challenge", "reflect"] + (["activity"] if info["act"] else [])
        for st in steps:
            goto(pg, "#/lesson/%s/%s" % (lid, st)); 
            if pg.locator(".lesson-body").count() == 0 or len(pg.inner_text(".lesson-body").strip()) < 20: bad.append((lid, st, "خالی"))
    check("همهٔ درس‌ها سؤال، چالش سه‌سطحی، بازتاب و پیشرفت دارند", not bad, bad[:3])
    check("بدون خطای کنسول تا اینجا", not errors, errors[:3])

    # ---- تمرین‌های تعاملی ----
    def run_classify(lid):
        goto(pg, "#/lesson/%s/activity" % lid); pg.wait_for_selector(".act"); a = pg.evaluate("id => AIX.activities[id]", lid)
        cats = {c["id"]: c["label"] for c in a["cats"]}
        for rd_i, rd in enumerate(a["rounds"]):
            pg.wait_for_selector(".cls-item")
            for _ in range(len(rd["items"])):
                items = pg.locator(".cls-item:not([data-done])")
                it = items.first; txt = it.locator(".cls-text").inner_text().strip(); item = [x for x in rd["items"] if x["t"] == txt][0]
                it.locator(".opt", has_text=cats[item["c"]]).first.click()
            pg.click(".act .btn.primary")
        pg.wait_for_selector(".quiz-result.show"); return pg.inner_text(".quiz-result")
    t = run_classify("c1d3"); check("تمرین دسته‌بندی c1d3 با نتیجهٔ کامل", "۶ درست از ۶" in t and state(pg)["days"]["c1d3"]["act"]["done"], t)
    t = run_classify("c6d7"); check("تمرین دو مرحله‌ای کارت کلمه c6d7", "۱۲ درست از ۱۲" in t and state(pg)["days"]["c6d7"]["act"]["done"], t)
    goto(pg, "#/lesson/c1d4/activity"); pg.wait_for_selector(".spot-item"); a = pg.evaluate("AIX.activities.c1d4")
    for it in a["items"]:
        if it["flag"]: pg.locator(".spot-item", has_text=it["t"]).first.click()
    pg.click(".act button.btn.primary"); pg.wait_for_selector(".quiz-result.show")
    check("تمرین کشف خطا c1d4", state(pg)["days"]["c1d4"]["act"]["done"] and "۶ درست از ۶" in pg.inner_text(".quiz-result"))
    # یک تمرین با پاسخ غلط: موفق نشود
    goto(pg, "#/lesson/c2d5/activity"); pg.wait_for_selector(".cls-item")
    for _ in range(6):
        it = pg.locator(".cls-item:not([data-done])").first; txt = it.locator(".cls-text").inner_text().strip()
        a2 = pg.evaluate("AIX.activities.c2d5"); item = [x for x in a2["rounds"][0]["items"] if x["t"] == txt][0]
        wrong = [c for c in a2["cats"] if c["id"] != item["c"]][0]; it.locator(".opt", has_text=wrong["label"]).first.click()
    pg.click(".act .btn.primary"); pg.wait_for_selector(".quiz-result.show")
    check("تمرین با پاسخ‌های غلط موفق حساب نشد و تلاش مجدد دارد", not state(pg)["days"]["c2d5"]["act"]["done"] and pg.locator("text=تلاش دوباره").count() >= 1)

    # ---- پروژهٔ فصل ----
    goto(pg, "#/project/1"); pg.wait_for_selector("details.acc")
    check("پروندهٔ پروژه نمایش داده می‌شود", pg.locator("details.acc").count() >= 5)
    check("پروژه بدون شرایط قابل تکمیل نیست", pg.locator(".fin button").is_disabled())
    pg.evaluate("document.querySelectorAll('details.acc').forEach(d => d.open = true)"); areas = pg.locator("details.acc textarea"); 
    for i in range(3): areas.nth(i).fill("نوشته‌ای برای پروندهٔ پروژه %d" % i)
    pg.wait_for_timeout(500)
    qs1 = pg.evaluate("AIX.quizzes.c1P")
    for i in range(pg.locator(".q").count()):
        box = pg.locator(".q").nth(i); text = re.sub(r"^[^\.]*\.\s*", "", box.locator("legend").inner_text()).strip(); q = [x for x in qs1 if x["q"] == text][0]
        box.locator(".opt", has_text=q["ok"]).first.click()
    pg.click("text=بررسی پاسخ‌ها"); pg.wait_for_selector(".quiz-result.show"); pg.wait_for_timeout(300)
    check("دکمهٔ تکمیل پروژه فعال شد", not pg.locator(".fin button").is_disabled())
    pg.click(".fin button"); pg.wait_for_timeout(500)
    st = state(pg); check("پروژهٔ فصل ۱ کامل شد و نشان گرفت", st["days"]["c1P"]["done"] and "chapter1" in st["badges"] and st["awards"]["proj:c1P"] == 50)
    pg.keyboard.press("Escape")

    # ---- پوستر ----
    goto(pg, "#/lab/poster"); pg.wait_for_selector("canvas.poster-canvas")
    pg.click("text=ساخت و دانلود پوستر"); check("اعتبارسنجی پوستر خالی", "عنوان" in pg.inner_text(".form-msg.show"))
    inputs = pg.locator(".poster-form input[type=text]"); tas = pg.locator(".poster-form textarea")
    inputs.nth(0).fill("لاک‌پشت‌های دریایی"); inputs.nth(1).fill("دریا را پاک نگه داریم")
    tas.nth(0).fill("لاک‌پشت‌ها در دریا زندگی می‌کنند و برای تخم‌گذاری به ساحل می‌آیند."); inputs.nth(2).fill("کتاب علوم")
    pg.locator("#fv0").check(); pg.select_option(".poster-form select", "1")
    tas.nth(3).fill("متن عنوان و شعار را با هوش مصنوعی ایده گرفتم."); tas.nth(4).fill("حقیقت و منبع را خودم بررسی کردم.")
    inputs.nth(5).fill("تماس 09123456789")  # باید اسم مستعار نامعتبر باشد
    pg.click("text=ساخت و دانلود پوستر"); check("محافظ اطلاعات شخصی شمارهٔ تلفن را رد کرد", "شماره" in pg.inner_text(".form-msg.show"))
    inputs.nth(5).fill("کاوشگر کوچک")
    inputs.nth(2).fill(""); pg.click("text=ساخت و دانلود پوستر"); check("حقیقت بررسی‌شده بدون منبع رد شد", "منبع" in pg.inner_text(".form-msg.show"))
    inputs.nth(2).fill("کتاب علوم")
    with pg.expect_download() as dl: pg.click("text=ساخت و دانلود پوستر")
    path = OUT / "poster.png"; dl.value.save_as(str(path)); raw = path.read_bytes()
    check("خروجی پوستر یک فایل PNG واقعی است", raw[:8] == b"\x89PNG\r\n\x1a\n" and len(raw) > 20000, len(raw))
    check("نشان طراح پوستر و امتیاز پوستر ثبت شد", "poster" in state(pg)["badges"] and state(pg)["awards"]["poster:export"] == 40)
    pg.screenshot(path=str(OUT / "poster-desktop.png"), full_page=False)


    # ---- ایستگاه خانواده (فصل ۵) ----
    goto(pg, "#/map"); pg.wait_for_selector(".map-chap")
    order = pg.evaluate("[...document.querySelectorAll('.map-chap, .family-station')].map(e => e.classList.contains('family-station') ? 'F' : 'C')")
    check("ایستگاه خانواده در نقشه بین فصل ۴ و ۶ است", "".join(order) == "CCCCFCCC", order)
    goto(pg, "#/lesson/c6d1/learn"); pg.wait_for_selector(".lesson-body")
    check("یادآوری نرم توافق‌نامه در روز اول فصل ۶ دیده می‌شود و فصل بسته نیست", pg.locator(".family-remind").count() == 1 and "هنوز بسته" not in pg.inner_text("main"))
    goto(pg, "#/family"); pg.wait_for_selector(".fam-rule")
    check("هشت قانون توافق‌نامه نمایش داده می‌شود", pg.locator(".fam-rule").count() == 8)
    for i in range(7): pg.locator(".fam-rule input").nth(i).check()
    pg.locator("input[aria-label='اسم والد یا بزرگسال']").fill("م"); pg.locator("input[aria-label='اسم کودک']").fill("ن")
    f = state(pg)["family"]; check("با ۷ قانون و اسم‌های ناقص توافق‌نامه کامل نمی‌شود", not f["done"] and sum(f["rules"]) == 7 and "family" not in state(pg)["awards"])
    pg.locator(".fam-rule input").nth(7).check(); pg.wait_for_timeout(150)
    check("با ۸ قانون ولی اسم‌های کوتاه هنوز کامل نمی‌شود", not state(pg)["family"]["done"])
    pg.locator("input[aria-label='اسم والد یا بزرگسال']").fill("مادر"); pg.locator("input[aria-label='اسم کودک']").fill("نیما"); pg.wait_for_timeout(500)
    st = state(pg); check("توافق‌نامه کامل شد، ۳۰ امتیاز و نشان خانواده", st["family"]["done"] and st["awards"]["family"] == 30 and "family" in st["badges"])
    check("پنجرهٔ تبریک توافق‌نامه", pg.locator("#modal .modal-box").count() == 1 and "توافق‌نامهٔ خانوادگی" in pg.inner_text("#modal")); pg.keyboard.press("Escape"); pg.wait_for_timeout(100)
    xpf = state(pg)["xp"]; pg.locator(".fam-rule input").nth(0).uncheck(); pg.locator(".fam-rule input").nth(0).check(); pg.wait_for_timeout(200)
    check("تیک زدن دوباره امتیاز تکراری نداد", state(pg)["xp"] == xpf)
    goto(pg, "#/lesson/c6d1/learn"); pg.wait_for_selector(".lesson-body")
    check("بعد از امضا یادآوری دیده نمی‌شود", pg.locator(".family-remind").count() == 0)
    bk = pg.evaluate("AIX.store.exportJSON()"); pg.evaluate("AIX.store.reset()")
    check("بعد از پاک کردن، وضعیت خانواده هم پاک شد", not state(pg)["family"]["done"] and not any(state(pg)["family"]["rules"]))
    check("بازیابی پشتیبان وضعیت خانواده را برمی‌گرداند", pg.evaluate("t => AIX.store.importJSON(t)", bk)["ok"] and state(pg)["family"]["done"] and state(pg)["family"]["parent"] == "مادر")
    bad = json.loads(bk); bad["data"]["family"]["rules"] = [1, 2]
    check("پشتیبان با بخش خانوادهٔ خراب رد می‌شود", not pg.evaluate("t => AIX.store.importJSON(t)", json.dumps(bad))["ok"])
    old = json.loads(bk); del old["data"]["family"]
    check("پشتیبان قدیمی بدون بخش خانواده هنوز قابل بازیابی است", pg.evaluate("t => AIX.store.importJSON(t)", json.dumps(old))["ok"] and state(pg)["family"]["rules"] == [False] * 8)
    pg.evaluate("t => AIX.store.importJSON(t)", bk)
    goto(pg, "#/parents"); pg.wait_for_selector("details.acc"); check("راهنمای والدین پیوند ایستگاه خانواده دارد", pg.locator("a[href='#/family']").count() >= 1)

    # ---- کیفیت نوشته، تأیید والد، فصل ۷، آزمایشگاه‌ها، شبیه‌ساز ----
    tq = lambda t, a, b: pg.evaluate("([t,a,b]) => AIX.progress.textQuality(t,a,b).ok", [t, a, b])
    check("نوشتهٔ بی‌معنی «اااا» رد می‌شود", not tq("اااااااااااااااااااااااا ببببببببب", 20, 3))
    check("تکرار یک کلمه رد می‌شود", not tq("سلام سلام سلام سلام سلام سلام", 20, 3))
    check("یک کلمهٔ بلند رد می‌شود", not tq("هوشمصنوعیخیلیخوباستواقعا", 20, 3))
    check("جملهٔ واقعی قبول می‌شود", tq("هوش مصنوعی پیشنهاد می‌دهد و من تصمیم می‌گیرم.", 20, 3))
    xq = state(pg)["xp"]; r1 = pg.evaluate("AIX.progress.saveChallenge('c2d1', 1, 'ااااااااااا ببببببببب ججججججج')")
    check("چالش بی‌معنی امتیاز نمی‌دهد", r1 is False and state(pg)["xp"] == xq)
    r2 = pg.evaluate("AIX.progress.saveChallenge('c2d1', 1, 'یک سؤال دقیق می‌پرسم که با منبع بررسی شود.')")
    check("چالش واقعی امتیاز می‌دهد", r2 is True and state(pg)["xp"] == xq + 15)
    pa = pg.evaluate("[AIX.progress.markParentSeen(2), AIX.progress.markParentSeen(2)]")
    check("تأیید والد یک‌بار ۲۰ امتیاز می‌دهد", pa == [20, 0] and state(pg)["awards"]["parent:c2"] == 20, pa)
    goto(pg, "#/project/2"); pg.wait_for_selector(".parent-seen"); check("کارت تأیید والد در صفحهٔ پروژه است", pg.locator(".parent-seen button").is_disabled())
    goto(pg, "#/lesson/c1d1/learn"); pg.wait_for_selector(".time-note")
    check("زمان تقریبی و برچسب اختیاری در درس دیده می‌شود", "دقیقه" in pg.inner_text(".time-note") and pg.locator(".opt-tag").count() >= 2)
    check("فونت وزیرمتن همراه برنامه بارگذاری می‌شود", pg.evaluate("document.fonts.ready.then(() => document.fonts.check('16px Vazirmatn'))"))
    c7 = pg.evaluate("(() => { const c = AIX.progress.chapter(7); return c && {n: c.lessons.length, q: c.lessons.map(l => AIX.progress.quizFor(l.id).length), pq: AIX.progress.quizFor('c7P').length, badge: c.badge}; })()")
    check("فصل ۷ با ۴ درس و آزمون‌هایش بارگذاری شد", c7 and c7["n"] == 4 and min(c7["q"]) >= 3 and c7["pq"] >= 3, c7)
    pg.evaluate("AIX.store.get().profile.open = false"); locked7 = pg.evaluate("AIX.progress.chapterUnlocked(7)"); pg.evaluate("AIX.store.get().profile.open = true")
    check("فصل ۷ بعد از پروژهٔ فصل ۶ باز می‌شود (در حالت عادی بسته است)", locked7 is False)
    K = pg.evaluate("(() => { const b = AIX.knn.evaluate(AIX.knn.preset('balanced'), 3), o = AIX.knn.evaluate(AIX.knn.preset('onesided'), 3); return {b: b.right / b.total, os: o.by.small[0] / o.by.small[1]}; })()")
    check("مدل آزمایشگاه: داده متوازن خوب و داده یک‌طرفه سگ‌های کوچک را اشتباه می‌گیرد", K["b"] >= 0.9 and K["os"] <= 0.5, K)
    goto(pg, "#/labs/model"); pg.wait_for_selector(".pool")
    pg.click("text=مجموعهٔ ۲: فقط گربه و سگ بزرگ"); pg.click("text=آزمون روی ۲۰ نمونهٔ تازه"); pg.click("text=مجموعهٔ ۱: متوازن"); pg.click("text=آزمون روی ۲۰ نمونهٔ تازه"); pg.wait_for_timeout(200)
    check("آزمایشگاه مدل بعد از دو آزمون با داده‌های متفاوت ۲۰ امتیاز داد", state(pg)["awards"].get("lab:model") == 20)
    goto(pg, "#/labs/sim/velociraptor"); pg.wait_for_selector(".sim-banner"); pg.click(".sim-ctl .opt")
    flags = pg.evaluate("AIX.sims.velociraptor.turns[0].reply.map(r => r.flag)")
    for i, f_ in enumerate(flags):
        if f_: pg.locator(".sim-reply .spot-item").nth(i).click()
    pg.click("text=بررسی پاسخ"); pg.wait_for_timeout(200)
    check("شبیه‌ساز کارآگاه توهم با علامت‌زدن درست امتیاز می‌دهد و برچسب ساختگی دارد", state(pg)["awards"].get("lab:sim:velociraptor") == 20 and "هوش مصنوعی واقعی نیست" in pg.inner_text(".sim-banner"))
    goto(pg, "#/labs/sim/tutor"); pg.wait_for_selector(".sim-opts")
    for i in range(2): pg.locator(".sim-opts .opt").nth(i).click()
    pg.click("text=جواب دوم"); pg.wait_for_timeout(100)
    check("شبیه‌ساز مقایسه با نتیجهٔ درست امتیاز می‌دهد", state(pg)["awards"].get("lab:sim:tutor") == 20)
    goto(pg, "#/lesson/c1d4/explore"); pg.wait_for_selector(".sim-link"); check("مرحلهٔ کاوش درس ۴ پیوند شبیه‌ساز آفلاین دارد", pg.locator(".sim-link").count() >= 1)
    goto(pg, "#/lesson/c7d2/activity"); pg.wait_for_selector(".act"); a7 = pg.evaluate("AIX.activities.c7d2"); cats7 = {c["id"]: c["label"] for c in a7["cats"]}
    for _ in range(len(a7["rounds"][0]["items"])):
        it = pg.locator(".cls-item:not([data-done])").first; txt = it.locator(".cls-text").inner_text().strip(); item = [x for x in a7["rounds"][0]["items"] if x["t"] == txt][0]
        it.locator(".opt", has_text=cats7[item["c"]]).first.click()
    pg.click(".act .btn.primary"); pg.wait_for_selector(".quiz-result.show"); check("تمرین تعاملی فصل ۷ کار می‌کند", state(pg)["days"]["c7d2"]["act"]["done"])
    # ---- استودیوی خلاق (فصل ۸ و دو آزمایشگاه) ----
    goto(pg, "#/labs/prompt"); pg.wait_for_selector(".prompt-out")
    pg.fill("input.inp", "روباهی که روی ابر کتاب می‌خواند")
    pg.click("button.chip.pick >> nth=0"); pg.click(".fld:has-text('نور') button.chip.pick >> nth=0")
    pg.click("button:has-text('تأیید و کپی')"); check("سازندهٔ پرامپت: با دو ویژگی رد می‌شود", not P_done(pg, "prompt"))
    pg.click(".fld:has-text('حال‌وهوا') button.chip.pick >> nth=0"); pg.click("button:has-text('تأیید و کپی')")
    check("سازندهٔ پرامپت: با موضوع و سه ویژگی امتیاز می‌دهد", P_done(pg, "prompt"))
    pg.fill("input.inp", "09123456789 و ایمیل a@b.com"); pg.click("button:has-text('تأیید و کپی')")
    check("سازندهٔ پرامپت: اطلاعات شخصی رد می‌شود", "شماره" in pg.inner_text("main"))
    goto(pg, "#/labs/story"); pg.wait_for_selector("textarea")
    pg.fill("input.inp", "ماجرای روباه")
    for i in range(3): pg.locator("textarea").nth(i).fill("روباه شاد از لانه بیرون می‌آید")
    pg.click("button:has-text('ساخت و دانلود')"); check("استوری‌بورد: با سه قاب رد می‌شود", not P_done(pg, "story"))
    pg.locator("textarea").nth(3).fill("روباه ابر بزرگی را می‌بیند")
    with pg.expect_download() as dl: pg.click("button:has-text('ساخت و دانلود')")
    check("استوری‌بورد: PNG ساخته می‌شود", dl.value.suggested_filename.endswith(".png"))
    check("استوری‌بورد: امتیاز یک‌باره ثبت شد", P_done(pg, "story"))
    check("فصل ۸ در دوره هست", pg.evaluate("AIX.progress.chapter(8) && AIX.progress.chapter(8).lessons.length") == 3)
    check("آزمون‌های فصل ۸ کامل‌اند", pg.evaluate("['c8d1','c8d2','c8d3','c8P'].every(k=>AIX.quizzes[k] && AIX.quizzes[k].length>=3)"))

    # قفل نسخهٔ فروش: فقط درس اول و آزمایشگاه مدل رایگان است
    ctx2 = b.new_context(viewport={"width": 1280, "height": 800}); pg2 = ctx2.new_page()
    _lic = (pathlib.Path(__file__).resolve().parent.parent / "js/core/license.js").read_text(encoding="utf-8").replace('const LICENSE_PUBKEY = "";', 'const LICENSE_PUBKEY = "{}";')
    pg2.route("**/js/core/license.js", lambda r: r.fulfill(body=_lic, content_type="application/javascript")); pg2.goto(BASE); pg2.wait_for_selector(".hero")
    pg2.evaluate("location.hash = '#/lesson/c1d2'"); pg2.wait_for_timeout(250); lockedtxt = pg2.inner_text("main")
    pg2.evaluate("location.hash = '#/labs/model'"); pg2.wait_for_timeout(250); freelab = pg2.locator(".pool").count()
    pg2.evaluate("location.hash = '#/labs/feed'"); pg2.wait_for_timeout(250); lockedlab = pg2.locator(".feed").count()
    check("نسخهٔ فروش: درس دوم قفل است، آزمایشگاه مدل نمونهٔ رایگان است و بقیه قفل", "هنوز بسته" not in lockedtxt and freelab == 1 and lockedlab == 0, (freelab, lockedlab))
    pg2.evaluate("location.hash = '#/print'"); pg2.wait_for_timeout(250)
    hrefs = pg2.eval_on_selector_all("main a.card", "els=>els.map(e=>e.getAttribute('href'))")
    check("بستهٔ چاپی: راهنمای والدین رایگان، بقیه قفل", any("parent-guide.pdf" in x for x in hrefs) and sum("#/activate" in x for x in hrefs) == 2, hrefs)
    ctx2.close()
    pg.evaluate("location.hash = '#/print'"); pg.wait_for_timeout(250)
    hr = pg.eval_on_selector_all("main a.card", "els=>els.map(e=>e.getAttribute('href'))")
    check("بستهٔ چاپی (باز): سه PDF", sum(x.endswith(".pdf") for x in hr) == 3, hr)
    import pathlib
    check("فایل‌های PDF روی دیسک هستند", all((pathlib.Path(__file__).resolve().parent.parent / "assets/print" / f).exists() for f in ("workbook.pdf", "certificate.pdf", "parent-guide.pdf")))
    # حالت سبک
    pg.evaluate("location.hash = '#/settings'"); pg.wait_for_timeout(250)
    check("تنظیمات: گزینهٔ حالت سبک هست", pg.locator("main input[type=checkbox]").count() >= 1)

    # ---- نمایش موبایل و دسکتاپ ----
    shots = {"home": "#/", "map": "#/map", "lesson": "#/lesson/c1d1/learn", "achievements": "#/achievements", "settings": "#/settings", "poster": "#/lab/poster", "parents": "#/parents", "family": "#/family", "labs": "#/labs", "modellab": "#/labs/model", "chapter7": "#/chapter/7", "print": "#/print"}
    for dev, vp in (("desktop", {"width": 1280, "height": 800}), ("mobile", {"width": 390, "height": 844})):
        pg.set_viewport_size(vp)
        for name, h_ in shots.items():
            goto(pg, h_); pg.wait_for_timeout(300)
            over = pg.evaluate("document.documentElement.scrollWidth - window.innerWidth")
            check("بدون اسکرول افقی (%s · %s)" % (dev, name), over <= 2, over)
            pg.screenshot(path=str(OUT / ("%s-%s.png" % (dev, name))), full_page=False)
    check("نوار پایین فقط در موبایل", pg.evaluate("getComputedStyle(document.querySelector('.bottomnav')).display") == "grid")
    pg.set_viewport_size({"width": 1280, "height": 800}); check("نوار پایین در دسکتاپ پنهان است", pg.evaluate("getComputedStyle(document.querySelector('.bottomnav')).display") == "none")

    # ---- بدون ارتباط شبکه‌ای خارجی ----
    ext = pg.evaluate("performance.getEntriesByType('resource').map(r=>r.name).filter(n=>!n.startsWith(location.origin))")
    check("هیچ درخواست خارجی انجام نشد", not ext, ext[:3])
    check("بدون خطای کنسول در کل تست", not errors, errors[:3])
    b.close()
failed = [r for r in results if not r[1]]
print("\nجمع: %d تست، %d موفق، %d ناموفق" % (len(results), len(results) - len(failed), len(failed)))
sys.exit(1 if failed else 0)
