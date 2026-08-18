import { auth } from "./auth.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.17.0/firebase-auth.js";

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
    if (path.length > 1 && path.endsWith("/")) {
      path = path.slice(0, -1);
    }
    var file = path.substring(path.lastIndexOf("/") + 1);
    if (!file) return "index.html";
    if (!file.endsWith(".html")) file += ".html";
    return file;
  }

  var activeFile = currentFile();

  function link(href, label, isActive) {
    return '<a href="' + href + '"' + (isActive ? ' class="active"' : "") + ">" + label + "</a>";
  }

  // --- Responsive: on small screens the nav collapses to logo | brand | Home More | theme Join ---
  var smallQuery = window.matchMedia("(max-width: 880px)");
  var touchQuery = window.matchMedia("(hover: none)");

  // --- Build the navbar ---
  function buildNav(isSmall) {
    var mainLinks, moreItems, moreLabel;

    if (isSmall) {
      // Small screens: only "Home" stays visible; everything else moves into "More"
      mainLinks = links.filter(function (l) { return l.href === "index.html"; });
      moreItems = links
        .filter(function (l) { return l.href !== "index.html"; })
        .concat(dropdown.items, [contact]);
      moreLabel = "More";
    } else {
      mainLinks = links;
      moreItems = dropdown.items;
      moreLabel = dropdown.label;
    }

    var dropdownActive = moreItems.some(function (i) { return i.href === activeFile; });

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
        mainLinks.map(function (l) { return link(l.href, l.label, l.href === activeFile); }).join("") +
        '<div class="dropdown">' +
          '<button class="dropdown-toggle' + (dropdownActive ? " active" : "") + '" type="button">' +
            moreLabel + ' <span class="caret">▾</span>' +
          "</button>" +
          '<div class="dropdown-menu">' +
            moreItems.map(function (i) { return '<a href="' + i.href + '">' + i.label + "</a>"; }).join("") +
          "</div>" +
        "</div>" +
        (isSmall ? "" : link(contact.href, contact.label, contact.href === activeFile)) +
      "</div>" +
      '<span class="divider" aria-hidden="true"></span>' +
      '<div class="nav-actions">' +
        '<button class="theme-toggle" id="themeToggle" type="button" aria-label="Toggle theme">' +
          ICONS.sun + ICONS.moon +
        "</button>" +
        '<a href="join.html" class="btn-join">Join</a>' +
        '<span class="nav-auth" id="nav-auth"></span>' +
      "</div>"
    );
  }

  var nav = document.getElementById("navbar");
  var navAuth = null;
  var joinBtn = null;
  var currentUser = null;

  // --- Auth state: show user name + sign out at the far right of the bar ---
  function renderNavAuth() {
    if (!navAuth) return;
    navAuth.textContent = "";

    if (currentUser) {
      if (joinBtn) joinBtn.style.display = "none";

      var name = currentUser.displayName || (currentUser.email ? currentUser.email.split("@")[0] : "Member");

      var nameSpan = document.createElement("span");
      nameSpan.className = "nav-user";
      nameSpan.textContent = name;

      var outBtn = document.createElement("button");
      outBtn.type = "button";
      outBtn.className = "btn-signout";
      outBtn.textContent = "Sign Out";
      outBtn.addEventListener("click", function () {
        signOut(auth).catch(function (e) { console.error("Sign out failed:", e); });
      });

      navAuth.appendChild(nameSpan);
      navAuth.appendChild(outBtn);
    } else {
      if (joinBtn) joinBtn.style.display = "";
    }
  }

  // --- (Re)build the navbar and re-bind per-build listeners ---
  function bindNav() {
    if (!nav) return;

    nav.innerHTML = buildNav(smallQuery.matches);

    navAuth = document.getElementById("nav-auth");
    joinBtn = document.querySelector(".btn-join");

    var toggle = document.getElementById("themeToggle");
    if (toggle) {
      toggle.addEventListener("click", function () {
        var next = (root.getAttribute("data-theme") || "dark") === "light" ? "dark" : "light";
        applyTheme(next);
      });
    }

    // Small screens / touch devices: open the dropdown by tapping "More"
    if (smallQuery.matches || touchQuery.matches) {
      var dd = nav.querySelector(".dropdown");
      var ddBtn = nav.querySelector(".dropdown-toggle");
      if (ddBtn && dd) {
        ddBtn.addEventListener("click", function (e) {
          e.stopPropagation();
          dd.classList.toggle("open");
        });
      }
    }

    renderNavAuth();
  }

  // Close the tap-opened dropdown when tapping anywhere outside it
  document.addEventListener("click", function (e) {
    if (!nav) return;
    var open = nav.querySelector(".dropdown.open");
    if (open && !open.contains(e.target)) open.classList.remove("open");
  });

  onAuthStateChanged(auth, function (user) {
    currentUser = user;
    renderNavAuth();
  });

  bindNav();
  if (typeof smallQuery.addEventListener === "function") {
    smallQuery.addEventListener("change", bindNav);
  } else if (typeof smallQuery.addListener === "function") {
    smallQuery.addListener(bindNav); // older Safari
  }

  // --- Cookie helpers ---
  function setCookie(name, value, days) {
    try {
      var expires = "";
      if (days) {
        var d = new Date();
        d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
        expires = "; expires=" + d.toUTCString();
      }
      document.cookie = name + "=" + encodeURIComponent(value) + expires + "; path=/; SameSite=Lax";
    } catch (e) { /* ignore */ }
  }

  function getCookie(name) {
    try {
      var match = document.cookie.match(new RegExp("(?:^|; )" + name + "=([^;]*)"));
      return match ? decodeURIComponent(match[1]) : null;
    } catch (e) {
      return null;
    }
  }

  // --- Theme toggle (defaults to dark) ---
  var root = document.documentElement;
  var saved = null;
  try { saved = localStorage.getItem("theme"); } catch (e) { /* ignore */ }
  if (!saved) saved = getCookie("lk_theme");
  if (saved === "light" || saved === "dark") root.setAttribute("data-theme", saved);

  function applyTheme(next) {
    root.setAttribute("data-theme", next);
    try { localStorage.setItem("theme", next); } catch (e) { /* ignore */ }
    setCookie("lk_theme", next, 365);
    document.dispatchEvent(new CustomEvent("logicklub-theme-change", { detail: { theme: next } }));
  }


  // --- First-visit welcome toast (cookie-driven) ---
  var visitedBefore = getCookie("lk_visited") === "1";
  try { visitedBefore = visitedBefore || localStorage.getItem("lk_visited") === "1"; } catch (e) { /* ignore */ }

  if (activeFile === "index.html" && !visitedBefore) {
    setCookie("lk_visited", "1", 30);
    try { localStorage.setItem("lk_visited", "1"); } catch (e) { /* ignore */ }

    try {
      var toast = document.createElement("div");
      toast.className = "welcome-toast";
      toast.setAttribute("role", "status");
      toast.innerHTML =
        '<span>Welcome to LOGICKlub — learn, build, and play with us!</span>' +
        '<button type="button" class="welcome-toast-close" aria-label="Dismiss">×</button>';
      document.body.appendChild(toast);

      var removeToast = function () {
        toast.classList.add("welcome-toast--hide");
        setTimeout(function () {
          if (toast.parentNode) toast.parentNode.removeChild(toast);
        }, 400);
      };

      toast.querySelector(".welcome-toast-close").addEventListener("click", removeToast);
      setTimeout(removeToast, 6000);
    } catch (e) { /* ignore */ }
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
