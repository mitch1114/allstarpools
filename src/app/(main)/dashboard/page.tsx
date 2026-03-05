"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

interface WeekSummary {
  weekNumber: number;
  points: number;
  ytd: number;
}

interface UserSummary {
  totalPoints: number;
  wins: number;
  losses: number;
  rank: number;
  totalPlayers: number;
  weeklyScores: WeekSummary[];
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [summary, setSummary] = useState<UserSummary | null>(null);

  useEffect(() => {
    fetch("/api/dashboard/summary")
      .then((r) => r.json())
      .then((data) => setSummary(data.summary || null))
      .catch(() => {});
  }, []);

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
          &#9733; ALL STAR POOLS &#9733;
        </h1>
        <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#88bbee" }}>
          NFL &amp; NCAAF Spread Pool
        </p>
      </div>

      {/* Welcome + Year Summary */}
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

        {summary && summary.weeklyScores.length > 0 ? (
          <div>
            {/* Stats Summary */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
                gap: "12px",
                marginBottom: "16px",
              }}
            >
              <div style={statBoxStyle}>
                <div style={statLabelStyle}>Rank</div>
                <div style={statValueStyle}>
                  #{summary.rank}
                  <span style={{ fontSize: "11px", color: "#999" }}> / {summary.totalPlayers}</span>
                </div>
              </div>
              <div style={statBoxStyle}>
                <div style={statLabelStyle}>YTD Points</div>
                <div style={{ ...statValueStyle, color: "#003366" }}>{summary.totalPoints}</div>
              </div>
              <div style={statBoxStyle}>
                <div style={statLabelStyle}>Record</div>
                <div style={statValueStyle}>
                  <span style={{ color: "#006600" }}>{summary.wins}W</span>
                  {" - "}
                  <span style={{ color: "#cc0000" }}>{summary.losses}L</span>
                </div>
              </div>
            </div>

            {/* Week-by-Week Table */}
            <div style={{ fontSize: "12px", fontWeight: "bold", color: "#003366", marginBottom: "6px" }}>
              Your Season Summary
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "11px" }}>
              <thead>
                <tr style={{ background: "#e8e8e0" }}>
                  <th style={innerThStyle}>Week</th>
                  <th style={innerThStyle}>Points</th>
                  <th style={innerThStyle}>YTD</th>
                </tr>
              </thead>
              <tbody>
                {summary.weeklyScores.map((ws) => (
                  <tr key={ws.weekNumber}>
                    <td style={innerTdStyle}>Wk {ws.weekNumber}</td>
                    <td
                      style={{
                        ...innerTdStyle,
                        textAlign: "center",
                        color: ws.points >= 0 ? "#006600" : "#cc0000",
                        fontWeight: "bold",
                      }}
                    >
                      {ws.points}
                    </td>
                    <td style={{ ...innerTdStyle, textAlign: "center", fontWeight: "bold" }}>
                      {ws.ytd}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ fontSize: "13px", lineHeight: "1.6", color: "#333" }}>
            <p style={{ marginTop: 0 }}>
              Welcome to <strong>All Star Pools</strong> &mdash; your home for NFL and
              NCAAF spread pool action!
            </p>

            <p>
              Hey everyone, Jeff here. Welcome back to another exciting season of
              All Star Pools! Whether you&apos;re a returning veteran or a first-time
              player, we&apos;re glad to have you. Good luck this season and remember
              &mdash; it&apos;s all about having fun and bragging rights!
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
                <li>Picks lock at game time &mdash; don&apos;t forget the Monday Night tiebreaker!</li>
                <li>Hot Picks are worth 2 points if correct, -1 if wrong</li>
                <li>Check the Rules page for full scoring details</li>
              </ul>
            </div>
          </div>
        )}
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
          { title: "Make Picks", desc: "Submit your weekly picks", href: "/picks", color: "#006600" },
          { title: "My Picks", desc: "Review your selections", href: "/my-picks", color: "#003366" },
          { title: "All Picks", desc: "See everyone's picks", href: "/all-picks", color: "#660066" },
          { title: "Standings", desc: "Check the leaderboard", href: "/standings", color: "#663300" },
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

const statBoxStyle: React.CSSProperties = {
  background: "#f8f8f4",
  border: "1px solid #eee",
  borderRadius: "4px",
  padding: "12px",
  textAlign: "center",
};

const statLabelStyle: React.CSSProperties = {
  fontSize: "10px",
  fontWeight: "bold",
  color: "#999",
  textTransform: "uppercase",
  marginBottom: "4px",
};

const statValueStyle: React.CSSProperties = {
  fontSize: "18px",
  fontWeight: "bold",
  color: "#333",
};

const innerThStyle: React.CSSProperties = {
  padding: "4px 12px",
  textAlign: "left",
  fontSize: "10px",
  fontWeight: "bold",
  color: "#666",
  borderBottom: "1px solid #ddd",
};

const innerTdStyle: React.CSSProperties = {
  padding: "3px 12px",
  borderBottom: "1px solid #eee",
};
