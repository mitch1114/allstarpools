import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";

export async function GET(req: NextRequest) {
  const { error, status } = await requireAdmin();
  if (error) return NextResponse.json({ error }, { status });

  const { searchParams } = new URL(req.url);
  const weekId = searchParams.get("week");

  if (!weekId) {
    return NextResponse.json({ prizes: [] });
  }

  const prizes = await prisma.weeklyPrize.findMany({
    where: { weekId },
    include: {
      week: { select: { label: true } },
    },
  });

  // Get all users for the dropdown
  const users = await prisma.user.findMany({
    select: { id: true, name: true, playerCode: true },
    orderBy: { name: "asc" },
  });

  return NextResponse.json({ prizes, users });
}

export async function POST(req: NextRequest) {
  const { error, status } = await requireAdmin();
  if (error) return NextResponse.json({ error }, { status });

  const { weekId, userId, amount, note } = await req.json();

  if (!weekId || !userId || amount === undefined) {
    return NextResponse.json({ error: "weekId, userId, and amount are required" }, { status: 400 });
  }

  const prize = await prisma.weeklyPrize.upsert({
    where: {
      weekId_userId: { weekId, userId },
    },
    update: {
      amount: parseFloat(amount),
      note: note || "",
    },
    create: {
      weekId,
      userId,
      amount: parseFloat(amount),
      note: note || "",
    },
  });

  return NextResponse.json({ prize });
}

export async function DELETE(req: NextRequest) {
  const { error, status } = await requireAdmin();
  if (error) return NextResponse.json({ error }, { status });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Prize ID required" }, { status: 400 });
  }

  await prisma.weeklyPrize.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
