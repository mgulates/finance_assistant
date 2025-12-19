import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// PaymentType değerleri
type PaymentType = 'CASH' | 'CARD' | 'TRANSFER' | 'OTHER';

// Decimal'ı string'e çeviren helper
function serializeIncome(income: any) {
  return {
    ...income,
    amount: income.amount?.toString() || '0'
  };
}

export async function GET(request: Request) {
  try {
    const user = await prisma.user.findFirst();
    if (!user) return NextResponse.json([], { status: 404 });

    const incomes = await prisma.income.findMany({
      where: { userId: user.id },
      include: { category: true },
      orderBy: { date: 'desc' }
    });

    // Decimal'ları serialize et
    const serialized = incomes.map(serializeIncome);
    return NextResponse.json(serialized);
  } catch (error) {
    return NextResponse.json({ error: 'Gelirler çekilemedi' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { amount, title, date, categoryId, userId, paymentType, note, isRecurring } = body;

    // userId yoksa ilk user'ı al (MVP hilesi)
    let targetUserId = userId;
    if (!targetUserId) {
      const firstUser = await prisma.user.findFirst();
      if (!firstUser) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      targetUserId = firstUser.id;
    }

    const newIncome = await prisma.income.create({
      data: {
        amount: amount,
        title,
        date: new Date(date),
        note: note || null,
        paymentType: (paymentType as PaymentType) || 'CASH',
        isRecurring: isRecurring || false,
        category: categoryId ? { connect: { id: categoryId } } : undefined,
        user: { connect: { id: targetUserId } }
      }
    });

    return NextResponse.json(serializeIncome(newIncome), { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Gelir eklenemedi' }, { status: 500 });
  }
}