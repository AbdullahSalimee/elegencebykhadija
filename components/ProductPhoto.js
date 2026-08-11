"use client";
import { useState } from "react";
import Image from "next/image";

// Product photography, tried in preference order:
//   1. product.image — the URL stored in the database, which is what the
//      admin's image upload writes. Real catalogue data wins.
//   2. public/products/<id>.<ext> — the filename convention the storefront was
//      built on, kept so seeded and demo products keep their photography
//      without needing a re-upload through the admin.
//   3. the striped text placeholder, so a half-photographed catalogue still
//      renders cleanly.
//
// Extensions are tried in order, so whatever the photographer hands over works
// without renaming. webp leads because that is what the catalogue ships — a
// miss costs a real 404 per image before the fallback resolves.
const EXTENSIONS = ["webp", "png", "jpg", "jpeg"];

export default function ProductPhoto({
  product: p,
  className = "",
  style,
  label,
  children,
  // Default matches the card grid (2 up on phones, 3 then 4 on wider
  // screens). Small fixed-size call sites pass their own — without it every
  // 64px cart thumbnail would be handed a grid-sized file.
  sizes = "(max-width: 700px) 50vw, (max-width: 1200px) 33vw, 25vw",
}) {
  const [attempt, setAttempt] = useState(0);

  // Cart lines can outlive the product they point at, so never assume one.
  const candidates = [
    p?.image,
    ...(p?.id ? EXTENSIONS.map((ext) => `/products/${p.id}.${ext}`) : []),
  ].filter(Boolean);
  const src = candidates[attempt];

  return (
    <div className={`plate ph ${className}`.trim()} style={style}>
      {!src ? (
        <span>{label ?? `${p?.name ?? "Product"} — product photo`}</span>
      ) : (
        // next/image so each context gets a right-sized file: the source
        // photography is 1084px wide, roughly triple what a two-up phone grid
        // actually needs. The class stays for the hover-zoom rule.
        <Image
          key={attempt}
          className="product-photo-img"
          src={src}
          alt={label ?? `${p.name} — ${p.fabric} ${p.pieces}`}
          fill
          sizes={sizes}
          onError={() => setAttempt((n) => n + 1)}
        />
      )}
      {children}
    </div>
  );
}
