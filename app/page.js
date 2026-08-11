import Nav from "@/components/Nav";
import HeroCarousel from "@/components/HeroCarousel";
import ProductCarousel from "@/components/ProductCarousel";
import CollectionBanner from "@/components/CollectionBanner";
import PromoSplit from "@/components/PromoSplit";
import TrustStrip from "@/components/TrustStrip";
import Footer from "@/components/Footer";
import { getProducts } from "@/lib/data/products";
import { getHeroSlides, getCollectionBlocks } from "@/lib/data/content";

export const revalidate = 300;

export default async function HomePage() {
  // Fetched together rather than in sequence — none of the four depends on
  // another, so waterfalling them would add three round trips to the slowest
  // page on the site.
  const [{ products: newIn }, heroSlides, collectionBlocks] = await Promise.all([
    getProducts({ sort: "newest", pageSize: 8 }),
    getHeroSlides(),
    getCollectionBlocks(),
  ]);

  return (
    <div className="pg-home eth">
      {/* Landing page only: the chrome floats over the hero photograph. */}
      <Nav overlay />
      <HeroCarousel slides={heroSlides} />

      {/* Carousel first, then every collection block one after another.
          Each element reveals as it scrolls into view. */}
      <ProductCarousel title="Pret SS26 Vol II" products={newIn} />

      {collectionBlocks.map((block) => (
        <CollectionBanner key={block.id} block={block} />
      ))}

      <PromoSplit />
      <TrustStrip />

      <Footer />
    </div>
  );
}
