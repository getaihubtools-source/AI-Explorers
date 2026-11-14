# استخراج محتوای نهایی فصل‌ها از فایل‌های ساخت PDF به فایل‌های محتوای وب‌اپ.
# استفاده: python3 tools/extract_content.py /مسیر/پوشهٔ/chapterN.py
# فایل‌های آموزشی اصلی را تغییر نمی‌دهد؛ فقط خروجی در پوشهٔ content/ نوشته می‌شود.
import sys, re, json, pathlib, importlib
from bs4 import BeautifulSoup
SRC = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else "/home/claude/aiexplorer")
OUT = pathlib.Path(__file__).resolve().parent.parent / "content"
sys.path.insert(0, str(SRC))
FA2EN = str.maketrans("۰۱۲۳۴۵۶۷۸۹", "0123456789")

def frag(h): return BeautifulSoup(h, "html.parser")

def clean(html):
    """HTML چاپی را برای وب آماده می‌کند: خط‌های نوشتن و کادرهای طراحی به ناحیهٔ نوشتن تبدیل می‌شوند."""
    s = frag(html)
    for el in s.select(".pbox"): el.replace_with(frag('<div class="write mini" data-w="1"></div>'))
    for el in s.select(".lines"): el.replace_with(frag('<div class="write" data-w="1"></div>'))
    for el in s.select(".grid-paper"): el.replace_with(frag('<div class="write tall" data-w="1" data-hint="طرحت را با کلمه توضیح بده یا روی کاغذ بکش و اینجا یادداشت کن."></div>'))
    for el in s.select(".drop"): el.decompose()
    for td in s.select("td"):
        if not td.get_text(strip=True) and not td.find("span", class_="cb"):
            td.append(frag('<span class="cell" data-w="1"></span>'))
    return "".join(str(x) for x in s.contents)

def page_body(fn):
    html = fn(0)
    s = frag(html).find("section")
    title = s.select_one("h1").get_text(" ", strip=True) if s.select_one("h1") else ""
    lead = s.select_one(".lead").get_text(" ", strip=True) if s.select_one(".lead") else ""
    parts = []
    for ch in s.find_all(recursive=False):
        cls = ch.get("class") or []
        if any(c in cls for c in ("stripe", "tag", "ttl", "foot")): continue
        if ch.find("img") and "top:11mm" in (ch.get("style") or ""): continue
        parts.append(str(ch))
    return title, lead, clean("".join(parts))

def lesson_from_day(d):
    plan = [g for grp in d["plan"] for g in grp if g != "mission"]
    sec, reflect, progress, chall = [], [], [], []
    for key in plan:
        fn = d["blocks"].get(key)
        if not fn: continue
        html = fn()
        if key == "challenge":
            for card in frag(html).select("div.card.ac"):
                chips = [c.get_text(strip=True) for c in card.select(".chip")]
                m = re.search(r"سطح\s*([۰-۹]+)", chips[0] if chips else "")
                lvl = int(m.group(1).translate(FA2EN)) if m else len(chall) + 1
                for row in card.select(".row"):
                    if row.select(".chip"): row.decompose()
                for w in card.select(".lines"): w.decompose()
                chall.append({"level": lvl, "ages": chips[1] if len(chips) > 1 else "", "html": clean(card.decode_contents())})
        elif key == "reflect":
            reflect = [b.get_text(" ", strip=True) for b in frag(html).select("div[style*='margin-top'] > b")]
        elif key == "progress":
            progress = [li.get_text(" ", strip=True) for li in frag(html).select(".li") if li.select_one(".cb")]
        else:
            sec.append({"key": key, "html": clean(html)})
    return {"day": d["n"], "title": d["title"], "name": d["name"], "mission": re.sub(r"\*\*", "", d["mission"]), "tip": d.get("tip", ""),
            "sections": sec, "challenges": chall, "reflect": reflect, "progress": progress}

def glossary(mod):
    title, lead, html = page_body(mod.p_gloss)
    rows = []
    for tr in frag(html).select("tr")[1:]:
        t = [td.get_text(" ", strip=True) for td in tr.select("td")]
        if len(t) == 3: rows.append(t)
    return rows

CFG = [
 dict(n=1, mod="chapter1", days="DAYS", title="ورود به دنیای هوش مصنوعی", badge="کاوشگر هوش مصنوعی", acc="cyan", proj=["p7_a", "p7_b", "p7_c", "p7_d", "p7_e", "p7_f"], projname="دفترچهٔ کاوشگری و دستیار ایمن هوش مصنوعی"),
 dict(n=2, mod="chapter2", days="D", title="تبدیل شدن به محقق کوچک", badge="محقق و کاوشگر اطلاعات", acc="violet", proj=["p8_a", "p8_b", "p8_c", "p8_c2", "p8_d", "p8_e"], projname="پروندهٔ تحقیق یک کاوشگر"),
 dict(n=3, mod="chapter3", days="D", title="خلق کردن با هوش مصنوعی", badge="کاوشگر خلاق هوش مصنوعی", acc="orange", proj=["p9_a", "p9_b", "p9_c", "p9_d", "p9_e"], projname="استودیوی خلاق کاوشگر"),
 dict(n=4, mod="chapter4", days="D", title="ساختن و ارائه دادن", badge="کاوشگر سازندهٔ پروژه", acc="yellow", proj=["p8_a", "p8_b", "p8_c", "p8_d", "p8_e", "p8_f", "p8_g"], projname="آزمایشگاه پروژهٔ کاوشگر"),
 dict(n=6, mod="chapter6", days="D", title="جعبه‌ابزار کاوشگر هوش مصنوعی", badge="کاوشگر جعبه‌ابزار", acc="green", proj=["p8_a", "p8_b", "p8_c", "p8_d", "p8_e", "p8_f"], projname="جعبه‌ابزار شخصی من"),
]
gloss = {}
HEAD = "window.AIX = window.AIX || {}; AIX.content = AIX.content || {};\n"
for c in CFG:
    mod = importlib.import_module(c["mod"])
    days = [lesson_from_day(d) for d in getattr(mod, c["days"])]
    pages = []
    for fname in c["proj"]:
        t, lead, html = page_body(getattr(mod, fname))
        pages.append({"title": t, "lead": lead, "html": html})
    for t, e, m in glossary(mod): gloss.setdefault(t, {"term": t, "meaning": e, "en": m})
    data = {"id": f"ch{c['n']}", "n": c["n"], "title": c["title"], "badge": c["badge"], "accent": c["acc"], "projectTitle": c["projname"], "lessons": days, "projectPages": pages}
    (OUT / f"ch{c['n']}.js").write_text(HEAD + "AIX.content.ch%d = %s;\n" % (c["n"], json.dumps(data, ensure_ascii=False)), encoding="utf-8")
    print("ch", c["n"], "lessons", len(days), "project pages", len(pages))

m5 = importlib.import_module("chapter5")
parent = []
for fname in ["p_intro", "p_role", "p_homework", "p_privacy", "p_age", "p_check", "p_balance", "p_transp", "p_acts1", "p_acts2", "p_sc1", "p_sc2", "p_agree", "p_checklist", "p_badge"]:
    t, lead, html = page_body(getattr(m5, fname))
    parent.append({"title": t, "lead": lead, "html": html})
(OUT / "parents.js").write_text(HEAD + "AIX.content.parents = %s;\nAIX.content.glossary = %s;\n" % (json.dumps(parent, ensure_ascii=False), json.dumps(list(gloss.values()), ensure_ascii=False)), encoding="utf-8")
print("parents", len(parent), "glossary", len(gloss))
