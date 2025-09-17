// lib/hsuLint.ts  — starter checker (simple but works)
// Usage: import { lintAndFix } from "../lib/hsuLint";

export type Issue = {
  rule: string;
  severity: "warn" | "info";
  message: string;
  sample?: string;
  suggestion?: string;
};

function add(issues: Issue[], partial: Issue) {
  issues.push(partial);
}

export function lintAndFix(input: string): { fixedText: string; issues: Issue[] } {
  let text = input;
  const issues: Issue[] = [];

  // --- Terminology & usage ---
  if (/\bthe ADB\b/i.test(text)) {
    text = text.replace(/\bthe ADB\b/gi, "ADB");
    add(issues, { rule: "terminology", severity: "info", message: "Replaced “the ADB” → “ADB”." });
  }
  if (/\bINRM\b/.test(text)) {
    text = text.replace(/\bINRM\b/g, "resident mission");
    add(issues, { rule: "terminology", severity: "info", message: "Replaced “INRM” → “resident mission”." });
  }
  if (/\bstationary supplies\b/i.test(text)) {
    text = text.replace(/\bstationary supplies\b/gi, "stationery supplies");
    add(issues, { rule: "terminology", severity: "info", message: "Fixed stationary→stationery." });
  }

  // --- British spelling (small, safe subset) ---
  const pairs: Array<[RegExp, string, string?]> = [
    [/\bcolor\b/gi, "colour", "US→UK spelling"],
    [/\bbehavior\b/gi, "behaviour", "US→UK spelling"],
    [/\borganize\b/gi, "organise", "US→UK spelling"],
    [/\banalyze\b/gi, "analyse", "US→UK spelling"],
  ];
  for (const [r, to, note] of pairs) {
    if (r.test(text)) {
      text = text.replace(r, (m) => (m[0] === m[0].toUpperCase() ? to[0].toUpperCase() + to.slice(1) : to));
      add(issues, { rule: "british-spelling", severity: "info", message: note || "Spelling normalised." });
    }
  }

  // --- Formatting & structure ---
  // Remove footnote markers at the END of a heading line:  Title^1
  text = text.replace(/^(.+?)\^[a-z0-9]+\s*$/gim, (_m, p1: string) => {
    add(issues, { rule: "formatting", severity: "info", message: "Removed footnote marker from heading." });
    return p1;
  });
  // Annex → Appendix
  if (/\bAnnex\b/i.test(text)) {
    text = text.replace(/\bAnnex\b/gi, (m) => (m[0] === "A" ? "Appendix" : "appendix"));
    add(issues, { rule: "formatting", severity: "info", message: "Annex → Appendix." });
  }

  // --- Capitalization (Chicago down-style for generics) ---
  const gens: Array<[RegExp, string]> = [
    [/\bThe Government\b/g, "the government"],
    [/\bThe Ministry\b/g, "the ministry"],
    [/\bThe Department\b/g, "the department"],
    [/\bThe Project\b/g, "the project"],
  ];
  gens.forEach(([r, rep]) => {
    if (r.test(text)) {
      text = text.replace(r, rep);
      add(issues, { rule: "capitalization", severity: "info", message: `Lowercased generic: ${rep}.` });
    }
  });

  // --- Numbers ---
  // Remove dual forms “nine (9)”
  text = text.replace(/\b(one|two|three|four|five|six|seven|eight|nine)\s*\((\d)\)/gi, (_m, w: string) => {
    add(issues, { rule: "numbers", severity: "info", message: "Removed dual form like “nine (9)”." });
    return w.toLowerCase();
  });
  // 5 % → 5%
  if (/\b\d+\s%/.test(text)) {
    text = text.replace(/\b(\d+)\s%/g, "$1%");
    add(issues, { rule: "numbers", severity: "info", message: "Normalised percent spacing to “5%”." });
  }
  // 2 : 1 → 2:1
  if (/\b\d+\s:\s\d+\b/.test(text)) {
    text = text.replace(/\b(\d+)\s:\s(\d+)\b/g, "$1:$2");
    add(issues, { rule: "numbers", severity: "info", message: "Normalised ratio spacing to “2:1”." });
  }
  // .33 → 0.33
  if (/(^|[^0-9])\.(\d+)/.test(text)) {
    text = text.replace(/(^|[^0-9])\.(\d+)/g, "$10.$2");
    add(issues, { rule: "numbers", severity: "info", message: "Added leading zero to decimals (0.33)." });
  }

  // --- Dates & time ---
  // 3pm / 3 pm → 3 p.m.
  if (/\b(\d{1,2})\s?(am|pm)\b/i.test(text)) {
    text = text.replace(/\b(\d{1,2})\s?(am|pm)\b/gi, (_m, h: string, ap: string) => `${h} ${ap.toLowerCase()==="am"?"a.m.":"p.m."}`);
    add(issues, { rule: "time", severity: "info", message: "Formatted to “a.m.”/“p.m.”." });
  }
  // 12:00 ambiguity (flag only)
  if (/\b12:00\b/.test(text)) {
    add(issues, { rule: "time", severity: "warn", message: "“12:00” is ambiguous; use “noon” or “midnight”." });
  }
  // FY definition rule (flag if missing “ending/ended …” in same paragraph)
  if (/FY20\d{2}/.test(text) && !/FY20\d{2}[^.\n]*(ending|ended)/i.test(text)) {
    add(issues, { rule: "dates", severity: "warn", message: "Define FY at first mention, e.g., “FY2025 (ending 15 July 2025)”." });
  }

  // --- Punctuation & dashes ---
  // Year range 2022-2024 → 2022–2024 (en dash)
  if (/\b(\d{4})-(\d{4})\b/.test(text)) {
    text = text.replace(/\b(\d{4})-(\d{4})\b/g, "$1–$2");
    add(issues, { rule: "punctuation", severity: "info", message: "Year range dash → en dash (–)." });
  }
  // cost recovery mechanism variants → cost-recovery mechanism
  text = text.replace(/\bcost\s?recovery\s?mechanism\b/gi, "cost-recovery mechanism");

  // --- References (flag) ---
  if (/^\s*Bibliography:/im.test(text)) {
    add(issues, { rule: "references", severity: "warn", message: "Use footnotes per ADB standards (avoid bibliography in Board docs)." });
  }
  if (/(https?:\/\/[^\s)]+|www\.[^\s)]+)/i.test(text)) {
    text = text.replace(/(https?:\/\/[^\s)]+|www\.[^\s)]+)/gi, (m) => (m.startsWith("http") ? m : "https://" + m));
    add(issues, { rule: "references", severity: "info", message: "Normalised plain URLs to full links." });
  }

  // --- Currency ---
  if (/\bNRp\b/.test(text)) {
    text = text.replace(/\bNRp\b/g, "NPR");
    add(issues, { rule: "currency", severity: "info", message: "Standardised currency: NRp → NPR." });
  }

  // --- Language flags (clichés / Latinisms) ---
  const badWords = ["move the needle","low-hanging fruit","synergize","game-changer","inter alia","vis-à-vis","vis-a-vis","per se"];
  badWords.forEach((w) => {
    if (new RegExp(`\\b${w}\\b`, "i").test(text)) {
      add(issues, { rule: "language", severity: "warn", message: `Avoid: “${w}”.` });
    }
  });

  return { fixedText: text, issues };
}
