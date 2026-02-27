"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

interface GameInfo {
  id: string;
  awayTeam: string;
  homeTeam: string;
  spread: number;
  isFinal: boolean;
  picksVisible: boolean;
}

interface PlayerPicks {
  id: string;
  name: string;
  playerCode: string;
  picks: Record<
    string,
    { selection: string; isHotPick: boolean; points: number | null }
  >;
}

export default function AllPicksPage() {
  const searchParams = useSearchParams();
  const league = searchParams.get("league") || "NFL";
  const weekId = searchParams.get("week") || "";
  const [games, setGames] = useState<GameInfo[]>([]);
  const [players, setPlayers] = useState<PlayerPicks[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!weekId) {
      setLoading(false);
      return;
    }

    fetch(`/api/picks/all?week=${weekId}&league=${league}`)
      .then((r) => r.json())
      .then((data) => {
        setGames(data.games || []);
        setPlayers(data.players || []);
        setLoading(false);
      });
  }, [weekId, league]);

  if (!weekId) {
    return (
      <div style={{ fontFamily: "Verdana, Geneva, sans-serif", padding: "20px" }}>
        <h2 style={{ color: "#003366" }}>All Picks</h2>
        <p style={{ color: "#666" }}>Please select a week from the sidebar.</p>
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
        }}
      >
        <h2 style={{ margin: 0, fontSize: "18px" }}>
          All {league} Picks
        </h2>
      </div>

      {loading ? (
        <div style={{ padding: "20px", background: "#fff", border: "1px solid #ccc" }}>
          Loading...
        </div>
      ) : games.length === 0 ? (
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
          No games available for this week.
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              borderCollapse: "collapse",
              background: "#fff",
              border: "1px solid #ccc",
              fontSize: "11px",
              minWidth: "100%",
            }}
          >
            <thead>
              <tr>
                <th
                  style={{
                    ...headerStyle,
                    position: "sticky",
                    left: 0,
                    background: "#e8e8e0",
                    zIndex: 1,
                    minWidth: "120px",
                  }}
                >
                  Player
                </th>
                {games.map((game) => (
                  <th key={game.id} style={headerStyle}>
                    <div style={{ fontSize: "9px", lineHeight: "1.3" }}>
                      {game.awayTeam}
                      <br />@<br />
                      {game.homeTeam}
                    </div>
                  </th>
                ))}
                <th style={headerStyle}>Pts</th>
              </tr>
            </thead>
            <tbody>
              {players.map((player, idx) => {
                const weekPts = Object.values(player.picks).reduce(
                  (sum, p) => sum + (p.points || 0),
                  0
                );

                return (
                  <tr
                    key={player.id}
                    style={{
                      background: idx % 2 === 0 ? "#fff" : "#fafaf5",
                    }}
                  >
                    <td
                      style={{
                        ...cellStyle,
                        fontWeight: "bold",
                        position: "sticky",
                        left: 0,
                        background: idx % 2 === 0 ? "#fff" : "#fafaf5",
                        zIndex: 1,
                      }}
                    >
                      {player.name}
                    </td>
                    {games.map((game) => {
                      const pick = player.picks[game.id];
                      if (!pick || !game.picksVisible) {
                        return (
                          <td
                            key={game.id}
                            style={{
                              ...cellStyle,
                              textAlign: "center",
                              color: "#ccc",
                            }}
                          >
                            {game.picksVisible ? "-" : "?"}
                          </td>
                        );
                      }

                      const teamName =
                        pick.selection === "away"
                          ? game.awayTeam
                          : game.homeTeam;

                      let bgColor = "transparent";
                      if (pick.points !== null) {
                        bgColor =
                          pick.points > 0
                            ? "#d4edda"
                            : pick.points < 0
                              ? "#f8d7da"
                              : "#fff3cd";
                      }

                      return (
                        <td
                          key={game.id}
                          style={{
                            ...cellStyle,
                            textAlign: "center",
                            background: bgColor,
                            fontWeight: pick.isHotPick ? "bold" : "normal",
                          }}
                        >
                          {teamName}
                          {pick.isHotPick && (
                            <span
                              style={{
                                fontSize: "8px",
                                color: "#cc6600",
                                display: "block",
                              }}
                            >
                              HP
                            </span>
                          )}
                        </td>
                      );
                    })}
                    <td
                      style={{
                        ...cellStyle,
                        textAlign: "center",
                        fontWeight: "bold",
                        color: "#003366",
                      }}
                    >
                      {weekPts}
                    </td>
                  </tr>
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
        ? = Picks hidden until game starts | HP = Hot Pick | Green = correct,
        Red = incorrect, Yellow = push
      </div>
    </div>
  );
}

const headerStyle: React.CSSProperties = {
  padding: "6px 8px",
  textAlign: "center",
  background: "#e8e8e0",
  borderBottom: "2px solid #ccc",
  borderRight: "1px solid #ddd",
  fontWeight: "bold",
  fontSize: "10px",
  whiteSpace: "nowrap",
};

const cellStyle: React.CSSProperties = {
  padding: "6px 8px",
  borderBottom: "1px solid #eee",
  borderRight: "1px solid #f0f0f0",
  fontSize: "10px",
};
