export default function Hero() {
  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 36, padding: '56px 48px', alignItems: 'center' }}>
        <div>
          <div className="tag tag-outline" style={{ marginBottom: 16 }}>Unstitched · New Season</div>
          <h1 style={{ fontSize: 56, fontWeight: 400, maxWidth: '11ch' }}>Unstitched. Unmatched.</h1>
          <p style={{ maxWidth: '46ch', fontSize: 16, opacity: .85 }}>
            Premium lawn, karandi and silk suits cut from the finest mills — three metres of possibility, ready for your tailor to make entirely yours.
          </p>
          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            <a className="btn btn-primary" href="#products-anchor">Shop Unstitched Suits</a>
            <button className="btn btn-secondary">Fabric Guide</button>
          </div>
        </div>
        <div className="plate ph" style={{ height: 420 }}><img src="hero1.png" alt="hero photograph — model in unstitched lawn suit, studio" /> </div>
      </div>
      <div className="hr" style={{ margin: '0 48px' }} />
    </>
  );
}
