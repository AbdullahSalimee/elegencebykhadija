"use client";
import { useState } from "react";
import Image from "next/image";

// Product photography, by filename convention: drop an image named after the
// product id into public/products/ (zarnaab.webp) and it appears everywhere
// that product is rendered — grids, rows, modal, cart. No matching file and the
// striped placeholder stays exactly as it was, so a half-photographed catalogue
// still demos cleanly.
//
// Extensions are tried in order, so whatever the photographer hands over works
// without renaming. webp leads because that is what the catalogue ships — a
// miss here costs a real 404 per image before the fallback resolves. Once
// products come from the database this whole component collapses to
// <img src={product.image} />.
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
  const exhausted = !p?.id || attempt >= EXTENSIONS.length;

  return (
    <div className={`plate ph ${className}`.trim()} style={style}>
      {exhausted ? (
        <span>{label ?? `${p?.name ?? "Product"} — product photo`}</span>
      ) : (
        // next/image so each context gets a right-sized file: the source
        // photography is 1084px wide, roughly triple what a two-up phone grid
        // actually needs. The class stays for the hover-zoom rule.
        <Image
          key={attempt}
          className="product-photo-img"
          src={`/products/${p.id}.${EXTENSIONS[attempt]}`}
          alt={`${p.name} — ${p.fabric} ${p.pieces}`}
          fill
          sizes={sizes}
          onError={() => setAttempt((n) => n + 1)}
        />
      )}
      {children}
    </div>
  );
}
