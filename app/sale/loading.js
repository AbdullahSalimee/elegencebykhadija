import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import ProductGridSkeleton from "@/components/skeletons/ProductGridSkeleton";

export default function SaleLoading() {
  return (
    <div className="pg-sale" style={{ background: "var(--color-neutral-900)" }}>
      <Nav />
      <ProductGridSkeleton count={8} />
      <Footer />
    </div>
  );
}
