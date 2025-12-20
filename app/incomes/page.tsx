"use client";

import { useEffect, useState } from "react";

interface Category {
  id: string;
  name: string;
  color: string;
}

interface Income {
  id: string;
  title: string;
  amount: number;
  date: string;
  description?: string;
  category?: Category;
}

const Icons = {
  wallet: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" />
      <path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" />
    </svg>
  ),
  chart: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3v18h18" />
      <path d="m19 9-5 5-4-4-3 3" />
    </svg>
  ),
  trendingUp: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
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

export default function IncomesPage() {
  const [incomes, setIncomes] = useState<Income[]>([]);
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

  // Filtrelenmiş gelirler
  const filteredIncomes = incomes.filter((income) => {
    const incomeDate = new Date(income.date);
    const now = new Date();

    if (filter === "thisMonth") {
      return (
        incomeDate.getMonth() === now.getMonth() &&
        incomeDate.getFullYear() === now.getFullYear()
      );
    }

    if (filter === "thisWeek") {
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 7);
      return incomeDate >= startOfWeek && incomeDate < endOfWeek;
    }

    return true;
  });

  // Hesaplamalar - filtrelenmiş veriye göre
  const totalIncome = filteredIncomes.reduce((sum, i) => sum + Number(i.amount), 0);
  const avgIncome = filteredIncomes.length > 0 ? totalIncome / filteredIncomes.length : 0;

  useEffect(() => {
    fetchIncomes();
    fetchCategories();
  }, []);

  const fetchIncomes = async () => {
    try {
      const res = await fetch("/api/incomes");
      const data = await res.json();
      setIncomes(data.incomes || []);
    } catch (error) {
      console.error("Gelirler yüklenemedi:", error);
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
      const res = await fetch("/api/incomes", {
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
        fetchIncomes();
      }
    } catch (error) {
      console.error("Gelir eklenemedi:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu geliri silmek istediğinize emin misiniz?")) return;
    try {
      const res = await fetch(`/api/incomes?id=${id}`, { method: "DELETE" });
      if (res.ok) fetchIncomes();
    } catch (error) {
      console.error("Gelir silinemedi:", error);
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
            Gelirler
          </h1>
          <p style={{ fontSize: "0.9375rem", color: "var(--text-muted)" }}>
            Tüm gelirlerinizi takip edin ve yönetin
          </p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn btn-success">
          {Icons.plus} Yeni Gelir
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.5rem", marginBottom: "2rem" }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: "var(--green-light)", color: "var(--green)" }}>
            {Icons.wallet}
          </div>
          <p className="stat-label">Toplam Gelir</p>
          <p className="stat-value" style={{ color: "var(--green)" }}>{formatCurrency(totalIncome)}</p>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: "var(--blue-light)", color: "var(--blue)" }}>
            {Icons.chart}
          </div>
          <p className="stat-label">İşlem Sayısı</p>
          <p className="stat-value">{filteredIncomes.length}</p>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: "var(--purple-light)", color: "var(--purple)" }}>
            {Icons.trendingUp}
          </div>
          <p className="stat-label">Ortalama Gelir</p>
          <p className="stat-value">{formatCurrency(avgIncome)}</p>
        </div>
      </div>

      {/* Incomes List */}
      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <h2 style={{ fontSize: "1.125rem", fontWeight: 600 }}>Gelir Listesi</h2>
          <div className="tab-group">
            <button className={`tab ${filter === "all" ? "active" : ""}`} onClick={() => setFilter("all")}>Tümü</button>
            <button className={`tab ${filter === "thisMonth" ? "active" : ""}`} onClick={() => setFilter("thisMonth")}>Bu Ay</button>
            <button className={`tab ${filter === "thisWeek" ? "active" : ""}`} onClick={() => setFilter("thisWeek")}>Bu Hafta</button>
          </div>
        </div>

        {filteredIncomes.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon" style={{ background: "var(--green-light)", color: "var(--green)" }}>{Icons.wallet}</div>
            <div className="empty-state-title">Henüz gelir yok</div>
            <div className="empty-state-text">İlk gelirinizi ekleyerek başlayın</div>
            <button onClick={() => setShowModal(true)} className="btn btn-success">
              {Icons.plus} Gelir Ekle
            </button>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Gelir</th>
                  <th>Kategori</th>
                  <th>Tarih</th>
                  <th style={{ textAlign: "right" }}>Tutar</th>
                  <th style={{ width: "60px" }}></th>
                </tr>
              </thead>
              <tbody>
                {filteredIncomes.map((income) => (
                  <tr key={income.id}>
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
                            background: "var(--green-light)",
                            color: "var(--green)",
                          }}
                        >
                          {Icons.wallet}
                        </div>
                        <div>
                          <div style={{ fontWeight: 500 }}>{income.title}</div>
                          {income.description && (
                            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{income.description}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-gray">{income.category?.name || "Kategorisiz"}</span>
                    </td>
                    <td style={{ color: "var(--text-secondary)" }}>{formatDate(income.date)}</td>
                    <td style={{ textAlign: "right", fontWeight: 600, color: "var(--green)" }}>
                      +{formatCurrency(income.amount)}
                    </td>
                    <td>
                      <button
                        onClick={() => handleDelete(income.id)}
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
              <h2 className="modal-title">Yeni Gelir Ekle</h2>
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
                    placeholder="Örn: Maaş ödemesi"
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
                    placeholder="Gelir hakkında not ekleyin..."
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
                <button type="submit" className="btn btn-success">
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
