/* ============================================================
   STMF — GESTION LOCATIVE | ui.js
   Navigation, animations scroll-reveal, interactions UI
   ============================================================ */

'use strict';

const UI = {

  /* ────────────────────────────────────────────
     NAVBAR — opacité au scroll
  ──────────────────────────────────────────── */
  initNavbar() {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;

    const onScroll = Utils.debounce(() => {
      const scrolled = window.scrollY > SCROLL_THRESHOLD;
      navbar.classList.toggle('is-scrolled', scrolled);
    }, 80);

    window.addEventListener('scroll', onScroll, { passive: true });
    // Appel initial pour le cas où la page est déjà scrollée
    onScroll();
  },

  /* ────────────────────────────────────────────
     MOBILE NAV — overlay + hamburger
  ──────────────────────────────────────────── */
  initMobileNav() {
    const toggle  = document.getElementById('navToggle');
    const overlay = document.getElementById('navOverlay');
    const navLinks = overlay ? overlay.querySelectorAll('.nav-link, .btn') : [];

    if (!toggle || !overlay) return;

    const open = () => {
      overlay.classList.add('is-open');
      toggle.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    };

    const close = () => {
      overlay.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    };

    toggle.addEventListener('click', () => {
      const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
      isExpanded ? close() : open();
    });

    // Fermer en cliquant sur un lien
    navLinks.forEach(link => link.addEventListener('click', close));

    // Fermer sur Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') close();
    });

    // Fermer en cliquant en dehors du menu (sur le fond de l'overlay)
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) close();
    });
  },

  /* ────────────────────────────────────────────
     ACTIVE NAV LINK — basé sur l'URL courante
  ──────────────────────────────────────────── */
  initActiveNavLink() {
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';

    // Sélectionne tous les nav-links dans la navbar ET l'overlay mobile
    const allNavLinks = document.querySelectorAll('.nav-link');

    allNavLinks.forEach(link => {
      const href = link.getAttribute('href') || '';
      const linkPage = href.split('/').pop();

      const isHome = (currentPath === '' || currentPath === 'index.html') && (linkPage === 'index.html' || linkPage === '');
      const isMatch = linkPage && linkPage !== 'index.html' && currentPath.includes(linkPage);

      if (isHome || isMatch) {
        link.classList.add('is-active');
        link.setAttribute('aria-current', 'page');
      }
    });
  },

  /* ────────────────────────────────────────────
     SCROLL REVEAL — IntersectionObserver
  ──────────────────────────────────────────── */
  initScrollReveal() {
    const targets = document.querySelectorAll('[data-reveal]');
    if (!targets.length) return;

    const observer = Utils.createObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: '0px 0px -48px 0px'
      }
    );

    targets.forEach(el => observer.observe(el));
  }

};

/* ────────────────────────────────────────────
   TIMELINE — animation de la ligne (page À propos)
──────────────────────────────────────────── */
(function initTimeline() {
  const fill = document.querySelector('.timeline__line-fill');
  if (!fill) return;

  const observer = Utils.createObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          fill.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 }
  );

  // On observe le conteneur parent
  const timeline = document.querySelector('.timeline');
  if (timeline) observer.observe(timeline);
})();
