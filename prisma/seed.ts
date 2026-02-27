import { PrismaClient } from "@prisma/client";
import { hashSync } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const admin = await prisma.user.upsert({
    where: { playerCode: "admin" },
    update: {},
    create: {
      playerCode: "admin",
      name: "Jeff (Admin)",
      password: hashSync("admin123", 10),
      isAdmin: true,
    },
  });

  // Create a demo player
  await prisma.user.upsert({
    where: { playerCode: "demo" },
    update: {},
    create: {
      playerCode: "demo",
      name: "Demo Player",
      password: hashSync("demo123", 10),
      isAdmin: false,
    },
  });

  // Create current season
  const season = await prisma.season.upsert({
    where: { year: 2025 },
    update: {},
    create: {
      year: 2025,
      isActive: true,
    },
  });

  // Create NFL weeks (1-18)
  for (let i = 1; i <= 18; i++) {
    const startDate = new Date(2025, 8, 4 + (i - 1) * 7); // Sep 4, 2025
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 4);

    await prisma.week.upsert({
      where: {
        seasonId_number: { seasonId: season.id, number: i },
      },
      update: {},
      create: {
        number: i,
        seasonId: season.id,
        label: `Week ${i}`,
        startDate,
        endDate,
        isActive: i === 1,
      },
    });
  }

  console.log("Seeded admin user:", admin.playerCode);
  console.log("Seeded demo user: demo / demo123");
  console.log("Seeded season 2025 with 18 weeks");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
