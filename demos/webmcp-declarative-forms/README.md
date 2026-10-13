# Semantic markup for AI: forms as WebMCP tools, no JavaScript — demo

Companion code for the blog post [_Semantic markup for AI: turn your forms into WebMCP tools without JavaScript_](https://www.khriztianmoreno.dev/blog/webmcp-declarative-forms) (also in [Spanish](https://www.khriztianmoreno.dev/es/blog/webmcp-declarative-forms)), the second post in the WebMCP series. Part 1 is [`demos/webmcp-fundamentals`](../webmcp-fundamentals).

Same flight domain as part 1 (SkyFare), but this time there's no `registerTool()` call. The app is two plain HTML forms with the attributes from the WebMCP [declarative API explainer](https://github.com/webmachinelearning/webmcp/blob/main/declarative-api-explainer.md):

- **`search_flights`**: `<form toolname tooldescription toolautosubmit>`. The agent fills it and the form submits itself.
- **`book_flight`**: the same, but **without** `toolautosubmit`. The agent fills it, the submit button gets focus, and **you** review and submit it. That's human-in-the-loop with zero JavaScript.

Every control uses `name` for the property name and `toolparamdescription` for its description. The inputs carry ordinary HTML constraints (`required`, `pattern`, `type="date"`, `type="email"`, `min`/`max`, `<select>`, a checkbox) so the schema has something to work with. The passenger count is a form-associated custom element.

Like part 1, there's no LLM. The agent's plan is hard-coded so the run is deterministic.

- [`index.html`](./index.html) is the app. Both forms are plain HTML and `GET` to `submitted.html`, so they work with JavaScript off.
- [`app.js`](./app.js) is the progressive enhancement: one submit handler per form, shared by humans and agents. For agent-invoked submissions it calls `event.preventDefault()` and then `event.respondWith(...)`, so the agent gets JSON and the page never navigates.
- [`store.js`](./store.js) holds the flight data and the `searchFlights` / `bookFlight` logic.
- [`passenger-stepper.js`](./passenger-stepper.js) is `<passenger-stepper>`, a form-associated custom element (`static formAssociated = true` + `ElementInternals`). Its markup wraps a plain `<input type="number">` that is used when the element never upgrades.
- [`declarative-shim.js`](./declarative-shim.js) is the in-page stand-in for what the browser would do: discover `form[toolname]`, synthesize schemas, fill and submit (or wait), add `agentInvoked` / `respondWith()` to `SubmitEvent`, cancel on reset or `toolname` change, and mirror the pseudo-classes.
- [`schema-synthesis.js`](./schema-synthesis.js) is **our approximation** of input schema synthesis. See the caveats below.
- [`schema-inspector.js`](./schema-inspector.js) shows the synthesized schema for each form, live.
- [`agent.js`](./agent.js) is the simulated agent. [`agent-console.js`](./agent-console.js) is its log and counters.
- [`main.js`](./main.js) handles wiring, the runtime badge and the `?nojs` mode.
- [`submitted.html`](./submitted.html) is where the forms land when no script handles them. It shows the query string.

## Running it

ES modules need HTTP, not `file://`:

```bash
npx serve .
# or
python3 -m http.server
```

Open it in any modern browser. `localhost` counts as a secure context.

## What's native and what's the shim

**The declarative behavior is always the shim.** There is no documented way to feature-detect the declarative API, and the demo doesn't invent one. If the browser exposes the imperative `document.modelContext`, the badge says so ("native document.modelContext detected (imperative API)"). That tells you nothing about declarative support, and the demo doesn't register anything with it.

The shim's tools are not wired into `document.modelContext.getTools()` / `executeTool()` either. The explainer says how declarative tools show up there is still TBD, so the shim exposes its own `getTools()` / `executeTool()`.

Things the shim decides because the explainer doesn't (yet):

- **Schema synthesis.** The explainer says the algorithm is TODO/TBD, and that Chromium is trialing "a loose version". [`schema-synthesis.js`](./schema-synthesis.js) maps `required`, `pattern`, `minlength`/`maxlength`, `min`/`max`/`step`, `type="email"`/`"date"`, checkboxes and `<select>` (→ `oneOf`) to the keywords you'd expect. The custom element becomes an opaque string. None of this is spec.
- **Pseudo-classes.** A script can't make `:tool-form-active` / `:tool-submit-active` match, so the shim sets `data-tool-form-active` on the form and `data-tool-submit-active` on its submit button. [`style.css`](./style.css) has rules for both the real pseudo-classes and the data attributes.
- **Human submit of an agent-filled form.** The explainer doesn't say whether that submission is `agentInvoked`. The shim treats it as completing the agent's call, so the agent gets the `respondWith()` result.
- **Result format.** The shim resolves `executeTool()` with a JSON string, like the imperative API in part 1. How a declarative tool's response reaches the agent is [under debate (issue #135)](https://github.com/webmachinelearning/webmcp/issues/135).
- **Event names.** The explainer calls the events `toolactivated` and `toolcanceled`. The spec IDL defines `ontoolcancel`. The shim fires both `toolcanceled` and `toolcancel` when the agent cancels.

The native declarative API has **not** been tested with this demo.

## What to try

1. **Run agent.** `search_flights` fills and submits itself (watch the results appear, and the URL doesn't change). Then `book_flight` is filled, outlined, and its **Confirm booking** button pulses and has focus. The agent waits. Click it to finish the run.
2. **Fill the forms yourself.** Same markup, same submit handlers, no agent. `event.agentInvoked` is `false`, so `respondWith()` is never called.
3. While the agent is waiting on the booking form, try each way to cancel:
   - **Cancel call** (the agent cancels; `toolcanceled` fires)
   - **Clear** (form reset)
   - **Rename to reserve_flight** (the tool declaration changes)
4. Tick **`toolautosubmit` on the booking form** and run again. There's no human review step anymore. The inspector updates as you change attributes, because a `MutationObserver` re-synthesizes the schemas.
5. Click **View without the page script** (`?nojs`). `main.js` stops before doing anything, so the stepper stays a number input and both forms navigate to `submitted.html` with a normal GET. For the real thing, disable JavaScript in DevTools (Command Menu → "Disable JavaScript") and reload.

The forms use `method="get"` because static servers reject `POST` (`python3 -m http.server` answers 501). A real booking form would `POST` to your server.
