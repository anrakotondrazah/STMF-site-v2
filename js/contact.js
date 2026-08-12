/* ============================================================
   STMF — GESTION LOCATIVE | contact.js
   Formulaire de contact — validation et soumission sécurisée
   ============================================================ */

'use strict';

const ContactForm = {

  form: null,
  submitBtn: null,
  statusEl: null,

  /* ─── Règles de validation ─── */
  rules: {
    name: {
      required: true,
      minLength: 2,
      maxLength: 80,
      messages: {
        required:  'Votre nom est requis.',
        minLength: 'Le nom doit contenir au moins 2 caractères.',
        maxLength: 'Le nom ne peut pas dépasser 80 caractères.'
      }
    },
    email: {
      required: true,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/,
      maxLength: 120,
      messages: {
        required:  'Votre adresse e-mail est requise.',
        pattern:   'Veuillez entrer une adresse e-mail valide.',
        maxLength: "L'adresse e-mail est trop longue."
      }
    },
    phone: {
      required: false,
      pattern: /^[0-9+\s\-().]{6,20}$/,
      messages: {
        pattern: 'Veuillez entrer un numéro de téléphone valide.'
      }
    },
    message: {
      required: true,
      minLength: 15,
      maxLength: 2000,
      messages: {
        required:  'Votre message est requis.',
        minLength: 'Le message doit contenir au moins 15 caractères.',
        maxLength: 'Le message ne peut pas dépasser 2000 caractères.'
      }
    }
  },

  /* ─── Initialisation ─── */
  init(form) {
    this.form      = form;
    this.submitBtn = form.querySelector('[data-submit]');
    this.statusEl  = form.querySelector('[data-status]');

    // Validation en temps réel sur blur
    const inputs = form.querySelectorAll('[data-field]');
    inputs.forEach(input => {
      input.addEventListener('blur', () => this.validateField(input));
      input.addEventListener('input', () => this.clearError(input));
    });

    form.addEventListener('submit', (e) => this.handleSubmit(e));
  },

  /* ─── Valide un champ individuel ─── */
  validateField(input) {
    const fieldName = input.dataset.field;
    const rule = this.rules[fieldName];
    if (!rule) return true;

    const value = input.value.trim();
    const errorEl = this.form.querySelector(`[data-error="${fieldName}"]`);

    // Champ vide + non requis → valide
    if (!value && !rule.required) {
      this.clearError(input, errorEl);
      return true;
    }

    // Vérifications dans l'ordre
    if (rule.required && !value) {
      this.showError(input, errorEl, rule.messages.required);
      return false;
    }

    if (rule.minLength && value.length < rule.minLength) {
      this.showError(input, errorEl, rule.messages.minLength);
      return false;
    }

    if (rule.maxLength && value.length > rule.maxLength) {
      this.showError(input, errorEl, rule.messages.maxLength);
      return false;
    }

    if (rule.pattern && value && !rule.pattern.test(value)) {
      this.showError(input, errorEl, rule.messages.pattern);
      return false;
    }

    this.clearError(input, errorEl);
    return true;
  },

  /* ─── Affiche une erreur ─── */
  showError(input, errorEl, message) {
    input.classList.add('has-error');
    input.setAttribute('aria-invalid', 'true');
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.setAttribute('role', 'alert');
    }
  },

  /* ─── Efface une erreur ─── */
  clearError(input, errorEl) {
    input.classList.remove('has-error');
    input.removeAttribute('aria-invalid');
    const el = errorEl || this.form.querySelector(`[data-error="${input.dataset.field}"]`);
    if (el) el.textContent = '';
  },

  /* ─── Valide tout le formulaire ─── */
  validateAll() {
    const inputs = this.form.querySelectorAll('[data-field]');
    let isValid = true;
    inputs.forEach(input => {
      if (!this.validateField(input)) isValid = false;
    });
    return isValid;
  },

  /* ─── Gestion de la soumission ─── */
  async handleSubmit(e) {
    e.preventDefault();

    // Vérification honeypot anti-spam (champ caché)
    const honeypot = this.form.querySelector('[name="_honey"]');
    if (honeypot && honeypot.value) return; // Bot détecté, on ignore silencieusement

    if (!this.validateAll()) {
      // Focus sur le premier champ en erreur
      const firstError = this.form.querySelector('.has-error');
      if (firstError) firstError.focus();
      return;
    }

    this.setLoading(true);
    this.hideStatus();

    const formData = new FormData(this.form);

    try {
      const response = await fetch(this.form.action, {
        method: 'POST',
        body: formData,
        headers: { 'Accept': 'application/json' }
      });

      if (response.ok) {
        this.showStatus('success',
          '✓ Message envoyé avec succès ! Nous vous répondrons dans les plus brefs délais.'
        );
        this.form.reset();
        // Scroll vers le message de confirmation
        this.statusEl && this.statusEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      } else {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Erreur serveur');
      }
    } catch (error) {
      this.showStatus('error',
        'Une erreur est survenue. Veuillez réessayer ou nous contacter directement à stmfanio@gmail.com'
      );
    } finally {
      this.setLoading(false);
    }
  },

  /* ─── UI états ─── */
  setLoading(isLoading) {
    if (!this.submitBtn) return;
    this.submitBtn.disabled = isLoading;

    const btnText    = this.submitBtn.querySelector('[data-btn-text]');
    const btnSpinner = this.submitBtn.querySelector('[data-btn-spinner]');

    if (btnText)    btnText.style.display    = isLoading ? 'none' : '';
    if (btnSpinner) btnSpinner.style.display = isLoading ? 'inline-block' : 'none';
  },

  showStatus(type, message) {
    if (!this.statusEl) return;
    this.statusEl.className = `form-status ${type}`;
    this.statusEl.textContent = message;
  },

  hideStatus() {
    if (!this.statusEl) return;
    this.statusEl.className = 'form-status';
    this.statusEl.textContent = '';
  }

};
