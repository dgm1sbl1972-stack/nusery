(function () {
  'use strict';

  var pad = function (n) { return (n < 10 ? '0' : '') + n; };

  /* Hero slider: fade between slides with arrows, dots, counter and autoplay. */
  function initHero(root) {
    var slides = root.querySelectorAll('.hero__slide');
    if (slides.length < 2) return;
    var dots = root.querySelectorAll('[data-slider-dots] .dot');
    var counter = root.querySelector('[data-slider-current]');
    var delay = parseInt(root.getAttribute('data-autoplay'), 10) * 1000;
    var current = 0;
    var timer;

    function go(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (s, i) { s.classList.toggle('is-active', i === current); });
      dots.forEach(function (d, i) { d.classList.toggle('is-active', i === current); });
      if (counter) counter.textContent = pad(current + 1);
    }
    function restart() {
      clearInterval(timer);
      if (delay > 0) timer = setInterval(function () { go(current + 1); }, delay);
    }

    root.querySelector('[data-slider-prev]').addEventListener('click', function () { go(current - 1); restart(); });
    root.querySelector('[data-slider-next]').addEventListener('click', function () { go(current + 1); restart(); });
    dots.forEach(function (d, i) { d.addEventListener('click', function () { go(i); restart(); }); });
    root.addEventListener('mouseenter', function () { clearInterval(timer); });
    root.addEventListener('mouseleave', restart);
    restart();
  }

  /* Horizontal scrollers (featured cards, reels, testimonials). */
  function initScroller(track) {
    var scope = track.closest('section') || document;
    var step = function () {
      var first = track.firstElementChild;
      return first ? first.getBoundingClientRect().width + 14 : track.clientWidth;
    };
    var prev = scope.querySelector('[data-scroll-prev]');
    var next = scope.querySelector('[data-scroll-next]');
    if (prev) prev.addEventListener('click', function () { track.scrollBy({ left: -step(), behavior: 'smooth' }); });
    if (next) next.addEventListener('click', function () { track.scrollBy({ left: step(), behavior: 'smooth' }); });

    if (track.hasAttribute('data-scroller-dots')) {
      var holder = scope.querySelector('[data-scroller-dots-target]');
      if (!holder) return;
      var build = function () {
        var pages = Math.max(1, Math.ceil(track.scrollWidth / track.clientWidth - 0.05));
        holder.innerHTML = '';
        if (pages < 2) return;
        for (var i = 0; i < pages; i++) {
          var b = document.createElement('button');
          b.type = 'button';
          b.className = 'dot' + (i === 0 ? ' is-active' : '');
          b.setAttribute('aria-label', 'Go to page ' + (i + 1));
          (function (page) {
            b.addEventListener('click', function () { track.scrollTo({ left: page * track.clientWidth, behavior: 'smooth' }); });
          })(i);
          holder.appendChild(b);
        }
      };
      track.addEventListener('scroll', function () {
        var page = Math.round(track.scrollLeft / track.clientWidth);
        holder.querySelectorAll('.dot').forEach(function (d, i) { d.classList.toggle('is-active', i === page); });
      }, { passive: true });
      window.addEventListener('resize', build);
      build();
    }
  }

  /* Filter tabs: show only the cards whose data-tab matches the chosen tab. */
  function initFilterTabs(root) {
    var tabs = root.querySelectorAll('[data-filter]');
    var items = root.querySelectorAll('[data-tab]');
    root._showTab = function (filter) {
      tabs.forEach(function (t) {
        var on = t.getAttribute('data-filter') === filter;
        t.classList.toggle('is-active', on);
        t.setAttribute('aria-selected', on ? 'true' : 'false');
      });
      items.forEach(function (item) {
        item.hidden = filter !== 'all' && item.getAttribute('data-tab') !== filter;
      });
    };
    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () { root._showTab(tab.getAttribute('data-filter')); });
    });
  }

  /* Plant finder quiz: tally answers by collection handle, recommend the winner. */
  function initFinder(root) {
    var steps = root.querySelectorAll('[data-finder-step]');
    var result = root.querySelector('[data-finder-result]');
    var progress = root.querySelector('[data-finder-progress]');
    var nameEl = root.querySelector('[data-finder-result-name]');
    var link = root.querySelector('[data-finder-link]');
    var votes, index;

    function show(i) {
      index = i;
      steps.forEach(function (s, j) { s.hidden = j !== i; });
      result.hidden = i < steps.length;
      if (progress) progress.style.width = Math.min(100, ((i + 1) / steps.length) * 100) + '%';
    }
    function finish() {
      var best = null;
      Object.keys(votes).forEach(function (k) { if (!best || votes[k].count > votes[best].count) best = k; });
      if (best) {
        nameEl.textContent = votes[best].title;
        link.href = votes[best].url || '/collections/' + best;
      } else {
        nameEl.textContent = '';
        link.href = link.getAttribute('data-fallback');
      }
      show(steps.length);
    }
    function reset() { votes = {}; show(0); }

    root.querySelectorAll('[data-finder-option]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var key = btn.getAttribute('data-value');
        if (key) {
          votes[key] = votes[key] || { count: 0, title: btn.getAttribute('data-title'), url: btn.getAttribute('data-url') };
          votes[key].count++;
        }
        if (index + 1 < steps.length) show(index + 1); else finish();
      });
    });
    var restart = root.querySelector('[data-finder-restart]');
    if (restart) restart.addEventListener('click', reset);
    reset();
  }

  /* Reels: click to play/pause uploaded videos. */
  function initReels(root) {
    root.querySelectorAll('[data-reel]').forEach(function (reel) {
      var video = reel.querySelector('video');
      var btn = reel.querySelector('[data-reel-play]');
      if (!video || !btn) return;
      var toggle = function () {
        if (video.paused) {
          root.querySelectorAll('[data-reel] video').forEach(function (v) {
            if (v !== video) { v.pause(); v.closest('[data-reel]').classList.remove('is-playing'); }
          });
          video.play();
          reel.classList.add('is-playing');
        } else {
          video.pause();
          reel.classList.remove('is-playing');
        }
      };
      btn.addEventListener('click', toggle);
      video.addEventListener('click', toggle);
    });
  }

  function init(scope) {
    scope.querySelectorAll('.hero[data-slider]').forEach(initHero);
    scope.querySelectorAll('[data-scroller]').forEach(initScroller);
    scope.querySelectorAll('[data-filter-tabs]').forEach(initFilterTabs);
    scope.querySelectorAll('[data-plant-finder]').forEach(initFinder);
    scope.querySelectorAll('.reels').forEach(initReels);
  }

  /* Add to cart via AJAX so shoppers stay on the page. */
  document.addEventListener('submit', function (e) {
    var form = e.target.closest('[data-add-to-cart]');
    if (!form || !window.fetch) return;
    e.preventDefault();
    var btn = form.querySelector('button[type="submit"]');
    var label = btn.textContent;
    btn.disabled = true;
    fetch((window.Shopify && Shopify.routes ? Shopify.routes.root : '/') + 'cart/add.js', {
      method: 'POST',
      headers: { 'Accept': 'application/json' },
      body: new FormData(form)
    })
      .then(function (r) { if (!r.ok) throw r; return fetch((window.Shopify && Shopify.routes ? Shopify.routes.root : '/') + 'cart.js'); })
      .then(function (r) { return r.json(); })
      .then(function (cart) {
        document.querySelectorAll('[data-cart-count]').forEach(function (el) { el.textContent = cart.item_count; });
        btn.textContent = 'Added ✓';
        btn.classList.add('is-added');
      })
      .catch(function () { btn.textContent = 'Try again'; })
      .finally(function () {
        setTimeout(function () { btn.textContent = label; btn.classList.remove('is-added'); btn.disabled = false; }, 1800);
      });
  });

  document.addEventListener('DOMContentLoaded', function () {
    init(document);

    var toggle = document.querySelector('[data-menu-toggle]');
    var nav = document.querySelector('[data-nav]');
    if (toggle && nav) {
      toggle.addEventListener('click', function () {
        var open = nav.classList.toggle('is-open');
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
    }

    var top = document.querySelector('[data-back-to-top]');
    if (top) {
      window.addEventListener('scroll', function () { top.classList.toggle('is-visible', window.scrollY > 600); }, { passive: true });
      top.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });
    }
  });

  /* Re-initialise sections when edited in the Shopify theme editor. */
  document.addEventListener('shopify:section:load', function (e) { init(e.target); });

  /* In the theme editor, reveal a product card when its block is selected. */
  document.addEventListener('shopify:block:select', function (e) {
    var root = e.target.closest('[data-filter-tabs]');
    if (root && root._showTab && e.target.hidden) root._showTab('all');
  });
})();
