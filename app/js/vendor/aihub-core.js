/* ===== aihub-core.js ===== */
/* ==========================================================================
   AIhub Design System — aihub-core.js (v1.1)
   ابزارهای پایه + پوسته (سایدبار/drawer) + منو + تب + split + toast + تم/برند
   بدون وابستگی. سازگار با WebViewهای قدیمی (بدون ?. و ??).
   [در AI Explorers فقط همین هسته از باندل استفاده شده؛ datepicker/cmdk/table/charts لازم نبود]
   ========================================================================== */
(function (w, d) {
  'use strict';
  var A = w.AIhub = w.AIhub || {};
  var root = d.documentElement;

  function $(s, r) { return (r || d).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || d).querySelectorAll(s)); }
  function store(k, v) {
    try {
      if (v === undefined) return w.localStorage.getItem(k);
      if (v === null) w.localStorage.removeItem(k); else w.localStorage.setItem(k, v);
    } catch (e) {}
    return null;
  }
  A.$ = $; A.$$ = $$; A.store = store;
  A.ready = function (fn) { if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', fn); else fn(); };

  /* ---------- زبان فارسی: ارقام و نرمال‌سازی برای جستجو ---------- */
  var FA = '۰۱۲۳۴۵۶۷۸۹';
  A.fa = function (n) { return String(n).replace(/\d/g, function (c) { return FA.charAt(c); }); };
  A.num = function (n, o) { try { return Number(n).toLocaleString('fa-IR', o); } catch (e) { return A.fa(n); } };
  A.norm = function (s) {
    return String(s == null ? '' : s)
      .replace(/[يى]/g, 'ی').replace(/ك/g, 'ک')
      .replace(/[‌‍‎‏]/g, '')
      .replace(/[ً-ٰٟ]/g, '')
      .replace(/[۰-۹]/g, function (c) { return c.charCodeAt(0) - 0x06F0; })
      .replace(/[٠-٩]/g, function (c) { return c.charCodeAt(0) - 0x0660; })
      .toLowerCase().replace(/\s+/g, ' ').replace(/^\s+|\s+$/g, '');
  };
  var uid = 0;
  A.uid = function (p) { uid += 1; return (p || 'aihub') + '-' + uid; };

  /* ---------- تم و برند ---------- */
  A.theme = {
    get: function () {
      return root.getAttribute('data-theme') || (w.matchMedia && w.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    },
    set: function (t) {
      root.setAttribute('data-theme', t); store('aihub-theme', t);
      $$('[data-theme-toggle]').forEach(function (b) { b.setAttribute('aria-pressed', t === 'dark' ? 'true' : 'false'); });
    },
    toggle: function () { this.set(this.get() === 'dark' ? 'light' : 'dark'); }
  };
  A.brand = {
    get: function () { return root.getAttribute('data-brand') || 'firouzeh'; },
    set: function (n) {
      if (!n || n === 'firouzeh') { root.removeAttribute('data-brand'); store('aihub-brand', null); }
      else { root.setAttribute('data-brand', n); store('aihub-brand', n); }
      d.dispatchEvent(new CustomEvent('aihub:brand', { detail: { brand: A.brand.get() } }));
    }
  };
  (function boot() {
    var t = store('aihub-theme'), b = store('aihub-brand');
    if (t === 'dark' || t === 'light') root.setAttribute('data-theme', t);
    if (b) root.setAttribute('data-brand', b);
  })();

  /* ---------- Toast (با امکان «بازگردانی») ---------- */
  A.toast = function (msg, o) {
    o = o || {};
    var host = $('#toasts');
    if (!host) { host = d.createElement('div'); host.id = 'toasts'; host.className = 'toasts'; d.body.appendChild(host); }
    var t = d.createElement('div');
    t.className = 'toast' + (o.kind ? ' toast--' + o.kind : '');
    t.setAttribute('role', o.kind === 'error' ? 'alert' : 'status');
    var s = d.createElement('span'); s.className = 'toast__msg'; s.textContent = msg; t.appendChild(s);
    var timer;
    function remove() { clearTimeout(timer); if (t.parentNode) t.parentNode.removeChild(t); }
    if (o.action) {
      var b = d.createElement('button'); b.type = 'button'; b.className = 'toast__action'; b.textContent = o.action.label;
      b.onclick = function () { try { if (o.action.onClick) o.action.onClick(); } finally { remove(); } };
      t.appendChild(b);
    }
    host.appendChild(t);
    timer = setTimeout(remove, o.duration || (o.action ? 6500 : 3200));
    return { close: remove };
  };

  /* ---------- Sheet / Dialog (پایین‌کشو در موبایل، مودال در دسکتاپ) ---------- */
  A.sheet = function (html, o) {
    o = o || {};
    var prev = d.activeElement, ov = d.createElement('div'), sh = d.createElement('div');
    ov.className = 'overlay'; sh.className = 'sheet';
    sh.setAttribute('role', 'dialog'); sh.setAttribute('aria-modal', 'true'); sh.setAttribute('aria-label', o.label || 'پنجره');
    sh.innerHTML = '<div class="sheet__grab"></div>' + html;
    ov.appendChild(sh); d.body.appendChild(ov);
    function close() {
      if (!ov.parentNode) return;
      ov.parentNode.removeChild(ov);
      if (prev && prev.focus) prev.focus();
      if (o.onClose) o.onClose();
    }
    ov.addEventListener('mousedown', function (e) { if (e.target === ov) close(); });
    sh.addEventListener('click', function (e) { if (e.target.closest('[data-sheet-close]')) close(); });
    ov.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { e.stopPropagation(); close(); return; }
      if (e.key !== 'Tab') return;
      var f = $$('a[href],button:not([disabled]),input:not([disabled]),select,textarea,[tabindex]:not([tabindex="-1"])', sh).filter(function (x) { return x.offsetParent !== null; });
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && d.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && d.activeElement === last) { e.preventDefault(); first.focus(); }
    });
    setTimeout(function () { var f = sh.querySelector('[autofocus],input,select,textarea,button'); if (f) f.focus(); }, 30);
    return { el: sh, close: close };
  };

  /* ---------- Shell: سایدبار / ریل / drawer ---------- */
  var drawerOpener = null;
  function app() { return $('.app'); }
  function syncSidebarToggle() {
    var a = app(); if (!a) return;
    var rail = a.getAttribute('data-sidebar') === 'rail';
    $$('[data-sidebar-toggle]').forEach(function (b) {
      b.setAttribute('aria-pressed', rail ? 'true' : 'false');
      b.setAttribute('aria-label', rail ? 'باز کردن منو' : 'جمع کردن منو');
    });
  }
  function openDrawer(opener) {
    var a = app(); if (!a) return;
    drawerOpener = opener || null;
    a.classList.add('is-drawer-open');
    $$('[data-drawer-open]').forEach(function (b) { b.setAttribute('aria-expanded', 'true'); });
    setTimeout(function () { var f = $('.sidebar .nav__item', a); if (f) f.focus(); }, 60);
  }
  function closeDrawer(restore) {
    var a = app(); if (!a || !a.classList.contains('is-drawer-open')) return;
    a.classList.remove('is-drawer-open');
    $$('[data-drawer-open]').forEach(function (b) { b.setAttribute('aria-expanded', 'false'); });
    if (restore !== false && drawerOpener && drawerOpener.focus) drawerOpener.focus();
    drawerOpener = null;
  }
  A.shell = { openDrawer: openDrawer, closeDrawer: closeDrawer,
    setSidebar: function (mode) { var a = app(); if (!a) return; a.setAttribute('data-sidebar', mode); store('aihub-sidebar', mode); syncSidebarToggle(); },
    toggleSidebar: function () { var a = app(); if (!a) return; this.setSidebar(a.getAttribute('data-sidebar') === 'rail' ? 'expanded' : 'rail'); } };

  /* ---------- Menu (dropdown) ---------- */
  function menuFor(trigger) {
    var sel = trigger.getAttribute('data-menu');
    var m = sel && sel.charAt(0) === '#' ? d.getElementById(sel.slice(1)) : null;
    if (!m) { var n = trigger.nextElementSibling; if (n && n.classList.contains('menu')) m = n; }
    if (m && !m.id) m.id = A.uid('menu');
    return m;
  }
  function triggerFor(menu) { return $('[aria-controls="' + menu.id + '"]'); }
  function closeMenus(except, restoreFocus) {
    $$('.menu.is-open').forEach(function (m) {
      if (m === except) return;
      m.classList.remove('is-open');
      var t = triggerFor(m);
      if (t) { t.setAttribute('aria-expanded', 'false'); if (restoreFocus) t.focus(); }
    });
  }
  function placeMenu(m) {
    m.classList.remove('menu--flip-x', 'menu--up');
    var r = m.getBoundingClientRect(), vw = d.documentElement.clientWidth, vh = w.innerHeight;
    if (r.left < 8 || r.right > vw - 8) m.classList.add('menu--flip-x');
    if (r.bottom > vh - 8) {
      var t = triggerFor(m), tr = t ? t.getBoundingClientRect() : null;
      if (tr && tr.top - r.height - 6 > 8) m.classList.add('menu--up');
    }
  }
  function items(m) { return $$('[role="menuitem"],[role="menuitemradio"],[role="menuitemcheckbox"]', m).filter(function (i) { return !i.disabled && i.getAttribute('aria-disabled') !== 'true'; }); }
  function openMenu(trigger, focusFirst) {
    var m = menuFor(trigger); if (!m) return;
    closeMenus(m);
    trigger.setAttribute('aria-controls', m.id); trigger.setAttribute('aria-haspopup', 'menu'); trigger.setAttribute('aria-expanded', 'true');
    m.setAttribute('role', 'menu'); m.classList.add('is-open');
    placeMenu(m);
    if (focusFirst) { var it = items(m)[0]; if (it) it.focus(); }
  }
  A.menu = { open: openMenu, close: closeMenus };

  /* ---------- Tabs / Segmented ---------- */
  function selectTab(tab, focus) {
    var list = tab.closest('[role="tablist"]'); if (!list) return;
    $$('[role="tab"]', list).forEach(function (t) {
      var on = t === tab;
      t.setAttribute('aria-selected', on ? 'true' : 'false'); t.setAttribute('tabindex', on ? '0' : '-1');
      var pid = t.getAttribute('aria-controls'); var p = pid ? d.getElementById(pid) : null;
      if (p) p.hidden = !on;
    });
    if (focus) tab.focus();
    list.dispatchEvent(new CustomEvent('aihub:tab', { bubbles: true, detail: { tab: tab, value: tab.getAttribute('data-value') || tab.id } }));
  }
  function initTabs() {
    $$('[role="tablist"]').forEach(function (l) {
      var sel = $('[role="tab"][aria-selected="true"]', l) || $('[role="tab"]', l);
      if (sel) selectTab(sel, false);
    });
  }

  /* ---------- Delegated events ---------- */
  d.addEventListener('click', function (e) {
    var t = e.target;
    var el = t.closest ? t.closest('[data-theme-toggle]') : null;
    if (el) { A.theme.toggle(); return; }

    el = t.closest('[data-brand-set]');
    if (el) { A.brand.set(el.getAttribute('data-brand-set')); return; }

    el = t.closest('[data-sidebar-toggle]');
    if (el) { A.shell.toggleSidebar(); return; }

    el = t.closest('[data-drawer-open]');
    if (el) { openDrawer(el); return; }
    if (t.closest('[data-drawer-close]') || (t.classList && t.classList.contains('scrim'))) { closeDrawer(); return; }
    var a = app();
    if (a && a.classList.contains('is-drawer-open') && t.closest('.sidebar .nav__item')) closeDrawer(false);

    el = t.closest('[data-menu]');
    if (el) {
      var m = menuFor(el);
      if (m && m.classList.contains('is-open')) closeMenus(null, false); else openMenu(el, false);
      return;
    }
    var mi = t.closest('.menu__item');
    if (mi && !mi.hasAttribute('data-keep-open')) { var mm = mi.closest('.menu'); if (mm) closeMenus(null, true); }
    else if (!t.closest('.menu')) closeMenus(null, false);

    el = t.closest('[role="tab"]');
    if (el) selectTab(el, false);

    el = t.closest('[data-split-item]');
    if (el) {
      var sp = el.closest('.split');
      if (sp) {
        $$('[data-split-item]', sp).forEach(function (x) { x.removeAttribute('aria-current'); });
        el.setAttribute('aria-current', 'true');
        sp.classList.add('is-detail');
        sp.dispatchEvent(new CustomEvent('aihub:split-select', { bubbles: true, detail: { item: el } }));
        var det = $('.split__detail', sp);
        if (det && w.matchMedia && w.matchMedia('(max-width: 899.98px)').matches) { det.setAttribute('tabindex', '-1'); det.focus(); }
      }
      return;
    }
    el = t.closest('[data-split-back]');
    if (el) {
      var sp2 = el.closest('.split');
      if (sp2) { sp2.classList.remove('is-detail'); var cur = $('[data-split-item][aria-current]', sp2); if (cur) cur.focus(); }
    }
  });

  d.addEventListener('keydown', function (e) {
    var t = e.target;
    // منو
    var openM = $('.menu.is-open');
    if (openM) {
      var its = items(openM), i = its.indexOf(d.activeElement);
      if (e.key === 'Escape') { e.preventDefault(); closeMenus(null, true); return; }
      if (e.key === 'ArrowDown') { e.preventDefault(); (its[(i + 1) % its.length] || its[0]).focus(); return; }
      if (e.key === 'ArrowUp') { e.preventDefault(); (its[(i - 1 + its.length) % its.length] || its[0]).focus(); return; }
      if (e.key === 'Home') { e.preventDefault(); if (its[0]) its[0].focus(); return; }
      if (e.key === 'End') { e.preventDefault(); if (its.length) its[its.length - 1].focus(); return; }
      if (e.key === 'Tab') { closeMenus(null, false); }
    }
    if (t.closest && t.closest('[data-menu]') && (e.key === 'ArrowDown')) { e.preventDefault(); openMenu(t.closest('[data-menu]'), true); return; }
    // drawer
    if (e.key === 'Escape') { var a = app(); if (a && a.classList.contains('is-drawer-open')) { closeDrawer(); return; } }
    // tablist
    var tab = t.closest ? t.closest('[role="tab"]') : null;
    if (tab) {
      var list = tab.closest('[role="tablist"]'), tabs = $$('[role="tab"]', list), idx = tabs.indexOf(tab);
      var vertical = list.getAttribute('aria-orientation') === 'vertical';
      var rtl = w.getComputedStyle(list).direction === 'rtl';
      var next = vertical ? 'ArrowDown' : (rtl ? 'ArrowLeft' : 'ArrowRight'), prev = vertical ? 'ArrowUp' : (rtl ? 'ArrowRight' : 'ArrowLeft');
      var to = null;
      if (e.key === next) to = tabs[(idx + 1) % tabs.length];
      else if (e.key === prev) to = tabs[(idx - 1 + tabs.length) % tabs.length];
      else if (e.key === 'Home') to = tabs[0];
      else if (e.key === 'End') to = tabs[tabs.length - 1];
      if (to) { e.preventDefault(); selectTab(to, true); }
    }
  });

  w.addEventListener('resize', function () {
    if (w.innerWidth >= 640) closeDrawer(false);
    $$('.menu.is-open').forEach(placeMenu);
  });

  A.ready(function () {
    var a = app();
    if (a) {
      var saved = store('aihub-sidebar');
      if (saved === 'rail' || saved === 'expanded') a.setAttribute('data-sidebar', saved);
      else if (!a.hasAttribute('data-sidebar')) a.setAttribute('data-sidebar', 'expanded');
      syncSidebarToggle();
    }
    $$('[data-theme-toggle]').forEach(function (b) { b.setAttribute('aria-pressed', A.theme.get() === 'dark' ? 'true' : 'false'); });
    initTabs();
  });
})(window, document);
