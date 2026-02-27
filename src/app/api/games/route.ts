import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const weekId = searchParams.get("week");
  const league = searchParams.get("league");

  if (!weekId) {
    return NextResponse.json({ games: [] });
  }

  const where: Record<string, unknown> = { weekId };
  if (league) {
    where.league = league;
  }

  const games = await prisma.game.findMany({
    where,
    orderBy: [{ gameTime: "asc" }, { id: "asc" }],
  });

  return NextResponse.json({ games });
}
