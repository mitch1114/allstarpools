import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const weekId = searchParams.get("week");
  const league = searchParams.get("league");

  if (!weekId) {
    return NextResponse.json({ games: [] });
  }

  // Get games for this week/league
  const where: Record<string, unknown> = { weekId };
  if (league) where.league = league;

  const games = await prisma.game.findMany({
    where,
    orderBy: [{ gameTime: "asc" }],
  });

  // Get all picks for this week's games
  const picks = await prisma.pick.findMany({
    where: {
      weekId,
      gameId: { in: games.map((g) => g.id) },
    },
  });

  // Only show pick stats for games that have started
  const now = new Date();

  const gameStats = games.map((g) => {
    const picksVisible = new Date(g.gameTime) <= now || g.isFinal;
    const gamePicks = picks.filter((p) => p.gameId === g.id);

    const awayPicks = picksVisible ? gamePicks.filter((p) => p.selection === "away").length : 0;
    const homePicks = picksVisible ? gamePicks.filter((p) => p.selection === "home").length : 0;
    const awayHotPicks = picksVisible ? gamePicks.filter((p) => p.selection === "away" && p.isHotPick).length : 0;
    const homeHotPicks = picksVisible ? gamePicks.filter((p) => p.selection === "home" && p.isHotPick).length : 0;

    return {
      id: g.id,
      awayTeam: g.awayTeam,
      homeTeam: g.homeTeam,
      spread: g.spread,
      isFinal: g.isFinal,
      awayScore: g.awayScore,
      homeScore: g.homeScore,
      picksVisible,
      totalPicks: picksVisible ? gamePicks.length : 0,
      awayPicks,
      homePicks,
      awayHotPicks,
      homeHotPicks,
    };
  });

  return NextResponse.json({ games: gameStats });
}
