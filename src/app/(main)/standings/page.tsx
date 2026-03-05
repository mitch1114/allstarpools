"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

interface WeekScore {
  weekId: string;
  weekNumber: number;
  points: number;
  ytd: number;
}

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
  weeklyScores: WeekScore[];
}

interface WeekInfo {
  id: string;
  number: number;
  label: string;
}

export default function StandingsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const weekId = searchParams.get("week") || "";

  const [standings, setStandings] = useState<Standing[]>([]);
  const [weeks, setWeeks] = useState<WeekInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"combined" | "NFL" | "NCAAF">("combined");
  const [expandedPlayer, setExpandedPlayer] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    const params = viewMode === "combined" ? "" : `?league=${viewMode}`;
    fetch(`/api/standings${params}`)
      .then((r) => r.json())
      .then((data) => {
        setStandings(data.standings || []);
        setWeeks(data.weeks || []);
        setLoading(false);
      });
  }, [viewMode]);

  function togglePlayer(playerId: string) {
    setExpandedPlayer(expandedPlayer === playerId ? null : playerId);
  }

  return (
    <div style={{ fontFamily: "Verdana, Geneva, sans-serif" }}>
      <div
        style={{
          background: "#003366",
          color: "#fff",
          padding: "12px 16px",
          borderRadius: "4px 4px 0 0",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h2 style={{ margin: 0, fontSize: "18px" }}>
          {viewMode === "combined" ? "Combined" : viewMode} Standings
        </h2>
        <div style={{ display: "flex", gap: "4px" }}>
          {(["combined", "NFL", "NCAAF"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              style={{
                padding: "4px 10px",
                background: viewMode === mode ? "#fff" : "transparent",
                color: viewMode === mode ? "#003366" : "#88bbee",
                border: "1px solid #88bbee",
                borderRadius: "2px",
                fontSize: "10px",
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              {mode === "combined" ? "ALL" : mode}
            </button>
          ))}
        </div>
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
              <th style={thStyle}>Pct</th>
              <th style={thStyle}>Weekly</th>
              <th style={thStyle}>YTD</th>
              <th style={thStyle}>Best Wk</th>
              <th style={thStyle}>Worst Wk</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((s, idx) => {
              const latestWeek = s.weeklyScores.length > 0
                ? s.weeklyScores[s.weeklyScores.length - 1]
                : null;
              const isExpanded = expandedPlayer === s.id;

              return (
                <>
                  <tr
                    key={s.id}
                    onClick={() => togglePlayer(s.id)}
                    style={{
                      background:
                        idx === 0
                          ? "#fffff0"
                          : idx % 2 === 0
                            ? "#fff"
                            : "#fafaf5",
                      cursor: "pointer",
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
                      {idx === 0 && " \u2605"}
                    </td>
                    <td style={{ ...tdStyle, fontWeight: "bold", color: "#003366" }}>
                      <Link
                        href={`/all-picks?week=${weekId}&userId=${s.id}`}
                        onClick={(e) => e.stopPropagation()}
                        style={{ color: "#003366", textDecoration: "underline" }}
                      >
                        {s.name}
                      </Link>
                      <span style={{ fontSize: "9px", color: "#999", marginLeft: "4px" }}>
                        {isExpanded ? "\u25B2" : "\u25BC"}
                      </span>
                    </td>
                    <td style={{ ...tdStyle, textAlign: "center", color: "#006600" }}>
                      {s.wins}
                    </td>
                    <td style={{ ...tdStyle, textAlign: "center", color: "#cc0000" }}>
                      {s.losses}
                    </td>
                    <td style={{ ...tdStyle, textAlign: "center", fontWeight: "bold" }}>
                      {s.pct.toFixed(3)}
                    </td>
                    <td style={{ ...tdStyle, textAlign: "center", color: "#333" }}>
                      {latestWeek ? latestWeek.points : "-"}
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
                    <td style={{ ...tdStyle, textAlign: "center", color: "#006600" }}>
                      {s.bestWeek}
                    </td>
                    <td style={{ ...tdStyle, textAlign: "center", color: "#cc0000" }}>
                      {s.worstWeek}
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr key={`${s.id}-detail`}>
                      <td colSpan={9} style={{ padding: "0", background: "#f8f8f4" }}>
                        <div style={{ padding: "8px 16px", overflowX: "auto" }}>
                          <div style={{ fontSize: "11px", fontWeight: "bold", color: "#003366", marginBottom: "6px" }}>
                            {s.name} — Week-by-Week
                          </div>
                          <table style={{ borderCollapse: "collapse", fontSize: "11px", width: "100%" }}>
                            <thead>
                              <tr>
                                <th style={innerThStyle}>Week</th>
                                <th style={innerThStyle}>Points</th>
                                <th style={innerThStyle}>YTD</th>
                              </tr>
                            </thead>
                            <tbody>
                              {s.weeklyScores.map((ws) => (
                                <tr key={ws.weekId}>
                                  <td style={innerTdStyle}>Wk {ws.weekNumber}</td>
                                  <td style={{ ...innerTdStyle, textAlign: "center", color: ws.points >= 0 ? "#006600" : "#cc0000", fontWeight: "bold" }}>
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
                      </td>
                    </tr>
                  )}
                </>
              );
            })}
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
        Sorted by total points. Click a player name to view their picks, or click the row to expand weekly breakdown.
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
