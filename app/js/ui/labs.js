// آزمایشگاه‌ها: شبیه‌ساز گفت‌وگو، آزمایشگاه آموزش مدل، آزمایشگاه فید پیشنهادی
// همه‌چیز آفلاین و بدون هوش مصنوعی واقعی است؛ شبیه‌ساز همیشه برچسب «ساختگی» دارد.
(function () {
  var AIX = window.AIX = window.AIX || {}, u = AIX.u, h = u.h, P = function () { return AIX.progress; };
  var V = AIX.views = AIX.views || {};
  function back(to, label) { return h("a", { class: "back", href: to }, label || "آزمایشگاه‌ها"); }
  function head(title, lead) { return h("div", { class: "page-head" }, h("h1", null, title), lead ? h("p", { class: "lead" }, lead) : null); }
  function xpNote(key) { return h("span", { class: "chip " + (P().labDone(key) ? "ok" : "") }, P().labDone(key) ? "امتیاز این آزمایشگاه گرفته شد" : "تا " + u.fa(P().XP.lab) + " امتیاز یک‌باره"); }
  function award(key) { var x = P().markLab(key); if (x) { u.toast("آفرین! " + u.fa(x) + " امتیاز آزمایشگاه گرفتی.", "ok"); P().badges(); } return x; }

  // ================= شبیه‌ساز گفت‌وگو =================
  AIX.simsFor = function (lessonId) { var s = AIX.sims || {}; return Object.keys(s).filter(function (k) { return s[k].lessons && s[k].lessons.indexOf(lessonId) >= 0; }); };
  function banner() { return h("div", { class: "sim-banner", role: "note" }, h("strong", null, "شبیه‌ساز · "), "این گفت‌وگو از قبل نوشته شده است و هوش مصنوعی واقعی نیست. فقط برای تمرین بررسی کردن ساخته شده. بعضی جمله‌ها عمداً غلط‌اند."); }
  function bubble(kind, text) { return h("div", { class: "bubble " + kind }, h("div", null, kind === "u" ? "پرسش تو" : "پاسخ شبیه‌سازی‌شده"), typeof text === "string" ? h("p", null, text) : text); }

  AIX.renderSim = function (root, id, onDone) {
    var sim = (AIX.sims || {})[id]; u.clear(root); if (!sim) { root.appendChild(h("p", null, "این شبیه‌ساز پیدا نشد.")); return; }
    root.appendChild(h("h3", null, sim.title)); root.appendChild(banner()); root.appendChild(h("p", { class: "lead" }, sim.intro));
    var chat = h("div", { class: "sim-chat" }), ctl = h("div", { class: "sim-ctl" }); root.appendChild(chat); root.appendChild(ctl);
    if (sim.mode === "detect") detect(sim, id, chat, ctl, root, onDone); else compare(sim, id, chat, ctl, root, onDone);
  };

  function detect(sim, id, chat, ctl, root, onDone) {
    var t = sim.turns[0], sel = {};
    ctl.appendChild(h("p", { class: "muted" }, "اول سؤال را بفرست:"));
    var ask = h("button", { type: "button", class: "opt" }, t.ask);
    ask.addEventListener("click", function () {
      ask.remove(); chat.appendChild(bubble("u", t.ask));
      var box = h("div", { class: "sim-reply" });
      t.reply.forEach(function (s, i) {
        var b = h("button", { type: "button", class: "spot-item", "aria-pressed": "false" }, s.t), fb = h("div", { class: "fb" });
        b.addEventListener("click", function () { if (b.disabled) return; sel[i] = !sel[i]; b.classList.toggle("sel", !!sel[i]); b.setAttribute("aria-pressed", sel[i] ? "true" : "false"); });
        box.appendChild(h("div", { class: "spot-row" }, b, fb)); s._b = b; s._fb = fb;
      });
      chat.appendChild(bubble("a", box));
      ctl.appendChild(h("p", { class: "muted" }, "روی جمله‌هایی که مشکل دارند یا باید بررسی شوند بزن، بعد «بررسی» را بزن."));
      var go = h("button", { type: "button", class: "btn primary" }, "بررسی پاسخ");
      go.addEventListener("click", function () {
        var cor = 0; go.remove();
        t.reply.forEach(function (s, i) {
          var picked = !!sel[i], ok = picked === s.flag; if (ok) cor++; s._b.disabled = true;
          s._fb.className = "fb show " + (ok ? "ok" : "no"); s._fb.textContent = (s.flag ? (picked ? "درست پیدا کردی! " : "این مورد را باید علامت می‌زدی. ") : (picked ? "این مورد مشکل نبود. " : "درست؛ مشکلی ندارد. ")) + s.why;
        });
        var pass = cor / t.reply.length >= 0.7;
        ctl.appendChild(h("div", { class: "quiz-result show " + (pass ? "ok" : "no") }, h("strong", null, u.fa(cor) + " درست از " + u.fa(t.reply.length) + (pass ? " — کارآگاه خوبی هستی!" : " — دوباره امتحان کن.")), h("p", null, sim.outro), h("button", { type: "button", class: "btn", onclick: function () { AIX.renderSim(root, id, onDone); } }, "تلاش دوباره")));
        if (pass) award("sim:" + id); if (onDone) onDone(pass);
      });
      ctl.appendChild(go);
    });
    ctl.appendChild(ask);
  }

  function compare(sim, id, chat, ctl, root, onDone) {
    var seen = 0, total = sim.turns.length, list = h("div", { class: "sim-opts" }), concl = h("div", { class: "sim-concl" });
    ctl.appendChild(h("p", { class: "muted" }, "هر دو سؤال را بفرست تا جواب‌ها را ببینی:")); ctl.appendChild(list); ctl.appendChild(concl);
    sim.turns.forEach(function (t) {
      var b = h("button", { type: "button", class: "opt" }, t.ask);
      b.addEventListener("click", function () {
        b.disabled = true; b.classList.add("sel"); chat.appendChild(bubble("u", t.ask));
        chat.appendChild(bubble("a", h("div", null, t.reply.map(function (p) { return h("p", null, p); })))); seen++;
        if (seen === total) conclusion();
      });
      list.appendChild(b);
    });
    function conclusion() {
      var c = sim.conclusion; concl.appendChild(h("h4", null, c.q)); var fb = h("div", { class: "fb" });
      c.options.forEach(function (o) {
        var b = h("button", { type: "button", class: "opt" }, o.t);
        b.addEventListener("click", function () {
          u.$$(".opt", concl).forEach(function (x) { x.disabled = true; if (x.textContent === c.options.filter(function (z) { return z.ok; })[0].t) x.classList.add("right"); });
          if (!o.ok) b.classList.add("wrong"); fb.className = "fb show " + (o.ok ? "ok" : "no"); fb.textContent = (o.ok ? "درست! " : "این‌طور نیست. ") + o.why;
          if (o.ok) award("sim:" + id); if (onDone) onDone(o.ok);
          concl.appendChild(h("button", { type: "button", class: "btn", onclick: function () { AIX.renderSim(root, id, onDone); } }, "دوباره از اول"));
        });
        concl.appendChild(b);
      });
      concl.appendChild(fb);
    }
  }

  V.simPage = function (root, id) {
    u.clear(root); root.appendChild(back("#/labs")); var card = h("div", { class: "card" }); root.appendChild(card); AIX.renderSim(card, id, function () { AIX.router.softRefresh && 0; });
  };

  // ================= آزمایشگاه آموزش مدل =================
  V.modelLab = function (root) {
    var K = AIX.knn, train = [], k = 1, tests = {}, W = 360, Hh = 300, M = 28;
    u.clear(root); root.appendChild(back("#/labs"));
    root.appendChild(head("آزمایشگاه آموزش مدل: گربه یا سگ؟", "تو معلم یک برنامهٔ ساده‌ای. نمونه‌های آموزشی را انتخاب کن، بعد ببین برنامه روی نمونه‌های تازه چقدر درست حدس می‌زند."));
    root.appendChild(h("div", { class: "sim-banner", role: "note" }, h("strong", null, "ساختگی و ساده · "), "داده‌ها برای آموزش ساخته شده‌اند. هر نمونه دو ویژگی دارد: «اندازهٔ بدن» و «درازی پوزه». برنامه نزدیک‌ترین نمونه‌های آموزشی را پیدا می‌کند و مثل آن‌ها حدس می‌زند."));
    var layout = h("div", { class: "lab-grid" }), left = h("div", { class: "card" }), right = h("div", { class: "card" }); layout.appendChild(left); layout.appendChild(right); root.appendChild(layout);
    var svgNS = "http://www.w3.org/2000/svg", plot = document.createElementNS(svgNS, "svg");
    plot.setAttribute("viewBox", "0 0 " + W + " " + Hh); plot.setAttribute("class", "plot"); plot.setAttribute("role", "img"); plot.setAttribute("aria-label", "نمودار نمونه‌ها: محور افقی اندازهٔ بدن، محور عمودی درازی پوزه");
    function px(x) { return W - M - (x / 10) * (W - 2 * M); } // راست‌به‌چپ: اندازهٔ بزرگ‌تر سمت چپ
    function py(y) { return Hh - M - (y / 10) * (Hh - 2 * M); }
    function el(tag, attrs, text) { var e = document.createElementNS(svgNS, tag); Object.keys(attrs).forEach(function (a) { e.setAttribute(a, attrs[a]); }); if (text) e.textContent = text; return e; }
    function draw(result) {
      while (plot.firstChild) plot.removeChild(plot.firstChild);
      plot.appendChild(el("rect", { x: M, y: 8, width: W - 2 * M, height: Hh - M - 8, fill: "rgba(255,255,255,.03)", stroke: "rgba(255,255,255,.18)" }));
      plot.appendChild(el("text", { x: W / 2, y: Hh - 6, "text-anchor": "middle", fill: "var(--text-muted)", "font-size": 12 }, "اندازهٔ بدن (راست: کوچک ← چپ: بزرگ)"));
      var yl = el("text", { x: 10, y: Hh / 2, "text-anchor": "middle", fill: "var(--text-muted)", "font-size": 12, transform: "rotate(-90 10 " + (Hh / 2) + ")" }, "درازی پوزه"); plot.appendChild(yl);
      train.forEach(function (p) { plot.appendChild(shape(p, true)); });
      if (result) result.items.forEach(function (it) { plot.appendChild(shape(it.p, false, it)); });
    }
    function shape(p, filled, it) {
      var cx = px(p.x), cy = py(p.y), col = p.cls === "cat" ? "var(--chart-3)" : "var(--chart-2)", g = el("g", {});
      var s = p.cls === "cat" ? el("circle", { cx: cx, cy: cy, r: filled ? 6 : 7 }) : el("rect", { x: cx - 6, y: cy - 6, width: 12, height: 12 });
      if (filled) { s.setAttribute("fill", col); s.setAttribute("stroke", "#fff"); s.setAttribute("stroke-width", 1); }
      else { s.setAttribute("fill", "none"); s.setAttribute("stroke", it.ok ? "var(--success-500)" : "var(--danger-500)"); s.setAttribute("stroke-width", 2.5); }
      g.appendChild(s); if (!filled) g.appendChild(el("text", { x: cx, y: cy + 4, "text-anchor": "middle", fill: it.ok ? "var(--success-500)" : "var(--danger-500)", "font-size": 11, "font-weight": 800 }, it.ok ? "✓" : "✗")); return g;
    }
    left.appendChild(plot);
    left.appendChild(h("p", { class: "muted legend" }, "● گربه (آبی) · ■ سگ (نارنجی) · پر = نمونهٔ آموزشی · توخالی = نمونهٔ آزمون (سبز درست، قرمز اشتباه)"));
    var info = h("div", { class: "lab-info", "aria-live": "polite" });
    // کارت‌های نمونه
    var pool = h("div", { class: "pool" });
    function renderPool() {
      u.clear(pool);
      ["cat", "big", "small"].forEach(function (g) {
        var row = h("div", { class: "pool-row" }, h("strong", null, K.groups[g].label));
        K.pool.filter(function (p) { return p.group === g; }).forEach(function (p) {
          var on = train.indexOf(p) >= 0, b = h("button", { type: "button", class: "pchip " + p.cls + (on ? " on" : ""), "aria-pressed": on ? "true" : "false", title: K.groups[g].label + " · اندازه " + u.fa(p.x) + " · پوزه " + u.fa(p.y) }, p.cls === "cat" ? "●" : "■");
          b.addEventListener("click", function () { var i = train.indexOf(p); if (i >= 0) train.splice(i, 1); else train.push(p); change(); });
          row.appendChild(b);
        }); pool.appendChild(row);
      });
    }
    function sig() { return train.map(function (p) { return p.id; }).sort().join(",") + "|" + k; }
    function counts() { var c = { cat: 0, big: 0, small: 0 }; train.forEach(function (p) { c[p.group]++; }); return c; }
    function change() { renderPool(); draw(null); var c = counts(); u.clear(info); info.appendChild(h("p", null, "نمونه‌های آموزشی: " + u.fa(train.length) + " (گربه " + u.fa(c.cat) + " · سگ بزرگ " + u.fa(c.big) + " · سگ کوچک " + u.fa(c.small) + ")")); }
    function test() {
      if (!train.length) { u.toast("اول چند نمونهٔ آموزشی انتخاب کن.", "no"); return; }
      var r = K.evaluate(train, k); tests[sig()] = r.right / r.total; draw(r); u.clear(info);
      var pc = function (a) { return a[1] ? u.fa(Math.round(a[0] * 100 / a[1])) + "٪" : "—"; }, c = counts();
      info.appendChild(h("div", { class: "quiz-result show " + (r.right / r.total >= 0.9 ? "ok" : "no") }, h("strong", null, "نتیجهٔ آزمون: " + u.fa(r.right) + " درست از " + u.fa(r.total)),
        h("ul", { class: "reqs" }, h("li", null, "گربه‌ها: " + pc(r.by.cat)), h("li", null, "سگ‌های بزرگ: " + pc(r.by.big)), h("li", null, "سگ‌های کوچک: " + pc(r.by.small)))));
      if (c.small === 0 && r.by.small[0] / r.by.small[1] < 0.5) info.appendChild(h("p", { class: "fb show no" }, "دیدی؟ برنامه هیچ سگ کوچکی ندیده بود. سگ‌های کوچک را شبیه گربه حدس زد. این همان سوگیری داده است: مشکل از برنامه نیست، از نمونه‌های آموزشی است."));
      else if (c.small > 0 && r.by.small[0] / r.by.small[1] >= 0.8) info.appendChild(h("p", { class: "fb show ok" }, "حالا سگ‌های کوچک هم در نمونه‌های آموزشی بودند و برنامه آن‌ها را بهتر تشخیص داد. تنوع داده یعنی همین."));
      var keys = Object.keys(tests); if (keys.length >= 2) { var vals = keys.map(function (x) { return tests[x]; }); if (Math.max.apply(null, vals) - Math.min.apply(null, vals) >= 0.15) award("model"); }
    }
    var ctl = h("div", { class: "row-actions" });
    function btn(label, fn, cls) { var b = h("button", { type: "button", class: "btn " + (cls || "") }, label); b.addEventListener("click", fn); return b; }
    ctl.appendChild(btn("مجموعهٔ ۱: متوازن", function () { train = K.preset("balanced").slice(); change(); }));
    ctl.appendChild(btn("مجموعهٔ ۲: فقط گربه و سگ بزرگ", function () { train = K.preset("onesided").slice(); change(); }));
    ctl.appendChild(btn("پاک کردن", function () { train = []; change(); }));
    right.appendChild(h("h3", null, "۱. نمونه‌های آموزشی را انتخاب کن")); right.appendChild(h("p", { class: "muted" }, "روی نمونه‌ها بزن تا وارد آموزش شوند یا خارج شوند. یا یکی از مجموعه‌های آماده را بگذار.")); right.appendChild(ctl); right.appendChild(pool);
    var kSel = h("select", { "aria-label": "تعداد همسایه‌ها" }, h("option", { value: 1 }, "۱ همسایه (دقیق‌تر ولی حساس)"), h("option", { value: 3 }, "۳ همسایه (آرام‌تر)")); kSel.addEventListener("change", function () { k = Number(kSel.value); });
    right.appendChild(h("h3", null, "۲. برنامه را آزمون کن")); right.appendChild(h("label", { class: "field" }, h("span", null, "برنامه چند همسایهٔ نزدیک را نگاه کند؟"), kSel)); right.appendChild(btn("آزمون روی ۲۰ نمونهٔ تازه", test, "primary")); right.appendChild(info);
    root.appendChild(h("div", { class: "card" }, h("h3", null, "ماموریت کاوشگر"), h("ol", { class: "reqs" }, h("li", null, "مجموعهٔ ۲ را آزمون کن و نتیجه را ببین."), h("li", null, "حالا چند سگ کوچک هم اضافه کن و دوباره آزمون کن."), h("li", null, "بنویس: چرا نتیجه فرق کرد؟ این چه ربطی به سوگیری دارد؟")), xpNote("model")));
    renderPool(); change();
  };

  // ================= آزمایشگاه فید پیشنهادی =================
  var TOPICS = [
    { id: "ball", name: "فوتبال", items: ["گل‌های زیبای هفته", "ترفندهای دریبل", "تاریخچهٔ جام جهانی", "تمرین‌های خانگی فوتبال", "داور چطور تصمیم می‌گیرد؟"] },
    { id: "toon", name: "کارتون", items: ["بهترین انیمیشن‌های سال", "چطور یک شخصیت بکشیم", "پشت‌صحنهٔ یک کارتون", "ساخت انیمیشن با کاغذ", "قهرمان‌های داستان‌های قدیمی"] },
    { id: "sci", name: "علوم", items: ["آزمایش آتشفشان ساده", "سیاره‌های منظومهٔ شمسی", "چرا آسمان آبی است؟", "ساخت ربات ساده", "حیوانات اعماق دریا"] },
    { id: "cook", name: "آشپزی", items: ["شیرینی بدون فر", "املت مخصوص", "سالاد رنگارنگ", "نان خانگی", "دسر میوه‌ای"] },
    { id: "music", name: "موسیقی", items: ["آموزش سه‌تار برای مبتدی", "آهنگ‌های شاد", "ساز چطور صدا می‌دهد؟", "ریتم با دست‌زدن", "تاریخچهٔ موسیقی ایرانی"] }
  ];
  V.feedLab = function (root) {
    var w = {}, likes = 0, round = 0, items; TOPICS.forEach(function (t) { w[t.id] = 1; });
    u.clear(root); root.appendChild(back("#/labs"));
    root.appendChild(head("آزمایشگاه فید: چرا همه‌چیز شبیه هم می‌شود؟", "این فید ساده هر بار موضوع‌هایی را که بیشتر پسندیده‌ای، بیشتر نشان می‌دهد. ببین بعد از چند بار چه می‌شود."));
    root.appendChild(h("div", { class: "sim-banner", role: "note" }, h("strong", null, "ساختگی و ساده · "), "این فقط یک مدل کوچک از سیستم‌های پیشنهاددهنده است، نه برنامهٔ واقعی هیچ شبکهٔ اجتماعی."));
    var card = h("div", { class: "card" }), feed = h("div", { class: "feed", "aria-live": "polite" }), meter = h("div", { class: "feed-meter" }), msg = h("div", { class: "fb" });
    card.appendChild(feed); card.appendChild(msg); root.appendChild(card); root.appendChild(h("div", { class: "card" }, h("h3", null, "علاقهٔ فید به هر موضوع"), meter));
    function pick() {
      var out = [], pool = []; TOPICS.forEach(function (t) { t.items.forEach(function (it) { pool.push({ topic: t.id, tn: t.name, t: it, wt: w[t.id] }); }); });
      for (var i = 0; i < 6 && pool.length; i++) { var sum = pool.reduce(function (s, x) { return s + x.wt; }, 0), r = Math.random() * sum, j = 0; while (j < pool.length - 1 && (r -= pool[j].wt) > 0) j++; out.push(pool[j]); pool.splice(j, 1); }
      return out;
    }
    function render() {
      u.clear(feed); items = pick();
      items.forEach(function (it) {
        var like = h("button", { type: "button", class: "btn tiny" }, "می‌پسندم"), no = h("button", { type: "button", class: "btn tiny ghost" }, "علاقه ندارم");
        like.addEventListener("click", function () { w[it.topic] = Math.min(w[it.topic] * 2.2, 60); likes++; render(); });
        no.addEventListener("click", function () { w[it.topic] = Math.max(w[it.topic] / 2, 0.15); render(); });
        feed.appendChild(h("div", { class: "feed-item" }, h("div", null, h("small", { class: "chip" }, it.tn), h("strong", null, " " + it.t)), h("div", { class: "row-actions" }, like, no)));
      });
      u.clear(meter); var tot = TOPICS.reduce(function (s, t) { return s + w[t.id]; }, 0);
      TOPICS.forEach(function (t) { meter.appendChild(h("div", { class: "mrow" }, h("span", null, t.name), h("div", { class: "bar" }, h("b", { style: "width:" + Math.round(w[t.id] * 100 / tot) + "%" })), h("small", null, u.fa(Math.round(w[t.id] * 100 / tot)) + "٪"))); });
      var kinds = {}, mx = 0; items.forEach(function (i) { kinds[i.topic] = (kinds[i.topic] || 0) + 1; mx = Math.max(mx, kinds[i.topic]); }); var n = Object.keys(kinds).length, tight = mx >= 4;
      msg.className = "fb show " + (tight ? "no" : "ok"); msg.textContent = "موضوع‌های متفاوت در فید فعلی: " + u.fa(n) + " از " + u.fa(TOPICS.length) + (tight ? ". فید باریک شد! بیشتر فید فقط یک موضوع است. به این می‌گویند «حباب فیلتر»." : "");
      if (likes >= 6 && tight) { award("feed"); }
    }
    root.appendChild(h("div", { class: "card" }, h("h3", null, "ماموریت کاوشگر"), h("ol", { class: "reqs" }, h("li", null, "شش بار فقط یک موضوع را بپسند."), h("li", null, "ببین فید چطور تنگ می‌شود."), h("li", null, "راه‌حل پیدا کن: «علاقه ندارم»، جست‌وجوی عمدی موضوع تازه یا نگاه کردن با والد.")), xpNote("feed")));
    render();
  };

  // ================= صفحهٔ آزمایشگاه‌ها =================
  V.labs = function (root) {
    u.clear(root); root.appendChild(head("آزمایشگاه‌ها", "اینجا چیزهایی را امتحان می‌کنی که فقط خواندنشان کافی نیست. همه آفلاین‌اند و به هیچ هوش مصنوعی واقعی وصل نمی‌شوند."));
    var g = h("div", { class: "grid" });
    g.appendChild(h("a", { class: "card link big-card", href: "#/labs/model" }, h("span", { html: AIX.ic("flask", 32) }), h("div", null, h("h3", null, "آموزش مدل: گربه یا سگ؟"), h("p", null, "نمونه‌ها را خودت انتخاب کن و ببین سوگیری داده چطور برنامه را گمراه می‌کند."), xpNote("model"))));
    g.appendChild(h("a", { class: "card link big-card", href: "#/labs/feed" }, h("span", { html: AIX.ic("loop", 32) }), h("div", null, h("h3", null, "فید پیشنهادی و حباب فیلتر"), h("p", null, "با پسندیدن، فید را تنگ کن و راه‌های بیرون آمدن را پیدا کن."), xpNote("feed"))));
    root.appendChild(g);
    root.appendChild(h("h2", { class: "sec" }, "شبیه‌ساز گفت‌وگو (کارآگاهی)"));
    var sg = h("div", { class: "grid" }), S = AIX.sims || {};
    Object.keys(S).forEach(function (id) { sg.appendChild(h("a", { class: "card link", href: "#/labs/sim/" + id }, h("span", { html: AIX.ic("chat", 24) }), h("div", null, h("strong", null, S[id].title), h("p", null, S[id].mode === "detect" ? "جمله‌های مشکل‌دار را پیدا کن." : "جواب‌ها را مقایسه کن."), xpNote("sim:" + id)))); });
    root.appendChild(sg);
  };
  // ================= بستهٔ چاپی =================
  V.printPage = function (root) {
    var Lc = AIX.license, locked = !!(Lc && Lc.locked());
    u.clear(root); root.appendChild(head("بستهٔ چاپی", "سه فایل PDF برای چاپ روی کاغذ A4. بدون اینترنت هم کار می‌کنند و اطلاعات شخصی لازم ندارند."));
    var items = [
      { f: "parent-guide.pdf", t: "راهنمای یک‌صفحه‌ای والدین", d: "پنج پرسش خوب، قانون‌های ایمنی و نشانه‌هایی که باید جدی گرفت. رایگان.", free: true },
      { f: "workbook.pdf", t: "کتاب کار کاوشگر (۹ صفحه)", d: "میثاق‌نامه، کارآگاه توهم، شناسنامهٔ گفت‌وگو، برچسب شفافیت، ردیاب مسیر و ...", free: false },
      { f: "certificate.pdf", t: "گواهی تشویقی", d: "برای امضای والد یا معلم. مدرک رسمی نیست و فقط انگیزه‌بخش خانگی است.", free: false }
    ];
    var g = h("div", { class: "grid" });
    items.forEach(function (it) {
      var ok = it.free || !locked;
      g.appendChild(ok ? h("a", { class: "card link big-card", href: "assets/print/" + it.f, target: "_blank", rel: "noopener" }, h("span", { html: AIX.ic("book", 32) }), h("div", null, h("h3", null, it.t), h("p", null, it.d), h("span", { class: "chip ok" }, "باز کردن / چاپ PDF")))
        : h("a", { class: "card link big-card", href: "#/activate" }, h("span", { html: AIX.ic("book", 32) }), h("div", null, h("h3", null, it.t), h("p", null, it.d), h("span", { class: "chip" }, "با فعال‌سازی باز می‌شود"))));
    });
    root.appendChild(g);
    root.appendChild(h("p", { class: "muted" }, "نکتهٔ چاپ: اندازهٔ کاغذ A4 و گزینهٔ «اندازهٔ واقعی» را انتخاب کن."));
  };
})();
