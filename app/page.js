import AnnounceBar from "@/components/AnnounceBar";
import Nav from "@/components/Nav";
import HeroCarousel from "@/components/HeroCarousel";
import CategoryTiles from "@/components/CategoryTiles";
import ProductRail from "@/components/ProductRail";
import PromoSplit from "@/components/PromoSplit";
import TrustStrip from "@/components/TrustStrip";
import Footer from "@/components/Footer";

export default function HomePage() {
  return (
    <div className="pg-home eth">
      <AnnounceBar />
      <Nav />
      <HeroCarousel />
      <CategoryTiles />
      <ProductRail title="New Arrivals" href="/new-in" select="new" limit={6} />
      <PromoSplit />
      <ProductRail title="On Sale" href="/sale" select="sale" limit={6} />
      <TrustStrip />
      <Footer />
    </div>
  );
}
