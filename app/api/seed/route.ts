import { prisma } from "@/lib/prisma";

export async function POST() {
  const user = await prisma.user.upsert({
    where: { email: "demo@sau.dev" },
    update: {},
    create: { email: "demo@sau.dev", name: "Demo User" },
  });

  return Response.json({ ok: true, user });
}
