"use client";

import React from "react";

export default function NewsPage() {
  const [items, setItems] = React.useState<any[]>([]);

  React.useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/news");
        if (!res.ok) return;
        setItems(await res.json());
      } catch {}
    })();
  }, []);

  return (
    <main style={{ padding: 24, maxWidth: 900, margin: "0 auto" }}>
      <h1 style={{ fontSize: 28, fontWeight: 700 }}>News</h1>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {items.map((n) => (
          <li key={n.id} style={{ padding: 12, borderBottom: "1px solid #eee" }}>
            <a href={n.link ?? "#"} target="_blank" rel="noreferrer" style={{ fontWeight: 700 }}>{n.title}</a>
            {n.summary && <p style={{ marginTop: 6 }}>{n.summary}</p>}
          </li>
        ))}
      </ul>
    </main>
  );
}