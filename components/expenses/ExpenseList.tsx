"use client";

import { useEffect, useState } from "react";

type Expense = {
  id: string;
  title: string;
  amount: string | number;
  date: string;
  paymentType?: string;
  note?: string | null;
  isRecurring?: boolean;
};

export default function ExpenseList() {
  const [items, setItems] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/expenses", { cache: "no-store" });
      if (!res.ok) throw new Error(await res.text());
      setItems(await res.json());
    } catch (e: any) {
      setError(e.message || "Failed to load expenses");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  if (loading) return <p>Loading…</p>;
  if (error) return <p style={{ color: "tomato" }}>{error}</p>;
  if (items.length === 0) return <p>No expenses yet.</p>;

  return (
    <ul style={{ listStyle: "none", padding: 0 }}>
      {items.map((e) => (
        <li key={e.id} style={{ display: "flex", justifyContent: "space-between", padding: 8, borderBottom: "1px solid #eee" }}>
          <div>
            <strong>{e.title}</strong>
            <div style={{ fontSize: 12, color: "#6b7280" }}>{new Date(e.date).toLocaleDateString()} • {e.paymentType}{e.isRecurring ? " • recurring" : ""}</div>
            {e.note && <div style={{ fontSize: 13 }}>{e.note}</div>}
          </div>
          <div style={{ fontWeight: 700 }}>{typeof e.amount === "string" ? e.amount : Number(e.amount).toFixed(2)} ₺</div>
        </li>
      ))}
    </ul>
  );
}