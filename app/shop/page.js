import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import ShopBrowser from "@/components/ShopBrowser";
import { getProducts } from "@/lib/data/products";

export const metadata = { title: "Shop All — Elegance by Khadija" };
export const revalidate = 300;

const PAGE_SIZE = 24;

export default async function ShopPage({ searchParams }) {
  const q = searchParams?.q || "";
  const { products, total } = await getProducts({ sort: "newest", page: 1, pageSize: PAGE_SIZE, q });

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

      <ShopBrowser initialProducts={products} initialTotal={total} pageSize={PAGE_SIZE} initialQuery={q} />

      <Footer />
    </div>
  );
}
