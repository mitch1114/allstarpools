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
  isFinal: boolean;
  awayScore: number | null;
  homeScore: number | null;
}

interface WeekOption {
  id: string;
  number: number;
  label: string;
}

export default function AdminGamesPage() {
  const searchParams = useSearchParams();
  const league = searchParams.get("league") || "NCAAF";
  const weekId = searchParams.get("week") || "";

  const [games, setGames] = useState<Game[]>([]);
  const [weeks, setWeeks] = useState<WeekOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  // New game form
  const [showForm, setShowForm] = useState(false);
  const [newGame, setNewGame] = useState({
    awayTeam: "",
    homeTeam: "",
    spread: "0",
    gameTime: "",
  });

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState({
    awayTeam: "",
    homeTeam: "",
    spread: "0",
    gameTime: "",
  });

  useEffect(() => {
    fetch("/api/weeks")
      .then((r) => r.json())
      .then((data) => setWeeks(data.weeks || []));
  }, []);

  useEffect(() => {
    if (!weekId) {
      setLoading(false);
      return;
    }
    loadGames();
  }, [weekId, league]);

  function loadGames() {
    setLoading(true);
    fetch(`/api/admin/games?week=${weekId}&league=${league}`)
      .then((r) => r.json())
      .then((data) => {
        setGames(data.games || []);
        setLoading(false);
      });
  }

  // Convert local datetime-local string to ISO string with proper timezone
  function localToISO(localDatetime: string) {
    const d = new Date(localDatetime);
    return d.toISOString();
  }

  async function handleAddGame(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/admin/games", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        weekId,
        league,
        ...newGame,
        gameTime: localToISO(newGame.gameTime),
      }),
    });

    if (res.ok) {
      setMessage("Game added!");
      setNewGame({ awayTeam: "", homeTeam: "", spread: "0", gameTime: "" });
      setShowForm(false);
      loadGames();
    } else {
      const data = await res.json();
      setMessage(`Error: ${data.error}`);
    }
  }

  async function handleUpdateGame(id: string) {
    const res = await fetch("/api/admin/games", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...editData, gameTime: localToISO(editData.gameTime) }),
    });

    if (res.ok) {
      setMessage("Game updated!");
      setEditingId(null);
      loadGames();
    } else {
      const data = await res.json();
      setMessage(`Error: ${data.error}`);
    }
  }

  async function handleDeleteGame(id: string) {
    if (!confirm("Delete this game and all associated picks?")) return;

    const res = await fetch(`/api/admin/games?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      setMessage("Game deleted.");
      loadGames();
    }
  }

  // Convert UTC to local datetime-local input value
  function toLocalDatetimeString(utcString: string) {
    const d = new Date(utcString);
    const offset = d.getTimezoneOffset();
    const local = new Date(d.getTime() - offset * 60000);
    return local.toISOString().slice(0, 16);
  }

  function startEdit(game: Game) {
    setEditingId(game.id);
    setEditData({
      awayTeam: game.awayTeam,
      homeTeam: game.homeTeam,
      spread: String(game.spread),
      gameTime: toLocalDatetimeString(game.gameTime),
    });
  }

  if (!weekId) {
    return (
      <div style={{ fontFamily: "Verdana, Geneva, sans-serif", padding: "20px" }}>
        <h2 style={{ color: "#003366" }}>Admin: Manage Games</h2>
        <p style={{ color: "#666" }}>Select a week from the sidebar to manage games.</p>
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
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h2 style={{ margin: 0, fontSize: "18px" }}>
          Admin: {league} Games
        </h2>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            padding: "6px 14px",
            background: "#ffcc00",
            color: "#333",
            border: "none",
            borderRadius: "2px",
            fontSize: "12px",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          {showForm ? "CANCEL" : "+ ADD GAME"}
        </button>
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

      {/* Add Game Form */}
      {showForm && (
        <form
          onSubmit={handleAddGame}
          style={{
            background: "#fffff0",
            border: "1px solid #ccc",
            borderTop: "none",
            padding: "16px",
            display: "grid",
            gridTemplateColumns: "1fr 1fr 100px 200px auto",
            gap: "8px",
            alignItems: "end",
            fontSize: "12px",
          }}
        >
          <div>
            <label style={adminLabelStyle}>Away Team</label>
            <input
              type="text"
              value={newGame.awayTeam}
              onChange={(e) => setNewGame({ ...newGame, awayTeam: e.target.value })}
              style={adminInputStyle}
              required
            />
          </div>
          <div>
            <label style={adminLabelStyle}>Home Team</label>
            <input
              type="text"
              value={newGame.homeTeam}
              onChange={(e) => setNewGame({ ...newGame, homeTeam: e.target.value })}
              style={adminInputStyle}
              required
            />
          </div>
          <div>
            <label style={adminLabelStyle}>Spread</label>
            <input
              type="number"
              step="0.5"
              value={newGame.spread}
              onChange={(e) => setNewGame({ ...newGame, spread: e.target.value })}
              style={adminInputStyle}
            />
          </div>
          <div>
            <label style={adminLabelStyle}>Game Time</label>
            <input
              type="datetime-local"
              value={newGame.gameTime}
              onChange={(e) => setNewGame({ ...newGame, gameTime: e.target.value })}
              style={adminInputStyle}
              required
            />
          </div>
          <button
            type="submit"
            style={{
              padding: "8px 16px",
              background: "#006600",
              color: "#fff",
              border: "none",
              borderRadius: "2px",
              fontSize: "12px",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            ADD
          </button>
        </form>
      )}

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
            <th style={thStyle}>Away</th>
            <th style={thStyle}>Home</th>
            <th style={thStyle}>Spread</th>
            <th style={thStyle}>Game Time</th>
            <th style={thStyle}>Status</th>
            <th style={thStyle}>Actions</th>
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
                No games for this week. Click &quot;+ ADD GAME&quot; to add games.
              </td>
            </tr>
          ) : (
            games.map((game) =>
              editingId === game.id ? (
                <tr key={game.id} style={{ background: "#fffff0" }}>
                  <td style={tdStyle}>
                    <input
                      type="text"
                      value={editData.awayTeam}
                      onChange={(e) => setEditData({ ...editData, awayTeam: e.target.value })}
                      style={{ ...adminInputStyle, width: "100%" }}
                    />
                  </td>
                  <td style={tdStyle}>
                    <input
                      type="text"
                      value={editData.homeTeam}
                      onChange={(e) => setEditData({ ...editData, homeTeam: e.target.value })}
                      style={{ ...adminInputStyle, width: "100%" }}
                    />
                  </td>
                  <td style={tdStyle}>
                    <input
                      type="number"
                      step="0.5"
                      value={editData.spread}
                      onChange={(e) => setEditData({ ...editData, spread: e.target.value })}
                      style={{ ...adminInputStyle, width: "80px" }}
                    />
                  </td>
                  <td style={tdStyle}>
                    <input
                      type="datetime-local"
                      value={editData.gameTime}
                      onChange={(e) => setEditData({ ...editData, gameTime: e.target.value })}
                      style={adminInputStyle}
                    />
                  </td>
                  <td style={tdStyle}>-</td>
                  <td style={tdStyle}>
                    <button
                      onClick={() => handleUpdateGame(game.id)}
                      style={saveBtnStyle}
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      style={cancelBtnStyle}
                    >
                      Cancel
                    </button>
                  </td>
                </tr>
              ) : (
                <tr key={game.id}>
                  <td style={{ ...tdStyle, fontWeight: "bold" }}>{game.awayTeam}</td>
                  <td style={{ ...tdStyle, fontWeight: "bold" }}>{game.homeTeam}</td>
                  <td style={{ ...tdStyle, textAlign: "center", color: "#660000", fontWeight: "bold" }}>
                    {game.spread === 0
                      ? "PK"
                      : game.spread < 0
                        ? `${game.homeTeam} ${game.spread}`
                        : `${game.awayTeam} -${game.spread}`}
                  </td>
                  <td style={{ ...tdStyle, fontSize: "10px" }}>
                    {new Date(game.gameTime).toLocaleString()}
                  </td>
                  <td style={tdStyle}>
                    {game.isFinal ? (
                      <span style={{ color: "#006600", fontWeight: "bold" }}>
                        Final {game.awayScore}-{game.homeScore}
                      </span>
                    ) : (
                      <span style={{ color: "#999" }}>Pending</span>
                    )}
                  </td>
                  <td style={tdStyle}>
                    <button onClick={() => startEdit(game)} style={editBtnStyle}>
                      Edit
                    </button>
                    <button onClick={() => handleDeleteGame(game.id)} style={deleteBtnStyle}>
                      Del
                    </button>
                  </td>
                </tr>
              )
            )
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
          fontSize: "11px",
          color: "#666",
        }}
      >
        {games.length} game(s) | Spread convention: negative = home team favored
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
const adminLabelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "10px",
  fontWeight: "bold",
  color: "#333",
  marginBottom: "2px",
};
const adminInputStyle: React.CSSProperties = {
  padding: "6px",
  border: "1px solid #999",
  borderRadius: "2px",
  fontSize: "12px",
};
const editBtnStyle: React.CSSProperties = {
  padding: "3px 8px",
  background: "#003366",
  color: "#fff",
  border: "none",
  borderRadius: "2px",
  fontSize: "10px",
  cursor: "pointer",
  marginRight: "4px",
};
const deleteBtnStyle: React.CSSProperties = {
  padding: "3px 8px",
  background: "#cc0000",
  color: "#fff",
  border: "none",
  borderRadius: "2px",
  fontSize: "10px",
  cursor: "pointer",
};
const saveBtnStyle: React.CSSProperties = {
  padding: "3px 8px",
  background: "#006600",
  color: "#fff",
  border: "none",
  borderRadius: "2px",
  fontSize: "10px",
  cursor: "pointer",
  marginRight: "4px",
};
const cancelBtnStyle: React.CSSProperties = {
  padding: "3px 8px",
  background: "#999",
  color: "#fff",
  border: "none",
  borderRadius: "2px",
  fontSize: "10px",
  cursor: "pointer",
};
