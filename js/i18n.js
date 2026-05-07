/**
 * Segreta — Sistema i18n
 * Lee traducciones desde SEGRETA_TRANSLATIONS (js/translations.js).
 * Funciona tanto en file:// como en servidor HTTP — sin fetch.
 */

const SUPPORTED = ['es', 'en', 'pt', 'it'];
const DEFAULT   = 'es';
const STORAGE_KEY = 'segreta-lang';

let currentLang = DEFAULT;
let translations = {};

/**
 * Obtiene el idioma guardado o detecta el del navegador.
 */
function detectLang() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored && SUPPORTED.includes(stored)) return stored;
  const browser = (navigator.language || '').slice(0, 2).toLowerCase();
  return SUPPORTED.includes(browser) ? browser : DEFAULT;
}

/**
 * Carga las traducciones para el idioma dado desde el objeto global.
 */
function loadTranslations(lang) {
  if (typeof SEGRETA_TRANSLATIONS === 'undefined') {
    console.error('i18n: SEGRETA_TRANSLATIONS no está definido. Verifica que translations.js está cargado antes de i18n.js.');
    return SEGRETA_TRANSLATIONS?.[DEFAULT] || {};
  }
  return SEGRETA_TRANSLATIONS[lang] || SEGRETA_TRANSLATIONS[DEFAULT] || {};
}

/**
 * Resuelve una clave anidada con notación de punto.
 * Ejemplo: "home.hero_location" → translations.home.hero_location
 */
function resolve(key) {
  return key.split('.').reduce((obj, k) => (obj && obj[k] !== undefined ? obj[k] : null), translations);
}

/**
 * Aplica las traducciones a todos los elementos marcados en el DOM.
 */
function applyTranslations() {
  // Texto innerHTML
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    const val = resolve(key);
    if (val !== null) el.innerHTML = val;
  });

  // Placeholder (inputs)
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.dataset.i18nPlaceholder;
    const val = resolve(key);
    if (val !== null) el.placeholder = val;
  });

  // aria-label
  document.querySelectorAll('[data-i18n-aria]').forEach(el => {
    const key = el.dataset.i18nAria;
    const val = resolve(key);
    if (val !== null) el.setAttribute('aria-label', val);
  });

  // Hero taglines (array — actualiza data-taglines y el span visible)
  document.querySelectorAll('[data-i18n-taglines]').forEach(el => {
    const key = el.dataset.i18nTaglines;
    const val = resolve(key);
    if (Array.isArray(val) && val.length) {
      el.dataset.taglines = JSON.stringify(val);
      const span = el.querySelector('span');
      if (span) span.textContent = val[0];
    }
  });

  // Atributo lang del html
  document.documentElement.lang = currentLang;

  // Actualizar select de idioma
  document.querySelectorAll('.lang-select').forEach(sel => {
    sel.value = currentLang;
  });
}

/**
 * Cambia el idioma, guarda en localStorage y re-aplica.
 */
function setLang(lang) {
  if (!SUPPORTED.includes(lang)) return;
  currentLang = lang;
  localStorage.setItem(STORAGE_KEY, lang);
  translations = loadTranslations(lang);
  applyTranslations();
}

/**
 * Inicializa i18n al cargar la página.
 */
function initI18n() {
  currentLang = detectLang();
  translations = loadTranslations(currentLang);
  applyTranslations();

  // Conectar select de idioma
  document.querySelectorAll('.lang-select').forEach(sel => {
    sel.addEventListener('change', () => setLang(sel.value));
  });
}

// Exposición global para uso inline
window.i18n = { setLang, getCurrentLang: () => currentLang, t: (key) => resolve(key) || '' };

// Los scripts están al final del body — el DOM ya existe cuando este código corre.
// Usamos DOMContentLoaded como fallback por si acaso.
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initI18n);
} else {
  initI18n();
}
