/* FAQ page: catalog request form.
 * Submissions go through FormSubmit (formsubmit.co): notification to may@, copy to fiona@,
 * plus an automatic confirmation to the customer in the language they are viewing. */
(function () {
    var FORM_ENDPOINT = "https://formsubmit.co/ajax/may@jintiantextile.com";
    var CC = "fiona@jintiantextile.com";
    var CONTACT = "may@jintiantextile.com / fiona@jintiantextile.com";

    var AUTOREPLY = {
        en: "Thank you for your interest in Qingdao Jintian Textile Co., Ltd. We have received your catalog request and will send you our latest catalog within 24 hours. If you have any questions or special requirements, please contact us at " + CONTACT + ".",
        zh: "感谢您关注青岛金田纺织有限公司。我们已收到您的产品目录请求,将在24小时内把最新产品目录发送给您。如有任何问题或特别要求,请联系 " + CONTACT + "。",
        de: "Vielen Dank für Ihr Interesse an Qingdao Jintian Textile Co., Ltd. Wir haben Ihre Kataloganfrage erhalten und senden Ihnen unseren aktuellen Katalog innerhalb von 24 Stunden. Bei Fragen oder besonderen Anforderungen erreichen Sie uns unter " + CONTACT + ".",
        fr: "Merci de l'intérêt que vous portez à Qingdao Jintian Textile Co., Ltd. Nous avons bien reçu votre demande de catalogue et vous enverrons notre dernier catalogue sous 24 heures. Pour toute question ou exigence particulière, contactez-nous à " + CONTACT + ".",
        ja: "青島金田紡織有限公司にご関心をお寄せいただき、ありがとうございます。カタログのご請求を承りました。24時間以内に最新カタログをお送りいたします。ご質問や特別なご要望がございましたら、" + CONTACT + " までご連絡ください。",
        es: "Gracias por su interés en Qingdao Jintian Textile Co., Ltd. Hemos recibido su solicitud de catálogo y le enviaremos nuestro catálogo más reciente en un plazo de 24 horas. Si tiene alguna pregunta o requisito especial, contáctenos en " + CONTACT + "."
    };
    var LANG_NAME = { en: "English", zh: "Chinese 中文", de: "German", fr: "French", ja: "Japanese", es: "Spanish" };

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
    function beijingTime() {
        try {
            return new Date().toLocaleString("zh-CN", { timeZone: "Asia/Shanghai", hour12: false }) + " (Beijing)";
        } catch (e) { return new Date().toISOString(); }
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
            headers: { "Content-Type": "application/json", "Accept": "application/json" },
            body: JSON.stringify({
                "email": value,
                "Request": "Latest catalog",
                "Language": LANG_NAME[l] || l,
                "Page": location.href,
                "Time": beijingTime(),
                "_subject": "New catalog request – chinocojintian.com – " + value,
                "_cc": CC,
                "_replyto": value,
                "_template": "table",
                "_captcha": "false",
                "_autoresponse": AUTOREPLY[l] || AUTOREPLY.en
            })
        }).then(function (r) {
            return r.json().then(function (data) {
                if (!r.ok || !(data.success === true || data.success === "true")) {
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
