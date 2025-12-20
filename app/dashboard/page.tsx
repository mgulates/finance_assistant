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
  wallet: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" />
      <path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" />
    </svg>
  ),
  creditCard: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="14" x="2" y="5" rx="2" />
      <line x1="2" x2="22" y1="10" y2="10" />
    </svg>
  ),
  trendingUp: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  ),
  trendingDown: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 17 13.5 8.5 8.5 13.5 2 7" />
      <polyline points="16 17 22 17 22 11" />
    </svg>
  ),
  pieChart: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
      <path d="M22 12A10 10 0 0 0 12 2v10z" />
    </svg>
  ),
  target: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  ),
  arrowRight: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  ),
  plus: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  ),
};

interface MonthlyData {
  month: string;
  income: number;
  expense: number;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [summaryRes, expensesRes, incomesRes] = await Promise.all([
          fetch("/api/dashboard/summary"),
          fetch("/api/expenses"),
          fetch("/api/incomes"),
        ]);

        const summary = await summaryRes.json();
        const expensesData = await expensesRes.json();
        const incomesData = await incomesRes.json();

        const allExpenses = expensesData.expenses || [];
        const allIncomes = incomesData.incomes || [];

        setData(summary);
        setExpenses(allExpenses.slice(0, 5));
        setIncomes(allIncomes.slice(0, 5));

