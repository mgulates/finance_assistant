const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  // Önce mevcut verileri temizle (foreign key sırasına dikkat)
  await prisma.news.deleteMany();
  await prisma.analysis.deleteMany();
  await prisma.target.deleteMany();
  await prisma.budget.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.income.deleteMany();
  await prisma.category.deleteMany();
  
  // 1) USER
  const user = await prisma.user.upsert({
    where: { email: "demo@sau.dev" },
    update: { name: "Demo User" },
    create: { email: "demo@sau.dev", name: "Demo User" },
  });

  // 2) CATEGORIES (Türkçe isimlerle, daha fazla kategori)
  const categories = [
    // Gelir kategorileri
    { name: "Maaş", type: "INCOME", icon: "banknote", color: "#22c55e" },
    { name: "Freelance", type: "INCOME", icon: "briefcase", color: "#16a34a" },
    { name: "Yatırım Geliri", type: "INCOME", icon: "trending-up", color: "#059669" },
    // Gider kategorileri  
    { name: "Market", type: "EXPENSE", icon: "shopping-cart", color: "#3b82f6" },
    { name: "Ulaşım", type: "EXPENSE", icon: "bus", color: "#0ea5e9" },
    { name: "Kira", type: "EXPENSE", icon: "home", color: "#a855f7" },
    { name: "Faturalar", type: "EXPENSE", icon: "zap", color: "#f97316" },
    { name: "Eğlence", type: "EXPENSE", icon: "film", color: "#8b5cf6" },
    { name: "Sağlık", type: "EXPENSE", icon: "heart", color: "#ef4444" },
    { name: "Giyim", type: "EXPENSE", icon: "shirt", color: "#ec4899" },
    { name: "Eğitim", type: "EXPENSE", icon: "book", color: "#6366f1" },
    { name: "Yemek", type: "EXPENSE", icon: "coffee", color: "#eab308" },
  ];

  for (const c of categories) {
    await prisma.category.upsert({
      where: {
        userId_name_type: { userId: user.id, name: c.name, type: c.type },
      },
      update: { icon: c.icon, color: c.color },
      create: { ...c, userId: user.id },
    });
  }

  const cat = async (name, type) =>
    prisma.category.findFirst({ where: { userId: user.id, name, type } });

  // Kategorileri al
  const maas = await cat("Maaş", "INCOME");
  const freelance = await cat("Freelance", "INCOME");
  const yatirim = await cat("Yatırım Geliri", "INCOME");
  const market = await cat("Market", "EXPENSE");
  const ulasim = await cat("Ulaşım", "EXPENSE");
  const kira = await cat("Kira", "EXPENSE");
  const faturalar = await cat("Faturalar", "EXPENSE");
  const eglence = await cat("Eğlence", "EXPENSE");
  const saglik = await cat("Sağlık", "EXPENSE");
  const giyim = await cat("Giyim", "EXPENSE");
  const egitim = await cat("Eğitim", "EXPENSE");
  const yemek = await cat("Yemek", "EXPENSE");

  // 3) INCOMES - Son 6 ay için
  const incomeData = [];
  for (let i = 5; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    date.setDate(1);
    
    // Ana maaş
    incomeData.push({
      userId: user.id,
      title: `${date.toLocaleString('tr-TR', { month: 'long' })} Maaşı`,
      amount: (42000 + Math.random() * 3000).toFixed(2),
      date: new Date(date),
      paymentType: "TRANSFER",
      categoryId: maas?.id ?? null,
      note: "Aylık maaş",
    });

    // Rastgele freelance gelir
    if (Math.random() > 0.4) {
      incomeData.push({
        userId: user.id,
        title: "Freelance Proje",
        amount: (3000 + Math.random() * 5000).toFixed(2),
        date: new Date(date.getFullYear(), date.getMonth(), 15),
        paymentType: "TRANSFER",
        categoryId: freelance?.id ?? null,
        note: "Yan proje geliri",
      });
    }
  }

  await prisma.income.createMany({ data: incomeData, skipDuplicates: true });

  // 4) EXPENSES - Son 6 ay için çeşitli harcamalar
  const expenseData = [];
  
  for (let i = 5; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    
    // Kira (her ay)
    expenseData.push({
      userId: user.id,
      title: "Kira Ödemesi",
      amount: "12500.00",
      date: new Date(date.getFullYear(), date.getMonth(), 1),
      paymentType: "TRANSFER",
      categoryId: kira?.id ?? null,
      isRecurring: true,
      note: "Aylık kira",
    });

    // Faturalar
    expenseData.push({
      userId: user.id,
      title: "Elektrik Faturası",
      amount: (350 + Math.random() * 150).toFixed(2),
      date: new Date(date.getFullYear(), date.getMonth(), 10),
      paymentType: "CARD",
      categoryId: faturalar?.id ?? null,
      isRecurring: true,
    });

    expenseData.push({
      userId: user.id,
      title: "İnternet + Telefon",
      amount: "450.00",
      date: new Date(date.getFullYear(), date.getMonth(), 12),
      paymentType: "CARD",
      categoryId: faturalar?.id ?? null,
      isRecurring: true,
    });

    // Market alışverişleri (ayda 4-6 kez)
    const marketCount = 4 + Math.floor(Math.random() * 3);
    for (let j = 0; j < marketCount; j++) {
      expenseData.push({
        userId: user.id,
        title: "Market Alışverişi",
        amount: (400 + Math.random() * 600).toFixed(2),
        date: new Date(date.getFullYear(), date.getMonth(), 5 + j * 5),
        paymentType: "CARD",
        categoryId: market?.id ?? null,
      });
    }

    // Ulaşım
    expenseData.push({
      userId: user.id,
      title: "Akbil Yükleme",
      amount: (500 + Math.random() * 200).toFixed(2),
      date: new Date(date.getFullYear(), date.getMonth(), 3),
      paymentType: "CARD",
      categoryId: ulasim?.id ?? null,
    });

    // Yemek (dışarda)
    const yemekCount = 3 + Math.floor(Math.random() * 4);
    for (let j = 0; j < yemekCount; j++) {
      expenseData.push({
        userId: user.id,
        title: ["Restoran", "Cafe", "Fast Food", "Kahvaltı"][Math.floor(Math.random() * 4)],
        amount: (150 + Math.random() * 350).toFixed(2),
        date: new Date(date.getFullYear(), date.getMonth(), 2 + j * 4),
        paymentType: "CARD",
        categoryId: yemek?.id ?? null,
      });
    }

    // Eğlence (rastgele)
    if (Math.random() > 0.3) {
      expenseData.push({
        userId: user.id,
        title: ["Sinema", "Netflix", "Spotify", "Konser"][Math.floor(Math.random() * 4)],
        amount: (100 + Math.random() * 400).toFixed(2),
        date: new Date(date.getFullYear(), date.getMonth(), 20),
        paymentType: "CARD",
        categoryId: eglence?.id ?? null,
      });
    }
  }

  await prisma.expense.createMany({ data: expenseData, skipDuplicates: true });

  // 5) BUDGET - Bu ay için kategori bazlı bütçeler
  const now = new Date();
  const budgetsData = [
    { categoryId: market?.id, limit: "4000.00" },
    { categoryId: ulasim?.id, limit: "1000.00" },
    { categoryId: yemek?.id, limit: "2500.00" },
    { categoryId: kira?.id, limit: "13000.00" },
    { categoryId: faturalar?.id, limit: "1500.00" },
    { categoryId: eglence?.id, limit: "1000.00" },
    { categoryId: giyim?.id, limit: "2000.00" },
  ].filter(b => b.categoryId);

  for (const budget of budgetsData) {
    await prisma.budget.upsert({
      where: {
        userId_month_year_categoryId: {
          userId: user.id,
          month: now.getMonth() + 1,
          year: now.getFullYear(),
          categoryId: budget.categoryId,
        },
      },
      update: { limit: budget.limit },
      create: {
        userId: user.id,
        month: now.getMonth() + 1,
        year: now.getFullYear(),
        limit: budget.limit,
        spent: "0.00",
        categoryId: budget.categoryId,
      },
    });
  }

  // 6) TARGETS - Finansal hedefler
  await prisma.target.createMany({
    data: [
      {
        userId: user.id,
        title: "Acil Durum Fonu",
        description: "6 aylık gideri karşılayacak birikim",
        targetType: "SAVING",
        targetAmount: "150000.00",
        currentAmount: "45000.00",
        status: "ACTIVE",
        startDate: new Date("2025-01-01"),
        dueDate: new Date("2026-06-01"),
      },
      {
        userId: user.id,
        title: "Tatil Fonu",
        description: "Yaz tatili için birikim",
        targetType: "SAVING",
        targetAmount: "30000.00",
        currentAmount: "12500.00",
        status: "ACTIVE",
        startDate: new Date("2025-03-01"),
        dueDate: new Date("2025-07-01"),
      },
      {
        userId: user.id,
        title: "Yeni Laptop",
        description: "MacBook Pro için birikim",
        targetType: "SAVING",
        targetAmount: "80000.00",
        currentAmount: "35000.00",
        status: "ACTIVE",
        startDate: new Date("2025-06-01"),
        dueDate: new Date("2026-01-01"),
      },
      {
        userId: user.id,
        title: "Kredi Kartı Borcu",
        description: "Kredi kartı borcunu kapat",
        targetType: "DEBT_PAYOFF",
        targetAmount: "18000.00",
        currentAmount: "14500.00",
        status: "ACTIVE",
        startDate: new Date("2025-09-01"),
        dueDate: new Date("2026-02-01"),
      },
    ],
    skipDuplicates: true,
  });

  // 7) NEWS - Finansal haberler
  await prisma.news.createMany({
    data: [
      {
        userId: user.id,
        title: "Merkez Bankası faiz kararını açıkladı",
        source: "Bloomberg HT",
        url: "https://www.bloomberght.com",
        publishedAt: new Date(),
        tags: ["economy", "tcmb", "faiz"],
        summary: "TCMB, politika faizini %45 seviyesinde sabit tutma kararı aldı. Enflasyonla mücadele kapsamında sıkı para politikası devam ediyor.",
        sentiment: "NEUTRAL",
      },
      {
        userId: user.id,
        title: "Borsa İstanbul güne yükselişle başladı",
        source: "Ekonomi Servisi",
        url: "https://www.borsaistanbul.com",
        publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
        tags: ["markets", "bist"],
        summary: "BIST 100 endeksi güne %1.5 artışla başladı. Bankacılık sektörü öncülük ediyor.",
        sentiment: "POSITIVE",
      },
      {
        userId: user.id,
        title: "Dolar/TL kritik seviyenin altında",
        source: "Finans Gündem",
        url: "https://www.finansgundem.com",
        publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 5),
        tags: ["economy", "fx"],
        summary: "Dolar/TL paritesi 35.50 seviyesinin altında işlem görüyor. Analistler, merkez bankasının kararlı duruşunun etkili olduğunu belirtiyor.",
        sentiment: "POSITIVE",
      },
      {
        userId: user.id,
        title: "Altın fiyatları rekor kırdı",
        source: "Para Dergisi",
        url: "https://www.paraanaliz.com",
        publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
        tags: ["crypto", "gold"],
        summary: "Gram altın 3.100 TL seviyesini aşarak yeni rekor kırdı. Küresel belirsizlikler altın talebini artırıyor.",
        sentiment: "POSITIVE",
      },
      {
        userId: user.id,
        title: "Bitcoin 100.000 dolar sınırında",
        source: "Kripto Gündem",
        url: "https://www.kriptogundem.com",
        publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 28),
        tags: ["crypto", "bitcoin"],
        summary: "Bitcoin, 100.000 dolar psikolojik sınırını test ediyor. Kurumsal yatırımcıların ilgisi artıyor.",
        sentiment: "POSITIVE",
      },
      {
        userId: user.id,
        title: "Konut kredisi faizlerinde indirim",
        source: "Ekonomist",
        url: "https://www.ekonomist.com.tr",
        publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 48),
        tags: ["personal", "mortgage"],
        summary: "Kamu bankaları konut kredisi faiz oranlarını %2.5'e indirdi. Özellikle ilk ev alacaklar için fırsat.",
        sentiment: "POSITIVE",
      },
      {
        userId: user.id,
        title: "Enflasyon beklentileri güncellendi",
        source: "Reuters",
        url: "https://www.reuters.com/tr",
        publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 72),
        tags: ["economy", "inflation"],
        summary: "Yıl sonu enflasyon beklentisi %44'e yükseltildi. Analistler, gıda fiyatlarındaki artışa dikkat çekiyor.",
        sentiment: "NEGATIVE",
      },
    ],
    skipDuplicates: true,
  });

  console.log("✅ Seed completed with rich data. User:", user.email);
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
