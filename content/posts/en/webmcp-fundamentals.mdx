---
title: WebMCP — Why agents shouldn't have to guess how your UI works
tags:
  - webmcp
  - ai-agents
  - mcp
  - chrome-ai
  - web-platform
  - javascript
date: 2026-10-09 09:30:00
updated: 2026-10-09 09:30:00
---

You ask a browser agent to book the cheapest nonstop flight from Bogotá to Madrid. The agent takes a screenshot, sends it to the model, the model decides the "Origin" field is roughly in the top-left corner, clicks… and the click lands on a cookie banner that showed up half a second after the page loaded. New screenshot. New round of reasoning. "Looks like there's a modal, I'll look for a button that says Accept." Another screenshot to confirm the modal is gone. Step by step, every look at the screen costs thousands of tokens, and it hasn't even typed "BOG" yet.

That's how most agents operate the web today: **they guess**. They guess what each pixel means, they guess which selector points at the right button, they guess whether the action worked. And when the product team ships a redesign on some random Tuesday, everything the agent "learned" about your interface stops being true.

**WebMCP** proposes something different: let the page tell the agent what it can do, through tools you declare yourself, with a JSON Schema for their input, that reuse the logic and state your app already has — with the browser sitting in the middle as the mediator. This is the first post in a series on WebMCP. Here we cover the fundamentals; later I want to dig into state in SPAs (hooks and stores), forms, human-in-the-loop permissions, and debugging with DevTools.

So this doesn't stay theoretical, I built a demo: **flight booking, two agents, one redesign toggle**. The full code is in [`demos/webmcp-fundamentals`](https://github.com/khriztianmoreno/khriztianmoreno.dev/tree/main/demos/webmcp-fundamentals) (the [README](https://github.com/khriztianmoreno/khriztianmoreno.dev/blob/main/demos/webmcp-fundamentals/README.md) explains how to run it and how to try the native API in Chrome).

## How the demo works

<figure>
  <video controls preload="metadata" width="100%">
    <source src="https://res.cloudinary.com/khriztianmoreno/video/upload/f_auto,q_auto/v1791569939/blogpost-demos/webmcp-fundamentals/webmcp-fundamentals_vz8ycu.mp4" type="video/mp4" />
    Your browser doesn't support embedded video — <a href="https://github.com/khriztianmoreno/khriztianmoreno.dev/tree/main/demos/webmcp-fundamentals">clone the demo</a> and run it locally instead.
  </video>
  <figcaption>The full run: both agents booking the flight on the original UI, the "Ship UI redesign" toggle, and the actuation agent breaking while the WebMCP agent finishes exactly as before.</figcaption>
</figure>

The app is called SkyFare, a flight search-and-book screen. Next to it are two panels, each with a different agent and the same goal: *book the cheapest nonstop flight BOG → MAD for Ana Gómez*.

- **The actuation agent** only sees the DOM and only acts through clicks and keystrokes. Every time it needs to "look" at the page, it sends a full snapshot of the app to "the model." Its plan was built against UI v1.
- **The WebMCP agent** never touches the DOM. It discovers the page's tools with `getTools()`, reads their schemas, and calls `executeTool()`.

Neither one uses a real LLM: the plans are hard-coded so the run is deterministic and the contrast stays clear. The flow goes like this:

1. **Run both agents on UI v1.** Both book the flight. But look at the counters: in my runs (headless Chrome 154, using the shim), the actuation agent took **16 steps and roughly 20.9k characters** of payload. The WebMCP agent took **4 steps and roughly 2.9k**.
2. **Turn on "Ship UI redesign."** Same behavior, different markup: renamed ids and classes, new button copy, and a cookie banner.
3. **Run both again.** The actuation agent runs into the banner (its click gets intercepted), dismisses it by looking for an "Accept all" button, then waits for `#search-btn` — which is now `#find-trips` — until it times out. The WebMCP agent finishes in the same 4 steps and the same ~2.9k characters, as if nothing happened.

To be upfront about those numbers: they're approximate. The counter measures **characters, not tokens** (the token estimate in the panel is just characters ÷ 4), and it actually **undercounts** actuation: a real agent sends screenshots or the accessibility tree of the whole page, not just the `outerHTML` of the app container. And I only measured the shim path; I haven't tested Chrome's native implementation.

## The problem: the agent is guessing

An agent driving your UI "from the outside" has to solve two problems at once, and both are fragile:

