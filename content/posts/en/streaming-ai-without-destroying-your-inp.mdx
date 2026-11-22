---
title: Streaming AI without destroying your INP
tags:
  - web-performance
  - core-web-vitals
  - inp
  - chrome-ai
  - gemini-nano
  - prompt-api
  - javascript
  - performance
date: 2026-09-25 09:30:00
updated: 2026-09-25 09:30:00
---

Your AI feature is the new INP culprit.

For years, the usual suspects for a bad [Interaction to Next Paint](https://web.dev/articles/inp) score were the same: bloated bundles, unthrottled scroll handlers, a chart library re-rendering on every mouse move. Now there's a new one, and it's the feature everyone is shipping right now — streaming a language model's answer straight into the DOM.

This post has a full, runnable demo behind it — [`demos/streaming-ai-without-destroying-your-inp`](https://github.com/khriztianmoreno/khriztianmoreno.dev/tree/main/demos/streaming-ai-without-destroying-your-inp), in the repo that powers this site. It needs Chrome flags most readers won't have enabled, so there's no hosted version to click into — clone it (or just read the files on GitHub) and run it locally per the [README](https://github.com/khriztianmoreno/khriztianmoreno.dev/blob/main/demos/streaming-ai-without-destroying-your-inp/README.md). Rather than pasting isolated snippets, I'm going to walk through the actual files: a naive implementation that wrecks your INP, and an optimized one that doesn't, both wired to a live INP readout so the difference is something you can watch happen, not just take my word for.

## How the demo works

Run it locally and you'll see three things: a prompt box with a strategy switch above it, an output area, and an INP log below. The flow is:

1. **Pick a strategy** — "Naive (per-chunk, no yield)" or "Optimized (sentence batching + yield)" — with the same prompt in both.
2. **Hit Generate.** The model starts streaming into the output area using whichever strategy you picked.
3. **While it's still generating, click "🔘 Click me while it's generating"** a few times. That button does nothing on purpose — its only job is to give you something to interact with mid-stream, the same way a user would tap "stop" or scroll while your chat UI is still talking.
4. **Watch the INP log.** Every click reports its measured latency there, in real time, via `web-vitals`' `onINP` — no DevTools required, though you should open DevTools' Performance panel too for the full trace.
5. **Hit Stop** any time to see the `AbortController` actually cancel the in-flight generation, instead of leaving a zombie session writing to a component nobody's looking at anymore.

Run the naive strategy first, mash the probe button, and watch the log fill with high numbers. Then switch to optimized, same prompt, and watch the same clicks come back low. That side-by-side is the whole point of the demo.

## Why streaming text breaks INP

On-device models like Gemini Nano expose their output through the [Prompt API](https://developer.chrome.com/docs/ai/prompt-api)'s `promptStreaming()`, which returns a `ReadableStream` of text chunks:

```js
const session = await LanguageModel.create();
const stream = session.promptStreaming('Explain quantum entanglement.');

for await (const chunk of stream) {
  console.log(chunk);
}
```

Two things about that loop are easy to miss and both matter for performance:

1. Each `chunk` is an **incremental delta**, not the full text so far. You have to concatenate them yourself to reconstruct the answer.
2. Chunks arrive fast — often several per second — and the obvious thing to do with each one is to append it to the DOM immediately, so the text "types itself" on screen.

That second instinct is exactly what the demo's [`naive.js`](https://github.com/khriztianmoreno/khriztianmoreno.dev/blob/main/demos/streaming-ai-without-destroying-your-inp/naive.js) implements:

```js
export async function naiveStreamAnswer(prompt, onChunk, signal) {
  const session = await LanguageModel.create({ signal });
  const stream = session.promptStreaming(prompt, { signal });

  for await (const delta of stream) {
    onChunk(delta);
  }

  session.destroy();
}
```

Every DOM write triggered by `onChunk` is a task on the main thread: a text node mutation, a reflow, sometimes a re-render if you're piping the chunk through a framework's state. Do that dozens of times per second and you've built a wall of small-but-frequent tasks that never lets the main thread breathe. If the user clicks "stop" or types into another field while the model is still talking, that input sits in the queue behind your DOM churn — and that queueing delay is exactly what INP measures.

The fix isn't "stream slower." It's controlling **where** you flush to the DOM and **how often** you hand control back to the browser — which is what the demo's other implementation, [`lib.js`](https://github.com/khriztianmoreno/khriztianmoreno.dev/blob/main/demos/streaming-ai-without-destroying-your-inp/lib.js), does.

## The building blocks

### 1. Batch by sentence, not by token

Painting per-token feels responsive in a demo, but it's the most expensive possible cadence — and for languages like Spanish, breaking mid-word or mid-punctuation looks broken. [`Intl.Segmenter`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Segmenter) (Baseline since April 2024) gives you locale-aware sentence boundaries for free:

```js
const segmenter = new Intl.Segmenter('es', { granularity: 'sentence' });

for (const { segment } of segmenter.segment(text)) {
  console.log(segment); // one full sentence at a time
}
```

Segmenting by sentence means one DOM write per sentence instead of one per token — often an order of magnitude fewer updates — and it respects abbreviations and punctuation rules per locale, which a naive `text.split('. ')` does not.

Here's what that looks like on an actual run, prompting the demo with "Write two short sentences describing a sunrise over the mountains." Gemini Nano streamed back 37 deltas — mostly word fragments:

```
"Golden" " light" " kissed" " the" " jagged" " peaks" "," " slowly"
" chasing" " away" " the" " lingering" " shadows" " of" " night" "."
"  " "Warm" " hues" " painted" " the" " sky" "," " transforming"
" the" " mountains" " into" " majestic" " silhouettes" " bathed"
" in" " a" " new" " dawn" "." " " "\n\n\n\n"
```

The naive strategy turns every one of those into its own DOM write — 37 tasks. Run the exact same deltas through the sentence-batching logic above and you get 5 writes, 2 of which carry all the actual content:

```
1. "Golden light kissed the jagged peaks, slowly chasing away the lingering shadows of night.  "
2. "Warm hues painted the sky, transforming the mountains into majestic silhouettes bathed in a new dawn. \n"
3. "\n"   4. "\n"   5. "\n"
```

Same model output, same total text — 37 DOM writes down to 5, and the last three are trailing newlines the model tacked on at the end, not meaningful content. That's the entire optimization in one concrete before/after.

### 2. Give the main thread room to breathe

Even at sentence granularity, a long answer can still queue up enough DOM writes to block input. Between updates, `lib.js` hands control back to the browser with [`scheduler.yield()`](https://developer.mozilla.org/en-US/docs/Web/API/Scheduler/yield):

```js
export function yieldToMain() {
  if (globalThis.scheduler?.yield) return scheduler.yield();
  return new Promise((resolve) => setTimeout(resolve, 0));
}
```

`scheduler.yield()` isn't Baseline yet, so the fallback matters — without it, this whole strategy silently stops working on browsers that don't support it. The point of yielding isn't to slow the stream down; it's to insert a checkpoint where a pending click or keystroke can be processed before you resume writing.

### 3. Let people cancel it

An `AbortController` should exist from the moment generation starts, not as an afterthought — a model that keeps flushing sentences to a component the user has already navigated away from is its own kind of bug. In the demo, [`main.js`](https://github.com/khriztianmoreno/khriztianmoreno.dev/blob/main/demos/streaming-ai-without-destroying-your-inp/main.js) creates the controller on every "Generate" click and wires the "Stop" button straight to `controller.abort()`.

## Putting it together

This is the full [`lib.js`](https://github.com/khriztianmoreno/khriztianmoreno.dev/blob/main/demos/streaming-ai-without-destroying-your-inp/lib.js) — sentence batching, yielding, and cancellation, in one function:

```js
export async function streamAnswer(prompt, onSentence, signal) {
  const session = await LanguageModel.create({ signal });
  const segmenter = new Intl.Segmenter('es', { granularity: 'sentence' });

  const stream = session.promptStreaming(prompt, { signal });
  let buffer = '';
  let cursor = 0;

  for await (const delta of stream) {
    buffer += delta;

    // The last segment in a partial buffer might still be growing,
    // so only flush the ones that are already complete.
    const segments = [...segmenter.segment(buffer)];
    const complete = segments.slice(0, -1);

    for (const { segment, index } of complete) {
      if (index < cursor) continue;
      await yieldToMain();
      onSentence(segment);
      cursor = index + segment.length;
    }
  }

  const tail = buffer.slice(cursor);
  if (tail) onSentence(tail);

  session.destroy();
}
```

One honest caveat, straight from testing this in the demo: re-segmenting the whole buffer on every chunk means the cost grows with the length of the answer, and `Intl.Segmenter` can occasionally revise where a boundary falls once more text arrives (an abbreviation like "Dr." resolving differently once the next word shows up). For sentence-level batching this is rarely noticeable, but it's worth knowing before you assume the output is byte-identical to segmenting the final text in one pass.

The on-screen INP log comes from [`metrics.js`](https://github.com/khriztianmoreno/khriztianmoreno.dev/blob/main/demos/streaming-ai-without-destroying-your-inp/metrics.js), which is short enough to paste in full — it just wires `web-vitals`' `onINP` straight to a `<ul>`:

```js
import { onINP } from 'https://unpkg.com/web-vitals@5?module';

onINP((metric) => {
  const target = metric.entries.at(-1)?.target;
  const label = target?.id || target?.tagName?.toLowerCase() || 'unknown target';
  const item = document.createElement('li');
  item.textContent = `${metric.value.toFixed(0)}ms — ${label}`;
  document.getElementById('inp-log')?.prepend(item);
});
```

If `LanguageModel` isn't defined yet in your browser when you run it, the page will tell you — the [README](https://github.com/khriztianmoreno/khriztianmoreno.dev/blob/main/demos/streaming-ai-without-destroying-your-inp/README.md) covers the Chrome flag you need.

## Measuring before and after

Don't ship this on faith — profile it. When I ran the naive strategy in this demo and let a long answer stream while clicking the probe button, DevTools' Performance panel showed a dense row of small tasks in the main thread track, back-to-back, no gaps — and the probe clicks logged high in the INP log. Switching to the optimized strategy with the same prompt, the trace shows short tasks separated by visible gaps, and the same probe clicks come back low.

`metric.entries` in the `onINP` callback points you straight at the specific interaction that was slow and which task blocked it — that's your evidence, not a guess, for whether the batching actually helped. Run it yourself with your own prompts; the numbers will vary by device and answer length, but the shape of the two traces won't.

## What's next

This same shape — small, frequent updates fighting the main thread — shows up anywhere a model streams into a live page, not just chat UIs. Chrome's built-in AI stack keeps expanding (the [Rewriter API](https://developer.chrome.com/docs/ai/rewriter-api) for on-device rewriting, [WebMCP](https://developer.chrome.com/docs/ai/webmcp) for exposing page actions to agents, both covered at [Chrome at I/O '26](https://developer.chrome.com/blog/chrome-at-io26)), and every one of them will hand you output the same way: incrementally, on your terms for when to paint it.

The API gives you the tokens. Keeping INP healthy is still your job.

I hope this has been helpful and/or taught you something new!

![Profile](https://res.cloudinary.com/khriztianmoreno/image/upload/c_scale,w_148/v1591324337/KM-brand/stickers/sticker-3_2x.png)

@khriztianmoreno 🚀
