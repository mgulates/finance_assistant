import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const user = await prisma.user.findFirst();
    if (!user) return NextResponse.json({ error: 'User yok' }, { status: 404 });

    // 1. Toplam Gelir
    const incomeAgg = await prisma.income.aggregate({
      where: { userId: user.id },
      _sum: { amount: true }
    });

    // 2. Toplam Gider
    const expenseAgg = await prisma.expense.aggregate({
      where: { userId: user.id },
      _sum: { amount: true }
    });

    // 3. Kategori Bazlı Harcama (Pasta Grafik için)
    const categoryStats = await prisma.expense.groupBy({
      by: ['categoryId'],
      where: { userId: user.id },
      _sum: { amount: true },
    });
    
    // Kategori detaylarını da çekmek lazım (Group By sadece ID verir)
    // Bu kısım MVP için biraz karmaşık olabilir, şimdilik sadece toplamları dönelim:
    
    const totalIncome = Number(incomeAgg._sum.amount) || 0;
    const totalExpense = Number(expenseAgg._sum.amount) || 0;
    const balance = totalIncome - totalExpense;

    // Basit bir Sağlık Skoru Mantığı (Salla gitsin şimdilik :D)
    let healthScore = 50;
    if (balance > 0) healthScore += 20;
    if (totalExpense < totalIncome * 0.5) healthScore += 20;

    return NextResponse.json({
      totalIncome,
      totalExpense,
      balance,
      healthScore: Math.min(100, healthScore),
      currency: '₺'
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Özet alınamadı' }, { status: 500 });
  }
}