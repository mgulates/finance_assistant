"use client";

import { useEffect, useState } from "react";

interface Target {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  description?: string;
}

const Icons = {
  target: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>,
  wallet: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/></svg>,
  trendingUp: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>,
  plus: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" x2="12" y1="5" y2="19"/><line x1="5" x2="19" y1="12" y2="12"/></svg>,
  trash: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>,
};

export default function TargetsPage() {
  const [targets, setTargets] = useState<Target[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    targetAmount: "",
    currentAmount: "",
    deadline: "",
    description: "",
  });

  useEffect(() => {
    fetchTargets();
  }, []);

  const fetchTargets = async () => {
    try {
      const res = await fetch("/api/targets");
      const data = await res.json();
      setTargets(data || []);
    } catch (error) {
      console.error("Hedefler yüklenemedi:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/targets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          targetAmount: parseFloat(formData.targetAmount),
          currentAmount: parseFloat(formData.currentAmount) || 0,
        }),
      });
      if (res.ok) {
        setShowModal(false);
        setFormData({
          title: "",
          targetAmount: "",
          currentAmount: "",
          deadline: "",
          description: "",
        });
        fetchTargets();
      }
    } catch (error) {
      console.error("Hedef eklenemedi:", error);
    }
  };

  const handleUpdateAmount = async (id: string, newAmount: number) => {
    try {
      const res = await fetch(`/api/targets?id=${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentAmount: newAmount }),
      });
      if (res.ok) fetchTargets();
    } catch (error) {
      console.error("Hedef güncellenemedi:", error);
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

  const getDaysRemaining = (deadline: string) => {
    const diff = new Date(deadline).getTime() - new Date().getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return "var(--success)";
    if (percentage >= 50) return "var(--primary)";
    return "var(--accent)";
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="h-10 w-48 skeleton rounded-xl"></div>
        <div className="card skeleton h-96"></div>
      </div>
    );
  }

  const completedTargets = targets.filter((t) => t.currentAmount >= t.targetAmount).length;
  const totalTargetAmount = targets.reduce((sum, t) => sum + t.targetAmount, 0);
  const totalCurrentAmount = targets.reduce((sum, t) => sum + t.currentAmount, 0);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold mb-1">Hedefler</h1>
          <p className="text-[var(--muted-foreground)]">
            Finansal hedeflerinizi takip edin
          </p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn btn-primary flex items-center gap-2">
          {Icons.plus} Yeni Hedef
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="stat-card">
          <div className="icon" style={{ background: "#e8ebff", color: "#4c5fd5" }}>
            {Icons.target}
          </div>
          <p className="stat-label">Toplam Hedef</p>
          <p className="stat-value">{targets.length}</p>
        </div>
        <div className="stat-card">
          <div className="icon" style={{ background: "rgba(16, 185, 129, 0.1)", color: "#10b981" }}>
            {Icons.target}
          </div>
          <p className="stat-label">Tamamlanan</p>
          <p className="stat-value text-[var(--success)]">{completedTargets}</p>
        </div>
        <div className="stat-card">
          <div className="icon" style={{ background: "#fff3e8", color: "#ff7a00" }}>
            {Icons.wallet}
          </div>
          <p className="stat-label">Hedef Tutar</p>
          <p className="stat-value">{formatCurrency(totalTargetAmount)}</p>
        </div>
        <div className="stat-card">
          <div className="icon" style={{ background: "rgba(76, 95, 213, 0.1)", color: "#4c5fd5" }}>
            {Icons.trendingUp}
          </div>
          <p className="stat-label">Biriktirilen</p>
          <p className="stat-value gradient-text">{formatCurrency(totalCurrentAmount)}</p>
        </div>
      </div>

      {/* Targets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {targets.length === 0 ? (
          <div className="col-span-full card text-center py-16">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-[#e8ebff] flex items-center justify-center text-[#4c5fd5]">
              {Icons.target}
            </div>
            <h3 className="text-xl font-semibold mb-2">Henüz hedef yok</h3>
            <p className="text-[var(--muted-foreground)] mb-6">
              İlk finansal hedefinizi oluşturun
            </p>
            <button onClick={() => setShowModal(true)} className="btn btn-primary flex items-center gap-2 mx-auto">
              {Icons.plus} Hedef Oluştur
            </button>
          </div>
        ) : (
          targets.map((target) => {
            const percentage = (target.currentAmount / target.targetAmount) * 100;
            const daysRemaining = getDaysRemaining(target.deadline);
            const isCompleted = percentage >= 100;
            return (
              <div
                key={target.id}
                className={`card relative overflow-hidden ${
                  isCompleted ? "border-2 border-[var(--success)]" : ""
                }`}
              >
                {isCompleted && (
                  <div className="absolute top-4 right-4">
                    <span className="badge badge-success">✅ Tamamlandı</span>
                  </div>
                )}
                <div className="mb-4">
                  <h3 className="font-semibold text-lg mb-1">{target.title}</h3>
                  {target.description && (
                    <p className="text-sm text-[var(--muted-foreground)]">
                      {target.description}
                    </p>
                  )}
                </div>

                <div className="space-y-4">
                  {/* Progress Circle */}
                  <div className="flex items-center justify-center">
                    <div
                      className="w-32 h-32 rounded-full flex items-center justify-center"
                      style={{
                        background: `conic-gradient(${getProgressColor(percentage)} ${
                          percentage * 3.6
                        }deg, var(--secondary) 0deg)`,
                      }}
                    >
                      <div className="w-24 h-24 rounded-full bg-white flex flex-col items-center justify-center">
                        <span
                          className="text-2xl font-bold"
                          style={{ color: getProgressColor(percentage) }}
                        >
                          %{Math.min(percentage, 100).toFixed(0)}
                        </span>
                        <span className="text-xs text-[var(--muted-foreground)]">
                          tamamlandı
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Amount Info */}
                  <div className="text-center">
                    <p className="text-2xl font-bold gradient-text">
                      {formatCurrency(target.currentAmount)}
                    </p>
                    <p className="text-sm text-[var(--muted-foreground)]">
                      / {formatCurrency(target.targetAmount)}
                    </p>
                  </div>

                  {/* Deadline */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--secondary)]">
                    <span className="text-sm text-[var(--muted-foreground)]">
                      Bitiş: {formatDate(target.deadline)}
                    </span>
                    <span
                      className={`text-sm font-semibold ${
                        daysRemaining < 0
                          ? "text-[var(--danger)]"
                          : daysRemaining < 30
                          ? "text-[var(--warning)]"
                          : "text-[var(--success)]"
                      }`}
                    >
                      {daysRemaining < 0
                        ? `${Math.abs(daysRemaining)} gün geçti`
                        : `${daysRemaining} gün kaldı`}
                    </span>
                  </div>

                  {/* Add Amount Button */}
                  {!isCompleted && (
                    <button
                      onClick={() => {
                        const amount = prompt("Eklemek istediğiniz tutarı girin:");
                        if (amount && !isNaN(parseFloat(amount))) {
                          handleUpdateAmount(
                            target.id,
                            target.currentAmount + parseFloat(amount)
                          );
                        }
                      }}
                      className="btn btn-primary w-full flex items-center justify-center gap-2"
                    >
                      {Icons.wallet} Para Ekle
                    </button>
                  )}
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
              <h2 className="modal-title">Yeni Hedef Oluştur</h2>
              <button
                onClick={() => setShowModal(false)}
                className="w-10 h-10 rounded-xl bg-[var(--secondary)] flex items-center justify-center hover:bg-[var(--muted)] transition-colors"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="form-group">
                <label className="form-label">Hedef Adı</label>
                <input
                  type="text"
                  className="input"
                  placeholder="Örn: Tatil fonu"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Hedef Tutar (₺)</label>
                <input
                  type="number"
                  className="input"
                  placeholder="0.00"
                  value={formData.targetAmount}
                  onChange={(e) =>
                    setFormData({ ...formData, targetAmount: e.target.value })
                  }
                  required
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Mevcut Birikim (₺)</label>
                <input
                  type="number"
                  className="input"
                  placeholder="0.00"
                  value={formData.currentAmount}
                  onChange={(e) =>
                    setFormData({ ...formData, currentAmount: e.target.value })
                  }
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Bitiş Tarihi</label>
                <input
                  type="date"
                  className="input"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Açıklama (Opsiyonel)</label>
                <textarea
                  className="input"
                  rows={3}
                  placeholder="Hedef hakkında not ekleyin..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
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
