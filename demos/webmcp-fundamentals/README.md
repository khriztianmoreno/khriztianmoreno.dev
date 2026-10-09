# WebMCP: Why agents shouldn't guess how your UI works — demo

Companion code for the blog post [_WebMCP: Why agents shouldn't guess how your UI works_](https://www.khriztianmoreno.dev/blog/webmcp-fundamentals) (also in [Spanish](https://www.khriztianmoreno.dev/es/blog/webmcp-fundamentals)), the first post in the WebMCP series.

A small flight-booking app ("SkyFare") and two agents with the same goal: _book the cheapest nonstop flight BOG → MAD for Ana Gómez_.

- **Actuation agent.** It sees only the DOM and acts only with clicks and keystrokes. Every step sends a snapshot of the app to "the model", so the steps and payload add up fast. It was built against UI v1.
- **WebMCP agent.** It never touches the DOM. It discovers the page's tools with `getTools()`, reads their schemas, and calls `executeTool()`. The tools run the same store functions as the UI, so the booking shows up on screen.

Then flip **Ship UI redesign**. You get renamed ids and classes, new button copy, and a cookie banner. The actuation agent gets past the banner and then breaks on a selector. The WebMCP agent doesn't notice the redesign.

Neither agent uses an LLM. The plans are hard-coded so the run is deterministic and the contrast stays visible. No mainstream agent consumes WebMCP tools yet, so the "agent" here is an in-page console.

- [`store.js`](./store.js) holds the app state and logic: `searchFlights`, `selectFlight`, `bookFlight`, `getBooking`. It is the single source of truth.
- [`app.js`](./app.js) is the UI, with two skins: v1, and v2 (the redesign). The behavior is identical and only the markup differs.
- [`tools.js`](./tools.js) registers three WebMCP tools. Each is a thin adapter over `store.js`:
  - `search_flights` (`readOnlyHint`)
  - `book_flight` (`consequentialHint`; the agent asks you to approve it first)
  - `get_booking` (`readOnlyHint` and `untrustedContentHint`, because the passenger name is user-typed text)
- [`webmcp-shim.js`](./webmcp-shim.js) is a minimal in-page `ModelContext`: `registerTool`, `getTools`, `executeTool`, and the `toolchange` / `toolactivated` / `toolcancel` events. It also contains `getModelContext()`, which picks native or shim.
- [`actuation-agent.js`](./actuation-agent.js) is the simulated selector-and-click agent.
- [`webmcp-agent.js`](./webmcp-agent.js) is the simulated tool-calling agent.
- [`agent-console.js`](./agent-console.js) is the log and the steps / payload / tokens counters shared by both panels.
- [`main.js`](./main.js) handles UI wiring and runtime detection.

## Running it

ES modules need HTTP, not `file://`:

```bash
npx serve .
# or
python3 -m http.server
```

Open it in any modern browser. WebMCP is restricted to secure contexts, and `localhost` counts as one.

## Native WebMCP vs. the shim

The page detects the runtime automatically, and the badge under the goal tells you which one is active:

- **`native document.modelContext`**: the browser implements WebMCP. The tools are registered with the real API, so a browser-level agent or DevTools could see them too.
- **`shim (no native WebMCP)`**: the API is missing (or `registerTool()` was rejected, e.g. by Permissions Policy). In this case [`webmcp-shim.js`](./webmcp-shim.js) provides the same surface in-page.

Detection checks `document.modelContext` first, then falls back to the legacy `navigator.modelContext`, which was removed in Chrome 152 Canary. Either one is used only if it has `registerTool`, `getTools` and `executeTool`. The demo code is identical in both modes.

To try the native API in Chrome, check the WebMCP spec's [implementation status](https://github.com/webmachinelearning/webmcp/blob/main/implementation-status.md). When this demo was written, that page listed:

- an origin trial (Chrome 149+)
- the `chrome://flags/#enable-webmcp-testing` flag for local development

Flag and trial names change fast. If the link above doesn't match, search `chrome://flags` for "WebMCP" and restart Chrome.

The API follows the [WebMCP spec](https://webmachinelearning.github.io/webmcp/) (Draft Community Group Report, 9 October 2026). It is gated by the `tools` Permissions Policy feature (default allowlist: `'self'`). This demo doesn't use the declarative `<form>` API: it appears only in the explainer and is not in the spec.

## What to try

1. Run the **actuation agent** on UI v1. It works, but count the steps and the payload: a full DOM snapshot every time it needs to "see".
2. Run the **WebMCP agent** on UI v1. It takes 4 steps and a fraction of the payload. Approve the `book_flight` call when it asks, then expand the JSON blocks to see the schemas and results it worked from.
3. Turn on **Ship UI redesign** and run both again:
   - The actuation agent dismisses the cookie banner, which costs extra snapshots. Then it times out on `#search-btn`, which is now `#find-trips`.
   - The WebMCP agent finishes exactly as before.
4. Click **Deny** on the `book_flight` approval. Nothing is booked, because consequential tools leave the user in control.
