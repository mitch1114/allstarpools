import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compareSync } from "bcryptjs";
import { prisma } from "./db";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "Player Code",
      credentials: {
        playerCode: { label: "Player Code", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.playerCode || !credentials?.password) return null;

        // Case-insensitive player code lookup
        const inputCode = (credentials.playerCode as string).toLowerCase();
        const allUsers = await prisma.user.findMany({
          where: { playerCode: { not: "" } },
        });
        const user = allUsers.find(u => u.playerCode.toLowerCase() === inputCode) ?? null;

        if (!user) return null;

        const isValid = compareSync(
          credentials.password as string,
          user.password
        );
        if (!isValid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          playerCode: user.playerCode,
          isAdmin: user.isAdmin,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.playerCode = (user as Record<string, unknown>).playerCode;
        token.isAdmin = (user as Record<string, unknown>).isAdmin;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (session.user as any).playerCode = token.playerCode;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (session.user as any).isAdmin = token.isAdmin;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
});
