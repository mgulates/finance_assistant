import { NextResponse } from 'next/server';
import Parser from 'rss-parser';

export async function GET() {
  try {
    const parser = new Parser();
    // Bloomberg HT Finans RSS veya benzeri bir kaynak
    const feed = await parser.parseURL('https://www.bloomberght.com/rss');

    // İlk 5 haberi alıp temizleyelim
    const news = feed.items.slice(0, 5).map((item, index) => ({
      id: index.toString(),
      title: item.title,
      link: item.link,
      pubDate: item.pubDate,
      source: 'Bloomberg HT',
      summary: item.contentSnippet?.slice(0, 100) + '...'
    }));

    return NextResponse.json(news);
  } catch (error) {
    console.error('RSS Error:', error);
    // RSS patlarsa boş liste değil, dummy veri dönelim ki UI bozulmasın
    return NextResponse.json([
      { id: '1', title: 'Borsa günü yükselişle kapattı', source: 'Sistem', pubDate: new Date() },
      { id: '2', title: 'Altın fiyatlarında son durum', source: 'Sistem', pubDate: new Date() }
    ]);
  }
}