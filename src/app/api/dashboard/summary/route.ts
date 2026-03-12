import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const userId = session.user.id;

  const season = await prisma.season.findFirst({
    where: { isActive: true },
    include: { weeks: { orderBy: { number: "asc" } } },
  });

  if (!season) {
    return NextResponse.json({ summary: null });
  }

  // Get all scored picks for the current season (combined NFL + NCAAF)
  const allPicks = await prisma.pick.findMany({
    where: {
      game: { seasonId: season.id, isFinal: true },
      points: { not: null },
    },
    include: { game: { select: { weekId: true } } },
  });

  // Calculate per-user totals for ranking
  const userTotals = new Map<string, number>();
  for (const pick of allPicks) {
    const current = userTotals.get(pick.userId) || 0;
    userTotals.set(pick.userId, current + (pick.points ?? 0));
  }

  const sortedTotals = Array.from(userTotals.entries()).sort((a, b) => b[1] - a[1]);
  const rank = sortedTotals.findIndex(([id]) => id === userId) + 1;
  const totalPlayers = sortedTotals.length;

  // Get this user's picks
  const userPicks = allPicks.filter((p) => p.userId === userId);

  let wins = 0;
  let losses = 0;
  let totalPoints = 0;
  let hotPickWins = 0;
  let hotPickLosses = 0;

  const weekPoints = new Map<string, number>();

  for (const pick of userPicks) {
    const pts = pick.points ?? 0;
    totalPoints += pts;
    if (pts > 0) wins++;
    else losses++;

    if (pick.isHotPick) {
      if (pts > 0) hotPickWins++;
      else hotPickLosses++;
    }

    weekPoints.set(pick.game.weekId, (weekPoints.get(pick.game.weekId) || 0) + pts);
  }

  // Build weekly breakdown
  const weeklyScores: { weekNumber: number; points: number; ytd: number }[] = [];
  let ytd = 0;
  for (const week of season.weeks) {
    if (weekPoints.has(week.id)) {
      const pts = weekPoints.get(week.id) ?? 0;
      ytd += pts;
      weeklyScores.push({ weekNumber: week.number, points: pts, ytd });
    }
  }

  return NextResponse.json({
    summary: {
      totalPoints,
      wins,
      losses,
      hotPickWins,
      hotPickLosses,
      rank: rank || totalPlayers + 1,
      totalPlayers: Math.max(totalPlayers, 1),
      weeklyScores,
    },
  });
}
