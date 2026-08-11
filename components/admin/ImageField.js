"use client";
import { useRef, useState } from "react";
import { ImagePlus, X } from "lucide-react";
import { apiUploadProductImage } from "@/hooks/useProducts";

// Image picker for the content editor: upload a file, or type a path for the
// photography that already ships in /public.
//
// Reuses /api/uploads/product-image, which is named for its first caller but
// isn't product-specific — it resizes to fit 1200x1500, re-encodes to WebP and
// returns a public URL, which is exactly what a hero or banner needs too.
export default function ImageField({ value, onChange, label, hint }) {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const pick = async (e) => {
    const file = e.target.files?.[0];
    // Clear immediately so re-picking the same file still fires a change.
    e.target.value = "";
    if (!file) return;

    setError(null);
    setBusy(true);
    try {
      const { url } = await apiUploadProductImage(file);
      onChange(url);
    } catch (err) {
      setError(
        err.status === 413
          ? "That image is too large — 8MB is the limit."
          : "Upload failed. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="field">
      {label && <label>{label}</label>}
      <div className="admin-image-field">
        <div className="admin-image-preview">
          {value ? (
            // A plain <img>: the value can be any path the owner types, and
            // next/image would reject one that isn't in remotePatterns —
            // failing the whole panel rather than just showing a broken thumb.
            <img src={value} alt="" />
          ) : (
            <span>No image</span>
          )}
        </div>

        <div className="admin-image-controls">
          <input
            className="input"
            value={value || ""}
            placeholder="/products/zarnaab.webp"
            onChange={(e) => onChange(e.target.value)}
          />
          <div className="admin-image-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => inputRef.current?.click()}
              disabled={busy}
            >
              <ImagePlus size={13} strokeWidth={1.8} />
              {busy ? "Uploading…" : "Upload"}
            </button>
            {value && (
              <button
                type="button"
                className="btn-ghost"
                style={{ fontSize: 12 }}
                onClick={() => onChange("")}
              >
                <X size={12} strokeWidth={2} /> Clear
              </button>
            )}
          </div>
          {hint && !error && <div className="admin-field-hint">{hint}</div>}
          {error && (
            <div className="admin-field-hint" style={{ color: "#8f2f3a" }}>
              {error}
            </div>
          )}
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={pick}
      />
    </div>
  );
}
