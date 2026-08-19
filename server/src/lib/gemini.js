const TIMEOUT_MS = 40_000;

function extractText(payload) {
  return payload?.candidates?.flatMap((candidate) => candidate?.content?.parts ?? [])
    .map((part) => part?.text ?? "").join("\n").trim();
}

export class GeminiError extends Error {
  constructor(kind) {
    super(kind);
    this.name = "GeminiError";
    this.kind = kind;
  }
}

export async function generateWithGemini({ systemInstruction, userPrompt, maxOutputTokens = 1_000, responseMimeType }) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new GeminiError("configuration");
  const model = process.env.GEMINI_MODEL || "gemini-3.5-flash";
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  let response;
  try {
    response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
      method: "POST",
      headers: { "x-goog-api-key": apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemInstruction }] },
        contents: [{ role: "user", parts: [{ text: userPrompt }] }],
        generationConfig: {
          maxOutputTokens,
          thinkingConfig: { thinkingLevel: "minimal" },
          ...(responseMimeType && { responseMimeType }),
        },
      }),
      signal: controller.signal,
    });
  } catch (error) {
    if (error?.name === "AbortError") throw new GeminiError("timeout");
    throw new GeminiError("provider");
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    let providerError;
    try { providerError = await response.json(); } catch { providerError = undefined; }
    const status = providerError?.error?.status;
    console.error("Gemini provider request failed", { status: response.status, requestId: response.headers.get("x-request-id") });
    if (response.status === 429 || status === "RESOURCE_EXHAUSTED") throw new GeminiError("quota");
    if (response.status === 401 || response.status === 403) throw new GeminiError("configuration");
    throw new GeminiError("provider");
  }

  let text;
  try {
    text = extractText(await response.json());
  } catch {
    throw new GeminiError("empty");
  }
  if (!text) throw new GeminiError("empty");
  return text;
}

export function sendGeminiError(res, error, subject = "assistant") {
  if (!(error instanceof GeminiError)) return false;
  if (error.kind === "quota") {
    res.setHeader("Retry-After", "60");
    res.status(429).json({ message: `The AI ${subject} has reached its current usage limit. Please try again later.` });
  } else if (error.kind === "configuration") {
    res.status(503).json({ message: `The AI ${subject} is temporarily unavailable due to a configuration issue.` });
  } else if (error.kind === "timeout") {
    res.status(504).json({ message: `The AI ${subject} took too long to respond. Please try again.` });
  } else {
    res.status(502).json({ message: `The AI ${subject} is temporarily unavailable. Please try again.` });
  }
  return true;
}
