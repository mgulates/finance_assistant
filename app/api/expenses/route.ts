import { prisma } from "@/lib/prisma";

export async function GET() {
  const items = await prisma.expense.findMany({
    orderBy: { date: "desc" },
    include: { category: true },
  });

  // Prisma Decimal -> string (Next/JSON için sorun çıkarmasın)
  const serialized = items.map((e: any) => ({
    ...e,
    amount: e.amount.toString(),
  }));

  return Response.json(serialized);
}

export async function POST(req: Request) {
  const body = await req.json();

  const user = await prisma.user.findUnique({
    where: { email: "demo@sau.dev" },
  });

  if (!user) return new Response("Seed user missing", { status: 400 });

  const created = await prisma.expense.create({
    data: {
      title: body.title,
      amount: body.amount, // string gönder: "75.50"
      date: new Date(body.date),
      userId: user.id,
      categoryId: body.categoryId ?? null,
    },
  });

  return Response.json(
    { ...created, amount: created.amount.toString() },
    { status: 201 }
  );
}
