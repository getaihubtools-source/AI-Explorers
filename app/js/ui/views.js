// صفحه‌های برنامه: خانه، نقشه، فصل، درس، پروژه، کارگاه، دستاوردها، تنظیمات، والدین، واژه‌نامه
(function () {
  var AIX = window.AIX = window.AIX || {}, u = AIX.u, h = u.h, P = function () { return AIX.progress; };
  var V = AIX.views = AIX.views || {};
  var ACC = { cyan: "cyan", violet: "violet", orange: "orange", yellow: "yellow", green: "green", blue: "blue", purple: "purple" };
  var go = function (hash) { AIX.router.go(hash); };
  function page(title, lead) { return h("div", { class: "page-head" }, h("h1", null, title), lead ? h("p", { class: "lead" }, lead) : null); }
  function html(cls, s) { return h("div", { class: cls, html: s }); }
  function starsRow(n, max) { var s = ""; for (var i = 0; i < (max || 3); i++) s += '<span class="star' + (i < n ? " on" : "") + '">' + AIX.ic("star", 16) + "</span>"; return h("span", { class: "stars", "aria-label": u.fa(n) + " از " + u.fa(max || 3) + " ستاره", html: s }); }
  function locked(root, msg, hash) { u.clear(root); root.appendChild(h("div", { class: "card center" }, h("div", { html: AIX.ic("lock", 36) }), h("h2", null, "این بخش هنوز بسته است"), h("p", null, msg), h("a", { class: "btn primary", href: hash || "#/map" }, "بازگشت به مسیر"))); }
  function xpBar() { var st = AIX.store.get(), lv = P().level(st.xp); return h("div", { class: "xpbox" }, h("div", { class: "xp-top" }, h("strong", null, "سطح " + u.fa(lv.level) + " · " + lv.title), h("span", null, u.fa(st.xp) + " امتیاز")), h("div", { class: "bar" }, h("b", { style: "width:" + Math.round(lv.into * 100 / lv.need) + "%" })), h("small", { class: "muted" }, lv.max ? "به بالاترین سطح رسیده‌ای!" : u.fa(lv.need - lv.into) + " امتیاز تا سطح بعد")); }

  // ---------- خانه ----------
  V.home = function (root) {
    var st = AIX.store.get(), nx = P().next(), tot = P().totals(), name = st.profile.nick;
    u.clear(root);
    if (AIX.store.backupDue()) root.appendChild(h("div", { class: "card warn-box backup-due" }, h("p", null, "از پیشرفتت پشتیبان بگیر تا اگر اطلاعات برنامه پاک شد، از بین نرود."),
      h("div", { class: "row-actions" }, h("button", { type: "button", class: "btn primary", onclick: function () { u.download("aihub-explorers-backup-" + u.today() + ".json", AIX.store.exportJSON(), "application/json"); AIX.store.markBackup(); AIX.router.render(); } }, "دانلود پشتیبان"), h("button", { type: "button", class: "btn ghost", onclick: function () { AIX.store.snoozeBackup(7); AIX.router.render(); } }, "هفتهٔ بعد یادآوری کن"))));
    root.appendChild(h("section", { class: "hero pattern-girih" }, h("div", { class: "hero-text" }, h("p", { class: "eyebrow" }, "آکادمی کاوشگران هوش مصنوعی"), h("h1", null, name ? "سلام " + name + "!" : "سلام کاوشگر!"), h("p", { class: "lead" }, "یاد بگیر، کشف کن، بساز. ماجراجویی تو با هوش مصنوعی از همین‌جا شروع می‌شود."),
      nx ? h("a", { class: "btn primary big", href: nx.type === "lesson" ? "#/lesson/" + nx.id : "#/project/" + nx.n }, h("span", { html: AIX.ic("rocket", 20) }), "ادامه: " + nx.title) : h("p", { class: "chip ok" }, "همهٔ مرحله‌ها را کامل کرده‌ای. آفرین!"), xpBar()), h("img", { class: "hero-img", src: "assets/img/robot.svg", alt: "ربات کاوشگر", width: 260, height: 325 })));
    root.appendChild(h("div", { class: "stats" }, stat("روز کامل‌شده", u.fa(tot.days) + " از " + u.fa(tot.totalDays), "flag"), stat("آزمون‌های انجام‌شده", u.fa(tot.quizzes), "check"), stat("تمرین‌های تعاملی", u.fa(tot.acts), "search"), stat("روزهای پیوسته", u.fa(P().streak()), "flame")));
    root.appendChild(h("h2", { class: "sec" }, "فصل‌ها"));
    root.appendChild(chapterGrid());
    root.appendChild(h("div", { class: "quick" }, h("a", { class: "card link", href: "#/labs" }, h("span", { html: AIX.ic("flask", 24) }), h("div", null, h("strong", null, "آزمایشگاه‌ها"), h("p", null, "مدل بساز و کارآگاه شبیه‌ساز باش."))), h("a", { class: "card link", href: "#/lab" }, h("span", { html: AIX.ic("pen", 24) }), h("div", null, h("strong", null, "کارگاه پروژه‌ها"), h("p", null, "پوستر علمی خودت را بساز."))), h("a", { class: "card link", href: "#/parents" }, h("span", { html: AIX.ic("users", 24) }), h("div", null, h("strong", null, "راهنمای والدین"), h("p", null, "همراهی هوشمندانه با فرزندتان."))), h("a", { class: "card link", href: "#/glossary" }, h("span", { html: AIX.ic("book", 24) }), h("div", null, h("strong", null, "واژه‌نامه"), h("p", null, "معنی ساده واژه‌های دوره.")))));
  };
  function stat(label, val, icon) { return h("div", { class: "stat" }, h("span", { class: "ibox", html: AIX.ic(icon, 20) }), h("strong", null, val), h("small", null, label)); }
  function familyCard() {
    var f = P().family(), r = P().familyReady();
    return h("a", { class: "card chap family-card", href: "#/family", "data-acc": ACC.green, "aria-label": "فصل ۵: ایستگاه خانواده، ویژهٔ والدین" }, h("div", { class: "chap-n", html: AIX.ic("users", 26) }), h("div", null, h("h3", null, "فصل ۵ · ایستگاه خانواده"), h("p", { class: "muted" }, f.done ? "توافق‌نامه امضا شد" : "ویژهٔ والدین · " + u.fa(r.rules) + " از " + u.fa(r.total) + " قانون پذیرفته شده"), h("div", { class: "bar" }, h("b", { style: "width:" + (f.done ? 100 : Math.round(r.rules * 100 / r.total)) + "%" }))));
  }
  function chapterGrid() {
    var g = h("div", { class: "grid chapters" });
    P().course().forEach(function (c) {
      var pr = P().chapterProgress(c.n), un = P().chapterUnlocked(c.n);
      if (c.n === 6) g.appendChild(familyCard());
      g.appendChild(h("a", { class: "card chap" + (un ? "" : " locked"), href: un ? "#/chapter/" + c.n : "#/map", "data-acc": ACC[c.accent], "aria-label": "فصل " + u.fa(c.n) + ": " + c.title + (un ? "" : " (بسته)") },
        h("div", { class: "chap-n" }, u.fa(c.n)), h("div", null, h("h3", null, c.title), h("p", { class: "muted" }, un ? u.fa(pr.done) + " از " + u.fa(pr.total) + " مرحله کامل شده" : "با کامل کردن فصل قبل باز می‌شود"), h("div", { class: "bar" }, h("b", { style: "width:" + pr.pct + "%" }))), un ? null : h("span", { class: "lockic", html: AIX.ic("lock", 18) })));
    });
    return g;
  }

  // ---------- نقشهٔ مسیر ----------
  V.map = function (root) {
    u.clear(root); root.appendChild(page("نقشهٔ مسیر یادگیری", "هر روز را کامل کن تا روز بعد باز شود. پروژهٔ هر فصل بعد از همهٔ درس‌ها باز می‌شود."));
    P().course().forEach(function (c) {
      var un = P().chapterUnlocked(c.n), pr = P().chapterProgress(c.n), box = h("section", { class: "map-chap card", "data-acc": ACC[c.accent] });
      box.appendChild(h("div", { class: "map-head" }, h("h2", null, "فصل " + u.fa(c.n) + " · " + c.title), h("span", { class: "chip" }, u.fa(pr.pct) + "٪")));
      var path = h("div", { class: "path" });
      c.lessons.forEach(function (l, i) {
        var d = AIX.store.day(l.id), ok = un && P().lessonUnlocked(c.n, i), done = d.done;
        path.appendChild(h(ok ? "a" : "span", { class: "node-l" + (done ? " done" : ok ? " open" : " lock"), href: ok ? "#/lesson/" + l.id : null, title: l.data.title, "aria-label": "روز " + u.fa(l.day) + ": " + l.data.title + (done ? " (کامل)" : ok ? "" : " (بسته)") }, h("b", null, u.fa(l.day)), done ? starsRow(d.stars) : (ok ? null : h("i", { html: AIX.ic("lock", 14) }))));
      });
      var pok = P().projectUnlocked(c.n), pd = P().isDone(c.projectId);
      path.appendChild(h(pok ? "a" : "span", { class: "node-l proj" + (pd ? " done" : pok ? " open" : " lock"), href: pok ? "#/project/" + c.n : null, title: c.projectTitle, "aria-label": "پروژهٔ فصل " + u.fa(c.n) + (pd ? " (کامل)" : pok ? "" : " (بسته)") }, h("span", { html: AIX.ic(pd ? "trophy" : pok ? "flag" : "lock", 20) })));
      if (c.n === 6) root.appendChild(familyStation());
      box.appendChild(path); box.appendChild(h("p", { class: "muted" }, "پروژه: " + c.projectTitle)); root.appendChild(box);
    });
  };

  function familyStation() {
    var f = P().family(), r = P().familyReady();
    return h("a", { class: "card family-station", href: "#/family", "data-acc": ACC.green }, h("span", { class: "ibox", html: AIX.ic("users", 22) }), h("div", { class: "f1" }, h("strong", null, "فصل ۵ · ایستگاه خانواده (ویژهٔ والدین)"), h("p", { class: "muted" }, f.done ? "توافق‌نامهٔ خانوادگی امضا شد." : "توافق‌نامهٔ خانوادگی را با والدینت بساز. اجباری نیست، ولی قبل از فصل ۶ پیشنهاد می‌شود. " + u.fa(r.rules) + " از " + u.fa(r.total) + " قانون پذیرفته شده."), h("span", { class: "chip " + (f.done ? "ok" : "") }, f.done ? "کامل" : "باز")));
  }

  // ---------- فصل ----------
  V.chapter = function (root, n) {
    var c = P().chapter(n); if (!c) { u.clear(root); root.appendChild(page("فصل پیدا نشد")); return; }
    if (!P().chapterUnlocked(c.n)) return locked(root, "با کامل کردن پروژهٔ فصل قبل، این فصل باز می‌شود.");
    u.clear(root); root.appendChild(h("a", { class: "back", href: "#/map" }, "بازگشت به نقشه"));
    root.appendChild(page("فصل " + u.fa(c.n) + " · " + c.title, "نشان این فصل: " + c.badge));
    var list = h("div", { class: "lessons" });
    c.lessons.forEach(function (l, i) {
      var d = AIX.store.day(l.id), ok = P().lessonUnlocked(c.n, i);
      list.appendChild(h(ok ? "a" : "div", { class: "card lesson-card" + (ok ? "" : " locked") + (d.done ? " done" : ""), href: ok ? "#/lesson/" + l.id : null, "data-acc": ACC[c.accent] },
        h("div", { class: "day-n" }, u.fa(l.day)), h("div", { class: "f1" }, h("h3", null, l.data.title), h("p", { class: "muted" }, l.data.mission)), d.done ? starsRow(d.stars) : h("span", { class: "chip" }, ok ? "باز" : "بسته")));
    });
    var pok = P().projectUnlocked(c.n), pd = P().isDone(c.projectId);
    list.appendChild(h(pok ? "a" : "div", { class: "card lesson-card proj" + (pok ? "" : " locked") + (pd ? " done" : ""), href: pok ? "#/project/" + c.n : null, "data-acc": ACC[c.accent] }, h("div", { class: "day-n", html: AIX.ic("flag", 22) }), h("div", { class: "f1" }, h("h3", null, "پروژهٔ نهایی: " + c.projectTitle), h("p", { class: "muted" }, "همهٔ مهارت‌های فصل را در یک پرونده جمع کن.")), h("span", { class: "chip" }, pd ? "کامل" : pok ? "باز" : "بسته")));
    root.appendChild(list);
  };

  // ---------- درس ----------
  var OPTIONAL = { explore: 1, practice: 1, activity: 1, reflect: 1 };
  var GROUPS = { learn: ["learn", "school", "scale", "matrix", "privacy", "safe"], explore: ["explore"], practice: ["investigate", "create"] };
  function sectionsHtml(L, keys) { return L.sections.filter(function (s) { return keys.indexOf(s.key) >= 0; }).map(function (s) { return s.html; }).join(""); }
  V.lesson = function (root, id, step) {
    var info = P().lesson(id); if (!info) { u.clear(root); root.appendChild(page("درس پیدا نشد")); return; }
    var ch = info.ch, L = info.lesson.data, d = AIX.store.day(id);
    if (!P().lessonUnlocked(ch.n, info.index)) return locked(root, "ابتدا روز قبل را کامل کن.", "#/chapter/" + ch.n);
    var acts = P().activityFor(id), steps = [["learn", "درس"], ["explore", "کاوش"], ["practice", "تمرین"], ["quiz", "آزمون"]].concat(acts ? [["activity", "بازی"]] : []).concat([["challenge", "چالش"], ["reflect", "بازتاب"]]);
    step = steps.some(function (s) { return s[0] === step; }) ? step : "learn";
    var stat = { learn: d.read, explore: d.explore, practice: d.practice, quiz: d.quiz.best >= P().RULES.quizPass, activity: d.act.done, challenge: Object.keys(d.chDone).length > 0, reflect: P().reflectCount(d) > 0 };
    u.clear(root); root.setAttribute("data-acc", ACC[ch.accent]);
    root.appendChild(h("a", { class: "back", href: "#/chapter/" + ch.n }, "فصل " + u.fa(ch.n) + " · " + ch.title));
    root.appendChild(h("div", { class: "page-head" }, h("span", { class: "chip" }, "روز " + u.fa(info.lesson.day)), h("h1", null, L.title)));
    var light = P().lightMode(), all = steps; steps = steps.filter(function (s) { return !light || !OPTIONAL[s[0]] || s[0] === step; });
    var nav = h("nav", { class: "steps", "aria-label": "مرحله‌های درس" });
    steps.forEach(function (s, i) { nav.appendChild(h("a", { class: "step" + (s[0] === step ? " cur" : "") + (stat[s[0]] ? " ok" : ""), href: "#/lesson/" + id + "/" + s[0], "aria-current": s[0] === step ? "step" : null }, h("b", null, u.fa(i + 1)), s[1], OPTIONAL[s[0]] ? h("small", { class: "opt-tag" }, "اختیاری") : null)); });
    root.appendChild(nav);
    if (light) { var tg = h("button", { type: "button", class: "btn tiny ghost" }, "نمایش همهٔ مرحله‌ها"); tg.addEventListener("click", function () { AIX.store.get().profile.light = false; AIX.store.save(true); AIX.router.render(); }); root.appendChild(h("p", { class: "time-note" }, "حالت سبک: فقط درس، آزمون و چالش (حدود " + u.fa(15) + " دقیقه). ", tg)); }
    else root.appendChild(h("p", { class: "time-note" }, "زمان تقریبی: هستهٔ درس (درس، آزمون، چالش) حدود " + u.fa(15) + " دقیقه · با همهٔ مرحله‌ها حدود " + u.fa(acts ? 35 : 30) + " دقیقه. مرحله‌های «اختیاری» برای روز کامل‌شدن لازم نیستند ولی امتیاز و ستاره می‌دهند."));
    var ready = P().dayReady(id);
    root.appendChild(h("div", { class: "ready" }, readyChip("درس را خواندم", ready.read), readyChip("آزمون را گذراندم", ready.quiz), readyChip("یک چالش ثبت کردم", ready.challenge), d.done ? h("span", { class: "chip ok" }, "روز کامل شد · " + u.fa(d.stars) + " ستاره") : null));
    var body = h("div", { class: "lesson-body" }); root.appendChild(body);
    var idx = steps.map(function (s) { return s[0]; }).indexOf(step), nextKey = steps[idx + 1] && steps[idx + 1][0];
    var nextBtn = function (label, fn) { return h("button", { type: "button", class: "btn primary", onclick: function () { if (fn) fn(); if (nextKey) go("#/lesson/" + id + "/" + nextKey); else go("#/chapter/" + ch.n); } }, label); };
    var prefix = id + ":" + step;
    if (step === "learn") {
      if (id === "c6d1" && !AIX.progress.family().done) body.appendChild(h("a", { class: "card family-remind", href: "#/family", "data-acc": ACC.green }, h("span", { class: "ibox", html: AIX.ic("users", 20) }), h("div", null, h("strong", null, "یادآوری قبل از شروع"), h("p", null, "اگر هنوز توافق‌نامهٔ خانوادگی فصل ۵ را با والدینت امضا نکرده‌ای، اول آن را انجام بده. اجباری نیست. برای رفتن به ایستگاه خانواده بزن."))));
      body.appendChild(h("div", { class: "card dk mission" }, h("div", { class: "ch" }, h("span", { class: "ibox", html: AIX.ic("flag", 18) }), h("h3", null, "مأموریت")), h("p", null, L.mission)));
      body.appendChild(AIX.enhance(html("content", sectionsHtml(L, GROUPS.learn)), prefix));
      if (L.tip) body.appendChild(h("div", { class: "card ac tip" }, h("strong", null, "نکتهٔ کاوشگر: "), L.tip));
      body.appendChild(nextBtn("درس را خواندم؛ برو به کاوش", function () { P().markRead(id); }));
    } else if (step === "explore") {
      body.appendChild(AIX.enhance(html("content", sectionsHtml(L, GROUPS.explore)), prefix));
      AIX.simsFor(id).forEach(function (sid) { var S = AIX.sims[sid]; body.appendChild(h("a", { class: "card link sim-link", href: "#/labs/sim/" + sid }, h("span", { html: AIX.ic("chat", 24) }), h("div", null, h("strong", null, "بدون ابزار هم می‌شود: شبیه‌ساز آفلاین"), h("p", null, S.title + " · گفت‌وگوی ساختگی برای تمرین همین مهارت")))); });
      body.appendChild(h("p", { class: "note" }, "این برنامه به هیچ هوش مصنوعی وصل نیست. پرسش‌ها را برای استفاده در یک ابزار مجاز و با کمک بزرگسال کپی می‌کنی. اگر ابزار نداری، همین کار را روی کاغذ و با معلم یا والدین انجام بده."));
      body.appendChild(nextBtn("کاوش کردم؛ ادامه", function () { P().markExplore(id); }));
    } else if (step === "practice") {
      var wrote = false;
      body.appendChild(AIX.enhance(html("content", sectionsHtml(L, GROUPS.practice)), prefix, { onWrite: function () { if (!wrote) { wrote = true; P().markPractice(id); AIX.router.softRefresh(); } } }));
      body.appendChild(nextBtn(nextKey === "quiz" ? "ادامه به آزمون" : "ادامه"));
    } else if (step === "quiz") {
      var q = h("div", { class: "card" }); body.appendChild(q);
      AIX.renderQuiz(q, id, function (rec, pass) { AIX.router.softRefresh(); if (pass) { var b = h("p", null, nextBtn("ادامه")); q.appendChild(b); } });
    } else if (step === "activity") {
      var a = h("div", { class: "card" }); body.appendChild(a); AIX.renderActivity(a, id, function () { AIX.router.softRefresh(); });
      body.appendChild(h("p", null, nextBtn(nextKey ? "ادامه به چالش" : "پایان درس")));
    } else if (step === "challenge") { challenge(body, id, L, d, ch); body.appendChild(h("p", null, nextBtn(nextKey ? "ادامه به بازتاب" : "پایان درس"))); }
    else if (step === "reflect") reflect(body, id, L, d, ch, info);
  };
  function readyChip(t, ok) { return h("span", { class: "chip" + (ok ? " ok" : "") }, (ok ? "✓ " : "○ ") + t); }
  function challenge(body, id, L, d, ch) {
    var age = AIX.store.get().profile.ageGroup, sug = { a: 1, b: 2, c: 3 }[age] || 0, cur = sug || (L.challenges[0] && L.challenges[0].level) || 1;
    body.appendChild(h("p", { class: "lead" }, "یک سطح را انتخاب کن و جوابت را با کلمه‌های خودت بنویس (حداقل " + u.fa(P().RULES.minChallengeChars) + " حرف و چند کلمهٔ واقعی). هر سطح فقط یک بار امتیاز می‌دهد، ولی هر وقت خواستی می‌توانی جوابت را ویرایش کنی."));
    var tabs = h("div", { class: "tabs", role: "tablist" }), panel = h("div", { class: "card chall" });
    function show(level) {
      cur = level; u.$$(".tab", tabs).forEach(function (t) { var on = Number(t.getAttribute("data-l")) === level; t.classList.toggle("on", on); t.setAttribute("aria-selected", on ? "true" : "false"); });
      var c = L.challenges.filter(function (x) { return x.level === level; })[0]; u.clear(panel); if (!c) return;
      panel.appendChild(h("div", { class: "row-chips" }, h("span", { class: "chip" }, "سطح " + u.fa(level)), h("span", { class: "chip" }, c.ages), sug === level ? h("span", { class: "chip ok" }, "پیشنهاد برای گروه سنی تو") : null, d.chDone[level] ? h("span", { class: "chip ok" }, "ثبت شد") : null));
      panel.appendChild(AIX.enhance(html("content", c.html), id + ":ch" + level));
      var ta = h("textarea", { class: "write-input tall", rows: 5, maxlength: 1500, placeholder: "جواب چالش را اینجا بنویس…", "aria-label": "جواب چالش" }); ta.value = d.ch[level] || "";
      var msg = h("div", { class: "form-msg", "aria-live": "polite" });
      var btn = h("button", { type: "button", class: "btn primary" }, d.chDone[level] ? "ذخیرهٔ ویرایش" : "ثبت پاسخ چالش");
      btn.addEventListener("click", function () {
        var was = !!AIX.store.day(id).chDone[level], ok = P().saveChallenge(id, level, ta.value);
        msg.className = "form-msg show " + (ok ? "ok" : "no"); msg.textContent = ok ? (was ? "ویرایش ذخیره شد." : "پاسخ ثبت شد و امتیاز گرفتی!") : P().reasonText(P().lastReason);
        if (ok) { AIX.router.softRefresh(); show(level); }
      });
      panel.appendChild(ta); panel.appendChild(btn); panel.appendChild(msg);
    }
    L.challenges.forEach(function (c) { var t = h("button", { type: "button", class: "tab", role: "tab", "data-l": c.level }, "سطح " + u.fa(c.level) + (c.level === 1 ? " · شروع" : c.level === 2 ? " · کاوش" : " · پیشرفته")); t.addEventListener("click", function () { show(c.level); }); tabs.appendChild(t); });
    body.appendChild(tabs); body.appendChild(panel); show(cur);
  }
  function reflect(body, id, L, d, ch, info) {
    body.appendChild(h("p", { class: "lead" }, "به سؤال‌ها جواب بده. بازتاب یعنی فکر کردن به چیزی که یاد گرفتی."));
    L.reflect.forEach(function (q, i) {
      var ta = h("textarea", { class: "write-input", rows: 3, maxlength: 800, "aria-label": q }); ta.value = d.reflect[i] || "";
      ta.addEventListener("blur", function () { P().saveReflect(id, i, ta.value); AIX.router.softRefresh(); });
      body.appendChild(h("div", { class: "card" }, h("strong", null, q), ta));
    });
    var prog = h("div", { class: "card" }, h("strong", null, "پیشرفت من"));
    L.progress.forEach(function (t, i) { var cb = h("input", { type: "checkbox", id: id + "pg" + i }); cb.checked = !!d.prog[i]; cb.addEventListener("change", function () { P().setProg(id, i, cb.checked); }); prog.appendChild(h("label", { class: "check" }, cb, " " + t)); });
    body.appendChild(prog);
    var r = P().dayReady(id), dd = AIX.store.day(id);
    var box = h("div", { class: "card donebox " + (dd.done ? "ok-box" : "") }, h("h3", null, dd.done ? "این روز کامل شد" : "برای کامل شدن روز لازم است:"),
      h("ul", { class: "reqs" }, h("li", { class: r.read ? "ok" : "" }, "درس را بخوانی"), h("li", { class: r.quiz ? "ok" : "" }, "آزمون را بگذرانی (حداقل " + u.fa(P().RULES.quizPass) + " پاسخ درست)"), h("li", { class: r.challenge ? "ok" : "" }, "یک سطح از چالش را ثبت کنی")));
    var nx = info.ch.lessons[info.index + 1];
    if (dd.done) box.appendChild(h("a", { class: "btn primary", href: nx ? "#/lesson/" + nx.id : "#/project/" + ch.n }, nx ? "روز بعد" : "پروژهٔ فصل"));
    body.appendChild(box);
  }

  // ---------- پروژهٔ فصل ----------
  V.project = function (root, n) {
    var c = P().chapter(n); if (!c) { u.clear(root); root.appendChild(page("پروژه پیدا نشد")); return; }
    if (!P().projectUnlocked(c.n)) return locked(root, "اول همهٔ درس‌های این فصل را کامل کن.", "#/chapter/" + c.n);
    u.clear(root); root.setAttribute("data-acc", ACC[c.accent]); var id = c.projectId, d = AIX.store.day(id);
    root.appendChild(h("a", { class: "back", href: "#/chapter/" + c.n }, "فصل " + u.fa(c.n) + " · " + c.title));
    root.appendChild(page("پروژهٔ فصل " + u.fa(c.n) + ": " + c.projectTitle, "صفحه‌های پرونده را کامل کن، آزمون مرور فصل را بگذران و پروژه را تمام کن. نشان این فصل: " + c.badge));
    c.projectPages.forEach(function (p, i) { var det = h("details", { class: "card acc", open: i === 0 ? true : null }, h("summary", null, p.title || "صفحهٔ " + u.fa(i + 1)), AIX.enhance(html("content", p.html), id + ":p" + i, { onWrite: function () { AIX.router.softRefresh(); } })); root.appendChild(det); });
    var q = h("div", { class: "card" }, h("h3", null, "آزمون مرور فصل")); root.appendChild(q); var qb = h("div"); q.appendChild(qb);
    AIX.renderQuiz(qb, id, function () { AIX.router.softRefresh(); });
    var r = P().projectReady(c.n);
    var fin = h("div", { class: "card fin " + (d.done ? "ok-box" : "") }, h("h3", null, d.done ? "پروژه کامل شد" : "تمام کردن پروژه"),
      h("ul", { class: "reqs" }, h("li", { class: r.quiz ? "ok" : "" }, "آزمون مرور را بگذرانی"), h("li", { class: r.notes ? "ok" : "" }, "حداقل " + u.fa(P().RULES.projectMinNotes) + " قسمت از پرونده را بنویسی (الان " + u.fa(r.notesCount) + ")")));
    var btn = h("button", { type: "button", class: "btn primary", disabled: d.done || !(r.quiz && r.notes) }, d.done ? "انجام شد" : "پروژه را تمام کن");
    btn.addEventListener("click", function () { if (P().completeProject(c.n)) AIX.router.render(); });
    fin.appendChild(btn); root.appendChild(fin);
    var ps = h("div", { class: "card parent-seen" }, h("h3", null, "تأیید والدین یا معلم (اختیاری)"), h("p", { class: "muted" }, "پروندهٔ پروژه را به یک بزرگسال نشان بده و از او بخواه نظرش را بگوید. وقتی دید، این دکمه را بزن. " + u.fa(P().XP.parentSeen) + " امتیاز یک‌باره."));
    var pb = h("button", { type: "button", class: "btn", disabled: P().parentSeen(c.n) }, P().parentSeen(c.n) ? "تأیید شد" : "والدین یا معلم پروندهٔ مرا دید");
    pb.addEventListener("click", function () { if (!confirm("آیا واقعاً پروندهٔ پروژه را به والدین یا معلم نشان داده‌ای؟")) return; P().markParentSeen(c.n); u.toast("آفرین! " + u.fa(P().XP.parentSeen) + " امتیاز گرفتی.", "ok"); AIX.router.render(); });
    ps.appendChild(pb); root.appendChild(ps);
  };

  // ---------- کارگاه ----------
  V.lab = function (root) {
    u.clear(root); root.appendChild(page("کارگاه پروژه‌های خلاقانه", "اینجا چیزهایی می‌سازی که مال خودت است. هر خروجی شفافیت دربارهٔ نقش هوش مصنوعی دارد."));
    var g = h("div", { class: "grid lab-grid" });
    var pd = AIX.store.get().projects.poster;
    g.appendChild(h("a", { class: "card link big-card", href: "#/lab/poster" }, h("span", { html: AIX.ic("pen", 32) }), h("div", null, h("h3", null, "استودیوی پوستر علمی"), h("p", null, "عنوان، شعار و سه حقیقت بررسی‌شده را بنویس، رنگ و نماد را انتخاب کن و پوستر PNG بگیر."), pd && pd.exported ? h("span", { class: "chip ok" }, "یک بار خروجی گرفته‌ای") : (pd && pd.title ? h("span", { class: "chip" }, "پیش‌نویس ذخیره شده") : null))));
    P().course().forEach(function (c) { var ok = P().projectUnlocked(c.n); g.appendChild(h(ok ? "a" : "div", { class: "card link" + (ok ? "" : " locked"), href: ok ? "#/project/" + c.n : null }, h("span", { html: AIX.ic(ok ? "flag" : "lock", 24) }), h("div", null, h("h3", null, c.projectTitle), h("p", { class: "muted" }, "پروندهٔ پروژهٔ فصل " + u.fa(c.n) + (ok ? "" : " (بعد از کامل کردن درس‌ها باز می‌شود)"))))); });
    root.appendChild(g);
  };
  V.posterPage = function (root) { AIX.views.poster(root); };

  // ---------- دستاوردها ----------
  V.achievements = function (root) {
    var st = AIX.store.get(), tot = P().totals(); u.clear(root); root.appendChild(page("دستاوردها", "امتیاز، سطح و نشان‌های افتخار تو."));
    root.appendChild(h("div", { class: "card" }, xpBar())); root.appendChild(h("div", { class: "stats" }, stat("روز کامل‌شده", u.fa(tot.days) + " از " + u.fa(tot.totalDays), "flag"), stat("آزمون‌ها", u.fa(tot.quizzes), "check"), stat("تمرین‌ها", u.fa(tot.acts), "search"), stat("پیوسته", u.fa(P().streak()) + " روز", "flame")));
    root.appendChild(h("h2", { class: "sec" }, "نشان‌ها"));
    var g = h("div", { class: "grid badges" });
    P().badgeDefs().forEach(function (b) { var got = st.badges[b.id]; g.appendChild(h("div", { class: "card badge" + (got ? " got" : "") }, h("span", { class: "hexb", html: AIX.ic(got ? b.icon : "lock", 28) }), h("strong", null, b.name), h("small", null, b.desc), got ? h("small", { class: "ok-t" }, "به دست آمد") : h("small", { class: "muted" }, "هنوز باز نشده"))); });
    root.appendChild(g);
  };

  // ---------- تنظیمات ----------
  V.settings = function (root) {
    var st = AIX.store.get(); u.clear(root); root.appendChild(page("تنظیمات", "اطلاعات این برنامه فقط روی همین دستگاه ذخیره می‌شود. به جایی ارسال نمی‌شود."));
    if (!AIX.store.available()) root.appendChild(h("div", { class: "card warn-box" }, "ذخیره‌سازی مرورگر در دسترس نیست (مثلاً حالت خصوصی). پیشرفت بعد از بستن صفحه از بین می‌رود. از «پشتیبان‌گیری» استفاده کن."));
    if (AIX.store.recovered || AIX.store.corruptRaw()) root.appendChild(h("div", { class: "card warn-box" }, h("p", null, "دادهٔ ذخیره‌شدهٔ قبلی خراب بود و برنامه با وضعیت تازه شروع کرد. نسخهٔ خراب نگه داشته شده است؛ می‌توانی آن را برای بررسی دانلود کنی."),
      h("div", { class: "row-actions" }, h("button", { type: "button", class: "btn", onclick: function () { u.download("aihub-explorers-corrupt-" + u.today() + ".json", AIX.store.corruptRaw() || "", "application/json"); } }, "دانلود نسخهٔ خراب"), h("button", { type: "button", class: "btn ghost", onclick: function () { AIX.store.clearCorrupt(); AIX.router.render(); } }, "پاک کردن نسخهٔ خراب"))));
    var nick = h("input", { type: "text", maxlength: 20, value: st.profile.nick, placeholder: "اسم مستعار (اختیاری)" }); nick.addEventListener("input", function () { st.profile.nick = nick.value; AIX.store.save(); });
    root.appendChild(h("section", { class: "card" }, h("h3", null, "پروفایل"), h("label", { class: "field" }, h("span", null, "اسم مستعار"), nick, h("small", { class: "muted" }, "نام کامل، سن دقیق و اطلاعات شخصی ننویس.")),
      h("fieldset", { class: "field" }, h("legend", null, "گروه سنی (برای پیشنهاد سطح چالش)"), [["", "نمی‌خواهم بگویم"], ["a", "۱۱ ساله"], ["b", "۱۲ ساله"], ["c", "۱۳ ساله"]].map(function (o) { var r = h("input", { type: "radio", name: "age", value: o[0] }); r.checked = st.profile.ageGroup === o[0]; r.addEventListener("change", function () { st.profile.ageGroup = o[0]; AIX.store.save(true); }); return h("label", { class: "check" }, r, " " + o[1]); }))));
    root.appendChild(appearanceCard());
    var fs = h("input", { type: "range", min: 0.9, max: 1.3, step: 0.05, value: st.profile.fontScale, "aria-label": "اندازهٔ نوشته" }); fs.addEventListener("input", function () { st.profile.fontScale = Number(fs.value); document.documentElement.style.setProperty("--fs", fs.value); AIX.store.save(); });
    var open = h("input", { type: "checkbox" }); open.checked = !!st.profile.open;
    open.addEventListener("change", function () { if (open.checked && !confirm("حالت آزاد همهٔ مرحله‌ها را باز می‌کند. این حالت برای والدین یا معلم است. فعال شود؟")) { open.checked = false; return; } st.profile.open = open.checked; AIX.store.save(true); u.toast(open.checked ? "حالت آزاد فعال شد." : "حالت آزاد خاموش شد."); });
    var lt = h("input", { type: "checkbox" }); lt.checked = P().lightMode();
    lt.addEventListener("change", function () { st.profile.light = lt.checked; AIX.store.save(true); u.toast(lt.checked ? "حالت سبک روشن شد." : "حالت سبک خاموش شد."); });
    root.appendChild(h("section", { class: "card" }, h("h3", null, "نمایش و حالت‌ها"), h("label", { class: "field" }, h("span", null, "اندازهٔ نوشته"), fs), h("label", { class: "check" }, lt, " حالت سبک: فقط درس، آزمون و چالش (مناسب ۱۱ ساله؛ برای این گروه خودکار روشن است)"), h("label", { class: "check" }, open, " حالت آزاد (برای والدین یا معلم): همهٔ مرحله‌ها باز باشند")));
    var file = h("input", { type: "file", accept: "application/json,.json", class: "sr-only", id: "restore-file" });
    file.addEventListener("change", function () {
      var f = file.files[0]; if (!f) return; var rd = new FileReader();
      rd.onload = function () { if (!confirm("پیشرفت فعلی با این پشتیبان جایگزین شود؟")) return; var res = AIX.store.importJSON(String(rd.result)); if (res.ok) { u.toast("پشتیبان با موفقیت بازیابی شد.", "ok"); AIX.router.render(); } else u.toast(res.error, "no"); };
      rd.readAsText(f); file.value = "";
    });
    root.appendChild(h("section", { class: "card" }, h("h3", null, "پشتیبان‌گیری و بازیابی"), h("p", { class: "muted" }, "فایل پشتیبان را نگه دار تا پیشرفتت از بین نرود یا بتوانی آن را به دستگاه دیگری ببری."),
      h("div", { class: "row-actions" }, h("button", { type: "button", class: "btn primary", html: AIX.ic("download", 18) + " دانلود پشتیبان", onclick: function () { u.download("aihub-explorers-backup-" + u.today() + ".json", AIX.store.exportJSON(), "application/json"); AIX.store.markBackup(); u.toast("فایل پشتیبان ساخته شد.", "ok"); } }), h("label", { class: "btn", for: "restore-file" }, "بازیابی از فایل"), file)));
    root.appendChild(h("section", { class: "card danger" }, h("h3", null, "پاک کردن پیشرفت"), h("p", { class: "muted" }, "همهٔ امتیازها، نوشته‌ها و نشان‌ها پاک می‌شوند. اول پشتیبان بگیر."), h("button", { type: "button", class: "btn", onclick: function () { if (prompt("برای تأیید، کلمهٔ «پاک» را بنویس.") === "پاک") { AIX.store.reset(); u.toast("پیشرفت پاک شد."); go("#/"); AIX.router.render(); } } }, "پاک کردن همه‌چیز")));
    root.appendChild(h("section", { class: "card" }, h("h3", null, "دربارهٔ حریم خصوصی"), h("p", null, "این برنامه حساب کاربری، ردیابی و ارتباط با هوش مصنوعی ندارد. فقط در مرورگر همین دستگاه ذخیره می‌کند. اگر مرورگر را پاک کنی یا دستگاه را عوض کنی، بدون پشتیبان چیزی نمی‌ماند.")));
    V.aboutBlock(root);
  };


  // ظاهر برنامه: حالت روشن/تاریک و رنگ برند (از DS: AIhub.theme / AIhub.brand)
  function appearanceCard() {
    var H = window.AIhub, BR = [["firouzeh", "فیروزه‌ای"], ["indigo", "نیلی"], ["rose", "سرخابی"], ["ember", "نارنجی"]];
    var themeBtns = [["light", "روشن"], ["dark", "تاریک"]].map(function (t) { return h("button", { type: "button", "data-theme-pick": t[0] }, t[1]); });
    var seg = h("div", { class: "segmented", role: "group", "aria-label": "حالت نمایش" }, themeBtns);
    var brandBtns = BR.map(function (b) { return h("button", { type: "button", class: "brand-sw", "data-brand-set": b[0], "aria-label": "رنگ " + b[1] }, h("i"), h("span", null, b[1])); });
    var card = h("section", { class: "card" }, h("h3", null, "ظاهر برنامه"), h("div", { class: "field" }, h("span", null, "حالت نمایش"), seg), h("div", { class: "field" }, h("span", null, "رنگ برنامه"), h("div", { class: "choice" }, brandBtns)));
    function sync() {
      var th = H ? H.theme.get() : "light", br = H ? H.brand.get() : "firouzeh";
      themeBtns.forEach(function (b) { b.setAttribute("aria-pressed", b.getAttribute("data-theme-pick") === th ? "true" : "false"); });
      brandBtns.forEach(function (b) { b.setAttribute("aria-pressed", b.getAttribute("data-brand-set") === br ? "true" : "false"); });
    }
    card.addEventListener("click", function (e) {
      var t = e.target.closest ? e.target.closest("[data-theme-pick]") : null;
      if (t && H) H.theme.set(t.getAttribute("data-theme-pick"));
      setTimeout(sync, 0);
    });
    sync(); return card;
  }
  V.family = function (root) {
    var C = AIX.content.family, f = P().family(); u.clear(root); root.setAttribute("data-acc", ACC.green);
    root.appendChild(page(C.title, "توافق‌نامهٔ خانوادگی هوش مصنوعی؛ کار مشترک تو و والدینت."));
    C.intro.forEach(function (t) { root.appendChild(h("p", { class: "lead" }, t)); });
    root.appendChild(h("div", { class: "row-actions" }, h("a", { class: "btn", href: "#/parents" }, "خواندن راهنمای والدین (فصل ۵)"), h("a", { class: "btn ghost", href: "#/map" }, "بازگشت به نقشه")));
    var status = h("div", { class: "card fam-status", "aria-live": "polite" });
    function drawStatus() { var ff = P().family(), r = P().familyReady(); u.clear(status); status.className = "card fam-status" + (ff.done ? " ok-box" : ""); status.appendChild(h("strong", null, ff.done ? "توافق‌نامه امضا شد. نشان «خانوادهٔ کاوشگر» برای شماست." : u.fa(r.rules) + " از " + u.fa(r.total) + " قانون پذیرفته شده" + (r.names ? "" : " · اسم هر دو نفر هنوز لازم است"))); status.appendChild(h("div", { class: "bar" }, h("b", { style: "width:" + Math.round(r.rules * 100 / r.total) + "%" }))); }
    var list = h("div", { class: "card" }, h("h3", null, "هشت قانون خانوادگی"));
    C.rules.forEach(function (r, i) {
      var cb = h("input", { type: "checkbox", id: "famr" + i }); cb.checked = !!f.rules[i];
      cb.addEventListener("change", function () { P().setFamilyRule(i, cb.checked); drawStatus(); });
      list.appendChild(h("label", { class: "check fam-rule", for: "famr" + i }, cb, h("span", null, h("strong", null, "قانون " + u.fa(i + 1) + " · " + r.h + ": "), r.t)));
    });
    function nameField(label, key, ph) { var i = h("input", { type: "text", maxlength: 20, value: f[key], placeholder: ph, "aria-label": label }); i.addEventListener("input", function () { P().setFamilyName(key, i.value); drawStatus(); }); return h("label", { class: "field" }, h("span", null, label), i); }
    var sign = h("div", { class: "card" }, h("h3", null, "امضا"), h("div", { class: "g-two" }, nameField("اسم والدین یا بزرگسال", "parent", "اسم کوچک یا اسم مستعار"), nameField("اسم کودک", "child", "اسم کوچک یا اسم مستعار")), h("small", { class: "muted" }, C.namesHint));
    root.appendChild(status); root.appendChild(list); root.appendChild(sign);
    root.appendChild(h("div", { class: "card warn-box" }, h("strong", null, "ابزارها و سن"), h("p", null, C.safety)));
    drawStatus();
  };

  // ---------- والدین و واژه‌نامه ----------
  V.parents = function (root) {
    u.clear(root); root.appendChild(page("راهنمای والدین · فصل ۵", "همراهی هوشمندانه با نوجوان ۱۱ تا ۱۳ ساله. والدین پلیس نیستند؛ همراه، راهنما و مربی است."));
    root.appendChild(h("a", { class: "card link", href: "#/family" }, h("span", { html: AIX.ic("users", 24) }), h("div", null, h("strong", null, "ایستگاه خانواده: توافق‌نامهٔ تعاملی"), h("p", null, "والدین و کودک با هم قانون‌ها را می‌پذیرند و امضا می‌کنند."))));
    var c = AIX.content.parents || []; c.forEach(function (p, i) { root.appendChild(h("details", { class: "card acc", open: i === 0 ? true : null }, h("summary", null, p.title), AIX.enhance(html("content", p.html), "parents:p" + i))); });
  };
  V.aboutBlock = function (root) {
    var box = h("div", { class: "about-block", id: "about-block" }); var host = root; root = box; host.appendChild(box);
    var yr = u.fa(1405), ID = "@aihub_tools", IDB = "\u2066" + ID + "\u2069";
    var ch = [["rubika", "روبیکا", "https://rubika.ir/aihub_tools", "chat", "blue"], ["telegram", "تلگرام", "https://t.me/aihub_tools", "send", "cyan"], ["instagram", "اینستاگرام", "https://instagram.com/aihub_tools", "camera", "purple"]];
    root.appendChild(h("section", { class: "about-hero pattern-girih" }, h("img", { src: "assets/img/logo.svg", alt: "", width: 88, height: 88 }),
      h("div", null, h("h2", null, "کاوشگران هوش مصنوعی"), h("p", null, "آکادمی تعاملی و بازی‌وار فارسی برای نوجوانان ۱۱ تا ۱۳ سال؛ از شناخت هوش مصنوعی تا ساختن با آن، با فکر و مسئولیت."), h("small", { class: "en" }, "AIhub AI Explorers"))));
    root.appendChild(h("section", { class: "card" }, h("h3", null, "دربارهٔ برنامه"),
      h("p", null, "این برنامه یک مسیر یادگیری قدم‌به‌قدم است: درس، تمرین، آزمون، آزمایشگاه و پروژه. هدفش این است که نوجوان یاد بگیرد سؤال خوب بپرسد، جواب را بسنجد و اطلاعات شخصی‌اش را نگه دارد."),
      h("ul", { class: "about-list" }, h("li", null, "بدون حساب کاربری و بدون ردیابی"), h("li", null, "بعد از اولین بار، بدون اینترنت هم کار می‌کند"), h("li", null, "پیشرفت فقط روی همین دستگاه ذخیره می‌شود"), h("li", null, "به هیچ هوش مصنوعی آنلاینی وصل نیست"))));
    var g = h("div", { class: "contact-grid" });
    ch.forEach(function (c) { g.appendChild(h("a", { class: "card link contact", href: c[2], target: "_blank", rel: "noopener noreferrer", "data-acc": c[4], "aria-label": c[1] + " " + ID }, h("span", { class: "ibox", html: AIX.ic(c[3], 24) }), h("div", null, h("b", null, c[1]), h("small", null, ID)))); });
    var cp = h("button", { type: "button", class: "btn", onclick: function () { try { navigator.clipboard.writeText(ID).then(function () { u.toast("آیدی کپی شد.", "ok"); }, function () { u.toast("آیدی: " + ID, "ok"); }); } catch (e) { u.toast("آیدی: " + ID, "ok"); } } }, h("span", { html: AIX.ic("copy", 18) }), "کپی آیدی " + IDB);
    root.appendChild(h("section", null, h("h3", null, "ارتباط با ما و پشتیبانی"), h("p", { class: "muted" }, "سؤال، گزارش مشکل یا پیشنهاد دارید؟ در هر سه پلتفرم با آیدی " + IDB + " پیام بدهید."), g, h("div", { class: "row-actions" }, cp)));
    root.appendChild(h("section", { class: "card soft copyright" }, h("p", null, "© " + yr + " ", h("b", null, "AIhub Tools"), " · همهٔ حقوق محفوظ است."),
      h("p", null, "طراحی، محتوا، تمرین‌ها و کد این برنامه متعلق به AIhub Tools است. کپی‌برداری، بازنشر، فروش مجدد و استفادهٔ تجاری بدون اجازهٔ کتبی ممنوع است.")));
  };
  V.glossary = function (root) {
    u.clear(root); root.appendChild(page("واژه‌نامهٔ کاوشگر", "معنی ساده واژه‌های همهٔ فصل‌ها."));
    var rows = AIX.content.glossary || [], q = h("input", { type: "search", placeholder: "جست‌وجوی واژه…", "aria-label": "جست‌وجوی واژه" }), list = h("div", { class: "gloss" });
    function draw() { u.clear(list); var t = q.value.trim(); rows.filter(function (r) { return !t || r.term.indexOf(t) >= 0 || r.meaning.indexOf(t) >= 0 || r.en.toLowerCase().indexOf(t.toLowerCase()) >= 0; }).forEach(function (r) { list.appendChild(h("div", { class: "card gl" }, h("strong", null, r.term), h("p", null, r.meaning), h("small", { class: "en" }, r.en))); }); if (!list.firstChild) list.appendChild(h("p", { class: "muted" }, "واژه‌ای پیدا نشد.")); }
    q.addEventListener("input", draw); root.appendChild(h("label", { class: "field" }, q)); root.appendChild(list); draw();
  };
})();
