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

  /* ── Cards: reveal al scrollear en touch — solo la card centrada activa ── */
  if (window.matchMedia('(hover: none)').matches) {
    const espCards = [...document.querySelectorAll('.esp-card')];
    const actCards = [...document.querySelectorAll('.activacion-card')];

    const activateCenter = (cards) => {
      if (!cards.length) return;
      const vh = window.innerHeight;
      const zoneTop = vh * 0.25;
      const zoneBot = vh * 0.75;
      let best = null, bestOverlap = 0;
      cards.forEach(card => {
        const r = card.getBoundingClientRect();
        const overlap = Math.max(0, Math.min(r.bottom, zoneBot) - Math.max(r.top, zoneTop));
        if (overlap > bestOverlap) { bestOverlap = overlap; best = card; }
      });
      cards.forEach(c => c.classList.toggle('is-active', c === best && bestOverlap > 0));
    };

    let rafId;
    const onScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        activateCenter(espCards);
        activateCenter(actCards);
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ── Almuerzo photos: lightbox on tap ────────────────────── */
  if (lightbox && lightboxImg) {
    document.querySelectorAll('.almuerzo-exp-photos img').forEach(img => {
      img.addEventListener('click', () => {
        lightboxImg.src = img.src;
        lightboxImg.alt = img.alt || '';
        lightbox.classList.add('open');
        document.body.style.overflow = 'hidden';
      });
    });
  }

  /* ── Nuestra Carta: toggle ────────────────────────────────── */
  const cartaToggle = document.getElementById('carta-toggle');
  const cartaCategorias = document.getElementById('carta-categorias');
  if (cartaToggle && cartaCategorias) {
    cartaToggle.addEventListener('click', () => {
      const isOpen = cartaCategorias.classList.toggle('open');
      cartaToggle.textContent = isOpen ? 'Cerrar carta' : 'Explorar Recomendaciones';
      if (isOpen) {
        cartaCategorias.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }

  /* ── Carta tracks: activar card centrada en scroll horizontal (touch) ── */
  if (window.matchMedia('(hover: none)').matches) {
    document.querySelectorAll('.carta-track').forEach(track => {
      const activateCenterCard = () => {
        const cards = [...track.querySelectorAll('.carta-item')];
        if (!cards.length) return;
        const trackRect = track.getBoundingClientRect();
        const zoneLeft = trackRect.left + trackRect.width * 0.15;
        const zoneRight = trackRect.left + trackRect.width * 0.85;
        let best = null, bestOverlap = 0;
        cards.forEach(card => {
          const r = card.getBoundingClientRect();
          const overlap = Math.max(0, Math.min(r.right, zoneRight) - Math.max(r.left, zoneLeft));
          if (overlap > bestOverlap) { bestOverlap = overlap; best = card; }
        });
        cards.forEach(c => c.classList.toggle('is-active', c === best && bestOverlap > 0));
      };

      let rafId;
      track.addEventListener('scroll', () => {
        cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(activateCenterCard);
      }, { passive: true });
      activateCenterCard();
    });
  }

  /* ── Botón flotante WhatsApp ──────────────────────────────── */
  (function() {
    const path = window.location.pathname;
    if (path === '/reservas' || path === '/reservas.html') return;

    const btn = document.createElement('a');
    btn.href = 'https://wa.me/56976301208';
    btn.target = '_blank';
    btn.rel = 'noopener noreferrer';
    btn.className = 'wa-float';
    btn.setAttribute('aria-label', 'Contactar por WhatsApp');
    btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="26" height="26"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>';
    document.body.appendChild(btn);

    let visible = false;
    const showBtn = () => {
      const should = window.scrollY > 300;
      if (should !== visible) {
        visible = should;
        btn.classList.toggle('wa-float--visible', visible);
      }
    };
    window.addEventListener('scroll', showBtn, { passive: true });
    showBtn();
  })();

  /* ── Reseñas Google Places ────────────────────────────────── */
  (async function loadReviews() {
    const grid    = document.getElementById('reviews-grid');
    const scoreEl = document.getElementById('reviews-score');
    const countEl = document.getElementById('reviews-count');
    if (!grid) return;

    try {
      const res = await fetch('/api/get-reviews');
      if (!res.ok) throw new Error('fetch failed');
      const data = await res.json();

      if (data.rating && scoreEl)
        scoreEl.textContent = Number(data.rating).toFixed(1);
      if (data.userRatingCount && countEl)
        countEl.textContent = '· ' + data.userRatingCount.toLocaleString('es-CL') + ' reseñas en Google';

      if (!data.reviews?.length) { grid.style.display = 'none'; return; }

      grid.innerHTML = data.reviews.map(r => {
        const stars = '★'.repeat(r.rating) + '☆'.repeat(5 - r.rating);
        const text  = r.text.length > 240
          ? r.text.slice(0, 240).trimEnd() + '…'
          : r.text;
        return `<div class="review-card">
          <div class="review-card-stars" aria-label="${r.rating} de 5 estrellas">${stars}</div>
          <p class="review-card-text">&ldquo;${text}&rdquo;</p>
          <div class="review-card-author">${r.author}${r.relativeTime ? ' · ' + r.relativeTime : ''}</div>
        </div>`;
      }).join('');

    } catch {
      grid.style.display = 'none';
    }
  })();

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
