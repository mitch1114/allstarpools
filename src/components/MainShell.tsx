"use client";

import { Suspense, useState } from "react";
import Sidebar from "./Sidebar";

export default function MainShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div>
      {/* Mobile top bar */}
      <div className="app-topbar">
        <button
          onClick={() => setSidebarOpen(true)}
          aria-label="Open menu"
          style={{
            background: "transparent",
            border: "1px solid #88bbee",
            borderRadius: "4px",
            color: "#fff",
            fontSize: "18px",
            lineHeight: 1,
            padding: "8px 12px",
            cursor: "pointer",
          }}
        >
          ☰
        </button>
        <div style={{ fontSize: "15px", fontWeight: "bold" }}>
          ★ ALL STAR POOLS ★
        </div>
      </div>

      <div className="app-shell">
        <Suspense fallback={null}>
          <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        </Suspense>
        {sidebarOpen && (
          <div
            className="sidebar-overlay"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        )}
        <main className="app-main">{children}</main>
      </div>
    </div>
  );
}
