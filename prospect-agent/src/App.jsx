import { useState } from "react";

const WC_COLORS = {
  high:    { bg: "rgba(16,185,129,0.12)", text: "#10b981", border: "rgba(16,185,129,0.3)", label: "High WC Focus" },
  medium:  { bg: "rgba(245,158,11,0.12)", text: "#f59e0b", border: "rgba(245,158,11,0.3)", label: "Medium WC Focus" },
  low:     { bg: "rgba(239,68,68,0.12)",  text: "#ef4444", border: "rgba(239,68,68,0.3)",  label: "Low WC Focus" },
  unknown: { bg: "rgba(148,163,184,0.1)", text: "#94a3b8", border: "rgba(148,163,184,0.2)", label: "Focus Unknown" },
};

function Badge({ level }) {
  const c = WC_COLORS[level] || WC_COLORS.unknown;
  return (
    <span style={{ background: c.bg, color: c.text, border: `1px solid ${c.border}`, padding: "4px 12px", borderRadius: 20, fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>
      {c.label}
    </span>
  );
}

function Card({ children, style }) {
  return (
    <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "16px 18px", ...style }}>
      {children}
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(148,163,184,0.6)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>
      {children}
    </div>
  );
}

function PersonCard({ person }) {
  return (
    <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10, padding: "12px 14px", marginBottom: 8 }}>
      <div style={{ color: "#e2e8f0", fontWeight: 600, fontSize: 14 }}>{person.name}</div>
      <div style={{ color: "#60a5fa", fontSize: 12, marginTop: 2 }}>{person.title}</div>
      {person.note && <div style={{ color: "rgba(148,163,184,0.8)", fontSize: 12, marginTop: 6, lineHeight: 1.6 }}>{person.note}</div>}
    </div>
  );
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={copy} style={{ marginTop: 12, background: "transparent", border: "1px solid rgba(59,130,246,0.3)", borderRadius: 6, color: copied ? "#10b981" : "#60a5fa", fontSize: 11, fontWeight: 600, padding: "4px 12px", cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s" }}>
      {copied ? "Copied!" : "Copy to clipboard"}
    </button>
  );
}

