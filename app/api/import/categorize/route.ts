import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const OLLAMA_URL = 'http://localhost:11434/api/chat';

interface Transaction {
  date: string;
  description: string;
  amount: number;
  type: "income" | "expense";
  category?: string;
  selected: boolean;
}

// Gelişmiş kural tabanlı kategorileme
function categorizeByRules(description: string, type: string): string {
  const desc = description.toLowerCase().replace(/[^a-zçğıöşü0-9\s]/gi, ' ');
  
  // === GELİR KATEGORİLERİ ===
  if (type === "income") {
    // Maaş
    if (desc.match(/maa[şs]|salary|ücret|wage|bordro|havale.*(şirket|firma)|gelen.*(maaş|ücret)/)) 
      return 'Maaş';
    
    // Freelance
    if (desc.match(/freelance|serbest|proje|danışman|consultant|upwork|fiverr/)) 
      return 'Freelance';
    
    // Kira Geliri
    if (desc.match(/kira.*(gelir|alacak)|gelen.*kira|kiracı/)) 
      return 'Kira Geliri';
    
    // Yatırım
    if (desc.match(/faiz|temettü|dividend|borsa|hisse|yatırım|getiri|kar payı/)) 
      return 'Yatırım';
    
    // EFT/Havale (genel)
    if (desc.match(/eft|havale|transfer|gelen/)) 
      return 'Diğer Gelir';
    
    return 'Diğer Gelir';
  }
  
  // === GİDER KATEGORİLERİ ===
  
  // Market / Grocery
  if (desc.match(/market|migros|bim|a101|şok|carrefour|macro|metro\s*market|file|hakmar|tarım\s*kredi|kooperatif|grocery|süpermarket/)) 
    return 'Market';
  
  // Kira
  if (desc.match(/kira|rent|ev\s*kirası|daire|konut|gayrimenkul/)) 
    return 'Kira';
  
  // Faturalar
  if (desc.match(/elektrik|doğalgaz|dogalgaz|su\s*(fatura|ödeme)|igdaş|iski|aydem|enerjisa|başkent.*gaz|fatura|internet|turkcell|vodafone|türk\s*telekom|superonline|ttnet|telefon|gsm|aidat|site\s*aidatı|apartman/)) 
    return 'Faturalar';
  
  // Yemek / Restoran
  if (desc.match(/restoran|restaurant|cafe|kahve|starbucks|yemek|food|burger|pizza|kebap|döner|mcdonalds|kfc|popeyes|dominos|getir\s*yemek|yemeksepeti|trendyol\s*yemek|migros\s*yemek|lokanta|fast\s*food|tavuk|lahmacun|pide|köfte/)) 
    return 'Yemek';
  
  // Ulaşım
  if (desc.match(/akbil|istanbul\s*kart|metro|metrobüs|otobüs|taksi|uber|bolt|bitaksi|benzin|akaryakıt|shell|bp|opet|petrol|otopark|parking|hgs|ogs|köprü|otoyol|araç|oto\s*yıkama|lastik|servis/)) 
    return 'Ulaşım';
  
  // Eğlence / Abonelik
  if (desc.match(/netflix|spotify|youtube|disney|amazon\s*prime|apple|hbo|exxen|blu\s*tv|sinema|cinema|konser|tiyatro|müze|bilet|playstation|xbox|steam|oyun|game|eğlence/)) 
    return 'Eğlence';
  
  // Sağlık
  if (desc.match(/eczane|pharmacy|hastane|hospital|doktor|klinik|sağlık|ilaç|medikal|laboratuvar|tahlil|muayene|diş|dental|optik|gözlük/)) 
    return 'Sağlık';
  
  // Giyim
  if (desc.match(/giyim|ayakkabı|kıyafet|h&m|zara|lcw|lc\s*waikiki|koton|mavi|defacto|boyner|vakko|ipekyol|network|mango|bershka|pull|bear|nike|adidas|puma|decathlon|spor\s*giyim/)) 
    return 'Giyim';
  
  // Eğitim
  if (desc.match(/okul|üniversite|kurs|eğitim|öğrenim|kitap|udemy|coursera|dershane|özel\s*ders|sınav/)) 
    return 'Eğitim';
  
  // Alışveriş / E-ticaret
  if (desc.match(/trendyol|hepsiburada|amazon|n11|gittigidiyor|çiçeksepeti|sahibinden|letgo|ikinci\s*el|online\s*alışveriş/)) 
    return 'Alışveriş';
  
  // Banka / Finans
  if (desc.match(/kredi|credit|faiz|komisyon|banka|bank|sigorta|insurance|vergi|tax/)) 
    return 'Finans';
  
  // ATM çekim
  if (desc.match(/atm|nakit|çekim|para\s*çek/)) 
    return 'Nakit Çekim';
  
  return 'Diğer';
}

