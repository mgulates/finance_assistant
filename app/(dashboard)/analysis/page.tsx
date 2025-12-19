"use client";

import React from "react";

export default function AnalysisPage() {
  const [data, setData] = React.useState<any[]>([]);

  React.useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/analysis");
        if (!res.ok) return;
        setData(await res.json());
      } catch {}
    })();
  }, []);

  return (
    <main style={{ padding: 24, maxWidth: 900, margin: "0 auto" }}>
      <h1 style={{ fontSize: 28, fontWeight: 700 }}>Analysis</h1>
      {data.length === 0 ? (
        <p>No analysis data.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {data.map((m) => (
            <li key={m.name} style={{ padding: 12, borderBottom: "1px solid #eee" }}>
              <strong>{m.name}</strong>
              <div style={{ fontSize: 13, color: "#6b7280" }}>
                Income: {m.income} — Expense: {m.expense}
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}