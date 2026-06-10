"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useEffect, useState } from "react";

interface WeekOption {
  id: string;
  number: number;
  label: string;
}

interface SidebarProps {
  open?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ open = false, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const [weeks, setWeeks] = useState<WeekOption[]>([]);
  const [selectedLeague, setSelectedLeague] = useState(
    searchParams.get("league") || "NCAAF"
  );
  const [selectedWeek, setSelectedWeek] = useState(
    searchParams.get("week") || ""
  );

  useEffect(() => {
    fetch("/api/weeks")
      .then((r) => r.json())
      .then((data) => {
        setWeeks(data.weeks || []);
        if (!selectedWeek && data.activeWeek) {
          setSelectedWeek(data.activeWeek);
          // Navigate to update URL params so pages get the week
          const params = new URLSearchParams();
          params.set("league", selectedLeague);
          params.set("week", data.activeWeek);
          router.replace(`${pathname}?${params.toString()}`);
        }
      });
  }, []);

  function navigateWithParams(league?: string, week?: string) {
    const l = league || selectedLeague;
    const w = week || selectedWeek;
    const params = new URLSearchParams();
    params.set("league", l);
    if (w) params.set("week", w);
    router.push(`${pathname}?${params.toString()}`);
  }

  function handleLeagueChange(league: string) {
    setSelectedLeague(league);
    navigateWithParams(league, undefined);
  }

  function handleWeekChange(weekId: string) {
    setSelectedWeek(weekId);
    navigateWithParams(undefined, weekId);
  }

  const navItems = [
    { href: "/dashboard", label: "Home" },
    { href: "/picks", label: "Make Picks" },
    { href: "/my-picks", label: "My Picks" },
    { href: "/all-picks", label: "Everyone's Picks" },
    { href: "/standings", label: "Standings" },
    { href: "/history", label: "History" },
    { href: "/rules", label: "Rules" },
    { href: "/account", label: "Account" },
  ];

  const isAdmin = Boolean((session?.user as Record<string, unknown>)?.isAdmin);

