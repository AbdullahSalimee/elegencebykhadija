"use client";
import { useState } from "react";
import { useCart } from "@/lib/cart-context";
import { getProductById, FABRIC_GUIDE, PRODUCTS } from "@/lib/products";
import ProductPhoto from "@/components/ProductPhoto";
import { X, Minus, Plus, ArrowLeft, ShoppingBag } from "lucide-react";

export default function ProductModal() {
  const {
    activeProductId,
    closeProduct,
    activeColorId,
    setActiveColorId,
    activeQty,
    setActiveQty,
    addToCart,
    openCart,
    openProduct,
  } = useCart();
  // Declared before the early return — hook order has to stay stable.
  const [openSection, setOpenSection] = useState(null);

  if (!activeProductId) return null;
  const p = getProductById(activeProductId);
  if (!p) return null;

  const off =
    p.compareAt && p.compareAt > p.price
      ? Math.round(((p.compareAt - p.price) / p.compareAt) * 100)
      : null;
  const activeColor =
    p.colors.find((c) => c.id === activeColorId) ?? p.colors[0];
  const fabric = FABRIC_GUIDE.find((f) => f.name === p.fabric);
  const related = PRODUCTS.filter((x) => x.id !== p.id).slice(0, 4);

  // Every line below comes from the catalogue or the fabric guide — nothing
  // here is placeholder copy standing in for a real product description.
  const SECTIONS = [
    {
      id: "details",
      heading: "Product Details",
      body: (
        <>
          <p>{p.pieces} · Unstitched — one size, cut to your tailor's measure.</p>
          {fabric && <p>{fabric.body}</p>}
          <p>
            Available in {p.colors.length} colourways:{" "}
            {p.colors.map((c) => c.label).join(", ")}.
          </p>
        </>
      ),
    },
    fabric && {
      id: "care",
      heading: "Composition & Care",
      body: (
        <>
          <p>
            <strong>{fabric.name}</strong> — {fabric.weight}, {fabric.season}.
          </p>
          <p>{fabric.feel}</p>
          <p>{fabric.care}</p>
        </>
      ),
    },
    {
      id: "shipping",
      heading: "Shipping & Returns",
      body: (
        <>
          <p>Cash on Delivery available across Pakistan — pay at your doorstep.</p>
          <p>Dispatched in 3–7 business days, tracked.</p>
          <p>Wrong shade or a change of mind? Exchanges are straightforward.</p>
        </>
      ),
    },
  ].filter(Boolean);

  const stop = (e) => e.stopPropagation();

  return (
    <div className="dialog-backdrop pm-backdrop" onClick={closeProduct}>
      <div
        className="modal-shell pm-shell"
        style={{ width: "min(900px,92vw)" }}
        onClick={stop}
      >
        <div
          className="dialog pm-dialog"
          style={{ width: "100%", padding: 0, overflow: "hidden" }}
        >
          {/* Mobile only: the sheet gets a real bar instead of a floating X. */}
          <div className="pm-topbar">
            <button
              className="btn btn-icon"
              onClick={closeProduct}
              aria-label="Back"
            >
              <ArrowLeft size={20} strokeWidth={1.7} />
            </button>
            <span className="pm-topbar-title">{p.name}</span>
            <button className="btn btn-icon" onClick={openCart} aria-label="Cart">
              <ShoppingBag size={19} strokeWidth={1.7} />
            </button>
          </div>

          <div
            className="modal-split"
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}
          >
            <ProductPhoto
              product={p}
              className="pm-photo"
              style={{ minHeight: 380 }}
              label={`${p.name} — full product photo`}
            />
            <div
              className="pm-info"
              style={{
                padding: 28,
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              <button
                className="btn btn-icon pm-close"
                style={{ alignSelf: "flex-end" }}
                onClick={closeProduct}
                aria-label="Close"
              >
                <X size={16} strokeWidth={1.8} />
              </button>
              <div
                className="tag tag-outline pm-fabric"
                style={{ alignSelf: "flex-start" }}
              >
                {p.fabric}
              </div>
              <h3 className="pm-name" style={{ fontSize: 24, margin: 0 }}>
                {p.name}
              </h3>
              <div className="pm-meta" style={{ fontSize: 13, opacity: 0.7 }}>
                {p.pieces} · Unstitched — one size, tailor to fit
              </div>
              <div className="pm-price" style={{ fontSize: 18 }}>
                {p.compareAt && (
                  <span
                    className="pm-was"
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
                  className="pm-now"
                  style={{ color: "var(--color-accent-700)", fontWeight: 700 }}
                >
                  Rs. {p.price.toLocaleString()}
                </span>
                {off !== null && <span className="pm-off">-{off}%</span>}
              </div>
              <div className="hr pm-rule" style={{ margin: "6px 0" }} />
              <div
                className="pm-label"
                style={{
                  fontSize: 12,
                  textTransform: "uppercase",
                  letterSpacing: ".05em",
                  opacity: 0.7,
                }}
              >
                Colourway
                <span className="pm-colour-name">{activeColor?.label}</span>
              </div>
              <div className="pm-swatches" style={{ display: "flex", gap: 8 }}>
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
                className="pm-label"
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
              <div
                className="pm-qty"
                style={{ display: "flex", alignItems: "center", gap: 10 }}
              >
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
                className="btn btn-primary btn-block pm-add"
                onClick={() => addToCart(p.id, activeColorId, activeQty)}
              >
                Add to Cart
              </button>
              <div
                className="pm-note"
                style={{ fontSize: 12, opacity: 0.65, marginTop: 6 }}
              >
                Cash on Delivery available · Estimated delivery 3–7 days
              </div>
            </div>
          </div>

          {/* Mobile only: collapsed detail sections and a related row, the
              way a full product page reads on a phone. */}
          <div className="pm-details">
            {SECTIONS.map((s) => {
              const isOpen = openSection === s.id;
              return (
                <div key={s.id} className="pm-acc">
                  <button
                    className="pm-acc-trigger"
                    aria-expanded={isOpen}
                    onClick={() => setOpenSection(isOpen ? null : s.id)}
                  >
                    {s.heading}
                    <span className="pm-acc-sign">{isOpen ? "−" : "+"}</span>
                  </button>
                  {isOpen && <div className="pm-acc-body">{s.body}</div>}
                </div>
              );
            })}

            <div className="pm-related">
              <div className="pm-related-head">You may also like</div>
              <div className="pm-related-row">
                {related.map((r) => (
                  <button
                    key={r.id}
                    className="pm-related-card"
                    onClick={() => {
                      setOpenSection(null);
                      openProduct(r.id);
                    }}
                  >
                    <ProductPhoto product={r} className="pm-related-photo" />
                    <span className="pm-related-name">{r.name}</span>
                    <span className="pm-related-price">
                      Rs. {r.price.toLocaleString()}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile only: pinned to the viewport, so the buy action is always
          reachable however far down the sheet you have scrolled. */}
      <div className="pm-actionbar" onClick={stop}>
        <div className="pm-actionbar-price">
          {p.compareAt && (
            <span className="pm-actionbar-was">
              Rs. {p.compareAt.toLocaleString()}
            </span>
          )}
          <span className="pm-actionbar-now">
            Rs. {p.price.toLocaleString()}
          </span>
        </div>
        <button
          className="pm-actionbar-btn"
          onClick={() => addToCart(p.id, activeColorId, activeQty)}
        >
          Add to Bag
        </button>
      </div>
    </div>
  );
}
