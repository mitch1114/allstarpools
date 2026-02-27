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
    return NextResponse.json({ games: [], players: [] });
  }

  // Get games for this week/league
  const where: Record<string, unknown> = { weekId };
  if (league) where.league = league;

  const games = await prisma.game.findMany({
    where,
    orderBy: [{ gameTime: "asc" }],
  });

  // Get all picks for this week
  const picks = await prisma.pick.findMany({
    where: {
      weekId,
      gameId: { in: games.map((g) => g.id) },
    },
    include: {
      user: { select: { id: true, name: true, playerCode: true } },
    },
  });

  // Group picks by user
  const playerMap = new Map<
    string,
    {
      id: string;
      name: string;
      playerCode: string;
      picks: Record<string, { selection: string; isHotPick: boolean; points: number | null }>;
    }
  >();

  for (const pick of picks) {
    if (!playerMap.has(pick.userId)) {
      playerMap.set(pick.userId, {
        id: pick.user.id,
        name: pick.user.name,
        playerCode: pick.user.playerCode,
        picks: {},
      });
    }
    playerMap.get(pick.userId)!.picks[pick.gameId] = {
      selection: pick.selection,
      isHotPick: pick.isHotPick,
      points: pick.points,
    };
  }

  // Only show picks for games that have started
  const now = new Date();
  const visibleGames = games.map((g) => ({
    ...g,
    picksVisible: new Date(g.gameTime) <= now || g.isFinal,
  }));

  return NextResponse.json({
    games: visibleGames,
    players: Array.from(playerMap.values()),
  });
}
