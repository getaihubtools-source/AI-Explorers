// ذخیره و بازیابی پیشرفت با localStorage، همراه با پشتیبان‌گیری و بازیابی
(function () {
  var AIX = window.AIX = window.AIX || {};
  var KEY = "aihub-ai-explorers:v1";
  var VERSION = 1;
  var state = null, ok = true, listeners = [];
  function fresh() {
    return { version: VERSION, profile: { nick: "", ageGroup: "", open: false, fontScale: 1, light: null, lastBackup: "", backupSnooze: "" }, xp: 0, awards: {}, days: {}, notes: {}, badges: {}, activity: [], projects: {}, family: { rules: [false, false, false, false, false, false, false, false], parent: "", child: "", done: false, doneAt: null } };
  }
  function merge(base, src) {
    if (!src || typeof src !== "object") return base;
    Object.keys(base).forEach(function (k) {
      if (!(k in src)) return;
      if (base[k] && typeof base[k] === "object" && !Array.isArray(base[k])) base[k] = merge(base[k], src[k]);
      else base[k] = src[k];
    });
    // کلیدهای پویا (روزها، یادداشت‌ها و ...) که در پیش‌فرض خالی‌اند
    ["awards", "days", "notes", "badges", "projects"].forEach(function (k) { if (src[k] && typeof src[k] === "object") base[k] = src[k]; });
    return base;
  }
  var CORRUPT = KEY + ":corrupt", MIGRATIONS = {}; // MIGRATIONS[n] = تابعی که دادهٔ نسخهٔ n را به n+1 می‌برد
  function isObj(x) { return x && typeof x === "object" && !Array.isArray(x); }
  function dayTemplate() { return { read: false, explore: false, practice: false, quiz: { best: 0, total: 0, attempts: 0, perfectFirst: false }, act: { done: false, best: 0 }, ch: {}, chDone: {}, reflect: {}, prog: {}, done: false, doneAt: null, stars: 0 }; }
  function clone(x) { return JSON.parse(JSON.stringify(x)); }
  var BAD = { "__proto__": 1, "constructor": 1, "prototype": 1 };
  // ساختار را به الگو می‌چسباند: نوع اشتباه جایگزین می‌شود، کلید اضافی حذف می‌شود، نقشه‌های خالی (مثل ch و prog) آزادند
  function coerce(base, src) {
    if (base === null) return (src === null || ["string", "number", "boolean"].indexOf(typeof src) >= 0) ? src : null;
    if (Array.isArray(base)) return Array.isArray(src) ? src : clone(base);
    if (isObj(base)) {
      if (!isObj(src)) return clone(base);
      var keys = Object.keys(base);
      if (!keys.length) { var m = {}; Object.keys(src).forEach(function (k) { if (!BAD[k]) m[k] = src[k]; }); return m; }
      var o = {}; keys.forEach(function (k) { o[k] = k in src ? coerce(base[k], src[k]) : clone(base[k]); }); return o;
    }
    return typeof src === typeof base && (typeof src !== "number" || isFinite(src)) ? src : base;
  }
  function migrate(d) { var v = typeof d.version === "number" ? d.version : 1; while (v < VERSION) { var f = MIGRATIONS[v]; if (f) d = f(d) || d; v++; } d.version = VERSION; return d; }
  function sanitize(d) {
    d = migrate(d); var out = fresh();
    out.xp = typeof d.xp === "number" && isFinite(d.xp) ? Math.max(0, Math.min(1e6, Math.round(d.xp))) : 0;
    out.profile = coerce(out.profile, d.profile); out.profile.fontScale = Math.max(0.9, Math.min(1.3, Number(out.profile.fontScale) || 1)); out.profile.nick = String(out.profile.nick || "").slice(0, 20);
    if (isObj(d.days)) Object.keys(d.days).forEach(function (k) { if (!BAD[k] && isObj(d.days[k])) out.days[k] = coerce(dayTemplate(), d.days[k]); });
    if (isObj(d.notes)) Object.keys(d.notes).forEach(function (k) { if (!BAD[k] && typeof d.notes[k] === "string") out.notes[k] = d.notes[k].slice(0, 6000); });
    ["awards", "badges"].forEach(function (key) { if (isObj(d[key])) Object.keys(d[key]).forEach(function (k) { var v = d[key][k]; if (!BAD[k] && (v === null || typeof v !== "object" || isObj(v))) out[key][k] = v; }); });
    if (isObj(d.projects)) Object.keys(d.projects).forEach(function (k) { if (!BAD[k] && isObj(d.projects[k])) out.projects[k] = d.projects[k]; });
    if (Array.isArray(d.activity)) out.activity = d.activity.slice(-200);
    out.family = coerce(out.family, d.family);
    if (!Array.isArray(out.family.rules) || out.family.rules.length !== 8) out.family.rules = fresh().family.rules;
    out.family.rules = out.family.rules.map(function (x) { return x === true; });
    return out;
  }
  var store = AIX.store = {};
  store.recovered = false;
  store.available = function () { return ok; };
  store.load = function () {
    var raw = null;
    try { raw = window.localStorage.getItem(KEY); state = raw ? sanitize(JSON.parse(raw)) : fresh(); }
    catch (e) {
      state = fresh();
      if (raw) { store.recovered = true; try { window.localStorage.setItem(CORRUPT, raw); } catch (e2) {} } // نسخهٔ خراب را قبل از بازنویسی نگه می‌دارد
      else ok = false;
    }
    return state;
  };
  var flush = function () { if (!state) return; try { window.localStorage.setItem(KEY, JSON.stringify(state)); ok = true; } catch (e) { ok = false; } };
  var flushSoon = AIX.u.debounce(flush, 250);
  store.get = function () { return state || store.load(); };
  store.save = function (immediate) { listeners.forEach(function (f) { try { f(state); } catch (e) {} }); immediate ? flush() : flushSoon(); };
  store.flushNow = flush;
  // ذخیرهٔ فوری هنگام رفتن برنامه به پس‌زمینه یا بسته شدن (اندروید برنامه را ناگهانی می‌بندد)
  document.addEventListener("visibilitychange", function () { if (document.visibilityState === "hidden") flush(); });
  window.addEventListener("pagehide", flush);
  store.requestPersist = function () { try { if (navigator.storage && navigator.storage.persist) navigator.storage.persist(); } catch (e) {} };
  store.corruptRaw = function () { try { return window.localStorage.getItem(CORRUPT); } catch (e) { return null; } };
  store.clearCorrupt = function () { try { window.localStorage.removeItem(CORRUPT); } catch (e) {} store.recovered = false; };
  store.markBackup = function () { store.get().profile.lastBackup = AIX.u.today(); store.save(true); };
  store.snoozeBackup = function (days) { var t = new Date(); t.setDate(t.getDate() + (days || 7)); store.get().profile.backupSnooze = t.toISOString().slice(0, 10); store.save(true); };
  store.backupDue = function () {
    var st = store.get(), pr = st.profile, now = AIX.u.today(); if (st.xp < 60) return false; if (pr.backupSnooze && now < pr.backupSnooze) return false;
    if (!pr.lastBackup) return true; return (Date.parse(now) - Date.parse(pr.lastBackup)) / 864e5 >= 14;
  };
  store.subscribe = function (f) { listeners.push(f); };
  store.day = function (id) { var d = store.get().days; if (!d[id]) d[id] = dayTemplate(); return d[id]; };
  store.note = function (k) { return store.get().notes[k] || ""; };
  store.setNote = function (k, v) { var n = store.get().notes; if (v) n[k] = v; else delete n[k]; store.save(); };
  store.exportJSON = function () { return JSON.stringify({ app: "aihub-ai-explorers", exportedAt: new Date().toISOString(), data: store.get() }, null, 2); };
  // اعتبارسنجی ساده قبل از بازیابی: ساختار و نوع‌ها
  store.importJSON = function (text) {
    var obj; try { obj = JSON.parse(text); } catch (e) { return { ok: false, error: "فایل خراب است یا فرمت JSON ندارد." }; }
    if (!obj || obj.app !== "aihub-ai-explorers" || !obj.data) return { ok: false, error: "این فایل پشتیبان این برنامه نیست." };
    var d = obj.data;
    if (typeof d.xp !== "number" || d.xp < 0 || d.xp > 1e6) return { ok: false, error: "مقدار امتیاز در فایل معتبر نیست." };
    if (typeof d.days !== "object" || typeof d.notes !== "object" || typeof d.profile !== "object") return { ok: false, error: "ساختار فایل کامل نیست." };
    if (typeof d.version === "number" && d.version > VERSION) return { ok: false, error: "این پشتیبان از نسخهٔ جدیدتر برنامه است." };
    if (d.family !== undefined) {
      var f = d.family; if (!f || typeof f !== "object" || !Array.isArray(f.rules) || f.rules.length !== 8 || f.rules.some(function (x) { return typeof x !== "boolean"; })) return { ok: false, error: "بخش توافق‌نامهٔ خانوادگی در فایل معتبر نیست." };
    }
    try { state = sanitize(d); } catch (e) { return { ok: false, error: "ساختار فایل پشتیبان قابل بازیابی نیست." }; } store.save(true); return { ok: true };
  };
  store.reset = function () { state = fresh(); store.save(true); };
})();
