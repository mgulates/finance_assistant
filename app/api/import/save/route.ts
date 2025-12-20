import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface Transaction {
  date: string;
  description: string;
  amount: number;
  type: "income" | "expense";
  category?: string;
}

interface Category {
  id: string;
  name: string;
  type: string;
  color: string;
  icon: string;
  userId: string;
}

// Tarih string'ini Date objesine çevir
function parseDate(dateStr: string): Date {
  // Format: DD.MM.YYYY
  const parts = dateStr.split('.');
  if (parts.length === 3) {
    const day = parseInt(parts[0]);
    const month = parseInt(parts[1]) - 1;
    const year = parseInt(parts[2]);
    return new Date(year, month, day);
  }
  return new Date();
}

export async function POST(req: Request) {
  try {
    const { transactions } = await req.json();
    
    if (!transactions || transactions.length === 0) {
      return NextResponse.json({ error: 'İşlem bulunamadı' }, { status: 400 });
    }

    // Kullanıcıyı bul veya oluştur
    let user = await prisma.user.findFirst();
    if (!user) {
      user = await prisma.user.create({
        data: { name: 'Kullanıcı', email: 'user@example.com' }
      });
    }

    // Mevcut kategorileri al
    const existingCategories = await prisma.category.findMany({
      where: { userId: user.id }
    });
    const categoryMap = new Map<string, Category>();
    existingCategories.forEach((c: Category) => {
      categoryMap.set(c.name.toLowerCase(), c);
    });

    // Varsayılan renkler
    const defaultColors: Record<string, string> = {
      'market': '#3b82f6',
      'kira': '#a855f7',
      'faturalar': '#f97316',
      'eğlence': '#8b5cf6',
      'yemek': '#eab308',
      'ulaşım': '#0ea5e9',
      'sağlık': '#ef4444',
      'giyim': '#ec4899',
      'maaş': '#22c55e',
      'freelance': '#14b8a6',
      'yatırım': '#6366f1',
      'kira geliri': '#84cc16',
      'diğer': '#64748b',
      'diğer gelir': '#22c55e',
    };

    let savedCount = 0;
    const errors: string[] = [];

    for (const t of transactions as Transaction[]) {
      try {
        const date = parseDate(t.date);
        const categoryName = t.category || 'Diğer';
        const categoryType = t.type === 'income' ? 'INCOME' : 'EXPENSE';
        
        // Kategori bul veya oluştur
        let category: Category | undefined = categoryMap.get(categoryName.toLowerCase());
        
        if (!category) {
          // Yeni kategori oluştur
          const newCategory = await prisma.category.create({
            data: {
              name: categoryName,
              type: categoryType,
              color: defaultColors[categoryName.toLowerCase()] || '#64748b',
              icon: 'tag',
              userId: user.id
            }
          });
          category = newCategory as Category;
          categoryMap.set(categoryName.toLowerCase(), category);
        }

        if (t.type === 'income') {
          // Gelir kaydet
          await prisma.income.create({
            data: {
              title: t.description,
              amount: t.amount,
              date: date,
              note: 'Banka ekstresinden içe aktarıldı',
              userId: user.id,
              categoryId: category.id
            }
          });
        } else {
          // Gider kaydet
          await prisma.expense.create({
            data: {
              title: t.description,
              amount: t.amount,
              date: date,
              note: 'Banka ekstresinden içe aktarıldı',
              paymentType: 'CARD',
              isRecurring: false,
              userId: user.id,
              categoryId: category.id
            }
          });
        }

        savedCount++;
      } catch (err) {
        console.error('İşlem kaydetme hatası:', err);
        errors.push(`${t.description}: Kaydedilemedi`);
      }
    }

    return NextResponse.json({ 
      saved: savedCount,
      total: transactions.length,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error) {
    console.error('Save error:', error);
    return NextResponse.json({ error: 'Kaydetme hatası' }, { status: 500 });
  }
}
