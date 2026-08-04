"use client";
import { useState } from "react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { MessageCircle, Mail, MapPin, Clock, Send } from "lucide-react";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", message: "" });
  const waNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "923001234567";
  const waLink = `https://wa.me/${waNumber}?text=${encodeURIComponent(
    form.name || form.message
      ? `Hi, I'm ${form.name || "..."}. ${form.message}`
      : "Hi, I have a question about your suits.",
  )}`;

  return (
    <div className="pg-contact">
      <Nav />

      <div className="page-head" style={{ padding: "56px 48px 20px", maxWidth: 680 }}>
        <div className="tag tag-outline" style={{ marginBottom: 16 }}>
          Get in touch
        </div>
        <h1 style={{ fontSize: 48 }}>Let's talk fabric.</h1>
        <p style={{ fontSize: 16, opacity: 0.8 }}>
          Most of our customers order over WhatsApp — it's the fastest way to
          check stock, confirm a colourway, or ask before you buy. Write your
          message below and we'll pick it up from there.
        </p>
      </div>

      <div
        className="page-body contact-grid"
        style={{
          padding: "24px 48px 64px",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 40,
          alignItems: "start",
        }}
      >
        <div className="contact-form-panel">
          <div className="field">
            <label>Your name</label>
            <input
              className="input"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Khadija Fatima"
            />
          </div>
          <div className="field">
            <label>Message</label>
            <textarea
              className="input"
              style={{ minHeight: 130 }}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              placeholder="Is the Emerald Vine Zarnaab suit still in stock?"
            />
          </div>
          <a
            className="btn btn-primary btn-block"
            href={waLink}
            target="_blank"
            rel="noopener"
            style={{ display: "inline-flex", gap: 8 }}
          >
            <MessageCircle size={16} strokeWidth={2} /> Continue on WhatsApp
          </a>
          <div
            style={{
              fontSize: 12,
              opacity: 0.6,
              marginTop: 8,
              textAlign: "center",
            }}
          >
            Opens WhatsApp with your message pre-filled — nothing sends until
            you do.
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <a
            href={waLink}
            target="_blank"
            rel="noopener"
            className="contact-channel-card"
          >
            <div className="contact-channel-icon">
              <MessageCircle size={18} strokeWidth={1.8} />
            </div>
            <div>
              <div className="contact-channel-title">WhatsApp</div>
              <div className="contact-channel-value">+92 300 1234567</div>
              <div className="contact-channel-meta">
                Fastest response — usually within the hour
              </div>
            </div>
          </a>

          <a
            href="mailto:hello@elegancebykhadija.pk"
            className="contact-channel-card"
          >
            <div className="contact-channel-icon">
              <Mail size={18} strokeWidth={1.8} />
            </div>
            <div>
              <div className="contact-channel-title">Email</div>
              <div className="contact-channel-value">
                hello@elegancebykhadija.pk
              </div>
              <div className="contact-channel-meta">
                For order issues, wholesale &amp; press
              </div>
            </div>
          </a>

          <div className="contact-channel-card" style={{ cursor: "default" }}>
            <div className="contact-channel-icon">
              <MapPin size={18} strokeWidth={1.8} />
            </div>
            <div>
              <div className="contact-channel-title">Studio</div>
              <div className="contact-channel-value">Lahore, Pakistan</div>
              <div className="contact-channel-meta">
                Ships nationwide — no walk-in showroom yet
              </div>
            </div>
          </div>

          <div className="contact-channel-card" style={{ cursor: "default" }}>
            <div className="contact-channel-icon">
              <Clock size={18} strokeWidth={1.8} />
            </div>
            <div>
              <div className="contact-channel-title">Hours</div>
              <div className="contact-channel-value">
                Mon – Sat, 11am – 8pm PKT
              </div>
              <div className="contact-channel-meta">
                Closed Sundays and public holidays
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
