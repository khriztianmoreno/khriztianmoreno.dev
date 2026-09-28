import { getCachedResponse, setCachedResponse, getHistory, appendHistory, hashPrompt } from './db.js';
import { LocalGeminiManager } from './nano-loader.js';

const SYSTEM_INSTRUCTION = `You are a field-inspection assistant. Convert a raw technical note into strict JSON with exactly these fields:
- component (string)
- severity ("LOW" | "MEDIUM" | "HIGH" | "CRITICAL")
- diagnostic (string, one sentence)
- suggestedAction (string, one sentence)
- partReplacementRequired (boolean)
Respond with the JSON object only, no prose, no markdown fences.`;

/**
 * cache -> local Gemini Nano -> cloud fallback, in that order. The cloud
 * fallback here is intentionally unreachable: this is a static demo with
 * no deployed backend and no API key, so it fails with an explanatory
 * error instead of pretending to work. See the blog post for the Node.js
 * reference implementation of /api/generate.
 */
export class HybridAIService {
  constructor(onStatus) {
    this.onStatus = onStatus ?? (() => {});
    this.local = new LocalGeminiManager((s) => this.onStatus({ scope: 'model', ...s }));
    this.localReady = false;
  }

  async bootstrap() {
    const history = await getHistory();
    const initialPrompts = [
      { role: 'system', content: SYSTEM_INSTRUCTION },
      ...history.map((h) => ({ role: h.role === 'assistant' ? 'assistant' : h.role, content: h.content })),
    ];

    try {
      await this.local.init(initialPrompts);
      this.localReady = true;
    } catch {
      this.localReady = false;
    }
  }

  async processNote(rawNote, { pretendOffline = false } = {}) {
    const prompt = `Field note:\n${rawNote}`;
    const hash = await hashPrompt(prompt);

    const cached = await getCachedResponse(hash);
    if (cached) {
      return { text: cached, source: 'cache' };
    }

    let text;
    let source;

    if (this.localReady && this.local.session) {
      text = await this.local.session.prompt(prompt);
      source = 'nano';
    } else {
      if (pretendOffline || !navigator.onLine) {
        throw new Error('No local model and no connection (pretend-offline is on) — nothing left to fall back to.');
      }
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, history: await getHistory() }),
      }).catch(() => null);

      if (!res || !res.ok) {
        throw new Error('Cloud fallback unreachable — this static demo has no /api/generate deployed. See the Node.js snippet in the post.');
      }
      const data = await res.json();
      text = data.text;
      source = 'cloud';
    }

    await setCachedResponse(hash, text);
    await appendHistory('user', prompt);
    await appendHistory('assistant', text);

    return { text, source };
  }
}
