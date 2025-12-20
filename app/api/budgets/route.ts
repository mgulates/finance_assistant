import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
// 1. Gerekli tipleri import ediyoruz
import { Budget, Category } from '@prisma/client';

export async function GET(request: Request) {
  try {
    const user = await prisma.user.findFirst();
    if (!user) return NextResponse.json([], { status: 404 });

    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    // Kullanıcının tanımladığı bütçeleri çek
    const budgets = await prisma.budget.findMany({
      where: { 
        userId: user.id,
        month: currentMonth,
        year: currentYear
      },
      include: { category: true }
    });

    // 2. Tip tanımlamasını burada yapıyoruz: (budget: Budget & { category: Category | null })
    const budgetStatus = await Promise.all(budgets.map(async (budget: Budget & { category: Category | null }) => {
      // Eğer kategori silinmişse veya yoksa bütçeyi olduğu gibi dön
      if (!budget.categoryId) return { ...budget, spent: 0, percentage: 0 };

      const expenseAgg = await prisma.expense.aggregate({
        where: {
          userId: user.id,
          categoryId: budget.categoryId,
          date: {
            gte: new Date(currentYear, currentMonth - 1, 1), // Ayın başı
            lt: new Date(currentYear, currentMonth, 1),      // Sonraki ayın başı
          }
        },
        _sum: { amount: true }
      });

      const realSpent = Number(expenseAgg._sum.amount) || 0;
      
      return {
        ...budget,
        limit: budget.limit?.toString() || '0',
        spent: realSpent, 
        percentage: Math.min(100, (realSpent / Number(budget.limit)) * 100)
      };
    }));

    return NextResponse.json(budgetStatus);
  } catch (error) {
    console.error(error); // Hatayı konsola basmak debug için iyidir
    return NextResponse.json({ error: 'Bütçeler alınamadı' }, { status: 500 });
  }
}

// Yeni Bütçe Ekleme
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { categoryId, limit, userId } = body;
    const month = new Date().getMonth() + 1;
    const year = new Date().getFullYear();

    // userId yoksa ilk user'ı al (MVP hilesi)
    let targetUserId = userId;
    if (!targetUserId) {
      const firstUser = await prisma.user.findFirst();
      if (!firstUser) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      targetUserId = firstUser.id;
    }

    const budget = await prisma.budget.upsert({
      where: {
        userId_month_year_categoryId: {
          userId: targetUserId,
          month,
          year,
          categoryId
        }
      },
      update: { limit: limit },
      create: {
        userId: targetUserId,
        categoryId,
        month,
        year,
        limit
      }
    });

    return NextResponse.json({
      ...budget,
      limit: budget.limit?.toString() || '0'
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Bütçe ayarlanamadı' }, { status: 500 });
  }
}

// DELETE: Bütçe sil
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID gerekli' }, { status: 400 });
    }

    await prisma.budget.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Bütçe silinemedi' }, { status: 500 });
  }
}