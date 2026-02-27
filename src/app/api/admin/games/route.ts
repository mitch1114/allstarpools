import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";

export async function GET(req: NextRequest) {
  const { error, status } = await requireAdmin();
  if (error) return NextResponse.json({ error }, { status });

  const { searchParams } = new URL(req.url);
  const weekId = searchParams.get("week");
  const league = searchParams.get("league");

  if (!weekId) {
    return NextResponse.json({ games: [] });
  }

  const where: Record<string, unknown> = { weekId };
  if (league) where.league = league;

  const games = await prisma.game.findMany({
    where,
    orderBy: [{ gameTime: "asc" }],
  });

  return NextResponse.json({ games });
}

export async function POST(req: NextRequest) {
  const { error, status } = await requireAdmin();
  if (error) return NextResponse.json({ error }, { status });

  const body = await req.json();
  const { weekId, league, awayTeam, homeTeam, spread, gameTime, isMondayNight } = body;

  if (!weekId || !league || !awayTeam || !homeTeam || !gameTime) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Get seasonId from week
  const week = await prisma.week.findUnique({ where: { id: weekId } });
  if (!week) {
    return NextResponse.json({ error: "Week not found" }, { status: 404 });
  }

  const game = await prisma.game.create({
    data: {
      seasonId: week.seasonId,
      weekId,
      league,
      awayTeam,
      homeTeam,
      spread: parseFloat(spread) || 0,
      gameTime: new Date(gameTime),
      isMondayNight: !!isMondayNight,
    },
  });

  return NextResponse.json({ game });
}

export async function PUT(req: NextRequest) {
  const { error, status } = await requireAdmin();
  if (error) return NextResponse.json({ error }, { status });

  const body = await req.json();
  const { id, awayTeam, homeTeam, spread, gameTime, isMondayNight } = body;

  if (!id) {
    return NextResponse.json({ error: "Game ID required" }, { status: 400 });
  }

  const game = await prisma.game.update({
    where: { id },
    data: {
      ...(awayTeam !== undefined && { awayTeam }),
      ...(homeTeam !== undefined && { homeTeam }),
      ...(spread !== undefined && { spread: parseFloat(spread) }),
      ...(gameTime !== undefined && { gameTime: new Date(gameTime) }),
      ...(isMondayNight !== undefined && { isMondayNight }),
    },
  });

  return NextResponse.json({ game });
}

export async function DELETE(req: NextRequest) {
  const { error, status } = await requireAdmin();
  if (error) return NextResponse.json({ error }, { status });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Game ID required" }, { status: 400 });
  }

  // Delete associated picks first
  await prisma.pick.deleteMany({ where: { gameId: id } });
  await prisma.game.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
