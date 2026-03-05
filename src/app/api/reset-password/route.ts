import { NextRequest, NextResponse } from "next/server";
import { hashSync } from "bcryptjs";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  const { token, password } = await req.json();

  if (!token || !password) {
    return NextResponse.json(
      { error: "Token and password are required." },
      { status: 400 }
    );
  }

  if (password.length < 4) {
    return NextResponse.json(
      { error: "Password must be at least 4 characters." },
      { status: 400 }
    );
  }

  const resetRecord = await prisma.passwordReset.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!resetRecord || resetRecord.used || resetRecord.expiresAt < new Date()) {
    return NextResponse.json(
      { error: "Invalid or expired reset link." },
      { status: 400 }
    );
  }

  const hashed = hashSync(password, 10);

  await prisma.user.update({
    where: { id: resetRecord.userId },
    data: { password: hashed },
  });

  await prisma.passwordReset.update({
    where: { id: resetRecord.id },
    data: { used: true },
  });

  return NextResponse.json({
    success: true,
    playerCode: resetRecord.user.playerCode,
  });
}
