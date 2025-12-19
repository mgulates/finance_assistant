const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  // 1) USER
  const user = await prisma.user.upsert({
    where: { email: "demo@sau.dev" },
    update: { name: "Demo User" },
    create: { email: "demo@sau.dev", name: "Demo User" },
  });

  // 2) CATEGORIES (Income + Expense)
  const categories = [
    { name: "Salary", type: "INCOME", icon: "banknote", color: "#22c55e" },
    { name: "Freelance", type: "INCOME", icon: "briefcase", color: "#16a34a" },
    { name: "Food", type: "EXPENSE", icon: "coffee", color: "#f97316" },
    { name: "Transport", type: "EXPENSE", icon: "bus", color: "#0ea5e9" },
    { name: "Rent", type: "EXPENSE", icon: "home", color: "#a855f7" },
    { name: "Shopping", type: "EXPENSE", icon: "shopping-bag", color: "#ef4444" },
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

  const salary = await cat("Salary", "INCOME");
  const food = await cat("Food", "EXPENSE");
  const rent = await cat("Rent", "EXPENSE");
  const transport = await cat("Transport", "EXPENSE");
  const shopping = await cat("Shopping", "EXPENSE");

  // 3) INCOMES
  await prisma.income.createMany({
    data: [
      {
        userId: user.id,
        title: "December Salary",
        amount: "45000.00",
        date: new Date("2025-12-01"),
        paymentType: "TRANSFER",
        categoryId: salary?.id ?? null,
        note: "Monthly salary",
      },
      {
        userId: user.id,
        title: "Freelance",
        amount: "6500.00",
        date: new Date("2025-12-10"),
        paymentType: "TRANSFER",
        categoryId: null,
        note: "Side project",
      },
    ],
    skipDuplicates: true,
  });

  // 4) EXPENSES
  await prisma.expense.createMany({
    data: [
      {
        userId: user.id,
        title: "Rent - December",
        amount: "12000.00",
        date: new Date("2025-12-03"),
        paymentType: "TRANSFER",
        categoryId: rent?.id ?? null,
        note: "House rent",
        isRecurring: true,
      },
      {
        userId: user.id,
        title: "Metro",
        amount: "35.00",
        date: new Date("2025-12-05"),
        paymentType: "CARD",
        categoryId: transport?.id ?? null,
        note: "Transport",
        isRecurring: false,
      },
      {
        userId: user.id,
        title: "Coffee",
        amount: "75.50",
        date: new Date("2025-12-19"),
        paymentType: "CARD",
        categoryId: food?.id ?? null,
        note: "Cafe",
        isRecurring: false,
      },
      {
        userId: user.id,
        title: "Shopping",
        amount: "899.99",
        date: new Date("2025-12-12"),
        paymentType: "CARD",
        categoryId: shopping?.id ?? null,
        note: "Clothes",
        isRecurring: false,
      },
    ],
    skipDuplicates: true,
  });

  // 5) BUDGET (this month)
  const now = new Date();
  await prisma.budget.upsert({
    where: {
      userId_month_year_categoryId: {
        userId: user.id,
        month: now.getMonth() + 1,
        year: now.getFullYear(),
        categoryId: null,
      },
    },
    update: { limit: "25000.00" },
    create: {
      userId: user.id,
      month: now.getMonth() + 1,
      year: now.getFullYear(),
      limit: "25000.00",
      spent: "0.00",
      categoryId: null,
    },
  });

  // 6) TARGET
  await prisma.target.createMany({
    data: [
      {
        userId: user.id,
        title: "Emergency Fund",
        description: "Build a safety net",
        targetType: "SAVING",
        targetAmount: "60000.00",
        currentAmount: "8500.00",
        status: "ACTIVE",
        dueDate: new Date("2026-06-01"),
      },
      {
        userId: user.id,
        title: "Pay off credit card",
        targetType: "DEBT_PAYOFF",
        targetAmount: "15000.00",
        currentAmount: "2000.00",
        status: "ACTIVE",
        dueDate: new Date("2026-03-01"),
      },
    ],
    skipDuplicates: true,
  });

  // 7) NEWS
  await prisma.news.createMany({
    data: [
      {
        userId: user.id,
        title: "Dollar rate fluctuates",
        source: "Example News",
        url: "https://example.com/news1",
        publishedAt: new Date("2025-12-18"),
        tags: ["fx", "usd", "try"],
        summary: "Daily FX summary",
        sentiment: "NEUTRAL",
      },
      {
        userId: user.id,
        title: "Inflation expectations update",
        source: "Example News",
        url: "https://example.com/news2",
        publishedAt: new Date("2025-12-16"),
        tags: ["macro", "inflation"],
        summary: "Macro update",
        sentiment: "NEGATIVE",
      },
    ],
    skipDuplicates: true,
  });

  // 8) ANALYSIS (monthly)
  await prisma.analysis.upsert({
    where: {
      userId_periodType_year_month: {
        userId: user.id,
        periodType: "MONTHLY",
        year: 2025,
        month: 12,
      },
    },
    update: {
      totalIncome: "51500.00",
      totalExpense: "13010.49",
      balance: "38489.51",
      healthScore: 78,
      insights: {
        topCategory: "Rent",
        warning: "Rent is the biggest expense",
      },
    },
    create: {
      userId: user.id,
      periodType: "MONTHLY",
      year: 2025,
      month: 12,
      totalIncome: "51500.00",
      totalExpense: "13010.49",
      balance: "38489.51",
      healthScore: 78,
      insights: {
        topCategory: "Rent",
        warning: "Rent is the biggest expense",
      },
    },
  });

  console.log("✅ Seed completed. User:", user.email);
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
