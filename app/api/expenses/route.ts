import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { CategoryType, PaymentType } from '@prisma/client';

// GET: Tüm giderleri getir
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId'); // Geçici olarak query'den alalım

    if (!userId) {
        // MVP hilesi: Eğer userId yoksa veritabanındaki ilk user'ı alalım
        const firstUser = await prisma.user.findFirst();
        if (!firstUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });
        
        const expenses = await prisma.expense.findMany({
            where: { userId: firstUser.id },
            include: { category: true },
            orderBy: { date: 'desc' }
        });
        return NextResponse.json(expenses);
    }

    const expenses = await prisma.expense.findMany({
      where: { userId },
      include: { category: true },
      orderBy: { date: 'desc' }
    });
    
    return NextResponse.json(expenses);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Veri çekilemedi' }, { status: 500 });
  }
}

// POST: Gider ekle
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { amount, title, date, categoryId, userId, paymentType } = body;

    const newExpense = await prisma.expense.create({
      data: {
        amount: amount, // Prisma Decimal'ı otomatik handle eder string/number gelirse
        title,
        date: new Date(date),
        paymentType: paymentType || PaymentType.CARD, // Default CARD
        category: categoryId ? { connect: { id: categoryId } } : undefined,
        user: { connect: { id: userId } }
      }
    });

    return NextResponse.json(newExpense, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Kayıt başarısız' }, { status: 500 });
  }
}