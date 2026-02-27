import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";
import { hashSync } from "bcryptjs";

export async function GET() {
  const { error, status } = await requireAdmin();
  if (error) return NextResponse.json({ error }, { status });

  const players = await prisma.user.findMany({
    select: {
      id: true,
      playerCode: true,
      name: true,
      email: true,
      isAdmin: true,
      createdAt: true,
      _count: { select: { picks: true } },
    },
    orderBy: { name: "asc" },
  });

  return NextResponse.json({ players });
}

export async function PUT(req: NextRequest) {
  const { error, status } = await requireAdmin();
  if (error) return NextResponse.json({ error }, { status });

  const body = await req.json();
  const { id, name, isAdmin, resetPassword } = body;

  if (!id) {
    return NextResponse.json({ error: "Player ID required" }, { status: 400 });
  }

  const updateData: Record<string, unknown> = {};
  if (name !== undefined) updateData.name = name;
  if (isAdmin !== undefined) updateData.isAdmin = isAdmin;
  if (resetPassword) {
    updateData.password = hashSync(resetPassword, 10);
  }

  const player = await prisma.user.update({
    where: { id },
    data: updateData,
    select: { id: true, name: true, playerCode: true, isAdmin: true },
  });

  return NextResponse.json({ player });
}

export async function DELETE(req: NextRequest) {
  const { error, status } = await requireAdmin();
  if (error) return NextResponse.json({ error }, { status });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Player ID required" }, { status: 400 });
  }

  // Delete picks first, then user
  await prisma.pick.deleteMany({ where: { userId: id } });
  await prisma.user.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