- **Scraping (perception).** It has to figure out what's on screen: screenshots, the accessibility tree, the serialized DOM. All of that is token-heavy and ambiguous. The demo's agent reads prices by parsing rendered text like `"$689"`, and decides whether a flight is nonstop by comparing a label against the string `'Nonstop'`. Change the currency format or the copy, and the agent misreads without noticing.
- **Actuation (action).** It has to translate an intent ("search for flights") into coordinates or selectors: `#search-btn`, `.select-flight`, `#confirm-booking`. Those selectors are implementation details of your UI, not a contract. Nobody on your team feels bound to keep them stable, and that's how it should be.

The accessibility tree helps a lot: roles and accessible names are more stable than CSS classes, and if your app is accessible, an agent will understand it better. But it's still not a contract. A button going from "Search" to "Find trips" is a perfectly legitimate copy change, and to the agent it's breakage. Plus, the tree describes *what's on screen*, not *what you can do* or under which rules.

There's a subtler cost too: every step is a round trip to the model. More steps mean more latency, more tokens, and more chances for the model to reason differently the second time around.

## Three models side by side

Before getting into the API, it's worth placing WebMCP next to the alternatives. This is the comparison that helped me most:

| | Actuation (screenshots, DOM, clicks) | Backend MCP server | WebMCP |
| --- | --- | --- | --- |
| **Access to client state** | Only what's visible on screen | None: it can't see the user's tab | Direct: tools run inside the page |
| **Auth** | Rides the browser session, with no fine-grained control | Separate: the agent needs its own tokens/OAuth | The session the user already has open |
| **Logic duplication** | None, but it depends on the markup | High: you reimplement flows and state on the server | None: tools call the same functions as the UI |
| **Fragility to UI changes** | High | None (it never touches the UI) | None, as long as the tool contract holds |
| **Cost** | High: many steps, large payloads | Low | Low: few steps, small JSON |

A backend MCP server is robust, and for many use cases it's exactly what you need. But it bypasses the UI entirely: the agent can't see the cart the user built five minutes ago, the filters they've applied, or the unsaved draft. To give it that access, you end up duplicating state and setting up a separate auth scheme just for the agent.

WebMCP **doesn't replace** backend MCP; it complements it. And a WebMCP tool can absolutely call your server API under the hood — the difference is that it does so from the page, with the user's session and the client state right there.

## Building block 1: the page as an "in-page MCP server"

The most useful mental model is to think of the page as an MCP server that lives inside the tab. Your code registers tools — a name, a description, an `inputSchema` in JSON Schema, an `execute` function — and the browser exposes them to an agent.

One detail that trips a lot of people up: WebMCP **borrows MCP's vocabulary** (tools, schemas, descriptions written for a model), but it is **not built on the MCP protocol**. The spec says a page "can be thought of as" an MCP server, and explicitly leaves unspecified the format the browser uses to hand those tools to its agent. There's no JSON-RPC between your page and the agent; there's a JavaScript API and a browser in between.

## Building block 2: `document.modelContext.registerTool()`

