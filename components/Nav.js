"use client";
import { useCart } from "@/lib/cart-context";
import { NAV_LINKS } from "@/lib/site-config";
import { Search, User, ShoppingBag } from "lucide-react";

export default function Nav() {
  const { cartCount, openCart } = useCart();
  return (
    <nav className="nav">
      <div className="nav-brand">
        ELEGANCE{" "}
        <span style={{ opacity: 0.55, fontStyle: "italic" }}>by Khadija</span>
      </div>
      {NAV_LINKS.sort((a, b) => a.order - b.order).map((link) => (
        <a key={link.id} href={link.href}>
          {link.label}
        </a>
      ))}
      <button className="btn btn-icon" aria-label="Search">
        <Search size={18} strokeWidth={1.8} />
      </button>
      <button className="btn btn-icon" aria-label="Account">
        <User size={18} strokeWidth={1.8} />
      </button>
      <button className="btn btn-icon" aria-label="Cart" onClick={openCart}>
        <ShoppingBag size={18} strokeWidth={1.8} />
        {cartCount > 0 && (
          <span
            style={{
              position: "absolute",
              top: -4,
              right: -4,
              background: "var(--color-accent)",
              color: "var(--color-bg)",
              fontSize: 10,
              width: 16,
              height: 16,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {cartCount}
          </span>
        )}
      </button>
    </nav>
  );
}
