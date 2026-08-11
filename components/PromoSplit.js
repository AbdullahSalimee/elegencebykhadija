import Image from "next/image";
import Reveal from "@/components/Reveal";
import { getPromoBanners } from "@/lib/data/content";

// Two editorial banners side by side, stacking to one column on tablet down.
// Each reveals on its own short delay so the pair arrives in sequence rather
// than snapping in together.
export default async function PromoSplit() {
  const promos = await getPromoBanners();
  if (!promos.length) return null;

  return (
    <section className="eth-promos">
      {promos.map((promo, i) => (
        <Reveal key={promo.id} className="eth-promo-reveal" delay={i * 120}>
          {/* A banner without a CTA is still a banner, just not a link — so
              the wrapper switches to a plain div rather than an <a href> with
              nowhere to go. */}
          <PromoBody promo={promo} />
        </Reveal>
      ))}
    </section>
  );
}

function PromoBody({ promo }) {
  const Wrapper = promo.cta ? "a" : "div";
  const wrapperProps = promo.cta ? { href: promo.cta.href } : {};

  return (
    <Wrapper className="eth-promo" {...wrapperProps}>
      {promo.image && (
        <Image
          src={promo.image}
          alt=""
          fill
          sizes="(max-width: 900px) 100vw, 50vw"
          className="eth-promo-img"
        />
      )}
      <div className="eth-promo-scrim" />
      <div className="eth-promo-copy">
        <span className="eth-eyebrow">{promo.eyebrow}</span>
        <h2 className="eth-promo-title">{promo.title}</h2>
        <p className="eth-promo-body">{promo.body}</p>
        {promo.cta && (
          <span className="eth-btn eth-btn-light">{promo.cta.label}</span>
        )}
      </div>
    </Wrapper>
  );
}
