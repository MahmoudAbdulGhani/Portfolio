import { API_BASE, ApiError } from './api';

export type MatchResult = {
  matchLevel: 'Strong Match' | 'Moderate Match' | 'Partial Match' | 'Limited Match';
  overallMatch: string;
  strongMatches: string[];
  relevantExperience: string[];
  relevantProjects: { slug: string; name: string; portfolioUrl: string; evidence: string }[];
  partialMatches: string[];
  gaps: string[];
  recruiterSummary: string;
  candidateSummary?: { text: string; source: 'record-grounded' | 'approved-profile' };
};

export class MatchRequestError extends ApiError {
  retryAt: number;
  requestId?: string;
  constructor(status: number, message: string, retryAfter?: number, requestId?: string) {
    super(status, message);
    this.retryAt = retryAfter && Number.isFinite(retryAfter) && retryAfter > 0 ? Date.now() + retryAfter * 1000 : 0;
    this.requestId = requestId && /^[a-f0-9-]{36}$/i.test(requestId) ? requestId : undefined;
  }
}

function retrySeconds(header: string | null): number | undefined {
  if (!header) return undefined;
  const seconds = /^\d+$/.test(header) ? Number(header) : Math.ceil((Date.parse(header) - Date.now()) / 1000);
  return Number.isFinite(seconds) && seconds > 0 ? seconds : undefined;
}

function validResult(value: unknown): value is MatchResult {
  if (!value || typeof value !== 'object') return false;
  const row = value as Record<string, unknown>;
  return ['Strong Match', 'Moderate Match', 'Partial Match', 'Limited Match'].includes(String(row.matchLevel))
    && typeof row.overallMatch === 'string' && typeof row.recruiterSummary === 'string'
    && ['strongMatches', 'relevantExperience', 'partialMatches', 'gaps'].every(key => Array.isArray(row[key]) && row[key].every(item => typeof item === 'string'))
    && Array.isArray(row.relevantProjects) && row.relevantProjects.every(project => project && ['slug', 'name', 'portfolioUrl', 'evidence'].every(key => typeof project[key] === 'string'));
}

export async function compareJob(description: string, signal: AbortSignal, onStatus: (message: string) => void) {
  const response = await fetch(`${API_BASE}/job-match`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'text/event-stream' },
    body: JSON.stringify({ jobDescription: description, stream: true }), signal,
  });
  const requestId = response.headers.get('X-Request-ID') || undefined;
  if (!response.ok) {
    const body = await response.json().catch(() => undefined);
    throw new MatchRequestError(response.status, body?.message || 'The AI job matcher is temporarily unavailable.', retrySeconds(response.headers.get('Retry-After')) ?? body?.retryAfter, body?.requestId || requestId);
  }
  if (!response.body || !response.headers.get('content-type')?.includes('text/event-stream')) throw new MatchRequestError(502, 'The comparison stream was interrupted. Please try again.', undefined, requestId);
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '', finished = false;
  let report: { result: MatchResult; cvToken: string } | undefined;
  try {
    while (!finished) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer = (buffer + decoder.decode(value, { stream: true })).replace(/\r\n/g, '\n');
      const blocks = buffer.split('\n\n'); buffer = blocks.pop() || '';
      for (const block of blocks) {
        const event = block.split('\n').find(line => line.startsWith('event:'))?.slice(6).trim();
        const lines = block.split('\n').filter(line => line.startsWith('data:')).map(line => line.slice(5).trim());
        if (!lines.length) continue;
        const data = JSON.parse(lines.join('\n'));
        if (event === 'status' && typeof data.message === 'string') onStatus(data.message);
        if (event === 'error') throw new MatchRequestError(data.status || 502, data.message || 'The AI job matcher is temporarily unavailable.', data.retryAfter, data.requestId || requestId);
        if (event === 'result') {
          if (!validResult(data.result)) throw new MatchRequestError(502, 'The comparison report could not be read safely. Please try again.', undefined, requestId);
          report = { result: data.result, cvToken: typeof data.cvToken === 'string' ? data.cvToken : '' };
        }
        if (event === 'done') { finished = true; break; }
      }
    }
    if (signal.aborted) throw new DOMException('Comparison cancelled', 'AbortError');
    if (!finished || !report) throw new MatchRequestError(502, 'The comparison stream ended before the report was complete. Please try again.', undefined, requestId);
    return report;
  } finally {
    // Cancel unfinished transport too; never wait indefinitely for its EOF after
    // an error event, and never expose a token from a partial report.
    void reader.cancel().catch(() => undefined);
    reader.releaseLock();
  }
}
