"use client";
import { useState } from "react";
import { Plus, Trash2, ChevronDown } from "lucide-react";
import {
  useContent,
  apiSaveContent,
  apiPatchContent,
  apiDeleteContent,
} from "@/hooks/useContent";
import ImageField from "@/components/admin/ImageField";

// One editor for every flat content table. The eight sections it drives differ
// only in their columns, so they're described by a `fields` schema rather than
// written out eight times — see app/admin/content/page.js for the schemas.
//
// Rows edit locally and save explicitly. Auto-saving on every keystroke would
// fire a PATCH per letter, and saving on blur makes it ambiguous whether a
// half-typed change was kept — an explicit Save that only appears when a row is
// dirty tells the shop owner exactly where they stand.

function slugify(text) {
  return String(text)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
}

export default function ContentSection({ table, title, sub, fields, itemLabel = "item" }) {
  const { rows, isLoading, mutate } = useContent(table);
  const [openId, setOpenId] = useState(null);
  const [drafts, setDrafts] = useState({});
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState(null);
  const [adding, setAdding] = useState(false);

  const titleField = fields.find((f) => f.primaryText)?.key || fields[0].key;

  const draftFor = (row) => drafts[row.id] ?? row;
  const isDirty = (row) => Boolean(drafts[row.id]);

  const edit = (row, key, value) =>
    setDrafts((d) => ({ ...d, [row.id]: { ...draftFor(row), [key]: value } }));

  const discard = (id) =>
    setDrafts((d) => {
      const { [id]: _drop, ...rest } = d;
      return rest;
    });

  const save = async (row) => {
    const draft = drafts[row.id];
    if (!draft) return;
    setBusyId(row.id);
    setError(null);
    try {
      await apiPatchContent(table, row.id, draft);
      discard(row.id);
      await mutate();
    } catch (err) {
      setError(err.message || "Couldn't save that change.");
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (row) => {
    const name = row[titleField] || row.id;
    if (!confirm(`Delete "${name}"? This can't be undone.`)) return;
    setBusyId(row.id);
    setError(null);
    try {
      await apiDeleteContent(table, row.id);
      discard(row.id);
      await mutate();
    } catch (err) {
      setError(err.message || "Couldn't delete that row.");
    } finally {
      setBusyId(null);
    }
  };

  const addRow = async () => {
    // The id is the primary key and appears in no UI, so it's derived from the
    // first text field rather than asked for — one less thing to explain.
    const label = prompt(`New ${itemLabel} — what should it be called?`);
    if (!label?.trim()) return;

    const id = slugify(label);
    if (!id) {
      setError("That name has no letters or numbers to make an id from.");
      return;
    }
    if (rows.some((r) => r.id === id)) {
      setError(`There's already a ${itemLabel} called "${label}".`);
      return;
    }

    setAdding(true);
    setError(null);
    try {
      const row = { id, [titleField]: label.trim(), sort_order: rows.length + 1 };
      // Required columns the schema knows about but the prompt didn't ask for:
      // seed them so the insert doesn't fail a NOT NULL constraint.
      for (const f of fields) {
        if (f.required && !row[f.key]) row[f.key] = f.key === "href" ? "/shop" : label.trim();
      }
      await apiSaveContent(table, row);
      await mutate();
      setOpenId(id);
    } catch (err) {
      setError(err.message || "Couldn't add that row.");
    } finally {
      setAdding(false);
    }
  };

  const toggleActive = async (row) => {
    setBusyId(row.id);
    try {
      await apiPatchContent(table, row.id, { active: !row.active });
      await mutate();
    } catch (err) {
      setError(err.message || "Couldn't change that.");
    } finally {
      setBusyId(null);
    }
  };

  const hasActive = fields.some((f) => f.key === "active");

  return (
    <div className="panel admin-content-panel">
      <div className="panel-head">
        <div className="panel-title">{title}</div>
        <button className="btn-ghost admin-add-btn" onClick={addRow} disabled={adding}>
          <Plus size={13} strokeWidth={2} /> Add {itemLabel}
        </button>
      </div>
      {sub && <p className="panel-sub">{sub}</p>}

      {error && <div className="admin-error-note">{error}</div>}

      {isLoading ? (
        <div className="admin-empty">Loading…</div>
      ) : rows.length === 0 ? (
        <div className="admin-empty">
          No {itemLabel}s yet — add one to see it on the site.
        </div>
      ) : (
        <div className="admin-row-list">
          {rows.map((row) => {
            const draft = draftFor(row);
            const open = openId === row.id;
            return (
              <div
                key={row.id}
                className={`admin-row${hasActive && !row.active ? " admin-row-off" : ""}`}
              >
                <div className="admin-row-head">
                  <button
                    className="admin-row-toggle"
                    aria-expanded={open}
                    onClick={() => setOpenId(open ? null : row.id)}
                  >
                    <ChevronDown
                      size={15}
                      strokeWidth={2}
                      className={open ? "eth-chev-open" : ""}
                    />
                    <span className="admin-row-name">{row[titleField] || row.id}</span>
                  </button>

                  {isDirty(row) && <span className="admin-row-dirty">unsaved</span>}

                  {hasActive && (
                    <label className="admin-row-active" title="Show on the site">
                      <input
                        type="checkbox"
                        checked={Boolean(row.active)}
                        onChange={() => toggleActive(row)}
                        disabled={busyId === row.id}
                      />
                      <span>{row.active ? "Live" : "Hidden"}</span>
                    </label>
                  )}

                  <button
                    className="btn btn-icon admin-row-delete"
                    onClick={() => remove(row)}
                    disabled={busyId === row.id}
                    aria-label={`Delete ${row[titleField] || row.id}`}
                  >
                    <Trash2 size={13} strokeWidth={1.8} />
                  </button>
                </div>

                {open && (
                  <div className="admin-row-body">
                    {fields
                      .filter((f) => f.key !== "active")
                      .map((f) => (
                        <Field
                          key={f.key}
                          field={f}
                          value={draft[f.key]}
                          onChange={(v) => edit(row, f.key, v)}
                        />
                      ))}

                    <div className="admin-row-actions">
                      <button
                        className="btn btn-primary"
                        onClick={() => save(row)}
                        disabled={!isDirty(row) || busyId === row.id}
                      >
                        {busyId === row.id ? "Saving…" : "Save changes"}
                      </button>
                      {isDirty(row) && (
                        <button className="btn-ghost" onClick={() => discard(row.id)}>
                          Discard
                        </button>
                      )}
                    </div>
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

function Field({ field, value, onChange }) {
  if (field.type === "image") {
    return (
      <ImageField
        label={field.label}
        hint={field.hint}
        value={value}
        onChange={onChange}
      />
    );
  }

  if (field.type === "textarea") {
    return (
      <div className="field">
        <label>{field.label}</label>
        <textarea
          className="input"
          style={{ minHeight: 74 }}
          value={value || ""}
          placeholder={field.placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
        {field.hint && <div className="admin-field-hint">{field.hint}</div>}
      </div>
    );
  }

  if (field.type === "number") {
    return (
      <div className="field">
        <label>{field.label}</label>
        <input
          className="input"
          type="number"
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))}
        />
        {field.hint && <div className="admin-field-hint">{field.hint}</div>}
      </div>
    );
  }

  return (
    <div className="field">
      <label>{field.label}</label>
      <input
        className="input"
        value={value || ""}
        placeholder={field.placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
      {field.hint && <div className="admin-field-hint">{field.hint}</div>}
    </div>
  );
}
