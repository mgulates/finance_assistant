import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Serialize helper - frontend için uygun format
function serializeTarget(target: any) {
  return {
    id: target.id,
    title: target.title,
    description: target.description,
    targetType: target.targetType,
    targetAmount: Number(target.targetAmount) || 0,
    currentAmount: Number(target.currentAmount) || 0,
    deadline: target.dueDate?.toISOString() || null,
    startDate: target.startDate?.toISOString() || null,
    status: target.status,
    createdAt: target.createdAt?.toISOString(),
    updatedAt: target.updatedAt?.toISOString(),
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
    const { title, description, targetType, targetAmount, currentAmount, deadline, dueDate, userId } = body;

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
        currentAmount: currentAmount || 0,
        startDate: new Date(),
        dueDate: deadline ? new Date(deadline) : (dueDate ? new Date(dueDate) : null),
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

export async function PATCH(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'ID gerekli' }, { status: 400 });
    }

    const body = await request.json();
    const { currentAmount, status } = body;

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

// DELETE: Hedef sil
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID gerekli' }, { status: 400 });
    }

    await prisma.target.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Hedef silinemedi' }, { status: 500 });
  }
}
