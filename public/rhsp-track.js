(function () {
  'use strict';
  document.addEventListener('click', function (e) {
    if (typeof window.plausible !== 'function') return;
    var target = e.target;
    if (!target || !target.closest) return;
    var el = target.closest('[data-track]');
    if (!el) return;
    var eventName = el.getAttribute('data-track');
    if (!eventName) return;
    var props = {};
    var attrs = el.attributes;
    for (var i = 0; i < attrs.length; i++) {
      var attr = attrs[i];
      if (attr.name.indexOf('data-track-') === 0) {
        var key = attr.name.slice(11);
        if (key) props[key] = attr.value;
      }
    }
    if (el.tagName === 'A' && el.href && !props.target) {
      props.target = el.href;
    }
    window.plausible(eventName, { props: props });
  }, { passive: true });
})();
