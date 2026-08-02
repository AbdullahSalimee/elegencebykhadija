"use client";
import { useCart } from "@/lib/cart-context";
import { getProductById } from "@/lib/products";
import { X, Minus, Plus } from "lucide-react";

export default function ProductModal() {
  const {
    activeProductId,
    closeProduct,
    activeColorId,
    setActiveColorId,
    activeQty,
    setActiveQty,
    addToCart,
  } = useCart();
  if (!activeProductId) return null;
  const p = getProductById(activeProductId);
  if (!p) return null;
  const waNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "923001234567";
  const waLink = `https://wa.me/${waNumber}?text=${encodeURIComponent("Hi, I would like to order: " + p.name)}`;

  return (
    <div className="dialog-backdrop" onClick={closeProduct}>
      <div
        style={{ width: "min(900px,92vw)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="dialog"
          style={{ width: "100%", padding: 0, overflow: "hidden" }}
        >
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
            <div className="plate ph" style={{ minHeight: 380 }}>
              <span>{p.name} — full product photo</span>
            </div>
            <div
              style={{
                padding: 28,
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              <button
                className="btn btn-icon"
                style={{ alignSelf: "flex-end" }}
                onClick={closeProduct}
                aria-label="Close"
              >
                <X size={16} strokeWidth={1.8} />
              </button>
              <div
                className="tag tag-outline"
                style={{ alignSelf: "flex-start" }}
              >
                {p.fabric}
              </div>
              <h3 style={{ fontSize: 24, margin: 0 }}>{p.name}</h3>
              <div style={{ fontSize: 13, opacity: 0.7 }}>
                {p.pieces} · Unstitched — one size, tailor to fit
              </div>
              <div style={{ fontSize: 18 }}>
                {p.compareAt && (
                  <span
                    style={{
                      textDecoration: "line-through",
                      opacity: 0.5,
                      marginRight: 8,
                    }}
                  >
                    Rs. {p.compareAt.toLocaleString()}
                  </span>
                )}
                <span
                  style={{ color: "var(--color-accent-700)", fontWeight: 700 }}
                >
                  Rs. {p.price.toLocaleString()}
                </span>
              </div>
              <div className="hr" style={{ margin: "6px 0" }} />
              <div
                style={{
                  fontSize: 12,
                  textTransform: "uppercase",
                  letterSpacing: ".05em",
                  opacity: 0.7,
                }}
              >
                Colourway
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                {p.colors.map((c) => (
                  <span
                    key={c.id}
                    className="swatch"
                    onClick={() => setActiveColorId(c.id)}
                    title={c.label}
                    style={{
                      background: c.hex,
                      width: 28,
                      height: 28,
                      boxShadow:
                        activeColorId === c.id
                          ? "0 0 0 2px var(--color-bg), 0 0 0 4px var(--color-accent)"
                          : "none",
                    }}
                  />
                ))}
              </div>
              <div
                style={{
                  fontSize: 12,
                  textTransform: "uppercase",
                  letterSpacing: ".05em",
                  opacity: 0.7,
                  marginTop: 8,
                }}
              >
                Quantity
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  className="btn btn-secondary qty-btn"
                  onClick={() => setActiveQty(Math.max(1, activeQty - 1))}
                >
                  <Minus size={14} strokeWidth={2} />
                </div>
                <div style={{ minWidth: 20, textAlign: "center" }}>
                  {activeQty}
                </div>
                <div
                  className="btn btn-secondary qty-btn"
                  onClick={() => setActiveQty(activeQty + 1)}
                >
                  <Plus size={14} strokeWidth={2} />
                </div>
              </div>
              <button
                className="btn btn-primary btn-block"
                onClick={() => addToCart(p.id, activeColorId, activeQty)}
              >
                Add to Cart
              </button>
              <a
                className="btn btn-secondary btn-block"
                href={waLink}
                target="_blank"
                rel="noopener"
              >
                Order via WhatsApp
              </a>
              <div style={{ fontSize: 12, opacity: 0.65, marginTop: 6 }}>
                Cash on Delivery available · Estimated delivery 3–7 days
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
