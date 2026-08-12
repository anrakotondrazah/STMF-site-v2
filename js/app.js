/* ============================================================
   STMF — GESTION LOCATIVE | app.js
   Application core — initialisation et utilitaires globaux
   ============================================================ */

'use strict';

/* ─── Constants ─── */
const SITE_NAME = 'STMF — Gestion Locative';
const SCROLL_THRESHOLD = 60; // px avant que la navbar devient opaque

/* ─── DOM ready ─── */
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});

/* ─── Application ─── */
const App = {
  init() {
    UI.initNavbar();
    UI.initMobileNav();
    UI.initScrollReveal();
    UI.initActiveNavLink();

    // Formulaire de contact uniquement sur la page contact
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
      ContactForm.init(contactForm);
    }
  }
};

/* ─── Utilities ─── */
const Utils = {
  /**
   * Debounce: limite la fréquence d'appel d'une fonction
   * @param {Function} fn
   * @param {number} delay en ms
   */
  debounce(fn, delay = 150) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), delay);
    };
  },

  /**
   * Sanitise une chaîne pour éviter l'injection HTML
   * @param {string} str
   * @returns {string}
   */
  sanitize(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  },

  /**
   * Vérifie si un élément est dans le viewport
   * @param {Element} el
   * @param {number} offset en px
   */
  isInViewport(el, offset = 0) {
    const rect = el.getBoundingClientRect();
    return (
      rect.top <= (window.innerHeight || document.documentElement.clientHeight) - offset &&
      rect.bottom >= 0
    );
  },

  /**
   * Crée un IntersectionObserver sécurisé avec fallback
   * @param {Function} callback
   * @param {Object} options
   */
  createObserver(callback, options = {}) {
    if (!('IntersectionObserver' in window)) {
      // Fallback pour anciens navigateurs : révèle immédiatement
      return {
        observe: (el) => callback([{ isIntersecting: true, target: el }]),
        unobserve: () => {}
      };
    }
    return new IntersectionObserver(callback, options);
  }
};
