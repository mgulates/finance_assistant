import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { PaymentType } from '@prisma/client';

export async function GET(request: Request) {
  try {
    const user = await prisma.user.findFirst();
    if (!user) return NextResponse.json([], { status: 404 });

    const incomes = await prisma.income.findMany({
      where: { userId: user.id },
      include: { category: true },
      orderBy: { date: 'desc' }
    });
    
    return NextResponse.json(incomes);
  } catch (error) {
    return NextResponse.json({ error: 'Gelirler çekilemedi' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { amount, title, date, categoryId, userId, paymentType } = body;

    const newIncome = await prisma.income.create({
      data: {
        amount: amount,
        title,
        date: new Date(date),
        paymentType: paymentType || PaymentType.CASH,
        category: categoryId ? { connect: { id: categoryId } } : undefined,
        user: { connect: { id: userId } }
      }
    });

    return NextResponse.json(newIncome, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Gelir eklenemedi' }, { status: 500 });
  }
}