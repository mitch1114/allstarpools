export default function RulesPage() {
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
        <h2 style={{ margin: 0, fontSize: "18px" }}>Rules &amp; Scoring</h2>
      </div>

      <div
        style={{
          background: "#fff",
          border: "1px solid #ccc",
          borderTop: "none",
          padding: "20px 24px",
          borderRadius: "0 0 4px 4px",
          fontSize: "13px",
          lineHeight: "1.7",
          color: "#333",
        }}
      >
        <h3 style={{ color: "#003366", borderBottom: "1px solid #ddd", paddingBottom: "6px" }}>
          The Scoring System
        </h3>

        <p>
          Every week there are <strong>14 NCAAF</strong> and{" "}
          <strong>14 NFL</strong> games to choose from.
        </p>

        <ul style={{ paddingLeft: "24px" }}>
          <li>Games/Spreads are typically posted Tuesday nights.</li>
          <li>
            Each week, you&apos;ll pick a total of <strong>10 NCAAF</strong> and{" "}
            <strong>10 NFL</strong> games from the 14 available.
          </li>
          <li>
            Out of your 10 picks in each league:
            <ul>
              <li>
                <strong>7 Regular Picks</strong>
              </li>
              <li>
                <strong>3 Hot Picks (HP)</strong>
              </li>
            </ul>
          </li>
          <li>
            So at the end of the day, you&apos;ll have{" "}
            <strong>7 regular picks + 3 Hot Picks</strong> for NCAAF and{" "}
            <strong>7 regular picks + 3 Hot Picks</strong> for NFL.
          </li>
        </ul>

        <h3 style={{ color: "#003366", borderBottom: "1px solid #ddd", paddingBottom: "6px", marginTop: "20px" }}>
          Point Values
        </h3>

        <table
          style={{
            borderCollapse: "collapse",
            margin: "12px 0",
            fontSize: "12px",
          }}
        >
          <thead>
            <tr style={{ background: "#e8e8e0" }}>
              <th style={ruleThStyle}>Pick Type</th>
              <th style={ruleThStyle}>Correct</th>
              <th style={ruleThStyle}>Wrong</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={ruleTdStyle}>Regular Pick</td>
              <td style={{ ...ruleTdStyle, color: "#006600", fontWeight: "bold" }}>
                +1 point
              </td>
              <td style={{ ...ruleTdStyle, color: "#999" }}>0 points</td>
            </tr>
            <tr style={{ background: "#fffff0" }}>
              <td style={ruleTdStyle}>
                <strong>★ Hot Pick (HP)</strong>
              </td>
              <td style={{ ...ruleTdStyle, color: "#006600", fontWeight: "bold" }}>
                +2 points
              </td>
              <td style={{ ...ruleTdStyle, color: "#cc0000", fontWeight: "bold" }}>
                -1 point
              </td>
            </tr>
          </tbody>
        </table>

        <h3 style={{ color: "#003366", borderBottom: "1px solid #ddd", paddingBottom: "6px", marginTop: "20px" }}>
          Important Rules
        </h3>

        <ul style={{ paddingLeft: "24px" }}>
          <li>
            <strong>Pushes are a loss all around.</strong> If the game lands
            exactly on the spread, it counts as a loss.
          </li>
          <li>
            <strong>Picks lock at game time.</strong> The site will
            automatically lock each game from picking as soon as the start time
            hits. Make sure you get your picks in early!
          </li>
        </ul>

        <h3 style={{ color: "#003366", borderBottom: "1px solid #ddd", paddingBottom: "6px", marginTop: "20px" }}>
          Weekly Summary
        </h3>

        <div
          style={{
            background: "#f5f5f0",
            padding: "12px 16px",
            borderRadius: "4px",
            border: "1px solid #ddd",
            fontSize: "12px",
          }}
        >
          <table style={{ borderCollapse: "collapse", width: "100%" }}>
            <tbody>
              <tr>
                <td style={{ padding: "4px 8px", fontWeight: "bold" }}>Games Available:</td>
                <td style={{ padding: "4px 8px" }}>14 per league (NCAAF + NFL)</td>
              </tr>
              <tr>
                <td style={{ padding: "4px 8px", fontWeight: "bold" }}>Games to Pick:</td>
                <td style={{ padding: "4px 8px" }}>10 per league</td>
              </tr>
              <tr>
                <td style={{ padding: "4px 8px", fontWeight: "bold" }}>Regular Picks:</td>
                <td style={{ padding: "4px 8px" }}>7 per league</td>
              </tr>
              <tr>
                <td style={{ padding: "4px 8px", fontWeight: "bold" }}>Hot Picks:</td>
                <td style={{ padding: "4px 8px" }}>3 per league</td>
              </tr>
              <tr>
                <td style={{ padding: "4px 8px", fontWeight: "bold" }}>Total Weekly Picks:</td>
                <td style={{ padding: "4px 8px" }}>20 (10 NCAAF + 10 NFL)</td>
              </tr>
              <tr>
                <td style={{ padding: "4px 8px", fontWeight: "bold" }}>Max Possible Points:</td>
                <td style={{ padding: "4px 8px" }}>
                  13 per league (7×1 + 3×2 = 13), 26 total
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const ruleThStyle: React.CSSProperties = {
  padding: "8px 16px",
  textAlign: "left",
  borderBottom: "2px solid #ccc",
  fontWeight: "bold",
};

const ruleTdStyle: React.CSSProperties = {
  padding: "8px 16px",
  borderBottom: "1px solid #eee",
};
