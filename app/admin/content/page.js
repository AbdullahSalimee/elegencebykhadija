"use client";
import { useState } from "react";
import ContentSection from "@/components/admin/ContentSection";
import LinkColumns from "@/components/admin/LinkColumns";
import FeatureCard from "@/components/admin/FeatureCard";

// Everything on the storefront that isn't a product or an order. Before this
// page existed, changing a hero photograph or a sale banner meant editing
// lib/site-config.js and redeploying.
//
// Grouped into tabs by where it appears on the site rather than by table, so
// the shop owner looks for "the big photos at the top" under Homepage instead
// of having to know it's called hero_slides.

const CTA_HINT = "Leave both blank for a panel with no button.";
const ORDER_HINT = "Lower numbers appear first.";

const HERO_FIELDS = [
  { key: "title", label: "Headline", primaryText: true, required: true, placeholder: "Up to 50% Off" },
  { key: "eyebrow", label: "Small text above the headline", placeholder: "The Season's Last Sale" },
  { key: "body", label: "Supporting line", type: "textarea" },
  { key: "cta_label", label: "Button text", placeholder: "Shop the Sale", hint: CTA_HINT },
  { key: "cta_href", label: "Button link", placeholder: "/sale" },
  {
    key: "image",
    label: "Desktop photograph",
    type: "image",
    hint: "Landscape crop. Used on screens wider than 900px.",
  },
  {
    key: "mobile_image",
    label: "Phone photograph",
    type: "image",
    hint: "Portrait crop. A landscape shot squeezed onto a phone leaves the model tiny and puts her face behind the header.",
  },
  { key: "sort_order", label: "Order", type: "number", hint: ORDER_HINT },
  { key: "active", label: "Live" },
];

const TILE_FIELDS = [
  { key: "label", label: "Label", primaryText: true, required: true, placeholder: "Lawn" },
  { key: "href", label: "Links to", required: true, placeholder: "/shop" },
  { key: "image", label: "Photograph", type: "image" },
  { key: "sort_order", label: "Order", type: "number", hint: ORDER_HINT },
  { key: "active", label: "Live" },
];

const COLLECTION_FIELDS = [
  { key: "heading", label: "Heading", primaryText: true, required: true, placeholder: "Luxury Pret" },
  { key: "caption", label: "Caption", placeholder: "Rania — Silk Festive 26" },
  { key: "href", label: "Links to", required: true, placeholder: "/shop" },
  { key: "image", label: "Photograph", type: "image" },
  { key: "sort_order", label: "Order", type: "number", hint: ORDER_HINT },
  { key: "active", label: "Live" },
];

const PROMO_FIELDS = [
  { key: "title", label: "Title", primaryText: true, required: true, placeholder: "The Fabric Guide" },
  { key: "eyebrow", label: "Small text above the title", placeholder: "Not sure how much to buy?" },
  { key: "body", label: "Supporting line", type: "textarea" },
  { key: "cta_label", label: "Button text", placeholder: "Read the Guide", hint: CTA_HINT },
  { key: "cta_href", label: "Button link", placeholder: "/fabric-guide" },
  { key: "image", label: "Photograph", type: "image" },
  { key: "sort_order", label: "Order", type: "number", hint: ORDER_HINT },
  { key: "active", label: "Live" },
];

const TRUST_FIELDS = [
  { key: "title", label: "Title", primaryText: true, required: true, placeholder: "Cash on Delivery" },
  { key: "body", label: "Supporting line", required: true, placeholder: "Pay at your doorstep, no card needed" },
  { key: "sort_order", label: "Order", type: "number", hint: ORDER_HINT },
];

const ANNOUNCEMENT_FIELDS = [
  {
    key: "message",
    label: "Message",
    primaryText: true,
    required: true,
    type: "textarea",
    placeholder: "Free shipping on all prepaid orders across Pakistan",
  },
  { key: "sort_order", label: "Order", type: "number", hint: ORDER_HINT },
  { key: "active", label: "Live" },
];

