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

/* ────────────────────────────────────────────
   CAROUSEL / SLIDER — Hero images
──────────────────────────────────────────── */
(function initCarousel() {
  const carousel = document.querySelector('.hero__carousel');
  if (!carousel) return;

  const slides = carousel.querySelectorAll('.carousel-slide');
  const dots = carousel.querySelectorAll('.carousel-dot');
  const prevBtn = carousel.querySelector('.carousel-prev');
  const nextBtn = carousel.querySelector('.carousel-next');

  if (slides.length === 0) return;

  let currentSlide = 0;
  let autoplayInterval = null;

  /**
   * Affiche un slide spécifique
   */
  const showSlide = (index) => {
    // Boucle l'index
    currentSlide = (index + slides.length) % slides.length;

    // Met à jour l'opacité des slides
    slides.forEach((slide, i) => {
      slide.classList.toggle('active', i === currentSlide);
    });

    // Met à jour les dots
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === currentSlide);
    });
  };

  /**
   * Slide suivant
   */
  const nextSlide = () => {
    showSlide(currentSlide + 1);
    resetAutoplay();
  };

  /**
   * Slide précédent
   */
  const prevSlide = () => {
    showSlide(currentSlide - 1);
    resetAutoplay();
  };

  /**
   * Auto-rotation (optionnel — à décommenter si tu le veux)
   */
  const startAutoplay = () => {
    autoplayInterval = setInterval(() => {
      showSlide(currentSlide + 1);
    }, 5000); // Change toutes les 5 secondes
  };

  const resetAutoplay = () => {
    clearInterval(autoplayInterval);
    startAutoplay();
  };

  // Event listeners
  prevBtn?.addEventListener('click', prevSlide);
  nextBtn?.addEventListener('click', nextSlide);

  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      showSlide(index);
      resetAutoplay();
    });
  });

  // Initialiser
  showSlide(0);
  // startAutoplay(); // Décommenter pour activer l'auto-rotation
})();
