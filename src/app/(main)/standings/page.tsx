"use client";

import { Fragment, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
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
  bestPotential: number;
  worstPotential: number;
  gamesPlayed: number;
  weeklyScores: WeekScore[];
  totalCash: number;
}

interface WeekInfo {
  id: string;
  number: number;
  label: string;
}

type SortField = "weekly" | "ytd" | "bestPotential" | "worstPotential" | "pct" | "totalCash";

export default function StandingsPage() {
  const searchParams = useSearchParams();
  const weekId = searchParams.get("week") || "";

  const [standings, setStandings] = useState<Standing[]>([]);
  const [weeks, setWeeks] = useState<WeekInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"combined" | "NCAAF" | "NFL">("combined");
  const [expandedPlayer, setExpandedPlayer] = useState<string | null>(null);
  const [selectedWeekId, setSelectedWeekId] = useState("");
  const [sortField, setSortField] = useState<SortField>("weekly");
  const [sortAsc, setSortAsc] = useState(false);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (viewMode !== "combined") params.set("league", viewMode);
    if (selectedWeekId) params.set("week", selectedWeekId);
    const qs = params.toString();
    fetch(`/api/standings${qs ? `?${qs}` : ""}`)
      .then((r) => r.json())
      .then((data) => {
        setStandings(data.standings || []);
        setWeeks(data.weeks || []);
        setLoading(false);
      });
  }, [viewMode, selectedWeekId]);

  useEffect(() => {
    if (weekId && !selectedWeekId) {
      setSelectedWeekId(weekId);
    }
  }, [weekId, selectedWeekId]);

  function getWeeklyPoints(s: Standing): number {
    if (!selectedWeekId) {
      return s.weeklyScores.length > 0 ? s.weeklyScores[s.weeklyScores.length - 1].points : 0;
    }
    const ws = s.weeklyScores.find((w) => w.weekId === selectedWeekId);
    return ws ? ws.points : 0;
  }

  function getYTD(s: Standing): number {
    if (!selectedWeekId) return s.totalPoints;
    const ws = s.weeklyScores.find((w) => w.weekId === selectedWeekId);
    return ws ? ws.ytd : 0;
  }

  function handleSort(field: SortField) {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  }

  function getSortValue(s: Standing, field: SortField): number {
    switch (field) {
      case "weekly": return getWeeklyPoints(s);
      case "ytd": return getYTD(s);
      case "bestPotential": return s.bestPotential;
      case "worstPotential": return s.worstPotential;
      case "pct": return s.pct;
      case "totalCash": return s.totalCash;
    }
  }

  const sortedStandings = [...standings].sort((a, b) => {
    const aVal = getSortValue(a, sortField);
    const bVal = getSortValue(b, sortField);
    return sortAsc ? aVal - bVal : bVal - aVal;
  });

  function togglePlayer(playerId: string) {
    setExpandedPlayer(expandedPlayer === playerId ? null : playerId);
  }

  const sortIndicator = (field: SortField) => {
    if (sortField !== field) return "";
    return sortAsc ? " \u25B2" : " \u25BC";
  };

  const sortableThStyle = (field: SortField): React.CSSProperties => ({
    ...thStyle,
    cursor: "pointer",
    userSelect: "none",
    background: sortField === field ? "#d8d8d0" : "#e8e8e0",
  });

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
          flexWrap: "wrap",
          gap: "8px",
        }}
      >
        <h2 style={{ margin: 0, fontSize: "18px" }}>
          {viewMode === "combined" ? "Combined" : viewMode} Standings
        </h2>
        <div style={{ display: "flex", gap: "4px" }}>
          {(["combined", "NCAAF", "NFL"] as const).map((mode) => (
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

      {/* Week selector */}
      <div
        style={{
          background: "#f5f5f0",
          border: "1px solid #ccc",
          borderTop: "none",
          padding: "8px 16px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          fontSize: "12px",
          flexWrap: "wrap",
        }}
      >
        <label style={{ fontWeight: "bold", color: "#333" }}>Week:</label>
        <select
          value={selectedWeekId}
          onChange={(e) => setSelectedWeekId(e.target.value)}
          style={{
            padding: "4px 8px",
            border: "1px solid #999",
            borderRadius: "2px",
            fontSize: "12px",
          }}
        >
          <option value="">Latest</option>
          {weeks.map((w) => (
            <option key={w.id} value={w.id}>
              {w.label}
            </option>
          ))}
        </select>
        <span style={{ fontSize: "10px", color: "#888" }}>
          Weekly points for selected week + cumulative YTD
        </span>
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
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              background: "#fff",
              border: "1px solid #ccc",
              fontSize: "12px",
              minWidth: "750px",
            }}
          >
            <thead>
              <tr style={{ background: "#e8e8e0" }}>
                <th style={thStyle}>#</th>
                <th style={{ ...thStyle, textAlign: "left" }}>Player</th>
                <th style={sortableThStyle("weekly")} onClick={() => handleSort("weekly")}>
                  Weekly{sortIndicator("weekly")}
                </th>
                <th style={sortableThStyle("ytd")} onClick={() => handleSort("ytd")}>
                  YTD{sortIndicator("ytd")}
                </th>
                <th style={sortableThStyle("bestPotential")} onClick={() => handleSort("bestPotential")}>
                  Best Pot.{sortIndicator("bestPotential")}
                </th>
                <th style={sortableThStyle("worstPotential")} onClick={() => handleSort("worstPotential")}>
                  Worst Pot.{sortIndicator("worstPotential")}
                </th>
                <th style={thStyle}>W</th>
                <th style={thStyle}>L</th>
                <th style={sortableThStyle("pct")} onClick={() => handleSort("pct")}>
                  Pct{sortIndicator("pct")}
                </th>
                <th style={sortableThStyle("totalCash")} onClick={() => handleSort("totalCash")}>
                  Total Cash{sortIndicator("totalCash")}
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedStandings.map((s, idx) => {
                const isExpanded = expandedPlayer === s.id;

                return (
                  <Fragment key={s.id}>
                    <tr
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
                          href={`/player-picks/${s.id}?week=${selectedWeekId || weekId}`}
                          onClick={(e) => e.stopPropagation()}
                          style={{ color: "#003366", textDecoration: "underline" }}
                        >
                          {s.name}
                        </Link>
                        <span style={{ fontSize: "9px", color: "#999", marginLeft: "4px" }}>
                          {isExpanded ? "\u25B2" : "\u25BC"}
                        </span>
                      </td>
                      <td style={{ ...tdStyle, textAlign: "center", fontWeight: "bold", color: "#333" }}>
                        {getWeeklyPoints(s)}
                      </td>
                      <td
                        style={{
                          ...tdStyle,
                          textAlign: "center",
                          fontWeight: "bold",
                          color: "#003366",
                        }}
                      >
                        {getYTD(s)}
                      </td>
                      <td style={{ ...tdStyle, textAlign: "center", color: "#006600" }}>
                        {s.bestPotential}
                      </td>
                      <td style={{ ...tdStyle, textAlign: "center", color: "#cc0000" }}>
                        {s.worstPotential}
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
                      <td style={{ ...tdStyle, textAlign: "center", color: s.totalCash > 0 ? "#006600" : "#999", fontWeight: s.totalCash > 0 ? "bold" : "normal" }}>
                        {s.totalCash > 0 ? `$${s.totalCash.toFixed(0)}` : "-"}
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr>
                        <td colSpan={10} style={{ padding: "0", background: "#f8f8f4" }}>
                          <div style={{ padding: "8px 16px", overflowX: "auto" }}>
                            <div style={{ fontSize: "11px", fontWeight: "bold", color: "#003366", marginBottom: "6px" }}>
                              {s.name} — Week-by-Week
                            </div>
                            <table style={{ borderCollapse: "collapse", fontSize: "11px", width: "100%" }}>
                              <thead>
                                <tr>
                                  <th style={innerThStyle}>Week</th>
                                  <th style={{ ...innerThStyle, textAlign: "center" }}>Points</th>
                                  <th style={{ ...innerThStyle, textAlign: "center" }}>YTD</th>
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
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
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
        Click column headers to sort. Click a player name to view their picks, or click the row to expand weekly breakdown.
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