const UTILITY_FIELDS = [
  { key: "label", label: "Label", primaryText: true, required: true, placeholder: "Track Your Order" },
  { key: "href", label: "Links to", required: true, placeholder: "/track" },
  { key: "sort_order", label: "Order", type: "number", hint: ORDER_HINT },
];

const REGION_FIELDS = [
  { key: "label", label: "Region", primaryText: true, required: true, placeholder: "Pakistan" },
  { key: "sort_order", label: "Order", type: "number", hint: ORDER_HINT },
];

const TABS = [
  { id: "homepage", label: "Homepage" },
  { id: "chrome", label: "Header" },
  { id: "footer", label: "Footer" },
];

export default function AdminContentPage() {
  const [tab, setTab] = useState("homepage");

  return (
    <div>
      <div className="admin-page-eyebrow">Site Content</div>
      <h1 style={{ fontSize: 28, marginBottom: 8 }}>Homepage &amp; Content</h1>
      <p style={{ opacity: 0.7, marginBottom: 20, maxWidth: "65ch" }}>
        Everything on the storefront that isn't a product or an order. Changes
        go live within a few minutes — the storefront caches content so it
        doesn't hit the database on every visit.
      </p>

      <div className="admin-tabs">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={`admin-tab${tab === t.id ? " active" : ""}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "homepage" && (
        <div className="admin-content-stack">
          <ContentSection
            table="hero_slides"
            title="Hero carousel"
            sub="The full-width photographs at the top of the homepage. They rotate every few seconds."
            fields={HERO_FIELDS}
            itemLabel="slide"
          />
          <ContentSection
            table="collection_blocks"
            title="Collection blocks"
            sub="The tall photographs running down the homepage, one per collection."
            fields={COLLECTION_FIELDS}
            itemLabel="block"
          />
          <ContentSection
            table="category_tiles"
            title="Category tiles"
            sub="The square 'Shop by Category' grid."
            fields={TILE_FIELDS}
            itemLabel="tile"
          />
          <ContentSection
            table="promo_banners"
            title="Promo banners"
            sub="The pair of wide banners near the bottom of the homepage."
            fields={PROMO_FIELDS}
            itemLabel="banner"
          />
          <ContentSection
            table="trust_items"
            title="Reassurances"
            sub="The short promises above the footer — delivery, payment, exchanges."
            fields={TRUST_FIELDS}
            itemLabel="reassurance"
          />
        </div>
      )}

      {tab === "chrome" && (
        <div className="admin-content-stack">
          <ContentSection
            table="announcements"
            title="Announcement bar"
            sub="The thin strip at the very top. With more than one message it cycles between them."
            fields={ANNOUNCEMENT_FIELDS}
            itemLabel="message"
          />
          <ContentSection
            table="utility_links"
            title="Utility links"
            sub="The small links above the logo — tracking, help, contact."
            fields={UTILITY_FIELDS}
            itemLabel="link"
          />
          <LinkColumns
            columnTable="nav_columns"
            linkTable="nav_column_links"
            parentId="women"
            parentField="nav_link_id"
            title="Mega menu — Women"
            sub="The panel that drops down from 'Women' in the header. The menu items themselves are under Navigation & Categories."
          />
          <FeatureCard
            navLinkId="women"
            title="Mega menu — feature card"
            sub="The promo panel on the right-hand side of the Women menu. Leave the fields blank to hide it."
          />
        </div>
      )}

      {tab === "footer" && (
        <div className="admin-content-stack">
          <LinkColumns
            columnTable="footer_columns"
            linkTable="footer_links"
            title="Footer columns"
            sub="The link columns at the bottom of every page."
          />
          <ContentSection
            table="shipping_regions"
            title="Ship-to regions"
            sub="The country list in the footer bar."
            fields={REGION_FIELDS}
            itemLabel="region"
          />
        </div>
      )}
    </div>
  );
}
