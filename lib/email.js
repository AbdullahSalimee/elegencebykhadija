import 'server-only';

// Transactional email via Resend (resend.com — generous free tier, dead
// simple API). Not core infrastructure like Supabase: if RESEND_API_KEY
// isn't set, or an order has no email on file (email is optional at
// checkout), this quietly no-ops instead of failing the order/status
// update that triggered it. Swap providers by rewriting sendEmail() below —
// every call site only knows about sendOrderConfirmationEmail /
// sendOrderStatusEmail, not Resend specifically.

let resendClient;
function getResend() {
  if (!process.env.RESEND_API_KEY) return null;
  if (!resendClient) {
    // Lazy require so apps that never configure email at all don't pay for it.
    const { Resend } = require('resend');
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }
  return resendClient;
}

const FROM = process.env.EMAIL_FROM || 'Elegance by Khadija <orders@elegancebykhadija.pk>';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

async function sendEmail({ to, subject, html }) {
  const resend = getResend();
  if (!resend || !to) {
    console.info(`[email] skipped "${subject}" (${!resend ? 'RESEND_API_KEY not set' : 'no recipient'})`);
    return { skipped: true };
  }
  try {
    await resend.emails.send({ from: FROM, to, subject, html });
    return { sent: true };
  } catch (err) {
    console.error('[email] send failed:', err.message);
    return { error: err.message };
  }
}

function wrapper(bodyHtml) {
  return `<div style="font-family: Georgia, 'Times New Roman', serif; max-width: 480px; margin: 0 auto; color: #201f1d;">${bodyHtml}</div>`;
}

export function sendOrderConfirmationEmail(order) {
  if (!order.email) return Promise.resolve({ skipped: true });
  const total = order.lines.reduce((s, l) => s + l.price * l.qty, 0);
  const lines = order.lines
    .map((l) => `<li>${l.qty} × ${l.productName} (${l.color}) — Rs. ${l.price.toLocaleString()}</li>`)
    .join('');
  return sendEmail({
    to: order.email,
    subject: `Order confirmed — ${order.id}`,
    html: wrapper(`
      <h2>Thank you, ${order.customer}!</h2>
      <p>Your order <strong>${order.id}</strong> has been received and is <strong>pending</strong> —
      we'll call to confirm before dispatch.</p>
      <ul>${lines}</ul>
      <p><strong>Total: Rs. ${total.toLocaleString()}</strong></p>
      <p>Track it anytime at <a href="${SITE_URL}/track">${SITE_URL}/track</a> with your order number and phone.</p>
    `),
  });
}

const STATUS_COPY = {
  confirmed: 'Your order has been confirmed and is being prepared.',
  dispatched: "Your order is on its way.",
  delivered: 'Your order has been delivered — we hope you love it.',
  returned: 'Your return has been processed.',
};

export function sendOrderStatusEmail(order) {
  if (!order.email) return Promise.resolve({ skipped: true });
  return sendEmail({
    to: order.email,
    subject: `Order ${order.id} — ${order.status}`,
    html: wrapper(`
      <h2>Hi ${order.customer},</h2>
      <p>${STATUS_COPY[order.status] || `Your order status is now "${order.status}".`}</p>
      <p>Track it anytime at <a href="${SITE_URL}/track">${SITE_URL}/track</a> with your order number and phone.</p>
    `),
  });
}
