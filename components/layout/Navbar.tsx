
import Link from "next/link";

export default function Navbar() {
  return (
    <nav style={{ padding: 12, borderBottom: "1px solid #e5e7eb", display: "flex", gap: 12 }}>
      <Link href="/">Home</Link>
      <Link href="/expenses">Expenses</Link>
      <Link href="/incomes">Incomes</Link>
      <Link href="/budgets">Budgets</Link>
      <Link href="/news">News</Link>
    </nav>
  );
}