import { TRUST_ITEMS } from '@/lib/site-config';

export default function TrustStrip() {
  return (
    <div className="trust-strip">
      {TRUST_ITEMS.map((t) => (
        <div key={t.title} className="trust-item">
          <div className="trust-title">{t.title}</div>
          <div className="trust-body">{t.body}</div>
        </div>
      ))}
    </div>
  );
}
