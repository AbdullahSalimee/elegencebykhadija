"use client";
import { useState } from "react";
import { Plus, Trash2, ChevronDown } from "lucide-react";
import {
  useContent,
  useContentLinks,
  apiSaveContent,
  apiPatchContent,
  apiDeleteContent,
  apiCreateLink,
  apiPatchLink,
  apiDeleteLink,
} from "@/hooks/useContent";

// The two parent/child sections: footer columns and mega-menu columns, each
// holding an ordered list of links. Both use the same shape (a heading plus
// links), so one component serves both — `columnTable` and `linkTable` say
// which pair to edit.
//
// Links are edited inline and saved on blur rather than behind a Save button:
// a link is two short fields, so a per-row save button would outnumber the
// content it guards.

function slugify(text) {
  return String(text)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
}

export default function LinkColumns({
  columnTable,
  linkTable,
  title,
  sub,
  parentId,
  parentField,
}) {
  const { rows, isLoading, mutate } = useContent(columnTable);
  const [openId, setOpenId] = useState(null);
  const [error, setError] = useState(null);

  // Mega-menu columns belong to one nav link; footer columns belong to nobody.
  const columns = parentId ? rows.filter((r) => r[parentField] === parentId) : rows;

  const addColumn = async () => {
    const heading = prompt("New column — what heading should it have?");
    if (!heading?.trim()) return;

    const base = slugify(heading);
    const id = parentId ? `${parentId}-${base}` : base;
    if (!base) {
      setError("That heading has no letters or numbers to make an id from.");
      return;
    }
    if (rows.some((r) => r.id === id)) {
      setError(`There's already a column called "${heading}".`);
      return;
    }

    setError(null);
    try {
      const row = { id, heading: heading.trim(), sort_order: columns.length + 1 };
      if (parentId) row[parentField] = parentId;
      await apiSaveContent(columnTable, row);
      await mutate();
      setOpenId(id);
    } catch (err) {
      setError(err.message || "Couldn't add that column.");
    }
  };

  const renameColumn = async (column, heading) => {
    if (heading === column.heading) return;
    try {
      await apiPatchContent(columnTable, column.id, { heading });
      await mutate();
    } catch (err) {
      setError(err.message || "Couldn't rename that column.");
    }
  };

  const removeColumn = async (column) => {
    if (!confirm(`Delete the "${column.heading}" column and all its links?`)) return;
    try {
      await apiDeleteContent(columnTable, column.id);
      await mutate();
    } catch (err) {
      setError(err.message || "Couldn't delete that column.");
    }
  };

  return (
    <div className="panel admin-content-panel">
      <div className="panel-head">
        <div className="panel-title">{title}</div>
        <button className="btn-ghost admin-add-btn" onClick={addColumn}>
          <Plus size={13} strokeWidth={2} /> Add column
        </button>
      </div>
      {sub && <p className="panel-sub">{sub}</p>}

      {error && <div className="admin-error-note">{error}</div>}

      {isLoading ? (
        <div className="admin-empty">Loading…</div>
      ) : columns.length === 0 ? (
        <div className="admin-empty">No columns yet — add one above.</div>
      ) : (
        <div className="admin-row-list">
          {columns.map((column) => {
            const open = openId === column.id;
            return (
              <div key={column.id} className="admin-row">
                <div className="admin-row-head">
                  <button
                    className="admin-row-toggle"
                    aria-expanded={open}
                    onClick={() => setOpenId(open ? null : column.id)}
                  >
                    <ChevronDown
                      size={15}
                      strokeWidth={2}
                      className={open ? "eth-chev-open" : ""}
                    />
                    <span className="admin-row-name">{column.heading}</span>
                  </button>
                  <button
                    className="btn btn-icon admin-row-delete"
                    onClick={() => removeColumn(column)}
                    aria-label={`Delete ${column.heading}`}
                  >
                    <Trash2 size={13} strokeWidth={1.8} />
                  </button>
                </div>

                {open && (
                  <div className="admin-row-body">
                    <div className="field">
                      <label>Heading</label>
                      <input
                        className="input"
                        defaultValue={column.heading}
                        onBlur={(e) => renameColumn(column, e.target.value)}
                      />
                    </div>
                    <ColumnLinks
                      linkTable={linkTable}
                      columnId={column.id}
                      onError={setError}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ColumnLinks({ linkTable, columnId, onError }) {
  const { links, isLoading, mutate } = useContentLinks(linkTable, columnId);

  const addLink = async () => {
    try {
      await apiCreateLink(linkTable, {
        column_id: columnId,
        label: "New link",
        href: "/shop",
        sort_order: links.length + 1,
      });
      await mutate();
    } catch (err) {
      onError(err.message || "Couldn't add that link.");
    }
  };

  const patch = async (link, field, value) => {
    if (value === link[field]) return;
    try {
      await apiPatchLink(linkTable, link.id, { [field]: value });
      await mutate();
    } catch (err) {
      onError(err.message || "Couldn't save that link.");
    }
  };

  const remove = async (link) => {
    try {
      await apiDeleteLink(linkTable, link.id);
      await mutate();
    } catch (err) {
      onError(err.message || "Couldn't delete that link.");
    }
  };

  return (
    <div className="admin-links-block">
      <div className="admin-links-head">
        <span>Links</span>
        <button className="btn-ghost admin-add-btn" onClick={addLink}>
          <Plus size={12} strokeWidth={2} /> Add link
        </button>
      </div>

      {isLoading ? (
        <div className="admin-empty">Loading…</div>
      ) : links.length === 0 ? (
        <div className="admin-empty">No links in this column yet.</div>
      ) : (
        links.map((link) => (
          <div key={link.id} className="admin-link-row">
            <input
              className="input"
              defaultValue={link.label}
              placeholder="Label"
              onBlur={(e) => patch(link, "label", e.target.value)}
            />
            <input
              className="input"
              defaultValue={link.href}
              placeholder="/shop"
              onBlur={(e) => patch(link, "href", e.target.value)}
            />
            <button
              className="btn btn-icon admin-row-delete"
              onClick={() => remove(link)}
              aria-label={`Delete ${link.label}`}
            >
              <Trash2 size={12} strokeWidth={1.8} />
            </button>
          </div>
        ))
      )}
    </div>
  );
}
