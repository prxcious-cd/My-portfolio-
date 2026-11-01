/* =====================================================
   PRECIOUS PORTFOLIO — script.js
   1 Setup · 2 Themes · 3 Mobile menu · 4 Scroll reveal
   5 Active nav link · 6 Back to top · 7 Custom cursor
   8 Enquiry form
   ===================================================== */
(function () {
  "use strict";

  var root = document.documentElement;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- 1. SETUP ---------- */
  root.classList.add("js"); // lets CSS hide .reveal items until they scroll in
  var yearEl = $("#year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- 2. THEMES ----------
     Saved in localStorage under the key below. */
  var THEME_KEY = "precious-theme"; // ✏️ EDIT only if you want a different storage key
  var THEMES = ["midnight", "ivory", "emerald", "crimson"];
  var themeToggle = $("#themeToggle");
  var themeMenu = $("#themeMenu");
  var themeButtons = $$("button", themeMenu);

  function applyTheme(name) {
    if (THEMES.indexOf(name) === -1) name = "midnight";
    root.setAttribute("data-theme", name);
    themeButtons.forEach(function (b) {
      b.setAttribute("aria-pressed", String(b.dataset.theme === name));
    });
    // Match the phone's browser bar colour to the theme
    var meta = $('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", getComputedStyle(root).getPropertyValue("--bg").trim());
  }

  function loadTheme() {
    try { return localStorage.getItem(THEME_KEY); } catch (e) { return null; }
  }
  function saveTheme(name) {
    try { localStorage.setItem(THEME_KEY, name); } catch (e) { /* storage blocked: ignore */ }
  }

  applyTheme(loadTheme() || "midnight");

  function setThemeMenu(open) {
    themeMenu.hidden = !open;
    themeToggle.setAttribute("aria-expanded", String(open));
  }

  themeToggle.addEventListener("click", function (e) {
    e.stopPropagation();
    setThemeMenu(themeMenu.hidden);
  });
  themeButtons.forEach(function (b) {
    b.addEventListener("click", function () {
      applyTheme(b.dataset.theme);
      saveTheme(b.dataset.theme);
      setThemeMenu(false);
      themeToggle.focus();
    });
  });
  document.addEventListener("click", function (e) {
    if (!themeMenu.hidden && !themeMenu.contains(e.target)) setThemeMenu(false);
  });

  /* ---------- 3. MOBILE MENU ---------- */
  var menuBtn = $("#menuBtn");
  var nav = $("#nav");

  function setMenu(open) {
    nav.classList.toggle("open", open);
    document.body.classList.toggle("menu-open", open);
    menuBtn.setAttribute("aria-expanded", String(open));
    menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  }

  menuBtn.addEventListener("click", function () {
    setMenu(!nav.classList.contains("open"));
    setThemeMenu(false);
  });
  $$("a", nav).forEach(function (a) {
    a.addEventListener("click", function () { setMenu(false); });
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      setMenu(false);
      setThemeMenu(false);
    }
  });
  // If the screen grows to desktop size, make sure the mobile menu is reset
  window.matchMedia("(min-width: 900px)").addEventListener("change", function (e) {
    if (e.matches) setMenu(false);
  });

  /* ---------- 4. SCROLL REVEAL ---------- */
  var revealEls = $$(".reveal");
  if ("IntersectionObserver" in window && !reduceMotion) {
    var revealObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add("in");
          revealObs.unobserve(en.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    revealEls.forEach(function (el) { revealObs.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- 5. ACTIVE NAV LINK ---------- */
  var navLinks = $$("a", nav);
  var sections = ["home", "work", "services", "about", "contact"]
    .map(function (id) { return document.getElementById(id); })
    .filter(Boolean);

  if ("IntersectionObserver" in window) {
    var navObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        navLinks.forEach(function (a) {
          var on = a.getAttribute("href") === "#" + en.target.id;
          a.classList.toggle("active", on);
          if (on) a.setAttribute("aria-current", "true");
          else a.removeAttribute("aria-current");
        });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    sections.forEach(function (s) { navObs.observe(s); });
  }

  /* ---------- 6. BACK TO TOP ---------- */
  var toTop = $("#toTop");
  var ticking = false;
  function onScroll() {
    ticking = false;
    toTop.hidden = window.scrollY < 700;
  }
  window.addEventListener("scroll", function () {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  onScroll();
  toTop.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  });

  /* ---------- 7. CUSTOM CURSOR (desktop mouse only) ---------- */
  var canCursor = window.matchMedia("(hover: hover) and (pointer: fine)").matches && !reduceMotion;
  if (canCursor) {
    var dot = $(".cursor-dot");
    var ring = $(".cursor-ring");
    var mx = -100, my = -100, rx = -100, ry = -100;
    root.classList.add("has-cursor");

    window.addEventListener("mousemove", function (e) {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = "translate3d(" + mx + "px," + my + "px,0)";
    }, { passive: true });

    (function loop() {
      rx += (mx - rx) * 0.18; // 0.18 = how "laggy" the ring feels
      ry += (my - ry) * 0.18;
      ring.style.transform = "translate3d(" + rx + "px," + ry + "px,0)";
      requestAnimationFrame(loop);
    })();

    document.addEventListener("mouseover", function (e) {
      ring.classList.toggle("hover", !!e.target.closest("a, button, input, select, textarea"));
    });
  }

  /* ---------- 8. ENQUIRY FORM ----------
     No backend. It opens the visitor's email app or WhatsApp with the
     message already written. The email/number come from the form's
     data-email and data-whatsapp attributes in index.html. */
  var form = $("#enquiry");
  var note = $(".note", form);
  var noteDefault = note.textContent;

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var via = e.submitter && e.submitter.dataset.via ? e.submitter.dataset.via : "email";
    var name = form.elements.name.value.trim();
    var type = form.elements.type.value;
    var msg = form.elements.message.value.trim();

    var text = "Hi Precious, my name is " + name + ".\n" +
               "Project type: " + type + "\n\n" + msg;

    if (via === "whatsapp") {
      var num = (form.dataset.whatsapp || "").replace(/\D/g, "");
      if (!num || /X/i.test(form.dataset.whatsapp)) {
        note.textContent = "WhatsApp number not set yet. Edit data-whatsapp in index.html.";
        return;
      }
      window.open("https://wa.me/" + num + "?text=" + encodeURIComponent(text), "_blank", "noopener");
    } else {
      var email = form.dataset.email || "";
      if (!email || email === "hello@example.com") {
        note.textContent = "Email not set yet. Edit data-email in index.html.";
        return;
      }
      var subject = "Project enquiry: " + type;
      window.location.href = "mailto:" + email +
        "?subject=" + encodeURIComponent(subject) +
        "&body=" + encodeURIComponent(text);
    }
    note.textContent = noteDefault;
  });
})();
