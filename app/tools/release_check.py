#!/usr/bin/env python3
"""بررسی پیش از انتشار/ساخت APK. اجرا از ریشهٔ پروژه: python3 app/tools/release_check.py
اگر خطایی (✗) باشد، با کد ۱ خارج می‌شود و نباید APK ساخت."""
import json, os, re, sys
os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", ".."))
bad, warn = [], []
def err(m): bad.append(m); print("✗", m)
def ok(m): print("✓", m)
def wr(m): warn.append(m); print("!", m)

lic = open("app/js/core/license.js", encoding="utf-8").read()
m = re.search(r'const LICENSE_PUBKEY = (?:"((?:[^"\\]|\\.)*)"|\'((?:[^\'\\]|\\.)*)\');', lic)
raw = (m.group(1) or m.group(2) or "") if m else None
if raw is None: err("خط LICENSE_PUBKEY در license.js پیدا نشد")
elif not raw: err("LICENSE_PUBKEY خالی است: این «نسخهٔ توسعه» و بدون قفل است. نسخهٔ فروش را با کلیدساز بساز")
else:
    try:
        k = json.loads(json.loads('"%s"' % raw))
        (ok("کلید عمومی ECDSA P-256 در license.js هست") if k.get("kty") == "EC" and k.get("crv") == "P-256" and k.get("x") and k.get("y") and "d" not in k else err("LICENSE_PUBKEY معتبر نیست یا شامل کلید خصوصی است"))
    except Exception as e: err("LICENSE_PUBKEY قابل خواندن نیست: %s" % e)
cfg = open("app/js/config.js", encoding="utf-8").read()
ok("activation: true") if re.search(r"activation:\s*true", cfg) else err("در config.js مقدار activation باید true باشد")

sw = open("sw.js", encoding="utf-8").read()
files = json.loads(re.search(r"var FILES = (\[.*?\]);", sw, re.S).group(1)); ver = re.search(r'VERSION = "([^"]+)"', sw).group(1)
miss = [f for f in files if f not in ("./", "app/") and not os.path.exists(f)]
err("فایل‌های ناموجود در FILES: %s" % miss) if miss else ok("همهٔ %d فایل SW موجودند (نسخه %s)" % (len(files), ver))
html = open("app/index.html", encoding="utf-8").read()
need = ["app/" + r for r in re.findall(r'<script[^>]*src="([^"]+)"', html)] + ["app/" + r for r in re.findall(r'<link[^>]*href="(assets/[^"]+)"', html)]
nf = [n for n in need if n not in files]
err("وابسته‌های app/index.html بیرون از کش: %s" % nf) if nf else ok("همهٔ اسکریپت‌ها و استایل‌ها در کش‌اند")
noc = [f for f in os.listdir("app/js/ui") if f.endswith(".js") and ("app/js/ui/" + f) not in files]
err("فایل‌های ui بیرون از کش: %s" % noc) if noc else None

mf = json.load(open("manifest.webmanifest", encoding="utf-8"))
for k in ("name", "short_name", "start_url", "scope", "display", "id", "icons"):
    if k not in mf: err("manifest فیلد %s ندارد" % k)
sizes = {(i["sizes"], i.get("purpose", "any")) for i in mf.get("icons", [])}
for need_ in (("192x192", "any"), ("512x512", "any"), ("512x512", "maskable")):
    if need_ not in sizes: err("آیکون %s (%s) در manifest نیست" % need_)
for i in mf.get("icons", []):
    if not os.path.exists(i["src"]): err("فایل آیکون نیست: " + i["src"])
ok("manifest و آیکون‌ها بررسی شد")
if mf.get("start_url") != "./app/" or mf.get("scope") != "./": wr("start_url/scope با پیش‌فرض‌های این پروژه فرق دارد")
if os.path.exists("keygen.html") or any(f.lower().startswith("keygen") for f in os.listdir(".")): err("فایل کلیدساز داخل پوشهٔ منتشرشده است")
if not os.path.exists(".well-known/assetlinks.json"): wr("فایل .well-known/assetlinks.json نیست؛ برای TWA بدون نوار آدرس باید در ریشهٔ دامنه باشد (README را ببین)")
print("\nنتیجه: %d خطا، %d هشدار" % (len(bad), len(warn))); sys.exit(1 if bad else 0)
