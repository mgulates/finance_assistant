import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';

interface ParsedTransaction {
  date: string;
  description: string;
  amount: number;
  type: "income" | "expense";
  category?: string;
}

const OLLAMA_URL = 'http://localhost:11434/api/chat';

// Tarih formatlarını parse et
function parseDate(dateStr: string): string {
  if (!dateStr) return '';
  
  const str = String(dateStr).trim();
  
  // Excel serial date number
  if (/^\d+$/.test(str) && parseInt(str) > 30000) {
    const excelDate = parseInt(str);
    const date = new Date((excelDate - 25569) * 86400 * 1000);
    return `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getFullYear()}`;
  }
  
  // Yaygın Türk banka formatları
  const formats = [
    /(\d{2})\.(\d{2})\.(\d{4})/, // 20.12.2025
    /(\d{2})\/(\d{2})\/(\d{4})/, // 20/12/2025
    /(\d{4})-(\d{2})-(\d{2})/,   // 2025-12-20
    /(\d{2})-(\d{2})-(\d{4})/,   // 20-12-2025
  ];

  for (const format of formats) {
    const match = str.match(format);
    if (match) {
      if (match[3] && match[3].length === 4) {
        return `${match[1]}.${match[2]}.${match[3]}`;
      }
      if (match[1] && match[1].length === 4) {
        return `${match[3]}.${match[2]}.${match[1]}`;
      }
    }
  }
  
  return str;
}

// Tutarı parse et
function parseAmount(amountStr: string | number): number {
  if (typeof amountStr === 'number') return amountStr;
  
  let cleaned = String(amountStr)
    .replace(/[^\d,.\-+]/g, '')
    .trim();
  
  // Türkçe format (1.234,56)
  if (cleaned.includes(',') && cleaned.includes('.')) {
    if (cleaned.lastIndexOf(',') > cleaned.lastIndexOf('.')) {
      cleaned = cleaned.replace(/\./g, '').replace(',', '.');
    } else {
      cleaned = cleaned.replace(/,/g, '');
    }
  } else if (cleaned.includes(',')) {
    cleaned = cleaned.replace(',', '.');
  }
  
  return parseFloat(cleaned) || 0;
}

// CSV satırını parse et
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if ((char === ',' || char === ';' || char === '\t') && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result;
}

// Sütun indekslerini bul
function findColumnIndices(headers: string[]): { dateIdx: number; descIdx: number; amountIdx: number; creditIdx: number; debitIdx: number } {
  const lowerHeaders = headers.map(h => String(h).toLowerCase().trim());
  
  const dateKeywords = ['tarih', 'date', 'işlem tarihi', 'valör', 'islem tarihi'];
  const descKeywords = ['açıklama', 'description', 'açiklama', 'işlem açıklaması', 'detay', 'aciklama'];
  const amountKeywords = ['tutar', 'amount', 'miktar', 'işlem tutarı', 'islem tutari'];
  const creditKeywords = ['alacak', 'credit', 'gelen', 'yatan'];
  const debitKeywords = ['borç', 'debit', 'giden', 'çekilen', 'borc', 'cekilen'];
  
  const findIdx = (keywords: string[]) => {
    for (const kw of keywords) {
      const idx = lowerHeaders.findIndex(h => h.includes(kw));
      if (idx !== -1) return idx;
    }
    return -1;
  };
  
  return {
    dateIdx: findIdx(dateKeywords),
    descIdx: findIdx(descKeywords),
    amountIdx: findIdx(amountKeywords),
    creditIdx: findIdx(creditKeywords),
    debitIdx: findIdx(debitKeywords),
  };
}

