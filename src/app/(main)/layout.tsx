import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import Sidebar from "@/components/Sidebar";
import SessionProvider from "@/components/SessionProvider";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return (
    <SessionProvider>
      <div
        style={{
          display: "flex",
          minHeight: "100vh",
          fontFamily: "Verdana, Geneva, sans-serif",
        }}
      >
        <Sidebar />
        <main
          style={{
            flex: 1,
            background: "#f5f5f0",
            padding: "20px",
            minHeight: "100vh",
          }}
        >
          {children}
        </main>
      </div>
    </SessionProvider>
  );
}
