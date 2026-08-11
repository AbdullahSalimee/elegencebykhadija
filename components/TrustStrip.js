import Reveal from "@/components/Reveal";
import { getTrustItems } from "@/lib/data/content";

// The four reassurances — COD, WhatsApp, delivery, exchanges. Each cell
// reveals on a stagger so they read left to right (top to bottom once the
// grid stacks) rather than appearing as one block.
export default async function TrustStrip() {
  const items = await getTrustItems();
  if (!items.length) return null;

  return (
    <div className="trust-strip">
      {items.map((t, i) => (
        <Reveal key={t.id} className="trust-item" delay={i * 90}>
          <div className="trust-title">{t.title}</div>
          <div className="trust-body">{t.body}</div>
        </Reveal>
      ))}
    </div>
  );
}
