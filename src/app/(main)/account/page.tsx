"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";

export default function AccountPage() {
  const { data: session } = useSession();
  const [name, setName] = useState(session?.user?.name || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    setError("");

    if (newPassword && newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    setSaving(true);

    const res = await fetch("/api/account", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name || undefined,
        currentPassword: currentPassword || undefined,
        newPassword: newPassword || undefined,
      }),
    });

    const data = await res.json();
    setSaving(false);

    if (!res.ok) {
      setError(data.error);
    } else {
      setMessage("Account updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
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
        <h2 style={{ margin: 0, fontSize: "18px" }}>Account Settings</h2>
      </div>

      <div
        style={{
          background: "#fff",
          border: "1px solid #ccc",
          borderTop: "none",
          padding: "20px 24px",
          borderRadius: "0 0 4px 4px",
          maxWidth: "500px",
        }}
      >
        <div
          style={{
            background: "#f5f5f0",
            padding: "10px 14px",
            borderRadius: "4px",
            marginBottom: "20px",
            fontSize: "12px",
          }}
        >
          <strong>Player Code:</strong>{" "}
          {(session?.user as Record<string, unknown>)?.playerCode as string}
          <br />
          <span style={{ color: "#999", fontSize: "10px" }}>
            (Player codes cannot be changed)
          </span>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "14px" }}>
            <label style={labelStyle}>Display Name:</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={inputStyle}
            />
          </div>

          <div
            style={{
              borderTop: "1px solid #ddd",
              paddingTop: "14px",
              marginTop: "14px",
              marginBottom: "14px",
            }}
          >
            <div
              style={{
                fontSize: "12px",
                fontWeight: "bold",
                color: "#003366",
                marginBottom: "10px",
              }}
            >
              Change Password (optional)
            </div>

            <div style={{ marginBottom: "10px" }}>
              <label style={labelStyle}>Current Password:</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                style={inputStyle}
              />
            </div>

            <div style={{ marginBottom: "10px" }}>
              <label style={labelStyle}>New Password:</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                style={inputStyle}
              />
            </div>

            <div style={{ marginBottom: "14px" }}>
              <label style={labelStyle}>Confirm New Password:</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={inputStyle}
              />
            </div>
          </div>

          {error && (
            <p style={{ color: "#cc0000", fontSize: "12px", marginBottom: "10px" }}>
              {error}
            </p>
          )}
          {message && (
            <p style={{ color: "#006600", fontSize: "12px", marginBottom: "10px" }}>
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={saving}
            style={{
              padding: "10px 24px",
              background: "#003366",
              color: "#fff",
              border: "none",
              borderRadius: "2px",
              fontSize: "13px",
              fontWeight: "bold",
              cursor: saving ? "wait" : "pointer",
            }}
          >
            {saving ? "Saving..." : "SAVE CHANGES"}
          </button>
        </form>
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "12px",
  fontWeight: "bold",
  color: "#333",
  marginBottom: "4px",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "8px",
  border: "1px solid #999",
  borderRadius: "2px",
  fontSize: "13px",
  boxSizing: "border-box",
};
