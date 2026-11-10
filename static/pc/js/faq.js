/* FAQ page: catalog request form.
 * Posts to /api/catalog (Vercel function, sends via Resend from catalog@chinocojintian.com):
 * notification to may@ and fiona@, plus a short confirmation to the customer. */
(function () {
    var FORM_ENDPOINT = "/api/catalog";

    var form = document.getElementById("catalogForm");
    if (!form) return;
    var email = document.getElementById("catalogEmail");
    var consent = document.getElementById("catalogConsent");
    var msg = document.getElementById("catalogMsg");
    var ok = document.getElementById("catalogOk");
    var btn = form.querySelector("button[type=submit]");

    function lang() { return document.documentElement.getAttribute("lang") || "en"; }
    function t(key) {
        var d = (window.TRANSLATIONS && TRANSLATIONS[lang()]) || {};
        return d[key] || (TRANSLATIONS.en && TRANSLATIONS.en[key]) || key;
    }
    function done() {
        form.hidden = true;
        ok.hidden = false;
    }

    if (/^(localhost|127\.0\.0\.1)$/.test(location.hostname)) {
        var note = document.createElement("div");
        note.className = "preview-note";
        note.textContent = "本地预览 · 提交会真的发送邮件";
        document.body.appendChild(note);
    }

    form.addEventListener("submit", function (e) {
        e.preventDefault();
        msg.textContent = "";
        var value = (email.value || "").trim();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) {
            msg.textContent = t("faq.cat.errEmail");
            email.focus();
            return;
        }
        if (!consent.checked) {
            msg.textContent = t("faq.cat.errConsent");
            return;
        }
        if (form.company_website.value) { done(); return; }   // bot trap: pretend success, send nothing

        var l = lang();
        var label = btn.textContent;
        btn.disabled = true;
        btn.textContent = "…";
        fetch(FORM_ENDPOINT, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: value, language: l, page: location.href, company_website: "" })
        }).then(function (r) {
            return r.json().catch(function () { return {}; }).then(function (data) {
                if (!r.ok || data.success !== true) {
                    throw new Error(data.message || r.status);
                }
                done();
            });
        }).catch(function (err) {
            if (window.console) console.warn("Catalog form:", err && err.message);
            msg.textContent = t("faq.cat.errSend");
            btn.textContent = label;
            btn.disabled = false;
        });
    });

    // Bottom button: jump to the form and focus the email field
    var cta = document.querySelector(".faq-cta-btn");
    if (cta) cta.addEventListener("click", function (e) {
        e.preventDefault();
        document.getElementById("catalog").scrollIntoView({ behavior: "smooth", block: "start" });
        if (!form.hidden) setTimeout(function () { email.focus({ preventScroll: true }); }, 400);
    });
})();
