# Connecting your SPA's client state to WebMCP: reactive hooks and stores — demo

Companion code for the blog post [_Connecting your SPA's client state to WebMCP: reactive hooks and stores_](https://www.khriztianmoreno.dev/blog/webmcp-react-state) (also in [Spanish](https://www.khriztianmoreno.dev/es/blog/webmcp-react-state)), the third post in the WebMCP series. Part 1 is [`demos/webmcp-fundamentals`](../webmcp-fundamentals) (the imperative API) and part 2 is [`demos/webmcp-declarative-forms`](../webmcp-declarative-forms) (declarative forms).

The same flight domain, but now as a React app: flight results → add to cart → a trip cart, with the state in a [Zustand](https://github.com/pmndrs/zustand) store. The thesis of the demo is one sentence: **a WebMCP tool is a contract (name + schema + description), not a snapshot of state.** Register it once per component lifetime, tie unregistration to the unmount, and read live state inside `execute` at call time.

There's no build step, like the other demos. React 19.2.7 (the development build, because StrictMode only double-mounts in development), Zustand 5.0.15 and [`htm`](https://github.com/developit/htm) (JSX-like templates without a transform) load from esm.sh through an import map. There's no LLM either: the agent's plan is hard-coded.

## Files

- [`use-webmcp-tool.js`](./use-webmcp-tool.js) is the core of the post:
  - `useWebMCPTool(tool)`, the contract hook. It registers in `useEffect`, aborts the signal in the cleanup, catches the registration promise (ignoring `AbortError`), and calls `execute` through a ref. Its deps are the contract only: name, title, description, schema and annotations.
  - `useNaiveWebMCPTool(tool)` and `useStaleWebMCPTool(tool)`, the two anti-patterns the lab compares it with.
- [`cart-tools.js`](./cart-tools.js) holds the four tools owned by `<TripCart>`, and one hook per lab mode:
  - `get_cart_items` and `get_trip_state` (`readOnlyHint`) read the store. There's no endpoint behind them.
  - `add_flight_to_cart` and `remove_from_cart` call the store's actions, and the UI reacts.
- [`store.js`](./store.js) is the Zustand store: trip, results, cart, seat, and their actions.
- [`app.js`](./app.js) holds the React components:
  - `<TripCart>` owns the cart tools.
  - `<SeatMap>` owns `select_seat` and only exists while the seat map is open.
  - `<FareQuote>` owns `quote_fare`.
- [`fare-worker.js`](./fare-worker.js) is the fare-calculator store, living in a Web Worker. [`fare-client.js`](./fare-client.js) is the main-thread proxy, with request ids and a 1.5 s timeout.
- [`webmcp-shim.js`](./webmcp-shim.js) is part 1's shim, with `registerTool()` aligned to the spec's timing (see below), and `getModelContext()`.
- [`lab-metrics.js`](./lab-metrics.js) wraps the active `ModelContext` to count registrations, aborts and `toolchange` events. It's not part of WebMCP.
- [`agent.js`](./agent.js) is the simulated agent, and [`agent-console.js`](./agent-console.js) is its log.
- [`main.js`](./main.js) handles runtime detection, the `unhandledrejection` listener, the counters, the live `getTools()` list, and (re)creating the React root.

## Running it

ES modules (and module workers) need HTTP, not `file://`:

```bash
npx serve .
# or
python3 -m http.server
```

Open it in any modern browser. WebMCP is restricted to secure contexts, and `localhost` counts as one. It needs network access for esm.sh and the Tailwind CDN.

## Native WebMCP vs. the shim

The badge under the goal shows which runtime is active. The page uses `document.modelContext` if it has `registerTool`, `getTools` and `executeTool`, and if a probe registration with an already-aborted signal isn't rejected with `NotAllowedError` (the "tools" Permissions Policy). Otherwise it uses the shim. See part 1's README for how to try the native API in Chrome.

The shim follows the `registerTool()` algorithm in the [WebMCP spec](https://webmachinelearning.github.io/webmcp/) (Draft Community Group Report) where this demo depends on it:

- The tool map entry is set synchronously, and the duplicate-name check is synchronous (`InvalidStateError`).
- Aborting the signal synchronously unregisters the tool **and** rejects the registration promise with the abort reason (a no-op if it already resolved).
- An already-aborted signal rejects immediately.
- `toolchange` fires, and then the promise resolves, in a later task.

There is no `unregisterTool()` in the spec. Aborting the signal is the unregistration.

From DevTools you can poke at it with `await demo.modelContext.getTools()`.

## What to try

1. **Contract hook, StrictMode off.** Add three flights, add a passenger, remove a flight. `<TripCart>` commits climb from 1 to 6, while `registerTool()` calls stay at 5 (the four cart tools plus `quote_fare`), and every tool shows `registered ×1`.
2. **Naive hook.** Do the same five changes. Registrations go 5 → 25, signals aborted 0 → 20, `toolchange` events 5 → 45, and each cart tool shows `registered ×6`.
3. **Stale closure.** Add a flight by hand, then click **Re-read cart**. The agent gets an empty cart while the UI shows one flight.
4. **Run agent** in contract mode, then change the cart by hand and **Re-read cart**. The agent sees exactly what's on screen.
5. **StrictMode on.** The dev double-mount gives 10 registrations and 5 aborts on mount, and no `InvalidStateError`: the abort removed each entry synchronously, so the re-register finds the name free. Cart changes after that don't register anything.
6. **StrictMode on + Catch registration promise off.** You get 5 unhandled `AbortError` rejections on mount, one per tool, listed in the page. The browser console shows them too.
7. **Open / close the seat map.** `select_seat` appears in and disappears from the live `getTools()` list. **Refresh availability** changes the seat map's local state, and `select_seat` sees it on the next call without re-registering.
8. **Slow worker (3 s).** `quote_fare` (and the **Quote cart** button) fail with a `TimeoutError` after 1.5 s. The worker's late answer is dropped.
