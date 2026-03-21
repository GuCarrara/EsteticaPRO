import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash("123456", 10);

  const user = await prisma.user.upsert({
    where: { email: "admin@esteticapro.com" },
    update: {},
    create: {
      name: "Gustavo",
      email: "admin@esteticapro.com",
      password,
      isPaid: true,
      planType: "premium",
    },
  });

  console.log("✅ Usuário criado:", user.email);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());