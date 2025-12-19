"use client";

import IncomeList from "@/components/incomes/IncomeList";

export default function IncomesPage() {
  return (
    <main style={{ padding: 24, maxWidth: 900, margin: "0 auto" }}>
      <h1 style={{ fontSize: 28, fontWeight: 700 }}>Incomes</h1>
      <p style={{ opacity: 0.8, marginTop: 6 }}>Add or review your incomes.</p>
      <section style={{ marginTop: 20 }}>
        <IncomeList />
      </section>
    </main>
  );
}