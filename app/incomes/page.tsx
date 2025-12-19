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
  wallet: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/></svg>,
  pieChart: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>,
  trendingUp: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>,
  trash: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>,
  plus: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" x2="12" y1="5" y2="19"/><line x1="5" x2="19" y1="12" y2="12"/></svg>,
};

export default function IncomesPage() {
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    date: new Date().toISOString().split("T")[0],
    description: "",
    categoryId: "",
  });

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
          ...formData,
          amount: parseFloat(formData.amount),
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
      month: "long",
      year: "numeric",
    });
  };

  const totalIncome = incomes.reduce((sum, i) => sum + i.amount, 0);

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
          <h1 className="text-3xl font-bold mb-1">Gelirler</h1>
          <p className="text-[var(--muted-foreground)]">
            Tüm gelirlerinizi yönetin
          </p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn btn-accent">
          <span>+</span> Yeni Gelir
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="stat-card">
          <div className="icon" style={{ background: "rgba(16, 185, 129, 0.1)", color: "#10b981" }}>
            {Icons.wallet}
          </div>
          <p className="stat-label">Toplam Gelir</p>
          <p className="stat-value text-[var(--success)]">
            {formatCurrency(totalIncome)}
          </p>
        </div>
        <div className="stat-card">
          <div className="icon" style={{ background: "#e8ebff", color: "#4c5fd5" }}>
            {Icons.pieChart}
          </div>
          <p className="stat-label">İşlem Sayısı</p>
          <p className="stat-value">{incomes.length}</p>
        </div>
        <div className="stat-card">
          <div className="icon" style={{ background: "#fff3e8", color: "#ff7a00" }}>
            {Icons.trendingUp}
          </div>
          <p className="stat-label">Ortalama Gelir</p>
          <p className="stat-value">
            {formatCurrency(incomes.length > 0 ? totalIncome / incomes.length : 0)}
          </p>
        </div>
      </div>

      {/* Incomes List */}
      <div className="card">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-semibold text-lg">Gelir Listesi</h2>
          <div className="tab-group">
            <button className="tab active">Tümü</button>
            <button className="tab">Bu Ay</button>
            <button className="tab">Bu Hafta</button>
          </div>
        </div>

        {incomes.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-[rgba(16,185,129,0.1)] flex items-center justify-center text-[#10b981]">
              {Icons.wallet}
            </div>
            <h3 className="text-xl font-semibold mb-2">Henüz gelir yok</h3>
            <p className="text-[var(--muted-foreground)] mb-6">
              İlk gelirinizi ekleyerek başlayın
            </p>
            <button onClick={() => setShowModal(true)} className="btn btn-accent flex items-center gap-2 mx-auto">
              {Icons.plus} Gelir Ekle
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {incomes.map((income) => (
              <div
                key={income.id}
                className="flex items-center justify-between p-4 rounded-2xl bg-[var(--secondary)] hover:bg-[var(--muted)] transition-all"
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-[#10b981]"
                    style={{
                      background: income.category?.color
                        ? `${income.category.color}20`
                        : "rgba(16, 185, 129, 0.1)",
                    }}
                  >
                    {Icons.wallet}
                  </div>
                  <div>
                    <p className="font-semibold">{income.title}</p>
                    <p className="text-sm text-[var(--muted-foreground)]">
                      {income.category?.name || "Kategorisiz"} • {formatDate(income.date)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-bold text-lg text-[var(--success)]">
                    +{formatCurrency(income.amount)}
                  </span>
                  <button
                    onClick={() => handleDelete(income.id)}
                    className="w-10 h-10 rounded-xl bg-[var(--danger)]/10 text-[var(--danger)] hover:bg-[var(--danger)]/20 flex items-center justify-center transition-colors"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Yeni Gelir Ekle</h2>
              <button
                onClick={() => setShowModal(false)}
                className="w-10 h-10 rounded-xl bg-[var(--secondary)] flex items-center justify-center hover:bg-[var(--muted)] transition-colors"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="form-group">
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
              <div className="form-group">
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
              <div className="form-group">
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
              <div className="form-group">
                <label className="form-label">Tarih</label>
                <input
                  type="date"
                  className="input"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Açıklama (Opsiyonel)</label>
                <textarea
                  className="input"
                  rows={3}
                  placeholder="Gelir hakkında not ekleyin..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn btn-secondary flex-1"
                >
                  İptal
                </button>
                <button type="submit" className="btn btn-accent flex-1">
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
