import { useState, useEffect } from 'react';
import { NavLink, useLocation } from "react-router-dom";
import { LayoutDashboard, ScrollText, Boxes, Settings, AlertCircle, Users, Menu, X } from "lucide-react";
import { useSariData } from "../hooks/useSariData";

const navItems = [
  { label: "Dashboard", to: "/", icon: LayoutDashboard },
  { label: "Ledger", to: "/ledger", icon: ScrollText },
  { label: "Customers", to: "/customers", icon: Users },
  { label: "Inventory", to: "/inventory", icon: Boxes },
  { label: "Settings", to: "/settings", icon: Settings },
];

function Layout({ children }) {
  const { items } = useSariData();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);
  const lowStockCount = items.filter((item) => item.stockCount < 5).length;

  const pageTitle = (() => {
    const p = location.pathname;
    if (p === "/") return "Dashboard";
    if (p.startsWith("/ledger")) return "Ledger";
    if (p.startsWith("/customers")) return "Customers";
    if (p.startsWith("/inventory")) return "Inventory";
    if (p.startsWith("/settings")) return "Settings";
    return "SariLedger";
  })();

  return (
    <div className="flex min-h-screen bg-canvas text-ink overflow-x-hidden">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-ink/30 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={[
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-line bg-surface px-4 py-5 transition-transform duration-300 ease-in-out md:translate-x-0 md:w-60",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        ].join(' ')}
      >
        <div className="mb-8 flex items-center justify-between px-2">
          <div className="flex items-center gap-3">
            <img src="/SariLedger.png" alt="SariLedger" className="h-8 w-8 shrink-0 rounded-lg bg-white object-cover" />
            <div className="leading-tight">
              <p className="text-sm font-semibold tracking-tight text-ink">SariLedger</p>
              <p className="text-[11px] text-muted">Admin Console</p>
            </div>
          </div>
          <button
            className="md:hidden flex h-8 w-8 items-center justify-center rounded-lg text-muted hover:bg-canvas transition-colors"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-0.5">
          {navItems.map(({ label, to, icon: Icon }) => (
            <NavLink key={to} to={to} end={to === "/"}
              className={({ isActive }) => [
                "group relative flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-sm font-medium transition-all duration-150",
                isActive ? "bg-emerald/10 text-emerald" : "text-body hover:bg-canvas hover:text-ink",
              ].join(" ")}
            >
              <Icon className="h-4 w-4 shrink-0" strokeWidth={1.75} />
              <span>{label}</span>
              {label === "Inventory" && lowStockCount > 0 && (
                <span className="ml-auto flex items-center">
                  <span className="animate-pulse-dot inline-block h-2 w-2 rounded-full bg-coral" />
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {lowStockCount > 0 && (
          <div className="mt-4 flex items-center gap-2 rounded-[10px] border border-coral/20 bg-coral/5 px-3 py-2.5">
            <AlertCircle className="h-3.5 w-3.5 shrink-0 text-coral" strokeWidth={2} />
            <p className="text-[11px] font-medium text-coral">
              {lowStockCount} item{lowStockCount !== 1 ? "s" : ""} low on stock
            </p>
          </div>
        )}
      </aside>

      <div className="flex min-h-screen flex-1 flex-col md:ml-60 min-w-0">
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-line bg-surface/80 px-4 sm:px-8 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden flex h-8 w-8 items-center justify-center rounded-lg text-body hover:bg-canvas transition-colors -ml-1.5"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="text-sm font-semibold tracking-tight text-ink">{pageTitle}</h1>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="hidden sm:block text-right leading-tight">
              <p className="text-xs font-medium text-ink">Store Owner</p>
              <p className="text-[11px] text-muted">Admin</p>
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald text-[11px] font-bold text-white ring-2 ring-emerald/20">SA</div>
          </div>
        </header>
        <main className="flex-1 px-4 sm:px-8 py-5 sm:py-7 overflow-x-hidden min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}

export default Layout;
