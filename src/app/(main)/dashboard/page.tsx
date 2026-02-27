import { auth } from "@/lib/auth";

export default async function DashboardPage() {
  const session = await auth();

  return (
    <div style={{ fontFamily: "Verdana, Geneva, sans-serif" }}>
      {/* Header Banner */}
      <div
        style={{
          background: "#003366",
          color: "#fff",
          padding: "16px 20px",
          borderRadius: "4px",
          marginBottom: "20px",
        }}
      >
        <h1 style={{ margin: 0, fontSize: "22px" }}>
          ★ ALL STAR POOLS ★
        </h1>
        <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#88bbee" }}>
          NFL &amp; NCAAF Spread Pool
        </p>
      </div>

      {/* Welcome Message */}
      <div
        style={{
          background: "#fff",
          border: "1px solid #ccc",
          borderRadius: "4px",
          padding: "20px",
          marginBottom: "20px",
        }}
      >
        <h2
          style={{
            color: "#003366",
            fontSize: "16px",
            marginTop: 0,
            marginBottom: "12px",
            borderBottom: "2px solid #003366",
            paddingBottom: "8px",
          }}
        >
          Welcome, {session?.user?.name}!
        </h2>

        <div style={{ fontSize: "13px", lineHeight: "1.6", color: "#333" }}>
          <p style={{ marginTop: 0 }}>
            Welcome to <strong>All Star Pools</strong> — your home for NFL and
            NCAAF spread pool action!
          </p>

          <p>
            Hey everyone, Jeff here. Welcome back to another exciting season of
            All Star Pools! Whether you&apos;re a returning veteran or a first-time
            player, we&apos;re glad to have you. Good luck this season and remember
            — it&apos;s all about having fun and bragging rights!
          </p>

          <div
            style={{
              background: "#fffff0",
              border: "1px solid #eee8aa",
              padding: "12px",
              borderRadius: "4px",
              marginTop: "12px",
            }}
          >
            <strong style={{ color: "#666600" }}>Quick Reminders:</strong>
            <ul style={{ margin: "8px 0 0", paddingLeft: "20px" }}>
              <li>Games/Spreads are typically posted Tuesday nights</li>
              <li>Pick 10 NFL games and 10 NCAAF games each week (7 regular + 3 Hot Picks each)</li>
              <li>Picks lock at game time — don&apos;t forget the Monday Night tiebreaker!</li>
              <li>Hot Picks are worth 2 points if correct, -1 if wrong</li>
              <li>Check the Rules page for full scoring details</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "12px",
        }}
      >
        {[
          {
            title: "Make Picks",
            desc: "Submit your weekly picks",
            href: "/picks",
            color: "#006600",
          },
          {
            title: "My Picks",
            desc: "Review your selections",
            href: "/my-picks",
            color: "#003366",
          },
          {
            title: "All Picks",
            desc: "See everyone's picks",
            href: "/all-picks",
            color: "#660066",
          },
          {
            title: "Standings",
            desc: "Check the leaderboard",
            href: "/standings",
            color: "#663300",
          },
        ].map((link) => (
          <a
            key={link.href}
            href={link.href}
            style={{
              display: "block",
              background: "#fff",
              border: "1px solid #ccc",
              borderRadius: "4px",
              padding: "14px",
              textDecoration: "none",
              borderLeft: `4px solid ${link.color}`,
            }}
          >
            <div
              style={{
                fontSize: "14px",
                fontWeight: "bold",
                color: link.color,
                marginBottom: "4px",
              }}
            >
              {link.title}
            </div>
            <div style={{ fontSize: "11px", color: "#666" }}>{link.desc}</div>
          </a>
        ))}
      </div>
    </div>
  );
}
