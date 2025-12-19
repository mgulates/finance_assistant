"use client";

import { useEffect, useState } from "react";

interface AnalysisData {
  monthlyTrend: { month: string; income: number; expense: number }[];
  categoryBreakdown: { category: string; amount: number; percentage: number; color: string }[];
  insights: string[];
  savingsRate: number;
  healthScore: number;
}

const Icons = {
  trendingUp: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>,
  pieChart: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>,
  wallet: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/></svg>,
  target: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>,
  sparkles: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>,
  loader: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-spin"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>,
};

export default function AnalysisPage() {
  const [data, setData] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [aiInsights, setAiInsights] = useState<string>("");
  const [loadingAI, setLoadingAI] = useState(false);

  useEffect(() => {
    fetchAnalysis();
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
      <div className="space-y-6 animate-fade-in">
        <div className="h-10 w-48 skeleton rounded-xl"></div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card skeleton h-80"></div>
          <div className="card skeleton h-80"></div>
        </div>
      </div>
    );
  }

  // Demo data if no data available
  const defaultData = {
    monthlyTrend: [
      { month: "Tem", income: 8500, expense: 6200 },
      { month: "Ağu", income: 9000, expense: 5800 },
      { month: "Eyl", income: 8750, expense: 7100 },
      { month: "Eki", income: 9200, expense: 6500 },
      { month: "Kas", income: 8900, expense: 6800 },
      { month: "Ara", income: 10500, expense: 8200 },
    ],
    categoryBreakdown: [
      { category: "Market", amount: 2500, percentage: 35, color: "#4c5fd5" },
      { category: "Faturalar", amount: 1800, percentage: 25, color: "#ff7a00" },
      { category: "Ulaşım", amount: 1200, percentage: 17, color: "#10b981" },
      { category: "Eğlence", amount: 900, percentage: 13, color: "#7c3aed" },
      { category: "Diğer", amount: 700, percentage: 10, color: "#f59e0b" },
    ],
    insights: [
      "Bu ay harcamalarınız geçen aya göre %12 azaldı",
      "Market harcamalarınız bütçenizin %35'ini oluşturuyor",
      "Tasarruf oranınız %18 ile hedefin üzerinde",
    ],
    savingsRate: 18,
    healthScore: 75,
  };

  const analysisData = {
    monthlyTrend: data?.monthlyTrend || defaultData.monthlyTrend,
    categoryBreakdown: data?.categoryBreakdown || defaultData.categoryBreakdown,
    insights: data?.insights || defaultData.insights,
    savingsRate: data?.savingsRate ?? defaultData.savingsRate,
    healthScore: data?.healthScore ?? defaultData.healthScore,
  };

  const totalExpense = analysisData.categoryBreakdown.reduce((sum, c) => sum + c.amount, 0);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold mb-1">Finansal Analiz</h1>
          <p className="text-[var(--muted-foreground)]">
            Harcama alışkanlıklarınızı analiz edin
          </p>
        </div>
        <button
          onClick={getAIInsights}
          disabled={loadingAI}
          className="btn btn-primary flex items-center gap-2"
        >
          {loadingAI ? (
            <>
              {Icons.loader} Analiz Ediliyor...
            </>
          ) : (
            <>
              {Icons.sparkles} AI Analiz
            </>
          )}
        </button>
      </div>

      {/* AI Insights Card */}
      {aiInsights && (
        <div
          className="card"
          style={{
            background: "linear-gradient(135deg, var(--primary) 0%, #7c3aed 100%)",
          }}
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-white">
              {Icons.sparkles}
            </div>
            <div className="flex-1">
              <h3 className="text-white font-semibold mb-2">AI Finansal Asistan</h3>
              <p className="text-white/90 whitespace-pre-line">{aiInsights}</p>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="stat-card">
          <div className="icon" style={{ background: "#e8ebff", color: "#4c5fd5" }}>
            {Icons.pieChart}
          </div>
          <p className="stat-label">Toplam Harcama</p>
          <p className="stat-value">{formatCurrency(totalExpense)}</p>
        </div>
        <div className="stat-card">
          <div className="icon" style={{ background: "rgba(16, 185, 129, 0.1)", color: "#10b981" }}>
            {Icons.wallet}
          </div>
          <p className="stat-label">Tasarruf Oranı</p>
          <p className="stat-value text-[var(--success)]">%{analysisData.savingsRate}</p>
        </div>
        <div className="stat-card">
          <div className="icon" style={{ background: "#fff3e8", color: "#ff7a00" }}>
            {Icons.target}
          </div>
          <p className="stat-label">Finansal Sağlık</p>
          <p className="stat-value gradient-text">{analysisData.healthScore}/100</p>
        </div>
        <div className="stat-card">
          <div className="icon" style={{ background: "rgba(124, 58, 237, 0.1)", color: "#7c3aed" }}>
            {Icons.trendingUp}
          </div>
          <p className="stat-label">Trend</p>
          <p className="stat-value text-[var(--success)]">↑ İyileşiyor</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trend Chart */}
        <div className="card">
          <h3 className="font-semibold text-lg mb-6">Aylık Gelir/Gider Trendi</h3>
          <div className="h-64 relative">
            <svg viewBox="0 0 400 200" className="w-full h-full">
              {/* Grid */}
              {[0, 1, 2, 3, 4].map((i) => (
                <line
                  key={i}
                  x1="40"
                  y1={40 + i * 35}
                  x2="380"
                  y2={40 + i * 35}
                  stroke="#e8ecf4"
                  strokeDasharray="4"
                />
              ))}

              {/* Income Area */}
              <path
                d="M 60 140 L 120 120 L 180 130 L 240 115 L 300 125 L 360 90 L 360 180 L 60 180 Z"
                fill="#10b981"
                opacity="0.15"
              />
              {/* Income Line */}
              <path
                d="M 60 140 L 120 120 L 180 130 L 240 115 L 300 125 L 360 90"
                fill="none"
                stroke="#10b981"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Expense Area */}
              <path
                d="M 60 155 L 120 145 L 180 160 L 240 150 L 300 155 L 360 130 L 360 180 L 60 180 Z"
                fill="#ef4444"
                opacity="0.15"
              />
              {/* Expense Line */}
              <path
                d="M 60 155 L 120 145 L 180 160 L 240 150 L 300 155 L 360 130"
                fill="none"
                stroke="#ef4444"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Dots */}
              {[60, 120, 180, 240, 300, 360].map((x, i) => (
                <g key={i}>
                  <circle cx={x} cy={[140, 120, 130, 115, 125, 90][i]} r="5" fill="#10b981" />
                  <circle cx={x} cy={[155, 145, 160, 150, 155, 130][i]} r="5" fill="#ef4444" />
                </g>
              ))}
            </svg>

            {/* Month Labels */}
            <div className="absolute bottom-0 left-10 right-10 flex justify-between text-xs text-[var(--muted-foreground)]">
              {analysisData.monthlyTrend.map((item) => (
                <span key={item.month}>{item.month}</span>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="flex justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ background: "#10b981" }}></div>
              <span className="text-sm text-[var(--muted-foreground)]">Gelir</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ background: "#ef4444" }}></div>
              <span className="text-sm text-[var(--muted-foreground)]">Gider</span>
            </div>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="card">
          <h3 className="font-semibold text-lg mb-6">Kategori Dağılımı</h3>

          {/* Donut Chart */}
          <div className="flex items-center justify-center mb-6">
            <div className="relative w-48 h-48">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                {analysisData.categoryBreakdown.reduce(
                  (acc, cat, i) => {
                    const startAngle = acc.offset;
                    const angle = (cat.percentage / 100) * 360;
                    const endAngle = startAngle + angle;

                    const x1 = 50 + 40 * Math.cos((startAngle * Math.PI) / 180);
                    const y1 = 50 + 40 * Math.sin((startAngle * Math.PI) / 180);
                    const x2 = 50 + 40 * Math.cos((endAngle * Math.PI) / 180);
                    const y2 = 50 + 40 * Math.sin((endAngle * Math.PI) / 180);

                    const largeArc = angle > 180 ? 1 : 0;

                    acc.paths.push(
                      <path
                        key={i}
                        d={`M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`}
                        fill={cat.color}
                      />
                    );
                    acc.offset = endAngle;
                    return acc;
                  },
                  { paths: [] as React.ReactNode[], offset: 0 }
                ).paths}
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-28 h-28 rounded-full bg-white flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold">{formatCurrency(totalExpense)}</span>
                  <span className="text-xs text-[var(--muted-foreground)]">Toplam</span>
                </div>
              </div>
            </div>
          </div>

          {/* Category List */}
          <div className="space-y-3">
            {analysisData.categoryBreakdown.map((cat) => (
              <div key={cat.category} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ background: cat.color }}
                  />
                  <span className="font-medium">{cat.category}</span>
                </div>
                <div className="text-right">
                  <span className="font-semibold">{formatCurrency(cat.amount)}</span>
                  <span className="text-sm text-[var(--muted-foreground)] ml-2">
                    %{cat.percentage}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Insights */}
      <div className="card">
        <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
          <span className="text-[#4c5fd5]">{Icons.pieChart}</span> Öngörüler ve Tavsiyeler
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {analysisData.insights.map((insight, i) => (
            <div
              key={i}
              className="p-4 rounded-xl"
              style={{ background: "var(--secondary)" }}
            >
              <div className="flex items-start gap-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0"
                  style={{
                    background:
                      i === 0
                        ? "#10b981"
                        : i === 1
                        ? "#4c5fd5"
                        : "#ff7a00",
                  }}
                >
                  {i === 0 ? "✓" : i === 1 ? "!" : "★"}
                </div>
                <p className="text-sm">{insight}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tips */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card" style={{ background: "rgba(16, 185, 129, 0.05)" }}>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[rgba(16,185,129,0.1)] flex items-center justify-center text-[#10b981]">
              {Icons.wallet}
            </div>
            <div>
              <h4 className="font-semibold text-[#10b981]">Tasarruf İpucu</h4>
              <p className="text-sm text-[var(--muted-foreground)]">
                Aylık gelirinizin en az %20'sini biriktirmeyi hedefleyin
              </p>
            </div>
          </div>
        </div>
        <div className="card" style={{ background: "rgba(76, 95, 213, 0.05)" }}>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[rgba(76,95,213,0.1)] flex items-center justify-center text-[#4c5fd5]">
              {Icons.target}
            </div>
            <div>
              <h4 className="font-semibold text-[#4c5fd5]">Hedef Önerisi</h4>
              <p className="text-sm text-[var(--muted-foreground)]">
                Acil durum fonu oluşturun: 3-6 aylık gider tutarı
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
