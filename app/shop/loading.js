import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import ProductGridSkeleton from "@/components/skeletons/ProductGridSkeleton";

export default function ShopLoading() {
  return (
    <div className="pg-shop">
      <Nav />
      <ProductGridSkeleton count={12} gridClassName="shop-grid" />
      <Footer />
    </div>
  );
}
