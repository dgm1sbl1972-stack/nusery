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

  /* ---------- Cart drawer ---------- */
  var cartRoot = (window.Shopify && Shopify.routes && Shopify.routes.root) || '/';

  var SBLCart = {
    drawer: function () { return document.querySelector('[data-cart-drawer]'); },
    enabled: function () {
      var inner = document.querySelector('[data-cart-drawer-inner]');
      return !!inner && inner.getAttribute('data-enabled') === 'true';
    },
    updateCounts: function () {
      var inner = document.querySelector('[data-cart-drawer-inner]');
      if (!inner) return;
      var count = inner.getAttribute('data-item-count');
      document.querySelectorAll('[data-cart-count]').forEach(function (el) {
        el.textContent = count;
        el.hidden = count === '0';
      });
    },
    refresh: function () {
      return fetch(cartRoot + '?sections=smart-cart-drawer', { headers: { 'Accept': 'application/json' } })
        .then(function (r) { return r.json(); })
        .then(function (data) {
          var current = document.getElementById('shopify-section-smart-cart-drawer');
          if (!current || !data['smart-cart-drawer']) return;
          var tmp = document.createElement('div');
          tmp.innerHTML = data['smart-cart-drawer'];
          var next = tmp.querySelector('#shopify-section-smart-cart-drawer');
          if (next) current.replaceWith(next);
          SBLCart.updateCounts();
        });
    },
    open: function () {
      var drawer = SBLCart.drawer();
      if (!drawer || !SBLCart.enabled()) { window.location.assign(cartRoot + 'cart'); return Promise.resolve(); }
      return SBLCart.refresh().then(function () {
        SBLCart._lastFocus = document.activeElement;
        drawer.classList.add('is-open');
        drawer.setAttribute('aria-hidden', 'false');
        document.documentElement.classList.add('cart-drawer-open');
        var panel = drawer.querySelector('.cart-drawer__panel');
        if (panel) panel.focus();
      });
    },
    close: function () {
      var drawer = SBLCart.drawer();
      if (!drawer) return;
      drawer.classList.remove('is-open');
      drawer.setAttribute('aria-hidden', 'true');
      document.documentElement.classList.remove('cart-drawer-open');
      if (SBLCart._lastFocus && SBLCart._lastFocus.focus) SBLCart._lastFocus.focus();
    },
    change: function (line, quantity) {
      var drawer = SBLCart.drawer();
      if (drawer) drawer.classList.add('is-loading');
      return fetch(cartRoot + 'cart/change.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ line: line, quantity: quantity })
      })
        .then(SBLCart.refresh)
        .finally(function () { if (drawer) drawer.classList.remove('is-loading'); });
    }
  };
  window.SBLCart = SBLCart;

  /* Any add-to-cart form not handled by its own script: add via AJAX and open the drawer. */
  document.addEventListener('submit', function (e) {
    var form = e.target;
    if (e.defaultPrevented || !window.fetch || !form.action || !/\/cart\/add/.test(form.action)) return;
    if (!SBLCart.enabled()) return;
    e.preventDefault();
    var btn = e.submitter || form.querySelector('[type="submit"]');
    if (btn) btn.disabled = true;
    fetch(cartRoot + 'cart/add.js', {
      method: 'POST',
      headers: { 'Accept': 'application/json' },
      body: new FormData(form)
    })
      .then(function (r) {
        if (r.ok) return SBLCart.open();
        return r.json().then(function (err) { window.alert(err.description || err.message || 'Could not add to cart'); });
      })
      .catch(function () { form.submit(); })
      .finally(function () { if (btn) btn.disabled = false; });
  });

  document.addEventListener('click', function (e) {
    if (e.target.closest('[data-cart-drawer-close]')) {
      var link = e.target.closest('a[data-cart-drawer-close]');
      if (!link || link.pathname === window.location.pathname) e.preventDefault();
      SBLCart.close();
      return;
    }
    var quick = e.target.closest('[data-quick-add]');
    if (quick) {
      quick.disabled = true;
      quick.classList.add('is-loading');
      fetch(cartRoot + 'cart/add.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ items: [{ id: Number(quick.getAttribute('data-quick-add')), quantity: 1 }] })
      }).then(SBLCart.refresh).catch(function () { quick.disabled = false; quick.classList.remove('is-loading'); });
      return;
    }
    var scrollBtn = e.target.closest('[data-scd-scroll]');
    if (scrollBtn) {
      var track = scrollBtn.closest('[data-scd-recs]').querySelector('[data-scd-track]');
      track.scrollBy({ left: Number(scrollBtn.getAttribute('data-scd-scroll')) * track.clientWidth * 0.8, behavior: 'smooth' });
      return;
    }
    var lineBtn = e.target.closest('[data-cart-line]');
    if (lineBtn) {
      SBLCart.change(Number(lineBtn.getAttribute('data-cart-line')), Number(lineBtn.getAttribute('data-cart-qty')));
      return;
    }
    /* Header cart icon opens the drawer. */
    var cartLink = e.target.closest('a[href]');
    if (cartLink && SBLCart.enabled() && cartLink.closest('#shopify-section-header-group, .shopify-section-group-header-group, header')
        && /\/cart\/?$/.test(cartLink.pathname) && !e.metaKey && !e.ctrlKey) {
      e.preventDefault();
      SBLCart.open();
    }
  });

  /* Cart drawer: change a line's variant, or pick a variant for a recommended product. */
  document.addEventListener('change', function (e) {
    var lineSelect = e.target.closest('[data-cart-variant]');
    if (lineSelect) {
      var drawer = SBLCart.drawer();
      if (drawer) drawer.classList.add('is-loading');
      var props = {};
      try { props = JSON.parse(lineSelect.getAttribute('data-properties') || '{}') || {}; } catch (err) {}
      var qty = Number(lineSelect.getAttribute('data-qty')) || 1;
      fetch(cartRoot + 'cart/change.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ id: lineSelect.getAttribute('data-key'), quantity: 0 })
      })
        .then(function () {
          return fetch(cartRoot + 'cart/add.js', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify({ items: [{ id: Number(lineSelect.value), quantity: qty, properties: props }] })
          });
        })
        .then(function (r) { if (!r.ok) return r.json().then(function (err) { window.alert(err.description || 'That option is not available'); }); })
        .then(SBLCart.refresh)
        .finally(function () { if (drawer) drawer.classList.remove('is-loading'); });
      return;
    }
    var recSelect = e.target.closest('[data-rec-variant]');
    if (recSelect) {
      var card = recSelect.closest('.scd-rec');
      var opt = recSelect.options[recSelect.selectedIndex];
      var btn = card.querySelector('[data-quick-add]');
      var price = card.querySelector('[data-rec-price]');
      if (btn) btn.setAttribute('data-quick-add', recSelect.value);
      if (price && opt) price.textContent = opt.getAttribute('data-price');
    }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && document.documentElement.classList.contains('cart-drawer-open')) SBLCart.close();
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

  /* Collection filters: submit on change, toggle the panel on mobile. */
  document.addEventListener('change', function (e) {
    var form = e.target.form;
    if (!form || !form.hasAttribute('data-collection-filters') || !e.target.name) return;
    var params = new URLSearchParams(new FormData(form));
    Array.from(params.keys()).forEach(function (k) { if (params.get(k) === '') params.delete(k); });
    window.location.search = params.toString();
  });

  document.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-facets-toggle]');
    if (!btn) return;
    var open = btn.closest('.facets').classList.toggle('is-open');
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
  });

  /* Sign-in popup from the header person icon. */
  var AccountPopup = {
    el: function () { return document.querySelector('[data-account-popup]'); },
    open: function () {
      var pop = AccountPopup.el();
      if (!pop || pop.getAttribute('data-enabled') !== 'true') return false;
      AccountPopup._last = document.activeElement;
      pop.classList.add('is-open');
      pop.setAttribute('aria-hidden', 'false');
      document.documentElement.classList.add('account-popup-open');
      var dialog = pop.querySelector('.acct-pop__dialog');
      if (dialog) dialog.focus();
      return true;
    },
    close: function () {
      var pop = AccountPopup.el();
      if (!pop) return;
      pop.classList.remove('is-open');
      pop.setAttribute('aria-hidden', 'true');
      document.documentElement.classList.remove('account-popup-open');
      if (AccountPopup._last && AccountPopup._last.focus) AccountPopup._last.focus();
    }
  };
  document.addEventListener('click', function (e) {
    var opener = e.target.closest('[data-account-popup-open]');
    if (opener && !e.metaKey && !e.ctrlKey) {
      if (AccountPopup.open()) e.preventDefault();
      return;
    }
    if (e.target.closest('[data-account-popup-close]')) AccountPopup.close();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && document.documentElement.classList.contains('account-popup-open')) AccountPopup.close();
  });

  /* Account pages: show / hide password. */
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-pw-toggle]');
    if (!btn) return;
    var input = btn.parentElement.querySelector('input');
    var show = input.type === 'password';
    input.type = show ? 'text' : 'password';
    btn.textContent = show ? 'Hide' : 'Show';
    btn.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
  });

  /* Re-initialise sections when edited in the Shopify theme editor. */
  document.addEventListener('shopify:section:load', function (e) { init(e.target); });

  /* In the theme editor, reveal a product card when its block is selected. */
  document.addEventListener('shopify:block:select', function (e) {
    var root = e.target.closest('[data-filter-tabs]');
    if (root && root._showTab && e.target.hidden) root._showTab('all');
  });
})();