// CSV/TXT parse
function parseCSV(text: string): ParsedTransaction[] {
  const lines = text.split(/\r?\n/).filter(line => line.trim());
  
  if (lines.length < 2) return [];
  
  const headers = parseCSVLine(lines[0]);
  const indices = findColumnIndices(headers);
  
  const dateIdx = indices.dateIdx !== -1 ? indices.dateIdx : 0;
  const descIdx = indices.descIdx !== -1 ? indices.descIdx : 1;
  const amountIdx = indices.amountIdx !== -1 ? indices.amountIdx : 2;
  const creditIdx = indices.creditIdx;
  const debitIdx = indices.debitIdx;
  
  const transactions: ParsedTransaction[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const cols = parseCSVLine(lines[i]);
    if (cols.length < 3) continue;
    
    const date = parseDate(cols[dateIdx] || '');
    const description = (cols[descIdx] || '').replace(/"/g, '').trim();
    
    let amount = 0;
    let type: "income" | "expense" = "expense";
    
    if (creditIdx !== -1 && debitIdx !== -1) {
      const credit = parseAmount(cols[creditIdx] || '0');
      const debit = parseAmount(cols[debitIdx] || '0');
      
      if (credit > 0) {
        amount = credit;
        type = "income";
      } else if (debit > 0) {
        amount = debit;
        type = "expense";
      }
    } else {
      amount = parseAmount(cols[amountIdx] || '0');
      type = amount >= 0 ? "income" : "expense";
      amount = Math.abs(amount);
    }
    
    if (!date || !description || amount === 0) continue;
    
    transactions.push({ date, description, amount, type });
  }
  
  return transactions;
}

// Excel parse
function parseExcel(buffer: Buffer): ParsedTransaction[] {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  
  // Sheet'i JSON'a çevir
  const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as (string | number)[][];
  
  if (data.length < 2) return [];
  
  const headers = data[0].map(h => String(h || ''));
  const indices = findColumnIndices(headers);
  
  const dateIdx = indices.dateIdx !== -1 ? indices.dateIdx : 0;
  const descIdx = indices.descIdx !== -1 ? indices.descIdx : 1;
  const amountIdx = indices.amountIdx !== -1 ? indices.amountIdx : 2;
  const creditIdx = indices.creditIdx;
  const debitIdx = indices.debitIdx;
  
  const transactions: ParsedTransaction[] = [];
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length < 3) continue;
    
    const date = parseDate(String(row[dateIdx] || ''));
    const description = String(row[descIdx] || '').trim();
    
    let amount = 0;
    let type: "income" | "expense" = "expense";
    
    if (creditIdx !== -1 && debitIdx !== -1) {
      const credit = parseAmount(row[creditIdx] || '0');
      const debit = parseAmount(row[debitIdx] || '0');
      
      if (credit > 0) {
        amount = credit;
        type = "income";
      } else if (debit > 0) {
        amount = debit;
        type = "expense";
      }
    } else {
      amount = parseAmount(row[amountIdx] || '0');
      type = amount >= 0 ? "income" : "expense";
      amount = Math.abs(amount);
    }
    
    if (!date || !description || amount === 0) continue;
    
    transactions.push({ date, description, amount, type });
  }
  
  return transactions;
}

// Regex ile metin parse et (AI olmadan fallback)
function parseTextWithRegex(text: string): ParsedTransaction[] {
  const transactions: ParsedTransaction[] = [];
  const lines = text.split(/\n/);
  
  for (const line of lines) {
    // Türk banka ekstresi formatları için regex
    // Format: DD.MM.YYYY veya DD/MM/YYYY + ... + tutar (TL)
    const dateMatch = line.match(/(\d{2}[.\/-]\d{2}[.\/-]\d{2,4})/);
    const amountMatch = line.match(/([\-+]?\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2}))\s*(TL|TRY|₺)?/i);
    
    if (dateMatch && amountMatch) {
      const date = parseDate(dateMatch[1]);
      const amountStr = amountMatch[1];
      const amount = parseAmount(amountStr);
      
      // Açıklamayı çıkar - tarih ve tutar arasındaki metin
      let description = line
        .replace(dateMatch[0], '')
        .replace(amountMatch[0], '')
        .replace(/\s+/g, ' ')
        .trim();
      
      // Çok kısa veya çok uzun açıklamaları atla
      if (description.length < 3 || description.length > 150) continue;
      if (amount <= 0) continue;
      
      // Gelir/gider tespiti
      const isExpense = amountStr.includes('-') || 
        /ödeme|alışveriş|market|fatura|kira|çekim|harcama|borç/i.test(line);
      
      transactions.push({
        date,
        description: description.substring(0, 100),
        amount,
        type: isExpense ? 'expense' : 'income'
      });
    }
  }
  
  // Duplikasyonları kaldır
  return transactions.filter((t, i, arr) => 
    arr.findIndex(x => x.date === t.date && x.description === t.description && x.amount === t.amount) === i
  );
}

// PDF parse using pdfjs-dist
async function parsePDF(buffer: Buffer): Promise<ParsedTransaction[]> {
  try {
    // pdfjs-dist kullanarak PDF okuma
    const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.js');
    
    // Worker'ı devre dışı bırak (server-side için)
    pdfjsLib.GlobalWorkerOptions.workerSrc = '';
    
    const uint8Array = new Uint8Array(buffer);
    const loadingTask = pdfjsLib.getDocument({ 
      data: uint8Array, 
      useWorkerFetch: false, 
      isEvalSupported: false, 
      useSystemFonts: true 
    });
    const pdf = await loadingTask.promise;
    
    let fullText = '';
    
    // Her sayfadan metin çıkar
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item) => {
          if ('str' in item && typeof item.str === 'string') {
            return item.str;
          }
          return '';
        })
        .join(' ');
      fullText += pageText + '\n';
    }
    
    // AI ile PDF içeriğini parse et
    return await parseWithAI(fullText, 'PDF');
  } catch (error) {
    console.error('PDF parse error:', error);
    return [];
  }
}

