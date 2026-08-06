import { MessageCircle } from "lucide-react";

// Sticky bottom-left WhatsApp button, storefront-wide. Plain server
// component — it's just a link built from a public env var, no interactivity
// needed. Rendered once in app/layout.js; hidden on /admin via the
// ".admin-shell ~ .whatsapp-float" CSS rule in globals.css rather than a
// pathname check, so no client JS is needed here either.
export default function WhatsAppFloat() {
  const waNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "923001234567";
  const waLink = `https://wa.me/${waNumber}?text=${encodeURIComponent(
    "Hi, I have a question about your suits.",
  )}`;

  return (
    <a
      href={waLink}
      target="_blank"
      rel="noopener"
      className="whatsapp-float icon-tooltip"
      data-tooltip="Chat on WhatsApp"
      aria-label="Chat with us on WhatsApp"
    >
      <MessageCircle size={26} strokeWidth={1.8} />
    </a>
  );
}
