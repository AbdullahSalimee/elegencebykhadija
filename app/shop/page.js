import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import ShopBrowser from "@/components/ShopBrowser";
import { getProducts } from "@/lib/data/products";

export const metadata = { title: "Shop All — Elegance by Khadija" };
export const revalidate = 300;

const PAGE_SIZE = 24;

export default async function ShopPage() {
  const { products, total } = await getProducts({ sort: "newest", page: 1, pageSize: PAGE_SIZE });

  return (
    <div className="pg-shop">
      <Nav />

      <div className="page-head" style={{ padding: "48px 48px 0" }}>
        <div className="tag tag-outline" style={{ marginBottom: 16 }}>
          The full collection
        </div>
        <h1 style={{ fontSize: 44, maxWidth: "18ch" }}>
          Every unstitched piece, in one place.
        </h1>
        <p style={{ maxWidth: "54ch", fontSize: 16, opacity: 0.8 }}>
          Filter by fabric, category or price to find the piece that suits your
          tailor's next order.
        </p>
      </div>

      <ShopBrowser initialProducts={products} initialTotal={total} pageSize={PAGE_SIZE} />

      <Footer />
    </div>
  );
}
