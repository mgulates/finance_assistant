import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// PaymentType değerleri
type PaymentType = 'CASH' | 'CARD' | 'TRANSFER' | 'OTHER';

// Decimal'ı string'e çeviren helper
function serializeExpense(expense: any) {
  return {
    ...expense,
    amount: expense.amount?.toString() || '0'
  };
}

// GET: Tüm giderleri getir
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    let userId = searchParams.get('userId');
    const limit = searchParams.get('limit');

    // MVP hilesi: Eğer userId yoksa veritabanındaki ilk user'ı alalım
    if (!userId) {
      const firstUser = await prisma.user.findFirst();
      if (!firstUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });
      userId = firstUser.id;
    }

    const expenses = await prisma.expense.findMany({
      where: { userId },
      include: { category: true },
      orderBy: { date: 'desc' },
      ...(limit && { take: parseInt(limit) })
    });

    // Decimal'ları serialize et
    const serialized = expenses.map(serializeExpense);
    return NextResponse.json({ expenses: serialized });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Veri çekilemedi' }, { status: 500 });
  }
}

// POST: Gider ekle
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { amount, title, date, categoryId, userId, paymentType, isRecurring, note } = body;

    // userId yoksa ilk user'ı al (MVP hilesi)
    let targetUserId = userId;
    if (!targetUserId) {
      const firstUser = await prisma.user.findFirst();
      if (!firstUser) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      targetUserId = firstUser.id;
    }

    const newExpense = await prisma.expense.create({
      data: {
        amount: amount,
        title,
        date: new Date(date),
        note: note || null,
        paymentType: (paymentType as PaymentType) || 'CARD',
        isRecurring: isRecurring || false,
        category: categoryId ? { connect: { id: categoryId } } : undefined,
        user: { connect: { id: targetUserId } }
      }
    });

    return NextResponse.json(serializeExpense(newExpense), { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Kayıt başarısız' }, { status: 500 });
  }
}

// DELETE: Gider sil
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID gerekli' }, { status: 400 });
    }

    await prisma.expense.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Gider silinemedi' }, { status: 500 });
  }
}

// PUT: Gider güncelle
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, amount, title, date, categoryId, paymentType, isRecurring, note } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID gerekli' }, { status: 400 });
    }

    const updatedExpense = await prisma.expense.update({
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

    return NextResponse.json(serializeExpense(updatedExpense));
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Gider güncellenemedi' }, { status: 500 });
  }
}