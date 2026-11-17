// منطق واقعی پیشرفت: امتیاز، سطح، ستاره، بازشدن مراحل، نشان‌ها و تکمیل روز
(function () {
  var AIX = window.AIX = window.AIX || {};
  var S = function () { return AIX.store; };
  var XP = { read: 10, explore: 5, practice: 10, quizPerQ: 10, activity: 20, challenge: { 1: 15, 2: 25, 3: 35 }, reflect: 10, dayBonus: 20, projectQuizPerQ: 10, projectDone: 50, family: 30, parentSeen: 20, lab: 20 };
  var RULES = { quizPass: 2, minChallengeChars: 20, minReflectChars: 10, minChallengeWords: 3, minReflectWords: 2, activityPass: 0.7, projectMinNotes: 3, xpPerLevel: 300, maxLevel: 7 };
  var LEVELS = ["کاوشگر نوآموز", "کاوشگر کنجکاو", "محقق کوچک", "خالق خلاق", "سازندهٔ پروژه", "استاد جعبه‌ابزار", "کاوشگر ارشد"];
  var P = AIX.progress = { XP: XP, RULES: RULES, LEVELS: LEVELS, listeners: {} };

  P.on = function (ev, fn) { (P.listeners[ev] = P.listeners[ev] || []).push(fn); };
  P.emit = function (ev, data) { (P.listeners[ev] || []).forEach(function (f) { try { f(data); } catch (e) { console.error(e); } }); };

  // ---------- ساختار دوره از روی فایل‌های محتوا ----------
  P.course = function () {
    if (P._course) return P._course;
    var order = [1, 2, 3, 4, 6, 7, 8], list = [];
    order.forEach(function (n) {
      var c = AIX.content && AIX.content["ch" + n]; if (!c) return;
      list.push({ id: c.id, n: n, title: c.title, badge: c.badge, accent: c.accent, projectTitle: c.projectTitle, projectPages: c.projectPages,
        lessons: c.lessons.map(function (l) { return { id: "c" + n + "d" + l.day, day: l.day, chapter: n, data: l }; }), projectId: "c" + n + "P" });
    });
    return (P._course = list);
  };
  P.chapter = function (n) { return P.course().filter(function (c) { return c.n === Number(n); })[0]; };
  P.lesson = function (id) {
    var m = /^c(\d)d(\d+)$/.exec(id); if (!m) return null;
    var ch = P.chapter(m[1]); if (!ch) return null;
    for (var i = 0; i < ch.lessons.length; i++) if (ch.lessons[i].id === id) return { ch: ch, lesson: ch.lessons[i], index: i };
    return null;
  };
  P.quizFor = function (id) { return (AIX.quizzes && AIX.quizzes[id]) || []; };
  P.activityFor = function (id) { return (AIX.activities && AIX.activities[id]) || null; };

  // ---------- امتیاز ----------
  P.addXp = function (key, amount) { // یک بار برای هر کلید
    var st = S().get(); if (st.awards[key] || amount <= 0) return 0;
    st.awards[key] = amount; st.xp += amount; touchActivity(); S().save(); P.emit("xp", { amount: amount }); return amount;
  };
  P.setXpLevel = function (key, amount) { // مقدار تجمعی (فقط افزایش)
    var st = S().get(), old = st.awards[key] || 0; if (amount <= old) return 0;
    var d = amount - old; st.awards[key] = amount; st.xp += d; touchActivity(); S().save(); P.emit("xp", { amount: d }); return d;
  };
  function touchActivity() { var st = S().get(), t = AIX.u.today(); if (st.activity.indexOf(t) < 0) { st.activity.push(t); if (st.activity.length > 400) st.activity.shift(); } }
  P.level = function (xp) {
    var lv = Math.min(RULES.maxLevel, Math.floor(xp / RULES.xpPerLevel) + 1), into = xp - (lv - 1) * RULES.xpPerLevel;
    return { level: lv, title: LEVELS[lv - 1], into: lv >= RULES.maxLevel ? RULES.xpPerLevel : into, need: RULES.xpPerLevel, max: lv >= RULES.maxLevel };
  };
  P.streak = function () {
    var a = S().get().activity.slice().sort(), s = 0; if (!a.length) return 0;
    var d = new Date(); function key(x) { return x.getFullYear() + "-" + ("0" + (x.getMonth() + 1)).slice(-2) + "-" + ("0" + x.getDate()).slice(-2); }
    if (a.indexOf(key(d)) < 0) { d.setDate(d.getDate() - 1); if (a.indexOf(key(d)) < 0) return 0; }
    while (a.indexOf(key(d)) >= 0) { s++; d.setDate(d.getDate() - 1); }
    return s;
  };

  // ---------- کیفیت نوشته (به‌جای شمردن ساده حرف‌ها) ----------
  // هدف: جلوگیری از «اااااا» یا تکرار یک کلمه؛ نه نمره دادن به درست یا غلط بودن جواب.
  var WHY = { len: "جوابت هنوز کوتاه است. یک جملهٔ کامل بنویس.", words: "چند کلمهٔ واقعی بنویس، نه فقط یک کلمه.", repeat: "حرف‌های تکراری حساب نمی‌شوند. با کلمه‌های خودت بنویس.", dup: "کلمه‌ها زیاد تکرار شده‌اند. نظر خودت را با کلمه‌های متفاوت بنویس.", letters: "جواب باید از کلمه‌های معنادار ساخته شود." };
  P.textQuality = function (text, minChars, minWords) {
    text = String(text || "").trim();
    if (text.length < minChars) return { ok: false, reason: "len" };
    var words = text.split(/\s+/).filter(Boolean); if (words.length < minWords) return { ok: false, reason: "words" };
    if (/(.)\1{4,}/.test(text)) return { ok: false, reason: "repeat" };
    var uniq = {}; words.forEach(function (w) { uniq[w] = 1; });
    if (words.length >= 4 && Object.keys(uniq).length / words.length < 0.5) return { ok: false, reason: "dup" };
    var letters = {}; text.replace(/[^\u0600-\u06FFa-zA-Z]/g, "").split("").forEach(function (c) { letters[c] = 1; });
    if (Object.keys(letters).length < Math.min(6, Math.floor(minChars / 2))) return { ok: false, reason: "letters" };
    return { ok: true };
  };
  P.reasonText = function (r) { return WHY[r] || WHY.len; };

  // ---------- مراحل درس ----------
  P.markRead = function (id) { var d = S().day(id); if (!d.read) { d.read = true; P.addXp("read:" + id, XP.read); S().save(); P.check(id); } };
  P.markExplore = function (id) { var d = S().day(id); if (!d.explore) { d.explore = true; P.addXp("explore:" + id, XP.explore); S().save(); } };
  P.markPractice = function (id) { var d = S().day(id); if (!d.practice) { d.practice = true; P.addXp("practice:" + id, XP.practice); S().save(); } };
  P.recordQuiz = function (id, correct, total) {
    var d = S().day(id), isProject = /P$/.test(id), first = d.quiz.attempts === 0;
    d.quiz.attempts++; d.quiz.total = total; if (correct > d.quiz.best) d.quiz.best = correct;
    if (first && correct === total) d.quiz.perfectFirst = true;
    P.setXpLevel("quiz:" + id, d.quiz.best * (isProject ? XP.projectQuizPerQ : XP.quizPerQ));
    S().save(); P.check(id); P.badges(); return d.quiz;
  };
  P.recordActivity = function (id, score) { // score بین ۰ و ۱
    var d = S().day(id); if (score > d.act.best) d.act.best = score;
    if (score >= RULES.activityPass && !d.act.done) { d.act.done = true; P.addXp("act:" + id, XP.activity); }
    S().save(); P.badges(); return d.act;
  };
  P.saveChallenge = function (id, level, text) {
    var d = S().day(id); text = (text || "").trim(); d.ch[level] = text;
    var q = P.textQuality(text, RULES.minChallengeChars, RULES.minChallengeWords), ok = q.ok; P.lastReason = q.reason;
    if (ok && !d.chDone[level]) { d.chDone[level] = true; P.addXp("ch:" + id + ":" + level, XP.challenge[level] || 15); }
    S().save(); P.check(id); return ok;
  };
  P.saveReflect = function (id, idx, text) {
    var d = S().day(id); text = (text || "").trim(); d.reflect[idx] = text;
    if (P.textQuality(text, RULES.minReflectChars, RULES.minReflectWords).ok) P.addXp("reflect:" + id, XP.reflect);
    S().save(); P.check(id); P.badges();
  };
  P.setProg = function (id, idx, v) { var d = S().day(id); d.prog[idx] = !!v; S().save(); };
  P.reflectCount = function (d) { return Object.keys(d.reflect).filter(function (k) { return P.textQuality(d.reflect[k], RULES.minReflectChars, RULES.minReflectWords).ok; }).length; };
  P.stars = function (d) { return (d.quiz.best >= RULES.quizPass ? 1 : 0) + (Object.keys(d.chDone).length ? 1 : 0) + (P.reflectCount(d) ? 1 : 0); };

  // ---------- تکمیل روز / پروژه ----------
  P.dayReady = function (id) {
    var d = S().day(id);
    return { read: d.read, quiz: d.quiz.best >= RULES.quizPass, challenge: Object.keys(d.chDone).length > 0 };
  };
  P.check = function (id) {
    var d = S().day(id); if (d.done || /P$/.test(id)) return;
    var r = P.dayReady(id);
    if (r.read && r.quiz && r.challenge) {
      d.done = true; d.doneAt = new Date().toISOString(); P.addXp("day:" + id, XP.dayBonus); d.stars = P.stars(d);
      S().save(true); P.badges(); P.emit("celebrate", { kind: "day", id: id, stars: d.stars });
    } else d.stars = P.stars(d);
  };
  P.projectNotes = function (n) { var notes = S().get().notes, p = "c" + n + "P:", c = 0; Object.keys(notes).forEach(function (k) { if (k.indexOf(p) === 0 && notes[k].trim().length >= 3 && P.textQuality(notes[k], 3, 1).ok) c++; }); return c; };
  P.projectReady = function (n) { var d = S().day("c" + n + "P"); return { quiz: d.quiz.best >= RULES.quizPass, notes: P.projectNotes(n) >= RULES.projectMinNotes, notesCount: P.projectNotes(n) }; };
  P.completeProject = function (n) {
    var id = "c" + n + "P", d = S().day(id), r = P.projectReady(n); if (d.done) return true; if (!(r.quiz && r.notes)) return false;
    d.done = true; d.doneAt = new Date().toISOString(); d.stars = 3; P.addXp("proj:" + id, XP.projectDone); S().save(true); P.badges();
    P.emit("celebrate", { kind: "project", id: id, chapter: n }); return true;
  };

  // ---------- تأیید والدین یا معلم (اختیاری، امتیاز یک‌باره) ----------
  P.parentSeen = function (n) { return !!S().day("c" + n + "P").parentSeen; };
  P.markParentSeen = function (n) { var d = S().day("c" + n + "P"); if (d.parentSeen) return 0; d.parentSeen = true; var x = P.addXp("parent:c" + n, XP.parentSeen); S().save(true); return x; };
  // ---------- آزمایشگاه‌ها و شبیه‌ساز (امتیاز یک‌باره برای هر کدام) ----------
  P.labDone = function (key) { return !!S().get().awards["lab:" + key]; };
  P.markLab = function (key) { return P.addXp("lab:" + key, XP.lab); };

  // ---------- ایستگاه خانواده (فصل ۵) ----------
  P.family = function () { return S().get().family; };
  P.familyReady = function () { var f = P.family(); return { rules: f.rules.filter(Boolean).length, total: f.rules.length, names: f.parent.trim().length >= 2 && f.child.trim().length >= 2 }; };
  P.setFamilyRule = function (i, v) { var f = P.family(); f.rules[i] = !!v; S().save(); P.checkFamily(); };
  P.setFamilyName = function (who, v) { var f = P.family(); f[who] = String(v).slice(0, 20); S().save(); P.checkFamily(); };
  P.checkFamily = function () {
    var f = P.family(), r = P.familyReady(); if (f.done) return true;
    if (r.rules === r.total && r.names) { f.done = true; f.doneAt = new Date().toISOString(); P.addXp("family", XP.family); S().save(true); P.badges(); P.emit("celebrate", { kind: "family" }); return true; }
    return false;
  };

  // ---------- بازشدن مراحل ----------
  // حالت سبک: فقط درس، آزمون و چالش (هستهٔ روز). اگر کاربر انتخابی نکرده باشد، برای گروه ۱۱ سال خودکار روشن است.
  P.lightMode = function () { var pr = S().get().profile; return pr.light === true || ((pr.light === null || pr.light === undefined) && pr.ageGroup === "a"); };
  P.openMode = function () { return !!S().get().profile.open; };
  P.isDone = function (id) { return !!S().day(id).done; };
  P.lessonUnlocked = function (n, index) {
    if (P.openMode()) return true; var ch = P.chapter(n); if (!ch || !P.chapterUnlocked(n)) return false;
    return index === 0 || P.isDone(ch.lessons[index - 1].id);
  };
  P.projectUnlocked = function (n) { if (P.openMode()) return true; var ch = P.chapter(n); return !!ch && P.chapterUnlocked(n) && ch.lessons.every(function (l) { return P.isDone(l.id); }); };
  P.chapterUnlocked = function (n) {
    if (P.openMode()) return true; var c = P.course(), i = c.map(function (x) { return x.n; }).indexOf(Number(n));
    return i <= 0 || P.isDone(c[i - 1].projectId);
  };
  P.chapterProgress = function (n) {
    var ch = P.chapter(n), done = ch.lessons.filter(function (l) { return P.isDone(l.id); }).length, total = ch.lessons.length + 1, projDone = P.isDone(ch.projectId);
    var d = done + (projDone ? 1 : 0); return { done: d, total: total, pct: Math.round(d * 100 / total), projectDone: projDone };
  };
  P.next = function () { // اولین درس یا پروژهٔ باز و ناتمام
    var c = P.course();
    for (var i = 0; i < c.length; i++) {
      if (!P.chapterUnlocked(c[i].n)) continue;
      for (var j = 0; j < c[i].lessons.length; j++) if (!P.isDone(c[i].lessons[j].id) && P.lessonUnlocked(c[i].n, j)) return { type: "lesson", id: c[i].lessons[j].id, title: c[i].lessons[j].data.title };
      if (!P.isDone(c[i].projectId) && P.projectUnlocked(c[i].n)) return { type: "project", n: c[i].n, title: c[i].projectTitle };
    }
    return null;
  };
  P.totals = function () {
    var days = S().get().days, doneDays = 0, quizzes = 0, acts = 0, perfect = 0, reflects = 0;
    Object.keys(days).forEach(function (k) { var d = days[k]; if (d.done && !/P$/.test(k)) doneDays++; if (d.quiz.attempts) quizzes++; if (d.act.done) acts++; if (d.quiz.perfectFirst) perfect++; if (P.reflectCount(d)) reflects++; });
    return { days: doneDays, quizzes: quizzes, acts: acts, perfect: perfect, reflects: reflects, totalDays: P.course().reduce(function (s, c) { return s + c.lessons.length; }, 0) };
  };

  // ---------- نشان‌ها ----------
  P.badgeDefs = function () {
    var t = P.totals(), st = S().get(), defs = [
      { id: "first_day", name: "اولین قدم", desc: "اولین روز درس را کامل کن.", icon: "flag", ok: t.days >= 1 },
      { id: "quiz_ace", name: "استاد آزمون", desc: "در سه آزمون در تلاش اول همهٔ پاسخ‌ها را درست بده.", icon: "check", ok: t.perfect >= 3 },
      { id: "detective", name: "کارآگاه", desc: "سه تمرین تعاملی را موفق انجام بده.", icon: "search", ok: t.acts >= 3 },
      { id: "reflector", name: "اندیشمند", desc: "در پنج روز بازتاب بنویس.", icon: "bulb", ok: t.reflects >= 5 },
      { id: "streak3", name: "سه روز پیوسته", desc: "سه روز پشت‌سرهم درس بخوان.", icon: "loop", ok: P.streak() >= 3 },
      { id: "poster", name: "طراح پوستر", desc: "یک پوستر در کارگاه بساز و خروجی بگیر.", icon: "pen", ok: !!(st.projects.poster && st.projects.poster.exported) },
      { id: "family", name: "خانوادهٔ کاوشگر", desc: "توافق‌نامهٔ خانوادگی فصل ۵ را با والدین کامل کن.", icon: "users", ok: !!st.family.done },
      { id: "level5", name: "سطح ۵", desc: "به سطح پنج برس.", icon: "rocket", ok: P.level(st.xp).level >= 5 }
    ];
    P.course().forEach(function (c) { defs.push({ id: "chapter" + c.n, name: c.badge, desc: "پروژهٔ فصل " + AIX.u.fa(c.n) + " را کامل کن.", icon: "star", ok: P.isDone(c.projectId), chapter: c.n }); });
    defs.push({ id: "all", name: "کاوشگر کامل", desc: "پروژهٔ همهٔ فصل‌ها را کامل کن.", icon: "atom", ok: P.course().every(function (c) { return P.isDone(c.projectId); }) });
    return defs;
  };
  P.badges = function () {
    var st = S().get(), fresh = [];
    P.badgeDefs().forEach(function (b) { if (b.ok && !st.badges[b.id]) { st.badges[b.id] = new Date().toISOString(); fresh.push(b); } });
    if (fresh.length) { S().save(true); fresh.forEach(function (b) { P.emit("badge", b); }); }
    return fresh;
  };
})();
