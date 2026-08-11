"use client";
import { useState } from "react";
import { useNavLinks, apiUpdateNavLink } from "@/hooks/useSiteConfig";

// The promo card at the right-hand end of an open mega menu panel. Its three
// fields live on the nav_links row rather than in a table of their own —
// there's at most one per menu item — so this edits through the nav-links API
// instead of the generic content one.
export default function FeatureCard({ navLinkId, title, sub }) {
  const { navLinks, isLoading, mutate } = useNavLinks();
  const [draft, setDraft] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const link = navLinks.find((l) => l.id === navLinkId);
  const value = draft ?? link;

  const edit = (key, v) => setDraft({ ...(draft ?? link), [key]: v });

  const save = async () => {
    if (!draft) return;
    setBusy(true);
    setError(null);
    try {
      await apiUpdateNavLink(navLinkId, {
        feature_eyebrow: draft.feature_eyebrow || null,
        feature_title: draft.feature_title || null,
        feature_href: draft.feature_href || null,
      });
      setDraft(null);
      await mutate();
    } catch (err) {
      setError(err.message || "Couldn't save the feature card.");
    } finally {
      setBusy(false);
    }
  };

  if (isLoading) {
    return (
      <div className="panel admin-content-panel">
        <div className="panel-title">{title}</div>
        <div className="admin-empty">Loading…</div>
      </div>
    );
  }

  if (!link) {
    return (
      <div className="panel admin-content-panel">
        <div className="panel-title">{title}</div>
        <div className="admin-empty">
          No menu item called "{navLinkId}" — add it under Navigation &amp;
          Categories first.
        </div>
      </div>
    );
  }

  return (
    <div className="panel admin-content-panel">
      <div className="panel-title">{title}</div>
      {sub && <p className="panel-sub">{sub}</p>}
      {error && <div className="admin-error-note">{error}</div>}

      <div className="admin-row-body" style={{ borderTop: 0, paddingTop: 0 }}>
        <div className="field">
          <label>Small text</label>
          <input
            className="input"
            value={value.feature_eyebrow || ""}
            placeholder="The Season's Last Sale"
            onChange={(e) => edit("feature_eyebrow", e.target.value)}
          />
        </div>
        <div className="field">
          <label>Title</label>
          <input
            className="input"
            value={value.feature_title || ""}
            placeholder="Up to 50% off unstitched"
            onChange={(e) => edit("feature_title", e.target.value)}
          />
        </div>
        <div className="field">
          <label>Links to</label>
          <input
            className="input"
            value={value.feature_href || ""}
            placeholder="/sale"
            onChange={(e) => edit("feature_href", e.target.value)}
          />
        </div>

        <div className="admin-row-actions">
          <button
            className="btn btn-primary"
            onClick={save}
            disabled={!draft || busy}
          >
            {busy ? "Saving…" : "Save changes"}
          </button>
          {draft && (
            <button className="btn-ghost" onClick={() => setDraft(null)}>
              Discard
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
