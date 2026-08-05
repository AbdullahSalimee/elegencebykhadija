"use client";
import { useMemo, useState, useRef, useEffect } from "react";
import { useCart } from "@/lib/cart-context";
import { CATEGORIES } from "@/lib/site-config";
import { SlidersHorizontal, X, ChevronDown, Grid2x2, Grid3x3, LayoutGrid } from "lucide-react";

const FABRICS = ["Lawn", "Silk", "Karandi"];
const PIECE_OPTIONS = ["2 Piece", "3 Piece"];
const SORTS = [
  { id: "newest", label: "Newest arrivals" },
  { id: "price-asc", label: "Price: Low to High" },
  { id: "price-desc", label: "Price: High to Low" },
  { id: "name", label: "Name: A–Z" },
];
const PRICE_MAX = 12000;

function categoryFromFabric(fabric) {
  // Products don't carry a `category` field in the seed data — infer it the
  // same way the admin catalogue does, from fabric name, so filters line up
  // with lib/site-config.js CATEGORIES (lawn / silk / karandi).
  return fabric.toLowerCase();
}

export default function ShopBrowser({ products }) {
  const { openProduct } = useCart();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [fabrics, setFabrics] = useState([]);
  const [pieces, setPieces] = useState([]);
  const [maxPrice, setMaxPrice] = useState(PRICE_MAX);
  const [onSaleOnly, setOnSaleOnly] = useState(false);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sort, setSort] = useState("newest");
  const [sortOpen, setSortOpen] = useState(false);
  const sortRef = useRef(null);
  const [gridCols, setGridCols] = useState(4);

  useEffect(() => {
    const handleClick = (e) => {
      if (sortRef.current && !sortRef.current.contains(e.target)) setSortOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const toggle = (list, setList, value) =>
    setList(
      list.includes(value) ? list.filter((v) => v !== value) : [...list, value],
    );

  const clearAll = () => {
    setCategories([]);
    setFabrics([]);
    setPieces([]);
    setMaxPrice(PRICE_MAX);
    setOnSaleOnly(false);
    setInStockOnly(false);
  };

  const activeFilterCount =
    categories.length +
    fabrics.length +
    pieces.length +
    (maxPrice < PRICE_MAX ? 1 : 0) +
    (onSaleOnly ? 1 : 0) +
    (inStockOnly ? 1 : 0);

  const filtered = useMemo(() => {
    let list = products.filter((p) => {
      const cat = categoryFromFabric(p.fabric);
      if (categories.length && !categories.includes(cat)) return false;
      if (fabrics.length && !fabrics.includes(p.fabric)) return false;
      if (pieces.length && !pieces.includes(p.pieces)) return false;
      if (p.price > maxPrice) return false;
      if (onSaleOnly && !(p.compareAt && p.compareAt > p.price)) return false;
      if (inStockOnly && !p.colors.some((c) => c.stock > 0)) return false;
      return true;
    });

    switch (sort) {
      case "price-asc":
        list = [...list].sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        list = [...list].sort((a, b) => b.price - a.price);
        break;
      case "name":
        list = [...list].sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        list = [...list].sort((a, b) => b.arrivedAt.localeCompare(a.arrivedAt));
    }
    return list;
  }, [products, categories, fabrics, pieces, maxPrice, onSaleOnly, inStockOnly, sort]);

  return (
    <div className="page-body" style={{ padding: "24px 48px 64px" }}>
      <div className="shop-topbar">
        <button
          className="btn btn-secondary shop-filter-toggle"
          onClick={() => setMobileFiltersOpen(true)}
        >
          <SlidersHorizontal size={14} strokeWidth={1.8} />
          Filters
          {activeFilterCount > 0 && (
            <span className="shop-filter-count">{activeFilterCount}</span>
          )}
        </button>

        <div style={{ fontSize: 13, opacity: 0.65 }}>
          {filtered.length} of {products.length} pieces
        </div>

        <div ref={sortRef} style={{ position: "relative", marginLeft: "auto" }}>
          <button
            onClick={() => setSortOpen((v) => !v)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              font: "inherit",
              fontSize: 13,
              padding: "8px 30px 8px 12px",
              border: "1px solid var(--color-divider)",
              borderRadius: "var(--radius-md)",
              background: "var(--color-bg)",
              cursor: "pointer",
              color: "inherit",
              whiteSpace: "nowrap",
            }}
          >
            {SORTS.find((s) => s.id === sort)?.label}
          </button>
          <ChevronDown size={14} style={{ position: "absolute", right: 9, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", opacity: 0.55 }} />
          {sortOpen && (
            <div
              style={{
                position: "absolute",
                top: "100%",
                right: 0,
                marginTop: 4,
                minWidth: 180,
                background: "var(--color-bg)",
                border: "1px solid var(--color-divider)",
                borderRadius: "var(--radius-md)",
                boxShadow: "var(--shadow-md)",
                zIndex: 50,
                overflow: "hidden",
              }}
            >
              {SORTS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => { setSort(s.id); setSortOpen(false); }}
                  style={{
                    display: "block",
                    width: "100%",
                    textAlign: "left",
                    font: "inherit",
                    fontSize: 13,
                    padding: "9px 14px",
                    border: "none",
                    background: sort === s.id ? "color-mix(in srgb, var(--color-accent) 10%, transparent)" : "transparent",
                    color: sort === s.id ? "var(--color-accent-700)" : "inherit",
                    cursor: "pointer",
                  }}
                >
                  {s.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="shop-grid-toggle">
          {[
            { cols: 2, Icon: Grid2x2 },
            { cols: 3, Icon: Grid3x3 },
            { cols: 4, Icon: LayoutGrid },
          ].map(({ cols, Icon }) => (
            <button
              key={cols}
              onClick={() => setGridCols(cols)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 32,
                height: 32,
                border: "1px solid",
                borderColor: gridCols === cols ? "var(--color-accent-700)" : "var(--color-neutral-300)",
                borderRadius: 6,
                background: gridCols === cols ? "var(--color-accent-700)" : "transparent",
                color: gridCols === cols ? "#fff" : "inherit",
                cursor: "pointer",
                transition: "all .15s ease",
              }}
              aria-label={`${cols} columns`}
            >
              <Icon size={15} strokeWidth={1.8} />
            </button>
          ))}
        </div>

      </div>

      <div className="shop-layout">
        <aside
          className={`shop-sidebar${mobileFiltersOpen ? " shop-sidebar-open" : ""}`}
        >
          <div className="shop-sidebar-head">
            <div className="panel-title">Filters</div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {activeFilterCount > 0 && (
                <button className="btn-ghost" style={{ fontSize: 12.5 }} onClick={clearAll}>
                  Clear all
                </button>
              )}
              <button
                className="btn btn-icon shop-sidebar-close"
                onClick={() => setMobileFiltersOpen(false)}
                aria-label="Close filters"
              >
                <X size={16} strokeWidth={1.8} />
              </button>
            </div>
          </div>

          <FilterGroup title="Category">
            {CATEGORIES.map((c) => (
              <CheckRow
                key={c.id}
                label={c.label}
                checked={categories.includes(c.id)}
                onChange={() => toggle(categories, setCategories, c.id)}
                count={products.filter((p) => categoryFromFabric(p.fabric) === c.id).length}
              />
            ))}
          </FilterGroup>

          <FilterGroup title="Fabric">
            {FABRICS.map((f) => (
              <CheckRow
                key={f}
                label={f}
                checked={fabrics.includes(f)}
                onChange={() => toggle(fabrics, setFabrics, f)}
                count={products.filter((p) => p.fabric === f).length}
              />
            ))}
          </FilterGroup>

          <FilterGroup title="Pieces">
            {PIECE_OPTIONS.map((pc) => (
              <CheckRow
                key={pc}
                label={pc}
                checked={pieces.includes(pc)}
                onChange={() => toggle(pieces, setPieces, pc)}
                count={products.filter((p) => p.pieces === pc).length}
              />
            ))}
          </FilterGroup>

          <FilterGroup title="Price">
            <div style={{ padding: "2px 2px 4px" }}>
              <input
                type="range"
                min={2000}
                max={PRICE_MAX}
                step={250}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="shop-price-slider"
              />
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 12.5,
                  opacity: 0.75,
                  marginTop: 6,
                }}
              >
                <span>Rs. 2,000</span>
                <span>
                  Up to Rs. {maxPrice.toLocaleString()}
                  {maxPrice >= PRICE_MAX ? "+" : ""}
                </span>
              </div>
            </div>
          </FilterGroup>

          <FilterGroup title="Availability">
            <CheckRow
              label="On sale"
              checked={onSaleOnly}
              onChange={() => setOnSaleOnly((v) => !v)}
            />
            <CheckRow
              label="In stock only"
              checked={inStockOnly}
              onChange={() => setInStockOnly((v) => !v)}
            />
          </FilterGroup>

          <button
            className="btn btn-primary btn-block shop-sidebar-apply"
            onClick={() => setMobileFiltersOpen(false)}
          >
            Show {filtered.length} pieces
          </button>
        </aside>

        {mobileFiltersOpen && (
          <div
            className="shop-sidebar-backdrop"
            onClick={() => setMobileFiltersOpen(false)}
          />
        )}

        <div className="shop-results">
          {filtered.length === 0 ? (
            <div className="admin-empty panel">
              No pieces match these filters.{" "}
              <button className="btn-ghost" onClick={clearAll}>
                Clear filters
              </button>
            </div>
          ) : (
            <div className="shop-grid" style={{ "--shop-cols": gridCols }}>
              {filtered.map((p) => (
                <div
                  key={p.id}
                  className="card"
                  style={{ cursor: "pointer", padding: 0, border: "none" }}
                  onClick={() => openProduct(p.id)}
                >
                  <div className="plate ph" style={{ height: 420, position: "relative" }}>
                    <span>{p.name} — product photo</span>
                    {p.compareAt && p.compareAt > p.price && (
                      <span
                        className="tag"
                        style={{
                          position: "absolute",
                          top: 10,
                          left: 10,
                          background: "var(--color-accent-700)",
                          color: "#fff",
                        }}
                      >
                        Sale
                      </span>
                    )}
                    {!p.colors.some((c) => c.stock > 0) && (
                      <span
                        className="stock-chip out"
                        style={{ position: "absolute", top: 10, right: 10 }}
                      >
                        Out of stock
                      </span>
                    )}
                  </div>
                  <div style={{ padding: "10px 2px" }}>
                    <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
                      {p.colors.map((c) => (
                        <span
                          key={c.id}
                          className="swatch"
                          style={{ background: c.hex }}
                          title={c.label}
                        />
                      ))}
                    </div>
                    <div className="card-title">{p.name}</div>
                    <div className="card-meta">
                      {p.fabric} · {p.pieces}
                    </div>
                    <div style={{ marginTop: 6, fontSize: 15 }}>
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
                        style={{
                          color: "var(--color-accent-700)",
                          fontWeight: 600,
                        }}
                      >
                        Rs. {p.price.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FilterGroup({ title, children }) {
  return (
    <div className="shop-filter-group">
      <div className="shop-filter-title">{title}</div>
      <div className="shop-filter-body">{children}</div>
    </div>
  );
}

function CheckRow({ label, checked, onChange, count }) {
  return (
    <label className="shop-check-row">
      <span className="shop-check-box">
        <input type="checkbox" checked={checked} onChange={onChange} />
        <span className="shop-check-mark" />
      </span>
      <span className="shop-check-label">{label}</span>
      {typeof count === "number" && (
        <span className="shop-check-count">{count}</span>
      )}
    </label>
  );
}