In the demo, all state lives in [`store.js`](https://github.com/khriztianmoreno/khriztianmoreno.dev/blob/main/demos/webmcp-fundamentals/store.js). It's the single source of truth, and the UI uses it like this:

```js
export function bookFlight({ flightId, passenger }) {
  const flight = state.results.find((f) => f.id === flightId);
  const name = String(passenger ?? '').trim();

  if (!flight) throw new Error(`Flight ${flightId} is not in the current results — search first.`);
  if (name.length < 2) throw new Error('Passenger name is required.');

  state.selectedId = flightId;
  state.booking = {
    confirmation: `WMCP-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
    passenger: name,
    flight: structuredClone(flight),
    bookedAt: new Date().toISOString(),
  };
  emit();

  return structuredClone(state.booking);
}
```

[`tools.js`](https://github.com/khriztianmoreno/khriztianmoreno.dev/blob/main/demos/webmcp-fundamentals/tools.js) defines the tools as thin adapters over those exact functions:

```js
{
  name: 'book_flight',
  title: 'Book a flight',
  description:
    'Book one flight from the latest search results for a passenger. This creates a real reservation in the user\'s session.',
  inputSchema: {
    type: 'object',
    properties: {
      flightId: { type: 'string', description: 'The `id` of a flight returned by search_flights.' },
      passenger: { type: 'string', description: 'Full name of the passenger.' },
    },
    required: ['flightId', 'passenger'],
  },
  // Consequential: the agent should get explicit user approval first.
  annotations: { consequentialHint: true },
  execute: async ({ flightId, passenger }) => {
    try {
      return { ok: true, booking: bookFlight({ flightId, passenger }) };
    } catch (err) {
      // Report recoverable failures inside the result so the agent can retry.
      return { ok: false, error: err.message };
    }
  },
},
```

And registering them is a loop:

```js
export async function registerTools(modelContext) {
  const controller = new AbortController();
  for (const tool of TOOLS) {
    await modelContext.registerTool(tool, { signal: controller.signal });
  }
  return controller;
}
```

This is the core of the post: **a tool isn't a second implementation of the feature — it's another entry point into the one you already have.** Same validation, same state, same session. When the WebMCP agent books, the store's `emit()` triggers a re-render and the confirmation shows up on screen, just as if the user had clicked. If the name-validation rule changes tomorrow, the UI and the agent both inherit it at once.

Two design details worth noticing. First, recoverable errors come back *inside the result* (`{ ok: false, error }`) so the agent can retry with different input. Second, there's no `unregisterTool()`: you abort the `signal`, and all the tools go away together.

## Building block 3: invoking without a real agent

Here's the awkward part: **no mainstream agent consumes these tools yet.** So, to see the flow end to end, the demo's agent is an in-page console that uses the two functions on the "consumer" side of the API: `getTools()` and `executeTool()`. Here's how it looks in [`webmcp-agent.js`](https://github.com/khriztianmoreno/khriztianmoreno.dev/blob/main/demos/webmcp-fundamentals/webmcp-agent.js):

```js
async function call(tool, input) {
  const raw = await modelContext.executeTool(tool, input);
  const inputJson = JSON.stringify(input);
  ui.step('tool', `executeTool("${tool.name}", ${inputJson})`, inputJson.length);
  ui.addPayload(raw.length);
  const result = JSON.parse(raw); // executeTool() always resolves to a string
  ui.json(`← ${raw.length.toLocaleString()} ch of JSON`, result);
  return result;
}
```

And the agent's "reasoning" works on data, not pixels:

```js
const search = byName('search_flights');
const { flights } = await call(search.tool, { origin: goal.origin, destination: goal.destination, date: goal.date });

const pick = flights.filter((f) => f.stops === 0).sort((a, b) => a.price - b.price)[0];
```

Compare that with the actuation agent, which has to parse `"$689"` out of rendered text. Here `price` is a number and `stops` is a number. There's nothing to guess.

One part of the contract worth being clear on: your `execute` can return **any JSON-serializable value**. The browser stringifies it, and `executeTool()` resolves to **that string** — never a live object. Hence the `JSON.parse(raw)`. It makes sense: what travels to a model is text, and this way your page never hands the agent a reference into its internal state.

## Building block 4: the browser as mediator

What sets WebMCP apart from "exposing functions on `window`" is that the browser sits in the middle and enforces rules:

- **Permissions Policy.** Registering tools is gated behind the `tools` feature, with a default allowlist of `'self'`. A third-party iframe can't register tools on your page unless you explicitly allow it. In the demo, if the native `registerTool()` fails (say, with a `NotAllowedError` from the policy), it falls back to the shim.
- **`exposedTo`.** A `registerTool()` option that, per the spec, is a list of origins controlling which documents in the current page's tree the tool is exposed to.
- **Annotations.** Hints for the agent about the nature of each tool:
  - `readOnlyHint`: the tool only reads; it doesn't modify state. In the demo, `search_flights` and `get_booking`.
  - `untrustedContentHint`: the result contains content the page author themselves considers untrusted. `get_booking` carries it because the passenger name is free text typed by a user — exactly the kind of place a prompt injection sneaks in.
  - `consequentialHint`: running it has significant, real-world, or irreversible consequences. `book_flight` carries it.

In the demo, the agent honors that last annotation: before calling `book_flight`, it stops you with **Approve / Deny**:

```js
const book = byName('book_flight');
if (book.meta.annotations?.consequentialHint) {
  const approved = await ui.approval(`book_flight is consequential. Book ${pick.id} for ${goal.passenger}?`);
  if (!approved) {
    ui.log('fail', 'user denied the booking — nothing was changed');
    ui.status('failed', 'denied');
    return;
  }
}
```

Hit **Deny** and nothing gets booked. Note that the approval here is implemented by my simulated agent, not by the browser. Annotations are *hints*; who asks for confirmation, how, and when is a topic of its own — and it's exactly what the human-in-the-loop permissions post will cover.

## An honest caveat: this is still moving fast

Before you rush to put WebMCP in production, some context:

- **The spec is a Draft Community Group Report** from the W3C Web Machine Learning Community Group, with editors from Microsoft and Google. **It is not on the standards track.** It's a serious proposal, but a proposal.
- **The API moved.** It started out as `navigator.modelContext` and now lives at `document.modelContext`. In Chrome 152 Canary, `navigator.modelContext` is gone. Many tutorials you'll find online use the old location, and they won't work.
- **The declarative `<form>` API** (annotating HTML forms so they become tools) **exists only in an explainer**, not in the spec. The demo doesn't use it.
- **Chrome is testing it in an origin trial.** Sources report it started in Chrome 149; treat that as reported, not confirmed. To enable it locally, check the demo's README and the spec repo's [implementation status](https://github.com/webmachinelearning/webmcp/blob/main/implementation-status.md), because flag and trial names change quickly.

That's why the demo does feature detection and ships a fallback. [`webmcp-shim.js`](https://github.com/khriztianmoreno/khriztianmoreno.dev/blob/main/demos/webmcp-fundamentals/webmcp-shim.js) chooses between the native API and an in-page shim:

```js
export function getModelContext() {
  const native = document.modelContext ?? navigator.modelContext;
  const usable =
    native &&
    typeof native.registerTool === 'function' &&
    typeof native.getTools === 'function' &&
    typeof native.executeTool === 'function';

  return usable ? { modelContext: native, kind: 'native' } : { modelContext: new ModelContextShim(), kind: 'shim' };
}
```

And [`main.js`](https://github.com/khriztianmoreno/khriztianmoreno.dev/blob/main/demos/webmcp-fundamentals/main.js) covers the case where the API exists but registration fails:

```js
let { modelContext, kind } = getModelContext();

