"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

interface Standing {
  id: string;
  name: string;
  playerCode: string;
  wins: number;
  losses: number;
  ties: number;
  pct: number;
  totalPoints: number;
  bestWeek: number;
  worstWeek: number;
  gamesPlayed: number;
}

export default function StandingsPage() {
  const searchParams = useSearchParams();
  const league = searchParams.get("league") || "NFL";
  const [standings, setStandings] = useState<Standing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/standings?league=${league}`)
      .then((r) => r.json())
      .then((data) => {
        setStandings(data.standings || []);
        setLoading(false);
      });
  }, [league]);

  return (
    <div style={{ fontFamily: "Verdana, Geneva, sans-serif" }}>
      <div
        style={{
          background: "#003366",
          color: "#fff",
          padding: "12px 16px",
          borderRadius: "4px 4px 0 0",
        }}
      >
        <h2 style={{ margin: 0, fontSize: "18px" }}>
          {league} Standings
        </h2>
      </div>

      {loading ? (
        <div style={{ padding: "20px", background: "#fff", border: "1px solid #ccc" }}>
          Loading...
        </div>
      ) : standings.length === 0 ? (
        <div
          style={{
            padding: "20px",
            background: "#fff",
            border: "1px solid #ccc",
            borderTop: "none",
            textAlign: "center",
            color: "#666",
          }}
        >
          No standings data available yet.
        </div>
      ) : (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            background: "#fff",
            border: "1px solid #ccc",
            fontSize: "12px",
          }}
        >
          <thead>
            <tr style={{ background: "#e8e8e0" }}>
              <th style={thStyle}>#</th>
              <th style={{ ...thStyle, textAlign: "left" }}>Player</th>
              <th style={thStyle}>W</th>
              <th style={thStyle}>L</th>
              <th style={thStyle}>T</th>
              <th style={thStyle}>Pct</th>
              <th style={thStyle}>Points</th>
              <th style={thStyle}>Best Wk</th>
              <th style={thStyle}>Worst Wk</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((s, idx) => (
              <tr
                key={s.id}
                style={{
                  background:
                    idx === 0
                      ? "#fffff0"
                      : idx % 2 === 0
                        ? "#fff"
                        : "#fafaf5",
                }}
              >
                <td
                  style={{
                    ...tdStyle,
                    textAlign: "center",
                    fontWeight: "bold",
                    color: idx === 0 ? "#cc8800" : "#666",
                  }}
                >
                  {idx + 1}
                  {idx === 0 && " ★"}
                </td>
                <td style={{ ...tdStyle, fontWeight: "bold", color: "#003366" }}>
                  {s.name}
                </td>
                <td style={{ ...tdStyle, textAlign: "center", color: "#006600" }}>
                  {s.wins}
                </td>
                <td style={{ ...tdStyle, textAlign: "center", color: "#cc0000" }}>
                  {s.losses}
                </td>
                <td style={{ ...tdStyle, textAlign: "center", color: "#999" }}>
                  {s.ties}
                </td>
                <td style={{ ...tdStyle, textAlign: "center", fontWeight: "bold" }}>
                  {s.pct.toFixed(3)}
                </td>
                <td
                  style={{
                    ...tdStyle,
                    textAlign: "center",
                    fontWeight: "bold",
                    color: "#003366",
                  }}
                >
                  {s.totalPoints}
                </td>
                <td
                  style={{
                    ...tdStyle,
                    textAlign: "center",
                    color: "#006600",
                  }}
                >
                  {s.bestWeek}
                </td>
                <td
                  style={{
                    ...tdStyle,
                    textAlign: "center",
                    color: "#cc0000",
                  }}
                >
                  {s.worstWeek}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div
        style={{
          background: "#fff",
          border: "1px solid #ccc",
          borderTop: "none",
          padding: "8px 16px",
          borderRadius: "0 0 4px 4px",
          fontSize: "10px",
          color: "#999",
        }}
      >
        Sorted by total points. Pct = Win percentage (Wins / Total Games).
      </div>
    </div>
  );
}

const thStyle: React.CSSProperties = {
  padding: "8px 10px",
  textAlign: "center",
  fontSize: "11px",
  fontWeight: "bold",
  color: "#333",
  borderBottom: "2px solid #ccc",
};

const tdStyle: React.CSSProperties = {
  padding: "8px 10px",
  borderBottom: "1px solid #eee",
};
