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

  const { picks, tiebreaker } = await req.json();

  if (!Array.isArray(picks)) {
    return NextResponse.json({ error: "Invalid picks data" }, { status: 400 });
  }

  const now = new Date();
  const errors: string[] = [];
  const savedPicks = [];

  for (const pick of picks) {
    const { gameId, selection, isHotPick } = pick;

    // Check game hasn't started
    const game = await prisma.game.findUnique({ where: { id: gameId } });
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

    const saved = await prisma.pick.upsert({
      where: {
        userId_gameId: {
          userId: session.user.id,
          gameId,
        },
      },
      update: {
        selection,
        isHotPick: !!isHotPick,
        tiebreaker: game.isMondayNight && tiebreaker != null ? Number(tiebreaker) : undefined,
      },
      create: {
        userId: session.user.id,
        weekId: game.weekId,
        gameId,
        selection,
        isHotPick: !!isHotPick,
        tiebreaker: game.isMondayNight && tiebreaker != null ? Number(tiebreaker) : null,
      },
    });

    savedPicks.push(saved);
  }

  return NextResponse.json({
    success: true,
    saved: savedPicks.length,
    errors,
  });
}
