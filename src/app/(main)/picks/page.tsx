"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";

interface Game {
  id: string;
  league: string;
  awayTeam: string;
  homeTeam: string;
  spread: number;
  gameTime: string;
  isFinal: boolean;
}

interface PickState {
  gameId: string;
  selection: "home" | "away" | "";
  isHotPick: boolean;
}

export default function PickSheetPage() {
  const searchParams = useSearchParams();
  const league = searchParams.get("league") || "NCAAF";
  const weekId = searchParams.get("week") || "";

  const [games, setGames] = useState<Game[]>([]);
  const [pickStates, setPickStates] = useState<Record<string, PickState>>({});
  const [saving, setSaving] = useState(false);
  const [popup, setPopup] = useState<{ message: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    if (!weekId) return;

    Promise.all([
      fetch(`/api/games?week=${weekId}&league=${league}`).then((r) => r.json()),
      fetch(`/api/picks?week=${weekId}`).then((r) => r.json()),
    ]).then(([gamesData, picksData]) => {
      setGames(gamesData.games || []);

      const states: Record<string, PickState> = {};

      for (const p of picksData.picks || []) {
        if (p.game.league === league) {
          states[p.gameId] = {
            gameId: p.gameId,
            selection: p.selection,
            isHotPick: p.isHotPick,
          };
        }
      }

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
        showPopup("You can only have 3 Hot Picks per league per week.", "error");
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

  const showPopup = useCallback((message: string, type: "success" | "error") => {
    setPopup({ message, type });
    setTimeout(() => setPopup(null), 5000);
  }, []);

  async function submitPicks() {
    const selectedPicks = Object.values(pickStates).filter((p) => p.selection);

    if (selectedPicks.length === 0) {
      showPopup("No picks to save.", "error");
      return;
    }

    setSaving(true);

    try {
      const res = await fetch("/api/picks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          picks: selectedPicks,
        }),
      });

      const data = await res.json();

      // Calculate remaining
      const unlockedGames = games.filter((g) => !isLocked(g));
      const pickedGameIds = new Set(Object.keys(pickStates).filter((id) => pickStates[id]?.selection));
      const unpickedCount = unlockedGames.filter((g) => !pickedGameIds.has(g.id)).length;
      const currentHotPicks = Object.values(pickStates).filter((p) => p.isHotPick).length;
      const remainingHotPicks = 3 - currentHotPicks;

      if (data.errors?.length) {
        showPopup(`Saved ${data.saved} picks. Errors: ${data.errors.join("; ")}`, "error");
      } else {
        const remainingMsg = unpickedCount > 0
          ? `\n${unpickedCount} regular pick${unpickedCount !== 1 ? "s" : ""} remaining`
          : "\nAll games picked!";
        const hotMsg = remainingHotPicks > 0
          ? ` | ${remainingHotPicks} hot pick${remainingHotPicks !== 1 ? "s" : ""} remaining`
          : "";
        showPopup(`${data.saved} pick(s) saved successfully!${remainingMsg}${hotMsg}`, "success");
      }
    } catch {
      showPopup("Network error saving picks. Please try again.", "error");
    } finally {
      setSaving(false);
    }
  }

  function getSpreadLabel(game: Game, side: "home" | "away") {
    if (game.spread === 0) return "PK";
    if (side === "home") {
      return game.spread < 0 ? `(${game.spread})` : `(+${game.spread})`;
    }
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
        <h2 style={{ color: "#003366" }}>Make Picks</h2>
        <p style={{ color: "#666" }}>Please select a week from the sidebar.</p>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "Verdana, Geneva, sans-serif", position: "relative" }}>
      {/* Popup notification */}
      {popup && (
        <div
          style={{
            position: "fixed",
            top: "20px",
            left: "50%",
            transform: "translateX(-50%)",
            background: popup.type === "success" ? "#006600" : "#cc0000",
            color: "#fff",
            padding: "14px 24px",
            borderRadius: "6px",
            fontSize: "13px",
            fontWeight: "bold",
            zIndex: 9999,
            boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
            whiteSpace: "pre-line",
            textAlign: "center",
            maxWidth: "90vw",
            cursor: "pointer",
          }}
          onClick={() => setPopup(null)}
        >
          {popup.message}
        </div>
      )}

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
          {league} - Make Picks
        </h2>
        <div style={{ fontSize: "12px" }}>
          <span style={{ marginRight: "12px" }}>
            Picks: <strong>{selectedCount}</strong>
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
        Click a team to pick them. Click the 🔥 to mark as a Hot Pick (2x points).
        You can submit any number of picks at a time.
      </div>

      {/* Column Headers */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          padding: "6px 12px",
          gap: "8px",
          background: "#e8e8e0",
          border: "1px solid #ccc",
          borderTop: "none",
          fontSize: "10px",
          fontWeight: "bold",
          color: "#666",
        }}
      >
        <div style={{ width: "90px", flexShrink: 0 }}>Time</div>
        <div style={{ flex: 1, textAlign: "center" }}>Away</div>
        <div style={{ width: "16px", flexShrink: 0 }}></div>
        <div style={{ flex: 1, textAlign: "center" }}>Home</div>
        <div style={{ width: "36px", flexShrink: 0, textAlign: "center" }}>HP</div>
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
                {isHot ? "🔥" : "🔥"}
              </button>
            </div>
          );
        })}
      </div>

      {/* Submit */}
      <div
        style={{
          background: "#fff",
          border: "1px solid #ccc",
          borderTop: "none",
          padding: "12px 16px",
          borderRadius: "0 0 4px 4px",
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
        }}
      >
        <button
          onClick={() => submitPicks()}
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
  );
}