  return (
    <div
      className={`app-sidebar${open ? " open" : ""}`}
      style={{
        fontFamily: "Verdana, Geneva, sans-serif",
        fontSize: "12px",
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: "16px 12px",
          textAlign: "center",
          borderBottom: "1px solid #004488",
          position: "relative",
        }}
      >
        <button
          className="sidebar-close"
          onClick={onClose}
          aria-label="Close menu"
          style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            background: "transparent",
            border: "none",
            color: "#88bbee",
            fontSize: "20px",
            cursor: "pointer",
            padding: "4px 8px",
          }}
        >
          ✕
        </button>
        <div style={{ fontSize: "16px", fontWeight: "bold" }}>
          ★ ALL STAR ★
        </div>
        <div style={{ fontSize: "11px", color: "#88bbee" }}>POOLS</div>
      </div>

      {/* User info */}
      {session?.user && (
        <div
          style={{
            padding: "10px 12px",
            borderBottom: "1px solid #004488",
            fontSize: "11px",
            color: "#aaccee",
          }}
        >
          Welcome, <strong style={{ color: "#fff" }}>{session.user.name}</strong>
        </div>
      )}

      {/* League Switcher */}
      <div
        style={{
          padding: "12px",
          borderBottom: "1px solid #004488",
        }}
      >
        <div
          style={{
            fontSize: "10px",
            textTransform: "uppercase",
            color: "#88bbee",
            marginBottom: "6px",
            fontWeight: "bold",
          }}
        >
          League
        </div>
        <div style={{ display: "flex", gap: "4px" }}>
          {["NCAAF", "NFL"].map((league) => (
            <button
              key={league}
              onClick={() => handleLeagueChange(league)}
              style={{
                flex: 1,
                padding: "8px 4px",
                background:
                  selectedLeague === league ? "#fff" : "transparent",
                color: selectedLeague === league ? "#003366" : "#88bbee",
                border: "1px solid #88bbee",
                borderRadius: "2px",
                fontSize: "11px",
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              {league}
            </button>
          ))}
        </div>
      </div>

      {/* Week Dropdown */}
      <div
        style={{
          padding: "12px",
          borderBottom: "1px solid #004488",
        }}
      >
        <div
          style={{
            fontSize: "10px",
            textTransform: "uppercase",
            color: "#88bbee",
            marginBottom: "6px",
            fontWeight: "bold",
          }}
        >
          Week
        </div>
        <select
          value={selectedWeek}
          onChange={(e) => handleWeekChange(e.target.value)}
          style={{
            width: "100%",
            padding: "8px 6px",
            border: "1px solid #88bbee",
            borderRadius: "2px",
            fontSize: "13px",
            background: "#fff",
            color: "#333",
          }}
        >
          <option value="">Select Week</option>
          {weeks.map((w) => (
            <option key={w.id} value={w.id}>
              {w.label}
            </option>
          ))}
        </select>
      </div>

      {/* Navigation */}
      <nav style={{ padding: "8px 0" }}>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={`${item.href}?league=${selectedLeague}${selectedWeek ? `&week=${selectedWeek}` : ""}`}
              onClick={onClose}
              style={{
                display: "block",
                padding: "10px 16px",
                color: isActive ? "#fff" : "#aaccee",
                background: isActive ? "#004488" : "transparent",
                textDecoration: "none",
                fontSize: "13px",
                fontWeight: isActive ? "bold" : "normal",
                borderLeft: isActive ? "3px solid #ffcc00" : "3px solid transparent",
              }}
            >
              {item.label}
            </Link>
          );
        })}

        {isAdmin && (
          <>
            <div
              style={{
                padding: "10px 16px 4px",
                fontSize: "10px",
                color: "#ffcc00",
                textTransform: "uppercase",
                fontWeight: "bold",
                borderTop: "1px solid #004488",
                marginTop: "8px",
              }}
            >
              Admin
            </div>
            {selectedWeek && (
              <button
                onClick={async () => {
                  const res = await fetch("/api/admin/weeks", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ weekId: selectedWeek }),
                  });
                  if (res.ok) {
                    alert("Default week updated!");
                  }
                }}
                style={{
                  display: "block",
                  width: "calc(100% - 32px)",
                  margin: "4px 16px",
                  padding: "8px",
                  background: "transparent",
                  color: "#ddaa44",
                  border: "1px solid #ddaa44",
                  borderRadius: "2px",
                  fontSize: "10px",
                  cursor: "pointer",
                  textAlign: "center",
                }}
              >
                Set Current Week as Default
              </button>
            )}
            {[
              { href: "/admin/games", label: "Manage Games" },
              { href: "/admin/scores", label: "Enter Scores" },
              { href: "/admin/players", label: "Manage Players" },
              { href: "/admin/prizes", label: "Weekly Prizes" },
            ].map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={`${item.href}?league=${selectedLeague}${selectedWeek ? `&week=${selectedWeek}` : ""}`}
                  onClick={onClose}
                  style={{
                    display: "block",
                    padding: "10px 16px",
                    color: isActive ? "#ffcc00" : "#ddaa44",
                    background: isActive ? "#004488" : "transparent",
                    textDecoration: "none",
                    fontSize: "13px",
                    fontWeight: isActive ? "bold" : "normal",
                    borderLeft: isActive
                      ? "3px solid #ffcc00"
                      : "3px solid transparent",
                  }}
                >
                  {item.label}
                </Link>
              );
            })}
          </>
        )}
      </nav>

      {/* Logout */}
      <div style={{ padding: "12px", borderTop: "1px solid #004488", marginTop: "auto" }}>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          style={{
            width: "100%",
            padding: "10px",
            background: "transparent",
            color: "#88bbee",
            border: "1px solid #88bbee",
            borderRadius: "2px",
            fontSize: "11px",
            cursor: "pointer",
          }}
        >
          LOG OUT
        </button>
      </div>
    </div>
  );
}
