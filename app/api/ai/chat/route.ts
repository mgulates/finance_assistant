import { prisma } from '@/lib/prisma';

export const maxDuration = 120;

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
    'category': 'kategori',
    'direction': 'yön',
    'balance': 'bakiye',
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
    'recommend': 'tavsiye ediyorum',
    'recommends': 'tavsiye eder',
    'recommended': 'tavsiye edilir',
    'suggest': 'öner',
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
    'indicates': 'gösterir',
    'showed': 'gösterdi',
    'shows': 'gösterir',
  };

  let cleaned = text;
  for (const [eng, tr] of Object.entries(replacements)) {
    const regex = new RegExp(`\\b${eng}\\b`, 'gi');
    cleaned = cleaned.replace(regex, tr);
  }
  return cleaned;
}

interface RecentExpense {
  title: string;
  amount: number;
  category: string | undefined;
  date: string;
}

interface BudgetInfo {
  category: string | undefined;
  limit: number;
  month: number;
  year: number;
}

interface TargetInfo {
  title: string;
  targetAmount: number;
  currentAmount: number;
  progress: string;
}

interface FinancialContext {
  userName: string;
  totalIncome: number;
  totalExpense: number;
  balance: number;
  savingsRate: string | number;
  categoryExpenses: Record<string, number>;
  recentExpenses: RecentExpense[];
  budgets: BudgetInfo[];
  targets: TargetInfo[];
}

interface OllamaMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

async function getFinancialContext(): Promise<FinancialContext | null> {
  try {
    const user = await prisma.user.findFirst();
    if (!user) return null;

    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const [incomes, expenses, budgets, targets] = await Promise.all([
      prisma.income.findMany({
        where: { userId: user.id, date: { gte: threeMonthsAgo } },
        include: { category: true },
        orderBy: { date: 'desc' },
        take: 20
      }),
      prisma.expense.findMany({
        where: { userId: user.id, date: { gte: threeMonthsAgo } },
        include: { category: true },
        orderBy: { date: 'desc' },
        take: 30
      }),
      prisma.budget.findMany({
        where: { userId: user.id },
        include: { category: true }
      }),
      prisma.target.findMany({
        where: { userId: user.id }
      })
    ]);

    const totalIncome = incomes.reduce((sum: number, i) => sum + Number(i.amount), 0);
    const totalExpense = expenses.reduce((sum: number, e) => sum + Number(e.amount), 0);

    const categoryExpenses: Record<string, number> = {};
    expenses.forEach(e => {
      const catName = e.category?.name || 'Diğer';
      categoryExpenses[catName] = (categoryExpenses[catName] || 0) + Number(e.amount);
    });

    return {
      userName: user.name || 'Kullanıcı',
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      savingsRate: totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome * 100).toFixed(1) : 0,
      categoryExpenses,
      recentExpenses: expenses.slice(0, 5).map(e => ({
        title: e.title,
        amount: Number(e.amount),
        category: e.category?.name,
        date: e.date.toLocaleDateString('tr-TR')
      })),
      budgets: budgets.map(b => ({
        category: b.category?.name,
        limit: Number(b.limit),
        month: b.month,
        year: b.year
      })),
      targets: targets.map(t => ({
        title: t.title,
        targetAmount: Number(t.targetAmount),
        currentAmount: Number(t.currentAmount),
        progress: ((Number(t.currentAmount) / Number(t.targetAmount)) * 100).toFixed(1)
      }))
    };
  } catch (error) {
    console.error('Financial context error:', error);
    return null;
  }
}

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    
    const context = await getFinancialContext();
    
    const systemPrompt = `Sen FinansAI, bir Türk finans asistanısın.

ÖNEMLİ: SADECE TÜRKÇE YAZ. İngilizce, İspanyolca veya başka dil KULLANMA.

${context ? `KULLANICI VERİLERİ:
- Gelir: ${context.totalIncome.toFixed(0)} TL
- Gider: ${context.totalExpense.toFixed(0)} TL  
- Bakiye: ${context.balance.toFixed(0)} TL
- Tasarruf: %${context.savingsRate}

KATEGORİLER:
${Object.entries(context.categoryExpenses).map(([cat, amount]) => `${cat}: ${(amount as number).toFixed(0)} TL`).join(', ')}

SON HARCAMALAR:
${context.recentExpenses.map((e: RecentExpense) => `${e.title}: ${e.amount.toFixed(0)} TL`).join(', ')}
` : ''}
KURALLAR:
1. SADECE TÜRKÇE yaz
2. Kısa ve net cevap ver (maksimum 150 kelime)
3. Samimi ol, "sen" de
4. Para birimi: TL
5. Emoji kullanabilirsin`;

    // Ollama API formatına çevir
    const ollamaMessages: OllamaMessage[] = [
      { role: 'system', content: systemPrompt },
      ...messages.map((m: { role: string; content: string }) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content
      }))
    ];

    // Direkt Ollama API'sine istek at
    const response = await fetch('http://localhost:11434/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama3.2',
        messages: ollamaMessages,
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
    const rawMessage = data.message?.content || 'Yanıt alınamadı';
    const assistantMessage = cleanTurkishText(rawMessage);

    return new Response(assistantMessage, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' }
    });
  } catch (error: unknown) {
    console.error('AI Chat error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata';
    return new Response(
      JSON.stringify({ error: `AI servisi hatası: ${errorMessage}` }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
