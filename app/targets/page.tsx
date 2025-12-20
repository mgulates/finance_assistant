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
  check: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>,
  close: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" x2="6" y1="6" y2="18"/><line x1="6" x2="18" y1="6" y2="18"/></svg>,
  trash: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>,
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

  const handleDelete = async (id: string) => {
    if (!confirm("Bu hedefi silmek istediğinize emin misiniz?")) return;
    try {
      const res = await fetch(`/api/targets?id=${id}`, { method: "DELETE" });
      if (res.ok) fetchTargets();
    } catch (error) {
      console.error("Hedef silinemedi:", error);
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

  if (loading) {
    return (
      <div className="page-container">
        <div className="skeleton" style={{ height: "40px", width: "200px" }}></div>
        <div className="stats-grid">
          {[1, 2, 3, 4].map(i => <div key={i} className="skeleton" style={{ height: "100px" }}></div>)}
        </div>
        <div className="content-grid">
          {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: "340px" }}></div>)}
        </div>
      </div>
    );
  }

  const completedTargets = targets.filter((t) => t.currentAmount >= t.targetAmount).length;
  const totalTargetAmount = targets.reduce((sum, t) => sum + t.targetAmount, 0);
  const totalCurrentAmount = targets.reduce((sum, t) => sum + t.currentAmount, 0);

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Hedefler</h1>
          <p className="page-subtitle">Finansal hedeflerinizi takip edin</p>
        </div>
        <button className="btn-add purple" onClick={() => setShowModal(true)}>
          {Icons.plus} Yeni Hedef
        </button>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card-horizontal">
          <div className="stat-icon-box purple">{Icons.target}</div>
          <div className="stat-content">
            <p className="stat-label">Toplam Hedef</p>
            <p className="stat-value">{targets.length}</p>
          </div>
        </div>
        <div className="stat-card-horizontal">
          <div className="stat-icon-box green">{Icons.check}</div>
          <div className="stat-content">
            <p className="stat-label">Tamamlanan</p>
            <p className="stat-value green">{completedTargets}</p>
          </div>
        </div>
        <div className="stat-card-horizontal">
          <div className="stat-icon-box orange">{Icons.wallet}</div>
          <div className="stat-content">
            <p className="stat-label">Hedef Tutar</p>
            <p className="stat-value">{formatCurrency(totalTargetAmount)}</p>
          </div>
        </div>
        <div className="stat-card-horizontal">
          <div className="stat-icon-box blue">{Icons.trendingUp}</div>
          <div className="stat-content">
            <p className="stat-label">Biriktirilen</p>
            <p className="stat-value blue">{formatCurrency(totalCurrentAmount)}</p>
          </div>
        </div>
      </div>

      {/* Targets Grid */}
      <div className="content-grid">
        {targets.length === 0 ? (
          <div className="card-base empty-state-card">
            <div className="empty-state-icon purple">{Icons.target}</div>
            <h3 className="empty-state-title">Henüz hedef yok</h3>
            <p className="empty-state-text">İlk finansal hedefinizi oluşturun</p>
            <button className="btn-add purple" onClick={() => setShowModal(true)}>{Icons.plus} Hedef Oluştur</button>
          </div>
        ) : (
          targets.map((target) => {
            const percentage = Math.min((target.currentAmount / target.targetAmount) * 100, 100);
            const daysRemaining = getDaysRemaining(target.deadline);
            const isCompleted = percentage >= 100;
            const progressColor = isCompleted ? "var(--green)" : percentage >= 50 ? "var(--blue)" : "var(--purple)";
            const colorClass = isCompleted ? "green" : percentage >= 50 ? "blue" : "purple";
            
            return (
              <div key={target.id} className={`card-base target-card ${isCompleted ? "completed" : ""}`}>
                {isCompleted && (
                  <div className="completed-badge">{Icons.check} Tamamlandı</div>
                )}
                
                {/* Silme butonu */}
                <button
                  className="delete-btn"
                  onClick={() => handleDelete(target.id)}
                  title="Hedefi Sil"
                  style={{ position: "absolute", top: "12px", right: "12px", background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: "4px", borderRadius: "4px", transition: "all 0.2s" }}
                  onMouseOver={(e) => e.currentTarget.style.color = "var(--red)"}
                  onMouseOut={(e) => e.currentTarget.style.color = "var(--text-muted)"}
                >
                  {Icons.trash}
                </button>
                
                <div style={{ marginBottom: "16px" }}>
                  <h3 style={{ fontSize: "18px", fontWeight: "600", color: "var(--text-primary)", marginBottom: "4px" }}>{target.title}</h3>
                  {target.description && <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>{target.description}</p>}
                </div>

                {/* Circle Progress */}
                <div className="circle-progress-container">
                  <div className="circle-progress">
                    <svg viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="42" fill="none" stroke="var(--bg-hover)" strokeWidth="10" />
                      <circle 
                        cx="50" cy="50" r="42" fill="none" stroke={progressColor} strokeWidth="10"
                        strokeDasharray={`${percentage * 2.64} 264`}
                        strokeLinecap="round"
                        style={{ transition: "stroke-dasharray 0.5s ease" }}
                      />
                    </svg>
                    <div className="circle-progress-center">
                      <span className="circle-progress-value" style={{ color: progressColor }}>%{percentage.toFixed(0)}</span>
                      <span className="circle-progress-label">tamamlandı</span>
                    </div>
                  </div>
                </div>

                {/* Amount */}
                <div style={{ textAlign: "center", marginBottom: "16px" }}>
                  <p style={{ fontSize: "20px", fontWeight: "700", color: "var(--text-primary)" }}>{formatCurrency(target.currentAmount)}</p>
                  <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>/ {formatCurrency(target.targetAmount)}</p>
                </div>

                {/* Deadline */}
                <div className="deadline-box">
                  <span className="deadline-label">Bitiş: {formatDate(target.deadline)}</span>
                  <span className={`deadline-days ${daysRemaining < 0 ? "overdue" : daysRemaining < 30 ? "warning" : "ok"}`}>
                    {daysRemaining < 0 ? `${Math.abs(daysRemaining)} gün geçti` : `${daysRemaining} gün kaldı`}
                  </span>
                </div>

                {/* Add Amount */}
                {!isCompleted && (
                  <button
                    className={`btn-add ${colorClass}`}
                    style={{ width: "100%", justifyContent: "center", marginTop: "16px" }}
                    onClick={() => {
                      const amount = prompt("Eklemek istediğiniz tutarı girin:");
                      if (amount && !isNaN(parseFloat(amount))) {
                        handleUpdateAmount(target.id, target.currentAmount + parseFloat(amount));
                      }
                    }}
                  >
                    {Icons.wallet} Para Ekle
                  </button>
                )}
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
              <h2 className="modal-title">Yeni Hedef Oluştur</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>{Icons.close}</button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">Hedef Adı</label>
                  <input type="text" className="form-input" placeholder="Örn: Tatil fonu" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Hedef Tutar (₺)</label>
                  <input type="number" className="form-input" placeholder="0.00" value={formData.targetAmount} onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })} required min="0" step="0.01" />
                </div>
                <div className="form-group">
                  <label className="form-label">Mevcut Birikim (₺)</label>
                  <input type="number" className="form-input" placeholder="0.00" value={formData.currentAmount} onChange={(e) => setFormData({ ...formData, currentAmount: e.target.value })} min="0" step="0.01" />
                </div>
                <div className="form-group">
                  <label className="form-label">Bitiş Tarihi</label>
                  <input type="date" className="form-input" value={formData.deadline} onChange={(e) => setFormData({ ...formData, deadline: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Açıklama (Opsiyonel)</label>
                  <textarea className="form-textarea" rows={3} placeholder="Hedef hakkında not ekleyin..." value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                </div>
                <div className="btn-group">
                  <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>İptal</button>
                  <button type="submit" className="btn-submit purple">Oluştur</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
