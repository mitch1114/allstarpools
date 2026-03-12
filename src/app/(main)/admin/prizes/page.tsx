"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

interface Prize {
  id: string;
  weekId: string;
  userId: string;
  amount: number;
  note: string;
}

interface UserOption {
  id: string;
  name: string;
  playerCode: string;
}

export default function AdminPrizesPage() {
  const searchParams = useSearchParams();
  const weekId = searchParams.get("week") || "";

  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  // New prize form
  const [selectedUserId, setSelectedUserId] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    if (!weekId) {
      setLoading(false);
      return;
    }
    loadPrizes();
  }, [weekId]);

  function loadPrizes() {
    setLoading(true);
    fetch(`/api/admin/prizes?week=${weekId}`)
      .then((r) => r.json())
      .then((data) => {
        setPrizes(data.prizes || []);
        setUsers(data.users || []);
        setLoading(false);
      });
  }

  async function handleAdd() {
    if (!selectedUserId || !amount) {
      setMessage("Please select a player and enter an amount.");
      return;
    }

    const res = await fetch("/api/admin/prizes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        weekId,
        userId: selectedUserId,
        amount: parseFloat(amount),
        note,
      }),
    });

    if (res.ok) {
      setMessage("Prize saved!");
      setSelectedUserId("");
      setAmount("");
      setNote("");
      loadPrizes();
    } else {
      const data = await res.json();
      setMessage(`Error: ${data.error}`);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Remove this prize entry?")) return;
    const res = await fetch(`/api/admin/prizes?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      setMessage("Prize removed.");
      loadPrizes();
    }
  }

  function getUserName(userId: string) {
    const user = users.find((u) => u.id === userId);
    return user ? user.name : userId;
  }

  if (!weekId) {
    return (
      <div style={{ fontFamily: "Verdana, Geneva, sans-serif", padding: "20px" }}>
        <h2 style={{ color: "#003366" }}>Admin: Weekly Prizes</h2>
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
        <h2 style={{ margin: 0, fontSize: "18px" }}>Admin: Weekly Prizes</h2>
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

      {/* Add Prize Form */}
      <div
        style={{
          background: "#f5f5f0",
          border: "1px solid #ccc",
          borderTop: "none",
          padding: "12px 16px",
        }}
      >
        <div style={{ fontSize: "12px", fontWeight: "bold", color: "#003366", marginBottom: "8px" }}>
          Add Prize
        </div>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
          <select
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
            style={{
              padding: "6px 8px",
              border: "1px solid #999",
              borderRadius: "2px",
              fontSize: "12px",
              minWidth: "160px",
            }}
          >
            <option value="">Select Player</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} ({u.playerCode})
              </option>
            ))}
          </select>
          <input
            type="number"
            placeholder="$ Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            style={{
              padding: "6px 8px",
              border: "1px solid #999",
              borderRadius: "2px",
              fontSize: "12px",
              width: "100px",
            }}
            min={0}
            step={1}
          />
          <input
            type="text"
            placeholder="Note (optional)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            style={{
              padding: "6px 8px",
              border: "1px solid #999",
              borderRadius: "2px",
              fontSize: "12px",
              width: "160px",
            }}
          />
          <button
            onClick={handleAdd}
            style={{
              padding: "6px 16px",
              background: "#006600",
              color: "#fff",
              border: "none",
              borderRadius: "2px",
              fontSize: "12px",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            Add
          </button>
        </div>
      </div>

      {/* Existing Prizes */}
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
            <th style={thStyle}>Player</th>
            <th style={thStyle}>Amount</th>
            <th style={thStyle}>Note</th>
            <th style={thStyle}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={4} style={{ padding: "20px", textAlign: "center" }}>Loading...</td>
            </tr>
          ) : prizes.length === 0 ? (
            <tr>
              <td colSpan={4} style={{ padding: "20px", textAlign: "center", color: "#666" }}>
                No prizes entered for this week yet.
              </td>
            </tr>
          ) : (
            prizes.map((prize) => (
              <tr key={prize.id}>
                <td style={{ ...tdStyle, fontWeight: "bold" }}>{getUserName(prize.userId)}</td>
                <td style={{ ...tdStyle, color: "#006600", fontWeight: "bold" }}>
                  ${prize.amount.toFixed(0)}
                </td>
                <td style={{ ...tdStyle, color: "#666", fontSize: "11px" }}>{prize.note || "-"}</td>
                <td style={tdStyle}>
                  <button
                    onClick={() => handleDelete(prize.id)}
                    style={{
                      padding: "3px 8px",
                      background: "#cc0000",
                      color: "#fff",
                      border: "none",
                      borderRadius: "2px",
                      fontSize: "10px",
                      cursor: "pointer",
                    }}
                  >
                    Remove
                  </button>
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
        Enter prize money won by players each week. Totals appear in the Standings &quot;Total Cash&quot; column.
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
