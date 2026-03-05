import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { randomBytes } from "crypto";

export async function POST(req: NextRequest) {
  const { email } = await req.json();

  if (!email) {
    return NextResponse.json(
      { error: "Email is required." },
      { status: 400 }
    );
  }

  // Find user by email (case-insensitive)
  const users = await prisma.user.findMany();
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

  // Always return success to prevent email enumeration
  if (!user) {
    return NextResponse.json({ success: true });
  }

  // Generate token
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  // Invalidate any existing tokens for this user
  await prisma.passwordReset.updateMany({
    where: { userId: user.id, used: false },
    data: { used: true },
  });

  await prisma.passwordReset.create({
    data: {
      userId: user.id,
      token,
      expiresAt,
    },
  });

  // In production, send an email here. For now, log the reset link.
  // TODO: Integrate with an email service (e.g., Resend, SendGrid, Nodemailer)
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const resetUrl = `${baseUrl}/reset-password?token=${token}`;
  console.log(`[Password Reset] Player: ${user.playerCode}, Email: ${user.email}`);
  console.log(`[Password Reset] Link: ${resetUrl}`);

  return NextResponse.json({
    success: true,
    message: "If an account exists with that email, a reset link has been sent.",
  });
}