try {
  await registerTools(modelContext);
} catch (err) {
  // e.g. NotAllowedError when the "tools" Permissions Policy blocks this document.
  if (kind !== 'native') throw err;
  runtimeNote.textContent = `Native registerTool() failed (${err.name}: ${err.message}). Using the shim instead.`;
  modelContext = new ModelContextShim();
  kind = 'shim';
  await registerTools(modelContext);
}
```

Notice that checking whether `document.modelContext` exists isn't enough: the demo verifies it has all three functions it uses. With an origin-trial API, "it exists" and "it has the shape I expect" are two different questions. The shim **is not a polyfill**: no cross-frame discovery, no origin checks, no Permissions Policy. It only mirrors the surface the demo needs, so you can run it in any browser.

## What I learned building this

1. **The problem isn't that the model is dumb — it's that we make it guess.** A screenshot-driven agent spends most of its effort rebuilding information your app already has in structured form. WebMCP hands it that structure directly.
2. **The UI is an implementation detail; tools are a contract.** Watching the actuation agent break over a renamed id while the other one didn't even notice made it clearer than any diagram where stability needs to live.
3. **If your logic is well separated, WebMCP comes almost for free.** The demo's tools are a few lines each because `store.js` was already the single source of truth. If your business logic is tangled up in component handlers, that's the first refactor — agents or no agents.
4. **Annotations force you to think about risk.** Asking "is this consequential? does this result carry untrusted text?" for every tool is worth doing even before there's an agent on the other end.

In the next posts in the series, we'll look at what happens when state lives in an SPA's hooks and stores, how forms fit in, how to design human-in-the-loop permissions, and how to debug all of this with DevTools.

---

### To keep exploring

- **The WebMCP spec:** [webmachinelearning.github.io/webmcp](https://webmachinelearning.github.io/webmcp/), the Draft Community Group Report.
- **The spec repo:** [github.com/webmachinelearning/webmcp](https://github.com/webmachinelearning/webmcp), with open issues and discussions.
- **Implementation status:** [`implementation-status.md`](https://github.com/webmachinelearning/webmcp/blob/main/implementation-status.md), to see what's available in which browser and how to enable it.
- **The declarative API explainer:** [`declarative-api-explainer.md`](https://github.com/webmachinelearning/webmcp/blob/main/declarative-api-explainer.md), the proposal for `<form>`-based tools (still outside the spec).
- **The full demo:** [`demos/webmcp-fundamentals`](https://github.com/khriztianmoreno/khriztianmoreno.dev/tree/main/demos/webmcp-fundamentals) — clone it, run both agents, and flip the redesign toggle.

Are you already experimenting with WebMCP, or do you have agents in production fighting with selectors? I'd love to hear which tools you'd expose first in your app. Let's talk on [X/Twitter](https://twitter.com/khriztianmoreno) or [LinkedIn](https://www.linkedin.com/in/khriztianmoreno/).

![Profile](https://res.cloudinary.com/khriztianmoreno/image/upload/c_scale,w_148/v1591324337/KM-brand/stickers/sticker-3_2x.png)
