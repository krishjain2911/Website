(function () {
  'use strict';

  // 1. Do Not Track check
  if (
    navigator.doNotTrack === '1' ||
    window.doNotTrack === '1' ||
    navigator.msDoNotTrack === '1'
  ) {
    return;
  }

  // 2. Ignore admin routes
  var path = window.location.pathname || '/';
  if (path.indexOf('/admin') === 0) {
    return;
  }

  // 3. Simple Bot detection
  if (navigator.webdriver) {
    return;
  }
  var ua = navigator.userAgent || '';
  if (/bot|crawler|spider|crawling|lighthouse|headless/i.test(ua)) {
    return;
  }

  // Determine viewport category
  function getViewport() {
    var w = window.innerWidth || 1024;
    if (w >= 1024) return 'desktop';
    if (w >= 640) return 'tablet';
    return 'mobile';
  }

  // Send payload via Beacon or Fetch with keepalive
  function send(payload) {
    try {
      var data = JSON.stringify(payload);
      var endpoint = '/api/track';
      if (navigator.sendBeacon) {
        var blob = new Blob([data], { type: 'application/json' });
        navigator.sendBeacon(endpoint, blob);
      } else {
        fetch(endpoint, {
          method: 'POST',
          body: data,
          headers: { 'Content-Type': 'application/json' },
          keepalive: true
        }).catch(function () {});
      }
    } catch (e) {}
  }

  // Public tracking function
  window.rhspTrack = function (name, props) {
    if (!name || typeof name !== 'string') return;
    var sanitizedName = name.trim().toLowerCase().slice(0, 40);
    send({
      name: sanitizedName,
      path: window.location.pathname || '/',
      referrer: document.referrer || '',
      viewport: getViewport(),
      props: props || {}
    });
  };

  // Send initial pageview
  window.rhspTrack('pageview');

  // Listen for click interactions with [data-track]
  document.addEventListener('click', function (e) {
    var target = e.target;
    if (!target || !target.closest) return;

    var trackEl = target.closest('[data-track]');
    if (!trackEl) return;

    var eventName = trackEl.getAttribute('data-track');
    if (!eventName) return;

    var props = {};
    var attrs = trackEl.attributes;
    for (var i = 0; i < attrs.length; i++) {
      var attr = attrs[i];
      if (attr.name.indexOf('data-track-') === 0) {
        var propKey = attr.name.slice(11); // remove 'data-track-'
        if (propKey) {
          props[propKey] = attr.value;
        }
      }
    }

    // Auto-attach href if available on anchor
    if (trackEl.tagName === 'A' && trackEl.href && !props.target) {
      props.href = trackEl.href;
    }

    window.rhspTrack(eventName, props);
  }, { passive: true });
})();
