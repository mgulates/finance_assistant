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
  newspaper: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/><path d="M18 14h-8"/><path d="M15 18h-5"/><path d="M10 6h8v4h-8V6Z"/></svg>,
  trendingUp: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>,
  pieChart: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>,
  gem: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 3h12l4 6-10 13L2 9Z"/><path d="M11 3 8 9l4 13 4-13-3-6"/><path d="M2 9h20"/></svg>,
  wallet: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/></svg>,
  arrow: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>,
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
      <div className="page-container">
        <div className="skeleton" style={{ height: "40px", width: "200px" }}></div>
        <div className="skeleton" style={{ height: "260px" }}></div>
        <div className="news-grid">
          {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="skeleton" style={{ height: "220px" }}></div>)}
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Finansal Haberler</h1>
          <p className="page-subtitle">Güncel ekonomi ve finans haberlerini takip edin</p>
        </div>
      </div>

      {/* Featured News */}
      {news.length > 0 && (
        <div className="featured-card">
          <div className="featured-circle"></div>
          <div className="featured-content">
            <span className="featured-badge">Öne Çıkan</span>
            <h2 className="featured-title">{news[0].title}</h2>
            <p className="featured-desc">{news[0].description}</p>
            <div className="featured-footer">
              <span className="featured-source">{news[0].source} • {formatDate(news[0].publishedAt)}</span>
              <a href={news[0].url} target="_blank" rel="noopener noreferrer" className="featured-button">
                Haberi Oku {Icons.arrow}
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Category Tabs */}
      <div className="categories-container">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`category-btn ${activeCategory === cat.id ? "active" : ""}`}
          >
            {categoryIcons[cat.id]}
            {cat.name}
          </button>
        ))}
      </div>

      {/* News Grid */}
      <div className="news-grid">
        {filteredNews.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon blue">{Icons.newspaper}</div>
            <h3 className="empty-title">Haber bulunamadı</h3>
            <p className="empty-text">Bu kategoride henüz haber yok</p>
          </div>
        ) : (
          filteredNews.slice(1).map((item, index) => (
            <a
              key={item.id || index}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="news-card"
            >
              <div className="news-header">
                <span className="news-badge">{item.category || "Genel"}</span>
                <span className="news-date">{formatDate(item.publishedAt)}</span>
              </div>
              <h3 className="news-title">{item.title}</h3>
              <p className="news-desc">{item.description}</p>
              <div className="news-footer">
                <span className="news-source">{item.source}</span>
                <span className="news-arrow">→</span>
              </div>
            </a>
          ))
        )}
      </div>

      {/* Info Card */}
      <div className="info-card">
        <div className="info-icon blue">💡</div>
        <div style={{ flex: 1 }}>
          <h3 className="info-title">Finansal Okuryazarlık</h3>
          <p className="info-text">
            Güncel haberleri takip etmek, finansal kararlarınızı daha bilinçli almanıza yardımcı olur.
            Düzenli olarak ekonomi haberlerini okuyarak piyasaları anlayın.
          </p>
        </div>
      </div>
    </div>
  );
}
