// مسیریاب ساده بر پایهٔ hash (مناسب GitHub Pages و اجرای محلی)
(function () {
  var AIX = window.AIX = window.AIX || {}, u = AIX.u, R = AIX.router = {};
  function parse() { var hsh = (location.hash || "#/").replace(/^#\/?/, ""), p = hsh.split("/").filter(Boolean); return p; }
  var TITLES = { "": "خانه", map: "نقشهٔ مسیر", chapter: "فصل", lesson: "درس", project: "پروژهٔ فصل", lab: "کارگاه", labs: "آزمایشگاه‌ها", print: "بستهٔ چاپی", achievements: "دستاوردها", settings: "تنظیمات", about: "تنظیمات", parents: "راهنمای والدین", family: "ایستگاه خانواده", glossary: "واژه‌نامه", activate: "فعال‌سازی" };
  function markGated(root) {
    u.$$("a.card.link", root).forEach(function (a) {
      if (a.getAttribute("href") === "#/labs/model") return;
      a.classList.add("gated"); var d = a.querySelector("div"), c = d && d.querySelector(".chip");
      if (c) { c.className = "chip"; c.textContent = "با فعال‌سازی باز می‌شود"; } else if (d) d.appendChild(u.h("span", { class: "chip" }, "با فعال‌سازی باز می‌شود"));
    });
  }
  // جدول‌ها روی موبایل به کارت تبدیل می‌شوند: هر ردیف یک کارت، هر خانه با برچسب ستونش
  function stackTables(root) {
    u.$$("table", root).forEach(function (t) {
      var rows = [].slice.call(t.rows); if (rows.length < 2 || !rows[0].querySelector("th")) return;
      var labels = [].map.call(rows[0].cells, function (c) { return c.textContent.replace(/\s+/g, " ").trim(); });
      rows[0].classList.add("t-head"); t.classList.add("stack");
      rows.slice(1).forEach(function (r) { [].forEach.call(r.cells, function (c, i) { if (i === 0) c.classList.add("t-key"); else if (labels[i]) c.setAttribute("data-label", labels[i]); }); });
    });
  }
  function view(root, p) {
    var V = AIX.views, r = p[0] || "";
    if (r === "activate") return V.activate(root);
    var Lc = AIX.license; if (Lc && Lc.locked() && ((r === "lesson" && p[1] !== Lc.freeId()) || r === "project" || (r === "lab" && p[1]))) return V.activate(root, true);
    if (r === "") return V.home(root);
    if (r === "map") return V.map(root);
    if (r === "chapter") return V.chapter(root, p[1]);
    if (r === "lesson") return V.lesson(root, p[1], p[2]);
    if (r === "project") return V.project(root, p[1]);
    if (r === "labs") {
      if (Lc && Lc.locked() && p[1] && p[1] !== "model") return V.activate(root, true); // آزمایشگاه مدل نمونهٔ رایگان است
      if (p[1] === "model") return V.modelLab(root); if (p[1] === "feed") return V.feedLab(root); if (p[1] === "sim") return V.simPage(root, p[2]); if (p[1] === "prompt") return V.promptLab(root); if (p[1] === "story") return V.storyLab(root);
      V.labs(root); if (Lc && Lc.locked()) markGated(root); return;
    }
    if (r === "print") return V.printPage(root);
    if (r === "lab") { if (p[1] === "poster") return V.posterPage(root); V.lab(root); if (Lc && Lc.locked()) markGated(root); return; }
    if (r === "achievements") return V.achievements(root);
    if (r === "settings") return V.settings(root);
    if (r === "about") { V.settings(root); var ab = u.$("#about-block", root); if (ab) setTimeout(function () { ab.scrollIntoView(); }, 30); return; }
    if (r === "family") return V.family(root);
    if (r === "parents") return V.parents(root);
    if (r === "glossary") return V.glossary(root);
    u.clear(root); root.appendChild(u.h("div", { class: "card center" }, u.h("h2", null, "صفحه پیدا نشد"), u.h("a", { class: "btn primary", href: "#/" }, "بازگشت به خانه")));
  }

  // نشانهٔ امتیاز بالای صفحه
  R.xpPill = function () {
    var pill = u.$("#xp-pill"); if (!pill) return; var s = AIX.store.get(), lv = AIX.progress.level(s.xp);
    pill.innerHTML = AIX.ic("star", 18) + "<span>سطح " + u.fa(lv.level) + "</span><span class=\"xp-pts\">" + u.fa(s.xp) + " امتیاز</span>";
  };
  // کارت بازیکن در منوی کناری
  function sidePlayer(st, lv) {
    var box = u.$("#side-player"); if (!box) return; u.clear(box);
    var nick = String(st.profile.nick || "").trim(), ini = nick ? nick.charAt(0) : "", pct = lv.need ? Math.round(lv.into * 100 / lv.need) : 100;
    box.appendChild(u.h("div", { class: "user" }, u.h("span", { class: "avatar avatar--accent", html: ini ? null : AIX.ic("star", 20) }, ini),
      u.h("div", { class: "user__meta" }, u.h("div", { class: "user__name" }, nick || "کاوشگر"), u.h("div", { class: "user__role" }, "سطح " + u.fa(lv.level) + " · " + lv.title))));
    box.appendChild(u.h("div", { class: "progress", style: "--value:" + pct + "%", role: "progressbar", "aria-valuemin": "0", "aria-valuemax": "100", "aria-valuenow": String(pct), "aria-label": "پیشرفت تا سطح بعد" }, u.h("i")));
  }
  function chrome() {
    var p = parse(), r = p[0] || "", st = AIX.store.get(), lv = AIX.progress.level(st.xp);
    u.$$("[data-nav]").forEach(function (a) { var on = a.getAttribute("data-nav") === (r === "chapter" || r === "lesson" || r === "project" || r === "family" ? "map" : r); a.classList.toggle("on", on); if (on) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current"); });
    R.xpPill(); sidePlayer(st, lv); var tt = u.$("#topbar-title"); if (tt) tt.textContent = TITLES[r] || "AI Explorers";
    document.title = (TITLES[r] || "AI Explorers") + " · AIhub AI Explorers";
  }
  function fallback(root, e) {
    var h = u.h; try { console.error(e); } catch (x) {} u.clear(root);
    root.appendChild(h("section", { class: "card warn-box" }, h("h2", null, "یک مشکل پیش آمد"), h("p", null, "این صفحه درست باز نشد. پیشرفتت از بین نرفته است."), h("a", { class: "btn primary", href: "#/" }, "برگشت به خانه")));
  }
  R.render = function () {
    var root = u.$("#app"); root.removeAttribute("data-acc"); root.setAttribute("data-view", parse()[0] || "home"); try { view(root, parse()); stackTables(root); } catch (e) { fallback(root, e); } chrome(); root.focus({ preventScroll: true }); window.scrollTo(0, 0);
  };
  R.go = function (h) { if (location.hash === h) R.render(); else location.hash = h; };
  // به‌روزرسانی نوار مرحله‌ها و وضعیت‌ها بدون بازسازی بدنهٔ صفحه (تا نوشته‌های کاربر نپرد)
  R.softRefresh = function () {
    chrome(); var root = u.$("#app"), tmp = document.createElement("div"); tmp.tabIndex = -1;
    try { view(tmp, parse()); } catch (e) { return; }
    [".steps", ".ready", ".donebox", ".fin"].forEach(function (sel) { var a = u.$(sel, root), b = u.$(sel, tmp); if (a && b) a.parentNode.replaceChild(b, a); });
    var cur = u.$(".steps .cur", root); if (cur && cur.scrollIntoView) { /* بدون پرش */ }
  };
  window.addEventListener("hashchange", R.render);
})();
