import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";

export async function POST(req: NextRequest) {
  const { error, status } = await requireAdmin();
  if (error) return NextResponse.json({ error }, { status });

  const body = await req.json();
  const { gameId, awayScore, homeScore } = body;

  if (!gameId || awayScore === undefined || homeScore === undefined) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Update game score and mark as final
  const game = await prisma.game.update({
    where: { id: gameId },
    data: {
      awayScore: parseInt(awayScore),
      homeScore: parseInt(homeScore),
      isFinal: true,
    },
  });

  // Now score all picks for this game
  const picks = await prisma.pick.findMany({
    where: { gameId },
  });

  const aScore = parseInt(awayScore);
  const hScore = parseInt(homeScore);

  for (const pick of picks) {
    // Determine if pick is correct based on spread
    // spread is from home team perspective (negative = home favored)
    // If home team spread is -3, home team needs to win by more than 3
    const adjustedHomeScore = hScore + game.spread;

    let isCorrect: boolean;
    let isPush: boolean;

    if (pick.selection === "home") {
      // Picked home team: home team + spread must be > away score
      isPush = adjustedHomeScore === aScore;
      isCorrect = adjustedHomeScore > aScore;
    } else {
      // Picked away team: away score must be > home + spread
      isPush = aScore === adjustedHomeScore;
      isCorrect = aScore > adjustedHomeScore;
    }

    let points: number;

    if (isPush) {
      // Pushes are a loss all around
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

  return NextResponse.json({
    success: true,
    game,
    picksScored: picks.length,
  });
}

export async function PUT(req: NextRequest) {
  const { error, status } = await requireAdmin();
  if (error) return NextResponse.json({ error }, { status });

  const { gameId } = await req.json();

  if (!gameId) {
    return NextResponse.json({ error: "Game ID required" }, { status: 400 });
  }

  // Unfinalize game - reset scores and pick points
  await prisma.game.update({
    where: { id: gameId },
    data: { isFinal: false, awayScore: null, homeScore: null },
  });

  await prisma.pick.updateMany({
    where: { gameId },
    data: { points: null },
  });

  return NextResponse.json({ success: true });
}
