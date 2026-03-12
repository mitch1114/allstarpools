import { NextRequest, NextResponse } from "next/server";
import { hashSync } from "bcryptjs";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  const { name, email, playerCode, password, referral } = await req.json();

  if (!name || !email || !playerCode || !password) {
    return NextResponse.json(
      { error: "All fields are required." },
      { status: 400 }
    );
  }

  if (playerCode.length < 3) {
    return NextResponse.json(
      { error: "Player Code must be at least 3 characters." },
      { status: 400 }
    );
  }

  const existing = await prisma.user.findUnique({
    where: { playerCode },
  });

  if (existing) {
    return NextResponse.json(
      { error: "That Player Code is already taken." },
      { status: 400 }
    );
  }

  const hashed = hashSync(password, 10);

  await prisma.user.create({
    data: {
      name,
      email,
      playerCode,
      password: hashed,
      referral: referral || "",
    },
  });

  return NextResponse.json({ success: true });
}
