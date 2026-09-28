# Streaming AI without destroying your INP — demo

Companion code for the blog post [_Streaming AI without destroying your INP_](https://www.khriztianmoreno.dev/blog/streaming-ai-without-destroying-your-inp) (also in [Spanish](https://www.khriztianmoreno.dev/es/blog/streaming-ai-without-destroying-your-inp)).

Two implementations of the same thing, side by side, switchable from the UI:

- [`naive.js`](./naive.js) — appends every delta chunk straight to the DOM, no batching, no yielding. This is the version that blocks input.
- [`lib.js`](./lib.js) — batches by sentence with `Intl.Segmenter` and yields to the main thread (`scheduler.yield()`, with a `setTimeout` fallback) between updates.
- [`metrics.js`](./metrics.js) — wires up [`web-vitals`](https://github.com/GoogleChrome/web-vitals)'s `onINP` and logs every interaction's latency on screen, so you can compare the two strategies without opening DevTools (though you should still open DevTools).
- [`main.js`](./main.js) — UI wiring: prompt box, strategy switch, Generate/Stop, and a "probe" button whose only job is to be something you click while the model is streaming.

## Running it

This uses native ES modules and the on-device Prompt API, so:

1. Serve the folder over HTTP — ES modules don't run from `file://`:

   ```bash
   npx serve .
   # or
   python3 -m http.server
   ```

2. Open it in a recent desktop Chrome with the Prompt API available. If `LanguageModel` isn't defined (the page will tell you), enable it:
   - `chrome://flags/#prompt-api` → the **Prompt API** flag → **Enabled**
   - `chrome://components` → find the **Optimization Guide** entries (e.g. "Optimization Guide On Device Models Manifest") and hit "Check for update" on them
   - Restart Chrome.

   See Chrome's [Prompt API guide](https://developer.chrome.com/docs/ai/prompt-api) if the model doesn't download.

3. Pick a strategy, hit **Generate**, and click **"probe"** a few times while it's streaming. Watch the INP log — then record a Performance trace in DevTools for the full picture.

## What to look for

- **Naive:** a long, dense stretch of small tasks in the Performance trace; probe clicks logged with high INP values while text is streaming.
- **Optimized:** short tasks with visible gaps between them; probe clicks logged with low INP values even mid-stream.
