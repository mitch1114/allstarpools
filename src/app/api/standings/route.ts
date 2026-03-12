import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const league = searchParams.get("league");
  const weekFilter = searchParams.get("week");

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

  // Build filter for scored picks
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

  // Get the week to calculate best/worst potential for
  const potentialWeekId = weekFilter || season.weeks.find(w => w.isActive)?.id || null;

  // Get ALL picks for that week (scored + unscored) to calculate potential
  const potentialGameFilter: Record<string, unknown> = { seasonId: season.id };
  if (league) potentialGameFilter.league = league;

  let allPicksForWeek: { userId: string; isHotPick: boolean; points: number | null; game: { isFinal: boolean } }[] = [];
  if (potentialWeekId) {
    allPicksForWeek = await prisma.pick.findMany({
      where: {
        weekId: potentialWeekId,
        game: potentialGameFilter,
      },
      select: {
        userId: true,
        isHotPick: true,
        points: true,
        game: { select: { isFinal: true } },
      },
    });
  }

  // Get weekly prize totals per user
  const weeklyPrizes = await prisma.weeklyPrize.findMany({
    where: { week: { seasonId: season.id } },
    select: { userId: true, amount: true },
  });

  const userCashTotals = new Map<string, number>();
  for (const prize of weeklyPrizes) {
    userCashTotals.set(prize.userId, (userCashTotals.get(prize.userId) || 0) + prize.amount);
  }

  // Calculate standings per user
  const standings = users.map((user) => {
    const userPicks = picks.filter((p) => p.userId === user.id);

    let wins = 0;
    let losses = 0;
    const ties = 0;

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
        weeklyScores.push({ weekId: week.id, weekNumber: week.number, points: pts, ytd });
      }
    }

    // Calculate best/worst potential for the selected week
    const userWeekPicks = allPicksForWeek.filter((p) => p.userId === user.id);
    let bestPotential = 0;
    let worstPotential = 0;

    for (const pick of userWeekPicks) {
      if (pick.game.isFinal && pick.points !== null) {
        bestPotential += pick.points;
        worstPotential += pick.points;
      } else {
        bestPotential += pick.isHotPick ? 2 : 1;
        worstPotential += pick.isHotPick ? -1 : 0;
      }
    }

    const weekScores = Array.from(weekPoints.values());
    const totalPoints = weekScores.reduce((sum, s) => sum + s, 0);
    const totalGames = wins + losses + ties;
    const pct = totalGames > 0 ? wins / totalGames : 0;
    const totalCash = userCashTotals.get(user.id) || 0;

    return {
      id: user.id,
      name: user.name,
      playerCode: user.playerCode,
      wins, losses, ties, pct,
      totalPoints,
      bestPotential,
      worstPotential,
      gamesPlayed: totalGames,
      weeklyScores,
      totalCash,
    };
  });

  standings.sort((a, b) => b.totalPoints - a.totalPoints || b.pct - a.pct);

  const activeStandings = standings.filter((s) => s.gamesPlayed > 0);

  return NextResponse.json({
    standings: activeStandings,
    weeks: season.weeks.map((w) => ({ id: w.id, number: w.number, label: w.label })),
  });
}
