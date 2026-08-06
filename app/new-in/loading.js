import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import ProductGridSkeleton from "@/components/skeletons/ProductGridSkeleton";

export default function NewInLoading() {
  return (
    <div className="pg-new">
      <Nav />
      <ProductGridSkeleton count={8} />
      <Footer />
    </div>
  );
}
