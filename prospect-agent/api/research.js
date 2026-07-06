export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { firmName, location } = req.body;
  if (!firmName) return res.status(400).json({ error: "firmName is required" });

  const SYSTEM_PROMPT = `You are a sales intelligence agent for Legalet AI, a document and case management platform built specifically for California workers' compensation defense law firms.

Your job is to research a law firm and produce a concise, actionable prospect profile for a business development rep.

When given a firm name (and optionally a location), use web search to find:
1. Firm overview — size, practice focus, office locations, years in business
2. Key decision-makers — managing partners, administrators, operations leads (the people who buy software)
3. Current tech signals — any mentions of case management software, tech stack, or digital initiatives
4. Recent news — growth, hires, awards, verdicts, or anything notable in the last 12 months
5. Workers' comp defense focus — confirm they handle CA workers' comp defense and estimate how central it is to their practice

Then produce a structured JSON response ONLY (no markdown, no preamble, no backticks) with this exact shape:

{
  "firmName": "...",
  "location": "...",
  "founded": "...",
  "size": "...",
  "wcDefenseFocus": "high | medium | low | unknown",
  "wcFocusNote": "one sentence explanation",
  "decisionMakers": [
    { "name": "...", "title": "...", "note": "..." }
  ],
  "techSignals": "...",
  "recentNews": "...",
  "outreachAngle": "A 2-3 sentence personalized cold outreach angle for a Legalet AI intro — warm, specific, not salesy. Reference something real you found.",
  "sources": ["url1", "url2"]
}

If you cannot find information for a field, use null. Always search before responding.`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 4000,
        system: SYSTEM_PROMPT,
        tools: [{ type: "web_search_20250305", name: "web_search" }],
        messages: [{
          role: "user",
          content: `Research this California workers' compensation defense law firm for Legalet AI sales prospecting:\n\nFirm: ${firmName}${location ? `\nLocation: ${location}` : ""}`
        }]
      }),
    });

    const data = await response.json();
    if (data.error) return res.status(500).json({ error: data.error.message });

    const searchCount = data.content.filter(b => b.type === "tool_use").length;
    const text = data.content.filter(b => b.type === "text").map(b => b.text).join("\n");
    const clean = text.replace(/```json|```/g, "").trim();
    const jsonStart = clean.indexOf("{");
    const jsonEnd = clean.lastIndexOf("}");
    if (jsonStart === -1) return res.status(500).json({ error: "No JSON in response", raw: text });

    const parsed = JSON.parse(clean.slice(jsonStart, jsonEnd + 1));
    return res.status(200).json({ result: parsed, searchCount });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
