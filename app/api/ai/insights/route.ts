import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const OLLAMA_URL = 'http://localhost:11434/api/chat';

// İngilizce kelimeleri Türkçe'ye çevir
function cleanTurkishText(text: string): string {
  const replacements: Record<string, string> = {
    'positive-direction': 'olumlu yönde',
    'positive': 'olumlu',
    'negative': 'olumsuz',
    'unnecessary': 'gereksiz',
    'management': 'yönetimi',
    'optimize': 'optimize et',
    'optimalize': 'optimize et',
    'minimize': 'azalt',
    'minimuma': 'en aza',
    'categories': 'kategoriler',
    'direction': 'yön',
    'balance': 'denge',
    'budget': 'bütçe',
    'income': 'gelir',
    'expense': 'gider',
    'savings': 'tasarruf',
    'spending': 'harcama',
    'monthly': 'aylık',
    'daily': 'günlük',
    'weekly': 'haftalık',
    'total': 'toplam',
    'average': 'ortalama',
    'increase': 'artış',
    'decrease': 'azalış',
    'high': 'yüksek',
    'low': 'düşük',
    'good': 'iyi',
    'bad': 'kötü',
    'recommend': 'öner',
    'suggest': 'tavsiye et',
    'important': 'önemli',
    'necessary': 'gerekli',
    'required': 'gerekli',
    'especially': 'özellikle',
    'particularly': 'özellikle',
    'however': 'ancak',
    'therefore': 'bu nedenle',
    'because': 'çünkü',
    'also': 'ayrıca',
    'more': 'daha fazla',
    'less': 'daha az',
    'control': 'kontrol',
    'analysis': 'analiz',
    'result': 'sonuç',
    'and': 've',
    'or': 'veya',
    'the': '',
    'is': '',
    'are': '',
    'will': '',
    'can': '',
    'should': '',
    'would': '',
    'could': '',
  };

  let cleaned = text;
  for (const [eng, tr] of Object.entries(replacements)) {
    const regex = new RegExp(`\\b${eng}\\b`, 'gi');
    cleaned = cleaned.replace(regex, tr);
  }
  return cleaned;
}

export async function POST() {
  try {
    const user = await prisma.user.findFirst();
    if (!user) return NextResponse.json({ insights: 'Kullanıcı bulunamadı.' }, { status: 404 });

    // Tüm finansal verileri topla
    const [incomes, expenses, budgets, targets, categories] = await Promise.all([
      prisma.income.findMany({ where: { userId: user.id }, orderBy: { date: 'desc' }, take: 20 }),
      prisma.expense.findMany({ where: { userId: user.id }, orderBy: { date: 'desc' }, take: 30, include: { category: true } }),
      prisma.budget.findMany({ where: { userId: user.id }, include: { category: true } }),
      prisma.target.findMany({ where: { userId: user.id } }),
      prisma.category.findMany()
    ]);

    // Hesaplamalar
    const totalIncome = incomes.reduce((sum, i) => sum + Number(i.amount), 0);
    const totalExpense = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
    const savings = totalIncome - totalExpense;
    const savingsRate = totalIncome > 0 ? ((savings / totalIncome) * 100).toFixed(1) : '0';

    // Kategori bazlı harcamalar
    const categoryExpenses: Record<string, number> = {};
    expenses.forEach(e => {
      const catName = e.category?.name || 'Diğer';
      categoryExpenses[catName] = (categoryExpenses[catName] || 0) + Number(e.amount);
    });

    // En çok harcanan kategoriler
    const sortedCategories = Object.entries(categoryExpenses)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, amount]) => `${name}: ${amount.toFixed(0)}₺`);

    // Bütçe durumları
    const budgetStatus = budgets.map(b => {
      const spent = categoryExpenses[b.category?.name || ''] || 0;
      const percentage = ((spent / Number(b.amount)) * 100).toFixed(0);
      return `${b.category?.name}: ${spent.toFixed(0)}₺ / ${Number(b.amount).toFixed(0)}₺ (%${percentage})`;
    });

    // Hedefler
    const targetStatus = targets.map(t => {
      const percentage = ((Number(t.currentAmount) / Number(t.targetAmount)) * 100).toFixed(0);
      return `${t.name}: ${Number(t.currentAmount).toFixed(0)}₺ / ${Number(t.targetAmount).toFixed(0)}₺ (%${percentage})`;
    });

    // Son harcamalar
    const recentExpenses = expenses.slice(0, 10).map(e => 
      `${e.description}: ${Number(e.amount).toFixed(0)}₺ (${e.category?.name || 'Diğer'})`
    );

    // Sistem promptu
    const systemPrompt = `Sen Türk finans danışmanısın.

ÖNEMLİ: SADECE TÜRKÇE YAZ. İngilizce kelime KULLANMA.

VERİLER:
- Gelir: ${totalIncome.toFixed(0)} TL
- Gider: ${totalExpense.toFixed(0)} TL
- Bakiye: ${savings >= 0 ? '+' : ''}${savings.toFixed(0)} TL
- Tasarruf: %${savingsRate}

HARCAMALAR: ${sortedCategories.join(', ')}

GÖREV: 4 madde yaz. Her madde emoji ile başlasın. Kısa ve net ol. Maksimum 100 kelime. SADECE TÜRKÇE.`;

    // Ollama API çağrısı
    const response = await fetch(OLLAMA_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama3.2',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: 'Finansal durumumu analiz et ve bana öneriler sun.' }
        ],
        stream: false,
        options: {
          temperature: 0.3,
          num_predict: 300
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Ollama API hatası: ${response.status}`);
    }

    const data = await response.json();
    const rawInsights = data.message?.content || 'Analiz yapılamadı.';
    const insights = cleanTurkishText(rawInsights);

    return NextResponse.json({ insights });
  } catch (error) {
    console.error('AI Insights hatası:', error);
    return NextResponse.json({ 
      insights: '⚠️ AI servisi şu anda kullanılamıyor. Lütfen Ollama\'nın çalıştığından emin olun.' 
    }, { status: 500 });
  }
}