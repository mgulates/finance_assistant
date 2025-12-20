"use client";

import { useEffect, useState } from "react";

interface Budget {
  id: string;
  limit: number | string;
  spent: number;
  percentage: number;
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
  close: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" x2="6" y1="6" y2="18"/><line x1="6" x2="18" y1="6" y2="18"/></svg>,
  trash: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>,
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
          categoryId: formData.categoryId,
          limit: parseFloat(formData.amount),
          month: formData.month,
          year: formData.year,
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

  const handleDelete = async (id: string) => {
    if (!confirm("Bu bütçeyi silmek istediğinize emin misiniz?")) return;
    try {
      const res = await fetch(`/api/budgets?id=${id}`, { method: "DELETE" });
      if (res.ok) fetchBudgets();
    } catch (error) {
      console.error("Bütçe silinemedi:", error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
    }).format(amount);
  };

  const totalBudget = budgets.reduce((sum, b) => sum + Number(b.limit), 0);
  const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
  const overallPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  if (loading) {
    return (
      <div className="page-container">
        <div className="skeleton" style={{ height: "40px", width: "200px" }}></div>
        <div className="stats-grid-4">
          {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: "100px" }}></div>)}
        </div>
        <div className="content-grid-lg">
          {[1, 2, 3, 4].map(i => <div key={i} className="skeleton" style={{ height: "220px" }}></div>)}
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Bütçe</h1>
          <p className="page-subtitle">Kategorilere göre harcama limitlerini yönetin</p>
        </div>
        <button className="btn-add" onClick={() => setShowModal(true)}>
          {Icons.plus} Yeni Bütçe
        </button>
      </div>

      {/* Overview Card */}
      <div className="overview-card">
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "24px" }}>
          <div>
            <p className="label">Bu Ay Toplam</p>
            <h2 className="value">{formatCurrency(totalSpent)} / {formatCurrency(totalBudget)}</h2>
            <p className="sub-label">Bütçenin %{overallPercentage.toFixed(0)}&apos;ı kullanıldı</p>
          </div>
          <div className="overview-progress">
            <div className="overview-progress-header">
              <span>İlerleme</span>
              <span>%{overallPercentage.toFixed(0)}</span>
            </div>
            <div className="overview-progress-bar">
              <div className="overview-progress-fill" style={{ width: `${Math.min(overallPercentage, 100)}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid-4">
        <div className="stat-card-horizontal">
          <div className="stat-icon-box blue">{Icons.pieChart}</div>
          <div className="stat-content">
            <p className="stat-label">Toplam Bütçe</p>
            <p className="stat-value">{formatCurrency(totalBudget)}</p>
          </div>
        </div>
        <div className="stat-card-horizontal">
          <div className="stat-icon-box red">{Icons.creditCard}</div>
          <div className="stat-content">
            <p className="stat-label">Harcanan</p>
            <p className="stat-value red">{formatCurrency(totalSpent)}</p>
          </div>
        </div>
        <div className="stat-card-horizontal">
          <div className="stat-icon-box green">{Icons.wallet}</div>
          <div className="stat-content">
            <p className="stat-label">Kalan</p>
            <p className="stat-value green">{formatCurrency(totalBudget - totalSpent)}</p>
          </div>
        </div>
      </div>

      {/* Budgets Grid */}
      <div className="content-grid-lg">
        {budgets.length === 0 ? (
          <div className="card-base empty-state-card">
            <div className="empty-state-icon">{Icons.pieChart}</div>
            <h3 className="empty-state-title">Henüz bütçe yok</h3>
            <p className="empty-state-text">İlk bütçenizi oluşturarak harcamalarınızı kontrol altına alın</p>
            <button className="btn-add" onClick={() => setShowModal(true)}>{Icons.plus} Bütçe Oluştur</button>
          </div>
        ) : (
          budgets.map((budget) => {
            const budgetLimit = Number(budget.limit) || 0;
            const percentage = budgetLimit > 0 ? (budget.spent / budgetLimit) * 100 : 0;
            const remaining = budgetLimit - budget.spent;
            const colorClass = percentage >= 90 ? "red" : percentage >= 70 ? "orange" : "green";
            return (
              <div key={budget.id} className="card-base" style={{ position: "relative" }}>
                {/* Silme butonu */}
                <button
                  onClick={() => handleDelete(budget.id)}
                  title="Bütçeyi Sil"
                  style={{ position: "absolute", top: "12px", right: "12px", background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: "4px", borderRadius: "4px", transition: "all 0.2s" }}
                  onMouseOver={(e) => e.currentTarget.style.color = "var(--red)"}
                  onMouseOut={(e) => e.currentTarget.style.color = "var(--text-muted)"}
                >
                  {Icons.trash}
                </button>
                <div className="card-header">
                  <div className="card-title-group">
                    <div className="card-icon" style={{ background: budget.category?.color ? `${budget.category.color}20` : "var(--blue-light)", color: budget.category?.color || "var(--blue)" }}>
                      {Icons.pieChart}
                    </div>
                    <div>
                      <h3 className="card-title">{budget.category?.name || "Genel Bütçe"}</h3>
                      <p className="card-subtitle">{budget.month}/{budget.year}</p>
                    </div>
                  </div>
                  <span className={`percentage-badge ${colorClass}`}>%{percentage.toFixed(0)}</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div className="info-row">
                    <span className="label">Harcanan</span>
                    <span className="value">{formatCurrency(budget.spent)}</span>
                  </div>
                  <div className="progress-bar-container">
                    <div className={`progress-bar-fill ${colorClass}`} style={{ width: `${Math.min(percentage, 100)}%` }} />
                  </div>
                  <div className="info-row">
                    <span className="label">Kalan</span>
                    <span className={`value ${remaining >= 0 ? "green" : "red"}`}>{formatCurrency(remaining)}</span>
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
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Yeni Bütçe Oluştur</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>{Icons.close}</button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">Kategori</label>
                  <select className="form-select" value={formData.categoryId} onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })} required>
                    <option value="">Kategori Seçin</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Bütçe Limiti (₺)</label>
                  <input type="number" className="form-input" placeholder="0.00" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} required min="0" step="0.01" />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Ay</label>
                    <select className="form-select" value={formData.month} onChange={(e) => setFormData({ ...formData, month: parseInt(e.target.value) })}>
                      {Array.from({ length: 12 }, (_, i) => (
                        <option key={i + 1} value={i + 1}>{new Date(2000, i).toLocaleDateString("tr-TR", { month: "long" })}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Yıl</label>
                    <select className="form-select" value={formData.year} onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}>
                      {[2024, 2025, 2026].map((year) => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="btn-group">
                  <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>İptal</button>
                  <button type="submit" className="btn-submit">Oluştur</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
