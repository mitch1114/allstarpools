"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

interface Game {
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
}

export default function AdminScoresPage() {
  const searchParams = useSearchParams();
  const league = searchParams.get("league") || "NFL";
  const weekId = searchParams.get("week") || "";

  const [games, setGames] = useState<Game[]>([]);
  const [scores, setScores] = useState<Record<string, { away: string; home: string }>>({});
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!weekId) {
      setLoading(false);
      return;
    }

    fetch(`/api/admin/games?week=${weekId}&league=${league}`)
      .then((r) => r.json())
      .then((data) => {
        const g = data.games || [];
        setGames(g);

        const s: Record<string, { away: string; home: string }> = {};
        for (const game of g) {
          s[game.id] = {
            away: game.awayScore != null ? String(game.awayScore) : "",
            home: game.homeScore != null ? String(game.homeScore) : "",
          };
        }
        setScores(s);
        setLoading(false);
      });
  }, [weekId, league]);

  async function handleScore(gameId: string) {
    const s = scores[gameId];
    if (!s || s.away === "" || s.home === "") {
      setMessage("Please enter both scores.");
      return;
    }

    const res = await fetch("/api/admin/scores", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        gameId,
        awayScore: parseInt(s.away),
        homeScore: parseInt(s.home),
      }),
    });

    const data = await res.json();

    if (res.ok) {
      setMessage(
        `Scored! ${data.picksScored} picks updated.`
      );
      // Refresh games and update score inputs
      const gamesRes = await fetch(
        `/api/admin/games?week=${weekId}&league=${league}`
      );
      const gamesData = await gamesRes.json();
      const refreshedGames = gamesData.games || [];
      setGames(refreshedGames);
      const updatedScores: Record<string, { away: string; home: string }> = {};
      for (const g of refreshedGames) {
        updatedScores[g.id] = {
          away: g.awayScore != null ? String(g.awayScore) : "",
          home: g.homeScore != null ? String(g.homeScore) : "",
        };
      }
      setScores(updatedScores);
    } else {
      setMessage(`Error: ${data.error}`);
    }
  }

  async function handleUnfinalize(gameId: string) {
    const res = await fetch("/api/admin/scores", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gameId }),
    });

    if (res.ok) {
      setMessage("Game unfinalized. You can now edit the score and re-score.");
      const gamesRes = await fetch(`/api/admin/games?week=${weekId}&league=${league}`);
      const gamesData = await gamesRes.json();
      const refreshedGames = gamesData.games || [];
      setGames(refreshedGames);
      const updatedScores: Record<string, { away: string; home: string }> = {};
      for (const g of refreshedGames) {
        updatedScores[g.id] = {
          away: g.awayScore != null ? String(g.awayScore) : "",
          home: g.homeScore != null ? String(g.homeScore) : "",
        };
      }
      setScores(updatedScores);
    } else {
      const data = await res.json();
      setMessage(`Error: ${data.error}`);
    }
  }

  if (!weekId) {
    return (
      <div style={{ fontFamily: "Verdana, Geneva, sans-serif", padding: "20px" }}>
        <h2 style={{ color: "#003366" }}>Admin: Enter Scores</h2>
        <p style={{ color: "#666" }}>Select a week from the sidebar.</p>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "Verdana, Geneva, sans-serif" }}>
      <div
        style={{
          background: "#663300",
          color: "#fff",
          padding: "12px 16px",
          borderRadius: "4px 4px 0 0",
        }}
      >
        <h2 style={{ margin: 0, fontSize: "18px" }}>
          Admin: Enter {league} Scores
        </h2>
      </div>

      {message && (
        <div
          style={{
            background: message.includes("Error") ? "#f8d7da" : "#d4edda",
            padding: "8px 16px",
            fontSize: "12px",
            borderLeft: "1px solid #ccc",
            borderRight: "1px solid #ccc",
          }}
        >
          {message}
        </div>
      )}

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
            <th style={thStyle}>Matchup</th>
            <th style={thStyle}>Spread</th>
            <th style={{ ...thStyle, width: "80px" }}>Away Score</th>
            <th style={{ ...thStyle, width: "80px" }}>Home Score</th>
            <th style={thStyle}>Status</th>
            <th style={thStyle}>Action</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={6} style={{ padding: "20px", textAlign: "center" }}>
                Loading...
              </td>
            </tr>
          ) : games.length === 0 ? (
            <tr>
              <td colSpan={6} style={{ padding: "20px", textAlign: "center", color: "#666" }}>
                No games to score.
              </td>
            </tr>
          ) : (
            games.map((game) => (
              <tr
                key={game.id}
                style={{
                  background: game.isFinal ? "#f0fff0" : "#fff",
                }}
              >
                <td style={tdStyle}>
                  <strong>{game.awayTeam}</strong>
                  <span style={{ color: "#999" }}> @ </span>
                  <strong>{game.homeTeam}</strong>
                  {game.isMondayNight && (
                    <span
                      style={{
                        marginLeft: "6px",
                        fontSize: "9px",
                        background: "#ffcc00",
                        padding: "1px 4px",
                        borderRadius: "2px",
                      }}
                    >
                      MNF
                    </span>
                  )}
                </td>
                <td
                  style={{
                    ...tdStyle,
                    textAlign: "center",
                    color: "#660000",
                    fontWeight: "bold",
                  }}
                >
                  {game.spread === 0
                    ? "PK"
                    : game.spread < 0
                      ? `${game.homeTeam} ${game.spread}`
                      : `${game.awayTeam} -${game.spread}`}
                </td>
                <td style={{ ...tdStyle, textAlign: "center" }}>
                  <input
                    type="number"
                    value={scores[game.id]?.away || ""}
                    onChange={(e) =>
                      setScores({
                        ...scores,
                        [game.id]: { ...scores[game.id], away: e.target.value },
                      })
                    }
                    style={{
                      width: "60px",
                      padding: "4px",
                      border: "1px solid #999",
                      borderRadius: "2px",
                      textAlign: "center",
                      fontSize: "13px",
                    }}
                    min={0}
                  />
                </td>
                <td style={{ ...tdStyle, textAlign: "center" }}>
                  <input
                    type="number"
                    value={scores[game.id]?.home || ""}
                    onChange={(e) =>
                      setScores({
                        ...scores,
                        [game.id]: { ...scores[game.id], home: e.target.value },
                      })
                    }
                    style={{
                      width: "60px",
                      padding: "4px",
                      border: "1px solid #999",
                      borderRadius: "2px",
                      textAlign: "center",
                      fontSize: "13px",
                    }}
                    min={0}
                  />
                </td>
                <td style={tdStyle}>
                  {game.isFinal ? (
                    <span style={{ color: "#006600", fontWeight: "bold" }}>
                      Final
                    </span>
                  ) : (
                    <span style={{ color: "#999" }}>Pending</span>
                  )}
                </td>
                <td style={{ ...tdStyle, display: "flex", gap: "4px" }}>
                  <button
                    onClick={() => handleScore(game.id)}
                    style={{
                      padding: "4px 12px",
                      background: game.isFinal ? "#666" : "#006600",
                      color: "#fff",
                      border: "none",
                      borderRadius: "2px",
                      fontSize: "11px",
                      fontWeight: "bold",
                      cursor: "pointer",
                    }}
                  >
                    {game.isFinal ? "Re-Score" : "Score"}
                  </button>
                  {game.isFinal && (
                    <button
                      onClick={() => handleUnfinalize(game.id)}
                      style={{
                        padding: "4px 8px",
                        background: "#cc6600",
                        color: "#fff",
                        border: "none",
                        borderRadius: "2px",
                        fontSize: "10px",
                        cursor: "pointer",
                      }}
                    >
                      Undo
                    </button>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

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
        Scoring a game will automatically calculate points for all picks on that game.
      </div>
    </div>
  );
}

const thStyle: React.CSSProperties = {
  padding: "8px 10px",
  textAlign: "left",
  fontSize: "11px",
  fontWeight: "bold",
  borderBottom: "2px solid #ccc",
};

const tdStyle: React.CSSProperties = {
  padding: "8px 10px",
  borderBottom: "1px solid #eee",
};
