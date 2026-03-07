import { prisma } from "@/lib/db";
import { hashSync } from "bcryptjs";
import { NextResponse } from "next/server";

const nflMatchups = [
  [
    { away: "Chiefs", home: "Ravens", spread: -1.5 },
    { away: "Eagles", home: "Packers", spread: 3 },
    { away: "49ers", home: "Steelers", spread: -4 },
    { away: "Cowboys", home: "Browns", spread: -3 },
    { away: "Bills", home: "Cardinals", spread: -6.5 },
    { away: "Dolphins", home: "Jaguars", spread: -3 },
    { away: "Vikings", home: "Giants", spread: -2.5 },
    { away: "Bengals", home: "Patriots", spread: -6 },
    { away: "Texans", home: "Colts", spread: -3 },
    { away: "Bears", home: "Titans", spread: -1 },
    { away: "Rams", home: "Lions", spread: 3.5 },
    { away: "Jets", home: "Chargers", spread: 2.5 },
  ],
  [
    { away: "Ravens", home: "Bills", spread: -2 },
    { away: "Lions", home: "49ers", spread: 1 },
    { away: "Packers", home: "Cowboys", spread: -3.5 },
    { away: "Steelers", home: "Dolphins", spread: -1.5 },
    { away: "Browns", home: "Eagles", spread: 6 },
    { away: "Chargers", home: "Chiefs", spread: 4.5 },
    { away: "Patriots", home: "Vikings", spread: 3 },
    { away: "Colts", home: "Bears", spread: -2 },
    { away: "Titans", home: "Bengals", spread: 4 },
    { away: "Giants", home: "Texans", spread: 7 },
    { away: "Cardinals", home: "Rams", spread: 3.5 },
    { away: "Jaguars", home: "Jets", spread: 1.5 },
  ],
  [
    { away: "49ers", home: "Chiefs", spread: 2.5 },
    { away: "Cowboys", home: "Ravens", spread: 3 },
    { away: "Eagles", home: "Lions", spread: 1 },
    { away: "Bills", home: "Packers", spread: -3 },
    { away: "Dolphins", home: "Bengals", spread: -1.5 },
    { away: "Vikings", home: "Chargers", spread: -2 },
    { away: "Texans", home: "Steelers", spread: -4 },
    { away: "Jets", home: "Browns", spread: -1 },
    { away: "Bears", home: "Giants", spread: -3.5 },
    { away: "Rams", home: "Patriots", spread: -6 },
    { away: "Titans", home: "Cardinals", spread: 1.5 },
    { away: "Colts", home: "Jaguars", spread: -2.5 },
  ],
  [
    { away: "Lions", home: "Cowboys", spread: -3 },
    { away: "Chiefs", home: "Eagles", spread: -1.5 },
    { away: "Ravens", home: "49ers", spread: -2.5 },
    { away: "Packers", home: "Vikings", spread: -1 },
    { away: "Bengals", home: "Bills", spread: 3 },
    { away: "Chargers", home: "Dolphins", spread: 2 },
    { away: "Browns", home: "Texans", spread: 4.5 },
    { away: "Patriots", home: "Jets", spread: 3.5 },
    { away: "Giants", home: "Colts", spread: 2 },
    { away: "Cardinals", home: "Bears", spread: 1.5 },
    { away: "Jaguars", home: "Titans", spread: 3 },
    { away: "Steelers", home: "Rams", spread: -1.5 },
  ],
  [
    { away: "Eagles", home: "49ers", spread: 2 },
    { away: "Cowboys", home: "Bills", spread: 3.5 },
    { away: "Lions", home: "Ravens", spread: 1.5 },
    { away: "Vikings", home: "Chiefs", spread: 3 },
    { away: "Dolphins", home: "Packers", spread: -1 },
    { away: "Bengals", home: "Chargers", spread: -2.5 },
    { away: "Texans", home: "Jets", spread: -3 },
    { away: "Steelers", home: "Browns", spread: -2 },
    { away: "Bears", home: "Patriots", spread: -4 },
    { away: "Rams", home: "Giants", spread: -5.5 },
    { away: "Colts", home: "Titans", spread: -1.5 },
    { away: "Cardinals", home: "Jaguars", spread: -3 },
  ],
];

