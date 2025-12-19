"use client";

import { useState } from "react";

export default function ExpenseForm({ onAdded }: { onAdded?: () => void }) {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [paymentType, setPaymentType] = useState("CARD");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!title.trim()) return setError("Title is required");
    if (!amount || Number.isNaN(Number(amount))) return setError("Amount must be a number");

    setSubmitting(true);
    try {
      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, amount, date, paymentType }),
      });
      if (!res.ok) throw new Error(await res.text());
      setTitle("");
      setAmount("");
      setPaymentType("CARD");
      onAdded?.();
    } catch (err: any) {
      setError(err.message || "Failed to create expense");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={submit} style={{ display: "grid", gap: 8 }}>
      <input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
      <input placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} />
      <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      <select value={paymentType} onChange={(e) => setPaymentType(e.target.value)}>
        <option value="CARD">CARD</option>
        <option value="CASH">CASH</option>
        <option value="TRANSFER">TRANSFER</option>
        <option value="OTHER">OTHER</option>
      </select>
      {error && <div style={{ color: "tomato" }}>{error}</div>}
      <button type="submit" disabled={submitting}>{submitting ? "Adding..." : "Add Expense"}</button>
    </form>
  );
}