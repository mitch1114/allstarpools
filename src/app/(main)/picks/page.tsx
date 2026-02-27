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
  isMondayNight: boolean;
  isFinal: boolean;
}

interface PickState {
  gameId: string;
  selection: "home" | "away" | "";
  isHotPick: boolean;
}

export default function PickSheetPage() {
  const searchParams = useSearchParams();
  const league = searchParams.get("league") || "NFL";
  const weekId = searchParams.get("week") || "";

  const [games, setGames] = useState<Game[]>([]);
  const [pickStates, setPickStates] = useState<Record<string, PickState>>({});
  const [tiebreaker, setTiebreaker] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [existingPicks, setExistingPicks] = useState<Record<string, { selection: string; isHotPick: boolean }>>({});

  useEffect(() => {
    if (!weekId) return;

    Promise.all([
      fetch(`/api/games?week=${weekId}&league=${league}`).then((r) => r.json()),
      fetch(`/api/picks?week=${weekId}`).then((r) => r.json()),
    ]).then(([gamesData, picksData]) => {
      setGames(gamesData.games || []);

      const existing: Record<string, { selection: string; isHotPick: boolean }> = {};
      const states: Record<string, PickState> = {};

      for (const p of picksData.picks || []) {
        if (p.game.league === league) {
          existing[p.gameId] = {
            selection: p.selection,
            isHotPick: p.isHotPick,
          };
          states[p.gameId] = {
            gameId: p.gameId,
            selection: p.selection,
            isHotPick: p.isHotPick,
          };
          if (p.tiebreaker != null) {
            setTiebreaker(String(p.tiebreaker));
          }
        }
      }

      setExistingPicks(existing);
      setPickStates(states);
    });
  }, [weekId, league]);

  const now = new Date();

  function isLocked(game: Game) {
    return new Date(game.gameTime) <= now || game.isFinal;
  }

  function handleSelection(gameId: string, selection: "home" | "away") {
    setPickStates((prev) => ({
      ...prev,
      [gameId]: {
        gameId,
        selection,
        isHotPick: prev[gameId]?.isHotPick || false,
      },
    }));
  }

  function handleHotPick(gameId: string) {
    setPickStates((prev) => {
      const current = prev[gameId];
      if (!current || !current.selection) return prev;

      // Count current hot picks (excluding this one)
      const hotPickCount = Object.values(prev).filter(
        (p) => p.isHotPick && p.gameId !== gameId
      ).length;

      if (!current.isHotPick && hotPickCount >= 3) {
        setMessage("You can only have 3 Hot Picks per league per week.");
        return prev;
      }

      return {
        ...prev,
        [gameId]: {
          ...current,
          isHotPick: !current.isHotPick,
        },
      };
    });
  }

  async function handleSubmit() {
    const selectedPicks = Object.values(pickStates).filter((p) => p.selection);

    if (selectedPicks.length < 10) {
      setMessage(`Please select at least 10 ${league} games (you have ${selectedPicks.length}).`);
      return;
    }

    if (selectedPicks.length > 10) {
      setMessage(`Please select exactly 10 ${league} games (you have ${selectedPicks.length}).`);
      return;
    }

    const hotPicks = selectedPicks.filter((p) => p.isHotPick);
    if (hotPicks.length !== 3) {
      setMessage(`You must designate exactly 3 Hot Picks (you have ${hotPicks.length}).`);
      return;
    }

    setSaving(true);
    setMessage("");

    const res = await fetch("/api/picks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        picks: selectedPicks,
        tiebreaker: tiebreaker ? Number(tiebreaker) : null,
      }),
    });

    const data = await res.json();
    setSaving(false);

    if (data.errors?.length) {
      setMessage(`Saved ${data.saved} picks. Errors: ${data.errors.join("; ")}`);
    } else {
      setMessage(`All ${data.saved} picks saved successfully!`);
    }
  }

  function formatSpread(game: Game) {
    if (game.spread === 0) return "PK";
    // spread is from home team perspective
    if (game.spread < 0) return `${game.homeTeam} ${game.spread}`;
    return `${game.awayTeam} -${game.spread}`;
  }

  function formatGameTime(dt: string) {
    const d = new Date(dt);
    return d.toLocaleString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  }

  const selectedCount = Object.values(pickStates).filter((p) => p.selection).length;
  const hotPickCount = Object.values(pickStates).filter((p) => p.isHotPick).length;

  if (!weekId) {
    return (
      <div style={{ fontFamily: "Verdana, Geneva, sans-serif", padding: "20px" }}>
        <h2 style={{ color: "#003366" }}>Pick Sheet</h2>
        <p style={{ color: "#666" }}>Please select a week from the sidebar.</p>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "Verdana, Geneva, sans-serif" }}>
      {/* Header */}
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
          {league} Pick Sheet
        </h2>
        <div style={{ fontSize: "11px" }}>
          Picks: {selectedCount}/10 | Hot Picks: {hotPickCount}/3
        </div>
      </div>

      {/* Instructions */}
      <div
        style={{
          background: "#fffff0",
          border: "1px solid #eee8aa",
          borderTop: "none",
          padding: "10px 16px",
          fontSize: "11px",
          color: "#666600",
        }}
      >
        Select 10 games (radio buttons) then mark exactly 3 as Hot Picks (HP checkbox).
        Regular picks = 1pt correct, 0 wrong. Hot Picks = 2pts correct, -1 wrong. Pushes = loss.
      </div>

      {/* Games Table */}
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
            <th style={thStyle}>Game</th>
            <th style={thStyle}>Spread</th>
            <th style={thStyle}>Time</th>
            <th style={{ ...thStyle, width: "60px" }}>Away</th>
            <th style={{ ...thStyle, width: "60px" }}>Home</th>
            <th style={{ ...thStyle, width: "40px" }}>HP</th>
          </tr>
        </thead>
        <tbody>
          {games.map((game, idx) => {
            const locked = isLocked(game);
            const pick = pickStates[game.id];
            const existing = existingPicks[game.id];
            const isSelected = !!pick?.selection;

            return (
              <tr
                key={game.id}
                style={{
                  background: locked
                    ? "#f0f0f0"
                    : isSelected
                      ? "#e8f5e8"
                      : idx % 2 === 0
                        ? "#fff"
                        : "#fafaf5",
                  opacity: locked ? 0.6 : 1,
                }}
              >
                <td style={tdStyle}>
                  <span style={{ fontWeight: "bold" }}>{game.awayTeam}</span>
                  <span style={{ color: "#999", margin: "0 4px" }}>@</span>
                  <span style={{ fontWeight: "bold" }}>{game.homeTeam}</span>
                  {game.isMondayNight && (
                    <span
                      style={{
                        marginLeft: "6px",
                        fontSize: "9px",
                        background: "#ffcc00",
                        color: "#333",
                        padding: "1px 4px",
                        borderRadius: "2px",
                        fontWeight: "bold",
                      }}
                    >
                      MNF
                    </span>
                  )}
                  {locked && (
                    <span
                      style={{
                        marginLeft: "6px",
                        fontSize: "9px",
                        color: "#cc0000",
                        fontWeight: "bold",
                      }}
                    >
                      LOCKED
                    </span>
                  )}
                </td>
                <td style={{ ...tdStyle, textAlign: "center", fontWeight: "bold", color: "#660000" }}>
                  {formatSpread(game)}
                </td>
                <td style={{ ...tdStyle, textAlign: "center", fontSize: "10px", color: "#666" }}>
                  {formatGameTime(game.gameTime)}
                </td>
                <td style={{ ...tdStyle, textAlign: "center" }}>
                  <input
                    type="radio"
                    name={`pick-${game.id}`}
                    checked={pick?.selection === "away"}
                    onChange={() => handleSelection(game.id, "away")}
                    disabled={locked}
                    style={{ cursor: locked ? "not-allowed" : "pointer" }}
                  />
                </td>
                <td style={{ ...tdStyle, textAlign: "center" }}>
                  <input
                    type="radio"
                    name={`pick-${game.id}`}
                    checked={pick?.selection === "home"}
                    onChange={() => handleSelection(game.id, "home")}
                    disabled={locked}
                    style={{ cursor: locked ? "not-allowed" : "pointer" }}
                  />
                </td>
                <td style={{ ...tdStyle, textAlign: "center" }}>
                  <input
                    type="checkbox"
                    checked={pick?.isHotPick || false}
                    onChange={() => handleHotPick(game.id)}
                    disabled={locked || !pick?.selection}
                    style={{ cursor: locked || !pick?.selection ? "not-allowed" : "pointer" }}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Monday Night Tiebreaker */}
      {games.some((g) => g.isMondayNight) && (
        <div
          style={{
            background: "#fff",
            border: "1px solid #ccc",
            borderTop: "none",
            padding: "12px 16px",
          }}
        >
          <label
            style={{
              fontSize: "12px",
              fontWeight: "bold",
              color: "#003366",
            }}
          >
            Monday Night Tiebreaker — Total Combined Score:{" "}
            <input
              type="number"
              value={tiebreaker}
              onChange={(e) => setTiebreaker(e.target.value)}
              style={{
                width: "80px",
                padding: "4px 8px",
                border: "1px solid #999",
                borderRadius: "2px",
                fontSize: "14px",
                marginLeft: "8px",
              }}
              min={0}
              max={200}
              placeholder="0"
            />
          </label>
        </div>
      )}

      {/* Submit */}
      <div
        style={{
          background: "#fff",
          border: "1px solid #ccc",
          borderTop: "none",
          padding: "16px",
          borderRadius: "0 0 4px 4px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          {message && (
            <span
              style={{
                fontSize: "12px",
                color: message.includes("success") ? "#006600" : "#cc0000",
                fontWeight: "bold",
              }}
            >
              {message}
            </span>
          )}
        </div>
        <button
          onClick={handleSubmit}
          disabled={saving}
          style={{
            padding: "10px 30px",
            background: "#006600",
            color: "#fff",
            border: "none",
            borderRadius: "2px",
            fontSize: "14px",
            fontWeight: "bold",
            cursor: saving ? "wait" : "pointer",
          }}
        >
          {saving ? "Saving..." : "SUBMIT PICKS"}
        </button>
      </div>
    </div>
  );
}

const thStyle: React.CSSProperties = {
  padding: "8px 10px",
  textAlign: "left",
  fontSize: "11px",
  fontWeight: "bold",
  color: "#333",
  borderBottom: "2px solid #ccc",
};

const tdStyle: React.CSSProperties = {
  padding: "8px 10px",
  borderBottom: "1px solid #eee",
};
