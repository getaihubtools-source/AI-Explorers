// راه‌اندازی برنامه
(function () {
  var AIX = window.AIX = window.AIX || {}, u = AIX.u, h = u.h;
  function modal(node, label) {
    var m = u.$("#modal"), prevFocus = document.activeElement; u.clear(m); m.hidden = false;
    var box = h("div", { class: "modal-box", role: "dialog", "aria-modal": "true", "aria-label": label || "پیام" }, h("div", { class: "sheet__grab" }), node);
    var close = function () { m.hidden = true; u.clear(m); document.removeEventListener("keydown", esc); if (prevFocus && prevFocus.focus) prevFocus.focus(); AIX.router.render(); };
    var esc = function (e) { if (e.key === "Escape") close(); };
    document.addEventListener("keydown", esc); m.addEventListener("click", function (e) { if (e.target === m) close(); }, { once: true });
    box.appendChild(h("button", { type: "button", class: "btn ghost", onclick: close }, "بستن")); m.appendChild(box);
    var first = u.$("a,button", box); if (first) first.focus(); return close;
  }
  AIX.modal = modal;
  // کاغذرنگی جشن (با prefers-reduced-motion در CSS پنهان می‌شود)
  function confetti() {
    var c = h("div", { class: "confetti", "aria-hidden": "true" });
    for (var i = 0; i < 18; i++) c.appendChild(h("i", { style: "inset-inline-start:" + (4 + i * 5.3) + "%;animation-delay:" + ((i * 97) % 700) + "ms;--c:var(--chart-" + (i % 5 + 1) + ")" }));
    return c;
  }
  function starsHtml(n) { var s = ""; for (var i = 0; i < 3; i++) s += '<span class="star big' + (i < n ? " on" : "") + '">' + AIX.ic("star", 34) + "</span>"; return s; }
  // خطای پیش‌بینی‌نشده نباید بی‌صدا باشد؛ حداکثر هر ۳۰ ثانیه یک پیام
  var lastErr = 0;
  function oops() { var t = Date.now(); if (t - lastErr < 30000) return; lastErr = t; try { u.toast("مشکلی پیش آمد. اگر برنامه درست کار نمی‌کند، صفحه را دوباره باز کن. پیشرفتت ذخیره است.", "no"); } catch (e) {} }
  window.addEventListener("error", oops); window.addEventListener("unhandledrejection", oops);
  function boot() {
    AIX.store.load(); AIX.store.requestPersist(); var st = AIX.store.get(); document.documentElement.style.setProperty("--fs", st.profile.fontScale || 1);
    AIX.progress.on("badge", function (b) { u.toast("نشان تازه: " + b.name, "ok"); });
    AIX.progress.on("xp", function () { AIX.router.xpPill(); });
    AIX.progress.on("celebrate", function (e) {
      var P = AIX.progress, node = h("div", { class: "celebrate center" }); node.appendChild(confetti());
      if (e.kind === "day") {
        var info = P.lesson(e.id), nx = info && info.ch.lessons[info.index + 1];
        node.appendChild(h("h2", null, "آفرین! این روز کامل شد")); node.appendChild(h("div", { class: "stars-big", html: starsHtml(e.stars) }));
        node.appendChild(h("p", null, "امتیاز بونوس روز: " + u.fa(P.XP.dayBonus) + " · " + u.fa(e.stars) + " ستاره از ۳"));
        node.appendChild(h("a", { class: "btn primary", href: nx ? "#/lesson/" + nx.id : "#/project/" + info.ch.n }, nx ? "روز بعد" : "پروژهٔ فصل"));
      } else if (e.kind === "family") {
        node.appendChild(h("h2", null, "توافق‌نامهٔ خانوادگی امضا شد!")); node.appendChild(h("div", { class: "stars-big", html: starsHtml(3) }));
        node.appendChild(h("p", null, "نشان تازه: خانوادهٔ کاوشگر · " + u.fa(P.XP.family) + " امتیاز")); node.appendChild(h("a", { class: "btn primary", href: "#/map" }, "ادامه در نقشه"));
      } else {
        var ch = P.chapter(e.chapter); node.appendChild(h("h2", null, "پروژهٔ فصل " + u.fa(e.chapter) + " کامل شد!")); node.appendChild(h("div", { class: "stars-big", html: starsHtml(3) }));
        node.appendChild(h("p", null, "نشان تازه: " + ch.badge)); var nextCh = P.course()[P.course().indexOf(ch) + 1];
        node.appendChild(h("a", { class: "btn primary", href: nextCh ? "#/chapter/" + nextCh.n : "#/achievements" }, nextCh ? "فصل بعد" : "دیدن دستاوردها"));
      }
      setTimeout(function () { modal(node, "تبریک"); }, 250);
    });
    AIX.progress.badges();
    AIX.router.render(); if (AIX.license) AIX.license.recheck();
    if ("serviceWorker" in navigator && /^https?:$/.test(location.protocol)) (function () {
      var had = !!navigator.serviceWorker.controller, told = false;
      navigator.serviceWorker.addEventListener("controllerchange", function () { if (had && !told) { told = true; u.toast("نسخهٔ تازهٔ برنامه آماده است. یک‌بار برنامه را ببند و دوباره باز کن.", "ok"); } });
      navigator.serviceWorker.register("../sw.js").catch(function () {});
    })();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
})();