export default function ProspectAgent() {
  const [firmName, setFirmName] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [log, setLog] = useState([]);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const addLog = (msg) => setLog(prev => [...prev, msg]);

  const runAgent = async () => {
    if (!firmName.trim() || loading) return;
    setLoading(true); setResult(null); setError(null); setLog([]);
    addLog(`Researching: ${firmName}${location ? `, ${location}` : ""}...`);
    addLog("Running web searches...");
    try {
      const response = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firmName: firmName.trim(), location: location.trim() }),
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      if (data.searchCount > 0) addLog(`Completed ${data.searchCount} web search${data.searchCount > 1 ? "es" : ""}`);
      addLog("Profile ready.");
      setResult(data.result);
    } catch (e) {
      addLog(`Error: ${e.message}`);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg,#0a1628 0%,#0d1f3c 50%,#0a1628 100%)", fontFamily: "'Inter',system-ui,sans-serif", color: "#e2e8f0", padding: "40px 20px" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        input:focus { outline: none; border-color: rgba(59,130,246,0.6) !important; box-shadow: 0 0 0 3px rgba(59,130,246,0.12) !important; }
        button:hover:not(:disabled) { opacity: 0.88; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-thumb { background: rgba(59,130,246,0.3); border-radius: 3px; }
        ::-webkit-scrollbar-track { background: transparent; }
        a { color: #60a5fa; text-decoration: none; }
        a:hover { text-decoration: underline; }
      `}</style>

      <div style={{ maxWidth: 780, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
            <div style={{ width: 36, height: 36, borderRadius: 9, background: "linear-gradient(135deg,#1e40af,#3b82f6)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, color: "#fff", fontSize: 16, flexShrink: 0 }}>L</div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: "#fff", letterSpacing: "-0.01em" }}>Legalet Prospect Research Agent</div>
              <div style={{ fontSize: 12, color: "rgba(148,163,184,0.6)", marginTop: 1 }}>AI-powered sales intelligence for CA workers' comp defense firms</div>
            </div>
          </div>
        </div>

        {/* Search inputs */}
        <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
          <input
            value={firmName}
            onChange={e => setFirmName(e.target.value)}
            onKeyDown={e => e.key === "Enter" && runAgent()}
            placeholder="Firm name, e.g. Bradford & Barthel"
            style={{ flex: "2 1 220px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "11px 14px", color: "#e2e8f0", fontSize: 14, fontFamily: "inherit", transition: "border-color 0.15s, box-shadow 0.15s" }}
          />
          <input
            value={location}
            onChange={e => setLocation(e.target.value)}
            onKeyDown={e => e.key === "Enter" && runAgent()}
            placeholder="City or state (optional)"
            style={{ flex: "1 1 160px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "11px 14px", color: "#e2e8f0", fontSize: 14, fontFamily: "inherit", transition: "border-color 0.15s, box-shadow 0.15s" }}
          />
          <button
            onClick={runAgent}
            disabled={loading || !firmName.trim()}
            style={{ background: loading || !firmName.trim() ? "rgba(59,130,246,0.2)" : "linear-gradient(135deg,#1e40af,#2563eb)", color: loading || !firmName.trim() ? "rgba(148,163,184,0.5)" : "#fff", border: "none", borderRadius: 10, padding: "11px 22px", fontSize: 14, fontWeight: 600, cursor: loading || !firmName.trim() ? "not-allowed" : "pointer", fontFamily: "inherit", whiteSpace: "nowrap", transition: "all 0.15s" }}>
            {loading ? "Researching..." : "Research Firm →"}
          </button>
        </div>

        {/* Agent log */}
        {(loading || log.length > 0) && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10, padding: "12px 16px", fontFamily: "monospace", fontSize: 12, color: "#10b981", lineHeight: 1.8, display: "flex", flexDirection: "column", gap: 2 }}>
              {log.map((l, i) => <div key={i}>&gt; {l}</div>)}
              {loading && <div style={{ opacity: 0.5 }}>&gt; <span style={{ animation: "pulse 1s infinite" }}>...</span></div>}
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <Card style={{ background: "rgba(220,38,38,0.08)", border: "1px solid rgba(220,38,38,0.2)", marginBottom: 16 }}>
            <div style={{ color: "#fca5a5", fontSize: 13 }}>{error}</div>
          </Card>
        )}

        {/* Result */}
        {result && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

            {/* Firm header */}
            <Card>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 10, marginBottom: result.wcFocusNote ? 10 : 0 }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#fff", letterSpacing: "-0.01em" }}>{result.firmName}</h2>
                  <div style={{ color: "rgba(148,163,184,0.7)", fontSize: 12, marginTop: 4 }}>
                    {[result.location, result.founded && `Est. ${result.founded}`, result.size].filter(Boolean).join(" · ")}
                  </div>
                </div>
                <Badge level={result.wcDefenseFocus} />
              </div>
              {result.wcFocusNote && <div style={{ color: "rgba(148,163,184,0.85)", fontSize: 13, lineHeight: 1.6 }}>{result.wcFocusNote}</div>}
            </Card>

            {/* Outreach angle */}
            <Card style={{ background: "linear-gradient(135deg,rgba(30,64,175,0.15),rgba(37,99,235,0.08))", border: "1px solid rgba(59,130,246,0.2)" }}>
              <SectionLabel>Suggested Outreach Angle</SectionLabel>
              <p style={{ margin: 0, color: "#e2e8f0", fontSize: 14, lineHeight: 1.75 }}>{result.outreachAngle}</p>
              <CopyButton text={result.outreachAngle} />
            </Card>

            {/* Decision makers */}
            {result.decisionMakers?.length > 0 && (
              <Card>
                <SectionLabel>Key Contacts</SectionLabel>
                {result.decisionMakers.map((p, i) => <PersonCard key={i} person={p} />)}
              </Card>
            )}

            {/* Tech signals + recent news */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              {result.techSignals && (
                <Card>
                  <SectionLabel>Tech Signals</SectionLabel>
                  <p style={{ margin: 0, fontSize: 13, color: "rgba(148,163,184,0.85)", lineHeight: 1.65 }}>{result.techSignals}</p>
                </Card>
              )}
              {result.recentNews && (
                <Card>
                  <SectionLabel>Recent News</SectionLabel>
                  <p style={{ margin: 0, fontSize: 13, color: "rgba(148,163,184,0.85)", lineHeight: 1.65 }}>{result.recentNews}</p>
                </Card>
              )}
            </div>

            {/* Sources */}
            {result.sources?.filter(Boolean).length > 0 && (
              <Card>
                <SectionLabel>Sources</SectionLabel>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {result.sources.filter(Boolean).map((s, i) => (
                    <a key={i} href={s} target="_blank" rel="noopener noreferrer"
                      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 6, padding: "3px 10px", fontSize: 11, color: "#60a5fa", maxWidth: 260, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block" }}>
                      {s.replace(/^https?:\/\/(www\.)?/, "")}
                    </a>
                  ))}
                </div>
              </Card>
            )}

          </div>
        )}

        {/* Empty state */}
        {!loading && !result && !error && (
          <div style={{ textAlign: "center", padding: "60px 20px", border: "1px dashed rgba(255,255,255,0.08)", borderRadius: 12, color: "rgba(148,163,184,0.4)", fontSize: 13 }}>
            Enter a California workers' comp defense firm above to generate a prospect profile.
          </div>
        )}

      </div>
    </div>
  );
}
