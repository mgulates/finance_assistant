"use client";

import React from "react";

export default function TargetsPage() {
  const [items, setItems] = React.useState<any[]>([]);

  React.useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/targets");
        if (!res.ok) return setItems([]);
        setItems(await res.json());
      } catch {
        setItems([]);
      }
    })();
  }, []);

  return (
    <main style={{ padding: 24, maxWidth: 900, margin: "0 auto" }}>
      <h1 style={{ fontSize: 28, fontWeight: 700 }}>Targets</h1>
      {items.length === 0 ? <p>No targets yet.</p> : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {items.map((t) => (
            <li key={t.id} style={{ padding: 12, borderBottom: "1px solid #eee" }}>
              <strong>{t.title}</strong>
              <div style={{ fontSize: 13, color: "#6b7280" }}>{t.currentAmount} / {t.targetAmount} ₺</div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}