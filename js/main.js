/**
 * Segreta — main.js
 * Interactividad base: nav scroll, hamburguesa, hero tagline animada,
 * marquee, lightbox, reveal on scroll, formularios.
 */

document.addEventListener('DOMContentLoaded', () => {

  /* ── Nav: sticky + scroll class ──────────────────────────── */
  const nav = document.querySelector('.site-nav');
  if (nav) {
    const onScroll = () => {
      nav.classList.toggle('scrolled', window.scrollY > 20);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ── Nav: hamburguesa mobile ──────────────────────────────── */
  const toggle = document.querySelector('.nav-toggle');
  const drawer = document.querySelector('.nav-drawer');
  if (toggle && drawer) {
    toggle.addEventListener('click', () => {
      const isOpen = drawer.classList.toggle('open');
      document.body.style.overflow = isOpen ? 'hidden' : '';
      toggle.setAttribute('aria-expanded', isOpen);
    });
    // Cerrar al hacer click en link del drawer
    drawer.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        drawer.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  /* ── Nav: marcar página activa ────────────────────────────── */
  const path = window.location.pathname.replace(/\.html$/, '').replace(/\/$/, '') || '/';
  document.querySelectorAll('.nav-links a, .nav-drawer a').forEach(link => {
    const href = link.getAttribute('href').replace(/\.html$/, '').replace(/\/$/, '') || '/';
    if (href === path) link.classList.add('active');
  });

  /* ── Hero: rotación de taglines ───────────────────────────── */
  const taglineEl = document.querySelector('.hero-tagline span');
  if (taglineEl) {
    // Las taglines se cargan desde i18n; esperamos a que estén disponibles
    let taglines = [];
    let idx = 0;

    function rotatTagline() {
      // Leer taglines actualizadas desde el DOM o desde i18n
      const rawTaglines = taglineEl.closest('.hero-tagline')?.dataset?.taglines;
      if (rawTaglines) {
        try { taglines = JSON.parse(rawTaglines); } catch {}
      }
      if (!taglines.length) return;

      taglineEl.style.opacity = '0';
      taglineEl.style.transform = 'translateY(8px)';

      setTimeout(() => {
        idx = (idx + 1) % taglines.length;
        taglineEl.textContent = taglines[idx];
        taglineEl.style.opacity = '1';
        taglineEl.style.transform = 'translateY(0)';
      }, 400);
    }

    taglineEl.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
    setInterval(rotatTagline, 3500);
  }

  /* ── Marquee: duplicar para loop infinito ─────────────────── */
  const marqueeInner = document.querySelector('.marquee-inner');
  if (marqueeInner) {
    const clone = marqueeInner.cloneNode(true);
    marqueeInner.parentElement.appendChild(clone);
  }

  /* ── Lightbox ─────────────────────────────────────────────── */
  const lightbox = document.querySelector('.lightbox');
  const lightboxImg = document.querySelector('.lightbox-img');
  const lightboxClose = document.querySelector('.lightbox-close');

  if (lightbox && lightboxImg) {
    document.querySelectorAll('.gallery-item').forEach(item => {
      item.addEventListener('click', () => {
        const src = item.querySelector('img')?.src;
        const alt = item.querySelector('img')?.alt || '';
        if (!src) return;
        lightboxImg.src = src;
        lightboxImg.alt = alt;
        lightbox.classList.add('open');
        document.body.style.overflow = 'hidden';
      });
    });

    function closeLightbox() {
      lightbox.classList.remove('open');
      document.body.style.overflow = '';
    }

    lightboxClose?.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', e => {
      if (e.target === lightbox) closeLightbox();
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') closeLightbox();
    });
  }

  /* ── Reveal on scroll (IntersectionObserver) ──────────────── */
  const revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    revealEls.forEach(el => observer.observe(el));
  }

  /* ── Formularios: validación + envío vía Netlify Function ─── */
  initForm('form-contacto', '/api/send-contact');
  initForm('form-partners', '/api/send-partner');

  function initForm(formId, endpoint) {
    const form = document.getElementById(formId);
    if (!form) return;

    const emailInput = form.querySelector('[name="email"]');
    const emailConfirm = form.querySelector('[name="email_confirm"]');
    const submitBtn = form.querySelector('[type="submit"]');
    const successMsg = form.closest('.form-wrapper')?.querySelector('.form-success');

    // Bloquear paste en campo de confirmación
    emailConfirm?.addEventListener('paste', e => e.preventDefault());

    // Validación en tiempo real de coincidencia de emails
    emailConfirm?.addEventListener('input', () => {
      const error = emailConfirm.closest('.form-group')?.querySelector('.form-error');
      if (error) {
        const mismatch = emailInput?.value !== emailConfirm.value;
        error.classList.toggle('visible', mismatch);
      }
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Validar emails
      if (emailInput && emailConfirm && emailInput.value !== emailConfirm.value) {
        const error = emailConfirm.closest('.form-group')?.querySelector('.form-error');
        error?.classList.add('visible');
        emailConfirm.focus();
        return;
      }

      // Estado de carga
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Enviando...';
      }

      try {
        const data = Object.fromEntries(new FormData(form));
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });

        if (!res.ok) throw new Error('Error en el servidor');

        form.reset();
        form.style.display = 'none';
        if (successMsg) successMsg.classList.add('visible');

      } catch (err) {
        console.error(err);
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Intentar de nuevo';
        }
        alert('Hubo un error al enviar el mensaje. Por favor intenta de nuevo o escríbenos directamente.');
      }
    });
  }

});
