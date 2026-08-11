"use client";
import { useEffect, useRef, useState } from "react";
import {
  useNavLinks,
  useCategories as useCategoriesData,
  apiCreateNavLink,
  apiUpdateNavLink,
  apiDeleteNavLink,
  apiCreateCategory,
  apiUpdateCategory,
  apiDeleteCategory,
} from "@/hooks/useSiteConfig";
import { Plus, Trash2, GripVertical } from "lucide-react";

const BLANK_LINK = () => ({
  id: "nav" + Math.random().toString(36).slice(2, 8),
  label: "",
  href: "#",
  order: 999,
});
const BLANK_CATEGORY = () => ({
  id: "cat" + Math.random().toString(36).slice(2, 8),
  label: "",
});

// Local state seeded from the DB (via the hooks below) so every keystroke is
// instant; each change also fires the matching API call to persist it and
// keep Nav.js / the shop's category filters in sync for everyone else.
export default function AdminSettings() {
  const { navLinks, isLoading: linksLoading, mutate: mutateLinks } = useNavLinks();
  const { categories: dbCategories, isLoading: categoriesLoading, mutate: mutateCategories } = useCategoriesData();
  const [links, setLinks] = useState([]);
  const [categories, setCategories] = useState([]);

  // Hydrate local editable state from the DB exactly once, on first load —
  // not on every later refetch, which would otherwise wipe out an in-progress
  // draft row (e.g. a second "Add link" click) that hasn't been given a
  // label yet and so was never persisted server-side.
  const linksHydrated = useRef(false);
  const categoriesHydrated = useRef(false);
  useEffect(() => {
    if (!linksLoading && !linksHydrated.current) {
      setLinks(navLinks);
      linksHydrated.current = true;
    }
  }, [linksLoading, navLinks]);
  useEffect(() => {
    if (!categoriesLoading && !categoriesHydrated.current) {
      setCategories(dbCategories);
      categoriesHydrated.current = true;
    }
  }, [categoriesLoading, dbCategories]);

  // "Add" only creates a local draft row (same as before — you can start
  // typing before anything hits the network). The API create call fires the
  // first time that draft gets a real label; every edit after that point
  // (once the row exists server-side) is a PATCH instead.
  const addLink = () => setLinks((prev) => [...prev, BLANK_LINK()]);
  const updateLink = (id, field, value) => {
    const current = links.find((l) => l.id === id);
    const next = { ...current, [field]: value };
    setLinks((prev) => prev.map((l) => (l.id !== id ? l : next)));
    if (!next.label?.trim()) return;
    const persisted = navLinks.some((l) => l.id === id);
    const action = persisted ? apiUpdateNavLink(id, { [field]: value }) : apiCreateNavLink(next);
    action.then(() => mutateLinks());
  };
  const removeLink = (id) => {
    setLinks((prev) => prev.filter((l) => l.id !== id));
    apiDeleteNavLink(id).then(() => mutateLinks());
  };

  const addCategory = () => setCategories((prev) => [...prev, BLANK_CATEGORY()]);
  const updateCategory = (id, value) => {
    setCategories((prev) => prev.map((c) => (c.id !== id ? c : { ...c, label: value })));
    if (!value?.trim()) return;
    const persisted = dbCategories.some((c) => c.id === id);
    const action = persisted ? apiUpdateCategory(id, value) : apiCreateCategory({ id, label: value });
    action.then(() => mutateCategories());
  };
  const removeCategory = (id) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
    apiDeleteCategory(id).then(() => mutateCategories());
  };

  return (
    <div>
      <div className="admin-page-eyebrow">Site Settings</div>
      <h1 style={{ fontSize: 28, marginBottom: 8 }}>
        Navigation &amp; Categories
      </h1>
      <p style={{ opacity: 0.7, marginBottom: 24, maxWidth: "65ch" }}>
        Controls what shows in the storefront's top nav bar, and the categories
        available when tagging a product. Edits here are local to this session;
        connect a real API to persist.
      </p>

      <div
        className="admin-split" style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 20 }}
      >
        <div className="panel">
          <div className="panel-head">
            <div className="panel-title">Nav bar links</div>
            <button
              className="btn-ghost"
              onClick={addLink}
              style={{
                fontSize: 13,
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              <Plus size={13} strokeWidth={2} /> Add link
            </button>
          </div>
          <p className="panel-sub">
            Shown left-to-right in the storefront header, in this order.
          </p>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 8,
              paddingBottom: 16,
            }}
          >
            {links
              .sort((a, b) => a.order - b.order)
              .map((link) => (
                <div
                  key={link.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "20px 1fr 1fr 28px",
                    gap: 8,
                    alignItems: "center",
                  }}
                >
                  <GripVertical
                    size={14}
                    strokeWidth={1.6}
                    style={{ opacity: 0.4, cursor: "grab" }}
                  />
                  <input
                    className="input"
                    placeholder="Label, e.g. New In"
                    value={link.label}
                    onChange={(e) =>
                      updateLink(link.id, "label", e.target.value)
                    }
                  />
                  <input
                    className="input"
                    placeholder="Link (# or /page)"
                    value={link.href}
                    onChange={(e) =>
                      updateLink(link.id, "href", e.target.value)
                    }
                  />
                  <button
                    className="btn btn-icon"
                    style={{ width: 28, height: 28, color: "#8f2f3a" }}
                    onClick={() => removeLink(link.id)}
                    aria-label="Remove link"
                  >
                    <Trash2 size={13} strokeWidth={1.8} />
                  </button>
                </div>
              ))}
            {links.length === 0 && (
              <div className="admin-empty">
                No nav links yet — add one above.
              </div>
            )}
          </div>
        </div>

        <div className="panel">
          <div className="panel-head">
            <div className="panel-title">Categories</div>
            <button
              className="btn-ghost"
              onClick={addCategory}
              style={{
                fontSize: 13,
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              <Plus size={13} strokeWidth={2} /> Add
            </button>
          </div>
          <p className="panel-sub">Used to tag products in the catalogue.</p>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 8,
              paddingBottom: 16,
            }}
          >
            {categories.map((cat) => (
              <div
                key={cat.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 28px",
                  gap: 8,
                  alignItems: "center",
                }}
              >
                <input
                  className="input"
                  placeholder="Category name"
                  value={cat.label}
                  onChange={(e) => updateCategory(cat.id, e.target.value)}
                />
                <button
                  className="btn btn-icon"
                  style={{ width: 28, height: 28, color: "#8f2f3a" }}
                  onClick={() => removeCategory(cat.id)}
                  aria-label="Remove category"
                >
                  <Trash2 size={13} strokeWidth={1.8} />
                </button>
              </div>
            ))}
            {categories.length === 0 && (
              <div className="admin-empty">
                No categories yet — add one above.
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={{ marginTop: 20 }}>
        <button className="btn btn-primary">Save Changes</button>
      </div>
    </div>
  );
}