const ncaafMatchups = [
  [
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
  ],
  [
    { away: "Texas", home: "Alabama", spread: 3 },
    { away: "Notre Dame", home: "Ohio State", spread: 6.5 },
    { away: "Clemson", home: "Michigan", spread: 2 },
    { away: "Oklahoma", home: "Georgia", spread: 10 },
    { away: "LSU", home: "Oregon", spread: 3.5 },
    { away: "Boise State", home: "USC", spread: 7 },
    { away: "West Virginia", home: "Tennessee", spread: 4 },
    { away: "Virginia Tech", home: "Penn State", spread: 10.5 },
    { away: "Florida", home: "Auburn", spread: -1.5 },
    { away: "Cal", home: "Miami", spread: 8 },
    { away: "Arizona State", home: "Florida State", spread: 3 },
    { away: "Wisconsin", home: "Texas A&M", spread: 2.5 },
  ],
  [
    { away: "Ohio State", home: "Oregon", spread: -2.5 },
    { away: "Alabama", home: "Georgia", spread: 3 },
    { away: "Michigan", home: "Notre Dame", spread: 4 },
    { away: "Texas", home: "LSU", spread: -3 },
    { away: "USC", home: "Clemson", spread: -1.5 },
    { away: "Oklahoma", home: "Tennessee", spread: 2 },
    { away: "Penn State", home: "Auburn", spread: -7 },
    { away: "Florida State", home: "Miami", spread: 2.5 },
    { away: "Boise State", home: "West Virginia", spread: -4 },
    { away: "Texas A&M", home: "Virginia Tech", spread: -5 },
    { away: "Florida", home: "Wisconsin", spread: -2 },
    { away: "Arizona State", home: "Cal", spread: -3 },
  ],
  [
    { away: "Georgia", home: "Texas", spread: -1.5 },
    { away: "Oregon", home: "Michigan", spread: -3 },
    { away: "Notre Dame", home: "Alabama", spread: 7 },
    { away: "LSU", home: "Ohio State", spread: 6 },
    { away: "Clemson", home: "Oklahoma", spread: -4 },
    { away: "Tennessee", home: "USC", spread: 1 },
    { away: "Miami", home: "Penn State", spread: 3.5 },
    { away: "Auburn", home: "Florida State", spread: 2 },
    { away: "West Virginia", home: "Arizona State", spread: -1 },
    { away: "Virginia Tech", home: "Florida", spread: 1.5 },
    { away: "Cal", home: "Texas A&M", spread: 5 },
    { away: "Wisconsin", home: "Boise State", spread: -2 },
  ],
  [
    { away: "Texas", home: "Michigan", spread: -2 },
    { away: "Georgia", home: "Oregon", spread: -1 },
    { away: "Alabama", home: "Clemson", spread: -6 },
    { away: "Ohio State", home: "Oklahoma", spread: -10 },
    { away: "LSU", home: "Notre Dame", spread: 3.5 },
    { away: "USC", home: "Penn State", spread: 2 },
    { away: "Tennessee", home: "Florida", spread: -4.5 },
    { away: "Miami", home: "Auburn", spread: -5 },
    { away: "Florida State", home: "West Virginia", spread: -3 },
    { away: "Boise State", home: "Virginia Tech", spread: -2.5 },
    { away: "Arizona State", home: "Wisconsin", spread: 1 },
    { away: "Texas A&M", home: "Cal", spread: -4 },
  ],
];

