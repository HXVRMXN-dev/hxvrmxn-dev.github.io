// HXVRMXN-dev docs — shared interactivity
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------- mobile sidebar ---------------- */
  var menuBtn = document.querySelector(".menu-btn");
  var sidebar = document.querySelector(".sidebar");
  var backdrop = document.querySelector(".backdrop");

  function openSidebar() {
    if (!sidebar) return;
    sidebar.classList.add("open");
    backdrop.classList.add("open");
    menuBtn.setAttribute("aria-expanded", "true");
  }
  function closeSidebar() {
    if (!sidebar) return;
    sidebar.classList.remove("open");
    backdrop.classList.remove("open");
    menuBtn.setAttribute("aria-expanded", "false");
  }
  if (menuBtn) {
    menuBtn.addEventListener("click", function () {
      sidebar.classList.contains("open") ? closeSidebar() : openSidebar();
    });
  }
  if (backdrop) backdrop.addEventListener("click", closeSidebar);
  document.querySelectorAll(".sidebar a").forEach(function (a) {
    a.addEventListener("click", closeSidebar);
  });

  /* ---------------- scrollspy for "on this page" ---------------- */
  var tocLinks = Array.prototype.slice.call(document.querySelectorAll(".toc-list a"));
  if (tocLinks.length) {
    var headings = tocLinks
      .map(function (a) {
        var id = a.getAttribute("href").replace("#", "");
        return document.getElementById(id);
      })
      .filter(Boolean);

    var byId = {};
    tocLinks.forEach(function (a) { byId[a.getAttribute("href").slice(1)] = a; });

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          var link = byId[entry.target.id];
          if (!link) return;
          if (entry.isIntersecting) {
            tocLinks.forEach(function (l) { l.classList.remove("active"); });
            link.classList.add("active");
          }
        });
      },
      { rootMargin: "-15% 0px -70% 0px", threshold: 0 }
    );
    headings.forEach(function (h) { observer.observe(h); });
  }

  /* ---------------- copy-to-clipboard on code blocks ---------------- */
  document.querySelectorAll(".copy-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var block = btn.closest(".code-block");
      var codeEl = block ? block.querySelector("pre") : null;
      if (!codeEl) return;
      var text = codeEl.innerText;
      navigator.clipboard.writeText(text).then(function () {
        var original = btn.innerHTML;
        btn.innerHTML = "Copied";
        btn.classList.add("copied");
        setTimeout(function () {
          btn.innerHTML = original;
          btn.classList.remove("copied");
        }, 1500);
      });
    });
  });

  /* ---------------- scroll reveal for cards ---------------- */
  var revealables = document.querySelectorAll(".res-card");
  if (revealables.length) {
    if (reduceMotion) {
      revealables.forEach(function (el) { el.classList.add("in-view"); });
    } else {
      var revealObserver = new IntersectionObserver(
        function (entries, obs) {
          entries.forEach(function (entry, i) {
            if (entry.isIntersecting) {
              setTimeout(function () {
                entry.target.classList.add("in-view");
              }, i * 40);
              obs.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.15 }
      );
      revealables.forEach(function (el) { revealObserver.observe(el); });
    }
  }

  /* ---------------- footer year ---------------- */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* ---------------- command-palette search ---------------- */
  var SEARCH_INDEX = [
    { title: "Home", sub: "Overview of HXVRMXN-dev resources", href: "/index.html", group: "Pages" },
    { title: "Cordwire", sub: "Vehicle wiring & hotwire system", href: "/resources/cordwire.html", group: "Resources" },
    { title: "Cordwire — Installation", sub: "Get the resource running", href: "/resources/cordwire.html#installation", group: "Cordwire" },
    { title: "Cordwire — Configuration", sub: "config.lua reference", href: "/resources/cordwire.html#configuration", group: "Cordwire" },
    { title: "Cordwire — Exports & Events", sub: "Server & client API", href: "/resources/cordwire.html#exports-and-events", group: "Cordwire" },
    { title: "Cordwire — FAQ", sub: "Common issues & fixes", href: "/resources/cordwire.html#faq", group: "Cordwire" }
  ];

  var modal = document.querySelector(".search-modal");
  var input = document.querySelector(".search-input-row input");
  var resultsEl = document.querySelector(".search-results");
  var triggers = document.querySelectorAll("[data-search-trigger]");
  var activeIndex = 0;
  var currentResults = [];

  function renderResults(list) {
    currentResults = list;
    activeIndex = 0;
    if (!list.length) {
      resultsEl.innerHTML = '<div class="search-empty">No matches. Try “cordwire” or “install”.</div>';
      return;
    }
    resultsEl.innerHTML = list
      .map(function (item, i) {
        return (
          '<a class="search-result' + (i === 0 ? " active" : "") + '" href="' + item.href + '" data-i="' + i + '">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>' +
          '<span><span class="sr-title">' + item.title + "</span><br/>" +
          '<span class="sr-sub">' + item.sub + "</span></span></a>"
        );
      })
      .join("");
  }

  function filterIndex(q) {
    q = q.trim().toLowerCase();
    if (!q) return SEARCH_INDEX;
    return SEARCH_INDEX.filter(function (item) {
      return (item.title + " " + item.sub + " " + item.group).toLowerCase().indexOf(q) !== -1;
    });
  }

  function openSearch() {
    if (!modal) return;
    modal.classList.add("open");
    renderResults(SEARCH_INDEX);
    setTimeout(function () { input.focus(); }, 10);
  }
  function closeSearch() {
    if (!modal) return;
    modal.classList.remove("open");
    input.value = "";
  }

  triggers.forEach(function (t) { t.addEventListener("click", openSearch); });
  if (modal) {
    modal.addEventListener("click", function (e) {
      if (e.target === modal) closeSearch();
    });
  }
  if (input) {
    input.addEventListener("input", function () { renderResults(filterIndex(input.value)); });
  }

  document.addEventListener("keydown", function (e) {
    var metaK = (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k";
    var slash = e.key === "/" && document.activeElement.tagName !== "INPUT";
    if (metaK || slash) {
      e.preventDefault();
      openSearch();
      return;
    }
    if (!modal || !modal.classList.contains("open")) return;
    if (e.key === "Escape") { closeSearch(); return; }
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      var items = resultsEl.querySelectorAll(".search-result");
      if (!items.length) return;
      items[activeIndex].classList.remove("active");
      activeIndex = e.key === "ArrowDown"
        ? (activeIndex + 1) % items.length
        : (activeIndex - 1 + items.length) % items.length;
      items[activeIndex].classList.add("active");
      items[activeIndex].scrollIntoView({ block: "nearest" });
    }
    if (e.key === "Enter") {
      var active = resultsEl.querySelector(".search-result.active");
      if (active) window.location.href = active.getAttribute("href");
    }
  });
})();
