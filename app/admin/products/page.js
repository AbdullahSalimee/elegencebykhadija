"use client";
import { useEffect, useRef, useState } from "react";
import { useProducts, apiCreateProduct, apiPatchProduct, apiDeleteProduct } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useSiteConfig";
import { Search, Plus, X, Trash2, ImagePlus } from "lucide-react";

const BLANK_COLOR = () => ({
  id: "c" + Math.random().toString(36).slice(2, 8),
  hex: "#8a4b3a",
  label: "",
  stock: 0,
});
const BLANK_PRODUCT = () => ({
  id: "p" + Math.random().toString(36).slice(2, 8),
  name: "",
  fabric: "Lawn",
  pieces: "3 Piece",
  price: 0,
  compareAt: null,
  category: "lawn",
  image: null, // data URL — swap for an uploaded file URL / CDN path once storage exists
  colors: [BLANK_COLOR()],
});

// Local state is seeded from the DB once (see the hydration effect below)
// so every keystroke stays instant; each handler also persists via the
// /api/products endpoints. Photo upload stays local-only (data URL preview,
// not persisted) — there's no image storage wired up yet.
export default function AdminProducts() {
  const { products: dbProducts, isLoading: productsLoading, mutate: mutateProducts } = useProducts({
    pageSize: 500,
  });
  const { categories } = useCategories();
  const [products, setProducts] = useState([]);
  const hydrated = useRef(false);
  useEffect(() => {
    if (!productsLoading && !hydrated.current) {
      setProducts(dbProducts.map((p) => ({ ...p, category: p.category || "lawn", image: p.image || null })));
      hydrated.current = true;
    }
  }, [productsLoading, dbProducts]);

  const [query, setQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [draft, setDraft] = useState(BLANK_PRODUCT());

  const updateStock = (productId, colorId, value) => {
    const stock = Math.max(0, Number(value) || 0);
    setProducts((prev) =>
      prev.map((p) =>
        p.id !== productId
          ? p
          : { ...p, colors: p.colors.map((c) => (c.id !== colorId ? c : { ...c, stock })) },
      ),
    );
    apiPatchProduct(productId, { variantStock: { variantId: colorId, stock } }).then(() => mutateProducts());
  };
  const updatePrice = (productId, value) => {
    const price = Math.max(0, Number(value) || 0);
    setProducts((prev) => prev.map((p) => (p.id !== productId ? p : { ...p, price })));
    apiPatchProduct(productId, { price }).then(() => mutateProducts());
  };
  const updateCategory = (productId, category) => {
    setProducts((prev) => prev.map((p) => (p.id !== productId ? p : { ...p, category })));
    apiPatchProduct(productId, { category }).then(() => mutateProducts());
  };
  const removeProduct = (productId) => {
    if (!confirm("Remove this product? This can't be undone.")) return;
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    apiDeleteProduct(productId).then(() => mutateProducts());
  };

  const replaceProductImage = (productId, file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () =>
      setProducts((prev) =>
        prev.map((p) =>
          p.id !== productId ? p : { ...p, image: reader.result },
        ),
      );
    reader.readAsDataURL(file);
  };

  const openAddModal = () => {
    setDraft(BLANK_PRODUCT());
    setShowAddModal(true);
  };
  const closeAddModal = () => setShowAddModal(false);

  const addDraftColor = () =>
    setDraft((d) => ({ ...d, colors: [...d.colors, BLANK_COLOR()] }));
  const removeDraftColor = (id) =>
    setDraft((d) => ({ ...d, colors: d.colors.filter((c) => c.id !== id) }));
  const updateDraftColor = (id, field, value) =>
    setDraft((d) => ({
      ...d,
      colors: d.colors.map((c) =>
        c.id !== id
          ? c
          : {
              ...c,
              [field]:
                field === "stock" ? Math.max(0, Number(value) || 0) : value,
            },
      ),
    }));

  const setDraftImage = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setDraft((d) => ({ ...d, image: reader.result }));
    reader.readAsDataURL(file);
  };
  const clearDraftImage = () => setDraft((d) => ({ ...d, image: null }));

  const saveDraft = () => {
    if (!draft.name.trim()) return;
    const toSave = { ...draft, price: Number(draft.price) || 0 };
    setProducts((prev) => [toSave, ...prev]);
    setShowAddModal(false);
    apiCreateProduct(toSave).then(() => mutateProducts());
  };

  const visible = products.filter(
    (p) =>
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.fabric.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div>
      <div className="admin-page-eyebrow">Catalogue</div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 8,
        }}
      >
        <h1 style={{ fontSize: 28 }}>Products &amp; Stock</h1>
        <button className="btn btn-primary" onClick={openAddModal}>
          <Plus size={15} strokeWidth={2} /> Add Product
        </button>
      </div>
      <p style={{ opacity: 0.7, marginBottom: 24, maxWidth: "60ch" }}>
        Stock lives on the variant, not the product — two customers can't
        oversell the same one-of-a-kind colourway. Edits here are local to this
        session; connect a real API to persist.
      </p>

      <div className="admin-filterbar">
        <div className="admin-search">
          <Search size={14} strokeWidth={1.8} style={{ opacity: 0.6 }} />
          <input
            placeholder="Search products or fabric…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {visible.map((p) => {
          const totalStock = p.colors.reduce((s, c) => s + c.stock, 0);
          return (
            <div key={p.id} className="panel" style={{ paddingBottom: 6 }}>
              <div
                className="admin-product-head"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: 6,
                  gap: 16,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    gap: 14,
                    alignItems: "center",
                    minWidth: 0,
                  }}
                >
                  <label
                    className="admin-thumb-upload"
                    title="Click to replace photo"
                  >
                    {p.image ? (
                      <img
                        src={p.image}
                        alt={p.name}
                        className="admin-thumb-img"
                      />
                    ) : (
                      <div
                        className="plate ph"
                        style={{ width: 56, height: 56, flex: "none" }}
                      >
                        <span style={{ fontSize: 7 }}>{p.name}</span>
                      </div>
                    )}
                    <div className="admin-thumb-overlay">
                      <ImagePlus size={14} strokeWidth={1.8} />
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={(e) =>
                        replaceProductImage(p.id, e.target.files?.[0])
                      }
                    />
                  </label>
                  <div style={{ minWidth: 0 }}>
                    <div className="panel-title" style={{ marginBottom: 2 }}>
                      {p.name}
                    </div>
                    <div className="card-meta">
                      {p.fabric} · {p.pieces} · {totalStock} pieces total
                    </div>
                  </div>
                </div>
                <div
                  className="admin-product-controls"
                  style={{ display: "flex", gap: 10, alignItems: "flex-end" }}
                >
                  <div className="field" style={{ width: 140 }}>
                    <label>Category</label>
                    <select
                      className="input select-native"
                      style={{ width: "100%" }}
                      value={p.category}
                      onChange={(e) => updateCategory(p.id, e.target.value)}
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="field" style={{ width: 130 }}>
                    <label>Price (Rs.)</label>
                    <input
                      className="input"
                      type="number"
                      value={p.price}
                      onChange={(e) => updatePrice(p.id, e.target.value)}
                    />
                  </div>
                  <button
                    className="btn btn-icon"
                    aria-label="Remove product"
                    onClick={() => removeProduct(p.id)}
                    style={{ color: "#8f2f3a" }}
                  >
                    <Trash2 size={15} strokeWidth={1.8} />
                  </button>
                </div>
              </div>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Colourway</th>
                    <th style={{ textAlign: "right" }}>Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {p.colors.map((c) => (
                    <tr key={c.id}>
                      <td>
                        <span className="variant-row">
                          <span
                            className="variant-swatch"
                            style={{ width: 16, height: 16, background: c.hex }}
                          />
                          {c.label}
                        </span>
                      </td>
                      <td className="num">
                        <div
                          className="stock-input-wrap"
                          style={{ justifyContent: "flex-end" }}
                        >
                          {c.stock === 0 && (
                            <span className="stock-chip out">Out of stock</span>
                          )}
                          {c.stock > 0 && c.stock <= 3 && (
                            <span className="stock-chip low">Low</span>
                          )}
                          <input
                            className="input stock-input"
                            type="number"
                            min="0"
                            value={c.stock}
                            onChange={(e) =>
                              updateStock(p.id, c.id, e.target.value)
                            }
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        })}
        {visible.length === 0 && (
          <div className="admin-empty panel">No products match "{query}".</div>
        )}
      </div>

      {showAddModal && (
        <div className="dialog-backdrop" onClick={closeAddModal}>
          <div onClick={(e) => e.stopPropagation()}>
            <div
              className="dialog"
              style={{
                width: "min(560px,92vw)",
                maxHeight: "86vh",
                overflow: "auto",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div className="dialog-title">Add Product</div>
                <button
                  className="btn btn-icon"
                  onClick={closeAddModal}
                  aria-label="Close"
                >
                  <X size={16} strokeWidth={1.8} />
                </button>
              </div>

              <div className="field">
                <label>Product photo</label>
                <label className="admin-upload-dropzone">
                  {draft.image ? (
                    <>
                      <img
                        src={draft.image}
                        alt="Product preview"
                        className="admin-upload-preview"
                      />
                      <button
                        type="button"
                        className="btn btn-icon admin-upload-clear"
                        onClick={(e) => {
                          e.preventDefault();
                          clearDraftImage();
                        }}
                        aria-label="Remove photo"
                      >
                        <X size={13} strokeWidth={2} />
                      </button>
                    </>
                  ) : (
                    <div className="admin-upload-empty">
                      <ImagePlus size={22} strokeWidth={1.6} />
                      <div style={{ fontSize: 13, marginTop: 6 }}>
                        Click to upload a photo
                      </div>
                      <div style={{ fontSize: 11.5, opacity: 0.6 }}>
                        PNG or JPG, one photo per product for now
                      </div>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={(e) => setDraftImage(e.target.files?.[0])}
                  />
                </label>
              </div>

              <div className="field">
                <label>Product name</label>
                <input
                  className="input"
                  value={draft.name}
                  onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                  placeholder="e.g. Noorbano"
                />
              </div>

              <div
                className="form-grid"
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                }}
              >
                <div className="field">
                  <label>Fabric</label>
                  <select
                    className="input select-native"
                    style={{ width: "100%" }}
                    value={draft.fabric}
                    onChange={(e) =>
                      setDraft({ ...draft, fabric: e.target.value })
                    }
                  >
                    <option>Lawn</option>
                    <option>Silk</option>
                    <option>Karandi</option>
                  </select>
                </div>
                <div className="field">
                  <label>Pieces</label>
                  <select
                    className="input select-native"
                    style={{ width: "100%" }}
                    value={draft.pieces}
                    onChange={(e) =>
                      setDraft({ ...draft, pieces: e.target.value })
                    }
                  >
                    <option>2 Piece</option>
                    <option>3 Piece</option>
                  </select>
                </div>
              </div>

              <div
                className="form-grid"
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                }}
              >
                <div className="field">
                  <label>Price (Rs.)</label>
                  <input
                    className="input"
                    type="number"
                    value={draft.price}
                    onChange={(e) =>
                      setDraft({ ...draft, price: e.target.value })
                    }
                  />
                </div>
                <div className="field">
                  <label>Category</label>
                  <select
                    className="input select-native"
                    style={{ width: "100%" }}
                    value={draft.category}
                    onChange={(e) =>
                      setDraft({ ...draft, category: e.target.value })
                    }
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="hr" style={{ margin: "4px 0" }} />
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    textTransform: "uppercase",
                    letterSpacing: ".05em",
                    opacity: 0.7,
                  }}
                >
                  Colourways
                </div>
                <button
                  className="btn-ghost"
                  onClick={addDraftColor}
                  style={{
                    fontSize: 13,
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <Plus size={13} strokeWidth={2} /> Add colourway
                </button>
              </div>

              {draft.colors.map((c) => (
                <div
                  key={c.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "36px 1fr 90px 28px",
                    gap: 8,
                    alignItems: "center",
                  }}
                >
                  <input
                    type="color"
                    value={c.hex}
                    onChange={(e) =>
                      updateDraftColor(c.id, "hex", e.target.value)
                    }
                    style={{
                      width: 32,
                      height: 32,
                      padding: 0,
                      border: "1px solid var(--color-divider)",
                      borderRadius: 6,
                      cursor: "pointer",
                    }}
                  />
                  <input
                    className="input"
                    placeholder="Colour name"
                    value={c.label}
                    onChange={(e) =>
                      updateDraftColor(c.id, "label", e.target.value)
                    }
                  />
                  <input
                    className="input"
                    type="number"
                    min="0"
                    placeholder="Stock"
                    value={c.stock}
                    onChange={(e) =>
                      updateDraftColor(c.id, "stock", e.target.value)
                    }
                  />
                  <button
                    className="btn btn-icon"
                    style={{ width: 28, height: 28 }}
                    onClick={() => removeDraftColor(c.id)}
                    disabled={draft.colors.length <= 1}
                    aria-label="Remove colourway"
                  >
                    <Trash2 size={13} strokeWidth={1.8} />
                  </button>
                </div>
              ))}

              <div className="dialog-actions">
                <button className="btn btn-secondary" onClick={closeAddModal}>
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  onClick={saveDraft}
                  disabled={!draft.name.trim()}
                >
                  Add Product
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
