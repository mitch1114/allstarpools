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

  // Seed demo games for Week 1
  const week1 = await prisma.week.findFirst({
    where: { seasonId: season.id, number: 1 },
  });

  if (week1) {
    const existingGames = await prisma.game.count({ where: { weekId: week1.id } });

    if (existingGames === 0) {
      const sat = new Date("2025-09-06T16:00:00Z");
      const sun1 = new Date("2025-09-07T17:00:00Z");
      const sun4 = new Date("2025-09-07T20:25:00Z");
      const snf = new Date("2025-09-08T00:20:00Z");
      const mnf = new Date("2025-09-09T00:15:00Z");

      const nflGames = [
        { away: "Chiefs", home: "Ravens", spread: -1.5, time: sun4, mnf: false },
        { away: "Eagles", home: "Packers", spread: 3, time: sun1, mnf: false },
        { away: "49ers", home: "Steelers", spread: -4, time: sun1, mnf: false },
        { away: "Cowboys", home: "Browns", spread: -3, time: sun1, mnf: false },
        { away: "Bills", home: "Cardinals", spread: -6.5, time: sun4, mnf: false },
        { away: "Dolphins", home: "Jaguars", spread: -3, time: sun1, mnf: false },
        { away: "Vikings", home: "Giants", spread: -2.5, time: sun1, mnf: false },
        { away: "Bengals", home: "Patriots", spread: -6, time: sun1, mnf: false },
        { away: "Texans", home: "Colts", spread: -3, time: sun1, mnf: false },
        { away: "Bears", home: "Titans", spread: -1, time: sun1, mnf: false },
        { away: "Rams", home: "Lions", spread: 3.5, time: snf, mnf: false },
        { away: "Jets", home: "Chargers", spread: 2.5, time: mnf, mnf: true },
      ];

      for (const g of nflGames) {
        await prisma.game.create({
          data: {
            seasonId: season.id,
            weekId: week1.id,
            league: "NFL",
            awayTeam: g.away,
            homeTeam: g.home,
            spread: g.spread,
            gameTime: g.time,
            isMondayNight: g.mnf,
          },
        });
      }

      const ncaafGames = [
        { away: "Alabama", home: "Wisconsin", spread: -14 },
        { away: "Ohio State", home: "Texas", spread: -3 },
        { away: "Georgia", home: "Clemson", spread: -7.5 },
        { away: "Michigan", home: "Oklahoma", spread: 2.5 },
        { away: "USC", home: "LSU", spread: 1.5 },
        { away: "Oregon", home: "Boise State", spread: -10 },
        { away: "Penn State", home: "West Virginia", spread: -13.5 },
        { away: "Florida State", home: "Notre Dame", spread: 7 },
        { away: "Tennessee", home: "Virginia Tech", spread: -6 },
        { away: "Miami", home: "Florida", spread: -3.5 },
        { away: "Auburn", home: "Cal", spread: -4 },
        { away: "Texas A&M", home: "Arizona State", spread: -5.5 },
      ];

      for (const g of ncaafGames) {
        await prisma.game.create({
          data: {
            seasonId: season.id,
            weekId: week1.id,
            league: "NCAAF",
            awayTeam: g.away,
            homeTeam: g.home,
            spread: g.spread,
            gameTime: sat,
            isMondayNight: false,
          },
        });
      }

      console.log("Seeded 12 NFL + 12 NCAAF demo games for Week 1");
    } else {
      console.log(`Week 1 already has ${existingGames} games, skipping demo seed`);
    }
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
