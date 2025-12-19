"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebar } from "./MainLayout";
import { ReactNode } from "react";

const menuItems = [
  { href: "/dashboard", label: "Dashboard", icon: "home" },
  { href: "/expenses", label: "Giderler", icon: "credit-card" },
  { href: "/incomes", label: "Gelirler", icon: "wallet" },
  { href: "/budgets", label: "Bütçe", icon: "pie-chart" },
  { href: "/targets", label: "Hedefler", icon: "target" },
  { href: "/analysis", label: "Analiz", icon: "trending-up" },
  { href: "/news", label: "Haberler", icon: "newspaper" },
];

const icons: Record<string, ReactNode> = {
  home: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  "credit-card": <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>,
  wallet: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/></svg>,
  "pie-chart": <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>,
  target: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>,
  "trending-up": <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>,
  newspaper: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/><path d="M18 14h-8"/><path d="M15 18h-5"/><path d="M10 6h8v4h-8V6Z"/></svg>,
  chevronLeft: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>,
  chevronRight: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>,
};

export default function Sidebar() {
  const pathname = usePathname();
  const { collapsed, setCollapsed } = useSidebar();

  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-[var(--card)] flex flex-col transition-all duration-300 z-50 shadow-lg ${
        collapsed ? "w-[72px]" : "w-64"
      }`}
    >
      {/* Logo */}
      <div className={`p-4 flex items-center h-16 border-b border-[var(--border)] ${collapsed ? "justify-center" : "gap-3"}`}>
        <div 
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-white"
          style={{ background: "linear-gradient(135deg, var(--primary) 0%, #7c3aed 100%)" }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
        </div>
        {!collapsed && (
          <div className="flex-1 min-w-0">
            <h1 className="font-bold text-base gradient-text">Finance AI</h1>
            <p className="text-[10px] text-[var(--muted-foreground)]">
              Finans Asistanı
            </p>
          </div>
        )}
        {/* Toggle Button - inside header */}
        {!collapsed && (
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-8 h-8 bg-[var(--secondary)] border border-[var(--border)] rounded-lg flex items-center justify-center text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] transition-all duration-200 shrink-0"
            title="Daralt"
          >
            {icons.chevronLeft}
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 overflow-y-auto">
        <ul className="flex flex-col gap-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center h-11 px-3 rounded-xl transition-all duration-200 ${
                    isActive
                      ? "bg-[var(--primary)] text-white"
                      : "text-[var(--muted-foreground)] hover:bg-[var(--secondary)] hover:text-[var(--foreground)]"
                  } ${collapsed ? "justify-center" : "gap-3"}`}
                  title={collapsed ? item.label : undefined}
                >
                  <span className="shrink-0 w-5 h-5 flex items-center justify-center">{icons[item.icon]}</span>
                  {!collapsed && (
                    <span className="font-medium text-sm whitespace-nowrap">{item.label}</span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Expand button at bottom when collapsed */}
      {collapsed && (
        <div className="px-2 py-2">
          <button
            onClick={() => setCollapsed(false)}
            className="w-full h-11 bg-[var(--secondary)] border border-[var(--border)] rounded-xl flex items-center justify-center text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] transition-all duration-200"
            title="Genişlet"
          >
            {icons.chevronRight}
          </button>
        </div>
      )}

      {/* User Section */}
      <div className="p-3 border-t border-[var(--border)]">
        <div
          className={`flex items-center p-2 rounded-xl bg-[var(--secondary)] ${
            collapsed ? "justify-center" : "gap-3"
          }`}
        >
          <div 
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-semibold shrink-0"
            style={{ background: "linear-gradient(135deg, var(--primary) 0%, #7c3aed 100%)" }}
          >
            D
          </div>
          {!collapsed && (
            <div className="overflow-hidden flex-1 min-w-0">
              <p className="font-medium text-sm truncate">Demo User</p>
              <p className="text-xs text-[var(--muted-foreground)] truncate">
                Öğrenci
              </p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
