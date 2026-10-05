/* SBL Nursery gifting and services sections: carousels and reveal-on-scroll. */
(function () {
  if (window.SBLPages) { window.SBLPages.initAll(); return; }

  function initRails(root) {
    root.querySelectorAll('[data-rail]').forEach(function (rail) {
      var track = rail.querySelector('[data-rail-track]');
      var scope = rail.closest('.sblg-wrap') || root;
      var prev = scope.querySelector('[data-rail-prev]');
      var next = scope.querySelector('[data-rail-next]');
      if (!track) return;
      function step() {
        var item = track.querySelector('li');
        var gap = parseFloat(getComputedStyle(track).columnGap) || 0;
        return item ? item.getBoundingClientRect().width + gap : track.clientWidth;
      }
      function update() {
        var max = track.scrollWidth - track.clientWidth - 2;
        if (prev) prev.disabled = track.scrollLeft <= 2;
        if (next) next.disabled = track.scrollLeft >= max;
      }
      if (prev) prev.addEventListener('click', function () { track.scrollBy({ left: -step(), behavior: 'smooth' }); });
      if (next) next.addEventListener('click', function () { track.scrollBy({ left: step(), behavior: 'smooth' }); });
      track.addEventListener('scroll', update, { passive: true });
      window.addEventListener('resize', update);
      update();
    });
  }

  function initReveal(root) {
    var items = root.querySelectorAll('[data-reveal]');
    if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches || (window.Shopify && window.Shopify.designMode)) {
      items.forEach(function (el) { el.classList.add('is-in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    items.forEach(function (el, i) {
      el.style.transitionDelay = (i % 4) * 70 + 'ms';
      io.observe(el);
    });
  }

  function init(root) {
    if (root.hasAttribute('data-sbl-ready')) return;
    root.setAttribute('data-sbl-ready', '');
    initRails(root);
    initReveal(root);
  }

  function initAll() { document.querySelectorAll('[data-sbl-root]').forEach(init); }

  window.SBLPages = { init: init, initAll: initAll };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initAll);
  else initAll();
  document.addEventListener('shopify:section:load', function (e) {
    e.target.querySelectorAll('[data-sbl-root]').forEach(init);
  });
})();
