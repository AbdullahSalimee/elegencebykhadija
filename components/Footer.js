import Image from "next/image";
import { FOOTER_COLUMNS, REGIONS } from "@/lib/site-config";

// lucide dropped its brand glyphs, so these stay as wordmarks rather than
// approximated SVG paths. Swap in real brand marks when they're supplied.
const SOCIALS = ["Facebook", "Instagram", "YouTube"];

export default function Footer() {
  return (
    <footer className="eth-footer">
      <div className="eth-footer-cols">
        {/* Newsletter leads the footer — the widest column on desktop. */}
        <div className="eth-footer-signup">
          <div className="eth-footer-heading">Join the List</div>
          <p className="eth-footer-blurb">
            New arrivals, restocks and sale access before anyone else.
          </p>
          <form className="eth-signup-row">
            <input
              className="eth-signup-input"
              type="email"
              placeholder="Email address"
              aria-label="Email address"
            />
            <button className="eth-btn eth-btn-dark" type="submit">
              Subscribe
            </button>
          </form>
          <div className="eth-socials">
            {SOCIALS.map((name) => (
              <a key={name} href="#">
                {name}
              </a>
            ))}
          </div>
        </div>

        {FOOTER_COLUMNS.map((col) => (
          <div key={col.id} className="eth-footer-col">
            <div className="eth-footer-heading">{col.heading}</div>
            {col.links.map((link) => (
              <a key={link.label} href={link.href}>
                {link.label}
              </a>
            ))}
          </div>
        ))}

        <div className="eth-footer-col">
          <div className="eth-footer-heading">Get in Touch</div>
          <span>WhatsApp: +92 323 3002222</span>
          <span>hello@elegancebykhadija.pk</span>
          <span>Lahore, Pakistan</span>
        </div>
      </div>

      <div className="eth-footer-bottom">
        <div className="eth-footer-brand">
          <Image
            className="brand-mark"
            src="/logo.webp"
            alt=""
            width={96}
            height={144}
          />
          <span>ELEGANCE by Khadija © 2026. All rights reserved.</span>
        </div>
        <label className="eth-region">
          <span className="eth-region-label">Ship to</span>
          <select className="eth-region-select" defaultValue={REGIONS[0]}>
            {REGIONS.map((region) => (
              <option key={region}>{region}</option>
            ))}
          </select>
        </label>
      </div>
    </footer>
  );
}
