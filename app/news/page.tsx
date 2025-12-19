"use client";

import { useEffect, useState } from "react";

interface NewsItem {
  id: string;
  title: string;
  description: string;
  source: string;
  url: string;
  publishedAt: string;
  category: string;
}

const Icons = {
  newspaper: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/><path d="M18 14h-8"/><path d="M15 18h-5"/><path d="M10 6h8v4h-8V6Z"/></svg>,
  trendingUp: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>,
  pieChart: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>,
  gem: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 3h12l4 6-10 13L2 9Z"/><path d="M11 3 8 9l4 13 4-13-3-6"/><path d="M2 9h20"/></svg>,
  wallet: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/></svg>,
  externalLink: <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" x2="21" y1="14" y2="3"/></svg>,
};

const categoryIcons: Record<string, React.ReactNode> = {
  all: Icons.newspaper,
  economy: Icons.trendingUp,
  markets: Icons.pieChart,
  crypto: Icons.gem,
  personal: Icons.wallet,
};

export default function NewsPage() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      const res = await fetch("/api/news");
      const data = await res.json();
      setNews(data || []);
    } catch (error) {
      console.error("Haberler yüklenemedi:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const categories = [
    { id: "all", name: "Tümü" },
    { id: "economy", name: "Ekonomi" },
    { id: "markets", name: "Piyasalar" },
    { id: "crypto", name: "Kripto" },
    { id: "personal", name: "Kişisel Finans" },
  ];

  const filteredNews =
    activeCategory === "all"
      ? news
      : news.filter((n) => n.category === activeCategory);

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="h-10 w-48 skeleton rounded-xl"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card skeleton h-64"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-1">Finansal Haberler</h1>
        <p className="text-[var(--muted-foreground)]">
          Güncel ekonomi ve finans haberlerini takip edin
        </p>
      </div>

      {/* Featured News */}
      {news.length > 0 && (
        <div
          className="card relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, var(--primary) 0%, #7c3aed 100%)",
            minHeight: "280px",
          }}
        >
          <div className="relative z-10 h-full flex flex-col justify-end">
            <span className="badge mb-4" style={{ background: "rgba(255,255,255,0.2)", color: "white" }}>
              Öne Çıkan
            </span>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
              {news[0].title}
            </h2>
            <p className="text-white/80 mb-4 line-clamp-2">{news[0].description}</p>
            <div className="flex items-center justify-between">
              <span className="text-white/60 text-sm">
                {news[0].source} • {formatDate(news[0].publishedAt)}
              </span>
              <a
                href={news[0].url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn"
                style={{ background: "rgba(255,255,255,0.2)", color: "white" }}
              >
                Haberi Oku →
              </a>
            </div>
          </div>
          <div
            className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10"
            style={{ background: "white", transform: "translate(30%, -30%)" }}
          />
        </div>
      )}

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-3">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-5 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${
              activeCategory === cat.id
                ? "bg-[var(--primary)] text-white shadow-lg"
                : "bg-[var(--card)] text-[var(--muted-foreground)] hover:bg-[var(--secondary)]"
            }`}
            style={
              activeCategory === cat.id
                ? { boxShadow: "0 4px 14px rgba(76, 95, 213, 0.3)" }
                : {}
            }
          >
            {categoryIcons[cat.id]}
            {cat.name}
          </button>
        ))}
      </div>

      {/* News Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredNews.length === 0 ? (
          <div className="col-span-full card text-center py-16">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-[#e8ebff] flex items-center justify-center text-[#4c5fd5]">
              {Icons.newspaper}
            </div>
            <h3 className="text-xl font-semibold mb-2">Haber bulunamadı</h3>
            <p className="text-[var(--muted-foreground)]">
              Bu kategoride henüz haber yok
            </p>
          </div>
        ) : (
          filteredNews.slice(1).map((item, index) => (
            <a
              key={item.id || index}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="card group hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-4">
                <span className="badge badge-primary">{item.category || "Genel"}</span>
                <span className="text-xs text-[var(--muted-foreground)]">
                  {formatDate(item.publishedAt)}
                </span>
              </div>
              <h3 className="font-semibold text-lg mb-2 group-hover:text-[var(--primary)] transition-colors line-clamp-2">
                {item.title}
              </h3>
              <p className="text-sm text-[var(--muted-foreground)] mb-4 line-clamp-3">
                {item.description}
              </p>
              <div className="flex items-center justify-between mt-auto pt-4 border-t border-[var(--border)]">
                <span className="text-sm font-medium text-[var(--muted-foreground)]">
                  {item.source}
                </span>
                <span className="text-[var(--primary)] font-semibold group-hover:translate-x-1 transition-transform">
                  →
                </span>
              </div>
            </a>
          ))
        )}
      </div>

      {/* Info Card */}
      <div className="card" style={{ background: "var(--secondary)" }}>
        <div className="flex items-center gap-4">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl"
            style={{ background: "var(--primary-light)" }}
          >
            💡
          </div>
          <div className="flex-1">
            <h3 className="font-semibold mb-1">Finansal Okuryazarlık</h3>
            <p className="text-sm text-[var(--muted-foreground)]">
              Güncel haberleri takip etmek, finansal kararlarınızı daha bilinçli almanıza yardımcı olur.
              Düzenli olarak ekonomi haberlerini okuyarak piyasaları anlayın.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
