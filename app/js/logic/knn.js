// منطق خالص آزمایشگاه «آموزش مدل» (بدون وابستگی به صفحه): دادهٔ ساختگی و مدل نزدیک‌ترین همسایه
(function (root) {
  var AIX = root.AIX = root.AIX || {};
  // مولد عدد تصادفی قطعی تا هر بار همان داده ساخته شود
  function rng(seed) { var s = seed >>> 0; return function () { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
  var G = {
    cat: { label: "گربه", cls: "cat", sx: [1.5, 4.5], sy: [1, 4.2] },
    big: { label: "سگ بزرگ", cls: "dog", sx: [7, 9.5], sy: [5, 8] },
    small: { label: "سگ کوچک", cls: "dog", sx: [1.5, 4.5], sy: [5, 7] }
  };
  function make(group, n, seed) {
    var r = rng(seed), g = G[group], out = [];
    for (var i = 0; i < n; i++) out.push({ id: group + i, group: group, cls: g.cls, x: +(g.sx[0] + r() * (g.sx[1] - g.sx[0])).toFixed(1), y: +(g.sy[0] + r() * (g.sy[1] - g.sy[0])).toFixed(1) });
    return out;
  }
  var K = AIX.knn = { groups: G };
  K.pool = make("cat", 10, 11).concat(make("big", 10, 23), make("small", 10, 37));
  K.test = make("cat", 8, 101).concat(make("big", 6, 211), make("small", 6, 307)).map(function (p, i) { p.id = "t" + i; return p; });
  K.predict = function (train, k, p) {
    if (!train.length) return null;
    var d = train.map(function (t) { return { c: t.cls, d: Math.pow(t.x - p.x, 2) + Math.pow(t.y - p.y, 2) }; }).sort(function (a, b) { return a.d - b.d; }).slice(0, Math.min(k, train.length));
    var cat = 0, dog = 0; d.forEach(function (n) { if (n.c === "cat") cat++; else dog++; });
    return dog > cat ? "dog" : "cat"; // مساوی ← گربه
  };
  K.evaluate = function (train, k) {
    var res = { total: 0, right: 0, by: { cat: [0, 0], big: [0, 0], small: [0, 0] }, items: [] };
    K.test.forEach(function (p) {
      var pr = K.predict(train, k, p), ok = pr === p.cls; res.total++; if (ok) res.right++; res.by[p.group][1]++; if (ok) res.by[p.group][0]++; res.items.push({ p: p, pred: pr, ok: ok });
    });
    return res;
  };
  K.preset = function (name) {
    var cats = K.pool.filter(function (p) { return p.group === "cat"; }), big = K.pool.filter(function (p) { return p.group === "big"; }), small = K.pool.filter(function (p) { return p.group === "small"; });
    if (name === "balanced") return cats.slice(0, 6).concat(big.slice(0, 4), small.slice(0, 4));
    if (name === "onesided") return cats.slice(0, 6).concat(big.slice(0, 8));
    return [];
  };
  if (typeof module !== "undefined") module.exports = K;
})(typeof window !== "undefined" ? window : global);
