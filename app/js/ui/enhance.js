// تبدیل محتوای ثابت درس به عناصر تعاملی: نواحی نوشتن، جعبه‌های تیک، کپی پرسش
(function () {
  var AIX = window.AIX = window.AIX || {}, u = AIX.u;
  AIX.enhance = function (root, prefix, opts) {
    opts = opts || {};
    u.$$("[data-w]", root).forEach(function (slot, i) {
      var key = prefix + ":w" + i, isCell = slot.classList.contains("cell");
      var prev = slot.previousElementSibling, label = prev && /^(B|STRONG|P)$/.test(prev.tagName) ? prev.textContent.slice(0, 60) : "پاسخ من";
      var el = isCell ? u.h("input", { type: "text", class: "cell-input", maxlength: 120, "aria-label": label })
        : u.h("textarea", { class: "write-input" + (slot.classList.contains("mini") ? " mini" : "") + (slot.classList.contains("tall") ? " tall" : ""), rows: slot.classList.contains("tall") ? 4 : (slot.classList.contains("mini") ? 2 : 2), maxlength: 700, placeholder: slot.getAttribute("data-hint") || "اینجا بنویس…", "aria-label": label });
      el.value = AIX.store.note(key);
      el.addEventListener("input", function () { AIX.store.setNote(key, el.value); if (opts.onWrite && el.value.trim().length >= 3) opts.onWrite(); });
      slot.parentNode.replaceChild(el, slot);
    });
    u.$$(".cb", root).forEach(function (box, i) {
      var key = prefix + ":cb" + i, on = AIX.store.note(key) === "1";
      box.setAttribute("role", "checkbox"); box.setAttribute("tabindex", "0"); box.setAttribute("aria-checked", on ? "true" : "false");
      if (on) box.classList.add("on");
      var toggle = function () { on = !on; box.classList.toggle("on", on); box.setAttribute("aria-checked", on ? "true" : "false"); AIX.store.setNote(key, on ? "1" : ""); };
      box.addEventListener("click", toggle);
      box.addEventListener("keydown", function (e) { if (e.key === " " || e.key === "Enter") { e.preventDefault(); toggle(); } });
    });
    u.$$(".bubble.u", root).forEach(function (b) {
      var txt = b.textContent; if (txt.indexOf("«") < 0) return;
      var m = txt.match(/«([\s\S]*)»/); var prompt = (m ? m[1] : txt).trim();
      var btn = u.h("button", { type: "button", class: "btn tiny ghost copy", html: AIX.ic("copy", 14) + " کپی پرسش" });
      btn.addEventListener("click", function () {
        var done = function () { u.toast("پرسش کپی شد. فقط اطلاعات شخصی در آن ننویس."); if (opts.onCopy) opts.onCopy(); };
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(prompt).then(done, function () { u.toast("کپی خودکار ممکن نشد؛ متن را دستی انتخاب کن."); });
        else u.toast("کپی خودکار ممکن نشد؛ متن را دستی انتخاب کن.");
      });
      b.appendChild(btn);
    });
    return root;
  };
})();
