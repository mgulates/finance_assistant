"use client";

import React from "react";

export default function BudgetsPage() {
  const [items, setItems] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/budgets");
        if (!res.ok) { setItems([]); return; }
        setItems(await res.json());
      } catch {
        setItems([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <main style={{ padding: 24, maxWidth: 900, margin: "0 auto" }}>
      <h1 style={{ fontSize: 28, fontWeight: 700 }}>Budgets</h1>
      {loading ? <p>Loading…</p> : items.length === 0 ? <p>No budgets found.</p> : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {items.map((b) => (
            <li key={b.id} style={{ display: "flex", justifyContent: "space-between", padding: 8, borderBottom: "1px solid #eee" }}>
              <div>
                <strong>{b.category?.name ?? "General"}</strong>
                <div style={{ fontSize: 12, color: "#6b7280" }}>{b.month}/{b.year}</div>
              </div>
              <div>{b.spent ?? 0} / {b.limit ?? 0} ₺</div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}