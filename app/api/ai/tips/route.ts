import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const OLLAMA_URL = 'http://localhost:11434/api/chat';

interface Income {
  amount: number | string;
}

interface Expense {
  amount: number | string;
  date: Date | string;
  category?: { name: string } | null;
}

interface Budget {
  limit: number | string;
  category?: { name: string } | null;
}

interface Target {
  title: string;
  targetAmount: number | string;
  currentAmount: number | string;
}

// İngilizce kelimeleri Türkçe'ye çevir
function cleanTurkishText(text: string): string {
  const replacements: Record<string, string> = {
    'positive': 'olumlu',
    'negative': 'olumsuz',
    'unnecessary': 'gereksiz',
    'management': 'yönetimi',
    'optimize': 'optimize et',
    'minimize': 'azalt',
    'categories': 'kategoriler',
    'category': 'kategori',
    'budget': 'bütçe',
    'income': 'gelir',
    'expense': 'gider',
    'savings': 'tasarruf',
    'spending': 'harcama',
    'monthly': 'aylık',
    'daily': 'günlük',
    'total': 'toplam',
    'average': 'ortalama',
    'recommend': 'tavsiye ediyorum',
    'important': 'önemli',
    'especially': 'özellikle',
    'however': 'ancak',
    'also': 'ayrıca',
    'more': 'daha fazla',
    'less': 'daha az',
    'control': 'kontrol',
    'emergency fund': 'acil durum fonu',
    'fund': 'fon',
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
    if (!user) {
      return NextResponse.json({
        insights: ["Verilerinizi analiz etmek için giriş yapın"],
        savingsTip: "Aylık gelirinizin en az %20'sini biriktirin",
        goalSuggestion: "Acil durum fonu oluşturun"
      });
    }

    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    // Finansal verileri topla
    const [incomes, expenses, budgets, targets] = await Promise.all([
      prisma.income.findMany({ where: { userId: user.id, date: { gte: threeMonthsAgo } } }),
      prisma.expense.findMany({ where: { userId: user.id, date: { gte: threeMonthsAgo } }, include: { category: true } }),
      prisma.budget.findMany({ where: { userId: user.id }, include: { category: true } }),
      prisma.target.findMany({ where: { userId: user.id } })
    ]);

    const totalIncome = incomes.reduce((sum: number, i: Income) => sum + Number(i.amount), 0);
    const totalExpense = expenses.reduce((sum: number, e: Expense) => sum + Number(e.amount), 0);
    const savings = totalIncome - totalExpense;
    const savingsRate = totalIncome > 0 ? ((savings / totalIncome) * 100).toFixed(1) : '0';

    // Kategori bazlı harcamalar
    const categoryExpenses: Record<string, number> = {};
    expenses.forEach((e: Expense) => {
      const catName = e.category?.name || 'Diğer';
      categoryExpenses[catName] = (categoryExpenses[catName] || 0) + Number(e.amount);
    });

    const topCategories = Object.entries(categoryExpenses)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, amount]) => `${name}: ${amount.toFixed(0)} TL`);

    // Bu ayki harcamaları hesapla (bütçe karşılaştırması için)
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisMonthExpenses: Record<string, number> = {};
    expenses.forEach((e: Expense) => {
      const expenseDate = new Date(e.date as unknown as string);
      if (expenseDate >= thisMonthStart) {
        const catName = e.category?.name || 'Diğer';
        thisMonthExpenses[catName] = (thisMonthExpenses[catName] || 0) + Number(e.amount);
      }
    });

    // Bütçe aşım kontrolü (AYLIK bütçe vs AYLIK harcama)
    const budgetWarnings = budgets.map((b: Budget) => {
      const monthlySpent = thisMonthExpenses[b.category?.name || ''] || 0;
      const limit = Number(b.limit);
      const percentage = (monthlySpent / limit) * 100;
      if (monthlySpent > limit) {
        return `${b.category?.name} bütçesi aşıldı (%${percentage.toFixed(0)})`;
      }
      return null;
    }).filter(Boolean);

    // Hedef durumları
    const targetProgress = targets.map((t: Target) => {
      const progress = (Number(t.currentAmount) / Number(t.targetAmount)) * 100;
      return `${t.title}: %${progress.toFixed(0)}`;
    });

    const systemPrompt = `Sen Türk finans danışmanısın. SADECE TÜRKÇE YAZ.

VERİLER:
- Gelir: ${totalIncome.toFixed(0)} TL
- Gider: ${totalExpense.toFixed(0)} TL
- Bakiye: ${savings.toFixed(0)} TL
- Tasarruf Oranı: %${savingsRate}
- En çok harcama: ${topCategories.join(', ')}
${budgetWarnings.length > 0 ? `- Bütçe uyarıları: ${budgetWarnings.join(', ')}` : ''}
${targetProgress.length > 0 ? `- Hedefler: ${targetProgress.join(', ')}` : ''}

GÖREV: Aşağıdaki JSON formatında cevap ver. Başka hiçbir şey yazma:
{
  "insights": ["öngörü1", "öngörü2", "öngörü3"],
  "savingsTip": "kısa tasarruf ipucu",
  "goalSuggestion": "kısa hedef önerisi"
}

KURALLAR:
- insights: 3 kısa madde, her biri 15 kelimeden az
- savingsTip: 1 cümle, maksimum 15 kelime
- goalSuggestion: 1 cümle, maksimum 15 kelime
- SADECE JSON formatı, başka açıklama yok
- SADECE TÜRKÇE`;

    const response = await fetch(OLLAMA_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama3.2',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: 'Finansal analiz yap ve JSON formatında cevap ver.' }
        ],
        stream: false,
        options: {
          temperature: 0.2,
          num_predict: 300
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Ollama API hatası: ${response.status}`);
    }

    const data = await response.json();
    const rawContent = data.message?.content || '';
    
    // JSON parse etmeye çalış
    try {
      // JSON bloğunu bul
      const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return NextResponse.json({
          insights: (parsed.insights || []).map((i: string) => cleanTurkishText(i)),
          savingsTip: cleanTurkishText(parsed.savingsTip || "Aylık gelirinizin %20'sini biriktirin"),
          goalSuggestion: cleanTurkishText(parsed.goalSuggestion || "6 aylık acil durum fonu oluşturun")
        });
      }
    } catch {
      console.error('JSON parse hatası:', rawContent);
    }

    // Fallback - verilere göre basit öneriler
    const fallbackInsights = [];
    
    // Gelir/Gider durumu (son 3 ay)
    if (savings > 0) {
      if (Number(savingsRate) > 30) {
        fallbackInsights.push("✅ Tasarruf oranınız çok iyi, böyle devam edin!");
      } else if (Number(savingsRate) > 10) {
        fallbackInsights.push(`💰 Son 3 ayda ${savings.toFixed(0)} TL tasarruf ettiniz`);
      } else {
        fallbackInsights.push("💡 Tasarruf oranınızı artırmaya çalışın");
      }
    } else {
      fallbackInsights.push("⚠️ Son 3 ayda giderleriniz gelirinizi aştı");
    }
    
    // Bütçe durumu (bu ay)
    if (budgetWarnings.length > 0) {
      fallbackInsights.push(`🚨 Bu ay: ${budgetWarnings[0]}`);
    } else {
      fallbackInsights.push("📊 Bu ay bütçeleriniz kontrol altında");
    }
    
    // En yüksek harcama kategorisi (son 3 ay)
    if (topCategories.length > 0) {
      const topCat = Object.entries(categoryExpenses).sort((a, b) => b[1] - a[1])[0];
      fallbackInsights.push(`📈 Son 3 ayda en çok: ${topCat[0]} (${topCat[1].toFixed(0)} TL)`);
    }

    // Aylık ortalama gider
    const monthlyAvgExpense = totalExpense / 3;

    return NextResponse.json({
      insights: fallbackInsights,
      savingsTip: Number(savingsRate) > 20 
        ? "Tasarruflarınızı yatırıma yönlendirmeyi düşünün" 
        : "Her ay gelirinizin %20'sini biriktirmeyi hedefleyin",
      goalSuggestion: savings > 0 
        ? `${(monthlyAvgExpense * 6).toFixed(0)} TL acil durum fonu hedefleyin`
        : "Önce aylık bütçenizi dengeye getirin"
    });

  } catch (error) {
    console.error('AI Tips hatası:', error);
    return NextResponse.json({
      insights: [
        "💡 Harcamalarınızı kategorilere ayırın",
        "📊 Aylık bütçe planı oluşturun",
        "🎯 Tasarruf hedefleri belirleyin"
      ],
      savingsTip: "Aylık gelirinizin en az %20'sini biriktirin",
      goalSuggestion: "3-6 aylık gider tutarında acil durum fonu oluşturun"
    });
  }
}
