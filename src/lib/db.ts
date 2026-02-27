import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// On Vercel, the filesystem is read-only except /tmp.
// Copy the pre-seeded SQLite DB to /tmp so Prisma can use it.
if (process.env.VERCEL && !fs.existsSync("/tmp/dev.db")) {
  // Prisma resolves file:./dev.db relative to the schema (prisma/)
  const source = path.join(process.cwd(), "prisma", "dev.db");
  if (fs.existsSync(source)) {
    fs.copyFileSync(source, "/tmp/dev.db");
  }
}

const databaseUrl = process.env.VERCEL
  ? "file:/tmp/dev.db"
  : process.env.DATABASE_URL;

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: { db: { url: databaseUrl } },
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
