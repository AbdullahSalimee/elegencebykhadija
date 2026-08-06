"use client";
import Image from "next/image";
import { useCart } from "@/lib/cart-context";
import { X, Minus, Plus } from "lucide-react";

export default function CartDrawer() {
  const {
    cartOpen,
    closeCart,
    cartLines,
    cartCount,
    cartSubtotal,
    incLine,
    decLine,
    removeLine,
    openCheckout,
  } = useCart();
  if (!cartOpen) return null;
  return (
    <div
      className="dialog-backdrop"
      style={{ justifyContent: "flex-end", padding: 0 }}
      onClick={closeCart}
    >
      <div style={{ height: "100%" }} onClick={(e) => e.stopPropagation()}>
        <div
          style={{
            background: "var(--color-bg)",
            color: "var(--color-text)",
            width: "min(420px,92vw)",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            padding: 24,
            boxShadow: "var(--shadow-lg)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <h3 style={{ margin: 0 }}>Your Cart ({cartCount})</h3>
            <button
              className="btn btn-icon"
              onClick={closeCart}
              aria-label="Close"
            >
              <X size={16} strokeWidth={1.8} />
            </button>
          </div>
          <div className="hr" />
          {cartLines.length > 0 ? (
            <>
              <div
                style={{
                  flex: 1,
                  overflow: "auto",
                  display: "flex",
                  flexDirection: "column",
                  gap: 14,
                }}
              >
                {cartLines.map((line, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "64px 1fr auto",
                      gap: 12,
                      alignItems: "center",
                    }}
                  >
                    <div className="plate ph" style={{ width: 64, height: 64, position: "relative" }}>
                      {line.product?.image ? (
                        <Image src={line.product.image} alt={line.product.name} fill sizes="64px" style={{ objectFit: "cover" }} />
                      ) : (
                        <span style={{ fontSize: 8 }}>{line.product?.name}</span>
                      )}
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600 }}>
                        {line.product?.name}
                      </div>
                      <div style={{ fontSize: 12, opacity: 0.65 }}>
                        {line.color?.label}
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          marginTop: 4,
                        }}
                      >
                        <div
                          className="btn btn-secondary qty-btn"
                          style={{ width: 22, height: 22 }}
                          onClick={() => decLine(idx)}
                        >
                          <Minus size={12} strokeWidth={2} />
                        </div>
                        <span style={{ fontSize: 13 }}>{line.qty}</span>
                        <div
                          className="btn btn-secondary qty-btn"
                          style={{ width: 22, height: 22 }}
                          onClick={() => incLine(idx)}
                        >
                          <Plus size={12} strokeWidth={2} />
                        </div>
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 14 }}>
                        Rs. {line.lineTotal.toLocaleString()}
                      </div>
                      <button
                        className="btn btn-ghost"
                        style={{ fontSize: 11, padding: "2px 0" }}
                        onClick={() => removeLine(idx)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="hr" />
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 15,
                  marginBottom: 12,
                }}
              >
                <span>Subtotal</span>
                <span style={{ fontWeight: 700 }}>
                  Rs. {cartSubtotal.toLocaleString()}
                </span>
              </div>
              <button
                className="btn btn-primary btn-block"
                onClick={openCheckout}
              >
                Proceed to Checkout
              </button>
            </>
          ) : (
            <div
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                opacity: 0.6,
                fontSize: 14,
              }}
            >
              Your cart is empty.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
