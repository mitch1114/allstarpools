import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const league = searchParams.get("league") || "NFL";

  const season = await prisma.season.findFirst({
    where: { isActive: true },
  });

  if (!season) {
    return NextResponse.json({ standings: [] });
  }

  // Get all users
  const users = await prisma.user.findMany({
    select: { id: true, name: true, playerCode: true },
  });

  // Get all picks with scored games for this season and league
  const picks = await prisma.pick.findMany({
    where: {
      game: {
        seasonId: season.id,
        league,
        isFinal: true,
      },
      points: { not: null },
    },
    include: {
      game: { select: { weekId: true } },
    },
  });

  // Calculate standings per user
  const standings = users.map((user) => {
    const userPicks = picks.filter((p) => p.userId === user.id);

    let wins = 0;
    let losses = 0;
    let ties = 0;

    // Group by week for best/worst week
    const weekPoints = new Map<string, number>();

    for (const pick of userPicks) {
      const pts = pick.points ?? 0;

      // For W/L/T: a pick is a win if points > 0, loss if points < 0 or 0 for regular (push)
      if (pts > 0) {
        wins++;
      } else if (pts < 0) {
        losses++;
      } else {
        // 0 points = regular pick that was wrong, or push
        losses++;
      }

      const weekId = pick.game.weekId;
      weekPoints.set(weekId, (weekPoints.get(weekId) || 0) + pts);
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
    };
  });

  // Sort by total points descending, then by pct
  standings.sort((a, b) => b.totalPoints - a.totalPoints || b.pct - a.pct);

  return NextResponse.json({ standings });
}
