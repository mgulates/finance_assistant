"use client";

import { useEffect, useState } from "react";

interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
}

interface Expense {
  id: string;
  title: string;
  amount: number;
  date: string;
  description?: string;
  category?: Category;
}

const Icons = {
  creditCard: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="14" x="2" y="5" rx="2" />
      <line x1="2" x2="22" y1="10" y2="10" />
    </svg>
  ),
  chart: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3v18h18" />
      <path d="m19 9-5 5-4-4-3 3" />
    </svg>
  ),
  calendar: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
      <line x1="16" x2="16" y1="2" y2="6" />
      <line x1="8" x2="8" y1="2" y2="6" />
      <line x1="3" x2="21" y1="10" y2="10" />
    </svg>
  ),
  trash: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  ),
  plus: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  ),
  close: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  ),
};

type FilterType = "all" | "thisMonth" | "thisWeek";

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState<FilterType>("all");
  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    date: new Date().toISOString().split("T")[0],
    description: "",
    categoryId: "",
  });

  // Filtrelenmiş giderler
  const filteredExpenses = expenses.filter((expense) => {
    const expenseDate = new Date(expense.date);
    const now = new Date();

    if (filter === "thisMonth") {
      return (
        expenseDate.getMonth() === now.getMonth() &&
        expenseDate.getFullYear() === now.getFullYear()
      );
    }

    if (filter === "thisWeek") {
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 7);
      return expenseDate >= startOfWeek && expenseDate < endOfWeek;
    }

    return true;
  });

  // Hesaplamalar - filtrelenmiş veriye göre
  const totalExpense = filteredExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const avgExpense = filteredExpenses.length > 0 ? totalExpense / filteredExpenses.length : 0;

  useEffect(() => {
    fetchExpenses();
    fetchCategories();
  }, []);

  const fetchExpenses = async () => {
    try {
      const res = await fetch("/api/expenses");
      const data = await res.json();
      setExpenses(data.expenses || []);
    } catch (error) {
      console.error("Giderler yüklenemedi:", error);
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
      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          amount: parseFloat(formData.amount),
          date: formData.date,
          note: formData.description,
          categoryId: formData.categoryId || undefined,
        }),
      });
      if (res.ok) {
        setShowModal(false);
        setFormData({
          title: "",
          amount: "",
          date: new Date().toISOString().split("T")[0],
          description: "",
          categoryId: "",
        });
        fetchExpenses();
      }
    } catch (error) {
      console.error("Gider eklenemedi:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu gideri silmek istediğinize emin misiniz?")) return;
    try {
      const res = await fetch(`/api/expenses?id=${id}`, { method: "DELETE" });
      if (res.ok) fetchExpenses();
    } catch (error) {
      console.error("Gider silinemedi:", error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div style={{ padding: "2rem" }}>
        <div style={{ height: "40px", width: "200px", marginBottom: "2rem" }} className="skeleton"></div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.5rem", marginBottom: "2rem" }}>
          {[1, 2, 3].map((i) => (
            <div key={i} style={{ height: "120px", borderRadius: "20px" }} className="skeleton"></div>
          ))}
        </div>
        <div style={{ height: "400px", borderRadius: "20px" }} className="skeleton"></div>
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem" }} className="animate-fade-in">
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2rem" }}>
        <div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "0.25rem" }}>
            Giderler
          </h1>
          <p style={{ fontSize: "0.9375rem", color: "var(--text-muted)" }}>
            Tüm harcamalarınızı takip edin ve yönetin
          </p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn btn-primary">
          {Icons.plus} Yeni Gider
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.5rem", marginBottom: "2rem" }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: "var(--red-light)", color: "var(--red)" }}>
            {Icons.creditCard}
          </div>
          <p className="stat-label">Toplam Gider</p>
          <p className="stat-value" style={{ color: "var(--red)" }}>{formatCurrency(totalExpense)}</p>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: "var(--blue-light)", color: "var(--blue)" }}>
            {Icons.chart}
          </div>
          <p className="stat-label">İşlem Sayısı</p>
          <p className="stat-value">{filteredExpenses.length}</p>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: "var(--orange-light)", color: "var(--orange)" }}>
            {Icons.calendar}
          </div>
          <p className="stat-label">Ortalama Gider</p>
          <p className="stat-value">{formatCurrency(avgExpense)}</p>
        </div>
      </div>

      {/* Expenses List */}
      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <h2 style={{ fontSize: "1.125rem", fontWeight: 600 }}>Gider Listesi</h2>
          <div className="tab-group">
            <button className={`tab ${filter === "all" ? "active" : ""}`} onClick={() => setFilter("all")}>Tümü</button>
            <button className={`tab ${filter === "thisMonth" ? "active" : ""}`} onClick={() => setFilter("thisMonth")}>Bu Ay</button>
            <button className={`tab ${filter === "thisWeek" ? "active" : ""}`} onClick={() => setFilter("thisWeek")}>Bu Hafta</button>
          </div>
        </div>

        {filteredExpenses.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">{Icons.creditCard}</div>
            <div className="empty-state-title">Henüz gider yok</div>
            <div className="empty-state-text">İlk giderinizi ekleyerek başlayın</div>
            <button onClick={() => setShowModal(true)} className="btn btn-primary">
              {Icons.plus} Gider Ekle
            </button>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Gider</th>
                  <th>Kategori</th>
                  <th>Tarih</th>
                  <th style={{ textAlign: "right" }}>Tutar</th>
                  <th style={{ width: "60px" }}></th>
                </tr>
              </thead>
              <tbody>
                {filteredExpenses.map((expense) => (
                  <tr key={expense.id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <div
                          style={{
                            width: "40px",
                            height: "40px",
                            borderRadius: "10px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            background: expense.category?.color ? `${expense.category.color}20` : "var(--red-light)",
                            color: expense.category?.color || "var(--red)",
                          }}
                        >
                          {Icons.creditCard}
                        </div>
                        <div>
                          <div style={{ fontWeight: 500 }}>{expense.title}</div>
                          {expense.description && (
                            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{expense.description}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-gray">{expense.category?.name || "Kategorisiz"}</span>
                    </td>
                    <td style={{ color: "var(--text-secondary)" }}>{formatDate(expense.date)}</td>
                    <td style={{ textAlign: "right", fontWeight: 600, color: "var(--red)" }}>
                      -{formatCurrency(expense.amount)}
                    </td>
                    <td>
                      <button
                        onClick={() => handleDelete(expense.id)}
                        className="btn btn-ghost btn-icon"
                        style={{ color: "var(--red)" }}
                      >
                        {Icons.trash}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Yeni Gider Ekle</h2>
              <button onClick={() => setShowModal(false)} className="btn btn-ghost btn-icon">
                {Icons.close}
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Başlık</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="Örn: Market alışverişi"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Tutar (₺)</label>
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
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Kategori</label>
                    <select
                      className="select"
                      value={formData.categoryId}
                      onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    >
                      <option value="">Kategori Seçin</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Tarih</label>
                    <input
                      type="date"
                      className="input"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Açıklama (Opsiyonel)</label>
                  <textarea
                    className="input"
                    rows={3}
                    placeholder="Gider hakkında not ekleyin..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    style={{ resize: "none" }}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">
                  İptal
                </button>
                <button type="submit" className="btn btn-primary">
                  Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
