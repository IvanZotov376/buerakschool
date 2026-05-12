// Единая настройка адреса Flask/Render API для GitHub Pages.
// Если адрес Render другой, поменяйте RENDER_API_URL ниже или выполните в консоли:
// localStorage.setItem('api_url', 'https://ВАШ-СЕРВИС.onrender.com')
(function () {
  'use strict';

  const RENDER_API_URL = 'https://buerakschool-api.onrender.com';
  const LOCAL_API_URL = 'http://127.0.0.1:5000';
  const nativeFetch = window.fetch ? window.fetch.bind(window) : null;

  function normalizeBase(value) {
    return String(value || '').trim().replace(/\/+$/, '');
  }

  function isLocalHost(hostname) {
    hostname = String(hostname || '').toLowerCase();
    return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '0.0.0.0';
  }

  function getBase() {
    try {
      const saved = normalizeBase(localStorage.getItem('api_url'));
      if (saved) return saved;
    } catch (e) {}

    const host = window.location.hostname || '';
    const port = window.location.port || '';

    if (port === '5000') return normalizeBase(window.location.origin);
    if (isLocalHost(host)) return LOCAL_API_URL;

    return normalizeBase(RENDER_API_URL);
  }

  function toApiUrl(path) {
    const value = String(path || '');
    if (!value) return getBase();
    if (value.startsWith('data:') || value.startsWith('blob:') || value.startsWith('mailto:') || value.startsWith('tel:')) return value;

    // Относительные API-запросы со статического GitHub Pages.
    if (value.startsWith('/api/')) return getBase() + value;
    if (value.startsWith('api/')) return getBase() + '/' + value;

    // Старые локальные адреса из проекта.
    if (/^https?:\/\/(127\.0\.0\.1|localhost|0\.0\.0\.0):5000\/api\//i.test(value)) {
      return value.replace(/^https?:\/\/(127\.0\.0\.1|localhost|0\.0\.0\.0):5000/i, getBase());
    }

    // Старый fallback мог собирать https://ivanzotov376.github.io:5000/api/...
    if (/^https?:\/\/[^/]+:5000\/api\//i.test(value)) {
      return value.replace(/^https?:\/\/[^/]+:5000/i, getBase());
    }

    // Если случайно ушло на GitHub Pages /api/..., тоже переводим на Render.
    if (/^https?:\/\/ivanzotov376\.github\.io\/api\//i.test(value)) {
      return value.replace(/^https?:\/\/ivanzotov376\.github\.io/i, getBase());
    }

    return value;
  }

  window.getSchoolApiBase = getBase;
  window.schoolApiUrl = toApiUrl;
  window.schoolApiFetch = function (path, options) {
    return nativeFetch(toApiUrl(path), Object.assign({ mode: 'cors' }, options || {}));
  };
  window.schoolAdminApiFetch = window.schoolAdminApiFetch || window.schoolApiFetch;

  // Главное исправление: даже старый код с fetch('/api/...') или host:5000
  // автоматически уходит на Render, без ручной правки каждого обработчика.
  if (nativeFetch && !window.__schoolApiFetchPatched) {
    window.__schoolApiFetchPatched = true;
    window.fetch = function (input, init) {
      try {
        if (typeof input === 'string') {
          return nativeFetch(toApiUrl(input), init);
        }
        if (input && input.url) {
          const fixedUrl = toApiUrl(input.url);
          if (fixedUrl !== input.url) {
            input = new Request(fixedUrl, input);
          }
        }
      } catch (e) {}
      return nativeFetch(input, init);
    };
  }

  try {
    if (!localStorage.getItem('api_url') && !isLocalHost(window.location.hostname) && window.location.port !== '5000') {
      localStorage.setItem('api_url', getBase());
    }
  } catch (e) {}

  window.addEventListener('error', function (event) {
    if (String(event.message || '').includes('Failed to fetch')) {
      console.warn('Проверьте адрес Render API:', getBase());
    }
  });
})();
