import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const user = await prisma.user.findFirst();
    if (!user) return NextResponse.json([], { status: 404 });

    // 1. Son 6 ayın verilerini çekelim (Performans için tarih filtresi eklenebilir ama şimdilik hepsi)
    const expenses = await prisma.expense.findMany({
      where: { userId: user.id },
      select: { amount: true, date: true }
    });

    const incomes = await prisma.income.findMany({
      where: { userId: user.id },
      select: { amount: true, date: true }
    });

    // 2. Verileri Ay-Yıl bazında grupla (Map kullanarak)
    const monthlyData = new Map();

    // Giderleri işle
    expenses.forEach((exp: { amount: number | bigint | string; date: Date }) => {
      const monthKey = new Date(exp.date).toLocaleString('tr-TR', { month: 'long', year: 'numeric' }); // Örn: "Aralık 2025"
      
      if (!monthlyData.has(monthKey)) {
        monthlyData.set(monthKey, { name: monthKey, income: 0, expense: 0 });
      }
      const current = monthlyData.get(monthKey);
      current.expense += Number(exp.amount);
    });

    // Gelirleri işle
    incomes.forEach((inc: { amount: number | bigint | string; date: Date }) => {
      const monthKey = new Date(inc.date).toLocaleString('tr-TR', { month: 'long', year: 'numeric' });
      
      if (!monthlyData.has(monthKey)) {
        monthlyData.set(monthKey, { name: monthKey, income: 0, expense: 0 });
      }
      const current = monthlyData.get(monthKey);
      current.income += Number(inc.amount);
    });

    // 3. Map'i Array'e çevir ve sırala (Recharts formatı)
    const result = Array.from(monthlyData.values()); // Tarih sıralaması gerekebilir ama MVP için yeterli

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: 'Analiz hatası' }, { status: 500 });
  }
}