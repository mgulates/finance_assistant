import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { CategoryType } from '@prisma/client';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // "INCOME" veya "EXPENSE"
    
    // MVP Hilesi: User ID yoksa ilk user'ı al
    const user = await prisma.user.findFirst();
    if (!user) return NextResponse.json([], { status: 404 });

    const whereClause: any = { userId: user.id };
    if (type) {
      whereClause.type = type as CategoryType;
    }

    const categories = await prisma.category.findMany({
      where: whereClause,
      orderBy: { name: 'asc' }
    });

    return NextResponse.json(categories);
  } catch (error) {
    return NextResponse.json({ error: 'Kategoriler alınamadı' }, { status: 500 });
  }
}