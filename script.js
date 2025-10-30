// script.js — full, opinionated, production-ready mobile nav + UX utilities
// - Mobile hamburger toggle (with aria + body lock)
// - Close-on-link, close-on-outside-click
// - Smooth scrolling for internal anchors (accounts for fixed nav height)
// - Active-section highlighting via IntersectionObserver
// - Leaves tel: links to native behavior (no aggressive hijacking)

(function () {
  'use strict';

  // ---------- Config ----------
  const NAV_SELECTOR = '.navbar';
  const TOGGLE_SELECTOR = '.mobile-menu-toggle';
  const LINKS_CONTAINER_SELECTOR = '.nav-links';
  const NAV_LINK_SELECTOR = '.nav-links a[href^="#"]';
  const ACTIVE_LINK_CLASS = 'is-active'; // applied to <a> that matches in-view section
  const BODY_NAV_OPEN_CLASS = 'nav-open';
  const NAV_FIXED_OFFSET = 72; // px - adjust to match your navbar height

  // ---------- Utilities ----------
  function qs(sel, ctx = document) { return ctx.querySelector(sel); }
  function qsa(sel, ctx = document) { return Array.from(ctx.querySelectorAll(sel)); }
  function addClass(el, cls) { if (el && !el.classList.contains(cls)) el.classList.add(cls); }
  function removeClass(el, cls) { if (el && el.classList.contains(cls)) el.classList.remove(cls); }
  function toggleClass(el, cls, state) {
    if (!el) return;
    if (typeof state === 'boolean') {
      state ? addClass(el, cls) : removeClass(el, cls);
    } else {
      el.classList.toggle(cls);
    }
  }
  function debounce(fn, wait = 100) {
    let t;
    return function (...args) {
      clearTimeout(t);
      t = setTimeout(() => fn.apply(this, args), wait);
    };
  }

  // ---------- Core init ----------
  document.addEventListener('DOMContentLoaded', function init() {
    const nav = qs(NAV_SELECTOR);
    const mobileToggle = qs(TOGGLE_SELECTOR);
    const navLinksContainer = qs(LINKS_CONTAINER_SELECTOR);

    // Safety: if markup missing, bail gracefully (and tell user in console)
    if (!nav) {
      console.warn('script.js: .navbar element not found. Mobile nav features disabled.');
      return;
    }
    if (!navLinksContainer) {
      console.warn('script.js: .nav-links element not found. Mobile nav features limited.');
    }
    if (!mobileToggle) {
      console.warn('script.js: .mobile-menu-toggle not found. Mobile toggle disabled.');
    }

    // ---------------- Mobile toggle behavior ----------------
    if (mobileToggle && navLinksContainer) {
      mobileToggle.addEventListener('click', function (e) {
        const isOpen = navLinksContainer.classList.toggle('active');
        toggleClass(mobileToggle, 'active', isOpen);

        // accessibility
        mobileToggle.setAttribute('aria-expanded', String(isOpen));

        // lock body to prevent background scroll when menu is open
        toggleClass(document.body, BODY_NAV_OPEN_CLASS, isOpen);
      });

      // Close menu when any nav link is clicked (good UX for one-page sites)
      qsa(NAV_LINK_SELECTOR, navLinksContainer).forEach(a => {
        a.addEventListener('click', function () {
          if (navLinksContainer.classList.contains('active')) {
            navLinksContainer.classList.remove('active');
            mobileToggle.classList.remove('active');
            mobileToggle.setAttribute('aria-expanded', 'false');
            document.body.classList.remove(BODY_NAV_OPEN_CLASS);
          }
        });
      });

      // Close when clicking outside the nav (desktop + mobile)
      document.addEventListener('click', function (evt) {
        const target = evt.target;
        if (!nav.contains(target) && navLinksContainer.classList.contains('active')) {
          navLinksContainer.classList.remove('active');
          mobileToggle.classList.remove('active');
          mobileToggle.setAttribute('aria-expanded', 'false');
          document.body.classList.remove(BODY_NAV_OPEN_CLASS);
        }
      });

      // Close on Escape key
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && navLinksContainer.classList.contains('active')) {
          navLinksContainer.classList.remove('active');
          mobileToggle.classList.remove('active');
          mobileToggle.setAttribute('aria-expanded', 'false');
          document.body.classList.remove(BODY_NAV_OPEN_CLASS);
        }
      });
    }

    // ---------------- Smooth scrolling for anchor links ----------------
    // Works for links that point to in-page ids (#...)
    qsa('a[href^="#"]').forEach(anchor => {
      // If link is just "#" ignore
      const href = anchor.getAttribute('href');
      if (!href || href === '#') return;

      anchor.addEventListener('click', function (e) {
        const targetId = href.split('#')[1];
        if (!targetId) return;

        const targetEl = document.getElementById(targetId);
        if (!targetEl) return; // allow default if element missing

        e.preventDefault();

        // compute offsetTop minus fixed nav height
        const rect = targetEl.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const targetY = rect.top + scrollTop - NAV_FIXED_OFFSET;

        // Use smooth scroll if supported
        window.scrollTo({ top: targetY, behavior: 'smooth' });

        // close mobile menu after navigation (if it's open)
        if (navLinksContainer && navLinksContainer.classList.contains('active')) {
          navLinksContainer.classList.remove('active');
          if (mobileToggle) mobileToggle.classList.remove('active');
          if (mobileToggle) mobileToggle.setAttribute('aria-expanded', 'false');
          document.body.classList.remove(BODY_NAV_OPEN_CLASS);
        }
      });
    });

    // ---------------- Active section highlighting ----------------
    // Observes sections that have id and marks corresponding nav links with ACTIVE_LINK_CLASS
    try {
      const sectionElements = qsa('section[id], header[id], main[id], [data-section-id]');
      const idToLink = new Map();

      // Build map id -> nav <a>
      qsa('a[href^="#"]').forEach(a => {
        const href = a.getAttribute('href');
        if (!href || href === '#') return;
        const id = href.split('#')[1];
        if (id) idToLink.set(id, a);
      });

      if (sectionElements.length && idToLink.size) {
        const observerOptions = {
          root: null,
          rootMargin: `-${NAV_FIXED_OFFSET + 6}px 0px -50% 0px`, // tune for earlier active state
          threshold: 0
        };

        const onIntersect = function (entries) {
          entries.forEach(entry => {
            const id = entry.target.id || entry.target.getAttribute('data-section-id');
            const link = idToLink.get(id);
            if (!link) return;
            if (entry.isIntersecting) {
              // remove active from others (cheap but fine; nav usually small)
              idToLink.forEach((lnk) => removeClass(lnk, ACTIVE_LINK_CLASS));
              addClass(link, ACTIVE_LINK_CLASS);
            } else {
              // If we're leaving and this link was active, remove it.
              if (link.classList.contains(ACTIVE_LINK_CLASS)) {
                removeClass(link, ACTIVE_LINK_CLASS);
              }
            }
          });
        };

        const observer = new IntersectionObserver(onIntersect, observerOptions);
        sectionElements.forEach(sec => {
          // we only observe elements with an id that exist in the nav
          const id = sec.id || sec.getAttribute('data-section-id');
          if (id && idToLink.has(id)) observer.observe(sec);
        });
      }
    } catch (err) {
      // If IntersectionObserver unsupported or something breaks, silently fail.
      // This feature is progressive enhancement only.
      console.warn('script.js: Active-section observer failed or unsupported.', err);
    }

    // ---------------- Phone link handling (intentional: do NOTHING heavy) ----------------
    // Important: don't override user's tel: anchors. Let the browser/OS handle it.
    // If you need desktop fallback (like "copy to clipboard" on non-mobile),
    // implement that specifically (not as a global hijack).
    // Example: (uncomment to add desktop fallback)
    /*
    qsa('a[href^="tel:"]').forEach(a => {
      a.addEventListener('click', function (e) {
        // optionally detect non-mobile and show a tooltip / copy to clipboard
        // if (/Mobi|Android/i.test(navigator.userAgent)) {
        //   // mobile: do nothing (native)
        // } else {
        //   e.preventDefault();
        //   const tel = a.getAttribute('href').replace('tel:', '');
        //   navigator.clipboard.writeText(tel).then(() => {
        //     // show a quick UI feedback that number was copied
        //   });
        // }
      });
    });
    */

    // ---------------- Optional: performance optimizations / scroll handlers ----------------
    // If you have expensive scroll animations, throttle them:
    // window.addEventListener('scroll', throttle(myHeavyScrollHandler, 100));
    // Simple example placeholder:
    // function throttle(fn, wait = 50) { let last = 0; return function(...args) { const now = Date.now(); if (now - last >= wait) { last = now; fn.apply(this, args); } }; }

    // End of DOMContentLoaded init
  }); // DOMContentLoaded
})();
