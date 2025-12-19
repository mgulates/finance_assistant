"use client";

import { useEffect, useState } from "react";

interface Budget {
  id: string;
  amount: number;
  spent: number;
  month: number;
  year: number;
  category?: {
    id: string;
    name: string;
    color: string;
    icon: string;
  };
}

interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
}

const Icons = {
  pieChart: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>,
  creditCard: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>,
  wallet: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/></svg>,
  plus: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" x2="12" y1="5" y2="19"/><line x1="5" x2="19" y1="12" y2="12"/></svg>,
  trash: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>,
};

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    categoryId: "",
    amount: "",
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });

  useEffect(() => {
    fetchBudgets();
    fetchCategories();
  }, []);

  const fetchBudgets = async () => {
    try {
      const res = await fetch("/api/budgets");
      const data = await res.json();
      setBudgets(data || []);
    } catch (error) {
      console.error("Bütçeler yüklenemedi:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      setCategories(data || []);
    } catch (error) {
      console.error("Kategoriler yüklenemedi:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/budgets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount),
        }),
      });
      if (res.ok) {
        setShowModal(false);
        setFormData({
          categoryId: "",
          amount: "",
          month: new Date().getMonth() + 1,
          year: new Date().getFullYear(),
        });
        fetchBudgets();
      }
    } catch (error) {
      console.error("Bütçe eklenemedi:", error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
    }).format(amount);
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return "var(--danger)";
    if (percentage >= 70) return "var(--warning)";
    return "var(--success)";
  };

  const getProgressGradient = (percentage: number) => {
    if (percentage >= 90) return "linear-gradient(90deg, var(--danger), #f87171)";
    if (percentage >= 70) return "linear-gradient(90deg, var(--warning), #fbbf24)";
    return "linear-gradient(90deg, var(--success), #34d399)";
  };

  const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0);
  const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
  const overallPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="h-10 w-48 skeleton rounded-xl"></div>
        <div className="card skeleton h-96"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold mb-1">Bütçe</h1>
          <p className="text-[var(--muted-foreground)]">
            Kategorilere göre harcama limitlerini yönetin
          </p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn btn-primary flex items-center gap-2">
          {Icons.plus} Yeni Bütçe
        </button>
      </div>

      {/* Overview Card */}
      <div className="card">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <p className="text-[var(--muted-foreground)] mb-1">Bu Ay Toplam</p>
            <h2 className="text-4xl font-bold gradient-text">
              {formatCurrency(totalSpent)} / {formatCurrency(totalBudget)}
            </h2>
            <p className="text-sm text-[var(--muted-foreground)] mt-1">
              Bütçenin %{overallPercentage.toFixed(0)}'ı kullanıldı
            </p>
          </div>
          <div className="w-full md:w-64">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-[var(--muted-foreground)]">İlerleme</span>
              <span className="font-semibold" style={{ color: getProgressColor(overallPercentage) }}>
                %{overallPercentage.toFixed(0)}
              </span>
            </div>
            <div className="h-4 bg-[var(--secondary)] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(overallPercentage, 100)}%`,
                  background: getProgressGradient(overallPercentage),
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="stat-card">
          <div className="icon" style={{ background: "#e8ebff", color: "#4c5fd5" }}>
            {Icons.pieChart}
          </div>
          <p className="stat-label">Toplam Bütçe</p>
          <p className="stat-value">{formatCurrency(totalBudget)}</p>
        </div>
        <div className="stat-card">
          <div className="icon" style={{ background: "rgba(239, 68, 68, 0.1)", color: "#ef4444" }}>
            {Icons.creditCard}
          </div>
          <p className="stat-label">Harcanan</p>
          <p className="stat-value text-[var(--danger)]">{formatCurrency(totalSpent)}</p>
        </div>
        <div className="stat-card">
          <div className="icon" style={{ background: "rgba(16, 185, 129, 0.1)", color: "#10b981" }}>
            {Icons.wallet}
          </div>
          <p className="stat-label">Kalan</p>
          <p className="stat-value text-[var(--success)]">
            {formatCurrency(totalBudget - totalSpent)}
          </p>
        </div>
      </div>

      {/* Budgets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {budgets.length === 0 ? (
          <div className="col-span-2 card text-center py-16">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-[#e8ebff] flex items-center justify-center text-[#4c5fd5]">
              {Icons.pieChart}
            </div>
            <h3 className="text-xl font-semibold mb-2">Henüz bütçe yok</h3>
            <p className="text-[var(--muted-foreground)] mb-6">
              İlk bütçenizi oluşturarak harcamalarınızı kontrol altına alın
            </p>
            <button onClick={() => setShowModal(true)} className="btn btn-primary flex items-center gap-2 mx-auto">
              {Icons.plus} Bütçe Oluştur
            </button>
          </div>
        ) : (
          budgets.map((budget) => {
            const percentage = budget.amount > 0 ? (budget.spent / budget.amount) * 100 : 0;
            const remaining = budget.amount - budget.spent;
            return (
              <div key={budget.id} className="card hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center text-[#4c5fd5]"
                      style={{
                        background: budget.category?.color
                          ? `${budget.category.color}20`
                          : "#e8ebff",
                      }}
                    >
                      {Icons.pieChart}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">
                        {budget.category?.name || "Genel Bütçe"}
                      </h3>
                      <p className="text-sm text-[var(--muted-foreground)]">
                        {budget.month}/{budget.year}
                      </p>
                    </div>
                  </div>
                  <span
                    className="badge"
                    style={{
                      background: `${getProgressColor(percentage)}15`,
                      color: getProgressColor(percentage),
                    }}
                  >
                    %{percentage.toFixed(0)}
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--muted-foreground)]">Harcanan</span>
                    <span className="font-semibold">{formatCurrency(budget.spent)}</span>
                  </div>
                  <div className="h-3 bg-[var(--secondary)] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(percentage, 100)}%`,
                        background: getProgressGradient(percentage),
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--muted-foreground)]">Kalan</span>
                    <span
                      className="font-semibold"
                      style={{ color: remaining >= 0 ? "var(--success)" : "var(--danger)" }}
                    >
                      {formatCurrency(remaining)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Yeni Bütçe Oluştur</h2>
              <button
                onClick={() => setShowModal(false)}
                className="w-10 h-10 rounded-xl bg-[var(--secondary)] flex items-center justify-center hover:bg-[var(--muted)] transition-colors"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="form-group">
                <label className="form-label">Kategori</label>
                <select
                  className="select"
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  required
                >
                  <option value="">Kategori Seçin</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.icon} {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Bütçe Limiti (₺)</label>
                <input
                  type="number"
                  className="input"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  required
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Ay</label>
                  <select
                    className="select"
                    value={formData.month}
                    onChange={(e) => setFormData({ ...formData, month: parseInt(e.target.value) })}
                  >
                    {Array.from({ length: 12 }, (_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {new Date(2000, i).toLocaleDateString("tr-TR", { month: "long" })}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Yıl</label>
                  <select
                    className="select"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                  >
                    {[2024, 2025, 2026].map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn btn-secondary flex-1"
                >
                  İptal
                </button>
                <button type="submit" className="btn btn-primary flex-1">
                  Oluştur
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
