// ابزارهای کمکی عمومی (بدون وابستگی به محتوا)
(function () {
  var AIX = window.AIX = window.AIX || {};
  var FA = "۰۱۲۳۴۵۶۷۸۹";
  var u = AIX.u = {};
  u.fa = function (n) { return String(n).replace(/\d/g, function (d) { return FA[d]; }); };
  u.esc = function (s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };
  u.shuffle = function (a) { var r = a.slice(); for (var i = r.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = r[i]; r[i] = r[j]; r[j] = t; } return r; };
  u.today = function () { var d = new Date(); return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2); };
  // ساخت عنصر: h("div", {class:"x", onclick:fn}, child1, "متن", ...)
  u.h = function (tag, props) {
    var el = document.createElement(tag);
    if (props) Object.keys(props).forEach(function (k) {
      var v = props[k];
      if (v == null || v === false) return;
      if (k === "class") el.className = v;
      else if (k === "html") el.innerHTML = v;
      else if (k.slice(0, 2) === "on") el.addEventListener(k.slice(2), v);
      else el.setAttribute(k, v === true ? "" : v);
    });
    for (var i = 2; i < arguments.length; i++) u.append(el, arguments[i]);
    return el;
  };
  u.append = function (el, c) {
    if (c == null || c === false) return;
    if (Array.isArray(c)) c.forEach(function (x) { u.append(el, x); });
    else el.appendChild(typeof c === "string" || typeof c === "number" ? document.createTextNode(String(c)) : c);
  };
  u.clear = function (el) { while (el.firstChild) el.removeChild(el.firstChild); return el; };
  u.$ = function (s, r) { return (r || document).querySelector(s); };
  u.$$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  u.toast = function (msg, kind) {
    var k = kind === "ok" ? "success" : kind === "no" ? "error" : "";
    if (window.AIhub && window.AIhub.toast) window.AIhub.toast(msg, k ? { kind: k } : {});
  };
  u.download = function (name, blobOrText, type) {
    var blob = blobOrText instanceof Blob ? blobOrText : new Blob([blobOrText], { type: type || "text/plain" });
    var a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = name;
    document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  };
  u.debounce = function (fn, ms) { var t; return function () { var a = arguments, s = this; clearTimeout(t); t = setTimeout(function () { fn.apply(s, a); }, ms); }; };
})();
