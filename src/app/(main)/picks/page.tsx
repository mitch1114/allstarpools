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

  async function savePicks(isDraft: boolean) {
    const selectedPicks = Object.values(pickStates).filter((p) => p.selection);

    if (!isDraft) {
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
    }

    if (selectedPicks.length === 0) {
      setMessage("No picks to save.");
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
    } else if (isDraft) {
      setMessage(`Draft saved! ${data.saved} pick(s) saved. Complete your remaining picks before the deadline.`);
    } else {
      setMessage(`All ${data.saved} picks saved successfully!`);
    }
  }

  function getSpreadLabel(game: Game, side: "home" | "away") {
    if (game.spread === 0) return "PK";
    if (side === "home") {
      return game.spread < 0 ? `(${game.spread})` : `(+${game.spread})`;
    }
    // away
    return game.spread > 0 ? `(-${game.spread})` : `(+${Math.abs(game.spread)})`;
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
        <div style={{ fontSize: "12px" }}>
          <span style={{ marginRight: "12px" }}>
            Picks: <strong>{selectedCount}</strong>/10
          </span>
          <span>
            Hot Picks: <strong style={{ color: "#ffcc00" }}>{hotPickCount}</strong>/3
          </span>
        </div>
      </div>

      {/* Instructions */}
      <div
        style={{
          background: "#fffff0",
          border: "1px solid #eee8aa",
          borderTop: "none",
          padding: "8px 16px",
          fontSize: "11px",
          color: "#666600",
        }}
      >
        Click a team to pick them. Click the fire icon to mark as a Hot Pick (2x points).
        Use &quot;Save Draft&quot; to save partial picks. &quot;Submit&quot; requires 10 picks + 3 Hot Picks.
      </div>

      {/* Game Cards */}
      <div style={{ background: "#fff", border: "1px solid #ccc", borderTop: "none" }}>
        {games.map((game, idx) => {
          const locked = isLocked(game);
          const pick = pickStates[game.id];
          const awaySelected = pick?.selection === "away";
          const homeSelected = pick?.selection === "home";
          const isHot = pick?.isHotPick || false;

          return (
            <div
              key={game.id}
              style={{
                display: "flex",
                alignItems: "center",
                padding: "8px 12px",
                gap: "8px",
                borderBottom: "1px solid #eee",
                background: locked
                  ? "#f5f5f2"
                  : isHot
                    ? "#fff8e0"
                    : idx % 2 === 0
                      ? "#fff"
                      : "#fafaf8",
                opacity: locked ? 0.55 : 1,
              }}
            >
              {/* Game time */}
              <div
                style={{
                  width: "90px",
                  flexShrink: 0,
                  fontSize: "10px",
                  color: "#888",
                  lineHeight: "1.3",
                }}
              >
                {formatGameTime(game.gameTime)}
                {game.isMondayNight && (
                  <span
                    style={{
                      display: "block",
                      fontSize: "9px",
                      background: "#ffcc00",
                      color: "#333",
                      padding: "1px 4px",
                      borderRadius: "2px",
                      fontWeight: "bold",
                      width: "fit-content",
                      marginTop: "2px",
                    }}
                  >
                    MNF
                  </span>
                )}
                {locked && (
                  <span
                    style={{
                      display: "block",
                      fontSize: "9px",
                      color: "#cc0000",
                      fontWeight: "bold",
                      marginTop: "2px",
                    }}
                  >
                    LOCKED
                  </span>
                )}
              </div>

              {/* Away team button */}
              <button
                onClick={() => !locked && handleSelection(game.id, "away")}
                disabled={locked}
                style={{
                  flex: 1,
                  padding: "10px 8px",
                  background: awaySelected ? "#003366" : "#f0f0ed",
                  color: awaySelected ? "#fff" : "#333",
                  border: awaySelected ? "2px solid #003366" : "2px solid #ddd",
                  borderRadius: "4px",
                  fontSize: "13px",
                  fontWeight: "bold",
                  cursor: locked ? "not-allowed" : "pointer",
                  textAlign: "center",
                  transition: "all 0.15s",
                }}
              >
                {game.awayTeam}
                <span
                  style={{
                    display: "block",
                    fontSize: "10px",
                    fontWeight: "normal",
                    color: awaySelected ? "#aaccee" : "#888",
                    marginTop: "2px",
                  }}
                >
                  {getSpreadLabel(game, "away")}
                </span>
              </button>

              {/* VS */}
              <div
                style={{
                  fontSize: "10px",
                  color: "#999",
                  fontWeight: "bold",
                  flexShrink: 0,
                }}
              >
                @
              </div>

              {/* Home team button */}
              <button
                onClick={() => !locked && handleSelection(game.id, "home")}
                disabled={locked}
                style={{
                  flex: 1,
                  padding: "10px 8px",
                  background: homeSelected ? "#003366" : "#f0f0ed",
                  color: homeSelected ? "#fff" : "#333",
                  border: homeSelected ? "2px solid #003366" : "2px solid #ddd",
                  borderRadius: "4px",
                  fontSize: "13px",
                  fontWeight: "bold",
                  cursor: locked ? "not-allowed" : "pointer",
                  textAlign: "center",
                  transition: "all 0.15s",
                }}
              >
                {game.homeTeam}
                <span
                  style={{
                    display: "block",
                    fontSize: "10px",
                    fontWeight: "normal",
                    color: homeSelected ? "#aaccee" : "#888",
                    marginTop: "2px",
                  }}
                >
                  {getSpreadLabel(game, "home")}
                </span>
              </button>

              {/* Hot Pick button */}
              <button
                onClick={() => !locked && pick?.selection && handleHotPick(game.id)}
                disabled={locked || !pick?.selection}
                title={isHot ? "Remove Hot Pick" : "Mark as Hot Pick (2x points)"}
                style={{
                  width: "36px",
                  height: "36px",
                  flexShrink: 0,
                  background: isHot ? "#ff6600" : "transparent",
                  color: isHot ? "#fff" : (!pick?.selection || locked) ? "#ddd" : "#cc6600",
                  border: isHot ? "2px solid #ff6600" : "2px solid #ddd",
                  borderRadius: "50%",
                  fontSize: "16px",
                  cursor: locked || !pick?.selection ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.15s",
                }}
              >
                {isHot ? "\u2605" : "\u2606"}
              </button>
            </div>
          );
        })}
      </div>

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
            Monday Night Tiebreaker &mdash; Total Combined Score:{" "}
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
          padding: "12px 16px",
          borderRadius: "0 0 4px 4px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "8px",
        }}
      >
        <div style={{ flex: 1, minWidth: "200px" }}>
          {message && (
            <span
              style={{
                fontSize: "12px",
                color: message.includes("success") || message.includes("Draft saved") ? "#006600" : "#cc0000",
                fontWeight: "bold",
              }}
            >
              {message}
            </span>
          )}
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            onClick={() => savePicks(true)}
            disabled={saving}
            style={{
              padding: "10px 20px",
              background: "#003366",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              fontSize: "13px",
              fontWeight: "bold",
              cursor: saving ? "wait" : "pointer",
            }}
          >
            {saving ? "Saving..." : "SAVE DRAFT"}
          </button>
          <button
            onClick={() => savePicks(false)}
            disabled={saving}
            style={{
              padding: "10px 30px",
              background: "#006600",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              fontSize: "14px",
              fontWeight: "bold",
              cursor: saving ? "wait" : "pointer",
            }}
          >
            {saving ? "Saving..." : "SUBMIT PICKS"}
          </button>
        </div>
      </div>
    </div>
  );
}
