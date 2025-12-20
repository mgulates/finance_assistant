"use client";

import { useEffect, useState } from "react";

interface AnalysisData {
  monthlyTrend: { month: string; income: number; expense: number }[];
  categoryBreakdown: { category: string; amount: number; percentage: number; color: string }[];
  insights: string[];
  savingsRate: number;
  healthScore: number;
}

interface AITips {
  insights: string[];
  savingsTip: string;
  goalSuggestion: string;
}

const Icons = {
  trendingUp: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>,
  pieChart: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>,
  wallet: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/></svg>,
  target: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>,
  sparkles: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>,
};

export default function AnalysisPage() {
  const [data, setData] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [aiInsights, setAiInsights] = useState<string>("");
  const [loadingAI, setLoadingAI] = useState(false);
  const [aiTips, setAiTips] = useState<AITips | null>(null);
  const [loadingTips, setLoadingTips] = useState(true);

  useEffect(() => {
    fetchAnalysis();
    fetchAITips();
  }, []);

  const fetchAnalysis = async () => {
    try {
      const res = await fetch("/api/analysis/monthly");
      const analysisData = await res.json();
      setData(analysisData);
    } catch (error) {
      console.error("Analiz verileri yüklenemedi:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAITips = async () => {
    setLoadingTips(true);
    try {
      const res = await fetch("/api/ai/tips", { method: "POST" });
      const result = await res.json();
      setAiTips(result);
    } catch (error) {
      console.error("AI ipuçları alınamadı:", error);
      setAiTips({
        insights: ["Verileriniz analiz ediliyor...", "Harcamalarınızı takip edin", "Bütçe oluşturun"],
        savingsTip: "Aylık gelirinizin en az %20'sini biriktirmeyi hedefleyin",
        goalSuggestion: "Acil durum fonu oluşturun: 3-6 aylık gider tutarı"
      });
    } finally {
      setLoadingTips(false);
    }
  };

  const getAIInsights = async () => {
    setLoadingAI(true);
    try {
      const res = await fetch("/api/ai/insights", { method: "POST" });
      const result = await res.json();
      setAiInsights(result.insights || "Yapay zeka analizi şu anda kullanılamıyor.");
    } catch (error) {
      console.error("AI analizi alınamadı:", error);
      setAiInsights("Analiz alınırken bir hata oluştu.");
    } finally {
      setLoadingAI(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="skeleton" style={{ height: "40px", width: "200px" }}></div>
        <div className="stats-grid">
          {[1, 2, 3, 4].map(i => <div key={i} className="skeleton" style={{ height: "100px" }}></div>)}
        </div>
        <div className="charts-grid">
          <div className="skeleton" style={{ height: "320px" }}></div>
          <div className="skeleton" style={{ height: "320px" }}></div>
        </div>
      </div>
    );
  }

  // Veri yoksa boş state göster
  if (!data || !data.monthlyTrend) {
    return (
      <div className="page-container">
        <div className="page-header">
          <div>
            <h1 className="page-title">Finansal Analiz</h1>
            <p className="page-subtitle">Harcama alışkanlıklarınızı analiz edin</p>
          </div>
        </div>
        <div className="card-base" style={{ textAlign: "center", padding: "60px 20px" }}>
          <div style={{ width: "80px", height: "80px", borderRadius: "50%", background: "var(--blue-light)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", color: "var(--blue)" }}>
            {Icons.pieChart}
          </div>
          <h3 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "8px", color: "var(--text-primary)" }}>Henüz veri yok</h3>
          <p style={{ color: "var(--text-muted)" }}>Gelir ve gider ekledikten sonra analizleriniz burada görünecek</p>
        </div>
      </div>
    );
  }

  const totalExpense = data.categoryBreakdown?.reduce((sum: number, c: { amount: number }) => sum + c.amount, 0) || 0;

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Finansal Analiz</h1>
          <p className="page-subtitle">Harcama alışkanlıklarınızı analiz edin</p>
        </div>
        <button className="btn-add gradient" style={{ opacity: loadingAI ? 0.7 : 1 }} onClick={getAIInsights} disabled={loadingAI}>
          {loadingAI ? (
            <><span style={{ animation: "spin 1s linear infinite" }}>⏳</span> Analiz Ediliyor...</>
          ) : (
            <>{Icons.sparkles} AI Analiz</>
          )}
        </button>
      </div>

      {/* AI Insights Card */}
      {aiInsights && (
        <div className="ai-card">
          <div className="ai-card-content">
            <div className="ai-icon">{Icons.sparkles}</div>
            <div style={{ flex: 1 }}>
              <h3 className="ai-title">AI Finansal Asistan</h3>
              <p className="ai-text">{aiInsights}</p>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card-horizontal">
          <div className="stat-icon-box blue">{Icons.pieChart}</div>
          <div className="stat-content">
            <p className="stat-label">Toplam Harcama</p>
            <p className="stat-value">{formatCurrency(totalExpense)}</p>
          </div>
        </div>
        <div className="stat-card-horizontal">
          <div className="stat-icon-box green">{Icons.wallet}</div>
          <div className="stat-content">
            <p className="stat-label">Tasarruf Oranı</p>
            <p className="stat-value green">%{data.savingsRate}</p>
          </div>
        </div>
        <div className="stat-card-horizontal">
          <div className="stat-icon-box orange">{Icons.target}</div>
          <div className="stat-content">
            <p className="stat-label">Finansal Sağlık</p>
            <p className="stat-value" style={{ color: "var(--orange)" }}>{data.healthScore}/100</p>
          </div>
        </div>
        <div className="stat-card-horizontal">
          <div className="stat-icon-box purple">{Icons.trendingUp}</div>
          <div className="stat-content">
            <p className="stat-label">Trend</p>
            <p className="stat-value green">↑ İyileşiyor</p>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="charts-grid">
        {/* Monthly Trend Chart */}
        <div className="card-base">
          <h3 className="chart-title">Aylık Gelir/Gider Trendi</h3>
          <div style={{ height: "200px", position: "relative" }}>
            {(() => {
              const trend = data.monthlyTrend || [];
              if (trend.length === 0) return <p style={{ textAlign: "center", color: "var(--text-muted)" }}>Veri yok</p>;
              
              // Maksimum değeri bul
              const maxValue = Math.max(
                ...trend.map(t => Math.max(t.income, t.expense)),
                1 // 0'a bölmemek için
              );
              
              // Y koordinatını hesapla (165 = alt, 30 = üst)
              const getY = (value: number) => 165 - ((value / maxValue) * 135);
              
              // X pozisyonları
              const xPositions = trend.map((_, i) => 60 + (i * (300 / Math.max(trend.length - 1, 1))));
              
              // Income path
              const incomePoints = trend.map((t, i) => `${xPositions[i]} ${getY(t.income)}`);
              const incomeLine = `M ${incomePoints.join(' L ')}`;
              const incomeArea = `${incomeLine} L ${xPositions[xPositions.length - 1]} 165 L ${xPositions[0]} 165 Z`;
              
              // Expense path  
              const expensePoints = trend.map((t, i) => `${xPositions[i]} ${getY(t.expense)}`);
              const expenseLine = `M ${expensePoints.join(' L ')}`;
              const expenseArea = `${expenseLine} L ${xPositions[xPositions.length - 1]} 165 L ${xPositions[0]} 165 Z`;
              
              return (
                <svg viewBox="0 0 400 180" style={{ width: "100%", height: "100%" }}>
                  {/* Grid lines */}
                  {[0, 1, 2, 3, 4].map((i) => (
                    <line key={i} x1="40" y1={30 + i * 35} x2="380" y2={30 + i * 35} stroke="var(--border-light)" strokeDasharray="4" />
                  ))}
                  
                  {/* Income Area */}
                  <path d={incomeArea} fill="var(--green)" opacity="0.15" />
                  <path d={incomeLine} fill="none" stroke="var(--green)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                  
                  {/* Expense Area */}
                  <path d={expenseArea} fill="var(--red)" opacity="0.15" />
                  <path d={expenseLine} fill="none" stroke="var(--red)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                  
                  {/* Dots */}
                  {trend.map((t, i) => (
                    <g key={i}>
                      <circle cx={xPositions[i]} cy={getY(t.income)} r="5" fill="var(--green)" />
                      <circle cx={xPositions[i]} cy={getY(t.expense)} r="5" fill="var(--red)" />
                    </g>
                  ))}
                </svg>
              );
            })()}
          </div>
          
          {/* Month Labels */}
          <div style={{ display: "flex", justifyContent: "space-around", paddingLeft: "40px", paddingRight: "20px", marginTop: "8px" }}>
            {data.monthlyTrend.map((item: { month: string }) => (
              <span key={item.month} style={{ fontSize: "12px", color: "var(--text-muted)" }}>{item.month}</span>
            ))}
          </div>
          
          {/* Legend */}
          <div className="chart-legend">
            <div className="legend-item">
              <div className="legend-dot green"></div>
              <span className="legend-label">Gelir</span>
            </div>
            <div className="legend-item">
              <div className="legend-dot red"></div>
              <span className="legend-label">Gider</span>
            </div>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="card-base">
          <h3 className="chart-title">Kategori Dağılımı</h3>
          
          {/* Donut Chart */}
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}>
            <div style={{ position: "relative", width: "160px", height: "160px" }}>
              <svg viewBox="0 0 100 100" style={{ width: "100%", height: "100%", transform: "rotate(-90deg)" }}>
                {(data.categoryBreakdown || []).reduce(
                  (acc: { paths: React.ReactNode[]; offset: number }, cat: { percentage: number; color: string }, i: number) => {
                    const startAngle = acc.offset;
                    const angle = (cat.percentage / 100) * 360;
                    const endAngle = startAngle + angle;
                    const x1 = 50 + 40 * Math.cos((startAngle * Math.PI) / 180);
                    const y1 = 50 + 40 * Math.sin((startAngle * Math.PI) / 180);
                    const x2 = 50 + 40 * Math.cos((endAngle * Math.PI) / 180);
                    const y2 = 50 + 40 * Math.sin((endAngle * Math.PI) / 180);
                    const largeArc = angle > 180 ? 1 : 0;
                    acc.paths.push(
                      <path key={i} d={`M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`} fill={cat.color} />
                    );
                    acc.offset = endAngle;
                    return acc;
                  },
                  { paths: [] as React.ReactNode[], offset: 0 }
                ).paths}
              </svg>
              <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <div style={{ width: "96px", height: "96px", borderRadius: "50%", background: "var(--bg-card)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: "18px", fontWeight: "700", color: "var(--text-primary)" }}>{formatCurrency(totalExpense)}</span>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Toplam</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Category List */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {(data.categoryBreakdown || []).map((cat: { category: string; amount: number; percentage: number; color: string }) => (
              <div key={cat.category} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: cat.color }}></div>
                  <span style={{ fontWeight: "500", color: "var(--text-primary)" }}>{cat.category}</span>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span style={{ fontWeight: "600", color: "var(--text-primary)" }}>{formatCurrency(cat.amount)}</span>
                  <span style={{ fontSize: "13px", color: "var(--text-muted)", marginLeft: "8px" }}>%{cat.percentage}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Insights */}
      <div className="card-base">
        <h3 className="chart-title" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ color: "var(--purple)" }}>{Icons.sparkles}</span> AI Öngörüler ve Tavsiyeler
        </h3>
        {loadingTips ? (
          <div className="insights-grid">
            {[1, 2, 3].map(i => (
              <div key={i} className="skeleton" style={{ height: "80px", borderRadius: "12px" }}></div>
            ))}
          </div>
        ) : (
          <div className="insights-grid">
            {(aiTips?.insights || []).map((insight: string, i: number) => (
              <div key={i} className="insight-card">
                <div className={`insight-icon ${i === 0 ? "green" : i === 1 ? "blue" : "orange"}`}>
                  {i === 0 ? "✓" : i === 1 ? "!" : "★"}
                </div>
                <p className="insight-text">{insight}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tips */}
      <div className="tips-grid">
        <div className="tip-card green">
          <div className="tip-icon green">{Icons.wallet}</div>
          <div>
            <h4 className="tip-title green" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              {Icons.sparkles} Tasarruf İpucu
            </h4>
            {loadingTips ? (
              <div className="skeleton" style={{ height: "20px", width: "80%", borderRadius: "4px" }}></div>
            ) : (
              <p className="tip-text">{aiTips?.savingsTip || "Aylık gelirinizin en az %20'sini biriktirmeyi hedefleyin"}</p>
            )}
          </div>
        </div>
        <div className="tip-card blue">
          <div className="tip-icon blue">{Icons.target}</div>
          <div>
            <h4 className="tip-title blue" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              {Icons.sparkles} Hedef Önerisi
            </h4>
            {loadingTips ? (
              <div className="skeleton" style={{ height: "20px", width: "80%", borderRadius: "4px" }}></div>
            ) : (
              <p className="tip-text">{aiTips?.goalSuggestion || "Acil durum fonu oluşturun: 3-6 aylık gider tutarı"}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
