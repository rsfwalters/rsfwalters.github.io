/* robinwalters.com
   Renders the publication lists from data/publications.js, and wires up the
   topic filter, abstract toggles and "earlier updates" control. */
(function () {
  "use strict";

  /* ---------------------------------------------------------------------
     Paper thumbnails. Set to false to hide every thumbnail on the site;
     nothing else needs to change. Individual papers are hidden by leaving
     their "image" field empty in data/publications.js.
     --------------------------------------------------------------------- */
  var SHOW_THUMBNAILS = true;

  var TOPIC_LABELS = {
    robotics:  "Robot learning",
    discovery: "Symmetry discovery &amp; relaxed equivariance",
    params:    "Parameter-space symmetry",
    theory:    "Theory of equivariant networks",
    science:   "Science &amp; engineering",
    math:      "Pure mathematics",
    bio:       "Computational biology"
  };
  var TOPIC_ORDER = ["robotics", "discovery", "params", "theory", "science", "math", "bio"];

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;")
      .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function authors(str) {
    return esc(str).replace(/Robin Walters/g, '<span class="me">Robin Walters</span>');
  }

  /* The title links to the first of these that exists. */
  function primaryLink(p) {
    var want = ["PDF", "Webpage", "arXiv", "Paper"], i, j;
    for (i = 0; i < want.length; i++) {
      for (j = 0; j < p.links.length; j++) {
        if (p.links[j].label === want[i]) return p.links[j].url;
      }
    }
    return p.links.length ? p.links[0].url : "";
  }

  function entry(p, opts) {
    opts = opts || {};
    var href = primaryLink(p);
    var title = href ? '<a href="' + esc(href) + '">' + esc(p.title) + "</a>" : esc(p.title);

    var h = '<div class="entry" data-topic="' + esc(p.topic) + '" data-year="' + p.year + '">';
    if (SHOW_THUMBNAILS && p.image) {
      /* onerror: a thumbnail that has not been downloaded yet (see
         tools/fetch_thumbnails.py) removes itself instead of showing
         a broken-image icon. */
      h += '<img class="thumb" src="' + esc(opts.prefix || "") + esc(p.image) +
           '" alt="" aria-hidden="true" loading="lazy" onerror="this.remove()">';
    }
    h += '<p class="t">' + title + "</p>";
    h += '<p class="au">' + authors(p.authors) + "</p>";
    h += '<p class="vn"><span class="venue">' + esc(p.venue) + "</span>, " + p.year;
    if (p.note) h += '<span class="tag">' + esc(p.note) + "</span>";
    h += "</p>";

    if (opts.blurb && p.blurb) h += '<p class="blurb">' + esc(p.blurb) + "</p>";

    if (!opts.compact && (p.links.length || p.abstract)) {
      h += '<p class="links">';
      if (p.abstract) h += '<button type="button" data-abstract aria-expanded="false">Abstract</button>';
      p.links.forEach(function (l) {
        h += '<a href="' + esc(l.url) + '">' + esc(l.label) + "</a>";
      });
      h += "</p>";
      if (p.abstract) h += '<div class="abstract">' + esc(p.abstract) + "</div>";
    }
    return h + "</div>";
  }

  function sorted(pubs) {
    return pubs.slice().sort(function (a, b) {
      if (a.year !== b.year) return b.year - a.year;
      var ac = a.kind === "conference" ? 0 : 1, bc = b.kind === "conference" ? 0 : 1;
      if (ac !== bc) return ac - bc;
      return a.title.localeCompare(b.title);
    });
  }

  /* ------------------------------------------- home page: Selected work  */
  function renderSelected(el, pubs) {
    if (SHOW_THUMBNAILS) el.classList.add("with-thumbs");
    var limit = parseInt(el.getAttribute("data-limit") || "6", 10);
    var picked = sorted(pubs).filter(function (p) { return p.selected; }).slice(0, limit);
    el.innerHTML = picked.map(function (p) {
      return '<div class="yr">' + p.year + "</div>" + entry(p, { compact: true, blurb: true });
    }).join("");
  }

  /* ---------------------------------------- publications page: full list */
  function renderAll(el, pubs) {
    if (SHOW_THUMBNAILS) el.classList.add("with-thumbs");
    var all = sorted(pubs);
    var count = document.getElementById("pubcount");
    var bar = document.getElementById("pubfilters");

    var html = "", year = null;
    all.forEach(function (p) {
      if (p.year !== year) {
        year = p.year;
        html += '<div class="yr" data-year="' + year + '">' + year + "</div>";
      }
      html += entry(p, {});
    });
    el.innerHTML = html;

    var entries = el.querySelectorAll(".entry");
    var years = el.querySelectorAll(".yr");

    function setCount(n) {
      if (count) count.textContent = n + (n === 1 ? " paper" : " papers");
    }
    setCount(all.length);

    if (!bar) return;
    var present = {};
    all.forEach(function (p) { present[p.topic] = true; });
    bar.innerHTML =
      '<button type="button" data-f="all" aria-pressed="true">All areas</button>' +
      TOPIC_ORDER.filter(function (k) { return present[k]; }).map(function (k) {
        return '<button type="button" data-f="' + k + '" aria-pressed="false">' +
               TOPIC_LABELS[k] + "</button>";
      }).join("");

    bar.addEventListener("click", function (e) {
      var btn = e.target.closest("button[data-f]");
      if (!btn) return;
      var want = btn.getAttribute("data-f");
      Array.prototype.forEach.call(bar.querySelectorAll("button"), function (b) {
        b.setAttribute("aria-pressed", String(b === btn));
      });
      var shown = 0, live = {};
      Array.prototype.forEach.call(entries, function (n) {
        var ok = want === "all" || n.getAttribute("data-topic") === want;
        n.hidden = !ok;
        if (ok) { shown++; live[n.getAttribute("data-year")] = true; }
      });
      Array.prototype.forEach.call(years, function (y) {
        y.hidden = !live[y.getAttribute("data-year")];
      });
      setCount(shown);
    });
  }

  /* --------------------------------------------------------------- boot  */
  function boot() {
    var pubs = window.PUBLICATIONS;
    var sel = document.getElementById("selected-work");
    var all = document.getElementById("all-publications");

    if (!pubs || !pubs.length) {
      /* Data file missing or has a syntax error. Say so rather than showing
         an empty page; the browser console will have the details. */
      [sel, all].forEach(function (el) {
        if (!el) return;
        el.innerHTML = '<div class="entry"><p class="t">The publication list did not load.</p>' +
          '<p class="vn">There is probably a stray comma in data/publications.js. ' +
          'The full list is in the <a href="' +
          (el === sel ? "" : "") + 'Robin_Walters_CV.pdf">CV</a>.</p></div>';
      });
    } else {
      if (sel) renderSelected(sel, pubs);
      if (all) renderAll(all, pubs);
    }

    document.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-abstract]");
      if (!btn) return;
      var box = btn.closest(".entry").querySelector(".abstract");
      if (!box) return;
      btn.setAttribute("aria-expanded", String(box.classList.toggle("open")));
    });

    var more = document.querySelector("[data-more]");
    if (more) {
      var old = document.querySelectorAll(".news [data-old]");
      if (!old.length) { more.hidden = true; return; }
      more.addEventListener("click", function () {
        var opening = old[0].classList.contains("hidden");
        Array.prototype.forEach.call(old, function (n) { n.classList.toggle("hidden", !opening); });
        more.textContent = opening ? "Hide earlier updates" : "Show earlier updates";
        more.setAttribute("aria-expanded", String(opening));
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else { boot(); }
})();
