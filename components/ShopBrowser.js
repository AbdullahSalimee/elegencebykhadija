"use client";
import { useMemo, useState, useRef, useEffect } from "react";
import { useProductsInfinite, useProducts } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useSiteConfig";
import ProductCard from "@/components/ProductCard";
import { SlidersHorizontal, X, ChevronDown, Grid2x2, Grid3x3, LayoutGrid, Search } from "lucide-react";

const FABRICS = ["Lawn", "Silk", "Karandi"];
const PIECE_OPTIONS = ["2 Piece", "3 Piece"];
const SORTS = [
  { id: "newest", label: "Newest arrivals" },
  { id: "price-asc", label: "Price: Low to High" },
  { id: "price-desc", label: "Price: High to Low" },
  { id: "name", label: "Name: A–Z" },
];
const PRICE_MAX = 12000;

export default function ShopBrowser({ initialProducts, initialTotal, pageSize = 24, initialQuery = "" }) {
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

  // queryInput tracks every keystroke (instant, for the input itself);
  // query is debounced off it so typing doesn't fire a request per letter.
  const [queryInput, setQueryInput] = useState(initialQuery);
  const [query, setQuery] = useState(initialQuery);
  useEffect(() => {
    const t = setTimeout(() => setQuery(queryInput), 300);
    return () => clearTimeout(t);
  }, [queryInput]);

  const filters = useMemo(
    () => ({
      category: categories,
      fabric: fabrics,
      pieces,
      maxPrice: maxPrice < PRICE_MAX ? maxPrice : undefined,
      onSale: onSaleOnly,
      inStock: inStockOnly,
      q: query || undefined,
      sort,
    }),
    [categories, fabrics, pieces, maxPrice, onSaleOnly, inStockOnly, query, sort]
  );

  // The very first render matches app/shop/page.js's server-fetched default
  // query (no filters, page 1, same search term if any) — fallbackData lets
  // that data paint instantly instead of re-fetching it on mount.
  const isDefaultFilters =
    categories.length === 0 &&
    fabrics.length === 0 &&
    pieces.length === 0 &&
    maxPrice === PRICE_MAX &&
    !onSaleOnly &&
    !inStockOnly &&
    query === initialQuery &&
    sort === "newest";

  const { products, total, hasMore, isLoading, loadMore, reset } = useProductsInfinite(
    filters,
    pageSize,
    isDefaultFilters ? { fallbackData: [{ products: initialProducts, total: initialTotal }] } : undefined
  );

  // Facet counts (how many pieces per category/fabric/pieces value) need the
  // whole catalogue, not just the current filtered page — fetched once and
  // shared via SWR's cache like everything else that wants "all products".
  const { products: allProducts } = useProducts({ pageSize: 500 });

  useEffect(() => {
    // `reset` (setSize(1) under the hood) returns a Promise — a concise-body
    // arrow here would implicitly return that Promise as the effect's
    // "cleanup function", which React then tries to call and throws
    // "destroy is not a function". The block body discards the return value.
    reset();
  }, [categories, fabrics, pieces, maxPrice, onSaleOnly, inStockOnly, query, sort]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const handleClick = (e) => {
      if (sortRef.current && !sortRef.current.contains(e.target)) setSortOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const toggle = (list, setList, value) =>
    setList(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);

  const clearAll = () => {
    setCategories([]);
    setFabrics([]);
    setPieces([]);
    setMaxPrice(PRICE_MAX);
    setOnSaleOnly(false);
    setInStockOnly(false);
    setQueryInput("");
  };

  const activeFilterCount =
    categories.length +
    fabrics.length +
    pieces.length +
    (maxPrice < PRICE_MAX ? 1 : 0) +
    (onSaleOnly ? 1 : 0) +
    (inStockOnly ? 1 : 0);

  return (
    <div className="page-body eth-page-body">
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

        <div className="admin-search" style={{ minWidth: 0, flex: "0 1 260px" }}>
          <Search size={14} strokeWidth={1.8} style={{ opacity: 0.6, flexShrink: 0 }} />
          <input
            placeholder="Search suits, fabric…"
            value={queryInput}
            onChange={(e) => setQueryInput(e.target.value)}
          />
          {queryInput && (
            <button
              className="btn-ghost"
              style={{ padding: 0, lineHeight: 1, flexShrink: 0 }}
              onClick={() => setQueryInput("")}
              aria-label="Clear search"
            >
              <X size={13} strokeWidth={2} />
            </button>
          )}
        </div>

        <div style={{ fontSize: 13, opacity: 0.65, whiteSpace: "nowrap" }}>
          {products.length} of {total} pieces
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
            <CategoryFilters
              categories={categories}
              onToggle={(id) => toggle(categories, setCategories, id)}
              allProducts={allProducts}
            />
          </FilterGroup>

          <FilterGroup title="Fabric">
            {FABRICS.map((f) => (
              <CheckRow
                key={f}
                label={f}
                checked={fabrics.includes(f)}
                onChange={() => toggle(fabrics, setFabrics, f)}
                count={allProducts.filter((p) => p.fabric === f).length}
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
                count={allProducts.filter((p) => p.pieces === pc).length}
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
            Show {total} pieces
          </button>
        </aside>

        {mobileFiltersOpen && (
          <div
            className="shop-sidebar-backdrop"
            onClick={() => setMobileFiltersOpen(false)}
          />
        )}

        <div className="shop-results">
          {!isLoading && products.length === 0 ? (
            <div className="admin-empty panel">
              No pieces match these filters.{" "}
              <button className="btn-ghost" onClick={clearAll}>
                Clear filters
              </button>
            </div>
          ) : (
            <>
              <div
                className="eth-grid shop-grid"
                style={{ "--shop-cols": gridCols }}
              >
                {products.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
              {hasMore && (
                <div style={{ display: "flex", justifyContent: "center", marginTop: 32 }}>
                  <button className="btn btn-secondary" onClick={loadMore} disabled={isLoading}>
                    {isLoading ? "Loading…" : `Load more (${total - products.length} left)`}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function CategoryFilters({ categories: selected, onToggle, allProducts }) {
  const { categories } = useCategories();
  return categories.map((c) => (
    <CheckRow
      key={c.id}
      label={c.label}
      checked={selected.includes(c.id)}
      onChange={() => onToggle(c.id)}
      count={allProducts.filter((p) => p.category === c.id).length}
    />
  ));
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
