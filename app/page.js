import Nav from "@/components/Nav";
import HeroCarousel from "@/components/HeroCarousel";
import ProductCarousel from "@/components/ProductCarousel";
import CollectionBanner from "@/components/CollectionBanner";
import PromoSplit from "@/components/PromoSplit";
import TrustStrip from "@/components/TrustStrip";
import Footer from "@/components/Footer";
import { COLLECTION_BLOCKS } from "@/lib/site-config";
import { getProducts } from "@/lib/data/products";

export const revalidate = 300;

export default async function HomePage() {
  const { products: newIn } = await getProducts({ sort: "newest", pageSize: 8 });

  return (
    <div className="pg-home eth">
      {/* Landing page only: the chrome floats over the hero photograph. */}
      <Nav overlay />
      <HeroCarousel />

      {/* Carousel first, then every collection block one after another.
          Each element reveals as it scrolls into view. */}
      <ProductCarousel title="Pret SS26 Vol II" products={newIn} />

      {COLLECTION_BLOCKS.map((block) => (
        <CollectionBanner key={block.id} block={block} />
      ))}

      <PromoSplit />
      <TrustStrip />

      <Footer />
    </div>
  );
}
