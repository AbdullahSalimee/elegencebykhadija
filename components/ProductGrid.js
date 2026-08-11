import { getProducts } from '@/lib/data/products';
import ProductCard from '@/components/ProductCard';

export default async function ProductGrid() {
  const { products } = await getProducts({ sort: 'newest', pageSize: 6 });
  return (
    <div id="products-anchor" className="section">
      <div className="section-head">
        <h2 className="section-title">Unstitched Suits</h2>
        <a href="/shop" style={{ fontSize: 13 }}>View all →</a>
      </div>
      <div className="eth-grid">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}
