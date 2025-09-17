import React, { useState } from "react";
import { lintAndFix } from "../lib/lib/hsuLint";


export default function HsuTestPage() {
  const [input, setInput] = useState<string>(`THE ADB STRATEGIC INITIATIVE – DRAFT^1
The ADB will coordinate with The Ministry. INRM will implement. Stationary supplies needed.
We bought nine (9) laptops and 5 % paper; ratio 2 : 1. Kickoff 3pm. FY2025 ends 15 July 2025.
Bibliography: ADB (2024). Retrieved from www.adb.org/report. "Straight" and “smart” quotes.`);

  const [fixed, setFixed] = useState<string>("");
  const [issues, setIssues] = useState<
    { rule: string; severity: "warn" | "info"; message: string; sample?: string; suggestion?: string }[]
  >([]);

  function run() {
    const { fixedText, issues } = lintAndFix(input);
    setFixed(fixedText);
    setIssues(issues);
  }

  return (
    <div style={{ maxWidth: 900, margin: "24px auto", padding: 16 }}>
      <h1>HSU Lint — Quick Test</h1>

      <label>Paste text to check</label>
      <textarea
        style={{ width: "100%", height: 180, margin: "8px 0" }}
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />

      <button onClick={run} style={{ padding: "8px 12px", marginBottom: 16 }}>
        Run HSU Check
      </button>

      <h2>Fixed Text</h2>
      <textarea
        style={{ width: "100%", height: 180, marginBottom: 16 }}
        value={fixed}
        readOnly
      />

      <h2>Issues</h2>
      <table width="100%" border={1} cellPadding={6}>
        <thead>
          <tr>
            <th>Rule</th>
            <th>Severity</th>
            <th>Message</th>
          </tr>
        </thead>
        <tbody>
          {issues.map((it, i) => (
            <tr key={i}>
              <td>{it.rule}</td>
              <td>{it.severity}</td>
              <td>{it.message}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
