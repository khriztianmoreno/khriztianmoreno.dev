---
title: "Connecting your SPA's client state to WebMCP: reactive hooks and stores"
tags:
  - webmcp
  - ai-agents
  - mcp
  - chrome-ai
  - web-platform
  - react
  - javascript
date: 2026-10-28 09:30:00
updated: 2026-10-28 09:30:00
---

In the [first post in this series](/blog/webmcp-fundamentals), the tools were registered once, at page load, against a store written in vanilla JavaScript. In the [second](/blog/webmcp-declarative-forms), there wasn't even any JavaScript: the tools were HTML forms. Both demos have something in common that your app probably doesn't: **nothing mounts or unmounts.** The page loads, the tools exist, end of story.

A real app doesn't look like that. It's an SPA: components that mount and unmount with every route change, state living in a store (Zustand, Redux, Pinia, signals, whatever you use), and a framework that re-renders whenever that state changes. The obvious question is *where* you register tools in that world. The obvious answer ("in a `useEffect`, of course") hides two traps that took me a while to name: tools that re-register on every render, and tools that answer with state from three minutes ago.

This post is about the idea that gets you out of both: **a WebMCP tool is a contract (name + schema + description), not a snapshot of state.** You register it once per component lifetime, you tie its unregistration to the unmount, and you read live state inside `execute`, at call time. That way, a state change never re-registers anything.

