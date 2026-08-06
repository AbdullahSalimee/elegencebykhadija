"use client";
import { useEffect, useState } from "react";
import { useCart } from "@/lib/cart-context";
import { useNavLinks } from "@/hooks/useSiteConfig";
import { Search, User, ShoppingBag, Menu, X } from "lucide-react";

export default function Nav() {
  const { cartCount, openCart } = useCart();
  const { navLinks } = useNavLinks();
  const [menuOpen, setMenuOpen] = useState(false);
  const links = [...navLinks].sort((a, b) => a.order - b.order);

  // Lock the page behind the drawer, and close on Escape.
  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => e.key === "Escape" && setMenuOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  return (
    <>
      <nav className="nav">
        <button
          className="btn btn-icon nav-toggle"
          aria-label="Open menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(true)}
        >
          <Menu size={20} strokeWidth={1.8} />
        </button>

        <div className="nav-brand">
          ELEGANCE{" "}
          <span style={{ opacity: 0.55, fontStyle: "italic" }}>by Khadija</span>
        </div>

        <div className="nav-links">
          {links.map((link) => (
            <a key={link.id} href={link.href}>
              {link.label}
            </a>
          ))}
        </div>

        <div className="nav-actions">
          <button className="btn btn-icon" aria-label="Search">
            <Search size={18} strokeWidth={1.8} />
          </button>
          <button className="btn btn-icon" aria-label="Account">
            <User size={18} strokeWidth={1.8} />
          </button>
          <button className="btn btn-icon" aria-label="Cart" onClick={openCart}>
            <ShoppingBag size={18} strokeWidth={1.8} />
            {cartCount > 0 && <span className="nav-cart-badge">{cartCount}</span>}
          </button>
        </div>
      </nav>

      {menuOpen && (
        <div className="nav-backdrop" onClick={() => setMenuOpen(false)} />
      )}

      <div
        className={`nav-drawer${menuOpen ? " nav-drawer-open" : ""}`}
        aria-hidden={!menuOpen}
      >
        <div className="nav-drawer-head">
          <div className="nav-brand" style={{ marginRight: 0 }}>
            ELEGANCE{" "}
            <span style={{ opacity: 0.55, fontStyle: "italic" }}>
              by Khadija
            </span>
          </div>
          <button
            className="btn btn-icon"
            aria-label="Close menu"
            tabIndex={menuOpen ? 0 : -1}
            onClick={() => setMenuOpen(false)}
          >
            <X size={20} strokeWidth={1.8} />
          </button>
        </div>
        {links.map((link) => (
          <a
            key={link.id}
            href={link.href}
            tabIndex={menuOpen ? 0 : -1}
            onClick={() => setMenuOpen(false)}
          >
            {link.label}
          </a>
        ))}
      </div>
    </>
  );
}
