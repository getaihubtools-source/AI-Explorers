// فعال‌سازی با کد امضاشده و قفل‌شده به یک دستگاه (ECDSA P-256).
// فقط کلید عمومی داخل برنامه است؛ کلید خصوصی فقط پیش فروشنده (فایل AIhub-AI-Explorers-Keygen.html) می‌ماند.
// ابزار فروشنده خط LICENSE_PUBKEY را پر می‌کند. تا آن موقع «نسخهٔ توسعه» است و همه‌چیز باز است.
// این قفل جلوی کپی‌کردن کد روی دستگاه دیگر را می‌گیرد، ولی فایل‌های محتوا عمومی‌اند و این قفل محافظت کامل محتوا نیست.
(function () {
  var AIX = window.AIX = window.AIX || {};
  const LICENSE_PUBKEY = "{\"kty\":\"EC\",\"crv\":\"P-256\",\"x\":\"l0LAH4tXY9owyDa9FJoMIKiPWZX4qJ1wRGfEEKlXAS8\",\"y\":\"Sb00TEH6IRYz72R_A5PpRxoqSg793B-F-2vdkqKkYbk\"}";
  var L = AIX.license = {}, KEY = "aihub-ai-explorers:license", DEV = "aihub-ai-explorers:device", PREFIX = "AIX1", CFG = window.AIX_CONFIG || { activation: false };
  var DAL = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  var DEVRE = /^[A-HJ-KM-NP-Z2-9]{8}$/;
  function ls(k) { try { return window.localStorage.getItem(k); } catch (e) { return null; } }
  function lset(k, v) { try { window.localStorage.setItem(k, v); return true; } catch (e) { return false; } }
  function lrm(k) { try { window.localStorage.removeItem(k); } catch (e) {} }
  function read() { try { return JSON.parse(ls(KEY)) || null; } catch (e) { return null; } }
  function today() { return new Date().toISOString().slice(0, 10); }
  function devMode() { return !LICENSE_PUBKEY; }
  function norm(s) { return String(s || "").replace(/[۰-۹]/g, function (c) { return "۰۱۲۳۴۵۶۷۸۹".indexOf(c); }).replace(/[٠-٩]/g, function (c) { return "٠١٢٣٤٥٦٧٨٩".indexOf(c); }).replace(/\s+/g, ""); }
  function unb64u(t) { t = t.replace(/-/g, "+").replace(/_/g, "/"); while (t.length % 4) t += "="; var b = atob(t), u = new Uint8Array(b.length); for (var i = 0; i < b.length; i++) u[i] = b.charCodeAt(i); return u; }

  // کد دستگاه: ۸ نویسهٔ تصادفی که روی همین مرورگر ذخیره می‌شود. با پاک شدن اطلاعات مرورگر عوض می‌شود (بازصدور لازم است).
  L.deviceCode = function () {
    var d = ls(DEV); if (d && DEVRE.test(d)) return d;
    var o = "", b = new Uint8Array(1), lim = 256 - 256 % DAL.length;
    while (o.length < 8) { crypto.getRandomValues(b); if (b[0] < lim) o += DAL.charAt(b[0] % DAL.length); }
    lset(DEV, o); return o;
  };
  L.deviceLabel = function () { var d = L.deviceCode(); return d.slice(0, 4) + "-" + d.slice(4); };

  function expiry(rec) { // تاریخ آخرین روز اعتبار یا null (دائمی)
    if (rec.x) return rec.x;
    if (rec.d) { var t = new Date(rec.at); t.setUTCDate(t.getUTCDate() + rec.d); return t.toISOString().slice(0, 10); }
    return null;
  }
  L.info = function () { var r = read(); if (!r) return null; return { buyer: r.n, expires: expiry(r), device: L.deviceLabel() }; };
  L.active = function () {
    if (!CFG.activation || devMode()) return true;
    var r = read(); if (!r || r.dv !== L.deviceCode()) return false;
    var e = expiry(r); return !e || today() <= e;
  };
  L.locked = function () { return !L.active(); };
  L.freeId = function () { try { return AIX.progress.course()[0].lessons[0].id; } catch (e) { return "c1d1"; } };
  function fail(m) { return { ok: false, error: m }; }

  function verify(code) {
    var p = norm(code).split(".");
    if (p.length !== 3 || p[0] !== PREFIX) return Promise.reject("format");
    var body = unb64u(p[1]), sig = unb64u(p[2]), pub = JSON.parse(LICENSE_PUBKEY), o;
    try { o = JSON.parse(new TextDecoder().decode(body)); } catch (e) { return Promise.reject("format"); }
    return crypto.subtle.importKey("jwk", pub, { name: "ECDSA", namedCurve: "P-256" }, false, ["verify"])
      .then(function (k) { return crypto.subtle.verify({ name: "ECDSA", hash: "SHA-256" }, k, sig, body); })
      .then(function (ok) { if (!ok) throw "sig"; return o; });
  }
  L.activate = function (raw) {
    if (devMode()) return Promise.resolve({ ok: true });
    if (!(window.crypto && crypto.subtle)) return Promise.resolve(fail("فعال‌سازی فقط روی آدرس https یا localhost کار می‌کند."));
    if (!norm(raw)) return Promise.resolve(fail("کد را وارد کن."));
    return verify(raw).then(function (o) {
      if (o.v !== 2 || !DEVRE.test(o.dv || "")) return fail("این کد برای این نسخهٔ برنامه نیست.");
      if (o.dv !== L.deviceCode()) return fail("این کد برای دستگاه دیگری صادر شده است. کد دستگاه این مرورگر را برای فروشنده بفرست.");
      if (o.b && today() > o.b) return fail("مهلت فعال‌سازی این کد تمام شده است. از فروشنده کد تازه بخواه.");
      if (o.x && today() > o.x) return fail("اعتبار این کد تمام شده است.");
      var rec = { code: norm(raw), n: o.n, dv: o.dv, x: o.x || null, d: o.d || null, at: new Date().toISOString() };
      var prev = read(); if (prev && prev.code === rec.code && prev.at) rec.at = prev.at; // مدت «N روز» از اولین فعال‌سازی حساب می‌شود
      if (!lset(KEY, JSON.stringify(rec))) return fail("ذخیره‌سازی مرورگر در دسترس نیست.");
      return { ok: true };
    }).catch(function (e) { return fail(e === "sig" ? "این کد معتبر نیست. آن را دقیق و کامل از فروشنده کپی کن." : "کد درست نیست. آن را کامل کپی کن."); });
  };
  // امضای کد ذخیره‌شده را هر بار باز شدن برنامه دوباره می‌سنجد (بدون اینترنت).
  // فقط وقتی مجوز پاک می‌شود که امضا/دستگاه/قالب قطعاً نادرست باشد؛ خطای ناپایدار مرورگر مجوز را نمی‌پراند.
  L.recheck = function () {
    if (!CFG.activation || devMode()) return; var r = read(); if (!r) return;
    Promise.resolve().then(function () { return verify(r.code); }).then(function (o) { if (o.dv !== L.deviceCode()) throw "dev"; })
      .catch(function (e) { if (e === "sig" || e === "format" || e === "dev") { lrm(KEY); if (AIX.router) AIX.router.render(); } });
  };
})();
