"use client";
import { useState } from "react";

// Product photography, by filename convention: drop an image named after the
// product id into public/products/ (zarnaab.jpg) and it appears everywhere that
// product is rendered — grids, rows, modal, cart. No matching file and the
// striped placeholder stays exactly as it was, so a half-photographed catalogue
// still demos cleanly.
//
// Extensions are tried in order, so whatever the photographer hands over works
// without renaming. Once products come from the database this whole component
// collapses to <img src={product.image} />.
const EXTENSIONS = ["png", "jpg", "jpeg", "webp"];

export default function ProductPhoto({
  product: p,
  className = "",
  style,
  label,
  children,
}) {
  const [attempt, setAttempt] = useState(0);
  // Cart lines can outlive the product they point at, so never assume one.
  const exhausted = !p?.id || attempt >= EXTENSIONS.length;

  return (
    <div className={`plate ph ${className}`.trim()} style={style}>
      {exhausted ? (
        <span>{label ?? `${p?.name ?? "Product"} — product photo`}</span>
      ) : (
        <img
          key={attempt}
          className="product-photo-img"
          src={`/products/${p.id}.${EXTENSIONS[attempt]}`}
          alt={`${p.name} — ${p.fabric} ${p.pieces}`}
          onError={() => setAttempt((n) => n + 1)}
        />
      )}
      {children}
    </div>
  );
}
