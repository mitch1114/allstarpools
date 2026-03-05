import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const league = searchParams.get("league"); // null = combined, "NFL" or "NCAAF" for filtered
  const weekFilter = searchParams.get("week"); // specific weekId or null for all

  const season = await prisma.season.findFirst({
    where: { isActive: true },
    include: { weeks: { orderBy: { number: "asc" } } },
  });

  if (!season) {
    return NextResponse.json({ standings: [], weeks: [] });
  }

  const users = await prisma.user.findMany({
    select: { id: true, name: true, playerCode: true },
  });

  // Build filter for picks
  const gameFilter: Record<string, unknown> = {
    seasonId: season.id,
    isFinal: true,
  };
  if (league) gameFilter.league = league;

  const picks = await prisma.pick.findMany({
    where: {
      game: gameFilter,
      points: { not: null },
    },
    include: {
      game: { select: { weekId: true, league: true } },
    },
  });

  // Calculate standings per user with weekly breakdown
  const standings = users.map((user) => {
    const userPicks = picks.filter((p) => p.userId === user.id);

    let wins = 0;
    let losses = 0;
    let ties = 0;

    // Group by week for weekly scores
    const weekPoints = new Map<string, number>();

    for (const pick of userPicks) {
      const pts = pick.points ?? 0;

      if (pts > 0) wins++;
      else losses++;

      const weekId = pick.game.weekId;
      weekPoints.set(weekId, (weekPoints.get(weekId) || 0) + pts);
    }

    // Build weekly breakdown (cumulative YTD)
    const weeklyScores: { weekId: string; weekNumber: number; points: number; ytd: number }[] = [];
    let ytd = 0;
    for (const week of season.weeks) {
      const pts = weekPoints.get(week.id) ?? 0;
      if (weekPoints.has(week.id)) {
        ytd += pts;
        weeklyScores.push({
          weekId: week.id,
          weekNumber: week.number,
          points: pts,
          ytd,
        });
      }
    }

    const weekScores = Array.from(weekPoints.values());
    const bestWeek = weekScores.length > 0 ? Math.max(...weekScores) : 0;
    const worstWeek = weekScores.length > 0 ? Math.min(...weekScores) : 0;
    const totalPoints = weekScores.reduce((sum, s) => sum + s, 0);
    const totalGames = wins + losses + ties;
    const pct = totalGames > 0 ? wins / totalGames : 0;

    return {
      id: user.id,
      name: user.name,
      playerCode: user.playerCode,
      wins,
      losses,
      ties,
      pct,
      totalPoints,
      bestWeek,
      worstWeek,
      gamesPlayed: totalGames,
      weeklyScores,
    };
  });

  standings.sort((a, b) => b.totalPoints - a.totalPoints || b.pct - a.pct);

  // Filter out users with no picks
  const activeStandings = standings.filter((s) => s.gamesPlayed > 0);

  return NextResponse.json({
    standings: activeStandings,
    weeks: season.weeks.map((w) => ({ id: w.id, number: w.number, label: w.label })),
  });
}
