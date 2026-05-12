
(function () {
  'use strict';

  const RENDER_API_URL = 'https://buerakschool.onrender.com';
  const LOCAL_API_URL = 'http://127.0.0.1:5000';

  function normalizeBase(value) {
    return String(value || '').trim().replace(/\/+$/, '');
  }

  function isLocalHost(hostname) {
    hostname = String(hostname || '').toLowerCase();
    return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '0.0.0.0';
  }

  function getBase() {
    const saved = normalizeBase(localStorage.getItem('api_url'));
    if (saved) return saved;

    const protocol = window.location.protocol;
    const host = window.location.hostname || '';
    const port = window.location.port || '';

    if ((protocol === 'http:' || protocol === 'https:') && port === '5000') {
      return normalizeBase(window.location.origin);
    }

    if (isLocalHost(host)) {
      return LOCAL_API_URL;
    }

    // GitHub Pages и обычный статический хостинг должны обращаться к Render.
    return normalizeBase(RENDER_API_URL);
  }

  window.getSchoolApiBase = getBase;
  window.schoolApiUrl = function (path) {
    const value = String(path || '');
    if (/^https?:\/\//i.test(value) || value.startsWith('data:') || value.startsWith('blob:')) return value;
    return getBase() + '/' + value.replace(/^\/+/, '');
  };
  window.schoolApiFetch = function (path, options) {
    return fetch(window.schoolApiUrl(path), Object.assign({ mode: 'cors' }, options || {}));
  };

  // Сохраняем адрес, чтобы старые участки кода, где используется localStorage.api_url,
  // тоже автоматически работали с Render.
  try {
    if (!localStorage.getItem('api_url') && !isLocalHost(window.location.hostname) && window.location.port !== '5000') {
      localStorage.setItem('api_url', getBase());
    }
  } catch (e) {}

  // Совместимость с уже существующими админскими загрузчиками.
  window.schoolAdminApiFetch = window.schoolAdminApiFetch || function (path, options) {
    return window.schoolApiFetch(path, options);
  };
})();
