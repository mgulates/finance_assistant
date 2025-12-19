import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const user = await prisma.user.findFirst();
    if (!user) return NextResponse.json([], { status: 404 });

    // Verileri topla
    const totalIncomeAgg = await prisma.income.aggregate({ where: { userId: user.id }, _sum: { amount: true }});
    const totalExpenseAgg = await prisma.expense.aggregate({ where: { userId: user.id }, _sum: { amount: true }});
    
    // En çok harcama yapılan kategori
    const topCategory = await prisma.expense.groupBy({
      by: ['categoryId'],
      where: { userId: user.id },
      _sum: { amount: true },
      orderBy: { _sum: { amount: 'desc' } },
      take: 1
    });

    const income = Number(totalIncomeAgg._sum.amount) || 0;
    const expense = Number(totalExpenseAgg._sum.amount) || 0;
    const insights: string[] = [];

    // --- RULE-BASED AI LOGIC ---
    
    // Kural 1: Bütçe Açığı
    if (expense > income) {
      insights.push("🚨 Dikkat! Giderlerin gelirlerini aşıyor. Acil durum fonunu kullanman gerekebilir.");
    } else if (expense > income * 0.8) {
      insights.push("⚠️ Bütçe sınırındasın. Gelirinin %80'inden fazlasını harcadın.");
    } else {
      insights.push("✅ Harika gidiyorsun! Gelir-gider dengen çok sağlıklı.");
    }

    // Kural 2: Tasarruf Potansiyeli
    const savings = income - expense;
    if (savings > 0) {
      insights.push(`💡 Bu ay ${savings.toFixed(2)}₺ tasarruf ettin. Bunu 'Yatırım Hesabı'na aktarmayı düşündün mü?`);
    }

    // Kural 3: Kategori Uyarısı
    if (topCategory.length > 0 && topCategory[0].categoryId) {
        // Kategori ismini bulmak için ek sorgu gerekebilir ama şimdilik genel konuşalım
        insights.push(`📊 En çok harcamayı tek bir kategoride yapıyorsun. Bu kategorideki gereksiz harcamaları kısmayı dene.`);
    }

    // Kural 4: Öğrenci Tavsiyesi (Statik)
    insights.push("🎓 İpucu: Öğrenci kartınla müze ve ören yerlerine ücretsiz girebileceğini unutma!");

    return NextResponse.json({ insights });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'AI servisi yanıt vermiyor' }, { status: 500 });
  }
}