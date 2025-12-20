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
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit');

    const user = await prisma.user.findFirst();
    if (!user) return NextResponse.json([], { status: 404 });

    const incomes = await prisma.income.findMany({
      where: { userId: user.id },
      include: { category: true },
      orderBy: { date: 'desc' },
      ...(limit && { take: parseInt(limit) })
    });

    // Decimal'ları serialize et
    const serialized = incomes.map(serializeIncome);
    return NextResponse.json({ incomes: serialized });
  } catch (error) {
    return NextResponse.json({ error: 'Gelirler çekilemedi' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { amount, title, date, categoryId, userId, paymentType, note } = body;

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
        title: title || null,
        date: new Date(date),
        note: note || null,
        paymentType: (paymentType as PaymentType) || 'CASH',
        category: categoryId ? { connect: { id: categoryId } } : undefined,
        user: { connect: { id: targetUserId } }
      }
    });

    return NextResponse.json(serializeIncome(newIncome), { status: 201 });
  } catch (error) {
    console.error('Income POST error:', error);
    return NextResponse.json({ error: 'Gelir eklenemedi' }, { status: 500 });
  }
}

// DELETE: Gelir sil
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID gerekli' }, { status: 400 });
    }

    await prisma.income.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Gelir silinemedi' }, { status: 500 });
  }
}

// PUT: Gelir güncelle
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, amount, title, date, categoryId, paymentType, isRecurring, note } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID gerekli' }, { status: 400 });
    }

    const updatedIncome = await prisma.income.update({
      where: { id },
      data: {
        ...(amount !== undefined && { amount }),
        ...(title && { title }),
        ...(date && { date: new Date(date) }),
        ...(categoryId && { categoryId }),
        ...(paymentType && { paymentType: paymentType as PaymentType }),
        ...(isRecurring !== undefined && { isRecurring }),
        ...(note !== undefined && { note }),
      }
    });

    return NextResponse.json(serializeIncome(updatedIncome));
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Gelir güncellenemedi' }, { status: 500 });
  }
}