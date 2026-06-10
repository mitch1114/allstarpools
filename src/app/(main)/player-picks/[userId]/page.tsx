"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";

interface Pick {
  id: string;
  selection: string;
  isHotPick: boolean;
  points: number | null;
  game: {
    id: string;
    league: string;
    awayTeam: string;
    homeTeam: string;
    spread: number;
    gameTime: string;
    awayScore: number | null;
    homeScore: number | null;
    isFinal: boolean;
  };
}

interface WeekOption {
  id: string;
  number: number;
  label: string;
}

export default function PlayerPicksPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const userId = params.userId as string;
  const weekId = searchParams.get("week") || "";

  const [picks, setPicks] = useState<Pick[]>([]);
  const [playerName, setPlayerName] = useState("");
  const [weeks, setWeeks] = useState<WeekOption[]>([]);
  const [selectedWeek, setSelectedWeek] = useState(weekId);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/weeks")
      .then((r) => r.json())
      .then((data) => {
        setWeeks(data.weeks || []);
        if (!selectedWeek && data.activeWeek) {
          setSelectedWeek(data.activeWeek);
        }
      });
  }, []);

  useEffect(() => {
    if (!selectedWeek || !userId) return;
    setLoading(true);

    fetch(`/api/picks?week=${selectedWeek}&userId=${userId}`)
      .then((r) => r.json())
      .then((data) => {
        setPicks(data.picks || []);
        setLoading(false);
      });

  }, [selectedWeek, userId]);

  useEffect(() => {
    if (!userId) return;
    fetch(`/api/players/${userId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.player) setPlayerName(data.player.name);
      })
      .catch(() => {});
  }, [userId]);

  const nflPicks = picks.filter((p) => p.game.league === "NFL");
  const ncaafPicks = picks.filter((p) => p.game.league === "NCAAF");

  function getSpreadLabel(game: Pick["game"], side: string) {
    if (game.spread === 0) return "PK";
    if (side === "home") {
      return game.spread < 0 ? `(${game.spread})` : `(+${game.spread})`;
    }
    return game.spread > 0 ? `(-${game.spread})` : `(+${Math.abs(game.spread)})`;
  }

  function renderPicksTable(leaguePicks: Pick[], league: string) {
    if (leaguePicks.length === 0) {
      return <p style={{ color: "#999", fontSize: "12px", padding: "8px" }}>No {league} picks for this week.</p>;
    }

    const totalPoints = leaguePicks.reduce((sum, p) => sum + (p.points ?? 0), 0);

    return (
      <div style={{ marginBottom: "16px" }}>
        <div style={{ fontSize: "13px", fontWeight: "bold", color: "#003366", padding: "8px 0 4px" }}>
          {league} ({leaguePicks.length} picks, {totalPoints} pts)
        </div>
        <div className="table-scroll">
        <table style={{ width: "100%", minWidth: "520px", borderCollapse: "collapse", fontSize: "12px" }}>
          <thead>
            <tr style={{ background: "#e8e8e0" }}>
              <th style={thStyle}>Matchup</th>
              <th style={thStyle}>Spread</th>
              <th style={thStyle}>Pick</th>
              <th style={thStyle}>HP</th>
              <th style={thStyle}>Score</th>
              <th style={thStyle}>Pts</th>
            </tr>
          </thead>
          <tbody>
            {leaguePicks.map((pick) => {
              const g = pick.game;
              const pickedTeam = pick.selection === "home" ? g.homeTeam : g.awayTeam;

              return (
                <tr key={pick.id} style={{ background: pick.isHotPick ? "#fff8e0" : "#fff" }}>
                  <td style={tdStyle}>
                    {g.awayTeam} @ {g.homeTeam}
                  </td>
                  <td style={{ ...tdStyle, textAlign: "center", color: "#660000" }}>
                    {getSpreadLabel(g, "home")}
                  </td>
                  <td style={{ ...tdStyle, fontWeight: "bold", color: "#003366" }}>
                    {pickedTeam}
                  </td>
                  <td style={{ ...tdStyle, textAlign: "center" }}>
                    {pick.isHotPick ? "🔥" : ""}
                  </td>
                  <td style={{ ...tdStyle, textAlign: "center", fontSize: "11px" }}>
                    {g.isFinal ? `${g.awayScore} - ${g.homeScore}` : "-"}
                  </td>
                  <td style={{
                    ...tdStyle,
                    textAlign: "center",
                    fontWeight: "bold",
                    color: pick.points === null ? "#999" : (pick.points ?? 0) > 0 ? "#006600" : "#cc0000",
                  }}>
                    {pick.points !== null ? pick.points : "-"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        </div>
      </div>
    );
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
          flexWrap: "wrap",
          gap: "8px",
        }}
      >
        <h2 style={{ margin: 0, fontSize: "18px" }}>
          {playerName || "Player"}&apos;s Picks
        </h2>
        <Link
          href="/standings"
          style={{ color: "#88bbee", fontSize: "12px", textDecoration: "underline" }}
        >
          Back to Standings
        </Link>
      </div>

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
        }}
      >
        <label style={{ fontWeight: "bold", color: "#333" }}>Week:</label>
        <select
          value={selectedWeek}
          onChange={(e) => setSelectedWeek(e.target.value)}
          style={{
            padding: "4px 8px",
            border: "1px solid #999",
            borderRadius: "2px",
            fontSize: "12px",
          }}
        >
          <option value="">Select Week</option>
          {weeks.map((w) => (
            <option key={w.id} value={w.id}>
              {w.label}
            </option>
          ))}
        </select>
      </div>

      <div
        style={{
          background: "#fff",
          border: "1px solid #ccc",
          borderTop: "none",
          padding: "12px 16px",
          borderRadius: "0 0 4px 4px",
        }}
      >
        {loading ? (
          <p style={{ color: "#666" }}>Loading...</p>
        ) : picks.length === 0 ? (
          <p style={{ color: "#999", fontSize: "12px" }}>No picks found for this player/week.</p>
        ) : (
          <>
            {renderPicksTable(ncaafPicks, "NCAAF")}
            {renderPicksTable(nflPicks, "NFL")}
          </>
        )}
      </div>
    </div>
  );
}

const thStyle: React.CSSProperties = {
  padding: "6px 10px",
  textAlign: "left",
  fontSize: "11px",
  fontWeight: "bold",
  borderBottom: "2px solid #ccc",
};

const tdStyle: React.CSSProperties = {
  padding: "6px 10px",
  borderBottom: "1px solid #eee",
};
