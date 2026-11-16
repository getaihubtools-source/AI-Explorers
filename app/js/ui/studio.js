// استودیوی خلاق: سازندهٔ پرامپت تصویر و استوری‌بورد شش‌قابی. آفلاین است و هیچ هوش مصنوعی واقعی‌ای صدا زده نمی‌شود.
(function () {
  var AIX = window.AIX = window.AIX || {}, u = AIX.u, h = u.h, P = function () { return AIX.progress; };
  var V = AIX.views = AIX.views || {};
  var FONT = '"Vazirmatn", Tahoma, "Segoe UI", "DejaVu Sans", sans-serif';
  function head(t, l) { return h("div", { class: "page-head" }, h("h1", null, t), l ? h("p", { class: "lead" }, l) : null); }
  function privacy(s) { s = s || ""; return /[0-9۰-۹]{7,}/.test(s) || /@|https?:\/\/|www\./i.test(s); }
  function award(key) { var x = P().markLab(key); if (x) { u.toast("آفرین! " + u.fa(x) + " امتیاز آزمایشگاه گرفتی.", "ok"); P().badges(); } return x; }
  function xpNote(key) { return h("span", { class: "chip " + (P().labDone(key) ? "ok" : "") }, P().labDone(key) ? "امتیاز این آزمایشگاه گرفته شد" : "تا " + u.fa(P().XP.lab) + " امتیاز یک‌باره"); }

  // ---------- سازندهٔ پرامپت ----------
  var OPTS = {
    style: { label: "سبک", items: [["نقاشی آبرنگ", "watercolor painting"], ["کارتونی ساده", "simple flat cartoon style"], ["سه‌بعدی نرم", "soft 3D render"], ["مدادرنگی", "colored pencil drawing"], ["کاغذ بریده", "paper cut-out art"], ["پیکسل‌آرت", "pixel art"]] },
    light: { label: "نور", items: [["نور گرم غروب", "warm sunset light"], ["نور روشن صبح", "bright morning light"], ["نور مهتاب", "soft moonlight"], ["نور نرم داخل خانه", "soft indoor lighting"]] },
    camera: { label: "زاویهٔ دید", items: [["از نزدیک", "close-up"], ["نمای کامل", "wide shot"], ["از بالا", "top-down view"], ["از پایین به بالا", "low angle view"]] },
    mood: { label: "حال‌وهوا", items: [["شاد و پرانرژی", "joyful and energetic"], ["آرام و رؤیایی", "calm and dreamy"], ["ماجراجویانه", "adventurous"], ["مرموز", "mysterious"]] }
  };
  var AVOID = [["نوشته و حروف", "text or letters"], ["چهرهٔ واقعی آدم‌ها", "realistic human faces"], ["صحنهٔ ترسناک", "scary content"]];
  function buildPrompt(st) {
    var fa = [], en = [];
    if (st.subject.trim()) { fa.push(st.subject.trim()); }
    ["style", "light", "camera", "mood"].forEach(function (k) { var i = st[k]; if (i >= 0) { fa.push(OPTS[k].items[i][0]); en.push(OPTS[k].items[i][1]); } });
    var av = st.avoid.map(function (i) { return AVOID[i]; });
    return { fa: fa.join("، ") + (av.length ? ". نباشد: " + av.map(function (a) { return a[0]; }).join("، ") : ""), en: en.join(", ") + (av.length ? ". Avoid: " + av.map(function (a) { return a[1]; }).join(", ") : "") };
  }
  V.promptLab = function (root) {
    u.clear(root); root.appendChild(head("سازندهٔ پرامپت تصویر", "یک ایده را به توصیف دقیق تبدیل کن. اینجا چیزی ساخته نمی‌شود؛ فقط متن پرامپت را می‌سازی تا با یک ابزار مجاز و با کمک بزرگسال امتحانش کنی."));
    var st = { subject: "", style: -1, light: -1, camera: -1, mood: -1, avoid: [] };
    root.appendChild(h("p", { class: "note" }, "اسم و عکس آدم‌های واقعی، شمارهٔ تلفن، آدرس و لینک را در پرامپت ننویس."));
    var subj = h("input", { type: "text", maxlength: 120, class: "inp", placeholder: "موضوع: مثلاً «روباهی که روی ابر کتاب می‌خواند»", "aria-label": "موضوع" });
    var out = h("div", { class: "card prompt-out", "aria-live": "polite" }), msg = h("p", { class: "muted" });
    root.appendChild(h("label", { class: "fld" }, h("strong", null, "موضوع"), subj));
    function render() { var b = buildPrompt(st); u.clear(out); out.appendChild(h("h3", null, "پرامپت فارسی")); out.appendChild(h("p", { dir: "rtl" }, b.fa || "—")); out.appendChild(h("h3", null, "نسخهٔ انگلیسی (بیشتر ابزارها انگلیسی را بهتر می‌فهمند)")); out.appendChild(h("p", { dir: "ltr", class: "ltr" }, b.en || "—")); }
    subj.addEventListener("input", function () { st.subject = subj.value; render(); });
    Object.keys(OPTS).forEach(function (k) {
      var row = h("div", { class: "chips", role: "group", "aria-label": OPTS[k].label });
      OPTS[k].items.forEach(function (it, i) { var b = h("button", { type: "button", class: "chip pick", "aria-pressed": "false" }, it[0]); b.addEventListener("click", function () { st[k] = st[k] === i ? -1 : i; u.$$("button", row).forEach(function (x, j) { var on = st[k] === j; x.classList.toggle("sel", on); x.setAttribute("aria-pressed", on ? "true" : "false"); }); render(); }); row.appendChild(b); });
      root.appendChild(h("div", { class: "fld" }, h("strong", null, OPTS[k].label), row));
    });
    var arow = h("div", { class: "chips", role: "group", "aria-label": "چه چیزی نباشد" });
    AVOID.forEach(function (a, i) { var b = h("button", { type: "button", class: "chip pick", "aria-pressed": "false" }, a[0]); b.addEventListener("click", function () { var k = st.avoid.indexOf(i); if (k >= 0) st.avoid.splice(k, 1); else st.avoid.push(i); var on = k < 0; b.classList.toggle("sel", on); b.setAttribute("aria-pressed", on ? "true" : "false"); render(); }); arow.appendChild(b); });
    root.appendChild(h("div", { class: "fld" }, h("strong", null, "چه چیزی نباشد؟ (اختیاری)"), arow));
    root.appendChild(out); render();
    var btn = h("button", { type: "button", class: "btn primary" }, "تأیید و کپی پرامپت");
    btn.addEventListener("click", function () {
      var picked = ["style", "light", "camera", "mood"].filter(function (k) { return st[k] >= 0; }).length;
      var q = P().textQuality(st.subject, 8, 2);
      if (!q.ok) { msg.textContent = "موضوع را با چند کلمه بنویس تا پرامپت معنی داشته باشد."; return; }
      if (privacy(st.subject)) { msg.textContent = "در موضوع چیزی شبیه شماره، ایمیل یا لینک هست. اطلاعات شخصی را حذف کن."; return; }
      if (picked < 3) { msg.textContent = "حداقل سه ویژگی (سبک، نور، زاویه، حال‌وهوا) انتخاب کن."; return; }
      var b = buildPrompt(st), txt = b.en + "\n" + st.subject.trim();
      var full = b.en ? st.subject.trim() + ", " + b.en : txt; msg.textContent = "پرامپت آماده است. با یک ابزار مجاز و کنار بزرگسال امتحانش کن.";
      try { navigator.clipboard.writeText(full).then(function () { msg.textContent = "کپی شد. با یک ابزار مجاز و کنار بزرگسال امتحانش کن."; }, function () { msg.textContent = "پرامپت آماده است؛ متن بالا را خودت کپی کن."; }); } catch (e) { msg.textContent = "پرامپت آماده است؛ متن بالا را خودت کپی کن."; }
      award("prompt");
    });
    root.appendChild(h("div", { class: "row" }, btn, xpNote("prompt"))); root.appendChild(msg);
    root.appendChild(h("a", { class: "back", href: "#/labs" }, "آزمایشگاه‌ها"));
  };

  // ---------- استوری‌بورد ----------
  var SHOTS = ["نمای کامل", "نمای متوسط", "نمای نزدیک", "از بالا", "از پایین", "حرکت دوربین"];
  function wrapText(ctx, text, maxW) { var words = String(text).split(/\s+/).filter(Boolean), lines = [], cur = ""; words.forEach(function (w) { var t = cur ? cur + " " + w : w; if (ctx.measureText(t).width > maxW && cur) { lines.push(cur); cur = w; } else cur = t; }); if (cur) lines.push(cur); return lines; }
  function drawBoard(d) {
    var W = 1240, H = 1754, c = document.createElement("canvas"); c.width = W; c.height = H; var ctx = c.getContext("2d");
    ctx.fillStyle = "#f4f6ff"; ctx.fillRect(0, 0, W, H); ctx.direction = "rtl"; ctx.textAlign = "right";
    ctx.fillStyle = "#0b1020"; ctx.fillRect(0, 0, W, 190); ctx.fillStyle = "#6ee7ff"; ctx.font = "800 56px " + FONT; ctx.fillText(d.title, W - 60, 100);
    ctx.fillStyle = "#cfd6ff"; ctx.font = "600 28px " + FONT; ctx.fillText("استوری‌بورد · AI EXPLORER" + (d.nick ? " · " + d.nick : ""), W - 60, 150);
    var cw = 540, ch = 470, gx = 60, y0 = 230;
    d.frames.forEach(function (f, i) {
      var col = i % 2, row = Math.floor(i / 2), x = W - 60 - cw - col * (cw + gx), y = y0 + row * (ch + 30);
      ctx.fillStyle = "#fff"; ctx.fillRect(x, y, cw, ch); ctx.strokeStyle = "#2a2f8f"; ctx.lineWidth = 4; ctx.strokeRect(x, y, cw, ch);
      ctx.fillStyle = "#2a2f8f"; ctx.fillRect(x, y, cw, 56); ctx.fillStyle = "#fff"; ctx.font = "800 30px " + FONT; ctx.fillText("قاب " + u.fa(i + 1) + " · " + SHOTS[f.shot] + " · " + u.fa(f.sec) + " ثانیه", x + cw - 18, y + 40);
      ctx.fillStyle = "#10162b"; ctx.font = "600 30px " + FONT; wrapText(ctx, f.text || "—", cw - 44).slice(0, 8).forEach(function (l, k) { ctx.fillText(l, x + cw - 22, y + 112 + k * 46); });
    });
    ctx.textAlign = "center"; ctx.fillStyle = "#555c7a"; ctx.font = "600 26px " + FONT; ctx.fillText("ساخته‌شده روی دستگاه خودم · هوش مصنوعی در ساخت این برگه نقشی نداشته", W / 2, H - 40);
    return c;
  }
  V.storyLab = function (root) {
    u.clear(root); root.appendChild(head("استوری‌بورد شش‌قابی", "قبل از ساختن انیمیشن یا ریل، شش قاب را روی کاغذ دیجیتال طراحی کن. این برگه را بعداً به هر ابزار ویدیو می‌دهی."));
    root.appendChild(h("p", { class: "note" }, "از اسم و چهرهٔ آدم‌های واقعی و شخصیت‌های کارتونی معروف استفاده نکن. شخصیت خودت را بساز."));
    var title = h("input", { type: "text", maxlength: 60, class: "inp", placeholder: "اسم داستان", "aria-label": "اسم داستان" });
    root.appendChild(h("label", { class: "fld" }, h("strong", null, "اسم داستان"), title));
    var frames = []; var box = h("div", { class: "grid" });
    for (var i = 0; i < 6; i++) (function (i) {
      var f = { shot: 0, sec: 3, text: "" }; frames.push(f);
      var sel = h("select", { "aria-label": "نوع نما قاب " + (i + 1) }); SHOTS.forEach(function (s, k) { sel.appendChild(h("option", { value: k }, s)); });
      var sec = h("select", { "aria-label": "مدت قاب " + (i + 1) }); [2, 3, 4, 5].forEach(function (s) { var o = h("option", { value: s }, u.fa(s) + " ثانیه"); if (s === 3) o.selected = true; sec.appendChild(o); });
      var ta = h("textarea", { rows: 3, maxlength: 160, "aria-label": "توضیح قاب " + (i + 1), placeholder: "چه چیزی دیده می‌شود؟ شخصیت چه می‌کند؟" });
      sel.addEventListener("change", function () { f.shot = +sel.value; }); sec.addEventListener("change", function () { f.sec = +sec.value; }); ta.addEventListener("input", function () { f.text = ta.value; });
      box.appendChild(h("div", { class: "card" }, h("strong", null, "قاب " + u.fa(i + 1)), h("div", { class: "row" }, sel, sec), ta));
    })(i);
    root.appendChild(box);
    var msg = h("p", { class: "muted", role: "status" }), btn = h("button", { type: "button", class: "btn primary", html: AIX.ic("download", 18) + " ساخت و دانلود برگهٔ استوری‌بورد (PNG)" });
    btn.addEventListener("click", function () {
      if (title.value.trim().length < 3) { msg.textContent = "برای داستانت اسم بنویس."; return; }
      var good = frames.filter(function (f) { return P().textQuality(f.text, 10, 3).ok; }).length;
      if (good < 4) { msg.textContent = "حداقل چهار قاب را با یک جملهٔ واقعی (چند کلمه) توضیح بده. الان " + u.fa(good) + " قاب کامل است."; return; }
      var all = [title.value].concat(frames.map(function (f) { return f.text; })); if (all.some(privacy)) { msg.textContent = "در متن‌ها چیزی شبیه شماره، ایمیل یا لینک هست. حذفش کن."; return; }
      var nick = (AIX.store.get().profile || {}).nick || "";
      var c = drawBoard({ title: title.value.trim(), nick: nick, frames: frames });
      c.toBlob(function (blob) { if (blob) { u.download("aihub-explorers-storyboard.png", blob); msg.textContent = "برگه ساخته شد."; award("story"); } });
    });
    root.appendChild(h("div", { class: "row" }, btn, xpNote("story"))); root.appendChild(msg);
    root.appendChild(h("a", { class: "back", href: "#/labs" }, "آزمایشگاه‌ها"));
  };

  // کارت‌ها در صفحهٔ آزمایشگاه‌ها
  var base = V.labs;
  V.labs = function (root) {
    base(root);
    root.appendChild(h("h2", { class: "sec" }, "استودیوی خلاق"));
    var g = h("div", { class: "grid wide" });
    g.appendChild(h("a", { class: "card link big-card", href: "#/labs/prompt" }, h("span", { html: AIX.ic("pen", 32) }), h("div", null, h("h3", null, "سازندهٔ پرامپت تصویر"), h("p", null, "موضوع، سبک، نور و زاویه را بچین و پرامپت دقیق بساز."), xpNote("prompt"))));
    g.appendChild(h("a", { class: "card link big-card", href: "#/labs/story" }, h("span", { html: AIX.ic("loop", 32) }), h("div", null, h("h3", null, "استوری‌بورد شش‌قابی"), h("p", null, "قبل از انیمیشن، شش قاب را طراحی کن و به‌صورت PNG بگیر."), xpNote("story"))));
    root.appendChild(g);
  };
})();
