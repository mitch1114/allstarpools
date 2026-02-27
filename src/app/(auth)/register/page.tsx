"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [playerCode, setPlayerCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (playerCode.length < 3) {
      setError("Player Code must be at least 3 characters.");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, playerCode, password }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Registration failed.");
    } else {
      router.push("/login");
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f5f5f0",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Verdana, Geneva, sans-serif",
      }}
    >
      <div
        style={{
          background: "#fff",
          border: "2px solid #003366",
          borderRadius: "4px",
          padding: "30px 40px",
          width: "420px",
          maxWidth: "95vw",
          textAlign: "center",
        }}
      >
        <h1
          style={{
            color: "#003366",
            fontSize: "24px",
            fontWeight: "bold",
            marginBottom: "4px",
          }}
        >
          ★ NEW PLAYER REGISTRATION ★
        </h1>
        <p
          style={{
            color: "#666",
            fontSize: "12px",
            marginBottom: "20px",
            fontStyle: "italic",
          }}
        >
          Join All Star Pools
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "12px", textAlign: "left" }}>
            <label
              style={{
                display: "block",
                fontSize: "12px",
                fontWeight: "bold",
                color: "#333",
                marginBottom: "4px",
              }}
            >
              Your Name:
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{
                width: "100%",
                padding: "8px",
                border: "1px solid #999",
                borderRadius: "2px",
                fontSize: "14px",
                boxSizing: "border-box",
              }}
              required
            />
          </div>

          <div style={{ marginBottom: "12px", textAlign: "left" }}>
            <label
              style={{
                display: "block",
                fontSize: "12px",
                fontWeight: "bold",
                color: "#333",
                marginBottom: "4px",
              }}
            >
              Choose a Player Code:
            </label>
            <input
              type="text"
              value={playerCode}
              onChange={(e) => setPlayerCode(e.target.value)}
              style={{
                width: "100%",
                padding: "8px",
                border: "1px solid #999",
                borderRadius: "2px",
                fontSize: "14px",
                boxSizing: "border-box",
              }}
              required
            />
          </div>

          <div style={{ marginBottom: "12px", textAlign: "left" }}>
            <label
              style={{
                display: "block",
                fontSize: "12px",
                fontWeight: "bold",
                color: "#333",
                marginBottom: "4px",
              }}
            >
              Password:
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: "100%",
                padding: "8px",
                border: "1px solid #999",
                borderRadius: "2px",
                fontSize: "14px",
                boxSizing: "border-box",
              }}
              required
            />
          </div>

          <div style={{ marginBottom: "16px", textAlign: "left" }}>
            <label
              style={{
                display: "block",
                fontSize: "12px",
                fontWeight: "bold",
                color: "#333",
                marginBottom: "4px",
              }}
            >
              Confirm Password:
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              style={{
                width: "100%",
                padding: "8px",
                border: "1px solid #999",
                borderRadius: "2px",
                fontSize: "14px",
                boxSizing: "border-box",
              }}
              required
            />
          </div>

          {error && (
            <p style={{ color: "#cc0000", fontSize: "12px", marginBottom: "12px" }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "10px",
              background: "#003366",
              color: "#fff",
              border: "none",
              borderRadius: "2px",
              fontSize: "14px",
              fontWeight: "bold",
              cursor: loading ? "wait" : "pointer",
            }}
          >
            {loading ? "Creating Account..." : "CREATE ACCOUNT"}
          </button>
        </form>

        <div style={{ marginTop: "16px", fontSize: "12px" }}>
          Already have an account?{" "}
          <Link
            href="/login"
            style={{ color: "#003366", textDecoration: "underline" }}
          >
            Log In
          </Link>
        </div>
      </div>
    </div>
  );
}
