import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const user = await prisma.user.findFirst();
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    // Son 6 ayın tarih aralığını hesapla
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    // Gelir ve giderleri çek
    const [expenses, incomes] = await Promise.all([
      prisma.expense.findMany({
        where: { 
          userId: user.id,
          date: { gte: sixMonthsAgo }
        },
        include: { category: true },
        orderBy: { date: 'asc' }
      }),
      prisma.income.findMany({
        where: { 
          userId: user.id,
          date: { gte: sixMonthsAgo }
        },
        orderBy: { date: 'asc' }
      })
    ]);

    // Aylık trend verisi oluştur
    const monthlyData = new Map<string, { month: string; income: number; expense: number }>();
    const months = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];

    // Son 6 ayı başlat (veri olmasa bile göster)
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      monthlyData.set(key, {
        month: months[date.getMonth()],
        income: 0,
        expense: 0
      });
    }

    // Gelirleri işle
    incomes.forEach((inc) => {
      const date = new Date(inc.date);
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      if (monthlyData.has(key)) {
        const current = monthlyData.get(key)!;
        current.income += Number(inc.amount);
      }
    });

    // Giderleri işle
    expenses.forEach((exp) => {
      const date = new Date(exp.date);
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      if (monthlyData.has(key)) {
        const current = monthlyData.get(key)!;
        current.expense += Number(exp.amount);
      }
    });

    const monthlyTrend = Array.from(monthlyData.values());

    // Kategori dağılımı (sadece bu ay)
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const categoryExpenses = await prisma.expense.groupBy({
      by: ['categoryId'],
      where: {
        userId: user.id,
        date: { gte: thisMonthStart, lt: thisMonthEnd }
      },
      _sum: { amount: true }
    });

    // Kategori detaylarını al
    const categoryIds = categoryExpenses.map(c => c.categoryId).filter(Boolean) as string[];
    const categories = await prisma.category.findMany({
      where: { id: { in: categoryIds } }
    });

    const categoryMap = new Map(categories.map(c => [c.id, c]));
    const totalExpense = categoryExpenses.reduce((sum, c) => sum + Number(c._sum.amount || 0), 0);

    const defaultColors = ['#3b82f6', '#f97316', '#22c55e', '#8b5cf6', '#eab308', '#ef4444'];
    
    const categoryBreakdown = categoryExpenses
      .filter(c => c.categoryId && c._sum.amount)
      .map((c, i) => {
        const category = categoryMap.get(c.categoryId!);
        const amount = Number(c._sum.amount);
        return {
          category: category?.name || 'Diğer',
          amount,
          percentage: totalExpense > 0 ? Math.round((amount / totalExpense) * 100) : 0,
          color: category?.color || defaultColors[i % defaultColors.length]
        };
      })
      .sort((a, b) => b.amount - a.amount);

    // Tasarruf oranı hesapla
    const totalIncome = monthlyTrend.reduce((sum, m) => sum + m.income, 0);
    const totalExp = monthlyTrend.reduce((sum, m) => sum + m.expense, 0);
    const savingsRate = totalIncome > 0 ? Math.round(((totalIncome - totalExp) / totalIncome) * 100) : 0;

    // Finansal sağlık skoru (basit hesaplama)
    let healthScore = 50;
    if (savingsRate > 20) healthScore += 25;
    else if (savingsRate > 10) healthScore += 15;
    else if (savingsRate > 0) healthScore += 5;
    
    if (totalExp < totalIncome * 0.7) healthScore += 15;
    if (categoryBreakdown.length > 0 && categoryBreakdown[0].percentage < 40) healthScore += 10;

    healthScore = Math.min(100, Math.max(0, healthScore));

    // Dinamik öngörüler oluştur
    const insights: string[] = [];
    
    if (monthlyTrend.length >= 2) {
      const lastMonth = monthlyTrend[monthlyTrend.length - 1];
      const prevMonth = monthlyTrend[monthlyTrend.length - 2];
      
      if (lastMonth.expense < prevMonth.expense) {
        const decrease = Math.round(((prevMonth.expense - lastMonth.expense) / prevMonth.expense) * 100);
        insights.push(`Bu ay harcamalarınız geçen aya göre %${decrease} azaldı`);
      } else if (lastMonth.expense > prevMonth.expense) {
        const increase = Math.round(((lastMonth.expense - prevMonth.expense) / prevMonth.expense) * 100);
        insights.push(`Bu ay harcamalarınız geçen aya göre %${increase} arttı`);
      }
    }

    if (categoryBreakdown.length > 0) {
      insights.push(`${categoryBreakdown[0].category} harcamalarınız toplam giderin %${categoryBreakdown[0].percentage}'ini oluşturuyor`);
    }

    if (savingsRate > 15) {
      insights.push(`Tasarruf oranınız %${savingsRate} ile hedefin üzerinde`);
    } else if (savingsRate > 0) {
      insights.push(`Tasarruf oranınız %${savingsRate} - bunu artırmaya çalışın`);
    } else {
      insights.push('Harcamalarınız gelirinizden fazla, bütçenizi gözden geçirin');
    }

    return NextResponse.json({
      monthlyTrend,
      categoryBreakdown,
      insights,
      savingsRate: Math.max(0, savingsRate),
      healthScore
    });
  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json({ error: 'Analiz verisi alınamadı' }, { status: 500 });
  }
}