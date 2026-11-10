// Catalog request from faq.html -> email to sales via Resend.
// Needs the RESEND_API_KEY environment variable in Vercel (never put the key in this file).

const FROM = "Qingdao Jintian Textile <catalog@chinocojintian.com>";
const TO = ["may@jintiantextile.com", "fiona@jintiantextile.com"];
const ALLOWED_ORIGINS = ["https://chinocojintian.com", "https://www.chinocojintian.com"];
const SEND_AUTOREPLY = true;

const LANG_NAME = { en: "English", zh: "Chinese 中文", de: "German", fr: "French", ja: "Japanese", es: "Spanish" };
const CONTACT = "may@jintiantextile.com / fiona@jintiantextile.com";
const AUTOREPLY = {
  en: ["Your catalog request – Qingdao Jintian Textile", "Thank you for your interest in Qingdao Jintian Textile Co., Ltd. We have received your catalog request and will send you our latest catalog within 3 days. If you have any questions or special requirements, please contact us at " + CONTACT + "."],
  zh: ["您的产品目录请求 – 青岛金田纺织有限公司", "感谢您关注青岛金田纺织有限公司。我们已收到您的产品目录请求,将在3天内把最新产品目录发送给您。如有任何问题或特别要求,请联系 " + CONTACT + "。"],
  de: ["Ihre Kataloganfrage – Qingdao Jintian Textile", "Vielen Dank für Ihr Interesse an Qingdao Jintian Textile Co., Ltd. Wir haben Ihre Kataloganfrage erhalten und senden Ihnen unseren aktuellen Katalog innerhalb von 3 Tagen. Bei Fragen oder besonderen Anforderungen erreichen Sie uns unter " + CONTACT + "."],
  fr: ["Votre demande de catalogue – Qingdao Jintian Textile", "Merci de l'intérêt que vous portez à Qingdao Jintian Textile Co., Ltd. Nous avons bien reçu votre demande de catalogue et vous enverrons notre dernier catalogue sous 3 jours. Pour toute question ou exigence particulière, contactez-nous à " + CONTACT + "."],
  ja: ["カタログのご請求について – 青島金田紡織有限公司", "青島金田紡織有限公司にご関心をお寄せいただき、ありがとうございます。カタログのご請求を承りました。3日以内に最新カタログをお送りいたします。ご質問や特別なご要望がございましたら、" + CONTACT + " までご連絡ください。"],
  es: ["Su solicitud de catálogo – Qingdao Jintian Textile", "Gracias por su interés en Qingdao Jintian Textile Co., Ltd. Hemos recibido su solicitud de catálogo y le enviaremos nuestro catálogo más reciente en un plazo de 3 días. Si tiene alguna pregunta o requisito especial, contáctenos en " + CONTACT + "."],
};

const EMAIL_RE = /^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]{2,}$/;
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

async function send(payload) {
  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: "Bearer " + process.env.RESEND_API_KEY, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!r.ok) throw new Error("Resend " + r.status + ": " + (await r.text()).slice(0, 300));
}

module.exports = async (req, res) => {
  const origin = req.headers.origin || "";
  const allowed = ALLOWED_ORIGINS.includes(origin) || /^https:\/\/jintian-textile-[a-z0-9-]+\.vercel\.app$/.test(origin);
  if (allowed) res.setHeader("Access-Control-Allow-Origin", origin);
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Methods", "POST");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    return res.status(204).end();
  }
  if (req.method !== "POST") return res.status(405).json({ success: false });
  if (origin && !allowed) return res.status(403).json({ success: false });
  if (!process.env.RESEND_API_KEY) return res.status(500).json({ success: false, message: "not configured" });

  let body = req.body || {};
  if (typeof body === "string") { try { body = JSON.parse(body); } catch (e) { body = {}; } }
  const email = String(body.email || "").trim().slice(0, 200);
  const lang = LANG_NAME[body.language] ? body.language : "en";
  const page = String(body.page || "").slice(0, 300);

  if (body.company_website) return res.status(200).json({ success: true }); // bot trap
  if (!EMAIL_RE.test(email)) return res.status(400).json({ success: false, message: "invalid email" });

  const time = new Date().toLocaleString("zh-CN", { timeZone: "Asia/Shanghai", hour12: false }) + " (Beijing)";
  const rows = [["Customer email", email], ["Request", "Latest catalog"], ["Language", LANG_NAME[lang]], ["Page", page], ["Time", time]];
  const html =
    '<p style="font-family:Arial,sans-serif;font-size:15px">New catalog request from the website FAQ page. Reply to this email to answer the customer directly.</p>' +
    '<table cellpadding="8" style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:14px">' +
    rows.map(([k, v]) => '<tr><td style="border:1px solid #ddd;background:#f5f5f5;font-weight:bold">' + esc(k) + '</td><td style="border:1px solid #ddd">' + esc(v) + "</td></tr>").join("") +
    "</table>";

  try {
    await send({
      from: FROM,
      to: TO,
      reply_to: email,
      subject: "New catalog request – chinocojintian.com – " + email,
      html,
      text: rows.map(([k, v]) => k + ": " + v).join("\n"),
    });
  } catch (e) {
    console.error(e.message);
    return res.status(502).json({ success: false });
  }

  if (SEND_AUTOREPLY) {
    const [subject, text] = AUTOREPLY[lang];
    try {
      await send({
        from: FROM,
        to: [email],
        reply_to: TO[0],
        subject,
        text: text + "\n\nQingdao Jintian Textile Co., Ltd.\nhttps://chinocojintian.com",
        html: '<p style="font-family:Arial,sans-serif;font-size:15px;line-height:1.6">' + esc(text) +
          '</p><p style="font-family:Arial,sans-serif;font-size:14px;color:#555">Qingdao Jintian Textile Co., Ltd.<br><a href="https://chinocojintian.com">chinocojintian.com</a></p>',
      });
    } catch (e) {
      console.error("autoreply: " + e.message); // sales notification already sent; do not fail the request
    }
  }
  return res.status(200).json({ success: true });
};
