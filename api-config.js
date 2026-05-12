(function () {
  'use strict';

  const RENDER_API_URL = 'https://buerakschool.onrender.com';
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

    if (value.startsWith('/api/')) return getBase() + value;
    if (value.startsWith('api/')) return getBase() + '/' + value;

    if (/^https?:\/\/(127\.0\.0\.1|localhost|0\.0\.0\.0):5000\/api\//i.test(value)) {
      return value.replace(/^https?:\/\/(127\.0\.0\.1|localhost|0\.0\.0\.0):5000/i, getBase());
    }

    if (/^https?:\/\/[^/]+:5000\/api\//i.test(value)) {
      return value.replace(/^https?:\/\/[^/]+:5000/i, getBase());
    }

    if (/^https?:\/\/ivanzotov376\.github\.io\/api\//i.test(value)) {
      return value.replace(/^https?:\/\/ivanzotov376\.github\.io/i, getBase());
    }

    return value;
  }

  window.getSchoolApiBase = getBase;
  window.schoolApiUrl = toApiUrl;
  window.schoolApiFetch = function (path, options) {
    if (!nativeFetch) throw new Error('Fetch API is not supported in this browser');
    return nativeFetch(toApiUrl(path), Object.assign({ mode: 'cors' }, options || {}));
  };
  window.schoolAdminApiFetch = window.schoolAdminApiFetch || window.schoolApiFetch;

  if (nativeFetch) {
    window.fetch = function (input, options) {
      if (typeof input === 'string') {
        return nativeFetch(toApiUrl(input), options);
      }
      if (input && input.url && typeof input.url === 'string') {
        const fixedUrl = toApiUrl(input.url);
        if (fixedUrl !== input.url) {
          input = new Request(fixedUrl, input);
        }
      }
      return nativeFetch(input, options);
    };
  }
})();