I built a demo in the same flight domain, now in React with a Zustand store. The code is in [`demos/webmcp-react-state`](https://github.com/khriztianmoreno/khriztianmoreno.dev/tree/main/demos/webmcp-react-state) (the [README](https://github.com/khriztianmoreno/khriztianmoreno.dev/blob/main/demos/webmcp-react-state/README.md) explains how to run it). Like the previous ones, it has no build step: React, Zustand, and [`htm`](https://github.com/developit/htm) (JSX without a transform) load from a CDN.

## How the demo works

<figure>
  <video controls preload="metadata" width="100%">
    <source src="https://res.cloudinary.com/khriztianmoreno/video/upload/f_auto,q_auto/v1793221126/blogpost-demos/webmcp-react-state/webmcp-react-state_etzdmx.mp4" type="video/mp4" />
    Your browser doesn't support embedded video — <a href="https://github.com/khriztianmoreno/khriztianmoreno.dev/tree/main/demos/webmcp-react-state">clone the demo</a> and run it locally instead.
  </video>
  <figcaption>The full run: the stale closure, the naive hook against the contract, StrictMode, the seat map and the worker that misses its deadline.</figcaption>
</figure>

The video shows the full run: renders climbing while registrations stay put, the naive hook's counters taking off, and StrictMode's unhandled rejections appearing in the page.

The app is a trip cart: BOG → MAD flight results, an "Add" button on each one, and a cart with passengers and a subtotal. The state lives in a Zustand store. The `<TripCart>` component owns four tools:

- **`get_cart_items`** and **`get_trip_state`** (`readOnlyHint`): readers. They have no endpoint behind them; they read the store.
- **`add_flight_to_cart`** and **`remove_from_cart`**: they call the store's actions, and the UI reacts just as if you'd clicked.

There are two more components with their own tool: a **seat map** you can open and close (it owns `select_seat`), and a **fare quote** computed in a Web Worker (it owns `quote_fare`). Next to the app there's a **counters panel** (`<TripCart>` commits, `registerTool()` calls, aborted signals, `toolchange` events, and unhandled rejections), a live **`getTools()` list**, and a **simulated agent**, the same as in part 1: no LLM, a hard-coded plan, only `getTools()` and `executeTool()`.

The lab lets you switch how `<TripCart>` registers its tools (**Contract hook**, **Naive hook**, or **Stale closure**) and toggle **StrictMode** and **Catch registration promise**. Each change remounts the React root and resets the counters.

In my runs (headless Chrome 155, using the shim), with the same five changes (add three flights, add a passenger, remove a flight):

1. **Contract hook:** `<TripCart>` commits go from 1 to 6. `registerTool()` calls stay at **5** (the four cart tools plus `quote_fare`), with 0 aborts and 5 `toolchange` events.
2. **Naive hook:** the same 6 commits, but **25 registrations, 20 aborts, and 45 `toolchange` events**. Every cart tool shows `registered ×6`.
3. **Stale closure:** 5 registrations, all calm... and when the agent reads the cart after you've added a flight by hand, it gets **an empty cart**.

## The problem: the tool as a snapshot

Here's how most of us would write it on the first try. The component already has the state at hand, so you build the tool right there and register it in an effect:

```js
/** Anti-pattern: `tool` is a new object every render, so this re-registers every render. */
export function useNaiveWebMCPTool(tool) {
  const { modelContext, catchRegistration } = useContext(WebMCPContext);

  useEffect(() => {
    const controller = new AbortController();
    registerWithSignal(modelContext, tool, controller.signal, catchRegistration);
    return () => controller.abort();
  }, [modelContext, catchRegistration, tool]);
}
```

The `tool` object comes from the component's render, with an `execute` that closes over that render's `cart`. Because it's a new object every time, the effect sees a different dep on every render: abort, register, abort, register. The values are correct, but you're paying for it with an unregister + register pair per tool per render, and each one fires a `toolchange`. The spec doesn't coalesce them: every registration and every unregistration notifies the documents. That's why 5 cart changes turn into 45 events.

Why does that matter? Because `toolchange` is how the page announces that its tool set changed: an in-page agent listens for the event, and a browser agent learns about it through its own internal mechanism. If your app fires it every time someone types into a field, you're telling the agent "everything changed" when nothing did. What an agent does with that mid-conversation (re-reading the list, ignoring it, getting confused) depends on the agent.

The "obvious" fix (empty deps) is the other trap:

```js
/** Anti-pattern: registered once, but `tool.execute` is the first render's closure. */
export function useStaleWebMCPTool(tool) {
  const { modelContext, catchRegistration } = useContext(WebMCPContext);

  useEffect(() => {
    const controller = new AbortController();
    registerWithSignal(modelContext, tool, controller.signal, catchRegistration);
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modelContext, catchRegistration]);
}
```

One registration, perfect counters, and a classic stale closure: `execute` is the first render's function forever. In the demo, you add Iberia's flight by hand, the UI shows it, and the agent's `get_cart_items` answers `"items": []`. That's the worst kind of bug: there's no error, the agent just reasons on top of a lie.

Both traps come from the same mistake: treating the tool as **a snapshot of state** that has to be "refreshed." It isn't. Name, description, and schema don't change when the cart changes. What changes is the answer, and the answer is computed when the agent asks.

## Building block 1: there is no `unregisterTool()`, the lifecycle is an `AbortSignal`

Before the hook, one detail you'll see wrong in plenty of places (it was in my original plan for this post, too): **the spec has no `unregisterTool()`.** The `ModelContext` IDL has exactly `registerTool(tool, { signal, exposedTo })`, `getTools()`, `executeTool()`, and three events: `toolchange`, `toolactivated`, and `toolcancel`. That's it.

You unregister by aborting the `signal` you passed at registration time. The spec's [`registerTool()` algorithm](https://webmachinelearning.github.io/webmcp/) adds these abort steps to the signal: *unregister the tool*, and *reject the promise with the abort reason*. Both happen synchronously, when you call `abort()`. In the demo's shim, [`webmcp-shim.js`](https://github.com/khriztianmoreno/khriztianmoreno.dev/blob/main/demos/webmcp-react-state/webmcp-shim.js), it looks like this:

```js
    if (signal) {
      signal.addEventListener(
        'abort',
        () => {
          this.#unregister(name);
          reject(signal.reason); // ignored if the promise already resolved
        },
        { once: true },
      );
    }
```

To React, this is a gift. An `AbortController` per effect, `abort()` in the cleanup, and the tool's lifecycle is the component's lifecycle, the same idea we saw with declarative forms, where the tool lived and died with the `<form>` element. It's also the pattern the web already uses for `fetch` and `addEventListener`: one signal, one cancellation.

Two more spec details that matter here: unregistering a tool **doesn't cancel an execution already in flight** (the registration signal controls availability; the `executeTool()` signal controls each invocation), and if the signal arrives already aborted, `registerTool()` rejects right away without registering anything.

## Building block 2: `useWebMCPTool`, line by line

This is the contract hook, in [`use-webmcp-tool.js`](https://github.com/khriztianmoreno/khriztianmoreno.dev/blob/main/demos/webmcp-react-state/use-webmcp-tool.js):

```js
export function useWebMCPTool(tool) {
  const { modelContext, catchRegistration } = useContext(WebMCPContext);

  const executeRef = useRef(tool.execute);
  useLayoutEffect(() => {
    executeRef.current = tool.execute;
  });

  const { name, title, description } = tool;
  const schemaKey = JSON.stringify(tool.inputSchema ?? null);
  const annotationsKey = JSON.stringify(tool.annotations ?? null);

  useEffect(() => {
    if (!modelContext) return; // no WebMCP here (yet): nothing to register

    const controller = new AbortController();
    const inputSchema = JSON.parse(schemaKey) ?? undefined;
    const annotations = JSON.parse(annotationsKey) ?? undefined;

    registerWithSignal(
      modelContext,
      {
        name,
        title,
        description,
        inputSchema,
        annotations,
        execute: (input, options) => executeRef.current(input, options),
      },
      controller.signal,
      catchRegistration,
    );

    // There is no unregisterTool(). Aborting the signal is the unregistration.
    return () => controller.abort();
  }, [modelContext, catchRegistration, name, title, description, schemaKey, annotationsKey]);
}
```

Piece by piece:

- **`executeRef` + `useLayoutEffect` with no deps.** After every commit, the ref points to the latest render's `execute`. The function registered with the browser never changes: it's a trampoline that jumps to `executeRef.current` *when the agent calls it*. I update the ref in an effect, not during render, because writing refs during render is something React asks you not to do.
- **The deps are the contract.** `name`, `title`, `description`, and the schema and annotations serialized as strings. Serializing them means you can pass an inline object (`inputSchema: { type: 'object', … }`) without a new identity on every render forcing a re-registration. If the contract really changes, the hook does re-register, and that's correct: that's exactly when the agent should get a `toolchange`.
- **`catchRegistration`** is a lab toggle, so the demo can show what happens without the `.catch`. In your app, it doesn't exist: you always catch. More on that in building block 4.
- **The cleanup is a single line.** `controller.abort()`. No names, no maps, no "did it register yet?" bookkeeping.

The proof is in the seat map, [`app.js`](https://github.com/khriztianmoreno/khriztianmoreno.dev/blob/main/demos/webmcp-react-state/app.js). `select_seat` is built inline on every render, and its `execute` closes over the component's local state (`occupied`). When you hit "Refresh availability," the state changes, the component re-renders, and the next call from the agent sees the new availability. The counter still says `registered ×1`. In my run, `select_seat({ seat: "12A" })` failed with "Seat 12A is occupied," I refreshed, and the same call succeeded, without a single new registration.

One subtlety worth knowing: **the ref points to the latest *committed* render**, not to the store "right now." If the agent mutates the store and calls another tool before React commits, the ref still has the previous closure. For component-local state, that's the best you can get. For store state, there's something better.

## Building block 3: readers read the store, not an endpoint

When the state lives in a store, you don't need the render at all. The cart tools in [`cart-tools.js`](https://github.com/khriztianmoreno/khriztianmoreno.dev/blob/main/demos/webmcp-react-state/cart-tools.js) are module-level constants, and `execute` calls `useTripStore.getState()`, Zustand's synchronous getter:

```js
export const cartTools = {
  getCartItems: {
    ...CART_CONTRACTS.getCartItems,
    execute: async () => cartView(useTripStore.getState()),
  },
```

```js
export function useContractCartTools() {
  useWebMCPTool(cartTools.getCartItems);
  useWebMCPTool(cartTools.getTripState);
  useWebMCPTool(cartTools.addFlightToCart);
  useWebMCPTool(cartTools.removeFromCart);
}
```

`getState()` is the store *now*, not the last render. No stale closures, and no "one commit behind." The mutators do the same: `add_flight_to_cart` calls the same `addToCart` action as the UI's button, and Zustand notifies the subscribed components. The agent doesn't touch the DOM or know React exists.

Notice what's **not** here: there's no `GET /api/cart`. The cart the agent reads is the user's, in this tab, with whatever they just changed by hand. In the demo, the agent adds IB-6584, I add AV-010 by hand and bump the passengers to 2, and "Re-read cart" answers `IB-6584, AV-010 · 2 pax · subtotal $2862`, exactly what's on screen. A backend endpoint would have answered with whatever the server knew, which isn't necessarily the same thing. This is part 1's thesis applied to an SPA: the tool is another entry point into the logic and state you already have.

The same pattern works for Redux (`store.getState()`), Jotai (`store.get(atom)`), or signals (`signal.value`/`peek()`): every serious store has a way to read outside of render. Use it inside `execute`.

## Building block 4: StrictMode and the promise you have to catch

Turn on StrictMode in the demo. In development, React mounts each component, runs its effects, simulates an unmount (cleanup), and mounts again. With our hook, that's register → abort → register for every tool. The counters on mount: **10 registrations, 5 aborts, 15 `toolchange` events**, and no errors. After that, the same five cart changes still leave it at 10.

Why doesn't the second registration fail with `InvalidStateError` ("a tool with that name already exists")? Because of the order of the spec's algorithm. The duplicate-name check is **synchronous**, and so is the entry in the tool map. The abort steps run **synchronously** too, inside `controller.abort()`. So by the time StrictMode's second mount calls `registerTool()`, the first entry is already gone. If unregistration were async, StrictMode would blow up on every mount. The spec itself uses this pattern in an example: `ac.abort()` immediately followed by `registerTool()` to update a tool's schema. Note that the example is there to warn about a race: an execution the agent starts right at that moment may target either the old tool or the new one, and hit a schema it didn't expect. One more reason not to re-register on every render.

But there's a second consequence, and this one does bite. The `registerTool()` promise doesn't resolve synchronously: it resolves in a queued task, after `toolchange` fires. StrictMode aborts **before** that task runs. And per the spec, aborting rejects the promise with the abort reason. If nobody catches it, you get an unhandled rejection on every development mount, one per tool.

Turn off "Catch registration promise" with StrictMode on, and the demo shows it in the page (it listens for `unhandledrejection` on `window`): **5 rejections** on mount, all `AbortError: signal is aborted without reason`. That's why the hook always goes through this:

```js
function registerWithSignal(modelContext, tool, signal, catchRegistration) {
  const registration = modelContext.registerTool(tool, { signal });
  if (!catchRegistration) return; // lab toggle: leave the promise unhandled
  registration.catch((err) => {
    // Aborting before the promise resolves rejects it with the abort reason.
    // That's the expected path for StrictMode and fast unmounts.
    if (err?.name === 'AbortError') return;
    console.error(`[webmcp] registerTool("${tool.name}") failed:`, err);
  });
}
```

An `AbortError` is the expected path: StrictMode, or a component that unmounts before its registration resolves (a fast route change, say). Anything else (`InvalidStateError` from a duplicate name, `NotAllowedError` from the `tools` Permissions Policy, `InvalidStateError` if the document isn't fully active) is a real bug, and you want to see it. The opposite case is just as instructive: with StrictMode off and no catch, opening and closing the seat map doesn't produce a rejection, because the abort arrives *after* the promise resolved, and rejecting an already-resolved promise does nothing.

Don't "fix" this by turning StrictMode off. StrictMode is doing its job: showing you that your effect isn't resilient to an unmount at the wrong moment. In production, that moment happens too, just less often.

## Building block 5: Next.js, client-side only

If your SPA is a Next.js app, there's one more rule: `modelContext` exists only on `Document`. There's no `document` during server rendering or in React Server Components, so tools are registered on the client: in a `'use client'` component, inside an effect.

The trap is thinking `'use client'` means "this only runs in the browser." It doesn't: client components are also pre-rendered on the server. What never runs on the server is **effects**. That's why the hook registers in `useEffect` and never touches `document.modelContext` during render or at the module's top level. This snippet **isn't part of the demo** (there's no Next app in the repo), but it uses the demo's own hook and tools:

```jsx
'use client';

import { useEffect, useState } from 'react';
import { WebMCPContext, useWebMCPTool } from './use-webmcp-tool';
import { cartTools } from './cart-tools';

export function WebMCPProvider({ children }) {
  const [modelContext, setModelContext] = useState(null);

  // Effects only run in the browser, so `document` exists here.
  useEffect(() => setModelContext(document.modelContext ?? null), []);

  return (
    <WebMCPContext.Provider value={{ modelContext, catchRegistration: true }}>
      {children}
    </WebMCPContext.Provider>
  );
}

export function CartTools() {
  useWebMCPTool(cartTools.getCartItems);
  useWebMCPTool(cartTools.addFlightToCart);
  return null;
}
```

On the server, `modelContext` is `null` and the hook's `if (!modelContext) return` does nothing. In the browser, the provider resolves it after hydration, and the tools are registered. Because the tools are tied to components, a route that doesn't render `<CartTools />` doesn't expose them: client-side navigation unmounts the component, the cleanup aborts, the tool disappears from the list, and `toolchange` fires.

## Building block 6: the store in a Worker, the tool on the main thread

Same rule, different consequence: if `modelContext` only exists on `Document`, **a Worker can't register tools.** There's a [service worker explainer](https://github.com/webmachinelearning/webmcp/blob/main/docs/service-workers.md) (first published on August 28, 2025) that proposes registering service workers as WebMCP providers, so an agent could call tools without the site open. It's a proposal, it's not in the spec, and the demo doesn't use it.

What does work today is a pattern: the state lives in a Worker, and the tool on the main thread is a proxy. In the demo, the fare calculator (taxes, fees, seat pricing) lives in [`fare-worker.js`](https://github.com/khriztianmoreno/khriztianmoreno.dev/blob/main/demos/webmcp-react-state/fare-worker.js), and `quote_fare` talks to it over `postMessage`, with request ids and a timeout. This is the core of [`fare-client.js`](https://github.com/khriztianmoreno/khriztianmoreno.dev/blob/main/demos/webmcp-react-state/fare-client.js):

```js
  function request(type, payload, { signal } = {}) {
    if (signal?.aborted) return Promise.reject(signal.reason);

    const id = nextId++;
    return new Promise((resolve, reject) => {
      const onAbort = () => settle(id)?.reject(signal.reason);
      const timer = setTimeout(() => {
        settle(id)?.reject(new DOMException(`The fare worker did not answer "${type}" within ${timeoutMs} ms.`, 'TimeoutError'));
      }, timeoutMs);

      signal?.addEventListener('abort', onAbort, { once: true });
      pending.set(id, { resolve, reject, timer, cleanup: () => signal?.removeEventListener('abort', onAbort) });
      worker.postMessage({ id, type, payload });
    });
  }
```

Three details that seem minor until they're missing:

- **The id** matches each response to its request. Without it, two concurrent quotes could get crossed.
- **The timeout** is what keeps the agent from hanging if the Worker gets stuck. Check "Slow worker (3 s)": `quote_fare` fails after 1.5 s with `TimeoutError`, and the agent gets a clear error instead of a promise that never settles. The Worker's late answer is dropped, because its id no longer has a pending entry.
- **The `signal`** is the one `execute` receives. If the agent cancels the invocation, the request to the Worker is canceled too.

The tool itself (`quote_fare`) uses the same contract hook as the others. Its `execute` reads the cart with `getState()` and sends it to the Worker. The tool is the contract on the main thread; the state is wherever it fits best.

## An honest caveat: what this demo doesn't prove

- **It's shim-only.** All my numbers come from the in-page shim, which I aligned with the `registerTool()` algorithm on the points this post depends on: synchronous map insert, synchronous duplicate check, abort → synchronous unregister + rejection, async resolve, and `toolchange`. The demo detects `document.modelContext` and uses it if it exists, but **I haven't tested the native path**. If a browser's implementation differs from the spec in timing, the StrictMode numbers could change.
- **The spec is a Draft Community Group Report**, outside the standards track. The surface I describe (no `unregisterTool()`, the signal as the lifecycle) is the one in the current text, and it can change.
- **How an agent reacts to `toolchange` mid-conversation is up to the agent.** The spec defines the event, not what an agent does with it. The naive hook's 45 events are a cost on the page side; I can't measure the cost on the agent side.
- **The service worker explainer is a proposal.** The Worker pattern in the demo doesn't depend on it.

## What I learned building this

1. **A tool is a contract.** Name, description, and schema describe *what you can do*, not *what's there right now*. If the contract doesn't change, the registration doesn't either.
2. **The `AbortSignal` is the lifecycle.** There's no `unregisterTool()`, and you don't need one: a controller per effect and `abort()` in the cleanup tie the tool to the component, the same way the declarative API ties it to the `<form>`.
3. **State gets read at call time.** `getState()` for stores, a ref for component-local state. The agent's question arrives later than the render, so the answer should be computed later too.
4. **The spec's timing explains React's behavior.** The synchronous unregister is why StrictMode doesn't break; the async resolve is why you have to catch the promise. Reading the algorithm saved me a couple of hours of guessing.

In the next posts in the series, we'll look at invoking forms from the imperative API, how to design human-in-the-loop permissions, and how to debug all of this with DevTools.

---

### To keep exploring

- **The WebMCP spec:** [webmachinelearning.github.io/webmcp](https://webmachinelearning.github.io/webmcp/). The `registerTool()` and "unregister a tool" algorithms are the basis for building blocks 1 and 4.
- **The service worker explainer:** [`docs/service-workers.md`](https://github.com/webmachinelearning/webmcp/blob/main/docs/service-workers.md), the proposal for tools without an open tab.
- **Part 1 of the series:** [WebMCP — Why agents shouldn't have to guess how your UI works](/blog/webmcp-fundamentals), with `registerTool()`, `getTools()`, and `executeTool()`.
- **Part 2 of the series:** [Semantic markup for AI: turn your forms into WebMCP tools without JavaScript](/blog/webmcp-declarative-forms), with the declarative API.
- **The full demo:** [`demos/webmcp-react-state`](https://github.com/khriztianmoreno/khriztianmoreno.dev/tree/main/demos/webmcp-react-state). Switch to the naive hook and watch the counters, turn on StrictMode without the catch, and open and close the seat map.

Which store does your SPA use, and where would you register its first tool? I'd love to hear about it. Let's talk on [X/Twitter](https://twitter.com/khriztianmoreno) or [LinkedIn](https://www.linkedin.com/in/khriztianmoreno/).

![Profile](https://res.cloudinary.com/khriztianmoreno/image/upload/c_scale,w_148/v1591324337/KM-brand/stickers/sticker-3_2x.png)
