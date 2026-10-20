/* ============================================================
   Token Ledger — main.js
   Theme · Demo tabs · Chart · Model catalog · Timeline · UI
   ============================================================ */
(function () {
  'use strict';

  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------- 1. THEME (light-first, respects OS) ---------- */
  (function theme() {
    var btn = $('#themeToggle');
    var root = document.documentElement;
    var media = window.matchMedia('(prefers-color-scheme: dark)');

    function labelFor(mode) {
      return mode === 'dark' ? 'Switch to light theme' : 'Switch to dark theme';
    }

    function apply(mode) {
      root.setAttribute('data-theme', mode);
      if (btn) {
        btn.setAttribute('aria-label', labelFor(mode));
        btn.setAttribute('title', labelFor(mode));
      }
    }

    var stored = null;
    try { stored = localStorage.getItem('tl-theme'); } catch (e) { /* private mode */ }
    apply(stored || (media.matches ? 'dark' : 'light'));

    if (btn) {
      btn.addEventListener('click', function () {
        var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        apply(next);
        try { localStorage.setItem('tl-theme', next); } catch (e) { /* noop */ }
      });
    }

    // Follow the OS only while the user has not chosen explicitly
    media.addEventListener('change', function (e) {
      var explicit = null;
      try { explicit = localStorage.getItem('tl-theme'); } catch (err) { /* noop */ }
      if (!explicit) apply(e.matches ? 'dark' : 'light');
    });
  })();

  /* ---------- 2. STICKY HEADER + BACK TO TOP ---------- */
  (function chrome() {
    var header = $('#siteHeader');
    var toTop  = $('#toTop');

    function onScroll() {
      var y = window.scrollY;
      if (header) header.classList.toggle('is-stuck', y > 8);
      if (toTop) toTop.hidden = y < 700;
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    if (toTop) {
      toTop.addEventListener('click', function () {
        var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
      });
    }
  })();

  /* ---------- 3. REVEAL ON SCROLL ---------- */
  (function reveal() {
    var targets = [
      '.feature', '.privacy-card', '.faq__item', '.timeline li',
      '.support__card', '.trustbar__item', '.ptable tbody tr', '.demo'
    ];
    var els = [];
    targets.forEach(function (sel) { els = els.concat($$(sel)); });

    if (!('IntersectionObserver' in window)) return; // visible by default via CSS fallback
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target;
        el.classList.add('is-in');
        io.unobserve(el);
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });

    els.forEach(function (el, i) {
      el.classList.add('rv');
      el.style.transitionDelay = ((i % 3) * 70) + 'ms';
      io.observe(el);
    });
  })();

  /* ---------- 4. DEMO DATA (sample figures, like the app) ---------- */
  var SERIES = {
    7:  [12.40, 8.15, 14.90, 6.20, 11.35, 9.80, 7.05],
    30: [3.20, 5.80, 4.10, 6.90, 2.40, 7.60, 5.10, 4.80, 6.20, 3.40,
         8.10, 5.60, 4.30, 7.20, 2.90, 6.40, 5.90, 3.80, 7.70, 4.50,
         6.10, 2.70, 8.30, 5.00, 4.10, 6.80, 3.60, 7.40, 5.20, 4.40]
  };

  // 90 days: the last 30 are the detailed series, older days are plausible
  // daily figures generated deterministically (same data on every load).
  (function () {
    var older = [], seed = 7;
    function rnd() { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; }
    for (var i = 60; i > 0; i--) {
      var base = 2.2 + rnd() * 6.4;              // $2.20 – $8.60
      older.push(Math.round(base * 100) / 100);
    }
    SERIES[90] = older.concat(SERIES[30]);
  })();

  var KEYS = [
    { name: 'Hermes',        tag: 'Today $2.14',  amount: '$184.62', meta: '7d $31.08 · month $184.62 · lifetime $2,914.50 · limit $250 resets 1st', share: 38 },
    { name: 'Agent-Zero',    tag: 'Today $1.02',  amount: '$96.15',  meta: '7d $18.44 · month $96.15 · lifetime $1,207.88 · no limit', share: 20 },
    { name: 'coding-cli',    tag: 'Today $3.77',  amount: '$61.40',  meta: '7d $44.20 · month $61.40 · lifetime $388.02 · limit $75 resets 1st', share: 13 },
    { name: 'openrouter.ai', tag: null,           amount: '$0.00',   meta: 'Key not used · created 12 Mar', share: 0 }
  ];

  var MODELS = [
    { id: 'anthropic/claude-opus-4',      cap: 'reasoning', in: '15.00',  out: '75.00', cached: '1.50' },
    { id: 'anthropic/claude-sonnet-4',     cap: 'reasoning', in: '3.00',   out: '15.00', cached: '0.30' },
    { id: 'openai/gpt-4o',                cap: 'developer', in: '2.50',   out: '10.00', cached: '1.25' },
    { id: 'openai/o3',                    cap: 'reasoning', in: '2.00',   out: '8.00',  cached: '0.50' },
    { id: 'google/gemini-2.5-pro',        cap: 'reasoning', in: '1.25',   out: '10.00', cached: '0.31' },
    { id: 'deepseek/deepseek-r1',         cap: 'reasoning', in: '0.55',   out: '2.19',  cached: '0.14' },
    { id: 'meta-llama/llama-4-maverick',  cap: 'vision',    in: '0.15',   out: '0.60',  cached: '0.00' },
    { id: 'mistralai/mistral-large',      cap: 'developer', in: '2.00',   out: '6.00',  cached: '0.50' },
    { id: 'qwen/qwen3-235b',              cap: 'developer', in: '0.13',   out: '0.60',  cached: '0.00' },
    { id: 'google/gemini-2.5-flash:free', cap: 'free',      in: '0.00',   out: '0.00',  cached: '0.00' },
    { id: 'meta-llama/llama-3.3-70b:free',cap: 'free',      in: '0.00',   out: '0.00',  cached: '0.00' },
    { id: 'openai/gpt-4o-mini',           cap: 'developer', in: '0.15',   out: '0.60',  cached: '0.075' }
  ];

  var PRICES = [
    { id: 'anthropic/claude-opus-4',     cap: 'Reasoning', in: '15.00',  out: '75.00', cached: '1.50' },
    { id: 'anthropic/claude-sonnet-4',    cap: 'Reasoning', in: '3.00',   out: '15.00', cached: '0.30' },
    { id: 'openai/gpt-4o',               cap: 'Vision',    in: '2.50',   out: '10.00', cached: '1.25' },
    { id: 'google/gemini-2.5-pro',       cap: 'Reasoning', in: '1.25',   out: '10.00', cached: '0.31' },
    { id: 'deepseek/deepseek-r1',        cap: 'Reasoning', in: '0.55',   out: '2.19',  cached: '0.14' },
    { id: 'qwen/qwen3-235b',             cap: 'Developer', in: '0.13',   out: '0.60',  cached: '0.00' },
    { id: 'meta-llama/llama-4-maverick', cap: 'Vision',    in: '0.15',   out: '0.60',  cached: '0.00' },
    { id: 'openai/gpt-4o-mini',          cap: 'Developer', in: '0.15',   out: '0.60',  cached: '0.075' }
  ];

  var CHANGELOG = [
    ['0.1.87', 'The foldable now really does get the wide layout: the two-column dashboard was gated on a content width the Duo inner display never reaches once the vertical bar and safe areas are subtracted, so it stayed single column. The gate tests width and height together, the columns are balanced, and the App Store pack gained inner-display screenshots.'],
    ['0.1.86', 'Ready for iPhone Duo: built with the iOS 27.1 SDK, so the app uses the whole display and the system moves the tab bar and toolbar down the side. Layout is driven by the size of the window instead of the device — two columns when there is room — the Duo inner display included — and one when there is not, content pushed clear of the folding hinge, all four orientations on iPhone. The Settings and Help sidebars respond to every row again, and the remaining Xcode warnings are gone.'],
    ['0.1.85', 'Submission build: an accidental install requirement had crept in — corrected so the app installs exactly where the listing says, on iPhone and iPad. No feature changes; screenshots refreshed.'],
    ['0.1.84', 'New Account log: OpenRouter attributes usage to an API key, so give each tool its own key (Hermes, Agent-Zero, a CLI…) and the log becomes a per-app view — today / 7-day / month / lifetime spend, limits and a daily history per key, with the models that key uses.'],
    ['0.1.83', 'Numbers now match the OpenRouter website: “this month” meant three different things. The balance line uses the account-wide calendar month, the chart period is labelled “7 days” / “30 days”, and Settings → Numbers lists every raw figure with its scope.'],
    ['0.1.82', 'Fix: the provider switcher now also sits on the OpenRouter usage screen — previously there was no way to switch from the first tab with both providers connected.'],
    ['0.1.81', 'Sample data any time: Settings → Data offers “Preview with sample data” (both providers filled with sample figures) and “Exit sample data” to return to your real account — no keys to delete.'],
    ['0.1.80', 'Easier to find: the Usage screen shows a “Connect TrustedRouter” card whenever only one provider is set up, and the provider switcher appears as soon as a second provider is connected.'],
    ['0.1.78', 'TrustedRouter as a second provider: remaining credit, today/week/month spend split between prepaid credit and BYOK, key limits, and a provider switcher on the Usage and Models screens. Optional management key unlocks per-day history.'],
    ['0.1.76', 'Renamed to Token Ledger — same app, new name (About screen, widget, notifications and exports); still built for your OpenRouter account.'],
    ['0.1.69', 'Settings sync across your devices via iCloud (appearance, refresh interval, alert toggles); after repeated failed refreshes the error suggests the OpenRouter status page.'],
    ['0.1.65', 'Key expiry shown in Settings (orange within 30 days); OpenRouter system-status link; error toast & last-error row are copyable; iPad Settings & Help now use a sidebar split view.'],
    ['0.1.63', 'Month presets (This month / Last month, scrollable chip row); model catalog cached for 12h (faster refreshes); lock-screen widget follows the chosen mode; tap the About version to copy it.'],
    ['0.1.62', 'Key-limit reset date; app-switcher blur without PIN; previous-period comparison for custom ranges; prompt/completion/reasoning split in day details; avg-per-day stat.']
  ];

  function money(n) { return '$' + n.toFixed(2); }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /* ---------- 5. DEMO TABS ---------- */
  (function demo() {
    var tabs = $$('.demo__tab');
    if (!tabs.length) return;

    function select(tab) {
      var name = tab.getAttribute('data-panel');
      tabs.forEach(function (t) {
        var on = t === tab;
        t.classList.toggle('is-active', on);
        t.setAttribute('aria-selected', on ? 'true' : 'false');
        t.tabIndex = on ? 0 : -1;
      });
      $$('.demo__panel').forEach(function (p) {
        var on = p.id === 'panel-' + name;
        p.hidden = !on;
        p.classList.toggle('is-active', on);
      });
    }

    tabs.forEach(function (tab, i) {
      tab.addEventListener('click', function () { select(tab); });
      // Roving arrow-key navigation per WAI-ARIA tabs pattern
      tab.addEventListener('keydown', function (e) {
        var dir = 0;
        if (e.key === 'ArrowRight') dir = 1;
        else if (e.key === 'ArrowLeft') dir = -1;
        else if (e.key === 'Home') dir = -i;
        else if (e.key === 'End') dir = tabs.length - 1 - i;
        else return;
        e.preventDefault();
        var next = tabs[(i + dir + tabs.length) % tabs.length];
        next.focus();
        select(next);
      });
    });
  })();

  /* ---------- 6. SPENDING CHART ---------- */
  (function chart() {
    var wrap = $('#demoChart');
    if (!wrap) return;
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function render(range) {
      var data = SERIES[range];
      var max = Math.max.apply(null, data);
      var sum = data.reduce(function (a, b) { return a + b; }, 0);

      wrap.innerHTML = data.map(function (v, i) {
        var h = Math.max((v / max) * 100, 2.5);
        // cap the stagger so long ranges (90d) still fill in promptly
        var delay = reduce ? 0 : Math.min(i * 18, 700);
        return '<span class="demo__bar" style="height:' + h.toFixed(1) + '%;' +
               'animation-delay:' + delay + 'ms"></span>';
      }).join('');

      wrap.setAttribute('aria-label',
        'Bar chart of daily spending over ' + data.length + ' days. ' +
        'Period total ' + money(sum) + ', average ' + money(sum / data.length) + ' per day.');

      var st = $('#statTotal'), sa = $('#statAvg'), sd = $('#statDelta');
      if (st) st.textContent = money(sum);
      if (sa) sa.textContent = money(sum / data.length);
      if (sd) {
        // Signed change in spend: up = bad (red), down = good (green)
        var delta = { 7: 12.4, 30: -4.1, 90: 27.8 }[range];
        sd.textContent = (delta > 0 ? '+' : '') + delta.toFixed(1) + '%';
        sd.classList.toggle('is-bad', delta > 0);
        sd.classList.toggle('is-good', delta < 0);
      }
    }

    $$('.demo__head .chip').forEach(function (chip) {
      chip.addEventListener('click', function () {
        $$('.demo__head .chip').forEach(function (c) { c.classList.remove('is-on'); });
        chip.classList.add('is-on');
        render(Number(chip.getAttribute('data-range')));
      });
    });

    render(30);
  })();

  /* ---------- 7. ACCOUNT LOG ---------- */
  (function keylog() {
    var list = $('#keyList');
    if (!list) return;
    list.innerHTML = KEYS.map(function (k) {
      return '<li>' +
        '<span class="keylist__name">' + esc(k.name) +
          (k.tag ? '<span class="keylist__tag' + (k.share === 0 ? ' is-warn' : '') + '">' + esc(k.tag) + '</span>' : '') +
        '</span>' +
        '<span class="keylist__amount">' + esc(k.amount) + '</span>' +
        '<span class="keylist__bar"><i style="width:' + k.share + '%"></i></span>' +
        '<span class="keylist__meta">' + esc(k.meta) + '</span>' +
      '</li>';
    }).join('');
  })();

  /* ---------- 8. MODEL CATALOG ---------- */
  (function catalog() {
    var list = $('#modelList');
    if (!list) return;
    var search = $('#modelSearch');
    var cap = 'all';
    var query = '';

    function moneyCell(v) {
      return v === '0.00'
        ? '<span class="free">Free</span>'
        : '$' + v;
    }

    function render() {
      var rows = MODELS.filter(function (m) {
        var okCap = cap === 'all' || m.cap === cap;
        var okQ = !query || m.id.toLowerCase().indexOf(query) !== -1;
        return okCap && okQ;
      });

      if (!rows.length) {
        list.innerHTML = '<li class="list-empty">No models match that search.</li>';
        return;
      }

      list.innerHTML = rows.map(function (m) {
        return '<li>' +
          '<span><span class="modellist__name">' + esc(m.id) + '</span>' +
          '<span class="modellist__cap">' + esc(m.cap) + '</span></span>' +
          '<span class="modellist__price">in ' + moneyCell(m.in) + ' · out ' + moneyCell(m.out) + '</span>' +
        '</li>';
      }).join('');
    }

    if (search) {
      search.addEventListener('input', function () {
        query = search.value.trim().toLowerCase();
        render();
      });
    }

    $$('.demo__models-head .chip').forEach(function (chip) {
      chip.addEventListener('click', function () {
        $$('.demo__models-head .chip').forEach(function (c) { c.classList.remove('is-on'); });
        chip.classList.add('is-on');
        cap = chip.getAttribute('data-cap');
        render();
      });
    });

    render();
  })();

  /* ---------- 9. PRICE TABLE ---------- */
  (function pricetable() {
    var body = $('#priceTable');
    if (!body) return;
    body.innerHTML = PRICES.map(function (m) {
      return '<tr>' +
        '<td class="ptable__model">' + esc(m.id) + '</td>' +
        '<td><span class="ptable__cap">' + esc(m.cap) + '</span></td>' +
        '<td class="num" data-label="Input">' + (m.in === '0.00' ? '<span class="free">Free</span>' : '$' + m.in) + '</td>' +
        '<td class="num" data-label="Output">' + (m.out === '0.00' ? '<span class="free">Free</span>' : '$' + m.out) + '</td>' +
        '<td class="num" data-label="Cached read">' + (m.cached === '0.00' ? '<span class="free">—</span>' : '$' + m.cached) + '</td>' +
      '</tr>';
    }).join('');
  })();

  /* ---------- 10. TIMELINE ---------- */
  (function timeline() {
    var list = $('#timeline');
    if (!list) return;
    list.innerHTML = CHANGELOG.map(function (row) {
      return '<li>' +
        '<span class="timeline__ver">v' + esc(row[0]) + '</span>' +
        '<p class="timeline__text">' + esc(row[1]) + '</p>' +
      '</li>';
    }).join('');
  })();

})();