export async function GET(request: Request) {
  // Simple secret check to prevent random people from seeding
  const { searchParams } = new URL(request.url);
  const key = searchParams.get("key");
  if (key !== "allstarpools2026") {
    return NextResponse.json({ error: "Invalid key" }, { status: 401 });
  }

  try {
    // Check if already seeded
    const existingUsers = await prisma.user.count();
    if (existingUsers > 0) {
      return NextResponse.json({ message: "Database already seeded", users: existingUsers });
    }

    // Create admin user
    const admin = await prisma.user.create({
      data: {
        playerCode: "admin",
        name: "Jeff (Admin)",
        email: "admin@allstarpools.com",
        password: hashSync("admin123", 10),
        isAdmin: true,
      },
    });

    // Create demo player
    const demo = await prisma.user.create({
      data: {
        playerCode: "demo",
        name: "Demo Player",
        email: "demo@allstarpools.com",
        password: hashSync("demo123", 10),
        isAdmin: false,
      },
    });

    // Create season
    const season = await prisma.season.create({
      data: { year: 2026, isActive: true },
    });

    // Create weeks
    for (let i = 1; i <= 18; i++) {
      const startDate = new Date(2026, 8, 3 + (i - 1) * 7);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 4);

      await prisma.week.create({
        data: {
          number: i,
          seasonId: season.id,
          label: `Week ${i}`,
          startDate,
          endDate,
          isActive: i === 1,
        },
      });
    }

    // Seed games for weeks 1-5
    for (let weekNum = 1; weekNum <= 5; weekNum++) {
      const week = await prisma.week.findFirst({
        where: { seasonId: season.id, number: weekNum },
      });
      if (!week) continue;

      const baseDate = new Date(2026, 8, 3 + (weekNum - 1) * 7);
      const sat = new Date(baseDate);
      sat.setDate(sat.getDate() + 2);
      sat.setUTCHours(16, 0, 0, 0);

      const sun1 = new Date(baseDate);
      sun1.setDate(sun1.getDate() + 3);
      sun1.setUTCHours(17, 0, 0, 0);

      const sun4 = new Date(baseDate);
      sun4.setDate(sun4.getDate() + 3);
      sun4.setUTCHours(20, 25, 0, 0);

      const snf = new Date(baseDate);
      snf.setDate(snf.getDate() + 4);
      snf.setUTCHours(0, 20, 0, 0);

      const mnf = new Date(baseDate);
      mnf.setDate(mnf.getDate() + 5);
      mnf.setUTCHours(0, 15, 0, 0);

      const nfl = nflMatchups[weekNum - 1];
      for (let i = 0; i < nfl.length; i++) {
        const g = nfl[i];
        let time = sun1;
        let isMnf = false;
        if (i === nfl.length - 1) { time = mnf; isMnf = true; }
        else if (i === nfl.length - 2) { time = snf; }
        else if (i >= 8) { time = sun4; }

        await prisma.game.create({
          data: {
            seasonId: season.id,
            weekId: week.id,
            league: "NFL",
            awayTeam: g.away,
            homeTeam: g.home,
            spread: g.spread,
            gameTime: time,
            isMondayNight: isMnf,
          },
        });
      }

      const ncaaf = ncaafMatchups[weekNum - 1];
      for (const g of ncaaf) {
        await prisma.game.create({
          data: {
            seasonId: season.id,
            weekId: week.id,
            league: "NCAAF",
            awayTeam: g.away,
            homeTeam: g.home,
            spread: g.spread,
            gameTime: sat,
            isMondayNight: false,
          },
        });
      }
    }

    // Create fake players
    const fakePlayers = [
      { code: "bigmike", name: "Big Mike", email: "mike@test.com" },
      { code: "luckylou", name: "Lucky Lou", email: "lou@test.com" },
      { code: "pickmaster", name: "Tony Picks", email: "tony@test.com" },
      { code: "spreadking", name: "Spread King Steve", email: "steve@test.com" },
      { code: "chalky", name: "Chalk Charlie", email: "charlie@test.com" },
    ];

    const playerIds: string[] = [admin.id, demo.id];
    for (const fp of fakePlayers) {
      const user = await prisma.user.create({
        data: {
          playerCode: fp.code,
          name: fp.name,
          email: fp.email,
          password: hashSync("test123", 10),
          isAdmin: false,
        },
      });
      playerIds.push(user.id);
    }

    // Generate picks and scores for weeks 1-2
    for (let weekNum = 1; weekNum <= 2; weekNum++) {
      const week = await prisma.week.findFirst({
        where: { seasonId: season.id, number: weekNum },
      });
      if (!week) continue;

      const nflGamesDb = await prisma.game.findMany({
        where: { weekId: week.id, league: "NFL" },
        orderBy: { gameTime: "asc" },
      });
      const ncaafGamesDb = await prisma.game.findMany({
        where: { weekId: week.id, league: "NCAAF" },
        orderBy: { gameTime: "asc" },
      });

      const allGames = [...nflGamesDb, ...ncaafGamesDb];
      for (const game of allGames) {
        const homeScore = 14 + Math.floor(Math.random() * 24);
        const awayScore = 10 + Math.floor(Math.random() * 24);
        await prisma.game.update({
          where: { id: game.id },
          data: { homeScore, awayScore, isFinal: true },
        });
      }

      for (const userId of playerIds) {
        for (let i = 0; i < Math.min(10, nflGamesDb.length); i++) {
          const game = nflGamesDb[i];
          await prisma.pick.create({
            data: {
              userId,
              weekId: week.id,
              gameId: game.id,
              selection: Math.random() > 0.5 ? "home" : "away",
              isHotPick: i < 3,
            },
          });
        }

        for (let i = 0; i < Math.min(10, ncaafGamesDb.length); i++) {
          const game = ncaafGamesDb[i];
          await prisma.pick.create({
            data: {
              userId,
              weekId: week.id,
              gameId: game.id,
              selection: Math.random() > 0.5 ? "home" : "away",
              isHotPick: i < 3,
            },
          });
        }
      }

      // Score picks
      const scoredGames = await prisma.game.findMany({
        where: { weekId: week.id, isFinal: true },
      });

      for (const game of scoredGames) {
        const picks = await prisma.pick.findMany({
          where: { gameId: game.id, points: null },
        });

        for (const pick of picks) {
          const aScore = game.awayScore!;
          const hScore = game.homeScore!;
          const adjustedHomeScore = hScore + game.spread;

          let isCorrect: boolean;
          let isPush: boolean;

          if (pick.selection === "home") {
            isPush = adjustedHomeScore === aScore;
            isCorrect = adjustedHomeScore > aScore;
          } else {
            isPush = aScore === adjustedHomeScore;
            isCorrect = aScore > adjustedHomeScore;
          }

          let points: number;
          if (isPush) {
            points = pick.isHotPick ? -1 : 0;
          } else if (isCorrect) {
            points = pick.isHotPick ? 2 : 1;
          } else {
            points = pick.isHotPick ? -1 : 0;
          }

          await prisma.pick.update({
            where: { id: pick.id },
            data: { points },
          });
        }
      }
    }

    return NextResponse.json({
      message: "Database seeded successfully!",
      admin: "admin / admin123",
      demo: "demo / demo123",
    });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json(
      { error: "Seed failed", details: String(error) },
      { status: 500 }
    );
  }
}