// Görüntü parse (OCR + AI)
async function parseImage(buffer: Buffer): Promise<ParsedTransaction[]> {
  try {
    // Ollama'nın vision modeli ile OCR
    const base64Image = buffer.toString('base64');
    
    const response = await fetch(OLLAMA_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama3.2-vision',
        messages: [
          {
            role: 'user',
            content: `Bu banka ekstresi/dekont görüntüsündeki işlemleri çıkar. Her satır için:
Tarih|Açıklama|Tutar|Tür(gelir/gider)

SADECE bu formatta, her işlem yeni satırda. Başka açıklama YAZMA.
Örnek:
20.12.2025|Market Alışverişi|150.00|gider
19.12.2025|Maaş|15000.00|gelir`,
            images: [base64Image]
          }
        ],
        stream: false,
        options: {
          temperature: 0.1,
          num_predict: 2000
        }
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      const content = data.message?.content || '';
      return parseAIResponse(content);
    }
    
    // Vision modeli yoksa hata döndür
    throw new Error('Vision modeli kullanılamıyor');
  } catch (error) {
    console.error('Image parse error:', error);
    return [];
  }
}

// AI ile metin parse et
async function parseWithAI(text: string, source: string): Promise<ParsedTransaction[]> {
  console.log(`[${source}] Metin uzunluğu: ${text.length} karakter`);
  console.log(`[${source}] İlk 500 karakter:`, text.substring(0, 500));
  
  // Önce regex ile dene
  const regexTransactions = parseTextWithRegex(text);
  if (regexTransactions.length > 0) {
    console.log(`[${source}] Regex ile ${regexTransactions.length} işlem bulundu`);
    return regexTransactions;
  }
  
  // Regex bulamazsa AI dene
  try {
    const response = await fetch(OLLAMA_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama3.2',
        messages: [
          {
            role: 'system',
            content: `Sen bir banka ekstresi parse eden asistansın. Verilen ${source} içeriğindeki finansal işlemleri çıkar.

HER İŞLEM İÇİN BU FORMATI KULLAN:
Tarih|Açıklama|Tutar|Tür

KURALLAR:
1. Tarih: GG.AA.YYYY formatında
2. Açıklama: İşlem açıklaması
3. Tutar: Sadece sayı (nokta ile ondalık)
4. Tür: "gelir" veya "gider"
5. Her işlem yeni satırda
6. Başka HİÇBİR ŞEY yazma

ÖRNEK ÇIKTI:
20.12.2025|Market Alışverişi|150.00|gider
19.12.2025|Maaş Ödemesi|15000.00|gelir`
          },
          {
            role: 'user',
            content: text.substring(0, 8000) // İlk 8000 karakter
          }
        ],
        stream: false,
        options: {
          temperature: 0.1,
          num_predict: 3000
        }
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      const content = data.message?.content || '';
      console.log(`[${source}] AI yanıtı:`, content.substring(0, 500));
      return parseAIResponse(content);
    }
    
    console.log(`[${source}] AI yanıt vermedi, status:`, response.status);
    return [];
  } catch (error) {
    console.error('AI parse error:', error);
    return [];
  }
}

// AI yanıtını parse et
function parseAIResponse(content: string): ParsedTransaction[] {
  const transactions: ParsedTransaction[] = [];
  const lines = content.split('\n').filter(l => l.trim() && l.includes('|'));
  
  for (const line of lines) {
    const parts = line.split('|').map(p => p.trim());
    if (parts.length >= 4) {
      const date = parseDate(parts[0]);
      const description = parts[1];
      const amount = parseAmount(parts[2]);
      const type = parts[3].toLowerCase().includes('gelir') ? 'income' : 'expense';
      
      if (date && description && amount > 0) {
        transactions.push({ date, description, amount, type: type as "income" | "expense" });
      }
    }
  }
  
  return transactions;
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'Dosya bulunamadı' }, { status: 400 });
    }
    
    const fileName = file.name.toLowerCase();
    const buffer = Buffer.from(await file.arrayBuffer());
    
    let transactions: ParsedTransaction[] = [];
    
    // Dosya türüne göre parse et
    if (fileName.endsWith('.csv') || fileName.endsWith('.txt')) {
      const text = await file.text();
      transactions = parseCSV(text);
    } 
    else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
      transactions = parseExcel(buffer);
    }
    else if (fileName.endsWith('.pdf')) {
      transactions = await parsePDF(buffer);
    }
    else if (fileName.match(/\.(jpg|jpeg|png|webp|gif)$/)) {
      transactions = await parseImage(buffer);
    }
    else {
      return NextResponse.json({ 
        error: 'Desteklenmeyen dosya formatı. CSV, Excel, PDF veya görüntü dosyası yükleyin.' 
      }, { status: 400 });
    }
    
    if (transactions.length === 0) {
      return NextResponse.json({ 
        error: 'Geçerli işlem bulunamadı. Dosya formatını kontrol edin veya farklı bir dosya deneyin.' 
      }, { status: 400 });
    }
    
    return NextResponse.json({ 
      transactions,
      count: transactions.length 
    });
    
  } catch (error) {
    console.error('Parse error:', error);
    return NextResponse.json({ error: 'Dosya işlenirken hata oluştu' }, { status: 500 });
  }
}
