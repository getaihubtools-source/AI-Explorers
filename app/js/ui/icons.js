// آیکن‌های SVG سبک (خطی) برای رابط
(function () {
  var AIX = window.AIX = window.AIX || {};
  var P = {
    home: '<path d="M4 11l8-7 8 7v9H4z"/><path d="M10 20v-6h4v6"/>', map: '<path d="M9 4l-5 2v14l5-2 6 2 5-2V4l-5 2z"/><path d="M9 4v14M15 6v14"/>',
    book: '<path d="M4 5c3-1.5 6-1.5 8 0 2-1.5 5-1.5 8 0v14c-3-1.5-6-1.5-8 0-2-1.5-5-1.5-8 0z"/><path d="M12 5v14"/>', star: '<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>',
    flag: '<path d="M5 21V4M5 4h12l-2 4 2 4H5"/>', check: '<path d="M5 12l5 5 9-10"/>', search: '<circle cx="10" cy="10" r="6"/><path d="M15 15l6 6"/>', bulb: '<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10.5c.7.7 1 1.5 1 2.5h6c0-1 .3-1.8 1-2.5A6 6 0 0 0 12 3z"/>',
    pen: '<path d="M4 20l1-5L16 4l4 4L9 19z"/>', loop: '<path d="M20 12a8 8 0 1 1-3-6.2M20 4v4h-4"/>', rocket: '<path d="M5 19c0-3 1-4 3-5M14 5c3 0 5 2 5 5-2 4-4 6-8 7l-4-4c1-4 3-6 7-8zM8 16l-3 3"/>',
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c0-4 3-6 6.5-6s6.5 2 6.5 6M17 5a3.2 3.2 0 0 1 0 6M18 14c2.5.6 3.5 2.6 3.5 6"/>', gear: '<circle cx="12" cy="12" r="3"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1"/>',
    lock: '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>', atom: '<ellipse cx="12" cy="12" rx="9" ry="3.6"/><ellipse cx="12" cy="12" rx="9" ry="3.6" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="9" ry="3.6" transform="rotate(120 12 12)"/><circle cx="12" cy="12" r="1.2"/>',
    cube: '<path d="M12 3l8 4.5v9L12 21l-8-4.5v-9zM12 12l8-4.5M12 12v9M12 12L4 7.5"/>', warn: '<path d="M12 3l10 18H2zM12 10v5M12 18v.5"/>', chat: '<path d="M4 5h16v11H9l-5 4z"/>', flask: '<path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-9V3"/>',
    download: '<path d="M12 4v11M7 11l5 5 5-5M5 20h14"/>', copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M4 16V6a2 2 0 0 1 2-2h10"/>', arrow: '<path d="M15 5l-7 7 7 7"/>', flame: '<path d="M12 3c1 3.5 4.5 5 4.5 9.2a4.5 4.5 0 0 1-9 0c0-1.7.7-3 1.8-4 .2 1 .8 1.8 1.7 2C11 8.5 11.2 5.6 12 3z"/>', bolt: '<path d="M13 3 5 14h6l-1 7 8-11h-6z"/>', trophy: '<path d="M7 4h10v5a5 5 0 0 1-10 0zM7 6H4v1a3 3 0 0 0 3 3M17 6h3v1a3 3 0 0 1-3 3M12 14v4M8 20h8"/>',
    send: '<path d="M21 3L3 10.5l6 2.5 2.5 6z"/><path d="M9 13l12-10"/>', camera: '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><path d="M17.5 6.5v.01"/>', info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/>', shield: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M9 12l2 2 4-4"/>',
  };
  AIX.ic = function (name, size, color) {
    return '<svg width="' + (size || 20) + '" height="' + (size || 20) + '" viewBox="0 0 24 24" fill="none" stroke="' + (color || "currentColor") + '" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (P[name] || P.star) + "</svg>";
  };
})();
