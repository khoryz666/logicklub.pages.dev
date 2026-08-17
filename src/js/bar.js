(function () {
  "use strict";

  // --- Navigation config (single source of truth) ---
  var brand = "LOGICKlub";
  var tagline = "Learn, build, and play with us";

  var links = [
    { label: "Home", href: "index.html" },
    { label: "Events", href: "events.html" },
    { label: "Workshops", href: "workshops.html" },
    { label: "Projects", href: "projects.html" }
  ];

  var dropdown = {
    label: "Activity",
    items: [
      { label: "Learn Math", href: "math.html" },
      { label: "Play AI", href: "game.html" }
    ]
  };

  var contact = { label: "Contact", href: "contact.html" };

  var ICONS = {
    logo: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M7 4v12a4 4 0 0 0 4 4h6" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><circle cx="7" cy="4" r="2.5" fill="currentColor"/><circle cx="17" cy="20" r="2.5" fill="currentColor"/></svg>',
    sun: '<svg class="icon-sun" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>',
    moon: '<svg class="icon-moon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>'
  };

  // --- Detect current page from the URL (e.g. "events.html") ---
  function currentFile() {
    var path = window.location.pathname;
    var file = path.substring(path.lastIndexOf("/") + 1);
    return file || "index.html";
  }

  var activeFile = currentFile();

  function link(href, label, isActive) {
    return '<a href="' + href + '"' + (isActive ? ' class="active"' : "") + ">" + label + "</a>";
  }

  // --- Build the navbar ---
  function buildNav() {
    var dropdownActive = dropdown.items.some(function (i) { return i.href === activeFile; });

    return (
      '<a class="logo-mark" href="index.html" aria-label="LOGICKlub home">' +
        '<span class="logo-dot">' + ICONS.logo + "</span>" +
      "</a>" +
      '<span class="divider" aria-hidden="true"></span>' +
      '<div class="brand-block">' +
        '<a class="brand" href="index.html">' + brand + "</a>" +
        '<span class="tagline">' + tagline + "</span>" +
      "</div>" +
      '<div class="nav-links">' +
        links.map(function (l) { return link(l.href, l.label, l.href === activeFile); }).join("") +
        '<div class="dropdown">' +
          '<button class="dropdown-toggle' + (dropdownActive ? " active" : "") + '" type="button">' +
            dropdown.label + ' <span class="caret">▾</span>' +
          "</button>" +
          '<div class="dropdown-menu">' +
            dropdown.items.map(function (i) { return '<a href="' + i.href + '">' + i.label + "</a>"; }).join("") +
          "</div>" +
        "</div>" +
        link(contact.href, contact.label, contact.href === activeFile) +
      "</div>" +
      '<span class="divider" aria-hidden="true"></span>' +
      '<div class="nav-actions">' +
        '<button class="theme-toggle" id="themeToggle" type="button" aria-label="Toggle theme">' +
          ICONS.sun + ICONS.moon +
        "</button>" +
        '<a href="join.html" class="btn-join">Join</a>' +
      "</div>"
    );
  }

  var nav = document.getElementById("navbar");
  if (nav) nav.innerHTML = buildNav();

  // --- Theme toggle (defaults to dark) ---
  var root = document.documentElement;
  var saved = null;
  try { saved = localStorage.getItem("theme"); } catch (e) { /* ignore */ }
  if (saved === "light" || saved === "dark") root.setAttribute("data-theme", saved);

  var toggle = document.getElementById("themeToggle");
  if (toggle) {
    toggle.addEventListener("click", function () {
      var next = (root.getAttribute("data-theme") || "dark") === "light" ? "dark" : "light";
      root.setAttribute("data-theme", next);
      try { localStorage.setItem("theme", next); } catch (e) { /* ignore */ }
    });
  }

  // --- Scroll animation: hero fades out, about section fades in ---
  var heroContent = document.querySelector(".hero-content");
  if (heroContent) {
    var ticking = false;
    function updateHero() {
      var vh = window.innerHeight || 1;
      var progress = Math.min(Math.max((window.scrollY || window.pageYOffset) / (vh * 0.85), 0), 1);
      heroContent.style.opacity = String(1 - progress);
      heroContent.style.transform = "translateY(" + (progress * 60) + "px)";
      ticking = false;
    }
    function onScroll() {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(updateHero);
      }
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    updateHero();
  }

  var aboutInner = document.querySelector(".about-inner");
  if (aboutInner) {
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            aboutInner.classList.add("is-visible");
            io.unobserve(aboutInner);
          }
        });
      }, { threshold: 0.15 });
      io.observe(aboutInner);
    } else {
      aboutInner.classList.add("is-visible");
    }
  }

  // --- Sticky card stack animation (follows page scroll) ---
  var stackDemo = document.querySelector(".stack-demo");
  if (stackDemo) {
    var cards = stackDemo.querySelectorAll(".stack-card");
    var stackTicking = false;
    function updateStack() {
      var rect = stackDemo.getBoundingClientRect();
      var total = stackDemo.offsetHeight - window.innerHeight;
      var p = total > 0 ? Math.min(Math.max(-rect.top / total, 0), 1) : 0;
      var spread = Math.min(160, window.innerWidth * 0.12);
      for (var i = 0; i < cards.length; i++) {
        var center = (cards.length - 1) / 2;
        var off = i - center;
        var x = off * spread * p;
        var y = Math.abs(off) * 10 * p;
        var rotate = off * -8 * p;
        cards[i].style.transform =
          "translate(-50%, -50%) translate(" + x.toFixed(2) + "px, " + y.toFixed(2) + "px) rotate(" + rotate.toFixed(2) + "deg)";
        cards[i].style.zIndex = String(i + 1);
      }
      stackTicking = false;
    }
    function onStackScroll() {
      if (!stackTicking) {
        stackTicking = true;
        window.requestAnimationFrame(updateStack);
      }
    }
    window.addEventListener("scroll", onStackScroll, { passive: true });
    updateStack();
  }
})();
