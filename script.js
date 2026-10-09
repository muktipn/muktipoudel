(function () {
  "use strict";
  var app = document.getElementById("app");
  var state = { cat: "सबै", q: "" };
  var posts = [], cats = [];

  function toNe(n) { return String(n).replace(/[0-9]/g, function (d) { return "०१२३४५६७८९"[d]; }); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]; }); }
  function readTime(html) {
    var w = html.replace(/<[^>]*>/g, " ").trim().split(/\s+/).length;
    return toNe(Math.max(1, Math.round(w / 150))) + " मिनेट पढाइ";
  }
  function setTitle(t) { document.title = t ? t + " — " + SITE.brand : SITE.brand + " — साहित्यिक ब्लग"; }
  function show(html, keepScroll) {
    app.innerHTML = html;
    if (!keepScroll) window.scrollTo(0, 0);
  }
  function photoTag(cls) {
    var fallback = "data:image/svg+xml," + encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 480"><circle cx="200" cy="150" r="82" fill="#3b4a63"/>' +
      '<path d="M30 480c0-110 80-180 170-180s170 70 170 180z" fill="#55658a"/></svg>');
    return '<img class="' + cls + '" src="' + esc(SITE.photo) + '" alt="' + esc(SITE.name) + '" onerror="this.onerror=null;this.src=\'' + fallback + '\'">';
  }

  /* ---------- लेखको कार्ड सूची ---------- */
  function listHtml() {
    var q = state.q.trim().toLowerCase();
    var items = posts.filter(function (p) {
      var okC = state.cat === "सबै" || p.category === state.cat;
      var okQ = !q || (p.title + " " + p.excerpt + " " + p.body.replace(/<[^>]*>/g, " ")).toLowerCase().indexOf(q) > -1;
      return okC && okQ;
    });
    if (!items.length) return '<p class="empty">कुनै लेख भेटिएन। अर्को शब्द वा विधा रोजेर हेर्नुहोस्।</p>';
    return items.map(function (p) {
      return '<li><a class="card" href="#/post/' + p.slug + '">' +
        '<span class="tagp t-' + cats.indexOf(p.category) % 3 + '">' + esc(p.category) + '</span>' +
        '<span class="card-title">' + esc(p.title) + '</span>' +
        '<span class="card-ex">' + esc(p.excerpt) + '</span>' +
        '<span class="card-meta"><time datetime="' + p.date + '">' + p.dateText + '</time><span>' + readTime(p.body) + '</span></span></a></li>';
    }).join("");
  }
  function refreshList() {
    var l = document.getElementById("list");
    if (l) l.innerHTML = listHtml();
    document.querySelectorAll("[data-cat]").forEach(function (b) {
      b.setAttribute("aria-pressed", b.dataset.cat === state.cat);
    });
  }
  function writingsSection() {
    return '<section class="writings" id="writings" aria-labelledby="wh"><div class="w-head"><div><h2 id="wh">हालका लेखहरू</h2>' +
      '<p class="sub">विधा छान्नुहोस् वा शब्दले खोज्नुहोस्।</p></div>' +
      '<label class="search"><span class="sr">लेख खोज्नुहोस्</span><input id="q" type="search" placeholder="🔍 लेख खोज्नुहोस्" value="' + esc(state.q) + '"></label></div>' +
      '<div class="chips" role="group" aria-label="विधा छान्नुहोस्">' +
      ["सबै"].concat(cats).map(function (c) {
        return '<button type="button" class="chip" data-cat="' + c + '" aria-pressed="' + (c === state.cat) + '">' + c + '</button>';
      }).join("") + '</div><ul class="grid" id="list">' + listHtml() + '</ul></section>';
  }
  function bindWritings() {
    app.querySelectorAll(".chip").forEach(function (b) {
      b.addEventListener("click", function () { state.cat = b.dataset.cat; refreshList(); });
    });
    var q = document.getElementById("q");
    if (q) q.addEventListener("input", function (e) { state.q = e.target.value; refreshList(); });
  }
  function scrollToWritings() {
    var el = document.getElementById("writings");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  /* ---------- पृष्ठहरू ---------- */
  function home(scroll) {
    setTitle("");
    var counts = {};
    posts.forEach(function (p) { counts[p.category] = (counts[p.category] || 0) + 1; });
    var pillItems = [{ k: "सबै", n: posts.length }].concat(cats.map(function (c) { return { k: c, n: counts[c] }; }));
    show(
      '<div class="hero-wrap"><section class="hero">' +
        '<div class="hero-text"><span class="bubble">' + esc(SITE.hello) + '</span>' +
        '<h1>' + esc(SITE.name) + '</h1><p class="role">' + SITE.role + '</p>' +
        '<a class="btn" href="#/writings">' + esc(SITE.button) + '</a></div>' +
        '<div class="hero-art">' + photoTag("hero-photo") + '</div></section>' +
        '<div class="pill" role="group" aria-label="विधा अनुसार लेख">' +
        pillItems.map(function (it) {
          return '<a href="#/cat/' + encodeURIComponent(it.k) + '"><strong>' + toNe(it.n) + '</strong><span>' + (it.k === "सबै" ? "सबै लेख" : it.k) + '</span></a>';
        }).join("") + '</div></div>' + writingsSection(), true);
    window.scrollTo(0, 0);
    bindWritings();
    if (scroll) setTimeout(scrollToWritings, 30);
  }

  function writingsOnly() {
    setTitle("लेखहरू");
    show('<div class="page-pad">' + writingsSection() + '</div>');
    bindWritings();
  }

  function post(slug) {
    var i = posts.findIndex(function (p) { return p.slug === slug; });
    if (i < 0) return notFound();
    var p = posts[i], newer = posts[i - 1], older = posts[i + 1];
    var likeKey = "like:" + p.slug, liked = false;
    try { liked = localStorage.getItem(likeKey) === "1"; } catch (e) {}
    setTitle(p.title);
    show(
      '<article class="post"><a class="back" href="#/writings">← सबै लेख</a>' +
      '<header><span class="tagp t-' + cats.indexOf(p.category) % 3 + '">' + esc(p.category) + '</span>' +
      '<h1>' + esc(p.title) + '</h1>' +
      '<p class="post-meta"><time datetime="' + p.date + '">' + p.dateText + '</time> · ' + readTime(p.body) + '</p></header>' +
      '<div class="prose">' + p.body + '</div>' +
      '<button id="like" class="like" type="button" aria-pressed="' + liked + '">' + (liked ? "♥ मन पर्यो" : "♡ मन पर्यो") + '</button></article>' +
      '<nav class="pager" aria-label="अर्को लेख">' +
      (older ? '<a href="#/post/' + older.slug + '"><small>← अघिल्लो</small>' + esc(older.title) + '</a>' : '<span></span>') +
      (newer ? '<a class="r" href="#/post/' + newer.slug + '"><small>पछिल्लो →</small>' + esc(newer.title) + '</a>' : '<span></span>') +
      '</nav>'
    );
    document.getElementById("like").addEventListener("click", function (e) {
      liked = !liked;
      try { localStorage.setItem(likeKey, liked ? "1" : "0"); } catch (err) {}
      e.target.setAttribute("aria-pressed", liked);
      e.target.textContent = liked ? "♥ मन पर्यो" : "♡ मन पर्यो";
    });
  }

  function about() {
    setTitle("परिचय");
    show(
      '<section class="about"><div class="hero-art small"><div class="blue-block"></div>' + photoTag("hero-photo") + '</div>' +
      '<div><span class="bubble">' + esc(SITE.hello) + '</span><h1>' + esc(SITE.name) + '</h1>' +
      SITE.about.map(function (t) { return '<p>' + esc(t) + '</p>'; }).join("") +
      '<p><a href="mailto:' + esc(SITE.email) + '">' + esc(SITE.email) + '</a></p>' +
      (SITE.social.length ? '<p class="social">' + SITE.social.map(function (s) { return '<a href="' + esc(s.url) + '" target="_blank" rel="noopener">' + esc(s.label) + '</a>'; }).join("") + '</p>' : '') +
      '<a class="btn" href="#/writings">' + esc(SITE.button) + '</a></div></section>'
    );
  }

  function notFound() {
    setTitle("भेटिएन");
    show('<section class="page-pad"><h1 class="nf">पाना भेटिएन</h1><p><a class="btn" href="#/">मुख्य पृष्ठमा फर्कनुहोस्</a></p></section>');
  }

  /* ---------- राउटर ---------- */
  function route() {
    var h = location.hash.replace(/^#\/?/, ""), r = "home";
    document.getElementById("nav").classList.remove("open");
    document.getElementById("burger").setAttribute("aria-expanded", "false");
    if (!h) home(false);
    else if (h === "about") { r = "about"; about(); }
    else if (h === "writings") { r = "writings"; writingsOnly(); }
    else if (h.indexOf("cat/") === 0) { state.cat = decodeURIComponent(h.slice(4)); state.q = ""; home(true); }
    else if (h.indexOf("post/") === 0) { r = "writings"; post(decodeURIComponent(h.slice(5))); }
    else notFound();
    document.querySelectorAll("#nav a[data-r]").forEach(function (a) {
      if (a.dataset.r === r) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
    });
  }

  /* ---------- सुरुवात ---------- */
  function start(data) {
    posts = data.slice().sort(function (a, b) { return b.date.localeCompare(a.date); });
    cats = posts.map(function (p) { return p.category; }).filter(function (c, i, a) { return a.indexOf(c) === i; });
  document.getElementById("brand").textContent = SITE.brand;
  document.getElementById("foot-name").textContent = SITE.name;
  document.getElementById("year").textContent = toNe(new Date().getFullYear());
  document.getElementById("dropmenu").innerHTML = cats.map(function (c) {
    return '<a href="#/cat/' + encodeURIComponent(c) + '">' + c + '</a>';
  }).join("");
  document.getElementById("burger").addEventListener("click", function (e) {
    var open = document.getElementById("nav").classList.toggle("open");
    e.currentTarget.setAttribute("aria-expanded", open);
  });
  document.getElementById("theme").addEventListener("click", function () {
    var root = document.documentElement;
    var dark = root.dataset.theme ? root.dataset.theme === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
    root.dataset.theme = dark ? "light" : "dark";
    try { localStorage.setItem("theme", root.dataset.theme); } catch (e) {}
  });
  window.addEventListener("hashchange", route);
  route();
  }
  app.innerHTML = '<p class="empty" style="text-align:center;padding:4rem 1rem">लोड हुँदैछ…</p>';
  fetch("posts.json?v=" + Date.now()).then(function (r) { return r.json(); }).then(start).catch(function () {
    app.innerHTML = '<p class="empty" style="text-align:center;padding:4rem 1rem">लेखहरू लोड हुन सकेनन्। पछि प्रयास गर्नुहोस्।</p>';
  });
})();
