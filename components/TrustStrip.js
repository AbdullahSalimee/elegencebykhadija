import { TRUST_ITEMS } from '@/lib/products';

export default function TrustStrip() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 1, background: 'var(--color-divider)', margin: '0 48px' }}>
      {TRUST_ITEMS.map((t) => (
        <div key={t.title} style={{ background: 'var(--color-bg)', padding: 20, textAlign: 'center' }}>
          <div style={{ fontSize: 11, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--color-accent)', marginBottom: 4 }}>{t.title}</div>
          <div style={{ fontSize: 13, opacity: .75 }}>{t.body}</div>
        </div>
      ))}
    </div>
  );
}
