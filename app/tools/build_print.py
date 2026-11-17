# -*- coding: utf-8 -*-
# ساخت بستهٔ چاپی (PDF فارسی راست‌به‌چپ) با Chromium: python3 tools/build_print.py
# خروجی: app/assets/print/workbook.pdf, certificate.pdf, parent-guide.pdf
import pathlib, sys
from playwright.sync_api import sync_playwright

ROOT = pathlib.Path(__file__).resolve().parent.parent
FONT = (ROOT / "assets/fonts/Vazirmatn-VF.woff2").as_uri()
OUT = ROOT / "assets/print"; OUT.mkdir(parents=True, exist_ok=True)

CSS = """
@font-face{font-family:"Vazirmatn";font-weight:100 900;src:url("__FONT__") format("woff2")}
*{box-sizing:border-box;margin:0;padding:0}
html{direction:rtl;font-family:"Vazirmatn",Tahoma,sans-serif;color:#10162b;font-size:11.5pt;line-height:1.9}
.page{page-break-after:always;padding:0}.page:last-of-type{page-break-after:auto}
h1{font-size:25pt;line-height:1.4}h2{font-size:16pt;margin-bottom:4pt;color:#2a2f8f}h3{font-size:12.5pt;margin:8pt 0 2pt}
p{margin:3pt 0}.sub{color:#555c7a;font-size:10pt}
.band{background:#0B1020;color:#fff;border-radius:10pt;padding:9pt 14pt;margin-bottom:10pt}.band h2{color:#18D7E8;margin:0}
.box{border:1.2pt solid #9aa3d6;border-radius:9pt;padding:8pt 11pt;margin:7pt 0}
.rule{background:#eef1ff;border-inline-start:4pt solid #3478F6;border-radius:6pt;padding:6pt 10pt;margin:7pt 0;font-weight:700}
.line{border-bottom:1pt solid #aab0d4;height:20pt}.lines .line{margin-top:2pt}
table{width:100%;border-collapse:collapse;margin:6pt 0}th,td{border:1pt solid #9aa3d6;padding:5pt 7pt;vertical-align:top;font-size:10.5pt}
th{background:#e7ebff}td.w{height:34pt}
.cb{display:inline-block;width:11pt;height:11pt;border:1.2pt solid #2a2f8f;border-radius:3pt;margin-inline-end:5pt;vertical-align:-1pt}
ul{padding-inline-start:16pt}li{margin:2pt 0}
.foot{position:fixed;bottom:0;left:0;right:0;text-align:center;font-size:8.5pt;color:#7b82a6}
.grid5{display:grid;grid-template-columns:repeat(5,1fr);gap:4pt}.grid5 div{border:1pt solid #9aa3d6;border-radius:5pt;padding:3pt 4pt;font-size:9pt}
@page{size:A4;margin:16mm 15mm 18mm}
""".replace("__FONT__", FONT)

def doc(body, extra=""):
    return f'<!doctype html><html lang="fa" dir="rtl"><head><meta charset="utf-8"><style>{CSS}{extra}</style></head><body><div class="foot">AIhub AI Explorers · @aihub_tools</div>{body}</body></html>'

def lines(n): return '<div class="lines">' + '<div class="line"></div>' * n + "</div>"
def tbl(head, rows, blank=0):
    h = "".join(f"<th>{x}</th>" for x in head)
    r = "".join("<tr>" + "".join(f"<td>{c}</td>" for c in row) + "".join('<td class="w"></td>' for _ in range(blank)) + "</tr>" for row in rows)
    return f"<table><tr>{h}</tr>{r}</table>"

# ---------------- کتاب کار ----------------
W = []
W.append('''<div class="page" style="text-align:center;padding-top:60pt">
<div style="font-size:60pt">🤖</div><h1>کتاب کار کاوشگر هوش مصنوعی</h1>
<p class="sub" style="font-size:13pt;margin-top:6pt">همراه برنامهٔ AIhub AI Explorers · برای ۱۱ تا ۱۳ سال</p>
<div class="box" style="margin:40pt 30pt;text-align:right"><p>نام (یا اسم مستعار): <span style="display:inline-block;width:60%;border-bottom:1pt solid #aab0d4">&nbsp;</span></p>
<p>تاریخ شروع: <span style="display:inline-block;width:40%;border-bottom:1pt solid #aab0d4">&nbsp;</span></p>
<p class="sub">اطلاعات شخصی (نام کامل، آدرس، شمارهٔ تلفن) نمی‌نویسیم.</p></div>
<div class="rule" style="margin:0 30pt">هوش مصنوعی پیشنهاد می‌دهد؛ انسان بررسی و تصمیم‌گیری می‌کند.</div></div>''')
W.append('<div class="page"><div class="band"><h2>۱ · میثاق‌نامهٔ استفادهٔ مسئولانه از هوش مصنوعی</h2></div><p>پنج قانون زیر را بخوان. اگر قبولشان داری، امضا کن.</p>' +
 '<div class="box">' + "".join(f'<p><span class="cb"></span>{t}</p>' for t in ["اطلاعات شخصی خود و دیگران را بدون بررسی وارد هوش مصنوعی نمی‌کنم.", "از هوش مصنوعی برای یادگیری کمک می‌گیرم، نه برای کنار گذاشتن تلاش خودم.", "پاسخ‌های مهم هوش مصنوعی را بررسی می‌کنم.", "قوانین مدرسه، معلم و ابزار را رعایت می‌کنم.", "مسئولیت نهایی کار و تصمیم خودم را می‌پذیرم."]) + '</div>' +
 '<p>قانون خودم (یک قانون ششم):</p>' + lines(2) + '<table><tr><th>امضای من</th><th>امضای والدین یا معلم</th><th>تاریخ</th></tr><tr><td class="w"></td><td class="w"></td><td class="w"></td></tr></table></div>')
