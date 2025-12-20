import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Haberleri veritabanından çek
export async function GET() {
  try {
    const user = await prisma.user.findFirst();
    if (!user) return NextResponse.json([], { status: 404 });

    const news = await prisma.news.findMany({
      where: { userId: user.id },
      orderBy: { publishedAt: 'desc' },
      take: 20
    });

    // Frontend formatına dönüştür
    const formattedNews = news.map(n => ({
      id: n.id,
      title: n.title,
      description: n.summary || '',
      source: n.source || 'Finans Gündem',
      url: n.url || '#',
      publishedAt: n.publishedAt?.toISOString() || new Date().toISOString(),
      category: n.tags?.[0] || 'economy'
    }));

    return NextResponse.json(formattedNews);
  } catch (error) {
    console.error('News Error:', error);
    return NextResponse.json([], { status: 500 });
  }
}

// Yeni haber ekle
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, source, url, summary, tags, sentiment, userId } = body;

    let targetUserId = userId;
    if (!targetUserId) {
      const firstUser = await prisma.user.findFirst();
      if (!firstUser) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      targetUserId = firstUser.id;
    }

    const news = await prisma.news.create({
      data: {
        title,
        source,
        url,
        summary,
        tags: tags || [],
        sentiment: sentiment || 'NEUTRAL',
        publishedAt: new Date(),
        userId: targetUserId
      }
    });

    return NextResponse.json(news, { status: 201 });
  } catch (error) {
    console.error('News creation error:', error);
    return NextResponse.json({ error: 'Haber eklenemedi' }, { status: 500 });
  }
}