---
title: Offline-first AI — IndexedDB as Gemini Nano's memory
tags:
  - web-performance
  - offline-first
  - indexeddb
  - chrome-ai
  - gemini-nano
  - prompt-api
  - javascript
  - pwa
date: 2026-08-12 09:30:00
updated: 2026-08-12 09:30:00
---

Most AI interfaces we build today share the same Achilles' heel: they're empty shells without a connection. We treat LLMs as a remote HTTP endpoint to invoke on every interaction, assuming a perfect connectivity that rarely exists in the real world. With **Gemini Nano built into the browser via the Prompt API**, that dependency disappears — inference can finally move straight to the GPU or NPU on the user's own device.

Running a model locally, though, only solves half the equation.

The moment you move AI to the client, you run into a classic web-persistence problem: a session created with `LanguageModel.create()` lives only in the tab's volatile memory. If a maintenance inspector is in the basement of an electrical substation documenting a pump failure, and the tab gets discarded in the background or the device restarts mid-flight-mode, the model loses the entire thread of the conversation. There's no server, no Redis, to rescue that state. For an on-device AI experience to actually be production-usable, **it needs persistent, local memory**.

That's where **IndexedDB** becomes Gemini Nano's natural co-pilot.

Combine the two and you don't just give the model durable memory through the `initialPrompts` parameter — you also solve the energy problem: hashing each query locally lets you return cached answers in 0ms, saving the device's battery by never waking the model to process the same input twice.

To ground this pattern in something real, I built **FieldTech Zero**: an offline-first technical field notebook. It takes raw incident notes written in the field, automatically extracts a structured JSON report with diagnostics and severities, and lets you ask contextual follow-up questions about earlier inspections — even after closing and reloading the browser 30 meters underground.

