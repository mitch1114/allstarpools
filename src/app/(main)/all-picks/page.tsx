"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

interface GamePickStats {
  id: string;
  awayTeam: string;
  homeTeam: string;
  spread: number;
  isFinal: boolean;
  picksVisible: boolean;
  awayScore: number | null;
  homeScore: number | null;
  totalPicks: number;
  awayPicks: number;
  homePicks: number;
  awayHotPicks: number;
  homeHotPicks: number;
}

export default function AllPicksPage() {
  const searchParams = useSearchParams();
  const league = searchParams.get("league") || "NCAAF";
  const weekId = searchParams.get("week") || "";
  const [games, setGames] = useState<GamePickStats[]>([]);
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
        setLoading(false);
      });
  }, [weekId, league]);

  function getSpreadLabel(game: GamePickStats, side: "home" | "away") {
    if (game.spread === 0) return "PK";
    if (side === "home") {
      return game.spread < 0 ? `(${game.spread})` : `(+${game.spread})`;
    }
    return game.spread > 0 ? `(-${game.spread})` : `(+${Math.abs(game.spread)})`;
  }

  if (!weekId) {
    return (
      <div style={{ fontFamily: "Verdana, Geneva, sans-serif", padding: "20px" }}>
        <h2 style={{ color: "#003366" }}>Everyone&apos;s Picks</h2>
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
          Everyone&apos;s {league} Picks
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
        <div style={{ background: "#fff", border: "1px solid #ccc", borderTop: "none" }}>
          {games.map((game, idx) => {
            const awayPct = game.totalPicks > 0 ? Math.round((game.awayPicks / game.totalPicks) * 100) : 0;
            const homePct = game.totalPicks > 0 ? Math.round((game.homePicks / game.totalPicks) * 100) : 0;
            const totalHotPicks = game.awayHotPicks + game.homeHotPicks;
            const awayHotPct = totalHotPicks > 0 ? Math.round((game.awayHotPicks / totalHotPicks) * 100) : 0;
            const homeHotPct = totalHotPicks > 0 ? Math.round((game.homeHotPicks / totalHotPicks) * 100) : 0;

            return (
              <div
                key={game.id}
                style={{
                  padding: "12px 16px",
                  borderBottom: "1px solid #eee",
                  background: idx % 2 === 0 ? "#fff" : "#fafaf8",
                }}
              >
                {/* Matchup header */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "8px",
                  }}
                >
                  <div style={{ fontSize: "13px", fontWeight: "bold", color: "#003366" }}>
                    {game.awayTeam} <span style={{ color: "#888", fontSize: "10px" }}>{getSpreadLabel(game, "away")}</span>
                    {" "}@{" "}
                    {game.homeTeam} <span style={{ color: "#888", fontSize: "10px" }}>{getSpreadLabel(game, "home")}</span>
                  </div>
                  {game.isFinal && (
                    <span style={{ fontSize: "10px", color: "#006600", fontWeight: "bold" }}>
                      Final: {game.awayScore}-{game.homeScore}
                    </span>
                  )}
                </div>

                {!game.picksVisible ? (
                  <div style={{ fontSize: "11px", color: "#999", fontStyle: "italic" }}>
                    Pick percentages visible after game starts
                  </div>
                ) : game.totalPicks === 0 ? (
                  <div style={{ fontSize: "11px", color: "#999" }}>
                    No picks for this game
                  </div>
                ) : (
                  <>
                    {/* Regular picks bar */}
                    <div style={{ marginBottom: "6px" }}>
                      <div style={{ fontSize: "10px", color: "#666", marginBottom: "2px" }}>
                        Regular Picks ({game.totalPicks} total)
                      </div>
                      <div style={{ display: "flex", height: "24px", borderRadius: "3px", overflow: "hidden", border: "1px solid #ddd" }}>
                        <div
                          style={{
                            width: `${awayPct}%`,
                            background: "#4a90d9",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "10px",
                            fontWeight: "bold",
                            color: "#fff",
                            minWidth: awayPct > 0 ? "40px" : "0",
                          }}
                        >
                          {awayPct > 0 && `${game.awayTeam} ${awayPct}%`}
                        </div>
                        <div
                          style={{
                            width: `${homePct}%`,
                            background: "#c0392b",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "10px",
                            fontWeight: "bold",
                            color: "#fff",
                            minWidth: homePct > 0 ? "40px" : "0",
                          }}
                        >
                          {homePct > 0 && `${game.homeTeam} ${homePct}%`}
                        </div>
                      </div>
                    </div>

                    {/* Hot picks bar */}
                    {totalHotPicks > 0 && (
                      <div>
                        <div style={{ fontSize: "10px", color: "#cc6600", marginBottom: "2px" }}>
                          Hot Picks ({totalHotPicks} total)
                        </div>
                        <div style={{ display: "flex", height: "20px", borderRadius: "3px", overflow: "hidden", border: "1px solid #e8a040" }}>
                          <div
                            style={{
                              width: `${awayHotPct}%`,
                              background: "#e67e22",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "10px",
                              fontWeight: "bold",
                              color: "#fff",
                              minWidth: awayHotPct > 0 ? "40px" : "0",
                            }}
                          >
                            {awayHotPct > 0 && `${game.awayTeam} ${awayHotPct}%`}
                          </div>
                          <div
                            style={{
                              width: `${homeHotPct}%`,
                              background: "#d35400",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "10px",
                              fontWeight: "bold",
                              color: "#fff",
                              minWidth: homeHotPct > 0 ? "40px" : "0",
                            }}
                          >
                            {homeHotPct > 0 && `${game.homeTeam} ${homeHotPct}%`}
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
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
        Pick percentages are hidden until game time. Blue = away team, Red = home team, Orange = hot picks.
      </div>
    </div>
  );
}