W.append('<div class="page"><div class="band"><h2>۲ · من در برابر هوش مصنوعی</h2></div><p>جدول را با مثال‌های خودت کامل کن.</p>' + tbl(["ویژگی", "انسان", "هوش مصنوعی"], [["احساس و تجربهٔ شخصی", "", ""], ["یادگیری", "", ""], ["سرعت", "", ""], ["مسئولیت تصمیم", "", ""], ["اشتباه کردن", "", ""]], 0).replace('<td></td><td></td>', '<td class="w"></td><td class="w"></td>') +
 '<h3>سه نمونه از هوش مصنوعی در زندگی روزمره</h3>' + tbl(["نمونه", "چه کاری می‌کند؟", "داده چه نقشی دارد؟", "تصمیم انسان کجاست؟"], [["", "", "", ""]] * 3).replace('<td></td>', '<td class="w"></td>') + '</div>')
W.append('<div class="page"><div class="band"><h2>۳ · گزارش کارآگاه هوش مصنوعی</h2></div><p>یک ادعای هوش مصنوعی را انتخاب کن و بررسی کن. جواب هوش مصنوعی شروع بررسی است، نه آخر آن.</p><div class="box"><h3>ادعای هوش مصنوعی</h3>' + lines(2) + '<h3>منبعی که برای بررسی استفاده کردم</h3>' + lines(2) +
 '<h3>نتیجه</h3><p><span class="cb"></span>درست &nbsp;&nbsp; <span class="cb"></span>نادرست &nbsp;&nbsp; <span class="cb"></span>نیازمند بررسی بیشتر</p><h3>دلیل</h3>' + lines(3) + '</div>' +
 '<div class="rule">چهار راه بررسی: ۱) راستی‌آزمایی با منبع معتبر ۲) مقایسهٔ منابع ۳) بازنویسی سؤال ۴) بررسی خود سند</div><p class="sub">نکته: اگر دو ابزار جواب یکسان بدهند، باز هم باید یک منبع مستقل ببینی.</p></div>')
W.append('<div class="page"><div class="band"><h2>۴ · شناسنامهٔ گفت‌وگوی علمی</h2></div><div class="box"><h3>موضوع</h3>' + lines(1) + '<h3>هدف من</h3>' + lines(1) + '<h3>سطح من</h3>' + lines(1) + '<h3>کمکی که می‌خواهم</h3>' + lines(1) +
 '<h3>شکل پاسخ</h3><p><span class="cb"></span>جدول &nbsp; <span class="cb"></span>توضیح کوتاه &nbsp; <span class="cb"></span>مثال &nbsp; <span class="cb"></span>سؤال و جواب &nbsp; <span class="cb"></span>تمرین</p></div>' +
 '<h3>پرسش‌های پیگیری که می‌توانم بپرسم</h3><ul><li>می‌توانی یک مثال واقعی بزنی؟</li><li>چرا این اتفاق می‌افتد؟</li><li>از کجا مطمئن هستی؟</li><li>اگر این شرط تغییر کند چه می‌شود؟</li><li>کدام قسمت پاسخ نیاز به بررسی بیشتر دارد؟</li></ul>' + lines(3) + '</div>')
