import Reveal from "@/components/Reveal";
import { TRUST_ITEMS } from "@/lib/products";

// The four reassurances — COD, WhatsApp, delivery, exchanges. Each cell
// reveals on a stagger so they read left to right (top to bottom once the
// grid stacks) rather than appearing as one block.
export default function TrustStrip() {
  return (
    <div className="trust-strip">
      {TRUST_ITEMS.map((t, i) => (
        <Reveal key={t.title} className="trust-item" delay={i * 90}>
          <div className="trust-title">{t.title}</div>
          <div className="trust-body">{t.body}</div>
        </Reveal>
      ))}
    </div>
  );
}
