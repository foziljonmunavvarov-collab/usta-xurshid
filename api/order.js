// Vercel serverless funksiya: buyurtmani Telegramga yuboradi.
// Token va chat ID kodda emas, Vercel'dagi Environment Variables'da saqlanadi.

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  // Kelgan ma'lumotni tozalab, uzunligini cheklaymiz (spam va g'alati matnlardan himoya)
  const clean = (value, max) => String(value ?? '').trim().slice(0, max);

  const body = req.body || {};
  const service = clean(body.service, 100);
  const name = clean(body.name, 60);
  const phone = clean(body.phone, 20);
  const whenNeeded = clean(body.whenNeeded, 60);
  const estimatedDays = clean(body.estimatedDays, 10);

  // Majburiy maydonlar va telefon formatini tekshiramiz
  if (!service || !name || !phone) {
    return res.status(400).json({ ok: false, error: 'Maydonlar to\'liq emas' });
  }
  if (!/^[+\d\s()-]{7,20}$/.test(phone)) {
    return res.status(400).json({ ok: false, error: 'Telefon raqami noto\'g\'ri' });
  }

  const whenLine = whenNeeded ? `\nQachon kerak: ${whenNeeded}` : '';
  const durLine = estimatedDays ? `\nTaxminiy davomiylik: ${estimatedDays} kun` : '';
  const text = `Yangi buyurtma!\nXizmat: ${service}\nMijoz: ${name}\nTel: ${phone}${whenLine}${durLine}`;

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: process.env.TELEGRAM_CHAT_ID, text }),
      }
    );
    return res.status(response.ok ? 200 : 502).json({ ok: response.ok });
  } catch (e) {
    return res.status(502).json({ ok: false });
  }
}
