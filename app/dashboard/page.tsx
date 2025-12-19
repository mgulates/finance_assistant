"use client";

import { useEffect, useState } from "react";

interface DashboardData {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  healthScore: number;
  currency: string;
}

interface Expense {
  id: string;
  title: string;
  amount: number;
  date: string;
  category?: { name: string; color: string; icon: string };
}

interface Income {
  id: string;
  title: string;
  amount: number;
  date: string;
  category?: { name: string; color: string };
}

const Icons = {
  home: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  heart: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>,
  plane: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/></svg>,
  utensils: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg>,
  wallet: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/></svg>,
  creditCard: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>,
  pieChart: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>,
  target: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>,
  trendingUp: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>,
};

const categoryIcons = [
  { name: "Tümü", icon: Icons.home, color: "#e8ebff" },
  { name: "Sağlık", icon: Icons.heart, color: "#fef2f2" },
  { name: "Ulaşım", icon: Icons.plane, color: "#eff6ff" },
  { name: "Yemek", icon: Icons.utensils, color: "#fff7ed" },
];

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"income" | "expenses">("income");

  useEffect(() => {
    async function fetchData() {
      try {
        const [summaryRes, expensesRes, incomesRes] = await Promise.all([
          fetch("/api/dashboard/summary"),
          fetch("/api/expenses?limit=5"),
          fetch("/api/incomes?limit=5"),
        ]);

        const summary = await summaryRes.json();
        const expensesData = await expensesRes.json();
        const incomesData = await incomesRes.json();

        setData(summary);
        setExpenses(expensesData.expenses || []);
        setIncomes(incomesData.incomes || []);
      } catch (error) {
        console.error("Veri yüklenemedi:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getHealthColor = (score: number) => {
    if (score >= 70) return "var(--success)";
    if (score >= 40) return "var(--warning)";
    return "var(--danger)";
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="h-10 w-48 skeleton rounded-xl"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="card h-80 skeleton"></div>
          </div>
          <div className="card h-80 skeleton"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold mb-1">Merhaba 👋</h1>
          <p className="text-[var(--muted-foreground)]">
            Finansal durumunuzun genel özeti
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-[var(--muted-foreground)]">Bugün</p>
          <p className="font-semibold">
            {new Date().toLocaleDateString("tr-TR", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Balance Card - Main */}
        <div className="lg:col-span-2 card">
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-[var(--muted-foreground)] mb-1">Toplam Bakiye</p>
              <h2 className="text-4xl font-bold gradient-text">
                {formatCurrency(data?.balance || 0)}
              </h2>
            </div>
            <div className="tab-group">
              <button
                className={`tab ${activeTab === "income" ? "active" : ""}`}
                onClick={() => setActiveTab("income")}
              >
                Gelir
              </button>
              <button
                className={`tab ${activeTab === "expenses" ? "active" : ""}`}
                onClick={() => setActiveTab("expenses")}
              >
                Gider
              </button>
            </div>
          </div>

          {/* Period Tabs */}
          <div className="flex gap-6 mb-6 border-b border-[var(--border)] pb-3">
            <button className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
              Gün
            </button>
            <button className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
              Hafta
            </button>
            <button className="text-sm font-semibold text-[var(--primary)] border-b-2 border-[var(--primary)] pb-3 -mb-3">
              Ay
            </button>
            <button className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
              Yıl
            </button>
          </div>

          {/* Chart Area */}
          <div className="h-48 relative">
            {/* Simple Chart Visualization */}
            <svg viewBox="0 0 400 150" className="w-full h-full">
              {/* Grid Lines */}
              <line x1="0" y1="37" x2="400" y2="37" stroke="var(--border)" strokeDasharray="4" />
              <line x1="0" y1="75" x2="400" y2="75" stroke="var(--border)" strokeDasharray="4" />
              <line x1="0" y1="112" x2="400" y2="112" stroke="var(--border)" strokeDasharray="4" />

              {/* Income Line */}
              <path
                d="M 0 100 Q 50 80 100 90 T 200 60 T 300 40 T 400 50"
                fill="none"
                stroke="var(--primary)"
                strokeWidth="3"
                strokeLinecap="round"
              />

              {/* Expense Line */}
              <path
                d="M 0 120 Q 50 110 100 100 T 200 85 T 300 90 T 400 70"
                fill="none"
                stroke="var(--accent)"
                strokeWidth="3"
                strokeLinecap="round"
              />

              {/* Tooltip */}
              <g transform="translate(200, 55)">
                <rect x="-35" y="-25" width="70" height="30" rx="8" fill="var(--primary)" />
                <text x="0" y="-5" textAnchor="middle" fill="white" fontSize="12" fontWeight="600">
                  {formatCurrency(data?.balance || 0).replace("₺", "₺ ")}
                </text>
              </g>
            </svg>

            {/* Month Labels */}
            <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-[var(--muted-foreground)]">
              <span>Haz</span>
              <span>Tem</span>
              <span>Ağu</span>
              <span className="font-semibold text-[var(--foreground)]">Eyl</span>
              <span>Eki</span>
              <span>Kas</span>
            </div>
          </div>

          {/* Credit Limit Progress */}
          <div
            className="mt-6 p-5 rounded-2xl flex items-center justify-between"
            style={{ background: "linear-gradient(135deg, var(--primary-light) 0%, #f0f4ff 100%)" }}
          >
            <div className="flex items-center gap-4">
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center"
                style={{ background: "conic-gradient(var(--primary) 270deg, var(--border) 0deg)" }}
              >
                <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-sm font-bold text-[var(--primary)]">
                  75%
                </div>
              </div>
              <div>
                <p className="font-semibold">Kredi Limitin</p>
                <p className="text-sm text-[var(--muted-foreground)]">
                  ₺39,750 / ₺53,000
                </p>
              </div>
            </div>
            <button
              className="w-12 h-12 rounded-full flex items-center justify-center text-white text-xl"
              style={{ background: "var(--accent)" }}
            >
              →
            </button>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Card Widget */}
          <div className="card">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold">Kartlarım</h3>
            </div>
            <div className="flex gap-3">
              <button className="w-16 h-16 rounded-xl border-2 border-dashed border-[var(--border)] flex items-center justify-center text-2xl text-[var(--muted-foreground)] hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors">
                +
              </button>
              <div className="credit-card flex-1">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-white/80 text-sm">•••• 6543</span>
                  <div className="flex -space-x-2">
                    <div className="w-6 h-6 rounded-full bg-white/30"></div>
                    <div className="w-6 h-6 rounded-full bg-white/50"></div>
                  </div>
                </div>
                <p className="text-white/70 text-xs">Bakiye</p>
                <p className="text-white font-bold text-lg">₺ 1,524</p>
              </div>
            </div>
          </div>

          {/* Popular Operations */}
          <div className="card">
            <h3 className="font-semibold mb-4">Popüler İşlemler</h3>
            <div className="grid grid-cols-4 gap-2">
              {categoryIcons.map((cat) => (
                <div key={cat.name} className="text-center">
                  <div
                    className="operation-icon mx-auto mb-2"
                    style={{ background: cat.color }}
                  >
                    {cat.icon}
                  </div>
                  <span className="text-xs text-[var(--muted-foreground)]">
                    {cat.name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Transactions */}
          <div className="card">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold">İşlemler</h3>
              <a
                href="/expenses"
                className="text-sm text-[var(--muted-foreground)] hover:text-[var(--primary)]"
              >
                Tümü
              </a>
            </div>
            <div className="space-y-1">
              {expenses.slice(0, 3).map((expense) => (
                <div key={expense.id} className="transaction-item">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-[var(--muted-foreground)]"
                    style={{
                      background: expense.category?.color
                        ? `${expense.category.color}15`
                        : "#f0f4ff",
                    }}
                  >
                    {Icons.creditCard}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{expense.title}</p>
                    <p className="text-xs text-[var(--muted-foreground)]">
                      {formatDate(expense.date)}
                    </p>
                  </div>
                  <span className="font-semibold text-[var(--danger)]">
                    -{formatCurrency(expense.amount)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Income */}
        <div className="stat-card">
          <div
            className="icon"
            style={{ background: "rgba(16, 185, 129, 0.1)", color: "#10b981" }}
          >
            {Icons.wallet}
          </div>
          <p className="stat-label">Toplam Gelir</p>
          <p className="stat-value text-[var(--success)]">
            {formatCurrency(data?.totalIncome || 0)}
          </p>
          <div className="flex items-center gap-1 mt-2">
            <span className="badge badge-success">↑ %12</span>
            <span className="text-xs text-[var(--muted-foreground)]">
              geçen aya göre
            </span>
          </div>
        </div>

        {/* Total Expense */}
        <div className="stat-card">
          <div
            className="icon"
            style={{ background: "rgba(239, 68, 68, 0.1)", color: "#ef4444" }}
          >
            {Icons.creditCard}
          </div>
          <p className="stat-label">Toplam Gider</p>
          <p className="stat-value text-[var(--danger)]">
            {formatCurrency(data?.totalExpense || 0)}
          </p>
          <div className="flex items-center gap-1 mt-2">
            <span className="badge badge-danger">↓ %5</span>
            <span className="text-xs text-[var(--muted-foreground)]">
              geçen aya göre
            </span>
          </div>
        </div>

        {/* Health Score */}
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <div
                className="icon"
                style={{ background: "#e8ebff", color: "#4c5fd5" }}
              >
                {Icons.pieChart}
              </div>
              <p className="stat-label">Finansal Sağlık</p>
              <p className="stat-value" style={{ color: getHealthColor(data?.healthScore || 0) }}>
                {data?.healthScore || 0}/100
              </p>
            </div>
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold"
              style={{
                background: `conic-gradient(${getHealthColor(data?.healthScore || 0)} ${(data?.healthScore || 0) * 3.6}deg, #e2e8f0 0deg)`,
              }}
            >
              <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center">
                <span style={{ color: getHealthColor(data?.healthScore || 0) }}>
                  {data?.healthScore || 0}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h2 className="font-semibold text-lg mb-4">Hızlı İşlemler</h2>
        <div className="flex flex-wrap gap-3">
          <a href="/expenses" className="btn btn-primary flex items-center gap-2">
            {Icons.creditCard} Gider Ekle
          </a>
          <a href="/incomes" className="btn btn-accent flex items-center gap-2">
            {Icons.wallet} Gelir Ekle
          </a>
          <a href="/budgets" className="btn btn-secondary flex items-center gap-2">
            {Icons.pieChart} Bütçe Ayarla
          </a>
          <a href="/targets" className="btn btn-secondary flex items-center gap-2">
            {Icons.target} Hedef Belirle
          </a>
          <a href="/analysis" className="btn btn-secondary flex items-center gap-2">
            {Icons.trendingUp} AI Analiz
          </a>
        </div>
      </div>
    </div>
  );
}
