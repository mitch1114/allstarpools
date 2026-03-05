import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const year = searchParams.get("year");

  if (!year) {
    return NextResponse.json({ standings: [] });
  }

  const season = await prisma.season.findFirst({
    where: { year: parseInt(year) },
  });

  if (!season) {
    return NextResponse.json({ standings: [] });
  }

  const users = await prisma.user.findMany({
    select: { id: true, name: true, playerCode: true },
  });

  const picks = await prisma.pick.findMany({
    where: {
      game: { seasonId: season.id, isFinal: true },
      points: { not: null },
    },
  });

  const standings = users.map((user) => {
    const userPicks = picks.filter((p) => p.userId === user.id);
    let wins = 0;
    let losses = 0;
    let totalPoints = 0;

    for (const pick of userPicks) {
      const pts = pick.points ?? 0;
      totalPoints += pts;
      if (pts > 0) wins++;
      else losses++;
    }

    return {
      name: user.name,
      playerCode: user.playerCode,
      totalPoints,
      wins,
      losses,
    };
  });

  standings.sort((a, b) => b.totalPoints - a.totalPoints);
  const activeStandings = standings.filter((s) => s.wins + s.losses > 0);

  return NextResponse.json({ standings: activeStandings });
}
