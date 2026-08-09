import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import ShopBrowser from "@/components/ShopBrowser";
import { PRODUCTS } from "@/lib/products";

export const metadata = { title: "Shop All — Elegance by Khadija" };

export default function ShopPage() {
  return (
    <div className="pg-shop eth">
      <Nav />

      <div className="page-head eth-page-head">
        <div className="eth-eyebrow">The full collection</div>
        <h1 className="eth-page-title">Every unstitched piece, in one place.</h1>
        <p className="eth-page-copy">
          Filter by fabric, category or price to find the piece that suits your
          tailor's next order.
        </p>
      </div>

      <ShopBrowser products={PRODUCTS} />

      <Footer />
    </div>
  );
}
