"use client";

import { useEffect, useState } from "react";

export default function IncomeList() {
  const [items, setItems] = useState<any[]>([]);
  useEffect(() => {
    (async () => {
      const res = await fetch("/api/incomes", { cache: "no-store" });
      if (res.ok) setItems(await res.json());
    })();
  }, []);
  return (
    <div>
      {items.map((i) => (
        <div key={i.id} style={{ display: "flex", justifyContent: "space-between", padding: 8 }}>
          <div>{i.title ?? "Income"}</div>
          <div>{i.amount} ₺</div>
        </div>
      ))}
    </div>
  );
}