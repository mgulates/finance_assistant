"use client";

export default function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <header style={{ marginBottom: 16 }}>
      <h1 style={{ margin: 0, fontSize: 20 }}>{title}</h1>
      {subtitle && <p style={{ margin: 0, color: "#6b7280" }}>{subtitle}</p>}
    </header>
  );
}