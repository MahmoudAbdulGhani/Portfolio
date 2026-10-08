export async function readAssistantResponse(
  response: Response,
  onChunk: (text: string) => void = () => {},
) {
  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(
      data?.message ||
        "The assistant is unavailable right now. Please try again.",
    );
  }
  if (!response.headers.get("content-type")?.includes("text/event-stream")) {
    const data = await response.json().catch(() => null);
    if (typeof data?.answer !== "string" || !data.answer.trim())
      throw new Error("The service returned no answer. Please try again.");
    return data.answer as string;
  }
  if (!response.body)
    throw new Error("The service returned no answer. Please try again.");
  const reader = response.body.getReader(),
    decoder = new TextDecoder();
  let buffer = "",
    answer = "",
    complete = false;
  function line(value: string) {
    if (!value.trim().startsWith("data:")) return;
    const data = JSON.parse(value.trim().slice(5).trim());
    if (data.error)
      throw new Error(
        typeof data.error === "string"
          ? data.error
          : "Generation was interrupted. Please try again.",
      );
    if (typeof data.chunk === "string") {
      answer += data.chunk;
      onChunk(answer);
    }
    if (data.done === true) complete = true;
  }
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";
      lines.forEach(line);
    }
    buffer += decoder.decode();
    if (buffer.trim()) line(buffer);
    if (!complete)
      throw new Error("Generation was interrupted. Please try again.");
    if (!answer.trim())
      throw new Error("The service returned no answer. Please try again.");
    return answer;
  } finally {
    await reader.cancel().catch(() => {});
    reader.releaseLock();
  }
}

// Do not turn unresolved model template variables into clickable CV links.
export function evidenceUrl(href: string, origin = window.location.origin) {
  try {
    if (/[{}]/.test(decodeURIComponent(href))) return null;
    const url = new URL(href, origin);
    return ["https:", "http:"].includes(url.protocol) ? url : null;
  } catch {
    return null;
  }
}
