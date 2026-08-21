"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import AnnounceBar from "@/components/AnnounceBar";
import { useCart } from "@/lib/cart-context";
import { useSession, apiLogout } from "@/hooks/useSession";
import { useOrderUpdates } from "@/hooks/useOrderUpdates";
import { Search, User, ShoppingBag, Menu, X, ChevronDown } from "lucide-react";

function BrandMark({ priority = false }) {
  return (
    <a className="eth-brand" href="/" aria-label="Elegance by Khadija — home">
      <Image
        className="brand-mark"
        src="/logo.webp"
        alt=""
        width={96}
        height={144}
        priority={priority}
      />
      <span className="eth-brand-text">
        ELEGANCE <span className="eth-brand-sub">by Khadija</span>
      </span>
    </a>
  );
}

// The interactive half of the site chrome. Content (mega menu, utility links,
// announcements) is fetched by components/Nav.js — the Server Component that
// wraps this — and passed down, so the header renders complete in the HTML
// instead of appearing after hydration on every page.
//
// `overlay` lifts the whole chrome out of the flow so it floats over the
// element below it — used by the landing page so the hero shows through.
export default function NavClient({
  overlay = false,
  megaNav = [],
  utilityLinks = [],
  announcements = [],
}) {
  const { cartCount, openCart } = useCart();
  const { customer, isLoggedIn, mutate: mutateSession } = useSession();
  const { updatedOrders, updatedCount, statusLabel } = useOrderUpdates();
  const router = useRouter();

  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  // Which mega panel is open on desktop, and which drawer group is expanded on
  // mobile. Separate pieces of state because the two menus can never be
  // visible at the same time.
  const [openPanel, setOpenPanel] = useState(null);
  const [openGroup, setOpenGroup] = useState(null);

  const [searchOpen, setSearchOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const searchRef = useRef(null);
  const accountRef = useRef(null);
  const searchInputRef = useRef(null);

  // Lock the page behind the drawer, and close on Escape.
  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => e.key === "Escape" && setMenuOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  // Past the first scroll the chrome has to go solid, or white-on-image text
  // ends up sitting on white page content.
  useEffect(() => {
    if (!overlay) return;
    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [overlay]);

  // Escape also backs out of an open mega panel.
  useEffect(() => {
    if (!openPanel) return;
    const onKey = (e) => e.key === "Escape" && setOpenPanel(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openPanel]);

  // Close the search/account flyouts on outside click or Escape.
  useEffect(() => {
    const onClick = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) setSearchOpen(false);
      if (accountRef.current && !accountRef.current.contains(e.target)) setAccountOpen(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") {
        setSearchOpen(false);
        setAccountOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus();
  }, [searchOpen]);

  const toggleSearch = () => {
    setAccountOpen(false);
    setOpenPanel(null);
    // Opening the box on a results page starts from the term that produced it,
    // so the next search refines this one instead of beginning from blank.
    // Read off location rather than useSearchParams(): this nav renders on
    // static pages too, and that hook would opt every one of them out of
    // static rendering.
    if (!searchOpen) {
      setSearchValue(new URLSearchParams(window.location.search).get("q") || "");
    }
    setSearchOpen((v) => !v);
  };
  const toggleAccount = () => {
    setSearchOpen(false);
    setOpenPanel(null);
    setAccountOpen((v) => !v);
  };

  const logout = async () => {
    setAccountOpen(false);
    await apiLogout().catch(() => {});
    await mutateSession();
    router.push("/");
  };

  const submitSearch = (e) => {
    e.preventDefault();
    if (!searchValue.trim()) return;
    router.push(`/shop?q=${encodeURIComponent(searchValue.trim())}`);
    setSearchOpen(false);
  };

  // An open mega panel needs a solid backdrop too — its own white surface
  // against a transparent header would look detached.
  const solid = scrolled || Boolean(openPanel);

  const chrome = (
    <>
      <AnnounceBar announcements={announcements} />

      {/* Utility row — support links only, so the category bar stays clean. */}
      <div className="eth-utility">
        {utilityLinks.map((link) => (
          <a key={link.id} href={link.href}>
            {link.label}
          </a>
        ))}
      </div>

      <header className="eth-header" onMouseLeave={() => setOpenPanel(null)}>
        <div className="eth-header-bar">
          <button
            className="btn btn-icon eth-toggle"
            aria-label="Open menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(true)}
          >
            <Menu size={22} strokeWidth={1.6} />
          </button>

          <BrandMark priority />

          <nav className="eth-nav" aria-label="Primary">
            {megaNav.map((item) => (
              // onFocus bubbles, so tabbing anywhere inside the panel keeps it
              // open — that is what makes the mega menu keyboard-reachable.
              <div
                key={item.id}
                className="eth-nav-item"
                onMouseEnter={() => setOpenPanel(item.panel ? item.id : null)}
                onFocus={() => setOpenPanel(item.panel ? item.id : null)}
              >
                <a
                  className={`eth-nav-link${item.accent ? " eth-nav-link-accent" : ""}`}
                  href={item.href}
                  aria-expanded={item.panel ? openPanel === item.id : undefined}
                >
                  {item.label}
                  {item.panel && <ChevronDown size={13} strokeWidth={2} />}
                </a>

                {/* Rendered inside the item so DOM order matches reading
                    order; it still spans the full width because the sticky
                    header is the nearest positioned ancestor. */}
                {item.panel && (
                  <div
                    className={`eth-mega${openPanel === item.id ? " eth-mega-open" : ""}`}
                    hidden={openPanel !== item.id}
                  >
                    <div className="eth-mega-inner">
                      {item.panel.columns.map((col) => (
                        <div key={col.id} className="eth-mega-col">
                          <div className="eth-mega-heading">{col.heading}</div>
                          {col.links.map((link) => (
                            <a key={link.label} href={link.href}>
                              {link.label}
                            </a>
                          ))}
                        </div>
                      ))}
                      {item.panel.feature && (
                        <a className="eth-mega-feature" href={item.panel.feature.href}>
                          <span className="eth-mega-feature-eyebrow">
                            {item.panel.feature.eyebrow}
                          </span>
                          <span className="eth-mega-feature-title">
                            {item.panel.feature.title}
                          </span>
                          <span className="eth-mega-feature-cta">Shop now →</span>
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </nav>

          <div className="eth-actions">
            <div className="nav-action-item" ref={searchRef}>
              <button
                className="btn btn-icon"
                aria-label="Search"
                aria-expanded={searchOpen}
                onClick={toggleSearch}
              >
                <Search size={19} strokeWidth={1.6} />
              </button>
              {searchOpen && (
                <div className="nav-flyout nav-search-flyout">
                  <form onSubmit={submitSearch}>
                    <input
                      ref={searchInputRef}
                      className="input"
                      style={{ flex: 1 }}
                      placeholder="Search suits, fabric…"
                      value={searchValue}
                      onChange={(e) => setSearchValue(e.target.value)}
                    />
                    <button
                      className="btn btn-icon"
                      type="submit"
                      aria-label="Submit search"
                    >
                      <Search size={15} strokeWidth={2} />
                    </button>
                  </form>
                </div>
              )}
            </div>

            <div className="nav-action-item" ref={accountRef}>
              <button
                className="btn btn-icon eth-action-account"
                aria-label={
                  updatedCount > 0
                    ? `Account — ${updatedCount} order update${updatedCount > 1 ? "s" : ""}`
                    : "Account"
                }
                aria-expanded={accountOpen}
                onClick={toggleAccount}
              >
                <User size={19} strokeWidth={1.6} />
                {updatedCount > 0 && (
                  <span className="nav-alert-dot" aria-hidden="true" />
                )}
              </button>
              {accountOpen && (
                <div className="nav-flyout nav-account-flyout">
                  {isLoggedIn ? (
                    <>
                      <div style={{ fontSize: 12, opacity: 0.6, padding: "2px 0 6px" }}>
                        Signed in as {customer.name}
                      </div>
                      {updatedOrders.map((o) => (
                        <a
                          key={o.id}
                          href="/track"
                          className="nav-account-update"
                          onClick={() => setAccountOpen(false)}
                        >
                          <span className="nav-alert-dot static" aria-hidden="true" />
                          {o.id} is now {statusLabel(o.status)}
                        </a>
                      ))}
                      <a href="/track" onClick={() => setAccountOpen(false)}>
                        My orders
                      </a>
                      <a href="/contact" onClick={() => setAccountOpen(false)}>
                        Contact us
                      </a>
                      <button
                        className="btn-ghost"
                        style={{ textAlign: "left", padding: 0, font: "inherit" }}
                        onClick={logout}
                      >
                        Log out
                      </button>
                    </>
                  ) : (
                    <>
                      <a href="/login" onClick={() => setAccountOpen(false)}>
                        Log in
                      </a>
                      <a href="/track" onClick={() => setAccountOpen(false)}>
                        My orders
                      </a>
                      <a href="/contact" onClick={() => setAccountOpen(false)}>
                        Contact us
                      </a>
                    </>
                  )}
                </div>
              )}
            </div>

            <button className="btn btn-icon" aria-label="Cart" onClick={openCart}>
              <ShoppingBag size={19} strokeWidth={1.6} />
              {cartCount > 0 && <span className="nav-cart-badge">{cartCount}</span>}
            </button>
          </div>
        </div>
      </header>
    </>
  );

  return (
    <>
      {overlay ? (
        <div className={`eth-chrome-overlay${solid ? " eth-chrome-solid" : ""}`}>
          {chrome}
        </div>
      ) : (
        chrome
      )}

      {menuOpen && (
        <div className="nav-backdrop" onClick={() => setMenuOpen(false)} />
      )}

      <div
        className={`nav-drawer${menuOpen ? " nav-drawer-open" : ""}`}
        aria-hidden={!menuOpen}
      >
        <div className="nav-drawer-head">
          <BrandMark />
          <button
            className="btn btn-icon"
            aria-label="Close menu"
            tabIndex={menuOpen ? 0 : -1}
            onClick={() => setMenuOpen(false)}
          >
            <X size={20} strokeWidth={1.8} />
          </button>
        </div>

        {megaNav.map((item) =>
          item.panel ? (
            // Mega menus become accordions on mobile rather than being
            // dropped, so nothing in the desktop menu is unreachable there.
            <div key={item.id} className="eth-drawer-group">
              <button
                className="eth-drawer-trigger"
                tabIndex={menuOpen ? 0 : -1}
                aria-expanded={openGroup === item.id}
                onClick={() =>
                  setOpenGroup((cur) => (cur === item.id ? null : item.id))
                }
              >
                {item.label}
                <ChevronDown
                  size={16}
                  strokeWidth={2}
                  className={openGroup === item.id ? "eth-chev-open" : ""}
                />
              </button>
              {openGroup === item.id && (
                <div className="eth-drawer-panel">
                  {item.panel.columns.map((col) => (
                    <div key={col.id}>
                      <div className="eth-mega-heading">{col.heading}</div>
                      {col.links.map((link) => (
                        <a
                          key={link.label}
                          href={link.href}
                          tabIndex={menuOpen ? 0 : -1}
                          onClick={() => setMenuOpen(false)}
                        >
                          {link.label}
                        </a>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <a
              key={item.id}
              className={item.accent ? "eth-drawer-accent" : undefined}
              href={item.href}
              tabIndex={menuOpen ? 0 : -1}
              onClick={() => setMenuOpen(false)}
            >
              {item.label}
            </a>
          ),
        )}

        {/* Account and order links, so everything in the desktop flyouts is
            reachable from the phone drawer too. */}
        <div className="eth-drawer-account">
          {isLoggedIn ? (
            <>
              <a
                href="/track"
                tabIndex={menuOpen ? 0 : -1}
                onClick={() => setMenuOpen(false)}
              >
                My orders
                {updatedCount > 0 && (
                  <span className="nav-alert-dot static" aria-hidden="true" />
                )}
              </a>
              <button
                className="btn-ghost"
                style={{ textAlign: "left", padding: 0, font: "inherit" }}
                tabIndex={menuOpen ? 0 : -1}
                onClick={() => {
                  setMenuOpen(false);
                  logout();
                }}
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <a
                href="/login"
                tabIndex={menuOpen ? 0 : -1}
                onClick={() => setMenuOpen(false)}
              >
                Log in
              </a>
              <a
                href="/track"
                tabIndex={menuOpen ? 0 : -1}
                onClick={() => setMenuOpen(false)}
              >
                Track an order
              </a>
            </>
          )}
        </div>

        <div className="eth-drawer-utility">
          {utilityLinks.map((link) => (
            <a
              key={link.id}
              href={link.href}
              tabIndex={menuOpen ? 0 : -1}
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </>
  );
}
