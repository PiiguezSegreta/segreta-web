/**
 * Segreta — Sistema i18n
 * Carga el JSON de traducciones y actualiza todos los elementos
 * que tienen atributos data-i18n o data-i18n-placeholder.
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
 * Carga el JSON de traducciones para el idioma dado.
 */
async function loadTranslations(lang) {
  try {
    const res = await fetch(`/translations/${lang}.json`);
    if (!res.ok) throw new Error(`No se encontró ${lang}.json`);
    return await res.json();
  } catch (err) {
    console.warn(`i18n: fallback a "${DEFAULT}". Error:`, err.message);
    const res = await fetch(`/translations/${DEFAULT}.json`);
    return await res.json();
  }
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

  // Atributo lang del html
  document.documentElement.lang = currentLang;

  // Actualizar botones de idioma activo (por si quedan en alguna página)
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === currentLang);
  });

  // Actualizar select de idioma
  document.querySelectorAll('.lang-select').forEach(sel => {
    sel.value = currentLang;
  });
}

/**
 * Cambia el idioma, guarda en localStorage y re-aplica.
 */
async function setLang(lang) {
  if (!SUPPORTED.includes(lang)) return;
  currentLang = lang;
  localStorage.setItem(STORAGE_KEY, lang);
  translations = await loadTranslations(lang);
  applyTranslations();
}

/**
 * Inicializa i18n al cargar la página.
 */
async function initI18n() {
  currentLang = detectLang();
  translations = await loadTranslations(currentLang);
  applyTranslations();

  // Conectar botones de idioma (legacy)
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => setLang(btn.dataset.lang));
  });

  // Conectar select de idioma
  document.querySelectorAll('.lang-select').forEach(sel => {
    sel.addEventListener('change', () => setLang(sel.value));
  });
}

// Exposición global para uso inline
window.i18n = { setLang, getCurrentLang: () => currentLang };

document.addEventListener('DOMContentLoaded', initI18n);
