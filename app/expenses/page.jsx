import ExpensesClient from "./ExpensesClient";

export default function ExpensesPage() {
  return (
    <main style={{ padding: 24, maxWidth: 900, margin: "0 auto" }}>
      <h1 style={{ fontSize: 28, fontWeight: 700 }}>Expenses</h1>
      <p style={{ opacity: 0.8, marginTop: 6 }}>
        Add a new expense and see it instantly in the list.
      </p>

      <div style={{ marginTop: 20 }}>
        <ExpensesClient />
      </div>
    </main>
  );
}
