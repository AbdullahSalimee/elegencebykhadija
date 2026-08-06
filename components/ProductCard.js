'use client';
import Image from 'next/image';
import { useCart } from '@/lib/cart-context';

// The one interactive piece of every product grid (ProductGrid, NewInGrid,
// SaleGrid, ShopBrowser results): the click-to-open handler and the photo,
// which renders a real next/image once a product has image_url set, and
// falls back to today's text placeholder until real photography exists.
// Everything else in those grids is static markup and stays a Server
// Component — only this leaf needs to be "use client".

function Swatches({ colors }) {
  return (
    <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
      {colors.map((c) => (
        <span key={c.id} className="swatch" style={{ background: c.hex }} title={c.label} />
      ))}
    </div>
  );
}

function Photo({ product, className, style, sizes, children }) {
  return (
    <div className={`plate ph ${className || ''}`} style={style}>
      {product.image ? (
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes={sizes || '(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 25vw'}
          style={{ objectFit: 'cover' }}
        />
      ) : (
        <span>{product.name} — product photo</span>
      )}
      {children}
    </div>
  );
}

function PriceLine(props) {
  const { compareAt, price, color = 'var(--color-accent-700)', strikeColor, justify } = props;
  return (
    <div
      style={{
        marginTop: 6,
        fontSize: 15,
        display: justify ? 'flex' : undefined,
        justifyContent: justify ? 'space-between' : undefined,
        alignItems: justify ? 'baseline' : undefined,
      }}
    >
      {compareAt && (
        <span
          style={{
            textDecoration: 'line-through',
            opacity: 0.5,
            marginRight: justify ? 0 : 8,
            fontSize: justify ? 13 : undefined,
            color: strikeColor,
          }}
        >
          Rs. {compareAt.toLocaleString()}
        </span>
      )}
      <span style={{ color, fontWeight: 600, marginLeft: justify ? 'auto' : undefined }}>
        Rs. {price.toLocaleString()}
      </span>
    </div>
  );
}

export default function ProductCard({ product: p, variant = 'grid', index = 0, metaLine }) {
  const { openProduct } = useCart();
  const onClick = () => openProduct(p.id);
  const num = String(index + 1).padStart(2, '0');

  if (variant === 'newin') {
    return (
      <div className="card newin-card" style={{ cursor: 'pointer', padding: 0, border: 'none' }} onClick={onClick}>
        <div className="newin-photo-wrap">
          <Photo product={p} className="newin-photo" />
          <span className="newin-badge">New</span>
          <span className="newin-num">{num}</span>
          {p.compareAt && p.compareAt > p.price && <span className="newin-sale">Sale</span>}
        </div>
        <div style={{ padding: '10px 4px 2px' }}>
          <div className="newin-date">{metaLine}</div>
          <div className="card-title newin-title">{p.name}</div>
          <Swatches colors={p.colors} />
          <PriceLine compareAt={p.compareAt} price={p.price} justify />
        </div>
      </div>
    );
  }

  if (variant === 'sale') {
    return (
      <div className="card newin-card" style={{ cursor: 'pointer', padding: 0, border: 'none' }} onClick={onClick}>
        <div className="newin-photo-wrap">
          <Photo product={p} className="newin-photo" />
          <span className="sale-badge">{p.pct}% off</span>
          <span className="newin-num">{num}</span>
        </div>
        <div style={{ padding: '10px 4px 2px' }}>
          <div className="newin-date" style={{ color: 'var(--color-accent-300)' }}>{metaLine}</div>
          <div className="card-title newin-title" style={{ color: '#f7f2e9' }}>{p.name}</div>
          <Swatches colors={p.colors} />
          <PriceLine
            compareAt={p.compareAt}
            price={p.price}
            color="var(--color-accent-300)"
            strikeColor="#d8cfc0"
            justify
          />
        </div>
      </div>
    );
  }

  if (variant === 'shop') {
    const outOfStock = !p.colors.some((c) => c.stock > 0);
    return (
      <div className="card" style={{ cursor: 'pointer', padding: 0, border: 'none' }} onClick={onClick}>
        <Photo product={p} style={{ height: 420, position: 'relative' }}>
          {p.compareAt && p.compareAt > p.price && (
            <span
              className="tag"
              style={{ position: 'absolute', top: 10, left: 10, background: 'var(--color-accent-700)', color: '#fff' }}
            >
              Sale
            </span>
          )}
          {outOfStock && (
            <span className="stock-chip out" style={{ position: 'absolute', top: 10, right: 10 }}>
              Out of stock
            </span>
          )}
        </Photo>
        <div style={{ padding: '10px 2px' }}>
          <Swatches colors={p.colors} />
          <div className="card-title">{p.name}</div>
          <div className="card-meta">{p.fabric} · {p.pieces}</div>
          <PriceLine compareAt={p.compareAt} price={p.price} />
        </div>
      </div>
    );
  }

  // variant === 'grid' — the plain home-page ProductGrid card
  return (
    <div className="card" style={{ cursor: 'pointer', padding: 0, border: 'none' }} onClick={onClick}>
      <Photo product={p} className="product-photo" />
      <div style={{ padding: '6px 2px' }}>
        <Swatches colors={p.colors} />
        <div className="card-title">{p.name}</div>
        <div className="card-meta">{p.fabric} · {p.pieces}</div>
        <PriceLine compareAt={p.compareAt} price={p.price} />
      </div>
    </div>
  );
}
