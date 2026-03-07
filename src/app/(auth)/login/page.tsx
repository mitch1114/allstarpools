"use client";

import { signIn } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { checkAndSeedDatabase } from "./actions";

export default function LoginPage() {
  const [playerCode, setPlayerCode] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [seedStatus, setSeedStatus] = useState("");
  const router = useRouter();

  useEffect(() => {
    checkAndSeedDatabase().then((result) => {
      if (result.seeded) {
        setSeedStatus("Database initialized! You can now log in.");
      }
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      playerCode,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Invalid Player Code or Password.");
    } else {
      router.push("/dashboard");
      router.refresh();
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
          width: "400px",
          maxWidth: "95vw",
          textAlign: "center",
        }}
      >
        <h1
          style={{
            color: "#003366",
            fontSize: "28px",
            fontWeight: "bold",
            marginBottom: "4px",
          }}
        >
          ★ ALL STAR POOLS ★
        </h1>
        <p
          style={{
            color: "#666",
            fontSize: "12px",
            marginBottom: "20px",
            fontStyle: "italic",
          }}
        >
          NFL &amp; NCAAF Spread Pool
        </p>

        {seedStatus && (
          <p style={{ color: "#006600", fontSize: "12px", marginBottom: "12px", background: "#e6ffe6", padding: "8px", borderRadius: "4px" }}>
            {seedStatus}
          </p>
        )}

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
              Player Code:
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
            {loading ? "Logging in..." : "LOG IN"}
          </button>
        </form>

        <div style={{ marginTop: "16px", fontSize: "11px" }}>
          <Link
            href="/forgot-password"
            style={{ color: "#003366", textDecoration: "underline" }}
          >
            Forgot password or code?
          </Link>
        </div>

        <div
          style={{
            marginTop: "20px",
            paddingTop: "16px",
            borderTop: "1px solid #ddd",
            fontSize: "12px",
          }}
        >
          <Link
            href="/register"
            style={{
              color: "#003366",
              fontWeight: "bold",
              textDecoration: "underline",
            }}
          >
            NEW players, Click Here
          </Link>
        </div>
      </div>

      <p style={{ marginTop: "16px", color: "#999", fontSize: "10px" }}>
        &copy; {new Date().getFullYear()} All Star Pools
      </p>
    </div>
  );
}