W.append('<div class="page"><div class="band"><h2>۵ · کارت چهار پرسش پیش از فرستادن</h2></div><p>هر وقت تصویر، صدا یا پیامی را می‌خواهی بفرستی، اول جواب بده:</p>' +
 tbl(["پرسش", "جواب من"], [["کی و کجا این را ساخته است؟", ""], ["تصویر یا صدا سرنخ مشکوک دارد؟ (انگشت‌ها، نوشتهٔ ناخوانا، سایه‌ها)", ""], ["یک منبع معتبر یا یک بزرگسال تأیید کرده است؟", ""], ["اگر درست نباشد، به کسی آسیب می‌زند؟", ""]]).replace('<td></td>', '<td class="w"></td>') +
 '<div class="rule">قبل از باور کردن و قبل از فرستادن، منبع را پیدا کن.</div><h3>آدم‌های مورد اعتماد من (فقط نقش، مثل «مادر» یا «معلم ریاضی»)</h3>' + lines(3) + '</div>')
W.append('<div class="page"><div class="band"><h2>۶ · برچسب شفافیت</h2></div><p>این برچسب را برای هر پروژه پر کن و کنار کارت بچسبان.</p>' +
 tbl(["بخش", "پر کن"], [["نام پروژه", ""], ["ساختهٔ من", ""], ["کمک هوش مصنوعی (کجا و چقدر؟)", ""], ["سطح استفاده از هوش مصنوعی (۰ تا ۳)", ""], ["منبع‌هایی که بررسی کردم", ""], ["اجازه‌هایی که گرفتم", ""], ["دفعهٔ بعد بهتر می‌کنم", ""]]).replace('<td></td>', '<td class="w"></td>') +
 '<p class="sub">سطح ۰: بدون هوش مصنوعی · ۱: ایده و پیشنهاد · ۲: ویرایش و بهبود کار خودم · ۳: ساخت پیش‌نویس با هدایت من. برای تکلیف مدرسه، قانون معلم دربارهٔ اعلام استفاده از هوش مصنوعی را رعایت کن.</p></div>')
W.append('<div class="page"><div class="band"><h2>۷ · ماتریس انتخاب ابزار و نقشهٔ جایگزین</h2></div>' +
 tbl(["نیاز من", "روش یا ابزار انتخابی", "چه چیزی را بررسی می‌کنم؟", "اگر ابزار نبود چه می‌کنم؟"], [["فهمیدن یک درس", "", "", ""], ["تحقیق علمی", "", "", ""], ["ساخت تصویر یا پوستر", "", "", ""], ["پادکست یا ویدئو (فقط نوشتن و برنامه‌ریزی)", "", "", ""], ["ارائهٔ پروژه", "", "", ""]]).replace('<td></td>', '<td class="w"></td>') +
 '<div class="box"><h3>چک‌لیست انتخاب ابزار</h3><p><span class="cb"></span>ابزار با هدف من هماهنگ است.</p><p><span class="cb"></span>شرایط سنی و قوانین را با والدین بررسی کرده‌ام.</p><p><span class="cb"></span>اطلاعات شخصی غیرضروری وارد نمی‌کنم.</p><p><span class="cb"></span>می‌دانم چطور خروجی را بررسی کنم.</p><p><span class="cb"></span>اگر ابزار نبود، روش جایگزین دارم.</p></div></div>')
days = [("فصل ۱", 6), ("فصل ۲", 7), ("فصل ۳", 8), ("فصل ۴", 7), ("فصل ۶", 7), ("فصل ۷", 4)]
trk = ""
for name, n in days:
    trk += f'<h3>{name}</h3><div class="grid5">' + "".join(f'<div><span class="cb"></span>روز {i}</div>' for i in range(1, n + 1)) + '<div><span class="cb"></span>پروژه</div></div>'
W.append('<div class="page"><div class="band"><h2>۸ · ردیاب مسیر</h2></div><p>هر روز که کامل شد، یک تیک بزن. هر روز حدود ۱۵ تا ۳۰ دقیقه کافی است.</p>' + trk + '<div class="box" style="margin-top:10pt"><p><b>ایستگاه خانواده (فصل ۵):</b> <span class="cb"></span>توافق‌نامه را با والدین امضا کردم.</p></div></div>')
(OUT / "_workbook.html").write_text(doc("".join(W)), encoding="utf-8")

