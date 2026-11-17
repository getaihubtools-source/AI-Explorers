// صفحهٔ فعال‌سازی
(function () {
  var AIX = window.AIX, u = AIX.u, h = u.h;
  AIX.views.activate = function (root, gated) {
    var L = AIX.license; u.clear(root); if (gated) L.next = location.hash;
    if (L.active() && !gated) { root.appendChild(h("div", { class: "card center" }, h("h2", null, "برنامه فعال است"), h("a", { class: "btn primary", href: "#/map" }, "رفتن به نقشه"))); return; }
    var inp = h("textarea", { id: "akey", dir: "ltr", rows: "3", autocomplete: "off", spellcheck: "false", placeholder: "AIX1.…", "aria-describedby": "amsg", class: "gate-input" });
    var dev = L.deviceLabel(), cp = h("button", { type: "button", class: "btn ghost" }, "کپی کد دستگاه");
    cp.addEventListener("click", function () { var t = "کد دستگاه AI Explorers: " + dev; try { navigator.clipboard.writeText(t).then(function () { u.toast("کپی شد.", "ok"); }, function () { u.toast("کد را دستی کپی کن.", "ok"); }); } catch (e) { u.toast("کد را دستی کپی کن.", "ok"); } });
    var msg = h("p", { id: "amsg", role: "status", "aria-live": "polite", class: "gate-msg" });
    var btn = h("button", { type: "button", class: "btn primary" }, "فعال‌سازی");
    function go() {
      btn.disabled = true; msg.textContent = "در حال بررسی…";
      L.activate(inp.value).then(function (r) {
        btn.disabled = false;
        if (r.ok) { u.toast("برنامه فعال شد. ماجراجویی مبارک!", "ok"); var n = L.next; L.next = null; AIX.router.go(n && n !== "#/activate" ? n : "#/map"); }
        else { msg.textContent = r.error; try { inp.focus({ preventScroll: true }); } catch (e) {} }
      });
    }
    btn.addEventListener("click", go); inp.addEventListener("keydown", function (e) { if (e.key === "Enter") go(); });
    root.appendChild(h("div", { class: "card gate" },
      h("span", { class: "gate-ico", html: AIX.ic("lock", 30) }),
      h("h2", null, gated ? "این بخش با کد فعال‌سازی باز می‌شود" : "فعال‌سازی برنامه"),
      h("p", { class: "muted" }, "فعال‌سازی را والدین انجام دهند. دو قدم دارد:"),
      h("ol", { class: "gate-steps" }, h("li", null, "کد دستگاه این مرورگر را برای فروشنده بفرست."), h("li", null, "کدی که فروشنده می‌فرستد را پایین بگذار. بعد از این دیگر اینترنت لازم نیست.")),
      h("div", { class: "gate-code" }, h("small", null, "کد دستگاه شما"), h("strong", { dir: "ltr" }, dev), cp),
      h("label", { for: "akey", class: "sr-only" }, "کد فعال‌سازی"), inp, msg,
      h("div", { class: "row-actions gate-actions" }, btn, h("a", { class: "btn ghost", href: "#/lesson/" + L.freeId() }, "اول درس رایگان را ببین"))));
    if (!gated) { try { inp.focus({ preventScroll: true }); } catch (e) {} }
  };
})();
