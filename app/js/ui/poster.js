// پروژهٔ خلاقانه: استودیوی پوستر علمی (از ایده تا فایل PNG) همراه با شناسنامهٔ شفافیت
(function () {
  var AIX = window.AIX = window.AIX || {}, u = AIX.u, h = u.h;
  var THEMES = { ocean: { name: "اقیانوس", c1: "#0B1020", c2: "#12307A", acc: "#18D7E8" }, nebula: { name: "سحابی", c1: "#0B1020", c2: "#3B1E8A", acc: "#9B6CFF" }, sun: { name: "خورشید", c1: "#0B1020", c2: "#7A3B12", acc: "#FF9F43" }, forest: { name: "جنگل", c1: "#0B1020", c2: "#0F4D3A", acc: "#35D07F" } };
  var ICONS = { planet: "سیاره", leaf: "برگ", drop: "قطره", star: "ستاره" };
  var LEVELS = ["۰ بدون هوش مصنوعی", "۱ ایده و پیشنهاد", "۲ ویرایش و بهبود", "۳ ساخت پیش‌نویس با هدایت من"];
  var W = 1240, H = 1754, FONT = '"Vazirmatn", Tahoma, "Segoe UI", "DejaVu Sans", sans-serif';

  function blank() { return { title: "", slogan: "", facts: [{ t: "", s: "", v: false }, { t: "", s: "", v: false }, { t: "", s: "", v: false }], theme: "ocean", icon: "planet", level: -1, aiHelp: "", myWork: "", nick: "", exported: false }; }
  function data() { var st = AIX.store.get(); if (!st.projects.poster) st.projects.poster = blank(); return st.projects.poster; }
  function wrap(ctx, text, maxW) {
    var words = String(text).split(/\s+/).filter(Boolean), lines = [], cur = "";
    words.forEach(function (w) { var t = cur ? cur + " " + w : w; if (ctx.measureText(t).width > maxW && cur) { lines.push(cur); cur = w; } else cur = t; });
    if (cur) lines.push(cur); return lines;
  }
  function drawIcon(ctx, name, cx, cy, r, col) {
    ctx.save(); ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = 8; ctx.lineCap = "round"; ctx.lineJoin = "round";
    if (name === "planet") { ctx.beginPath(); ctx.arc(cx, cy, r * 0.5, 0, 7); ctx.globalAlpha = .25; ctx.fill(); ctx.globalAlpha = 1; ctx.stroke(); ctx.beginPath(); ctx.ellipse(cx, cy, r * 0.95, r * 0.28, -0.45, 0, 7); ctx.stroke(); }
    else if (name === "leaf") { ctx.beginPath(); ctx.moveTo(cx - r * .7, cy + r * .6); ctx.quadraticCurveTo(cx - r * .8, cy - r * .7, cx + r * .7, cy - r * .7); ctx.quadraticCurveTo(cx + r * .8, cy + r * .5, cx - r * .7, cy + r * .6); ctx.globalAlpha = .25; ctx.fill(); ctx.globalAlpha = 1; ctx.stroke(); ctx.beginPath(); ctx.moveTo(cx - r * .7, cy + r * .6); ctx.lineTo(cx + r * .3, cy - r * .3); ctx.stroke(); }
    else if (name === "drop") { ctx.beginPath(); ctx.moveTo(cx, cy - r * .8); ctx.bezierCurveTo(cx + r * .9, cy + r * .1, cx + r * .6, cy + r * .8, cx, cy + r * .8); ctx.bezierCurveTo(cx - r * .6, cy + r * .8, cx - r * .9, cy + r * .1, cx, cy - r * .8); ctx.globalAlpha = .25; ctx.fill(); ctx.globalAlpha = 1; ctx.stroke(); }
    else { ctx.beginPath(); for (var i = 0; i < 10; i++) { var rad = i % 2 ? r * .38 : r * .85, a = -Math.PI / 2 + i * Math.PI / 5; ctx[i ? "lineTo" : "moveTo"](cx + rad * Math.cos(a), cy + rad * Math.sin(a)); } ctx.closePath(); ctx.globalAlpha = .25; ctx.fill(); ctx.globalAlpha = 1; ctx.stroke(); }
    ctx.restore();
  }
  function rr(ctx, x, y, w, hh, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + hh, r); ctx.arcTo(x + w, y + hh, x, y + hh, r); ctx.arcTo(x, y + hh, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }

  AIX.drawPoster = function (canvas, d) {
    canvas.width = W; canvas.height = H; var ctx = canvas.getContext("2d"), th = THEMES[d.theme] || THEMES.ocean, M = 90;
    ctx.direction = "rtl"; ctx.textBaseline = "alphabetic";
    var g = ctx.createLinearGradient(0, 0, W, H); g.addColorStop(0, th.c1); g.addColorStop(1, th.c2); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = "rgba(255,255,255,.05)"; ctx.lineWidth = 2; for (var x = 0; x < W; x += 80) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); } for (var y = 0; y < H; y += 80) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
    ctx.fillStyle = th.acc; ctx.fillRect(0, 0, W, 14);
    ctx.textAlign = "left"; ctx.fillStyle = "rgba(255,255,255,.85)"; ctx.font = "700 34px " + FONT; ctx.direction = "ltr"; ctx.fillText("AI EXPLORER", M, 80); ctx.direction = "rtl";
    ctx.textAlign = "right"; ctx.fillStyle = th.acc; ctx.font = "600 32px " + FONT; ctx.fillText("پوستر علمی کاوشگر", W - M, 80);
    drawIcon(ctx, d.icon, W / 2, 250, 110, th.acc);
    ctx.textAlign = "center"; ctx.fillStyle = "#FFFFFF"; var ty = 440, tsize = 88; ctx.font = "800 " + tsize + "px " + FONT;
    var tl = wrap(ctx, d.title || "عنوان پوستر تو", W - 2 * M); if (tl.length > 3) tl = tl.slice(0, 3);
    tl.forEach(function (l, i) { ctx.fillText(l, W / 2, ty + i * 112); }); var y1 = ty + (tl.length - 1) * 112 + 70;
    ctx.fillStyle = th.acc; ctx.font = "600 44px " + FONT; var sl = wrap(ctx, d.slogan || "شعار کوتاه تو اینجا می‌آید", W - 2 * M - 80).slice(0, 2);
    sl.forEach(function (l, i) { ctx.fillText(l, W / 2, y1 + i * 60); }); var y2 = y1 + (sl.length - 1) * 60 + 70;
    var facts = d.facts.filter(function (f) { return f.t.trim(); }); if (!facts.length) facts = [{ t: "اینجا حقیقت بررسی‌شدهٔ تو می‌آید.", s: "منبع معتبر", v: false }];
    var fsz = 38, cards, top = y2, bottom = 1320;
    for (; fsz >= 28; fsz -= 2) {
      ctx.font = "500 " + fsz + "px " + FONT; var tot = 0;
      cards = facts.map(function (f) { var ls = wrap(ctx, f.t, W - 2 * M - 220).slice(0, 4); var hh = 40 + ls.length * (fsz + 14) + 70; tot += hh + 24; return { f: f, ls: ls, h: hh }; });
      if (top + tot <= bottom) break;
    }
    var cy = top;
    cards.forEach(function (c, i) {
      ctx.fillStyle = "rgba(17,26,51,.88)"; rr(ctx, M, cy, W - 2 * M, c.h, 28); ctx.fill(); ctx.strokeStyle = "rgba(255,255,255,.16)"; ctx.lineWidth = 2; ctx.stroke();
      ctx.fillStyle = th.acc; ctx.beginPath(); ctx.arc(W - M - 60, cy + 66, 32, 0, 7); ctx.fill(); ctx.fillStyle = "#0B1020"; ctx.textAlign = "center"; ctx.font = "800 36px " + FONT; ctx.fillText(u.fa(i + 1), W - M - 60, cy + 79);
      ctx.textAlign = "right"; ctx.fillStyle = "#FFFFFF"; ctx.font = "500 " + fsz + "px " + FONT; c.ls.forEach(function (l, k) { ctx.fillText(l, W - M - 120, cy + 62 + k * (fsz + 14)); });
      var sy = cy + 40 + c.ls.length * (fsz + 14) + 34; ctx.font = "500 28px " + FONT; ctx.fillStyle = "rgba(255,255,255,.7)"; ctx.fillText("منبع: " + (c.f.s || "—"), W - M - 120, sy);
      ctx.textAlign = "left"; ctx.fillStyle = c.f.v ? "#35D07F" : "#FF9F43"; ctx.font = "700 28px " + FONT; ctx.fillText(c.f.v ? "بررسی‌شده" : "نیاز به بررسی", M + 36, sy);
      cy += c.h + 24;
    });
    var by = 1370; ctx.fillStyle = "rgba(255,255,255,.08)"; rr(ctx, M, by, W - 2 * M, 290, 28); ctx.fill(); ctx.strokeStyle = th.acc; ctx.lineWidth = 3; ctx.stroke();
    ctx.textAlign = "right"; ctx.fillStyle = th.acc; ctx.font = "800 34px " + FONT; ctx.fillText("شناسنامهٔ شفافیت", W - M - 40, by + 60);
    ctx.fillStyle = "#FFFFFF"; ctx.font = "500 30px " + FONT; var lvTxt = d.level >= 0 ? LEVELS[d.level] : "—";
    ctx.fillText("سطح استفاده از هوش مصنوعی: " + lvTxt, W - M - 40, by + 112);
    var lines = []; wrap(ctx, "هوش مصنوعی کمک کرد: " + (d.aiHelp || "—"), W - 2 * M - 80).slice(0, 2).forEach(function (l) { lines.push(l); });
    wrap(ctx, "کار من: " + (d.myWork || "—"), W - 2 * M - 80).slice(0, 2).forEach(function (l) { lines.push(l); });
    lines.slice(0, 4).forEach(function (l, i) { ctx.fillText(l, W - M - 40, by + 162 + i * 44); });
    ctx.textAlign = "center"; ctx.fillStyle = "rgba(255,255,255,.7)"; ctx.font = "600 28px " + FONT; ctx.fillText((d.nick ? "طراح: " + d.nick + "   |   " : "") + "ساخته‌شده در AI EXPLORER · AIhub Tools", W / 2, 1712);
  };

  function privacyProblem(d) {
    var texts = [["عنوان", d.title], ["شعار", d.slogan], ["کار من", d.myWork], ["کمک هوش مصنوعی", d.aiHelp], ["اسم مستعار", d.nick]].concat(d.facts.map(function (f, i) { return ["حقیقت " + u.fa(i + 1), f.t]; })).concat(d.facts.map(function (f, i) { return ["منبع " + u.fa(i + 1), f.s]; }));
    for (var i = 0; i < texts.length; i++) { var s = texts[i][1] || ""; if (/[0-9۰-۹]{7,}/.test(s) || /@|https?:\/\/|www\./i.test(s)) return texts[i][0]; }
    return null;
  }
  AIX.validatePoster = function (d) {
    if ((d.title || "").trim().length < 3) return "عنوان پوستر را بنویس.";
    var facts = d.facts.filter(function (f) { return f.t.trim(); });
    if (!facts.length || facts[0].t.trim().length < 5) return "حداقل یک حقیقت بنویس.";
    for (var i = 0; i < d.facts.length; i++) { var f = d.facts[i]; if (f.v && !f.s.trim()) return "حقیقت " + u.fa(i + 1) + " را «بررسی‌شده» علامت زده‌ای، پس منبعش را هم بنویس."; }
    if (d.level < 0) return "سطح استفاده از هوش مصنوعی را انتخاب کن.";
    if (d.level > 0 && !(d.aiHelp || "").trim()) return "بنویس هوش مصنوعی کجا کمک کرد.";
    if (!(d.myWork || "").trim()) return "بنویس چه کاری را خودت انجام دادی.";
    var p = privacyProblem(d); if (p) return "در «" + p + "» چیزی شبیه شماره، ایمیل یا لینک هست. اطلاعات شخصی را حذف کن.";
    return null;
  };

  AIX.views = AIX.views || {};
  AIX.views.poster = function (root) {
    var d = data(), canvas = h("canvas", { class: "poster-canvas", role: "img", "aria-label": "پیش‌نمایش پوستر" }), msg = h("div", { class: "form-msg", "aria-live": "polite" });
    var redraw = u.debounce(function () { AIX.drawPoster(canvas, d); }, 120), persist = function () { AIX.store.save(); redraw(); };
    function field(label, el, hint) { return h("label", { class: "field" }, h("span", null, label), el, hint ? h("small", { class: "muted" }, hint) : null); }
    function txt(key, max, ph) { var i = h("input", { type: "text", maxlength: max, placeholder: ph || "", value: d[key] || "" }); i.addEventListener("input", function () { d[key] = i.value; persist(); }); return i; }
    function area(key, max, ph) { var i = h("textarea", { rows: 2, maxlength: max, placeholder: ph || "" }); i.value = d[key] || ""; i.addEventListener("input", function () { d[key] = i.value; persist(); }); return i; }
    var themeBox = h("div", { class: "choice" }); Object.keys(THEMES).forEach(function (k) {
      var b = h("button", { type: "button", class: "swatch" + (d.theme === k ? " on" : ""), style: "--c:" + THEMES[k].acc, "aria-pressed": d.theme === k ? "true" : "false" }, THEMES[k].name);
      b.addEventListener("click", function () { d.theme = k; u.$$(".swatch", themeBox).forEach(function (x) { x.classList.remove("on"); x.setAttribute("aria-pressed", "false"); }); b.classList.add("on"); b.setAttribute("aria-pressed", "true"); persist(); }); themeBox.appendChild(b);
    });
    var iconBox = h("div", { class: "choice" }); Object.keys(ICONS).forEach(function (k) {
      var b = h("button", { type: "button", class: "swatch" + (d.icon === k ? " on" : ""), "aria-pressed": d.icon === k ? "true" : "false" }, ICONS[k]);
      b.addEventListener("click", function () { d.icon = k; u.$$(".swatch", iconBox).forEach(function (x) { x.classList.remove("on"); x.setAttribute("aria-pressed", "false"); }); b.classList.add("on"); b.setAttribute("aria-pressed", "true"); persist(); }); iconBox.appendChild(b);
    });
    var factEls = d.facts.map(function (f, i) {
      var t = h("textarea", { rows: 2, maxlength: 110, placeholder: "حقیقتی که بررسی کرده‌ای" }); t.value = f.t; t.addEventListener("input", function () { f.t = t.value; persist(); });
      var s = h("input", { type: "text", maxlength: 70, placeholder: "منبع (مثلاً کتاب علوم یا دانشنامه)", value: f.s }); s.addEventListener("input", function () { f.s = s.value; persist(); });
      var v = h("input", { type: "checkbox", id: "fv" + i }); v.checked = !!f.v; v.addEventListener("change", function () { f.v = v.checked; persist(); });
      return h("fieldset", { class: "fact" }, h("legend", null, "حقیقت " + u.fa(i + 1)), t, s, h("label", { class: "check" }, v, " این حقیقت را با منبع معتبر بررسی کرده‌ام"));
    });
    var lvl = h("select", null, h("option", { value: "-1" }, "انتخاب کن…")); LEVELS.forEach(function (l, i) { lvl.appendChild(h("option", { value: i }, l)); }); lvl.value = String(d.level); lvl.addEventListener("change", function () { d.level = Number(lvl.value); persist(); });
    var exportBtn = h("button", { type: "button", class: "btn primary", html: AIX.ic("download", 18) + " ساخت و دانلود پوستر (PNG)" });
    exportBtn.addEventListener("click", function () {
      var err = AIX.validatePoster(d); msg.className = "form-msg show " + (err ? "no" : "ok");
      if (err) { msg.textContent = err; return; }
      AIX.drawPoster(canvas, d);
      canvas.toBlob(function (blob) {
        if (!blob) { msg.className = "form-msg show no"; msg.textContent = "ساخت فایل ممکن نشد. دوباره امتحان کن."; return; }
        u.download("aihub-explorers-poster.png", blob);
        d.exported = true; AIX.store.save(true); AIX.progress.addXp("poster:export", 40); AIX.progress.badges();
        msg.textContent = "پوستر ساخته شد و دانلود شد. اگر آن را برای کسی می‌فرستی، فقط برای خانواده یا معلم باشد."; 
      }, "image/png");
    });
    var reset = h("button", { type: "button", class: "btn ghost" }, "پاک کردن پروژه");
    reset.addEventListener("click", function () { if (confirm("همهٔ نوشته‌های این پوستر پاک شود؟")) { AIX.store.get().projects.poster = blank(); AIX.store.save(true); AIX.router.render(); } });
    var form = h("div", { class: "poster-form" },
      h("section", { class: "card" }, h("h3", null, "۱. پیام اصلی"), field("عنوان (حداکثر ۴۰ حرف)", txt("title", 40, "مثلاً: لاک‌پشت‌های دریایی")), field("شعار کوتاه", txt("slogan", 70, "مثلاً: دریا را پاک نگه داریم"))),
      h("section", { class: "card" }, h("h3", null, "۲. سه حقیقت بررسی‌شده"), h("p", { class: "muted" }, "حقیقت‌ها را از منبع معتبر بنویس. هوش مصنوعی فقط سرنخ است."), factEls),
      h("section", { class: "card" }, h("h3", null, "۳. ظاهر پوستر"), field("رنگ‌بندی", themeBox), field("نماد", iconBox)),
      h("section", { class: "card" }, h("h3", null, "۴. شناسنامهٔ شفافیت"), field("سطح استفاده از هوش مصنوعی", lvl), field("هوش مصنوعی کجا کمک کرد؟", area("aiHelp", 140, "اگر سطح ۰ است، بنویس: کمکی نگرفتم")), field("چه کاری را خودم انجام دادم؟", area("myWork", 140, "مثلاً: عنوان، شعار و بررسی منبع‌ها")), field("اسم مستعار (اختیاری)", txt("nick", 20, "بدون نام کامل یا اطلاعات شخصی"))),
      h("div", { class: "row-actions" }, exportBtn, reset), msg);
    var warn = h("p", { class: "note" }, "نام کامل، آدرس، شماره تلفن و عکس شخصی را در پوستر نگذار. پوستر روی دستگاه خودت ساخته می‌شود و جایی ارسال نمی‌شود.");
    u.clear(root); root.appendChild(h("div", { class: "page-head" }, h("h1", null, "استودیوی پوستر علمی"), h("p", { class: "lead" }, "پروژهٔ خلاقانهٔ فصل سوم: از ایده تا پوستر. همه‌چیز با خودت است؛ فقط شفاف بنویس هوش مصنوعی کجا کمک کرده."), warn));
    root.appendChild(h("div", { class: "poster-layout" }, form, h("div", { class: "poster-preview card" }, h("h3", null, "پیش‌نمایش"), canvas)));
    var go = function () { AIX.drawPoster(canvas, d); }; if (document.fonts && document.fonts.ready) document.fonts.ready.then(go); else go();
  };
})();
