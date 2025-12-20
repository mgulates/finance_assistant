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
	{ href: "/import", label: "İçe Aktar", icon: "upload" },
	{ href: "/ai", label: "AI Asistan", icon: "sparkles" },
	{ href: "/news", label: "Haberler", icon: "newspaper" },
];

const icons: Record<string, ReactNode> = {
	home: (
		<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
			<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
			<polyline points="9 22 9 12 15 12 15 22" />
		</svg>
	),
	"credit-card": (
		<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
			<rect width="20" height="14" x="2" y="5" rx="2" />
			<line x1="2" x2="22" y1="10" y2="10" />
		</svg>
	),
	wallet: (
		<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
			<path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" />
			<path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" />
		</svg>
	),
	"pie-chart": (
		<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
			<path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
			<path d="M22 12A10 10 0 0 0 12 2v10z" />
		</svg>
	),
	target: (
		<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
			<circle cx="12" cy="12" r="10" />
			<circle cx="12" cy="12" r="6" />
			<circle cx="12" cy="12" r="2" />
		</svg>
	),
	"trending-up": (
		<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
			<polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
			<polyline points="16 7 22 7 22 13" />
		</svg>
	),
	newspaper: (
		<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
			<path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" />
			<path d="M18 14h-8" />
			<path d="M15 18h-5" />
			<path d="M10 6h8v4h-8V6Z" />
		</svg>
	),
	sparkles: (
		<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
			<path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
			<path d="M5 3v4" />
			<path d="M3 5h4" />
			<path d="M19 17v4" />
			<path d="M17 19h4" />
		</svg>
	),
	upload: (
		<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
			<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
			<polyline points="17 8 12 3 7 8" />
			<line x1="12" y1="3" x2="12" y2="15" />
		</svg>
	),
	menu: (
		<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
			<line x1="4" x2="20" y1="12" y2="12" />
			<line x1="4" x2="20" y1="6" y2="6" />
			<line x1="4" x2="20" y1="18" y2="18" />
		</svg>
	),
	close: (
		<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
			<path d="M18 6 6 18" />
			<path d="m6 6 12 12" />
		</svg>
	),
};

export default function Sidebar() {
	const pathname = usePathname();
	const { collapsed, setCollapsed } = useSidebar();

	return (
		<aside className={`sidebar ${collapsed ? "collapsed" : "expanded"}`}>
			{/* Header */}
			<div className="sidebar-header">
				{/* Logo */}
				<div className="sidebar-logo">
					<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
						<path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
					</svg>
				</div>
				
				{!collapsed && (
					<div className="sidebar-brand">
						<h1 className="sidebar-title">Finance AI</h1>
						<p className="sidebar-subtitle">Finans Asistanı</p>
					</div>
				)}

				{/* Toggle Button */}
				<button className="sidebar-toggle" onClick={() => setCollapsed(!collapsed)}>
					{collapsed ? icons.menu : icons.close}
				</button>
			</div>

			{/* Navigation */}
			<nav className="sidebar-nav">
				<ul className="sidebar-menu">
					{menuItems.map((item) => {
						const isActive = pathname === item.href;
						return (
							<li key={item.href}>
								<Link
									href={item.href}
									className={`sidebar-link ${isActive ? "active" : ""}`}
									title={collapsed ? item.label : undefined}
								>
									<span className="sidebar-icon">{icons[item.icon]}</span>
									{!collapsed && <span className="sidebar-label">{item.label}</span>}
								</Link>
							</li>
						);
					})}
				</ul>
			</nav>

			{/* User Section */}
			<div className="sidebar-user">
				<div className="sidebar-user-info">
					<div className="sidebar-avatar">D</div>
					{!collapsed && (
						<div className="sidebar-user-details">
							<p className="sidebar-user-name">Demo User</p>
							<p className="sidebar-user-email">demo@example.com</p>
						</div>
					)}
				</div>
			</div>
		</aside>
	);
}
