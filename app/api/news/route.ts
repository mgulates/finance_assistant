import { NextResponse } from 'next/server';

// Dummy haberler - RSS parser yerine statik veri
const dummyNews = [
  {
    id: '1',
    title: 'Borsa İstanbul günü yükselişle kapattı',
    source: 'Bloomberg HT',
    pubDate: new Date().toISOString(),
    summary: 'BIST 100 endeksi günü %1.2 artışla 9.850 puandan kapattı...',
    link: 'https://www.bloomberght.com'
  },
  {
    id: '2',
    title: 'Merkez Bankası faiz kararını açıkladı',
    source: 'Ekonomi Servisi',
    pubDate: new Date().toISOString(),
    summary: 'TCMB, politika faizini sabit tutma kararı aldı...',
    link: 'https://www.tcmb.gov.tr'
  },
  {
    id: '3',
    title: 'Altın fiyatlarında son durum',
    source: 'Finans Gündem',
    pubDate: new Date().toISOString(),
    summary: 'Gram altın 2.950 TL seviyesinden işlem görüyor...',
    link: '#'
  },
  {
    id: '4',
    title: 'Dolar/TL paritesinde hareketlilik',
    source: 'Ekonomi',
    pubDate: new Date().toISOString(),
    summary: 'Dolar/TL kuru 35.20 seviyelerinde seyrediyor...',
    link: '#'
  },
  {
    id: '5',
    title: 'Öğrenciler için burs başvuruları başladı',
    source: 'Eğitim',
    pubDate: new Date().toISOString(),
    summary: '2025 yılı KYK burs başvuruları için son tarih yaklaşıyor...',
    link: '#'
  }
];

export async function GET() {
  try {
    // Gerçek RSS entegrasyonu için rss-parser paketi gerekir
    // Şimdilik dummy veri dönüyoruz
    return NextResponse.json(dummyNews);
  } catch (error) {
    console.error('News Error:', error);
    return NextResponse.json(dummyNews);
  }
}