"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

interface GameWithPick {
  id: string;
  gameId: string;
  selection: string;
  isHotPick: boolean;
  tiebreaker: number | null;
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
    isMondayNight: boolean;
  };
}

export default function MyPicksPage() {
  const searchParams = useSearchParams();
  const league = searchParams.get("league") || "NCAAF";
  const weekId = searchParams.get("week") || "";
  const [picks, setPicks] = useState<GameWithPick[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!weekId) {
      setLoading(false);
      return;
    }

    fetch(`/api/picks?week=${weekId}`)
      .then((r) => r.json())
      .then((data) => {
        const filtered = (data.picks || []).filter(
          (p: GameWithPick) => p.game.league === league
        );
        setPicks(filtered);
        setLoading(false);
      });
  }, [weekId, league]);

  function formatSpread(game: GameWithPick["game"]) {
    if (game.spread === 0) return "PK";
    if (game.spread < 0) return `${game.homeTeam} ${game.spread}`;
    return `${game.awayTeam} -${game.spread}`;
  }

  function getResult(pick: GameWithPick) {
    if (!pick.game.isFinal) return { text: "Pending", color: "#999" };
    if (pick.points === null) return { text: "Pending", color: "#999" };
    if (pick.points > 0)
      return {
        text: pick.isHotPick ? `+${pick.points} (HP)` : `+${pick.points}`,
        color: "#006600",
      };
    if (pick.points < 0)
      return { text: `${pick.points} (HP)`, color: "#cc0000" };
    return { text: "0", color: "#999" };
  }

  if (!weekId) {
    return (
      <div style={{ fontFamily: "Verdana, Geneva, sans-serif", padding: "20px" }}>
        <h2 style={{ color: "#003366" }}>My Picks</h2>
        <p style={{ color: "#666" }}>Please select a week from the sidebar.</p>
      </div>
    );
  }

  const regularPicks = picks.filter((p) => !p.isHotPick);
  const hotPicks = picks.filter((p) => p.isHotPick);
  const totalPoints = picks.reduce((sum, p) => sum + (p.points || 0), 0);

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
        <h2 style={{ margin: 0, fontSize: "18px" }}>My {league} Picks</h2>
      </div>

      {loading ? (
        <div style={{ padding: "20px", background: "#fff", border: "1px solid #ccc" }}>
          Loading...
        </div>
      ) : picks.length === 0 ? (
        <div
          style={{
            padding: "20px",
            background: "#fff",
            border: "1px solid #ccc",
            borderTop: "none",
            textAlign: "center",
            color: "#666",
            fontSize: "13px",
          }}
        >
          No picks submitted for this week yet.{" "}
          <a href="/picks" style={{ color: "#003366" }}>
            Make your picks!
          </a>
        </div>
      ) : (
        <>
          {/* Regular Picks */}
          <div
            style={{
              background: "#e8e8e0",
              padding: "8px 16px",
              fontSize: "12px",
              fontWeight: "bold",
              color: "#333",
              borderLeft: "1px solid #ccc",
              borderRight: "1px solid #ccc",
            }}
          >
            Regular Picks ({regularPicks.length})
          </div>
          <div className="table-scroll">
          <table style={tableStyle}>
            <thead>
              <tr style={{ background: "#f5f5f0" }}>
                <th style={thStyle}>Matchup</th>
                <th style={thStyle}>Spread</th>
                <th style={thStyle}>Your Pick</th>
                <th style={thStyle}>Score</th>
                <th style={thStyle}>Result</th>
              </tr>
            </thead>
            <tbody>
              {regularPicks.map((pick) => {
                const result = getResult(pick);
                return (
                  <tr key={pick.id}>
                    <td style={tdStyle}>
                      <strong>{pick.game.awayTeam}</strong>
                      <span style={{ color: "#999" }}> @ </span>
                      <strong>{pick.game.homeTeam}</strong>
                    </td>
                    <td style={{ ...tdStyle, textAlign: "center", color: "#660000", fontWeight: "bold" }}>
                      {formatSpread(pick.game)}
                    </td>
                    <td
                      style={{
                        ...tdStyle,
                        textAlign: "center",
                        fontWeight: "bold",
                        color: "#003366",
                      }}
                    >
                      {pick.selection === "away"
                        ? pick.game.awayTeam
                        : pick.game.homeTeam}
                    </td>
                    <td style={{ ...tdStyle, textAlign: "center" }}>
                      {pick.game.isFinal
                        ? `${pick.game.awayScore} - ${pick.game.homeScore}`
                        : "-"}
                    </td>
                    <td
                      style={{
                        ...tdStyle,
                        textAlign: "center",
                        fontWeight: "bold",
                        color: result.color,
                      }}
                    >
                      {result.text}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          </div>

          {/* Hot Picks */}
          <div
            style={{
              background: "#fff8e0",
              padding: "8px 16px",
              fontSize: "12px",
              fontWeight: "bold",
              color: "#666600",
              borderLeft: "1px solid #ccc",
              borderRight: "1px solid #ccc",
              marginTop: "2px",
            }}
          >
            🔥 Hot Picks ({hotPicks.length})
          </div>
          <div className="table-scroll">
          <table style={tableStyle}>
            <thead>
              <tr style={{ background: "#fff8e0" }}>
                <th style={thStyle}>Matchup</th>
                <th style={thStyle}>Spread</th>
                <th style={thStyle}>Your Pick</th>
                <th style={thStyle}>Score</th>
                <th style={thStyle}>Result</th>
              </tr>
            </thead>
            <tbody>
              {hotPicks.map((pick) => {
                const result = getResult(pick);
                return (
                  <tr key={pick.id} style={{ background: "#fffff8" }}>
                    <td style={tdStyle}>
                      <strong>{pick.game.awayTeam}</strong>
                      <span style={{ color: "#999" }}> @ </span>
                      <strong>{pick.game.homeTeam}</strong>
                      <span
                        style={{
                          marginLeft: "6px",
                          fontSize: "9px",
                          background: "#ffcc00",
                          padding: "1px 4px",
                          borderRadius: "2px",
                          fontWeight: "bold",
                        }}
                      >
                        HP
                      </span>
                    </td>
                    <td style={{ ...tdStyle, textAlign: "center", color: "#660000", fontWeight: "bold" }}>
                      {formatSpread(pick.game)}
                    </td>
                    <td
                      style={{
                        ...tdStyle,
                        textAlign: "center",
                        fontWeight: "bold",
                        color: "#003366",
                      }}
                    >
                      {pick.selection === "away"
                        ? pick.game.awayTeam
                        : pick.game.homeTeam}
                    </td>
                    <td style={{ ...tdStyle, textAlign: "center" }}>
                      {pick.game.isFinal
                        ? `${pick.game.awayScore} - ${pick.game.homeScore}`
                        : "-"}
                    </td>
                    <td
                      style={{
                        ...tdStyle,
                        textAlign: "center",
                        fontWeight: "bold",
                        color: result.color,
                      }}
                    >
                      {result.text}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          </div>

          {/* Tiebreaker and Summary */}
          <div
            style={{
              background: "#fff",
              border: "1px solid #ccc",
              borderTop: "none",
              padding: "12px 16px",
              borderRadius: "0 0 4px 4px",
              display: "flex",
              justifyContent: "space-between",
              fontSize: "12px",
            }}
          >
            <div>
              {picks.some((p) => p.tiebreaker != null) && (
                <span>
                  MNF Tiebreaker:{" "}
                  <strong>
                    {picks.find((p) => p.tiebreaker != null)?.tiebreaker}
                  </strong>
                </span>
              )}
            </div>
            <div style={{ fontWeight: "bold", color: "#003366" }}>
              Week Total: {totalPoints} pts
            </div>
          </div>
        </>
      )}
    </div>
  );
}

const tableStyle: React.CSSProperties = {
  width: "100%",
  minWidth: "480px",
  borderCollapse: "collapse",
  background: "#fff",
  borderLeft: "1px solid #ccc",
  borderRight: "1px solid #ccc",
  fontSize: "12px",
};

const thStyle: React.CSSProperties = {
  padding: "8px 10px",
  textAlign: "left",
  fontSize: "11px",
  fontWeight: "bold",
  color: "#333",
  borderBottom: "1px solid #ddd",
};

const tdStyle: React.CSSProperties = {
  padding: "8px 10px",
  borderBottom: "1px solid #eee",
};
