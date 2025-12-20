"use client";

import { useState, useRef } from "react";

interface ParsedTransaction {
  date: string;
  description: string;
  amount: number;
  type: "income" | "expense";
  category?: string;
  selected: boolean;
}

const Icons = {
  upload: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>,
  file: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>,
  check: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>,
  sparkles: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>,
  trash: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>,
  arrowRight: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>,
  income: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>,
  expense: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>,
};

export default function ImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [transactions, setTransactions] = useState<ParsedTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [categorizing, setCategorizing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setTransactions([]);
      setError("");
      setSuccess("");
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    const validExtensions = ['.csv', '.txt', '.xlsx', '.xls', '.pdf', '.jpg', '.jpeg', '.png', '.webp'];
    const isValid = validExtensions.some(ext => droppedFile?.name.toLowerCase().endsWith(ext));
    
    if (droppedFile && isValid) {
      setFile(droppedFile);
      setTransactions([]);
      setError("");
      setSuccess("");
    } else {
      setError("Lütfen CSV, Excel, PDF veya görüntü dosyası yükleyin");
    }
  };

  const parseFile = async () => {
    if (!file) return;
    
    setLoading(true);
    setError("");
    
    try {
      const formData = new FormData();
      formData.append("file", file);
      
      const res = await fetch("/api/import/parse", {
        method: "POST",
        body: formData,
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Dosya işlenemedi");
      }
      
      setTransactions(data.transactions.map((t: ParsedTransaction) => ({ ...t, selected: true })));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Dosya işlenirken hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const categorizeWithAI = async () => {
    if (transactions.length === 0) return;
    
    setCategorizing(true);
    try {
      const res = await fetch("/api/import/categorize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transactions }),
      });
      
      const data = await res.json();
      
      if (data.transactions) {
        setTransactions(data.transactions);
      }
    } catch (err) {
      console.error("Kategorileme hatası:", err);
    } finally {
      setCategorizing(false);
    }
  };

  const toggleTransaction = (index: number) => {
    setTransactions(prev => 
      prev.map((t, i) => i === index ? { ...t, selected: !t.selected } : t)
    );
  };

  const toggleAll = (selected: boolean) => {
    setTransactions(prev => prev.map(t => ({ ...t, selected })));
  };

  const saveTransactions = async () => {
    const selectedTransactions = transactions.filter(t => t.selected);
    if (selectedTransactions.length === 0) {
      setError("Lütfen en az bir işlem seçin");
      return;
    }
    
    setSaving(true);
    setError("");
    
    try {
      const res = await fetch("/api/import/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transactions: selectedTransactions }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Kaydetme başarısız");
      }
      
      setSuccess(`${data.saved} işlem başarıyla kaydedildi!`);
      setTransactions([]);
      setFile(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kaydetme sırasında hata oluştu");
    } finally {
      setSaving(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
      maximumFractionDigits: 2,
    }).format(Math.abs(amount));
  };

  const selectedCount = transactions.filter(t => t.selected).length;
  const incomeCount = transactions.filter(t => t.selected && t.type === "income").length;
  const expenseCount = transactions.filter(t => t.selected && t.type === "expense").length;
  const totalIncome = transactions.filter(t => t.selected && t.type === "income").reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions.filter(t => t.selected && t.type === "expense").reduce((sum, t) => sum + Math.abs(t.amount), 0);

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Banka Ekstresi İçe Aktar</h1>
          <p className="page-subtitle">CSV formatındaki banka ekstrenizi yükleyin</p>
        </div>
      </div>

      {/* Upload Area */}
      {transactions.length === 0 && (
        <div 
          className="card-base"
          style={{ 
            border: "2px dashed var(--border-light)",
            textAlign: "center",
            padding: "60px 40px",
            cursor: "pointer",
            transition: "all 0.2s"
          }}
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.txt,.xlsx,.xls,.pdf,.jpg,.jpeg,.png,.webp"
            onChange={handleFileChange}
            style={{ display: "none" }}
          />
          
          <div style={{ 
            width: "80px", 
            height: "80px", 
            borderRadius: "50%", 
            background: "var(--blue-light)", 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center", 
            margin: "0 auto 20px",
            color: "var(--blue)"
          }}>
            {Icons.upload}
          </div>
          
          {file ? (
            <>
              <h3 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "8px", color: "var(--text-primary)" }}>
                {Icons.file} {file.name}
              </h3>
              <p style={{ color: "var(--text-muted)", marginBottom: "20px" }}>
                {(file.size / 1024).toFixed(1)} KB
              </p>
              <button 
                className="btn-add gradient"
                onClick={(e) => { e.stopPropagation(); parseFile(); }}
                disabled={loading}
              >
                {loading ? "İşleniyor..." : "Dosyayı Analiz Et"}
              </button>
            </>
          ) : (
            <>
              <h3 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "8px", color: "var(--text-primary)" }}>
                Dosya Yükle
              </h3>
              <p style={{ color: "var(--text-muted)" }}>
                Dosyayı sürükleyin veya tıklayarak seçin
              </p>
              <p style={{ color: "var(--text-muted)", fontSize: "13px", marginTop: "12px" }}>
                📄 CSV, TXT &nbsp; 📊 Excel (XLS, XLSX) &nbsp; 📕 PDF &nbsp; 🖼️ Görüntü (JPG, PNG)
              </p>
            </>
          )}
        </div>
      )}

      {/* Error/Success Messages */}
      {error && (
        <div style={{ 
          background: "var(--red-light)", 
          color: "var(--red)", 
          padding: "12px 16px", 
          borderRadius: "8px",
          marginBottom: "16px"
        }}>
          {error}
        </div>
      )}
      
      {success && (
        <div style={{ 
          background: "var(--green-light)", 
          color: "var(--green)", 
          padding: "12px 16px", 
          borderRadius: "8px",
          marginBottom: "16px"
        }}>
          {success}
        </div>
      )}

      {/* Transactions Preview */}
      {transactions.length > 0 && (
        <>
          {/* Summary Stats */}
          <div className="stats-grid" style={{ marginBottom: "20px" }}>
            <div className="stat-card-horizontal">
              <div className="stat-icon-box blue">{Icons.file}</div>
              <div className="stat-content">
                <p className="stat-label">Toplam İşlem</p>
                <p className="stat-value">{transactions.length}</p>
              </div>
            </div>
            <div className="stat-card-horizontal">
              <div className="stat-icon-box green">{Icons.income}</div>
              <div className="stat-content">
                <p className="stat-label">Gelir ({incomeCount})</p>
                <p className="stat-value green">{formatCurrency(totalIncome)}</p>
              </div>
            </div>
            <div className="stat-card-horizontal">
              <div className="stat-icon-box red">{Icons.expense}</div>
              <div className="stat-content">
                <p className="stat-label">Gider ({expenseCount})</p>
                <p className="stat-value red">{formatCurrency(totalExpense)}</p>
              </div>
            </div>
            <div className="stat-card-horizontal">
              <div className="stat-icon-box purple">{Icons.check}</div>
              <div className="stat-content">
                <p className="stat-label">Seçili</p>
                <p className="stat-value">{selectedCount}</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="card-base" style={{ marginBottom: "20px", display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
            <button 
              className="btn-add"
              onClick={categorizeWithAI}
              disabled={categorizing}
              style={{ background: "var(--purple)", color: "white" }}
            >
              {categorizing ? "Kategorileniyor..." : <>{Icons.sparkles} AI ile Kategorile</>}
            </button>
            
            <button 
              className="btn-add gradient"
              onClick={saveTransactions}
              disabled={saving || selectedCount === 0}
            >
              {saving ? "Kaydediliyor..." : <>{Icons.check} {selectedCount} İşlemi Kaydet</>}
            </button>
            
            <div style={{ marginLeft: "auto", display: "flex", gap: "8px" }}>
              <button 
                className="btn-secondary"
                onClick={() => toggleAll(true)}
              >
                Tümünü Seç
              </button>
              <button 
                className="btn-secondary"
                onClick={() => toggleAll(false)}
              >
                Seçimi Kaldır
              </button>
              <button 
                className="btn-secondary"
                onClick={() => { setTransactions([]); setFile(null); }}
                style={{ color: "var(--red)" }}
              >
                {Icons.trash} Temizle
              </button>
            </div>
          </div>

          {/* Transactions Table */}
          <div className="card-base" style={{ overflow: "hidden" }}>
            <div style={{ overflowX: "auto" }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ width: "40px" }}>
                      <input 
                        type="checkbox" 
                        checked={selectedCount === transactions.length}
                        onChange={(e) => toggleAll(e.target.checked)}
                      />
                    </th>
                    <th>Tarih</th>
                    <th>Açıklama</th>
                    <th>Kategori</th>
                    <th>Tür</th>
                    <th style={{ textAlign: "right" }}>Tutar</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((t, i) => (
                    <tr 
                      key={i} 
                      style={{ 
                        opacity: t.selected ? 1 : 0.5,
                        cursor: "pointer"
                      }}
                      onClick={() => toggleTransaction(i)}
                    >
                      <td onClick={(e) => e.stopPropagation()}>
                        <input 
                          type="checkbox" 
                          checked={t.selected}
                          onChange={() => toggleTransaction(i)}
                        />
                      </td>
                      <td>{t.date}</td>
                      <td style={{ maxWidth: "300px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {t.description}
                      </td>
                      <td>
                        <span style={{ 
                          padding: "4px 8px", 
                          borderRadius: "4px", 
                          fontSize: "12px",
                          background: t.category ? "var(--blue-light)" : "var(--bg-main)",
                          color: t.category ? "var(--blue)" : "var(--text-muted)"
                        }}>
                          {t.category || "Kategorisiz"}
                        </span>
                      </td>
                      <td>
                        <span style={{ 
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                          padding: "4px 8px", 
                          borderRadius: "4px", 
                          fontSize: "12px",
                          background: t.type === "income" ? "var(--green-light)" : "var(--red-light)",
                          color: t.type === "income" ? "var(--green)" : "var(--red)"
                        }}>
                          {t.type === "income" ? Icons.income : Icons.expense}
                          {t.type === "income" ? "Gelir" : "Gider"}
                        </span>
                      </td>
                      <td style={{ 
                        textAlign: "right", 
                        fontWeight: "600",
                        color: t.type === "income" ? "var(--green)" : "var(--red)"
                      }}>
                        {t.type === "income" ? "+" : "-"}{formatCurrency(t.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Help Section */}
      <div className="card-base" style={{ marginTop: "24px" }}>
        <h3 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "16px", color: "var(--text-primary)" }}>
          📋 Desteklenen Dosya Formatları
        </h3>
        
        <div style={{ display: "grid", gap: "16px" }}>
          {/* CSV/Excel */}
          <div>
            <h4 style={{ fontSize: "14px", fontWeight: "600", color: "var(--text-secondary)", marginBottom: "8px" }}>
              📄 CSV / Excel (XLS, XLSX)
            </h4>
            <p style={{ color: "var(--text-muted)", fontSize: "13px", marginBottom: "8px" }}>
              Banka ekstrenizi CSV veya Excel olarak indirip yükleyebilirsiniz:
            </p>
            <div style={{ 
              background: "var(--bg-main)", 
              padding: "12px 16px", 
              borderRadius: "8px", 
              fontFamily: "monospace",
              fontSize: "12px",
              color: "var(--text-secondary)",
              overflowX: "auto"
            }}>
              <div>Tarih | Açıklama | Tutar</div>
              <div>20.12.2025 | Market Alışverişi | -150.00</div>
              <div>19.12.2025 | Maaş Ödemesi | 15000.00</div>
            </div>
          </div>
          
          {/* PDF */}
          <div>
            <h4 style={{ fontSize: "14px", fontWeight: "600", color: "var(--text-secondary)", marginBottom: "8px" }}>
              📕 PDF Dosyası
            </h4>
            <p style={{ color: "var(--text-muted)", fontSize: "13px" }}>
              Banka ekstrenizin PDF versiyonunu yükleyin. AI otomatik olarak işlemleri çıkaracaktır.
            </p>
          </div>
          
          {/* Görüntü */}
          <div>
            <h4 style={{ fontSize: "14px", fontWeight: "600", color: "var(--text-secondary)", marginBottom: "8px" }}>
              🖼️ Görüntü (JPG, PNG)
            </h4>
            <p style={{ color: "var(--text-muted)", fontSize: "13px" }}>
              Banka dekontunun veya ekstresinin fotoğrafını çekin. AI görüntüdeki işlemleri okuyacaktır.
              <br />
              <span style={{ color: "var(--yellow)", fontSize: "12px" }}>
                ⚠️ Görüntü okuma için <code>llama3.2-vision</code> modeli gereklidir
              </span>
            </p>
          </div>
        </div>
        
        <p style={{ color: "var(--text-muted)", marginTop: "16px", fontSize: "13px", borderTop: "1px solid var(--border-light)", paddingTop: "12px" }}>
          💡 <strong>İpucu:</strong> Negatif tutarlar gider, pozitif tutarlar gelir olarak algılanır. AI kategorileme özelliği ile işlemleriniz otomatik kategorilenir.
        </p>
      </div>
    </div>
  );
}
