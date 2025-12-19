import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Serialize helper
function serializeTarget(target: any) {
  return {
    ...target,
    targetAmount: target.targetAmount?.toString() || '0',
    currentAmount: target.currentAmount?.toString() || '0',
  };
}

export async function GET() {
  try {
    const user = await prisma.user.findFirst();
    if (!user) return NextResponse.json([], { status: 404 });

    const targets = await prisma.target.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' }
    });

    const serialized = targets.map(serializeTarget);
    return NextResponse.json(serialized);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Hedefler alınamadı' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, description, targetType, targetAmount, dueDate, userId } = body;

    // userId yoksa ilk user'ı al (MVP hilesi)
    let targetUserId = userId;
    if (!targetUserId) {
      const firstUser = await prisma.user.findFirst();
      if (!firstUser) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      targetUserId = firstUser.id;
    }

    const target = await prisma.target.create({
      data: {
        title,
        description,
        targetType: targetType || 'SAVING',
        targetAmount: targetAmount,
        currentAmount: 0,
        startDate: new Date(),
        dueDate: dueDate ? new Date(dueDate) : null,
        status: 'ACTIVE',
        userId: targetUserId,
      }
    });

    return NextResponse.json(serializeTarget(target), { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Hedef eklenemedi' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, currentAmount, status } = body;

    const target = await prisma.target.update({
      where: { id },
      data: {
        ...(currentAmount !== undefined && { currentAmount }),
        ...(status && { status }),
      }
    });

    return NextResponse.json(serializeTarget(target));
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Hedef güncellenemedi' }, { status: 500 });
  }
}
