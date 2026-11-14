// موتور آزمون چندگزینه‌ای و تمرین‌های تعاملی (دسته‌بندی و کشف خطا)
(function () {
  var AIX = window.AIX = window.AIX || {}, u = AIX.u, h = u.h;

  // ---------- آزمون ----------
  AIX.renderQuiz = function (root, id, onResult) {
    var P = AIX.progress, qs = P.quizFor(id); u.clear(root);
    if (!qs.length) { root.appendChild(h("p", { class: "muted" }, "برای این بخش آزمونی تعریف نشده است.")); return; }
    var best = AIX.store.day(id).quiz, answers = {}, locked = false;
    var qData = u.shuffle(qs).map(function (q) { return { q: q, opts: u.shuffle([q.ok].concat(q.bad)) }; });
    var head = h("div", { class: "quiz-head" }, h("span", { class: "chip" }, "حداقل " + u.fa(P.RULES.quizPass) + " پاسخ درست از " + u.fa(qs.length)), best.attempts ? h("span", { class: "chip ok" }, "بهترین نتیجه: " + u.fa(best.best) + " از " + u.fa(best.total || qs.length)) : null);
    var list = h("div", { class: "quiz" });
    var submit = h("button", { type: "button", class: "btn primary", disabled: true }, "بررسی پاسخ‌ها");
    var result = h("div", { class: "quiz-result", "aria-live": "polite" });
    qData.forEach(function (d, qi) {
      var box = h("fieldset", { class: "q" }, h("legend", null, u.fa(qi + 1) + ". " + d.q.q));
      var fb = h("div", { class: "fb" });
      d.opts.forEach(function (o, oi) {
        var b = h("button", { type: "button", class: "opt", "aria-pressed": "false" }, o);
        b.addEventListener("click", function () {
          if (locked) return; answers[qi] = o;
          u.$$(".opt", box).forEach(function (x) { x.classList.remove("sel"); x.setAttribute("aria-pressed", "false"); }); b.classList.add("sel"); b.setAttribute("aria-pressed", "true");
          submit.disabled = Object.keys(answers).length < qData.length;
        });
        box.appendChild(b);
      });
      box.appendChild(fb); list.appendChild(box); d.box = box; d.fb = fb;
    });
    submit.addEventListener("click", function () {
      if (locked) return; locked = true; var correct = 0;
      qData.forEach(function (d, qi) {
        var ok = answers[qi] === d.q.ok; if (ok) correct++;
        u.$$(".opt", d.box).forEach(function (b) { b.disabled = true; if (b.textContent === d.q.ok) b.classList.add("right"); else if (b.classList.contains("sel")) b.classList.add("wrong"); });
        d.fb.className = "fb show " + (ok ? "ok" : "no"); d.fb.textContent = (ok ? "درست! " : "پاسخ درست: «" + d.q.ok + "». ") + d.q.why;
      });
      submit.remove();
      var rec = P.recordQuiz(id, correct, qData.length), pass = correct >= P.RULES.quizPass;
      result.className = "quiz-result show " + (pass ? "ok" : "no");
      result.appendChild(h("strong", null, (pass ? "آفرین! " : "نزدیک بود. ") + u.fa(correct) + " پاسخ درست از " + u.fa(qData.length)));
      result.appendChild(h("p", null, pass ? "آزمون را گذراندی." : "برای گذراندن حداقل " + u.fa(P.RULES.quizPass) + " پاسخ درست لازم است. درس را دوباره مرور کن و دوباره امتحان کن."));
      result.appendChild(h("button", { type: "button", class: "btn", onclick: function () { AIX.renderQuiz(root, id, onResult); } }, "تلاش دوباره"));
      if (onResult) onResult(rec, pass);
    });
    root.appendChild(head); root.appendChild(list); root.appendChild(submit); root.appendChild(result);
  };

  // ---------- تمرین‌های تعاملی ----------
  AIX.renderActivity = function (root, id, onResult) {
    var a = AIX.progress.activityFor(id); u.clear(root); if (!a) return;
    root.appendChild(h("h3", null, a.title)); root.appendChild(h("p", { class: "lead" }, a.intro));
    var prev = AIX.store.day(id).act; if (prev.best) root.appendChild(h("p", { class: "chip " + (prev.done ? "ok" : "") }, "بهترین نتیجه: " + u.fa(Math.round(prev.best * 100)) + "٪" + (prev.done ? " (انجام شد)" : "")));
    var host = h("div", { class: "act" }); root.appendChild(host);
    var finish = function (correct, total) {
      var score = total ? correct / total : 0; AIX.progress.recordActivity(id, score);
      var pass = score >= AIX.progress.RULES.activityPass;
      host.appendChild(h("div", { class: "quiz-result show " + (pass ? "ok" : "no") }, h("strong", null, u.fa(correct) + " درست از " + u.fa(total) + (pass ? " — تمرین را با موفقیت انجام دادی." : " — برای موفقیت حداقل ۷۰٪ لازم است.")), h("button", { type: "button", class: "btn", onclick: function () { AIX.renderActivity(root, id, onResult); } }, "تلاش دوباره")));
      if (onResult) onResult(score, pass);
    };
    if (a.type === "classify") classify(host, a, finish); else spot(host, a, finish);
  };
  function classify(host, a, finish) {
    var tot = 0, cor = 0, r = 0;
    function round() {
      u.clear(host); var rd = a.rounds[r], answered = 0, rc = 0;
      host.appendChild(h("h4", null, rd.label + (a.rounds.length > 1 ? " (" + u.fa(r + 1) + " از " + u.fa(a.rounds.length) + ")" : "")));
      var next = h("button", { type: "button", class: "btn primary", style: "display:none" }, r < a.rounds.length - 1 ? "مرحلهٔ بعد" : "دیدن نتیجه");
      next.addEventListener("click", function () { tot += rd.items.length; cor += rc; if (r < a.rounds.length - 1) { r++; round(); } else { u.clear(host); host.appendChild(h("p", { class: "muted" }, "تمرین تمام شد.")); finish(cor, tot); } });
      u.shuffle(rd.items).forEach(function (it) {
        var fb = h("div", { class: "fb" }), row = h("div", { class: "cls-item" }, h("div", { class: "cls-text" }, it.t));
        var bar = h("div", { class: "cls-opts" });
        a.cats.forEach(function (c) {
          var b = h("button", { type: "button", class: "opt" }, c.label);
          b.addEventListener("click", function () {
            if (row.getAttribute("data-done")) return; row.setAttribute("data-done", "1"); answered++;
            var ok = c.id === it.c; if (ok) rc++;
            u.$$(".opt", bar).forEach(function (x) { x.disabled = true; if (x.textContent === (a.cats.filter(function (cc) { return cc.id === it.c; })[0].label)) x.classList.add("right"); });
            if (!ok) b.classList.add("wrong");
            fb.className = "fb show " + (ok ? "ok" : "no"); fb.textContent = (ok ? "درست! " : "این‌طور نیست. ") + it.why;
            if (answered === rd.items.length) next.style.display = "";
          });
          bar.appendChild(b);
        });
        row.appendChild(bar); row.appendChild(fb); host.appendChild(row);
      });
      host.appendChild(next);
    }
    round();
  }
  function spot(host, a, finish) {
    var sel = {}, list = h("div", { class: "spot" });
    a.items.forEach(function (it, i) {
      var b = h("button", { type: "button", class: "spot-item", "aria-pressed": "false" }, it.t), fb = h("div", { class: "fb" });
      b.addEventListener("click", function () { if (b.disabled) return; sel[i] = !sel[i]; b.classList.toggle("sel", !!sel[i]); b.setAttribute("aria-pressed", sel[i] ? "true" : "false"); });
      list.appendChild(h("div", { class: "spot-row" }, b, fb)); it._b = b; it._fb = fb;
    });
    var go = h("button", { type: "button", class: "btn primary" }, "بررسی پاسخ");
    go.addEventListener("click", function () {
      var cor = 0; go.remove();
      a.items.forEach(function (it, i) {
        var picked = !!sel[i], ok = picked === it.flag; if (ok) cor++; it._b.disabled = true;
        it._fb.className = "fb show " + (ok ? "ok" : "no");
        it._fb.textContent = (it.flag ? (picked ? "درست پیدا کردی! " : "این مورد را باید علامت می‌زدی. ") : (picked ? "این مورد مشکل نبود. " : "درست؛ مشکلی ندارد. ")) + it.why;
      });
      finish(cor, a.items.length);
    });
    host.appendChild(h("p", { class: "muted" }, "روی جمله‌هایی که مشکل دارند یا باید بررسی شوند بزن، بعد «بررسی پاسخ» را بزن."));
    host.appendChild(list); host.appendChild(go);
  }
})();