# ---------------- گواهی ----------------
CERT = '''<div style="border:5pt double #2a2f8f;border-radius:14pt;padding:28pt 34pt;height:172mm;text-align:center;display:flex;flex-direction:column;justify-content:space-between">
<div><div style="font-size:40pt">🏅</div><h1 style="font-size:30pt;color:#2a2f8f">گواهی تشویقی کاوشگر هوش مصنوعی</h1><p class="sub" style="font-size:12pt">آکادمی کاوشگران هوش مصنوعی · AIhub AI Explorers</p></div>
<div><p style="font-size:14pt">این گواهی به</p><div style="margin:8pt auto;width:70%;border-bottom:1.5pt solid #2a2f8f;height:30pt"></div>
<p style="font-size:14pt">برای تکمیل مسیر یادگیری زیر تقدیم می‌شود:</p>
<p style="font-size:12pt;margin-top:6pt"><span class="cb"></span>فصل ۱ &nbsp; <span class="cb"></span>فصل ۲ &nbsp; <span class="cb"></span>فصل ۳ &nbsp; <span class="cb"></span>فصل ۴ &nbsp; <span class="cb"></span>فصل ۶ &nbsp; <span class="cb"></span>فصل ۷</p>
<p style="margin-top:8pt;font-weight:700;color:#2a2f8f">فکر کن، بپرس، بسنج، اطلاعات شخصی‌ات را نگه دار، خودت بساز.</p></div>
<div style="display:flex;justify-content:space-around;font-size:11pt"><div style="width:30%;border-top:1pt solid #555c7a;padding-top:4pt">امضای والدین یا معلم</div><div style="width:30%;border-top:1pt solid #555c7a;padding-top:4pt">تاریخ</div></div>
<p class="sub" style="font-size:8.5pt">این گواهی تشویقی و خانگی است و مدرک رسمی آموزشی نیست.</p></div>'''
(OUT / "_certificate.html").write_text(doc(CERT, "@page{size:A4 landscape;margin:12mm}"), encoding="utf-8")

# ---------------- راهنمای والدین ----------------
PG = '''<div class="page"><div class="band"><h2>راهنمای یک‌صفحه‌ای والدین: همراه باشید، نه کنترل‌گر</h2></div>
<h3>اصل طلایی</h3><div class="rule">هوش مصنوعی پیشنهاد می‌دهد؛ فرزند شما بررسی و تصمیم‌گیری می‌کند.</div>
<h3>هر روز چه کنید (۵ دقیقه)</h3><ul><li>بپرسید: «امروز چه چیزی یاد گرفتی که قبلاً نمی‌دانستی؟»</li><li>بپرسید: «از کجا می‌دانی درست است؟» (به‌جای «جواب چی شد؟»)</li><li>چالش یا بازتاب او را بخوانید و یک نکتهٔ مثبت بگویید.</li></ul>
<h3>پنج پرسش خوب برای گفت‌وگو</h3><ul><li>اگر هوش مصنوعی اشتباه کند، چطور می‌فهمی؟</li><li>چه اطلاعاتی را هیچ‌وقت در یک ابزار نمی‌نویسی؟</li><li>کجا از هوش مصنوعی کمک گرفتی و کجا خودت فکر کردی؟</li><li>اگر چیزی ناراحتت کرد، به چه کسی می‌گویی؟</li><li>این تصویر یا پیام را از کجا آورده‌اند؟</li></ul>
<h3>ایمنی در عمل</h3><ul><li>قبل از ثبت‌نام در هر ابزار، شرایط سنی و حریم خصوصی همان ابزار را از منبع رسمی خودش بخوانید؛ این شرایط تغییر می‌کند.</li><li>برنامهٔ AI Explorers به هیچ هوش مصنوعی وصل نیست. اگر ابزار در دسترس نیست، شبیه‌ساز آفلاین و کاغذ کافی است.</li><li>رمز، آدرس، نام مدرسه و عکس شخصی وارد ابزارها نشود.</li><li>کودک باید بداند هر ابزاری که بگوید «به کسی نگو» خطرناک است و در این حالت باید به شما بگوید.</li></ul>
<h3>نشانه‌هایی که نیاز به گفت‌وگوی جدی‌تر دارند</h3><ul><li>کودک ساعت‌ها با چت‌بات حرف می‌زند و از دوستان و خانواده دور می‌شود.</li><li>تصویر یا صدای ساختگی از خودش یا دیگران دیده یا ساخته است.</li><li>اطلاعات شخصی خودش را در ابزاری نوشته است.</li></ul>
<div class="box"><p><b>توافق‌نامهٔ خانوادگی:</b> فصل ۵ برنامه (ایستگاه خانواده) هشت قانون دارد که با هم می‌خوانید و امضا می‌کنید. اجباری نیست ولی بهترین شروع است.</p></div></div>'''
(OUT / "_parent-guide.html").write_text(doc(PG), encoding="utf-8")

if __name__ == "__main__":
    with sync_playwright() as p:
        b = p.chromium.launch(); pg = b.new_page()
        for name, landscape in (("workbook", False), ("certificate", True), ("parent-guide", False)):
            pg.goto((OUT / f"_{name}.html").as_uri()); pg.wait_for_timeout(400)
            pg.evaluate("document.fonts.ready")
            pg.pdf(path=str(OUT / f"{name}.pdf"), format="A4", landscape=landscape, print_background=True, prefer_css_page_size=True)
            print("ok", name)
        b.close()
    for f in OUT.glob("_*.html"): f.unlink()
