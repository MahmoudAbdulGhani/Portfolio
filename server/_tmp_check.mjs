import "dotenv/config";
import { PrismaClient } from "@prisma/client";
const p = new PrismaClient();
try {
  const admins = await p.admin.findMany({ select: { id: true, email: true, name: true, createdAt: true } });
  for (const a of admins) {
    console.log("admin:", a.email, "|", a.name, "| created", a.createdAt.toISOString());
  }
} catch (e) {
  console.error("DB ERROR:", e.message);
} finally {
  await p.$disconnect();
}
