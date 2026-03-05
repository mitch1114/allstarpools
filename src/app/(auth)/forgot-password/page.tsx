"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    const res = await fetch("/api/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Something went wrong.");
    } else {
      setMessage(
        "If an account exists with that email, you will receive a reset link. Check your inbox (and spam folder)."
      );
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
            fontSize: "22px",
            fontWeight: "bold",
            marginBottom: "4px",
          }}
        >
          Forgot Password / Code
        </h1>
        <p
          style={{
            color: "#666",
            fontSize: "12px",
            marginBottom: "20px",
            fontStyle: "italic",
          }}
        >
          Enter your email to receive your player code and a password reset link.
        </p>

        <form onSubmit={handleSubmit}>
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
              Email Address:
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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

          {message && (
            <p style={{ color: "#006600", fontSize: "12px", marginBottom: "12px" }}>
              {message}
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
            {loading ? "Sending..." : "SEND RESET LINK"}
          </button>
        </form>

        <div style={{ marginTop: "16px", fontSize: "12px" }}>
          <Link
            href="/login"
            style={{ color: "#003366", textDecoration: "underline" }}
          >
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
