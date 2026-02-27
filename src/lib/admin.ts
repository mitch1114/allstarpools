import { auth } from "./auth";

export async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Not authenticated", status: 401, session: null };
  }
  if (!(session.user as Record<string, unknown>).isAdmin) {
    return { error: "Not authorized", status: 403, session: null };
  }
  return { error: null, status: 200, session };
}
