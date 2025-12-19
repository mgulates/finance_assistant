// app/expenses/page.tsx
import ExpenseForm from "@/components/expenses/ExpenseForm";
import ExpenseList from "@/components/expenses/ExpenseList";

export default function ExpensesPage() {
  return (
    <main style={{ padding: 24, maxWidth: 900, margin: "0 auto" }}>
      <h1 style={{ fontSize: 28, fontWeight: 700 }}>Expenses</h1>
      <p style={{ opacity: 0.8, marginTop: 6 }}>
        Add a new expense and review your recent expenses below.
      </p>

      <div style={{ marginTop: 20, display: "grid", gap: 20 }}>
        <section style={{ maxWidth: 540 }}>
          <h2 style={{ fontSize: 18, marginBottom: 8 }}>Add Expense</h2>
          <ExpenseForm />
        </section>

        <section>
          <h2 style={{ fontSize: 18, marginBottom: 8 }}>Recent Expenses</h2>
          <ExpenseList />
        </section>
      </div>
    </main>
  );
}