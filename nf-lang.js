/**
 * NF site language: localStorage nf_lang + ?lang=en|ru on load.
 * NFLang.apply(map) — map = { en: { key: 'text' }, ru: { key: 'text' } }; elements use data-i18n="key"
 */
(function () {
    'use strict';
    var K = 'nf_lang';

    function normalize(l) {
        l = String(l || '').toLowerCase().slice(0, 2);
        return l === 'ru' ? 'ru' : 'en';
    }

    function get() {
        try {
            var q = typeof window.location !== 'undefined' && window.location.search
                ? new URLSearchParams(window.location.search).get('lang')
                : null;
            if (q) return normalize(q);
        } catch (e) { /* ignore */ }
        try {
            return normalize(localStorage.getItem(K));
        } catch (e) {
            return 'en';
        }
    }

    function set(code, opts) {
        code = normalize(code);
        try {
            localStorage.setItem(K, code);
        } catch (e) { /* ignore */ }
        if (document.documentElement) document.documentElement.lang = code;
        if (opts && opts.map) apply(opts.map);
        if (opts && typeof opts.onSet === 'function') opts.onSet(code);
    }

    function apply(map) {
        if (!map) return;
        var lang = get();
        var bucket = map[lang] || map.en || {};
        function lookup(key) {
            var val = bucket[key];
            if (val == null && lang !== 'en') val = (map.en || {})[key];
            return val;
        }
        document.querySelectorAll('[data-i18n]').forEach(function (el) {
            var key = el.getAttribute('data-i18n');
            if (!key) return;
            var val = lookup(key);
            if (val != null) {
                if (el.tagName === 'TITLE') {
                    document.title = val;
                } else {
                    el.textContent = val;
                }
            }
        });
        document.querySelectorAll('[data-i18n-html]').forEach(function (el) {
            var key = el.getAttribute('data-i18n-html');
            if (!key) return;
            var val = lookup(key);
            if (val != null) el.innerHTML = val;
        });
        document.querySelectorAll('[data-i18n-placeholder]').forEach(function (el) {
            var key = el.getAttribute('data-i18n-placeholder');
            if (!key) return;
            var val = lookup(key);
            if (val != null) el.setAttribute('placeholder', val);
        });
        document.querySelectorAll('[data-i18n-aria-label]').forEach(function (el) {
            var key = el.getAttribute('data-i18n-aria-label');
            if (!key) return;
            var val = lookup(key);
            if (val != null) el.setAttribute('aria-label', val);
        });
    }

    function initUrlSync() {
        try {
            var q = new URLSearchParams(window.location.search).get('lang');
            if (q) {
                try {
                    localStorage.setItem(K, normalize(q));
                } catch (e2) { /* ignore */ }
            }
        } catch (e) { /* ignore */ }
        if (document.documentElement) document.documentElement.lang = get();
    }

    window.NFLang = { get: get, set: set, apply: apply, initUrlSync: initUrlSync };
    initUrlSync();
})();
