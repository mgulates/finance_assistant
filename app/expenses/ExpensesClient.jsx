"use client";

import { useEffect, useState } from "react";

export default function ExpensesClient() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState("");
  const [paymentType, setPaymentType] = useState("CARD");
  const [isRecurring, setIsRecurring] = useState(false);

  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/expenses", { cache: "no-store" });
      if (!res.ok) throw new Error(await res.text());
      setItems(await res.json());
    } catch (e) {
      setError(e.message || "Failed to load expenses");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function submit(e) {
    e.preventDefault();
    setError(null);

    if (!title.trim()) return setError("Title is required.");
    if (!amount || Number.isNaN(Number(amount))) return setError("Amount must be a number.");

    setSubmitting(true);
    try {
      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, amount, date, note: note || null, paymentType, isRecurring }),
      });

      if (!res.ok) throw new Error(await res.text());

      setTitle("");
      setAmount("");
      setNote("");
      setIsRecurring(false);

      await load();
    } catch (e) {
      setError(e.message || "Failed to create expense");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <section style={card}>
        <h2 style={{ margin: 0 }}>Add Expense</h2>

        <form onSubmit={submit} style={{ display: "grid", gap: 12, marginTop: 12 }}>
          <label style={label}>
            Title
            <input value={title} onChange={(e) => setTitle(e.target.value)} style={input} />
          </label>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <label style={label}>
              Amount (₺)
              <input value={amount} onChange={(e) => setAmount(e.target.value)} style={input} />
            </label>

            <label style={label}>
              Date
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={input} />
            </label>
          </div>

          <label style={label}>
            Payment Type
            <select value={paymentType} onChange={(e) => setPaymentType(e.target.value)} style={input}>
              <option value="CARD">CARD</option>
              <option value="CASH">CASH</option>
              <option value="TRANSFER">TRANSFER</option>
              <option value="OTHER">OTHER</option>
            </select>
          </label>

          <label style={label}>
            Note (optional)
            <input value={note} onChange={(e) => setNote(e.target.value)} style={input} />
          </label>

          <label style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <input type="checkbox" checked={isRecurring} onChange={(e) => setIsRecurring(e.target.checked)} />
            Recurring
          </label>

          {error && <p style={{ color: "tomato", margin: 0 }}>{error}</p>}

          <button disabled={submitting} style={btn} type="submit">
            {submitting ? "Adding..." : "Add"}
          </button>
        </form>
      </section>

      <section style={card}>
        <h2 style={{ margin: 0 }}>Expenses</h2>

        {loading ? (
          <p style={{ opacity: 0.8 }}>Loading…</p>
        ) : items.length === 0 ? (
          <p style={{ opacity: 0.8 }}>No expenses yet.</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0, marginTop: 12, display: "grid", gap: 10 }}>
            {items.map((e) => (
              <li key={e.id} style={row}>
                <div style={{ display: "grid", gap: 4 }}>
                  <strong>{e.title}</strong>
                  <span style={{ opacity: 0.8, fontSize: 13 }}>
                    {new Date(e.date).toLocaleDateString("tr-TR")} • {e.paymentType}
                    {e.isRecurring ? " • recurring" : ""}
                  </span>
                  {e.note && <span style={{ opacity: 0.8, fontSize: 13 }}>{e.note}</span>}
                </div>
                <div style={{ fontWeight: 700 }}>{e.amount} ₺</div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

const card = {
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 12,
  padding: 16,
};

const label = { display: "grid", gap: 6 };

const input = {
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid rgba(255,255,255,0.18)",
  background: "rgba(0,0,0,0.25)",
  color: "inherit",
};

const btn = {
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid rgba(255,255,255,0.22)",
  background: "rgba(255,255,255,0.12)",
  color: "inherit",
  cursor: "pointer",
  fontWeight: 700,
};

const row = {
  padding: 12,
  borderRadius: 10,
  background: "rgba(255,255,255,0.06)",
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
};
