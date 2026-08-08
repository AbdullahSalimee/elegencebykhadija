"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import { useNavLinks } from "@/hooks/useSiteConfig";
import { useSession, apiLogout } from "@/hooks/useSession";
import { useOrderUpdates } from "@/hooks/useOrderUpdates";
import { Search, User, ShoppingBag, Menu, X } from "lucide-react";

export default function Nav() {
  const { cartCount, openCart } = useCart();
  const { navLinks } = useNavLinks();
  const { customer, isLoggedIn, mutate: mutateSession } = useSession();
  const { updatedOrders, updatedCount, statusLabel } = useOrderUpdates();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const searchRef = useRef(null);
  const accountRef = useRef(null);
  const searchInputRef = useRef(null);
  const links = [...navLinks].sort((a, b) => a.order - b.order);

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
    setSearchOpen((v) => !v);
  };
  const toggleAccount = () => {
    setSearchOpen(false);
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

  return (
    <>
      <nav className="nav">
        <button
          className="btn btn-icon nav-toggle"
          aria-label="Open menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(true)}
        >
          <Menu size={20} strokeWidth={1.8} />
        </button>

        <div className="nav-brand">
          ELEGANCE{" "}
          <span style={{ opacity: 0.55, fontStyle: "italic" }}>by Khadija</span>
        </div>

        <div className="nav-links">
          {links.map((link) => (
            <a key={link.id} href={link.href}>
              {link.label}
            </a>
          ))}
        </div>

        <div className="nav-actions">
          <div className="nav-action-item" ref={searchRef}>
            <button
              className="btn btn-icon icon-tooltip"
              data-tooltip="Search"
              aria-label="Search"
              aria-expanded={searchOpen}
              onClick={toggleSearch}
            >
              <Search size={18} strokeWidth={1.8} />
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
                  <button className="btn btn-icon" type="submit" aria-label="Submit search">
                    <Search size={15} strokeWidth={2} />
                  </button>
                </form>
              </div>
            )}
          </div>

          <div className="nav-action-item" ref={accountRef}>
            <button
              className="btn btn-icon icon-tooltip"
              data-tooltip={updatedCount > 0 ? "Order update" : "Account"}
              aria-label={
                updatedCount > 0
                  ? `Account — ${updatedCount} order update${updatedCount > 1 ? "s" : ""}`
                  : "Account"
              }
              aria-expanded={accountOpen}
              onClick={toggleAccount}
            >
              <User size={18} strokeWidth={1.8} />
              {updatedCount > 0 && <span className="nav-alert-dot" aria-hidden="true" />}
            </button>
            {accountOpen && (
              <div className="nav-flyout nav-account-flyout">
                {isLoggedIn ? (
                  <>
                    <div
                      style={{ fontSize: 12, opacity: 0.6, padding: "2px 0 6px" }}
                    >
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

          <button
            className="btn btn-icon icon-tooltip"
            data-tooltip="Cart"
            aria-label="Cart"
            onClick={openCart}
          >
            <ShoppingBag size={18} strokeWidth={1.8} />
            {cartCount > 0 && <span className="nav-cart-badge">{cartCount}</span>}
          </button>
        </div>
      </nav>

      {menuOpen && (
        <div className="nav-backdrop" onClick={() => setMenuOpen(false)} />
      )}

      <div
        className={`nav-drawer${menuOpen ? " nav-drawer-open" : ""}`}
        aria-hidden={!menuOpen}
      >
        <div className="nav-drawer-head">
          <div className="nav-brand" style={{ marginRight: 0 }}>
            ELEGANCE{" "}
            <span style={{ opacity: 0.55, fontStyle: "italic" }}>
              by Khadija
            </span>
          </div>
          <button
            className="btn btn-icon"
            aria-label="Close menu"
            tabIndex={menuOpen ? 0 : -1}
            onClick={() => setMenuOpen(false)}
          >
            <X size={20} strokeWidth={1.8} />
          </button>
        </div>
        {links.map((link) => (
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
    </>
  );
}
