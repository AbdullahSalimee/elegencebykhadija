import 'server-only';

// Transactional email. Two providers are supported, picked automatically from
// whatever is configured — Gmail first, because it needs no domain:
//
//   Gmail SMTP  (GMAIL_USER + GMAIL_APP_PASSWORD)
//     Sends to any recipient with no domain to verify. ~500/day. Customers see
//     your Gmail address as the sender. Set it up at
//     myaccount.google.com > Security > 2-Step Verification > App passwords.
//
//   Resend      (RESEND_API_KEY)
//     Needs a verified sending domain before it will deliver to anyone but
//     your own address — better for launch, useless before you own a domain.
//
// Neither configured, or an order with no email on file (it's optional at
// checkout), and this quietly no-ops rather than failing the order or status
// update that triggered it. Every call site only knows
// sendOrderConfirmationEmail / sendOrderStatusEmail, so swapping providers
// means editing sendEmail() and nothing else.

const GMAIL_USER = process.env.GMAIL_USER;
// App passwords are shown as "abcd efgh ijkl mnop" — the spaces are for
// reading, not part of the password, and pasting them as-is fails auth.
const GMAIL_PASS = (process.env.GMAIL_APP_PASSWORD || '').replace(/\s+/g, '');

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

// Gmail rewrites the From header to the authenticated account anyway, so with
// Gmail we only choose the display name and let the address follow the login.
function fromAddress() {
  if (GMAIL_USER && GMAIL_PASS) {
    const configured = process.env.EMAIL_FROM || '';
    const name = configured.match(/^\s*([^<]+?)\s*</)?.[1] || 'Elegance by Khadija';
    return `${name} <${GMAIL_USER}>`;
  }
  return process.env.EMAIL_FROM || 'Elegance by Khadija <onboarding@resend.dev>';
}

let transporter;
function getGmailTransport() {
  if (!GMAIL_USER || !GMAIL_PASS) return null;
  if (!transporter) {
    // Lazy require so an app with no email configured never loads it.
    const nodemailer = require('nodemailer');
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: GMAIL_USER, pass: GMAIL_PASS },
    });
  }
  return transporter;
}

let resendClient;
function getResend() {
  if (!process.env.RESEND_API_KEY) return null;
  if (!resendClient) {
    const { Resend } = require('resend');
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }
  return resendClient;
}

async function sendEmail({ to, subject, html }) {
  if (!to) {
    console.info(`[email] skipped "${subject}" (no recipient)`);
    return { skipped: true };
  }

  const from = fromAddress();
  const gmail = getGmailTransport();

  try {
    if (gmail) {
      await gmail.sendMail({ from, to, subject, html });
      console.info(`[email] sent "${subject}" to ${to} via Gmail`);
      return { sent: true };
    }

    const resend = getResend();
    if (!resend) {
      console.info(`[email] skipped "${subject}" (no email provider configured — set GMAIL_USER + GMAIL_APP_PASSWORD)`);
      return { skipped: true };
    }

    await resend.emails.send({ from, to, subject, html });
    console.info(`[email] sent "${subject}" to ${to} via Resend`);
    return { sent: true };
  } catch (err) {
    // Never rethrow: a dead mail provider must not fail an order that was
    // otherwise placed successfully.
    console.error(`[email] send failed for "${subject}" to ${to}:`, err.message);
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