The full, runnable code is in [`demos/offline-first-ai-indexeddb-gemini-nano`](https://github.com/khriztianmoreno/khriztianmoreno.dev/tree/main/demos/offline-first-ai-indexeddb-gemini-nano) (the [README](https://github.com/khriztianmoreno/khriztianmoreno.dev/blob/main/demos/offline-first-ai-indexeddb-gemini-nano/README.md) has the Chromium flags to turn on the Prompt API).

Next, let's walk through how this architecture is actually orchestrated: from the model's reactive download cycle to the persistence flow that keeps the session from going amnesiac without ever touching the network.

## How the demo works

<figure>
  <video controls preload="metadata" width="100%">
    <source src="https://res.cloudinary.com/khriztianmoreno/video/upload/f_auto,q_auto/v1790632262/blogpost-demos/offline-first-ai-indexeddb-gemini/demo_fgndrr.mp4" type="video/mp4" />
    Your browser doesn't support embedded video — <a href="https://github.com/khriztianmoreno/khriztianmoreno.dev/tree/main/demos/offline-first-ai-indexeddb-gemini-nano">clone the demo</a> and run it locally instead.
  </video>
  <figcaption>The full run: process a note, hit cache on a repeat, reload the page, and ask a follow-up the model can still answer — offline.</figcaption>
</figure>

The full scenario is "FieldTech Zero": the technician writes the note, the app extracts structured JSON — component, severity, diagnostic, suggested action, whether a part needs replacing — and the whole flow comes down to four steps:

1. **Type a note, hit "Process note."** Gemini Nano extracts the JSON locally.
2. **Submit the exact same note again.** The badge switches to `cache (IndexedDB)` — no inference runs the second time.
3. **Reload the page.** The session history is still there, restored from IndexedDB.
4. **Ask a follow-up that references the earlier note** — e.g. "what was the sensor pressure reading?" — with no network involved. The model still remembers, because the reload rebuilt its context from IndexedDB, not from a live connection.

As you can see in the video above, that's exactly the test: process the pump note, reload the page, then ask *"What was the sensor pressure reading on the pump from the earlier note?"*, offline. Here's what it answers:

```json
{
  "component": "Auxiliary pump 3",
  "severity": "LOW",
  "diagnostic": "The sensor reading on the auxiliary pump 3 is 4.2 bar.",
  "suggestedAction": "Monitor the pump pressure closely and investigate the leak.",
  "partReplacementRequired": false
}
```

It pulled "4.2 bar" out of a note it had never seen in *this* page load — only in the IndexedDB history restored into the session on boot.

## The problem: a Gemini Nano session doesn't survive a reload

`LanguageModel.create()` gives you a session object that lives in memory. Refresh the tab and it's gone — along with everything the user told it. For a chat toy that's mildly annoying. For a field tool where the technician's phone locks itself between inspections, or the tab gets backgrounded and killed, it's a dealbreaker: the app forgets who it's talking to and why.

The fix isn't a bigger context window. It's not keeping state in memory at all — it's writing every turn to IndexedDB and rebuilding the session's context from disk every time the page loads.

## Building block 1: two IndexedDB stores

[`db.js`](https://github.com/khriztianmoreno/khriztianmoreno.dev/blob/main/demos/offline-first-ai-indexeddb-gemini-nano/db.js) keeps two object stores — `history` for conversation turns, `cache` for responses keyed by a hash of the prompt:

```js
export async function hashPrompt(text) {
  const bytes = new TextEncoder().encode(text.trim().toLowerCase());
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function getCachedResponse(hash) {
  const db = await openDB();
  return new Promise((resolve) => {
    const store = db.transaction('cache', 'readonly').objectStore('cache');
    const req = store.get(hash);
    req.onsuccess = () => resolve(req.result?.response ?? null);
    req.onerror = () => resolve(null);
  });
}
```

The cache isn't just latency optimization — on a device running inference on battery, a repeated question (a technician re-reading the same error code twice) is a repeated cost you don't need to pay twice. Hashing the prompt and checking IndexedDB first is close to free by comparison.

## Building block 2: restoring context with `initialPrompts`

`LanguageModel.create()` accepts `initialPrompts` — an array of `{ role, content }` turns that seed the session before it takes its first real prompt. [`nano-loader.js`](https://github.com/khriztianmoreno/khriztianmoreno.dev/blob/main/demos/offline-first-ai-indexeddb-gemini-nano/nano-loader.js) reads the history straight out of IndexedDB and hands it in:

```js
export class LocalGeminiManager {
  constructor(onStatus) {
    this.onStatus = onStatus ?? (() => {});
    const { promise, resolve, reject } = Promise.withResolvers();
    this.ready = promise;
    this._resolve = resolve;
    this._reject = reject;
  }

  async init(initialPrompts = []) {
    if (!('LanguageModel' in self)) {
      this._reject(new Error('LanguageModel unavailable'));
      return this.ready;
    }

    try {
      this.session = await LanguageModel.create({ initialPrompts, /* monitor below */ });
      this._resolve(this.session);
    } catch (err) {
      this._reject(err);
    }

    return this.ready;
  }
}
```

`Promise.withResolvers()` (Baseline since March 2024) is what makes `ready` usable from outside the class without an awkward callback: it hands back `{ promise, resolve, reject }` as three independent values, so `init()` can resolve or reject the same promise other code is already `await`ing, instead of nesting a `new Promise((resolve, reject) => { ... })` around the whole method.

## Building block 3: tracking the download, defensively

The first time a user opens the app, the model itself might need to download. The `monitor` option reports progress — but the exact shape of the `downloadprogress` event has drifted across Chrome versions and even across Google's own docs: one example computes `loaded * 100` (implying a 0–1 fraction), another computes `(loaded / total) * 100` (implying byte counts). Rather than bet on one, `nano-loader.js` handles both:

```js
monitor: (m) => {
  m.addEventListener('downloadprogress', (e) => {
    const pct = e.total ? (e.loaded / e.total) * 100 : e.loaded * 100;
    this.onStatus({ status: 'downloading', progress: Math.round(pct) });
  });
},
```

This is the kind of defensive code that looks unnecessary until an origin-trial API ships a breaking change under your feet. It cost one extra line.

## Building block 4: cache → local → cloud, in that order

[`orchestrator.js`](https://github.com/khriztianmoreno/khriztianmoreno.dev/blob/main/demos/offline-first-ai-indexeddb-gemini-nano/orchestrator.js) is the hybrid part: check the cache, then the local model, then — only if there's a connection and no local model — fall back to a server:

```js
if (this.localReady && this.local.session) {
  text = await this.local.session.prompt(prompt);
  source = 'nano';
} else {
  if (pretendOffline || !navigator.onLine) {
    throw new Error('No local model and no connection — nothing left to fall back to.');
  }
  const res = await fetch('/api/generate', { /* ... */ }).catch(() => null);
  if (!res || !res.ok) {
    throw new Error('Cloud fallback unreachable — see server-reference/ in the repo.');
  }
  // ...
}
```

One thing I did deliberately: **the cloud fallback in this demo isn't deployed.** There's no server running behind it and no API key anywhere in the repo — a public static demo is not where you put either. What ships instead is [`server-reference/index.js`](https://github.com/khriztianmoreno/khriztianmoreno.dev/blob/main/demos/offline-first-ai-indexeddb-gemini-nano/server-reference/index.js), a real Node.js implementation of the `/api/generate` endpoint using `@google/genai`, for you to drop into your own backend:

```js
const response = await ai.models.generateContent({
  model: 'gemini-flash-latest',
  contents: [
    ...history.map((turn) => ({
      role: turn.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: turn.content }],
    })),
    { role: 'user', parts: [{ text: prompt }] },
  ],
});
```

Without it deployed, the demo's fallback path fails loudly with an explanatory error instead of hanging — which is itself the behavior worth shipping: a hybrid system should tell you which tier answered, and fail clearly when none can, rather than leave the user staring at a spinner.

## An honest caveat: the model doesn't always return clean JSON

The system prompt asks for JSON only, no prose. Most of the time that's exactly what comes back. Sometimes it isn't — a stray sentence before the object, or markdown fences around it. [`main.js`](https://github.com/khriztianmoreno/khriztianmoreno.dev/blob/main/demos/offline-first-ai-indexeddb-gemini-nano/main.js) strips fences and tries `JSON.parse`, and falls back to showing the raw text if that fails:

```js
try {
  const cleaned = text.replace(/```json|```/g, '').trim();
  reportEl.textContent = JSON.stringify(JSON.parse(cleaned), null, 2);
} catch {
  reportEl.textContent = text; // model didn't return clean JSON — show raw output
}
```

Don't ship structured extraction against a small on-device model without a parse fallback. It will eventually hand you something that isn't valid JSON, and a silent crash is worse than showing the raw string.

## What I learned wrestling with this (and why you should try it)

Building this left me with a feeling close to when we first started shipping Service Workers to production years ago: **native support changes the rules of the game, but it forces you to think about the architecture backwards.**

Three takeaways straight from the trenches:

1. **On-device AI isn't a cloud replacement — it's what keeps your user from getting stranded.** Don't ask Gemini Nano to draft a 40-page paper in the browser. Use it to structure, classify, summarize, or filter at the edge. That's where speed and privacy are unbeatable.
2. **Your memory isn't RAM anymore.** Treating the model's context as volatile is mistake number one. If you're building conversational interfaces or client-side agents, IndexedDB has to be the session's hard drive from day one.
3. **Battery performance matters.** Hashing queries to serve identical answers from disk isn't paranoia — on a phone or an industrial tablet, saving NPU/GPU cycles is the difference between finishing the shift and running out of battery halfway through a tunnel.

The pattern isn't limited to incident reports. Think of a Markdown editor that suggests tags on a plane, a recipe app recalculating portions in a kitchen with no signal, or medical triage in a rural area. **"No signal" was never supposed to mean "blank screen."**

---

### To keep exploring

If this got you curious about the code or where the ecosystem is headed:

- **The full demo repo:** [`demos/offline-first-ai-indexeddb-gemini-nano`](https://github.com/khriztianmoreno/khriztianmoreno.dev/tree/main/demos/offline-first-ai-indexeddb-gemini-nano) — clone it, check the Chromium flags you need, and run the Node.js fallback.
- **Chrome's Built-in AI docs:** Google's guide to enabling and experimenting with the [Prompt API in the browser](https://developer.chrome.com/docs/ai/built-in).
- **The Web Machine Learning Community Group:** the formal [Prompt API explainer](https://github.com/explainers-by-googlers/prompt-api), if you want to see how this interface is being standardized across browsers.
- **IndexedDB Best Practices (web.dev):** essential reading on [working with reliable local storage](https://web.dev/articles/indexeddb-best-practices) without blocking the main thread.

Have you shipped offline flows in production, or are you already poking at Chrome's local AI APIs? I'd love to hear what use cases make sense to you, or what broke along the way. Let's talk on [X/Twitter](https://twitter.com/khriztianmoreno) or [LinkedIn](https://www.linkedin.com/in/khriztianmoreno/).

![Profile](https://res.cloudinary.com/khriztianmoreno/image/upload/c_scale,w_148/v1591324337/KM-brand/stickers/sticker-3_2x.png)