import Image from "next/image";

export default function Hero() {
  return (
    <>
      <div className="hero">
        <div>
          <div className="tag tag-outline" style={{ marginBottom: 16 }}>Unstitched · New Season</div>
          <h1 className="hero-title">Unstitched. Unmatched.</h1>
          <p className="hero-copy">
            Premium lawn, karandi and silk suits cut from the finest mills — three metres of possibility, ready for your tailor to make entirely yours.
          </p>
          <div className="hero-actions">
            <a className="btn btn-primary" href="#products-anchor">Shop Unstitched Suits</a>
            <button className="btn btn-secondary">Fabric Guide</button>
          </div>
        </div>
        <div className="plate ph hero-photo" style={{ position: "relative" }}>
          <Image
            src="/hero1.webp"
            alt="hero photograph — model in unstitched lawn suit, studio"
            fill
            priority
            sizes="(max-width: 900px) 100vw, 50vw"
            style={{ objectFit: "cover" }}
          />
        </div>
      </div>
      <div className="hr section-rule" />
    </>
  );
}
