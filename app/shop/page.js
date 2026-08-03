import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import ShopBrowser from "@/components/ShopBrowser";
import { PRODUCTS } from "@/lib/products";

export const metadata = { title: "Shop All — Elegance by Khadija" };

export default function ShopPage() {
  return (
    <div>
      <Nav />

      <div style={{ padding: "48px 48px 0" }}>
        <div className="tag tag-outline" style={{ marginBottom: 16 }}>
          The full collection
        </div>
        <h1 style={{ fontSize: 44, maxWidth: "18ch" }}>
          Every unstitched piece, in one place.
        </h1>
        <p style={{ maxWidth: "54ch", fontSize: 16, opacity: 0.8 }}>
          Filter by fabric, category or price to find the piece that suits
          your tailor's next order.
        </p>
      </div>

      <ShopBrowser products={PRODUCTS} />

      <Footer />
    </div>
  );
}
