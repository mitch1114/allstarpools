"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [playerCode, setPlayerCode] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 4) {
      setError("Password must be at least 4 characters.");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Reset failed.");
    } else {
      setSuccess(true);
      setPlayerCode(data.playerCode || "");
    }
  }

  if (!token) {
    return (
      <div style={{ textAlign: "center" }}>
        <p style={{ color: "#cc0000" }}>Invalid reset link. No token provided.</p>
        <Link href="/login" style={{ color: "#003366" }}>
          Back to Login
        </Link>
      </div>
    );
  }

  return (
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
          marginBottom: "20px",
        }}
      >
        Reset Password
      </h1>

      {success ? (
        <div>
          <p style={{ color: "#006600", fontSize: "14px", marginBottom: "8px" }}>
            Your password has been reset successfully!
          </p>
          {playerCode && (
            <p style={{ fontSize: "13px", marginBottom: "16px" }}>
              Your player code is: <strong>{playerCode}</strong>
            </p>
          )}
          <Link
            href="/login"
            style={{
              color: "#003366",
              fontWeight: "bold",
              textDecoration: "underline",
            }}
          >
            Log In Now
          </Link>
        </div>
      ) : (
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
              New Password:
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
              Confirm New Password:
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
            {loading ? "Resetting..." : "RESET PASSWORD"}
          </button>
        </form>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
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
      <Suspense fallback={<div>Loading...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
