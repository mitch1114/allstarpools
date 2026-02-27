"use client";

import { useEffect, useState } from "react";

interface Player {
  id: string;
  playerCode: string;
  name: string;
  email: string;
  isAdmin: boolean;
  createdAt: string;
  _count: { picks: number };
}

export default function AdminPlayersPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState({ name: "", isAdmin: false, resetPassword: "" });

  useEffect(() => {
    loadPlayers();
  }, []);

  function loadPlayers() {
    setLoading(true);
    fetch("/api/admin/players")
      .then((r) => r.json())
      .then((data) => {
        setPlayers(data.players || []);
        setLoading(false);
      });
  }

  function startEdit(player: Player) {
    setEditingId(player.id);
    setEditData({ name: player.name, isAdmin: player.isAdmin, resetPassword: "" });
  }

  async function handleUpdate(id: string) {
    const res = await fetch("/api/admin/players", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id,
        name: editData.name,
        isAdmin: editData.isAdmin,
        resetPassword: editData.resetPassword || undefined,
      }),
    });

    if (res.ok) {
      setMessage("Player updated!");
      setEditingId(null);
      loadPlayers();
    } else {
      const data = await res.json();
      setMessage(`Error: ${data.error}`);
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete player "${name}" and all their picks? This cannot be undone.`)) return;

    const res = await fetch(`/api/admin/players?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      setMessage("Player deleted.");
      loadPlayers();
    }
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
        <h2 style={{ margin: 0, fontSize: "18px" }}>Admin: Manage Players</h2>
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
            <th style={thStyle}>Player Code</th>
            <th style={thStyle}>Name</th>
            <th style={thStyle}>Admin</th>
            <th style={thStyle}>Picks</th>
            <th style={thStyle}>Joined</th>
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
          ) : (
            players.map((player) =>
              editingId === player.id ? (
                <tr key={player.id} style={{ background: "#fffff0" }}>
                  <td style={tdStyle}>
                    <strong>{player.playerCode}</strong>
                  </td>
                  <td style={tdStyle}>
                    <input
                      type="text"
                      value={editData.name}
                      onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                      style={inputStyle}
                    />
                  </td>
                  <td style={{ ...tdStyle, textAlign: "center" }}>
                    <input
                      type="checkbox"
                      checked={editData.isAdmin}
                      onChange={(e) => setEditData({ ...editData, isAdmin: e.target.checked })}
                    />
                  </td>
                  <td style={tdStyle}>{player._count.picks}</td>
                  <td style={tdStyle}>
                    <input
                      type="text"
                      placeholder="New password (optional)"
                      value={editData.resetPassword}
                      onChange={(e) => setEditData({ ...editData, resetPassword: e.target.value })}
                      style={{ ...inputStyle, width: "140px" }}
                    />
                  </td>
                  <td style={tdStyle}>
                    <button onClick={() => handleUpdate(player.id)} style={saveBtnStyle}>
                      Save
                    </button>
                    <button onClick={() => setEditingId(null)} style={cancelBtnStyle}>
                      Cancel
                    </button>
                  </td>
                </tr>
              ) : (
                <tr key={player.id}>
                  <td style={{ ...tdStyle, fontWeight: "bold" }}>{player.playerCode}</td>
                  <td style={tdStyle}>{player.name}</td>
                  <td style={{ ...tdStyle, textAlign: "center" }}>
                    {player.isAdmin ? (
                      <span style={{ color: "#cc8800", fontWeight: "bold" }}>Admin</span>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td style={{ ...tdStyle, textAlign: "center" }}>{player._count.picks}</td>
                  <td style={{ ...tdStyle, fontSize: "10px", color: "#666" }}>
                    {new Date(player.createdAt).toLocaleDateString()}
                  </td>
                  <td style={tdStyle}>
                    <button onClick={() => startEdit(player)} style={editBtnStyle}>
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(player.id, player.name)}
                      style={deleteBtnStyle}
                    >
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
        {players.length} player(s) registered
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

const inputStyle: React.CSSProperties = {
  padding: "4px 6px",
  border: "1px solid #999",
  borderRadius: "2px",
  fontSize: "12px",
  width: "100%",
  boxSizing: "border-box",
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
