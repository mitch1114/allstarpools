import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const season = await prisma.season.findFirst({
    where: { isActive: true },
  });

  if (!season) {
    return NextResponse.json({ weeks: [], activeWeek: null });
  }

  const weeks = await prisma.week.findMany({
    where: { seasonId: season.id },
    orderBy: { number: "asc" },
    select: { id: true, number: true, label: true, isActive: true },
  });

  const activeWeek = weeks.find((w) => w.isActive);

  return NextResponse.json({
    weeks,
    activeWeek: activeWeek?.id || null,
  });
}
