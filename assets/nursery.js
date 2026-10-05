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

  /* Price filter slider: keep the thumbs apart, fill the track between them and update the label. */
  function syncPriceRange(wrap, moved) {
    var lo = wrap.querySelector('[data-price-min]');
    var hi = wrap.querySelector('[data-price-max]');
    if (!lo || !hi) return;
    var max = Number(hi.max) || 0;
    var a = Number(lo.value), b = Number(hi.value);
    if (a > b) {
      if (moved === lo) { lo.value = b; a = b; } else { hi.value = a; b = a; }
    }
    wrap.style.setProperty('--from', max ? a / max : 0);
    wrap.style.setProperty('--to', max ? b / max : 1);
    /* When both thumbs meet near the top end, the minimum thumb has to be the one you can grab. */
    lo.classList.toggle('is-top', a === b && a > max / 2);
    var prefix = wrap.getAttribute('data-prefix') || '';
    var locale = wrap.getAttribute('data-locale') || undefined;
    var from = wrap.querySelector('[data-price-from]');
    var to = wrap.querySelector('[data-price-to]');
    if (from) from.textContent = prefix + a.toLocaleString(locale);
    if (to) to.textContent = prefix + b.toLocaleString(locale);
  }
  document.addEventListener('input', function (e) {
    var wrap = e.target.closest && e.target.closest('[data-price-range]');
    if (wrap) syncPriceRange(wrap, e.target);
  });
  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('[data-price-range]').forEach(function (wrap) { syncPriceRange(wrap); });
  });

  /* Filter params without empty values, and without price thumbs left at the ends of the range. */
  function filterParams(form) {
    var params = new URLSearchParams(new FormData(form));
    Array.from(params.keys()).forEach(function (k) { if (params.get(k) === '') params.delete(k); });
    form.querySelectorAll('[data-price-range]').forEach(function (wrap) {
      var lo = wrap.querySelector('[data-price-min]');
      var hi = wrap.querySelector('[data-price-max]');
      if (lo && Number(lo.value) <= Number(lo.min)) params.delete(lo.name);
      if (hi && Number(hi.value) >= Number(hi.max)) params.delete(hi.name);
    });
    return params;
  }

  /* Forms with a price slider (e.g. the pots grid block) submit through the same clean-up. */
  document.addEventListener('submit', function (e) {
    var form = e.target;
    if (!form.querySelector || !form.querySelector('[data-price-range]')) return;
    e.preventDefault();
    window.location.href = (form.getAttribute('action') || window.location.pathname).split('?')[0] + '?' + filterParams(form).toString();
  });

  /* Collection filters: submit on change, toggle the panel on mobile. */
  var filterTimer;
  document.addEventListener('change', function (e) {
    var form = e.target.form;
    if (!form || !form.hasAttribute('data-collection-filters') || !e.target.name) return;
    /* Arrow keys on a slider fire change on every step, so wait for the shopper to settle. */
    clearTimeout(filterTimer);
    filterTimer = setTimeout(function () {
      window.location.search = filterParams(form).toString();
    }, e.target.type === 'range' ? 400 : 0);
  });

  var facetsMobile = window.matchMedia('(max-width: 900px)');
  function closeFacetPanels(scope) {
    (scope || document).querySelectorAll('.facets__panel details.facet[open]').forEach(function (d) { d.open = false; });
  }
  /* In the mobile drawer every group starts as a closed row; its options open as a slide-in panel. */
  if (facetsMobile.matches) closeFacetPanels();
  document.addEventListener('click', function (e) {
    var back = e.target.closest('[data-facet-back]');
    if (!back) return;
    var d = back.closest('details');
    if (d) d.open = false;
  });
  function setFacetsDrawer(facets, open) {
    if (!facets) return;
    if (!open) closeFacetPanels(facets);
    facets.classList.toggle('is-open', open);
    document.documentElement.classList.toggle('facets-locked', open);
    document.querySelectorAll('[data-facets-open]').forEach(function (b) { b.setAttribute('aria-expanded', open ? 'true' : 'false'); });
  }
  document.addEventListener('click', function (e) {
    var openBtn = e.target.closest('[data-facets-open]');
    if (openBtn) {
      var panel = document.getElementById(openBtn.getAttribute('aria-controls'));
      setFacetsDrawer(panel && panel.closest('.facets'), true);
      return;
    }
    var closeBtn = e.target.closest('[data-facets-close]');
    if (closeBtn) setFacetsDrawer(closeBtn.closest('.facets'), false);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') setFacetsDrawer(document.querySelector('.facets.is-open'), false);
  });

  document.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-facets-toggle]');
    if (!btn) return;
    var open = btn.closest('.facets').classList.toggle('is-open');
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
  });

  /* ---------- Wishlist (saved in this browser) ---------- */
  var Wishlist = {
    key: 'sbl-wishlist',
    get: function () {
      try { var v = JSON.parse(localStorage.getItem(Wishlist.key) || '[]'); return Array.isArray(v) ? v : []; } catch (e) { return []; }
    },
    set: function (list) {
      try { localStorage.setItem(Wishlist.key, JSON.stringify(list)); } catch (e) {}
      Wishlist.sync();
    },
    has: function (handle) { return Wishlist.get().indexOf(handle) !== -1; },
    toggle: function (handle) {
      var list = Wishlist.get();
      var i = list.indexOf(handle);
      if (i === -1) list.unshift(handle); else list.splice(i, 1);
      Wishlist.set(list);
      return i === -1;
    },
    sync: function (scope) {
      var list = Wishlist.get();
      (scope || document).querySelectorAll('[data-wishlist-toggle]').forEach(function (btn) {
        var on = list.indexOf(btn.getAttribute('data-handle')) !== -1;
        btn.classList.toggle('is-active', on);
        btn.setAttribute('aria-pressed', on ? 'true' : 'false');
        btn.title = on ? 'Remove from wishlist' : 'Add to wishlist';
      });
      document.querySelectorAll('[data-wishlist-count]').forEach(function (el) {
        el.textContent = list.length;
        el.hidden = list.length === 0;
      });
    },
    toast: function (msg) {
      var el = document.querySelector('.wl-toast');
      if (!el) {
        el = document.createElement('div');
        el.className = 'wl-toast';
        el.setAttribute('role', 'status');
        document.body.appendChild(el);
      }
      el.innerHTML = msg;
      el.classList.add('is-visible');
      clearTimeout(Wishlist._t);
      Wishlist._t = setTimeout(function () { el.classList.remove('is-visible'); }, 2200);
    },
    money: function (cents, currency) {
      try { return new Intl.NumberFormat('en-IN', { style: 'currency', currency: currency || 'INR', maximumFractionDigits: cents % 100 ? 2 : 0 }).format(cents / 100); }
      catch (e) { return '₹' + (cents / 100); }
    },
    renderPage: function () {
      var grid = document.querySelector('[data-wishlist-page]');
      if (!grid) return;
      var empty = document.querySelector('[data-wishlist-empty]');
      var summary = document.querySelector('[data-wishlist-summary]');
      var list = Wishlist.get();
      var currency = grid.getAttribute('data-currency');
      var addLabel = grid.getAttribute('data-add-label') || 'Add to cart';
      var esc = function (s) { var d = document.createElement('div'); d.textContent = s == null ? '' : String(s); return d.innerHTML; };
      if (!list.length) { grid.innerHTML = ''; grid.hidden = true; if (empty) empty.hidden = false; if (summary) summary.textContent = ''; return; }
      grid.hidden = false; if (empty) empty.hidden = true;
      Promise.all(list.map(function (handle) {
        return fetch(cartRoot + 'products/' + encodeURIComponent(handle) + '.js').then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; });
      })).then(function (products) {
        var found = products.filter(Boolean);
        var gone = list.filter(function (h, i) { return !products[i]; });
        if (gone.length) Wishlist.set(list.filter(function (h) { return gone.indexOf(h) === -1; }));
        if (!found.length) { grid.hidden = true; if (empty) empty.hidden = false; if (summary) summary.textContent = ''; return; }
        if (summary) summary.textContent = found.length + (found.length === 1 ? ' plant saved' : ' plants saved');
        grid.innerHTML = found.map(function (p) {
          var v = p.variants.filter(function (x) { return x.available; })[0] || p.variants[0];
          var single = p.variants.length === 1;
          var img = p.featured_image ? p.featured_image.replace(/^\/\//, 'https://') : '';
          if (img) img += (img.indexOf('?') === -1 ? '?' : '&') + 'width=600';
          var price = Wishlist.money(v.price, currency);
          var compare = v.compare_at_price > v.price ? '<s>' + Wishlist.money(v.compare_at_price, currency) + '</s>' : '';
          var action = !p.available
            ? '<span class="btn btn--sm btn--disabled">Sold out</span>'
            : single
              ? '<form action="' + cartRoot + 'cart/add" method="post"><input type="hidden" name="id" value="' + v.id + '"><input type="hidden" name="quantity" value="1"><button type="submit" class="btn btn--sm btn--green">' + esc(addLabel) + '</button></form>'
              : '<a class="btn btn--sm btn--green" href="' + p.url + '">Choose options</a>';
          return '<article class="wl-card">' +
            '<button type="button" class="wl-card__remove" data-wishlist-remove="' + esc(p.handle) + '" aria-label="Remove ' + esc(p.title) + ' from wishlist">×</button>' +
            '<a class="wl-card__media" href="' + p.url + '">' + (img ? '<img src="' + img + '" alt="' + esc(p.title) + '" loading="lazy" width="600" height="600">' : '') + '</a>' +
            '<div class="wl-card__body"><p class="product-card__type">' + esc(p.type) + '</p>' +
            '<h3 class="wl-card__title"><a href="' + p.url + '">' + esc(p.title) + '</a></h3>' +
            '<div class="wl-card__foot"><div class="price"><strong>' + price + '</strong>' + compare + '</div>' + action + '</div></div></article>';
        }).join('');
      });
    }
  };
  /* Wishlist drawer: opened from the header heart, so no page setup is needed. */
  Wishlist.openDrawer = function () {
    var d = document.querySelector('.wl-drawer');
    if (!d) {
      d = document.createElement('div');
      d.className = 'wl-drawer';
      d.setAttribute('aria-hidden', 'true');
      d.innerHTML = '<div class="wl-drawer__overlay" data-wl-close></div>' +
        '<div class="wl-drawer__panel" role="dialog" aria-modal="true" aria-label="Wishlist" tabindex="-1">' +
        '<div class="wl-drawer__head"><h2>My Wishlist <span data-wl-drawer-count></span></h2>' +
        '<button type="button" class="wl-drawer__close" aria-label="Close" data-wl-close>' +
        '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></button></div>' +
        '<div class="wl-drawer__body" data-wl-drawer-body></div></div>';
      document.body.appendChild(d);
    }
    Wishlist._last = document.activeElement;
    d.classList.add('is-open');
    d.setAttribute('aria-hidden', 'false');
    document.documentElement.classList.add('wl-drawer-open');
    d.querySelector('.wl-drawer__panel').focus();
    Wishlist.renderDrawer();
  };
  Wishlist.closeDrawer = function () {
    var d = document.querySelector('.wl-drawer');
    if (!d) return;
    d.classList.remove('is-open');
    d.setAttribute('aria-hidden', 'true');
    document.documentElement.classList.remove('wl-drawer-open');
    if (Wishlist._last && Wishlist._last.focus) Wishlist._last.focus();
  };
  Wishlist.renderDrawer = function () {
    var body = document.querySelector('[data-wl-drawer-body]');
    if (!body) return;
    var count = document.querySelector('[data-wl-drawer-count]');
    var list = Wishlist.get();
    var esc = function (s) { var d = document.createElement('div'); d.textContent = s == null ? '' : String(s); return d.innerHTML; };
    var shopUrl = cartRoot + 'collections/all';
    if (!list.length) {
      if (count) count.textContent = '';
      body.innerHTML = '<div class="wl-drawer__empty"><svg viewBox="0 0 24 24" width="52" height="52" aria-hidden="true"><path d="M20.8 8.7c0 5.2-8.8 11-8.8 11s-8.8-5.8-8.8-11A4.6 4.6 0 0 1 12 6.4a4.6 4.6 0 0 1 8.8 2.3Z" fill="none" stroke="currentColor" stroke-width="1.4"/></svg>' +
        '<p><strong>Your wishlist is empty</strong></p><p>Tap the ♡ on any plant to save it here.</p>' +
        '<a class="wl-drawer__btn" href="' + shopUrl + '">Explore plants</a></div>';
      return;
    }
    body.innerHTML = '<p class="wl-drawer__loading">Loading…</p>';
    Promise.all(list.map(function (handle) {
      return fetch(cartRoot + 'products/' + encodeURIComponent(handle) + '.js').then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; });
    })).then(function (products) {
      var found = products.filter(Boolean);
      var gone = list.filter(function (h, i) { return !products[i]; });
      if (gone.length) { Wishlist.set(list.filter(function (h) { return gone.indexOf(h) === -1; })); }
      if (!found.length) { Wishlist.renderDrawer(); return; }
      if (count) count.textContent = '(' + found.length + ')';
      body.innerHTML = '<ul class="wl-drawer__list" role="list">' + found.map(function (p) {
        var v = p.variants.filter(function (x) { return x.available; })[0] || p.variants[0];
        var img = p.featured_image ? p.featured_image.replace(/^\/\//, 'https://') : '';
        if (img) img += (img.indexOf('?') === -1 ? '?' : '&') + 'width=200';
        var compare = v.compare_at_price > v.price ? ' <s>' + Wishlist.money(v.compare_at_price) + '</s>' : '';
        var action = !p.available
          ? '<span class="wl-row__sold">Sold out</span>'
          : p.variants.length === 1
            ? '<button type="button" class="wl-row__add" data-wl-add="' + v.id + '">Add to cart</button>'
            : '<a class="wl-row__add" href="' + p.url + '">Choose options</a>';
        return '<li class="wl-row"><a class="wl-row__media" href="' + p.url + '">' + (img ? '<img src="' + img + '" alt="" loading="lazy" width="80" height="80">' : '') + '</a>' +
          '<div class="wl-row__info"><a class="wl-row__title" href="' + p.url + '">' + esc(p.title) + '</a>' +
          '<p class="wl-row__price"><strong>' + Wishlist.money(v.price) + '</strong>' + compare + '</p>' + action + '</div>' +
          '<button type="button" class="wl-row__remove" data-wishlist-remove="' + esc(p.handle) + '" aria-label="Remove ' + esc(p.title) + '">' +
          '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg></button></li>';
      }).join('') + '</ul>';
    });
  };
  document.addEventListener('click', function (e) {
    var link = e.target.closest('[data-wishlist-link], .wl-toast a');
    if (link && !e.metaKey && !e.ctrlKey) { e.preventDefault(); Wishlist.openDrawer(); return; }
    if (e.target.closest('[data-wl-close]')) { Wishlist.closeDrawer(); return; }
    var add = e.target.closest('[data-wl-add]');
    if (add) {
      add.disabled = true; add.textContent = 'Adding…';
      fetch(cartRoot + 'cart/add.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ items: [{ id: Number(add.getAttribute('data-wl-add')), quantity: 1 }] })
      }).then(function (r) {
        if (!r.ok) throw r;
        Wishlist.closeDrawer();
        if (window.SBLCart) window.SBLCart.open();
      }).catch(function () { add.disabled = false; add.textContent = 'Try again'; });
    }
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && document.documentElement.classList.contains('wl-drawer-open')) Wishlist.closeDrawer();
  });

  window.SBLWishlist = Wishlist;

  document.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-wishlist-toggle]');
    if (btn) {
      e.preventDefault();
      e.stopPropagation();
      var added = Wishlist.toggle(btn.getAttribute('data-handle'));
      btn.classList.remove('is-pop'); void btn.offsetWidth; btn.classList.add('is-pop');
      var link = document.querySelector('[data-wishlist-link]');
      var href = link ? link.getAttribute('href') : '/pages/wishlist';
      Wishlist.toast(added ? '♥ Saved to your wishlist · <a href="' + href + '">View</a>' : 'Removed from wishlist');
      return;
    }
    var rm = e.target.closest('[data-wishlist-remove]');
    if (rm) {
      var handle = rm.getAttribute('data-wishlist-remove');
      Wishlist.set(Wishlist.get().filter(function (h) { return h !== handle; }));
      var card = rm.closest('.wl-card');
      if (card) card.remove();
      Wishlist.renderPage();
      Wishlist.renderDrawer();
    }
  }, true);

  document.addEventListener('DOMContentLoaded', function () { Wishlist.sync(); Wishlist.renderPage(); });
  document.addEventListener('shopify:section:load', function (e) { Wishlist.sync(e.target); });
  window.addEventListener('storage', function (e) { if (e.key === Wishlist.key) { Wishlist.sync(); Wishlist.renderPage(); } });

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
  /* ---------- Bottom-sheet dropdowns on phones and tablets ----------
     Android and iOS show their own system picker for <select>. For sort and
     filter dropdowns we lay a transparent button over the select and open a
     store-styled sheet instead; the select stays the source of truth. */
  var SHEET_SELECTS = 'select[name="sort_by"], select[data-sheet-select]';
  var sheetQuery = window.matchMedia('(max-width: 1024px), (pointer: coarse)');
  var sheet, sheetList, sheetTitle, sheetSelect, sheetOpener;

  function enhanceSelect(select) {
    if (select._sheet || select.multiple) return;
    select._sheet = true;
    var wrap = document.createElement('span');
    wrap.className = 'sheet-select';
    select.parentNode.insertBefore(wrap, select);
    wrap.appendChild(select);
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'sheet-select__btn';
    btn.setAttribute('aria-haspopup', 'dialog');
    btn.addEventListener('click', function () { openSheet(select, btn); });
    wrap.appendChild(btn);
    syncSheetButton(select);
  }
  function syncSheetButton(select) {
    var btn = select.parentNode.querySelector('.sheet-select__btn');
    var opt = select.options[select.selectedIndex];
    if (btn) btn.setAttribute('aria-label', sheetLabel(select) + ': ' + (opt ? opt.text.trim() : ''));
  }
  function sheetLabel(select) {
    if (select.getAttribute('data-sheet-title')) return select.getAttribute('data-sheet-title');
    if (select.name === 'sort_by') return 'Sort by';
    var label = select.closest('label');
    return label ? label.textContent.replace(select.textContent, '').trim() : 'Choose';
  }
  function buildSheet() {
    sheet = document.createElement('div');
    sheet.className = 'option-sheet';
    sheet.hidden = true;
    sheet.innerHTML =
      '<div class="option-sheet__overlay" data-sheet-close></div>' +
      '<div class="option-sheet__panel" role="dialog" aria-modal="true" aria-labelledby="OptionSheetTitle">' +
        '<span class="option-sheet__grip" aria-hidden="true"></span>' +
        '<div class="option-sheet__head"><h2 class="option-sheet__title" id="OptionSheetTitle"></h2>' +
        '<button type="button" class="option-sheet__close" aria-label="Close" data-sheet-close>' +
        '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></button></div>' +
        '<ul class="option-sheet__list" role="listbox"></ul>' +
      '</div>';
    document.body.appendChild(sheet);
    sheetList = sheet.querySelector('.option-sheet__list');
    sheetTitle = sheet.querySelector('.option-sheet__title');
    sheet.addEventListener('click', function (e) {
      if (e.target.closest('[data-sheet-close]')) { closeSheet(); return; }
      var item = e.target.closest('[data-index]');
      if (!item || item.getAttribute('aria-disabled') === 'true') return;
      var select = sheetSelect;
      var index = Number(item.getAttribute('data-index'));
      closeSheet();
      if (select.selectedIndex !== index) {
        select.selectedIndex = index;
        syncSheetButton(select);
        select.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });
    sheet.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { closeSheet(); return; }
      if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
      var items = Array.from(sheetList.querySelectorAll('[data-index]:not([aria-disabled="true"])'));
      var i = items.indexOf(document.activeElement);
      e.preventDefault();
      var next = items[e.key === 'ArrowDown' ? Math.min(i + 1, items.length - 1) : Math.max(i - 1, 0)];
      if (next) next.focus();
    });
  }
  function openSheet(select, opener) {
    if (!sheet) buildSheet();
    sheetSelect = select;
    sheetOpener = opener;
    sheetTitle.textContent = sheetLabel(select);
    sheetList.innerHTML = '';
    Array.from(select.options).forEach(function (opt, i) {
      var li = document.createElement('li');
      li.className = 'option-sheet__option';
      li.setAttribute('role', 'option');
      li.setAttribute('tabindex', '0');
      li.setAttribute('data-index', i);
      li.setAttribute('aria-selected', i === select.selectedIndex ? 'true' : 'false');
      if (opt.disabled) li.setAttribute('aria-disabled', 'true');
      li.textContent = opt.text.trim();
      sheetList.appendChild(li);
    });
    sheet.hidden = false;
    document.documentElement.classList.add('option-sheet-open');
    requestAnimationFrame(function () { sheet.classList.add('is-open'); });
    var current = sheetList.querySelector('[aria-selected="true"]') || sheetList.firstChild;
    if (current) { current.scrollIntoView({ block: 'nearest' }); current.focus({ preventScroll: true }); }
  }
  function closeSheet() {
    if (!sheet || sheet.hidden) return;
    sheet.classList.remove('is-open');
    document.documentElement.classList.remove('option-sheet-open');
    setTimeout(function () { sheet.hidden = true; }, 250);
    if (sheetOpener) sheetOpener.focus({ preventScroll: true });
  }
  document.addEventListener('keydown', function (e) {
    if ((e.key === 'Enter' || e.key === ' ') && e.target.classList && e.target.classList.contains('option-sheet__option')) {
      e.preventDefault();
      e.target.click();
    }
  });
  /* Tapping a select's <label> would focus the select and open the system picker (iOS); open the sheet instead. */
  document.addEventListener('click', function (e) {
    if (!sheetQuery.matches || e.target.closest('.sheet-select__btn, select')) return;
    var label = e.target.closest('label');
    var select = label && (label.control || label.querySelector('select'));
    if (!select || !select._sheet) return;
    e.preventDefault();
    openSheet(select, select.parentNode.querySelector('.sheet-select__btn'));
  });
  function enhanceSelects(scope) {
    (scope || document).querySelectorAll(SHEET_SELECTS).forEach(enhanceSelect);
  }
  document.addEventListener('DOMContentLoaded', function () { enhanceSelects(); });
  document.addEventListener('shopify:section:load', function (e) { enhanceSelects(e.target); });
  /* Leaving the phone/tablet layout closes an open sheet; the CSS hides the overlay buttons there. */
  if (sheetQuery.addEventListener) sheetQuery.addEventListener('change', function () { if (!sheetQuery.matches) closeSheet(); });
})();