export async function POST(req: Request) {
  try {
    const { transactions } = await req.json();
    
    if (!transactions || transactions.length === 0) {
      return NextResponse.json({ error: 'İşlem bulunamadı' }, { status: 400 });
    }

    // Mevcut kategorileri al
    const user = await prisma.user.findFirst();
    const categories = user ? await prisma.category.findMany({ where: { userId: user.id } }) : [];
    const categoryNames = categories.map((c: { name: string }) => c.name);

    // AI ile kategorileme dene
    try {
      const descriptions = transactions.map((t: Transaction) => 
        `${t.type === 'income' ? 'GELİR' : 'GİDER'}: ${t.description}`
      ).join('\n');

      const systemPrompt = `Sen bir banka işlemi kategorileme asistanısın. 

MEVCUT KATEGORİLER:
${categoryNames.length > 0 ? categoryNames.join(', ') : 'Market, Kira, Faturalar, Eğlence, Yemek, Ulaşım, Sağlık, Giyim, Maaş, Freelance, Diğer'}

GÖREV: Her işlem için en uygun kategoriyi belirle.

KURALLAR:
1. SADECE kategori isimlerini döndür
2. Her satır için bir kategori yaz
3. Sırayı koru
4. Türkçe kategori isimleri kullan
5. Başka açıklama YAZMA

ÖRNEK ÇIKTI:
Market
Faturalar
Yemek
Maaş`;

      const response = await fetch(OLLAMA_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama3.2',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: descriptions }
          ],
          stream: false,
          options: {
            temperature: 0.1,
            num_predict: transactions.length * 20
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        const aiCategories = (data.message?.content || '')
          .split('\n')
          .map((line: string) => line.trim())
          .filter((line: string) => line.length > 0 && line.length < 30); // Çok uzun satırları filtrele

        // Geçerli kategori listesi
        const validCategories = [
          'Market', 'Kira', 'Faturalar', 'Eğlence', 'Yemek', 'Ulaşım', 'Sağlık', 'Giyim', 
          'Eğitim', 'Alışveriş', 'Finans', 'Nakit Çekim', 'Maaş', 'Freelance', 'Kira Geliri', 
          'Yatırım', 'Diğer Gelir', 'Diğer', ...categoryNames
        ];

        // AI kategorilerini işlemlere ata - geçersizse kural tabanlıya düş
        const categorizedTransactions = transactions.map((t: Transaction, i: number) => {
          const aiCat = aiCategories[i];
          // AI kategorisi geçerli mi kontrol et
          const isValidCategory = aiCat && validCategories.some(vc => 
            vc.toLowerCase() === aiCat.toLowerCase() || 
            aiCat.toLowerCase().includes(vc.toLowerCase())
          );
          
          return {
            ...t,
            category: isValidCategory ? aiCat : categorizeByRules(t.description, t.type)
          };
        });

        return NextResponse.json({ transactions: categorizedTransactions });
      }
    } catch (aiError) {
      console.error('AI kategorileme hatası:', aiError);
    }

    // Fallback: Kural tabanlı kategorileme
    const categorizedTransactions = transactions.map((t: Transaction) => ({
      ...t,
      category: categorizeByRules(t.description, t.type)
    }));

    return NextResponse.json({ transactions: categorizedTransactions });

  } catch (error) {
    console.error('Categorize error:', error);
    return NextResponse.json({ error: 'Kategorileme hatası' }, { status: 500 });
  }
}
