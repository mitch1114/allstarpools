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
  const userId = searchParams.get("userId") || session.user.id;

  if (!weekId) {
    return NextResponse.json({ picks: [] });
  }

  const picks = await prisma.pick.findMany({
    where: { weekId, userId },
    include: { game: true },
  });

  return NextResponse.json({ picks });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { picks } = await req.json();

  if (!Array.isArray(picks)) {
    return NextResponse.json({ error: "Invalid picks data" }, { status: 400 });
  }

  const now = new Date();
  const errors: string[] = [];

  // Fetch all games in one query instead of one per pick
  const gameIds = picks.map((p: { gameId: string }) => p.gameId);
  const games = await prisma.game.findMany({
    where: { id: { in: gameIds } },
  });
  const gameMap = new Map(games.map((g) => [g.id, g]));

  const validPicks: { gameId: string; weekId: string; selection: string; isHotPick: boolean }[] = [];

  for (const pick of picks) {
    const { gameId, selection, isHotPick } = pick;

    const game = gameMap.get(gameId);
    if (!game) {
      errors.push(`Game ${gameId} not found`);
      continue;
    }

    if (new Date(game.gameTime) <= now) {
      errors.push(
        `${game.awayTeam} @ ${game.homeTeam} has already started — pick locked`
      );
      continue;
    }

    if (selection !== "home" && selection !== "away") {
      errors.push(`Invalid selection for game ${gameId}`);
      continue;
    }

    validPicks.push({
      gameId,
      weekId: game.weekId,
      selection,
      isHotPick: !!isHotPick,
    });
  }

  // Save all picks in a single transaction (one round trip)
  const saved = await prisma.$transaction(
    validPicks.map((p) =>
      prisma.pick.upsert({
        where: {
          userId_gameId: {
            userId: session.user.id,
            gameId: p.gameId,
          },
        },
        update: {
          selection: p.selection,
          isHotPick: p.isHotPick,
        },
        create: {
          userId: session.user.id,
          weekId: p.weekId,
          gameId: p.gameId,
          selection: p.selection,
          isHotPick: p.isHotPick,
        },
      })
    )
  );

  return NextResponse.json({
    success: true,
    saved: saved.length,
    errors,
  });
}
