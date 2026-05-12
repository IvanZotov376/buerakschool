(function () {
  'use strict';

  var STORAGE = {
    theme: 'a11y_theme',
    fontSize: 'a11y_fontSize',
    noEffects: 'a11y_noEffects',
    imageMode: 'a11y_imageMode'
  };

  var DEFAULTS = {
    theme: 'original',
    fontSize: '1',
    noEffects: false,
    imageMode: 'original'
  };

  function readSettings() {
    return {
      theme: localStorage.getItem(STORAGE.theme) || DEFAULTS.theme,
      fontSize: localStorage.getItem(STORAGE.fontSize) || DEFAULTS.fontSize,
      noEffects: localStorage.getItem(STORAGE.noEffects) === 'true',
      imageMode: localStorage.getItem(STORAGE.imageMode) || DEFAULTS.imageMode
    };
  }

  function saveSettings(settings) {
    localStorage.setItem(STORAGE.theme, settings.theme || DEFAULTS.theme);
    localStorage.setItem(STORAGE.fontSize, settings.fontSize || DEFAULTS.fontSize);
    localStorage.setItem(STORAGE.noEffects, settings.noEffects ? 'true' : 'false');
    localStorage.setItem(STORAGE.imageMode, settings.imageMode || DEFAULTS.imageMode);
  }

  function ensureStyles() {
    if (document.getElementById('global-a11y-styles')) return;
    var css = `
      html.font-size-1 { font-size: 100%; }
      html.font-size-2 { font-size: 112.5%; }
      html.font-size-3 { font-size: 125%; }
      html.font-size-4 { font-size: 137.5%; }

      body.no-effects,
      body.no-effects *,
      body.no-effects *::before,
      body.no-effects *::after {
        animation: none !important;
        transition: none !important;
        scroll-behavior: auto !important;
      }

      body.no-effects .header,
      body.no-effects #header-placeholder .header,
      body.no-effects .footer,
      body.no-effects #footer-placeholder .footer {
        background-size: auto !important;
      }

      body.image-grayscale img,
      body.image-grayscale picture,
      body.image-grayscale video,
      body.image-grayscale canvas,
      body.image-grayscale .user-avatar,
      body.image-grayscale [style*="background-image"] {
        filter: grayscale(1) !important;
      }

      body.image-hide img,
      body.image-hide picture,
      body.image-hide video,
      body.image-hide canvas,
      body.image-hide .gallery-item,
      body.image-hide .photo-card,
      body.image-hide .album-cover,
      body.image-hide .user-avatar,
      body.image-hide [style*="background-image"] {
        visibility: hidden !important;
      }

      body.dark-theme {
        background: #121212 !important;
        color: #e8e8e8 !important;
      }
      body.dark-theme .header,
      body.dark-theme #header-placeholder .header,
      body.dark-theme .footer,
      body.dark-theme #footer-placeholder .footer {
        background: #181818 !important;
        color: #f5f5f5 !important;
      }
      body.dark-theme .nav,
      body.dark-theme #header-placeholder .nav,
      body.dark-theme .accessibility-panel,
      body.dark-theme .dropdown,
      body.dark-theme .submenu {
        background: #242424 !important;
        color: #f2f2f2 !important;
        border-color: #3a3a3a !important;
      }
      body.dark-theme .menu a,
      body.dark-theme .dropdown a,
      body.dark-theme .submenu a,
      body.dark-theme .accessibility-panel label,
      body.dark-theme .accessibility-panel h4 {
        color: #f2f2f2 !important;
      }
      body.dark-theme .option-btn {
        background: #333 !important;
        color: #f2f2f2 !important;
        border-color: #555 !important;
      }
      body.dark-theme .option-btn.active {
        background: #4facfe !important;
        color: #111 !important;
        border-color: #4facfe !important;
      }
      body.dark-theme input,
      body.dark-theme textarea,
      body.dark-theme select,
      body.dark-theme table,
      body.dark-theme .card,
      body.dark-theme .page-card,
      body.dark-theme .contact-card,
      body.dark-theme .schedule-card,
      body.dark-theme .content-card,
      body.dark-theme .section,
      body.dark-theme .modal-content,
      body.dark-theme .message,
      body.dark-theme .dialog,
      body.dark-theme .journal-card {
        background-color: #1f1f1f !important;
        color: #f0f0f0 !important;
        border-color: #3a3a3a !important;
      }

      body.blue-theme {
        background: #e3f2fd !important;
        color: #0d47a1 !important;
      }
      body.blue-theme .header,
      body.blue-theme #header-placeholder .header,
      body.blue-theme .footer,
      body.blue-theme #footer-placeholder .footer {
        background: #1565c0 !important;
        color: #ffffff !important;
      }
      body.blue-theme .nav,
      body.blue-theme #header-placeholder .nav,
      body.blue-theme .accessibility-panel,
      body.blue-theme .dropdown,
      body.blue-theme .submenu {
        background: #bbdefb !important;
        color: #0d47a1 !important;
        border-color: #64b5f6 !important;
      }
      body.blue-theme .menu a,
      body.blue-theme .dropdown a,
      body.blue-theme .submenu a,
      body.blue-theme .accessibility-panel label,
      body.blue-theme .accessibility-panel h4 {
        color: #0d47a1 !important;
      }
      body.blue-theme .option-btn {
        background: #e3f2fd !important;
        color: #0d47a1 !important;
        border-color: #64b5f6 !important;
      }
      body.blue-theme .option-btn.active {
        background: #1565c0 !important;
        color: #ffffff !important;
        border-color: #1565c0 !important;
      }
      body.blue-theme input,
      body.blue-theme textarea,
      body.blue-theme select,
      body.blue-theme table,
      body.blue-theme .card,
      body.blue-theme .page-card,
      body.blue-theme .contact-card,
      body.blue-theme .schedule-card,
      body.blue-theme .content-card,
      body.blue-theme .section,
      body.blue-theme .modal-content,
      body.blue-theme .message,
      body.blue-theme .dialog,
      body.blue-theme .journal-card {
        background-color: #ffffff !important;
        color: #0d47a1 !important;
        border-color: #90caf9 !important;
      }

      .accessibility-panel .close-panel {
        position: absolute;
        top: 10px;
        right: 12px;
        border: 0;
        background: transparent;
        font-size: 26px;
        cursor: pointer;
        color: inherit;
      }
      .accessibility-panel .option-group { margin: 16px 0; }
      .accessibility-panel .option-buttons { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 8px; }
      .accessibility-panel .checkbox-group { display: flex; gap: 10px; align-items: center; margin-top: 8px; }
    `;
    var style = document.createElement('style');
    style.id = 'global-a11y-styles';
    style.textContent = css;
    document.head.appendChild(style);
  }

  function updateControls(settings) {
    document.querySelectorAll('[data-group="theme"] .option-btn').forEach(function (btn) {
      btn.classList.toggle('active', btn.dataset.value === settings.theme);
    });
    document.querySelectorAll('[data-group="fontSize"] .option-btn').forEach(function (btn) {
      btn.classList.toggle('active', btn.dataset.value === settings.fontSize);
    });
    document.querySelectorAll('[data-group="imageMode"] .option-btn').forEach(function (btn) {
      btn.classList.toggle('active', btn.dataset.value === settings.imageMode);
    });
    document.querySelectorAll('#noEffectsCheckbox').forEach(function (checkbox) {
      checkbox.checked = !!settings.noEffects;
    });
  }

  function applySettings(settings) {
    settings = settings || readSettings();
    ensureStyles();

    document.body.classList.remove('dark-theme', 'blue-theme', 'no-effects', 'image-grayscale', 'image-hide');
    document.documentElement.classList.remove('font-size-1', 'font-size-2', 'font-size-3', 'font-size-4');

    if (settings.theme === 'dark') document.body.classList.add('dark-theme');
    if (settings.theme === 'blue') document.body.classList.add('blue-theme');
    if (settings.noEffects) document.body.classList.add('no-effects');
    if (settings.imageMode === 'grayscale') document.body.classList.add('image-grayscale');
    if (settings.imageMode === 'hide') document.body.classList.add('image-hide');
    document.documentElement.classList.add('font-size-' + (settings.fontSize || '1'));

    updateControls(settings);
    return settings;
  }

  function closePanel() {
    var panel = document.getElementById('accessibilityPanel');
    var btn = document.getElementById('accessibilityBtn');
    if (panel) panel.classList.remove('active');
    if (btn) btn.classList.remove('active-icon');
  }

  function bindControls(root) {
    root = root || document;
    var panel = document.getElementById('accessibilityPanel');
    var toggle = document.getElementById('accessibilityBtn');
    var close = document.getElementById('closeAccessibilityPanel');

    if (toggle && !toggle.dataset.a11yBound) {
      toggle.dataset.a11yBound = '1';
      toggle.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        if (event.stopImmediatePropagation) event.stopImmediatePropagation();
        panel = document.getElementById('accessibilityPanel');
        if (!panel) return;
        panel.classList.toggle('active');
        toggle.classList.toggle('active-icon', panel.classList.contains('active'));
      }, true);
    }

    if (close && !close.dataset.a11yBound) {
      close.dataset.a11yBound = '1';
      close.addEventListener('click', function (event) {
        event.preventDefault();
        if (event.stopImmediatePropagation) event.stopImmediatePropagation();
        closePanel();
      });
    }

    root.querySelectorAll('[data-group="theme"] .option-btn, [data-group="fontSize"] .option-btn, [data-group="imageMode"] .option-btn').forEach(function (btn) {
      if (btn.dataset.a11yBound) return;
      btn.dataset.a11yBound = '1';
      btn.addEventListener('click', function (event) {
        event.preventDefault();
        var group = btn.closest('[data-group]');
        if (!group) return;
        var settings = readSettings();
        settings[group.dataset.group] = btn.dataset.value;
        saveSettings(settings);
        applySettings(settings);
      });
    });

    root.querySelectorAll('#noEffectsCheckbox').forEach(function (checkbox) {
      if (checkbox.dataset.a11yBound) return;
      checkbox.dataset.a11yBound = '1';
      checkbox.addEventListener('change', function () {
        var settings = readSettings();
        settings.noEffects = checkbox.checked;
        saveSettings(settings);
        applySettings(settings);
      });
    });

    applySettings();
  }

  window.applySettings = applySettings;
  window.applyAccessibilitySettings = applySettings;
  window.initAccessibilitySettings = bindControls;

  if (document.documentElement) {
    var initialFontSize = localStorage.getItem(STORAGE.fontSize) || DEFAULTS.fontSize;
    document.documentElement.classList.add('font-size-' + initialFontSize);
  }

  function start() {
    ensureStyles();
    applySettings();
    bindControls(document);
    document.addEventListener('click', function (event) {
      var panel = document.getElementById('accessibilityPanel');
      var btn = document.getElementById('accessibilityBtn');
      if (panel && panel.classList.contains('active') && !panel.contains(event.target) && event.target !== btn) {
        closePanel();
      }
    });
    new MutationObserver(function () { bindControls(document); }).observe(document.documentElement, { childList: true, subtree: true });
    window.addEventListener('storage', function (event) {
      if (Object.keys(STORAGE).indexOf(event.key) !== -1) applySettings();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
