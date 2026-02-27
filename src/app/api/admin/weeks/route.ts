import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";

export async function PUT(req: NextRequest) {
  const { error, status } = await requireAdmin();
  if (error) return NextResponse.json({ error }, { status });

  const { weekId } = await req.json();

  if (!weekId) {
    return NextResponse.json({ error: "Week ID required" }, { status: 400 });
  }

  const week = await prisma.week.findUnique({ where: { id: weekId } });
  if (!week) {
    return NextResponse.json({ error: "Week not found" }, { status: 404 });
  }

  // Deactivate all weeks in this season, then activate the selected one
  await prisma.week.updateMany({
    where: { seasonId: week.seasonId },
    data: { isActive: false },
  });

  await prisma.week.update({
    where: { id: weekId },
    data: { isActive: true },
  });

  return NextResponse.json({ success: true });
}
