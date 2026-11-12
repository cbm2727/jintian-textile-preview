/* Cookie consent for Google Analytics (Consent Mode v2).
   Visitors in Europe see a small banner; analytics runs only after "Accept".
   Elsewhere analytics is on by default (set in each page's <head>). */
(function () {
    var KEY = 'cookie_consent';
    var T = {
        en: ['We use cookies to understand how visitors use our website and to improve it.', 'Accept', 'Decline', 'Cookies'],
        zh: ['我们使用 Cookie 了解访客如何使用本网站，以便改进网站。', '同意', '拒绝', 'Cookie 提示'],
        de: ['Wir verwenden Cookies, um zu verstehen, wie Besucher unsere Website nutzen, und um sie zu verbessern.', 'Akzeptieren', 'Ablehnen', 'Cookies'],
        fr: ['Nous utilisons des cookies pour comprendre comment les visiteurs utilisent notre site et l’améliorer.', 'Accepter', 'Refuser', 'Cookies'],
        ja: ['当サイトでは、ご利用状況を把握しサイトを改善するためにCookieを使用しています。', '同意する', '拒否する', 'Cookieについて'],
        es: ['Usamos cookies para entender cómo los visitantes usan nuestro sitio web y mejorarlo.', 'Aceptar', 'Rechazar', 'Cookies']
    };
    function get() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
    function set(v) { try { localStorage.setItem(KEY, v); } catch (e) {} }
    function inEurope() {
        try { return /^(Europe|Atlantic\/(Reykjavik|Canary|Madeira|Azores|Faroe))/.test(Intl.DateTimeFormat().resolvedOptions().timeZone || ''); }
        catch (e) { return true; }
    }
    function lang() {
        var l = (document.documentElement.getAttribute('lang') || '').slice(0, 2);
        if (!T[l]) { try { l = (localStorage.getItem('site_lang') || 'en').slice(0, 2); } catch (e) { l = 'en'; } }
        return T[l] ? l : 'en';
    }
    function choose(v) {
        set(v);
        if (typeof gtag === 'function') {
            gtag('consent', 'update', { analytics_storage: v === 'granted' ? 'granted' : 'denied' });
        }
        var b = document.getElementById('cookieBar');
        if (b) b.parentNode.removeChild(b);
    }
    function show() {
        var t = T[lang()];
        var b = document.createElement('div');
        b.id = 'cookieBar';
        b.className = 'cookie-bar';
        b.setAttribute('role', 'dialog');
        b.setAttribute('aria-live', 'polite');
        b.innerHTML = '<strong class="cookie-title"></strong><p></p><div class="cookie-btns"><button type="button" class="cookie-no"></button><button type="button" class="cookie-yes"></button></div>';
        b.querySelector('.cookie-title').textContent = t[3];
        b.querySelector('p').textContent = t[0];
        b.querySelector('.cookie-yes').textContent = t[1];
        b.querySelector('.cookie-no').textContent = t[2];
        b.querySelector('.cookie-yes').onclick = function () { preview ? b.parentNode.removeChild(b) : choose('granted'); };
        b.querySelector('.cookie-no').onclick = function () { preview ? b.parentNode.removeChild(b) : choose('denied'); };
        document.body.appendChild(b);
    }
    // ?cookie-preview=1 shows the banner anywhere, without saving a choice (for review only)
    var preview = /[?&]cookie-preview=1/.test(location.search);
    if (preview || (!get() && inEurope())) {
        if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', show); else show();
    }
})();
