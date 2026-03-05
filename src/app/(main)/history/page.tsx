"use client";

import { useEffect, useState } from "react";

interface SeasonSummary {
  year: number;
  id: string;
}

interface HistoryStanding {
  name: string;
  playerCode: string;
  totalPoints: number;
  wins: number;
  losses: number;
}

export default function HistoryPage() {
  const [seasons, setSeasons] = useState<SeasonSummary[]>([]);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [standings, setStandings] = useState<HistoryStanding[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/history/seasons")
      .then((r) => r.json())
      .then((data) => {
        setSeasons(data.seasons || []);
      })
      .catch(() => setSeasons([]));
  }, []);

  useEffect(() => {
    if (selectedYear === null) return;
    setLoading(true);
    fetch(`/api/history/standings?year=${selectedYear}`)
      .then((r) => r.json())
      .then((data) => {
        setStandings(data.standings || []);
        setLoading(false);
      })
      .catch(() => {
        setStandings([]);
        setLoading(false);
      });
  }, [selectedYear]);

  return (
    <div style={{ fontFamily: "Verdana, Geneva, sans-serif" }}>
      <div
        style={{
          background: "#003366",
          color: "#fff",
          padding: "12px 16px",
          borderRadius: "4px 4px 0 0",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h2 style={{ margin: 0, fontSize: "18px" }}>History</h2>
        {seasons.length > 0 && (
          <select
            value={selectedYear ?? ""}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            style={{
              padding: "4px 8px",
              fontSize: "12px",
              borderRadius: "2px",
              border: "1px solid #88bbee",
            }}
          >
            <option value="">Select Year</option>
            {seasons.map((s) => (
              <option key={s.id} value={s.year}>
                {s.year}
              </option>
            ))}
          </select>
        )}
      </div>

      <div
        style={{
          background: "#fff",
          border: "1px solid #ccc",
          borderTop: "none",
          padding: "20px",
          borderRadius: "0 0 4px 4px",
        }}
      >
        {!selectedYear ? (
          <div style={{ textAlign: "center", color: "#666", fontSize: "13px" }}>
            <p>Select a year above to view past results.</p>
            <p style={{ fontSize: "11px", color: "#999", marginTop: "12px" }}>
              Historical data from prior seasons will appear here once imported.
            </p>
          </div>
        ) : loading ? (
          <div style={{ textAlign: "center", color: "#666" }}>Loading...</div>
        ) : standings.length === 0 ? (
          <div style={{ textAlign: "center", color: "#666", fontSize: "13px" }}>
            <p>No data available for {selectedYear} yet.</p>
            <p style={{ fontSize: "11px", color: "#999" }}>
              Historical data will be imported from the old site.
            </p>
          </div>
        ) : (
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "12px",
            }}
          >
            <thead>
              <tr style={{ background: "#e8e8e0" }}>
                <th style={thStyle}>#</th>
                <th style={{ ...thStyle, textAlign: "left" }}>Player</th>
                <th style={thStyle}>W</th>
                <th style={thStyle}>L</th>
                <th style={thStyle}>Points</th>
              </tr>
            </thead>
            <tbody>
              {standings.map((s, idx) => (
                <tr
                  key={s.playerCode}
                  style={{
                    background:
                      idx === 0 ? "#fffff0" : idx % 2 === 0 ? "#fff" : "#fafaf5",
                  }}
                >
                  <td style={{ ...tdStyle, textAlign: "center", fontWeight: "bold", color: idx === 0 ? "#cc8800" : "#666" }}>
                    {idx + 1}{idx === 0 && " \u2605"}
                  </td>
                  <td style={{ ...tdStyle, fontWeight: "bold", color: "#003366" }}>
                    {s.name}
                  </td>
                  <td style={{ ...tdStyle, textAlign: "center", color: "#006600" }}>{s.wins}</td>
                  <td style={{ ...tdStyle, textAlign: "center", color: "#cc0000" }}>{s.losses}</td>
                  <td style={{ ...tdStyle, textAlign: "center", fontWeight: "bold", color: "#003366" }}>{s.totalPoints}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

const thStyle: React.CSSProperties = {
  padding: "8px 10px",
  textAlign: "center",
  fontSize: "11px",
  fontWeight: "bold",
  color: "#333",
  borderBottom: "2px solid #ccc",
};

const tdStyle: React.CSSProperties = {
  padding: "8px 10px",
  borderBottom: "1px solid #eee",
};
