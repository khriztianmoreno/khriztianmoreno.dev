# Offline-first AI: IndexedDB as Gemini Nano's memory — demo

Companion code for the blog post [_Offline-first AI: IndexedDB as Gemini Nano's memory_](https://www.khriztianmoreno.dev/blog/offline-first-ai-indexeddb-gemini-nano) (also in [Spanish](https://www.khriztianmoreno.dev/es/blog/offline-first-ai-indexeddb-gemini-nano)).

A field-inspection note-taker ("FieldTech Zero"): type a raw technical note, get back a structured JSON incident report, entirely offline, with the session surviving a page reload.

- [`db.js`](./db.js) — IndexedDB: `history` (conversation turns) and `cache` (response by prompt hash).
- [`nano-loader.js`](./nano-loader.js) — wraps `LanguageModel.create()` behind a `Promise.withResolvers()`-based readiness promise, with `initialPrompts` restored from IndexedDB and a `monitor` for download progress.
- [`orchestrator.js`](./orchestrator.js) — the cache → local Nano → cloud fallback chain.
- [`main.js`](./main.js) — UI wiring.
- [`server-reference/index.js`](./server-reference/index.js) — **not deployed.** The Node.js implementation of the `/api/generate` endpoint the orchestrator falls back to when there's no local model and the device is online. This demo ships no backend and no API key — copy this file into your own server if you want that path to actually respond instead of failing with an explanatory error.

## Running it

ES modules need HTTP, not `file://`:

```bash
npx serve .
# or
python3 -m http.server
```

Open it in a recent desktop Chrome with the Prompt API available. If `LanguageModel` isn't defined (the page will tell you):

- `chrome://flags/#prompt-api` → the **Prompt API** flag → **Enabled**
- `chrome://components` → find the **Optimization Guide** entries (e.g. "Optimization Guide On Device Models Manifest") and hit "Check for update" on them
- Restart Chrome.

## What to try

1. Process the default note. Watch the status badge: `Gemini Nano (local)`.
2. Process the *same* note again — badge switches to `cache (IndexedDB)`, no inference run.
3. Reload the page. The session history list still shows your earlier turn — it came back from IndexedDB into `initialPrompts`, not from the network.
4. Check "Pretend offline" and process a brand-new note with no local model loaded (unlikely once it's downloaded once, but simulable by throttling/blocking the model download the first time) — you'll get the explanatory fallback error instead of a silent hang.
