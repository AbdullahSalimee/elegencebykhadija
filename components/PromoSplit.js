import Image from "next/image";
import { PROMO_BANNERS } from "@/lib/site-config";

// Two editorial banners side by side, stacking to one column on tablet down.
export default function PromoSplit() {
  return (
    <section className="eth-promos">
      {PROMO_BANNERS.map((promo) => (
        <a key={promo.id} className="eth-promo" href={promo.cta.href}>
          <Image
            src={promo.image}
            alt=""
            fill
            sizes="(max-width: 900px) 100vw, 50vw"
            className="eth-promo-img"
          />
          <div className="eth-promo-scrim" />
          <div className="eth-promo-copy">
            <span className="eth-eyebrow">{promo.eyebrow}</span>
            <h2 className="eth-promo-title">{promo.title}</h2>
            <p className="eth-promo-body">{promo.body}</p>
            <span className="eth-btn eth-btn-light">{promo.cta.label}</span>
          </div>
        </a>
      ))}
    </section>
  );
}
