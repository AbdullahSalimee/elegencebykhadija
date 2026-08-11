"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Shirt,
  ClipboardList,
  Settings,
  Images,
  ArrowLeft,
  LogOut,
  Menu,
  X,
} from "lucide-react";

const NAV = [
  {
    group: "Overview",
    items: [
      {
        href: "/admin",
        label: "Dashboard",
        icon: LayoutDashboard,
        exact: true,
      },
    ],
  },
  {
    group: "Catalogue",
    items: [
      { href: "/admin/products", label: "Products & Stock", icon: Shirt },
    ],
  },
  {
    group: "Sales",
    items: [{ href: "/admin/orders", label: "Orders", icon: ClipboardList }],
  },
  {
    group: "Site",
    items: [
      { href: "/admin/content", label: "Homepage & Content", icon: Images },
      {
        href: "/admin/settings",
        label: "Navigation & Categories",
        icon: Settings,
      },
    ],
  },
];

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sideOpen, setSideOpen] = useState(false);

  const logout = async () => {
    await fetch("/api/admin/logout", { method: "POST" }).catch(() => {});
    router.replace("/admin/login");
    router.refresh();
  };

  const isActive = (item) =>
    item.exact ? pathname === item.href : pathname?.startsWith(item.href);

  // The sidebar is a drawer on small screens: close it on navigation,
  // on Escape, and lock the page behind it while it is open.
  useEffect(() => setSideOpen(false), [pathname]);

  // The login page lives under /admin so the middleware's path rules stay
  // simple, but it must not render the console shell around itself — the
  // sidebar links would be visible to someone who hasn't signed in yet.
  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (!sideOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => e.key === "Escape" && setSideOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [sideOpen]);

  // After the hooks, never before — an early return above them would change
  // the hook count between routes and break the rules of hooks.
  if (isLoginPage) return children;

  return (
    <div className="admin-shell">
      {sideOpen && (
        <div className="admin-side-backdrop" onClick={() => setSideOpen(false)} />
      )}
      <aside className={`admin-side${sideOpen ? " admin-side-open" : ""}`}>
        <div className="admin-side-head">
          <div>
            <div className="admin-side-brand">
              ELEGANCE <span>by Khadija</span>
            </div>
            <div className="admin-side-tag">Back of Shop</div>
          </div>
          <button
            className="btn btn-icon admin-side-close"
            aria-label="Close menu"
            onClick={() => setSideOpen(false)}
          >
            <X size={18} strokeWidth={1.8} />
          </button>
        </div>

        {NAV.map((section) => (
          <div className="admin-nav-group" key={section.group}>
            <div className="admin-nav-label">{section.group}</div>
            {section.items.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`admin-nav-link${isActive(item) ? " active" : ""}`}
                >
                  <Icon size={16} strokeWidth={1.8} />
                  {item.label}
                </Link>
              );
            })}
          </div>
        ))}

        <div className="admin-side-footer">
          <Link href="/" className="admin-back-link">
            <ArrowLeft size={14} strokeWidth={1.8} />
            Back to storefront
          </Link>
          <button className="admin-back-link" onClick={logout}>
            <LogOut size={14} strokeWidth={1.8} />
            Log out
          </button>
        </div>
      </aside>

      <div className="admin-main">
        <div className="admin-topbar">
          <div className="admin-topbar-left">
            <button
              className="btn btn-icon admin-menu-btn"
              aria-label="Open menu"
              aria-expanded={sideOpen}
              onClick={() => setSideOpen(true)}
            >
              <Menu size={20} strokeWidth={1.8} />
            </button>
            <div>
              <div className="admin-topbar-title">Boutique Console</div>
              <div className="admin-topbar-meta">
                Lahore, Pakistan · Monday, 3 August 2026
              </div>
            </div>
          </div>
          <div className="admin-avatar">K</div>
        </div>
        <main className="admin-content">{children}</main>
      </div>
    </div>
  );
}