        // Aylık veri hesapla
        const monthly = calculateMonthlyData(allIncomes, allExpenses);
        setMonthlyData(monthly);
      } catch (error) {
        console.error("Veri yüklenemedi:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const calculateMonthlyData = (incomes: Income[], expenses: Expense[]): MonthlyData[] => {
    const months: MonthlyData[] = [];
    const now = new Date();
    const monthNames = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"];

    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = date.getFullYear();
      const month = date.getMonth();

      const monthIncome = incomes
        .filter((item) => {
          const itemDate = new Date(item.date);
          return itemDate.getFullYear() === year && itemDate.getMonth() === month;
        })
        .reduce((sum, item) => sum + Number(item.amount), 0);

      const monthExpense = expenses
        .filter((item) => {
          const itemDate = new Date(item.date);
          return itemDate.getFullYear() === year && itemDate.getMonth() === month;
        })
        .reduce((sum, item) => sum + Number(item.amount), 0);

      months.push({
        month: monthNames[month],
        income: monthIncome,
        expense: monthExpense,
      });
    }

    return months;
  };

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
    });
  };

  const getHealthColor = (score: number) => {
    if (score >= 70) return "var(--green)";
    if (score >= 40) return "var(--orange)";
    return "var(--red)";
  };

  if (loading) {
    return (
      <div style={{ padding: "2rem" }}>
        <div style={{ height: "40px", width: "200px", marginBottom: "2rem" }} className="skeleton"></div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1.5rem", marginBottom: "2rem" }}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} style={{ height: "140px", borderRadius: "20px" }} className="skeleton"></div>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "1.5rem" }}>
          <div style={{ height: "400px", borderRadius: "20px" }} className="skeleton"></div>
          <div style={{ height: "400px", borderRadius: "20px" }} className="skeleton"></div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem" }} className="animate-fade-in">
      {/* Header */}
      <div style={{ marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "0.25rem" }}>
            Merhaba, Demo User 👋
          </h1>
          <p style={{ fontSize: "0.9375rem", color: "var(--text-muted)" }}>
            İşte bugünkü finansal özetiniz
          </p>
        </div>
        <div style={{ textAlign: "right" }}>
          <p style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>
            {new Date().toLocaleDateString("tr-TR", { weekday: "long" })}
          </p>
          <p style={{ fontSize: "0.9375rem", fontWeight: 600, color: "var(--text-primary)" }}>
            {new Date().toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1.5rem", marginBottom: "2rem" }}>
        {/* Total Balance */}
        <div className="stat-card" style={{ background: "linear-gradient(135deg, var(--blue) 0%, #2563eb 100%)", border: "none" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "white" }}>
              {Icons.wallet}
            </div>
          </div>
          <p style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.8)", marginBottom: "0.25rem" }}>Toplam Bakiye</p>
          <p style={{ fontSize: "1.75rem", fontWeight: 700, color: "white" }}>{formatCurrency(data?.balance || 0)}</p>
        </div>

        {/* Total Income */}
        <div className="stat-card">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
            <div className="stat-icon" style={{ background: "var(--green-light)", color: "var(--green)" }}>
              {Icons.trendingUp}
            </div>
            <span className="badge badge-green">+12%</span>
          </div>
          <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", marginBottom: "0.25rem" }}>Toplam Gelir</p>
          <p style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--green)" }}>{formatCurrency(data?.totalIncome || 0)}</p>
        </div>

        {/* Total Expense */}
        <div className="stat-card">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
            <div className="stat-icon" style={{ background: "var(--red-light)", color: "var(--red)" }}>
              {Icons.trendingDown}
            </div>
            <span className="badge badge-red">-5%</span>
          </div>
          <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", marginBottom: "0.25rem" }}>Toplam Gider</p>
          <p style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--red)" }}>{formatCurrency(data?.totalExpense || 0)}</p>
        </div>

        {/* Health Score */}
        <div className="stat-card">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
            <div className="stat-icon" style={{ background: "var(--purple-light)", color: "var(--purple)" }}>
              {Icons.pieChart}
            </div>
            <div 
              style={{ 
                width: "48px", 
                height: "48px", 
                borderRadius: "50%", 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center",
                background: `conic-gradient(${getHealthColor(data?.healthScore || 0)} ${(data?.healthScore || 0) * 3.6}deg, var(--bg-hover) 0deg)`,
              }}
            >
              <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "var(--bg-card)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 700 }}>
                {data?.healthScore || 0}
              </div>
            </div>
          </div>
          <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", marginBottom: "0.25rem" }}>Finansal Sağlık</p>
          <p style={{ fontSize: "1.5rem", fontWeight: 700, color: getHealthColor(data?.healthScore || 0) }}>{data?.healthScore || 0}/100</p>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "1.5rem", marginBottom: "2rem" }}>
        {/* Chart Area */}
        <div className="card">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
            <h2 style={{ fontSize: "1.125rem", fontWeight: 600 }}>Gelir & Gider Özeti</h2>
          </div>

          {/* Line Chart */}
          <div style={{ height: "280px", position: "relative" }}>
            {(() => {
              const maxValue = Math.max(
                ...monthlyData.map((d) => Math.max(d.income, d.expense)),
                1
              );
              const chartWidth = 430;
              const chartHeight = 150;
              const startX = 50;
              const startY = 30;
              const stepX = chartWidth / (monthlyData.length - 1 || 1);

              // Gelir ve gider çizgileri için path oluştur
              const incomePoints = monthlyData.map((d, i) => {
                const x = startX + i * stepX;
                const y = startY + chartHeight - (d.income / maxValue) * chartHeight;
                return `${i === 0 ? "M" : "L"} ${x} ${y}`;
              }).join(" ");

              const expensePoints = monthlyData.map((d, i) => {
                const x = startX + i * stepX;
                const y = startY + chartHeight - (d.expense / maxValue) * chartHeight;
                return `${i === 0 ? "M" : "L"} ${x} ${y}`;
              }).join(" ");

              // Area fill için path
              const incomeAreaPath = monthlyData.length > 0
                ? `${incomePoints} L ${startX + (monthlyData.length - 1) * stepX} ${startY + chartHeight} L ${startX} ${startY + chartHeight} Z`
                : "";
              const expenseAreaPath = monthlyData.length > 0
                ? `${expensePoints} L ${startX + (monthlyData.length - 1) * stepX} ${startY + chartHeight} L ${startX} ${startY + chartHeight} Z`
                : "";

              return (
                <svg viewBox="0 0 500 220" style={{ width: "100%", height: "100%" }}>
                  {/* Gradients */}
                  <defs>
                    <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--green)" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="var(--green)" stopOpacity="0" />
                    </linearGradient>
                    <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--red)" stopOpacity="0.2" />
                      <stop offset="100%" stopColor="var(--red)" stopOpacity="0" />
                    </linearGradient>
                  </defs>

                  {/* Grid lines */}
                  <line x1="50" y1="30" x2="480" y2="30" stroke="var(--border-light)" strokeDasharray="4" />
                  <line x1="50" y1="80" x2="480" y2="80" stroke="var(--border-light)" strokeDasharray="4" />
                  <line x1="50" y1="130" x2="480" y2="130" stroke="var(--border-light)" strokeDasharray="4" />
                  <line x1="50" y1="180" x2="480" y2="180" stroke="var(--border-light)" />

                  {/* Area fills */}
                  {monthlyData.length > 0 && (
                    <>
                      <path d={incomeAreaPath} fill="url(#incomeGradient)" />
                      <path d={expenseAreaPath} fill="url(#expenseGradient)" />
                    </>
                  )}

                  {/* Income Line */}
                  {monthlyData.length > 0 && (
                    <path
                      d={incomePoints}
                      fill="none"
                      stroke="var(--green)"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  )}

                  {/* Expense Line */}
                  {monthlyData.length > 0 && (
                    <path
                      d={expensePoints}
                      fill="none"
                      stroke="var(--red)"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  )}

                  {/* Data points */}
                  {monthlyData.map((d, i) => {
                    const x = startX + i * stepX;
                    const incomeY = startY + chartHeight - (d.income / maxValue) * chartHeight;
                    const expenseY = startY + chartHeight - (d.expense / maxValue) * chartHeight;
                    return (
                      <g key={d.month}>
                        <circle cx={x} cy={incomeY} r="5" fill="var(--green)" />
                        <circle cx={x} cy={expenseY} r="5" fill="var(--red)" />
                      </g>
                    );
                  })}

                  {/* Month Labels */}
                  {monthlyData.map((d, i) => {
                    const x = startX + i * stepX;
                    return (
                      <text
                        key={d.month}
                        x={x}
                        y="200"
                        textAnchor="middle"
                        fill="var(--text-muted)"
                        fontSize="11"
                      >
                        {d.month}
                      </text>
                    );
                  })}

                  {/* Y Axis Labels */}
                  <text x="40" y="35" textAnchor="end" fill="var(--text-muted)" fontSize="10">
                    {formatCurrency(maxValue)}
                  </text>
                  <text x="40" y="85" textAnchor="end" fill="var(--text-muted)" fontSize="10">
                    {formatCurrency(maxValue * 0.66)}
                  </text>
                  <text x="40" y="135" textAnchor="end" fill="var(--text-muted)" fontSize="10">
                    {formatCurrency(maxValue * 0.33)}
                  </text>
                  <text x="40" y="180" textAnchor="end" fill="var(--text-muted)" fontSize="10">
                    ₺0
                  </text>
                </svg>
              );
            })()}
          </div>

          {/* Legend */}
          <div style={{ display: "flex", gap: "2rem", marginTop: "1rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: "var(--green)" }}></div>
              <span style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>Gelir</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: "var(--red)" }}></div>
              <span style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>Gider</span>
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="card">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
            <h2 style={{ fontSize: "1.125rem", fontWeight: 600 }}>Son İşlemler</h2>
            <a href="/expenses" style={{ fontSize: "0.875rem", color: "var(--blue)", textDecoration: "none" }}>
              Tümü →
            </a>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {expenses.slice(0, 4).map((expense) => (
              <div key={expense.id} className="list-item">
                <div 
                  className="list-item-icon"
                  style={{ background: expense.category?.color ? `${expense.category.color}20` : "var(--red-light)", color: expense.category?.color || "var(--red)" }}
                >
                  {Icons.creditCard}
                </div>
                <div className="list-item-content">
                  <div className="list-item-title">{expense.title}</div>
                  <div className="list-item-subtitle">{formatDate(expense.date)}</div>
                </div>
                <div className="list-item-value expense">-{formatCurrency(expense.amount)}</div>
              </div>
            ))}

            {incomes.slice(0, 2).map((income) => (
              <div key={income.id} className="list-item">
                <div 
                  className="list-item-icon"
                  style={{ background: "var(--green-light)", color: "var(--green)" }}
                >
                  {Icons.wallet}
                </div>
                <div className="list-item-content">
                  <div className="list-item-title">{income.title}</div>
                  <div className="list-item-subtitle">{formatDate(income.date)}</div>
                </div>
                <div className="list-item-value income">+{formatCurrency(income.amount)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h2 style={{ fontSize: "1.125rem", fontWeight: 600, marginBottom: "1.25rem" }}>Hızlı İşlemler</h2>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
          <a href="/expenses" className="btn btn-primary" style={{ gap: "0.5rem" }}>
            {Icons.plus} Gider Ekle
          </a>
          <a href="/incomes" className="btn btn-success" style={{ gap: "0.5rem" }}>
            {Icons.plus} Gelir Ekle
          </a>
          <a href="/budgets" className="btn btn-secondary" style={{ gap: "0.5rem" }}>
            {Icons.pieChart} Bütçe Ayarla
          </a>
          <a href="/targets" className="btn btn-secondary" style={{ gap: "0.5rem" }}>
            {Icons.target} Hedef Belirle
          </a>
          <a href="/analysis" className="btn btn-outline" style={{ gap: "0.5rem" }}>
            {Icons.trendingUp} AI Analiz
          </a>
        </div>
      </div>
    </div>
  );
}
