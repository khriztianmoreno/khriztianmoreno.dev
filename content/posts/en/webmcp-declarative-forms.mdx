---
title: "Semantic markup for AI: turn your forms into WebMCP tools without JavaScript"
tags:
  - webmcp
  - ai-agents
  - mcp
  - chrome-ai
  - web-platform
  - html
  - forms
date: 2026-10-13 09:30:00
updated: 2026-10-19 09:30:00
---

> **UPDATE (October 19, 2026):** on October 16 the declarative explainer was synced with the spec and renamed the `toolcanceled` event to `toolcancel`, the same name the IDL defines. The naming mismatch is gone, so I updated the "An honest caveat" section and the demo, which now fires only `toolcancel`.

In the [first post in this series](/blog/webmcp-fundamentals), every WebMCP tool was a JavaScript object: a name, a description, a hand-written `inputSchema`, and an `execute` function that called the store. It works, and for logic that lives in JavaScript it's exactly what you want. But look at your app for a second: where does most of what a user can *do* actually live? Search, filter, subscribe, book, pay, leave a comment. Almost all of it is a `<form>`.

And a form is already, to a large extent, a tool description. It has a name per field (`name`), types (`type="date"`, `type="email"`), rules (`required`, `pattern`, `min`, `max`), closed sets of options (`<select>`), and a submission endpoint. The only thing it's missing for an agent to understand it is natural-language context: what the form does and what each field means.

That's what the **WebMCP declarative API** proposes: a handful of attributes that turn an ordinary `<form>` into a tool. **The basic tool needs zero lines of JavaScript**, and it degrades perfectly: a human still sees a normal form. JavaScript only comes back for one thing: answering the agent without navigating.

I built a demo in the same flight domain as the previous post. The code is in [`demos/webmcp-declarative-forms`](https://github.com/khriztianmoreno/khriztianmoreno.dev/tree/main/demos/webmcp-declarative-forms) (the [README](https://github.com/khriztianmoreno/khriztianmoreno.dev/blob/main/demos/webmcp-declarative-forms/README.md) explains how to run it).

## How the demo works

<figure>
  <video controls preload="metadata" width="100%">
    <source src="https://res.cloudinary.com/khriztianmoreno/video/upload/f_auto,q_auto/v1791851489/blogpost-demos/webmcp-declarative-forms/webmcp-declarative-forms_zcece8.mp4" type="video/mp4" />
    Your browser doesn't support embedded video — <a href="https://github.com/khriztianmoreno/khriztianmoreno.dev/tree/main/demos/webmcp-declarative-forms">clone the demo</a> and run it locally instead.
  </video>
  <figcaption>The full run: the agent searching on its own, stopping at the booking form for you to review, and the three ways to cancel.</figcaption>
</figure>

The app is SkyFare again, but this time there's no `registerTool()` anywhere. It's **two plain HTML forms** with declarative attributes:

- **`search_flights`** has `toolautosubmit`: the agent fills it and the form submits itself.
- **`book_flight`** doesn't: the agent fills it, the submit button gets focus, and **you** review and confirm.

Next to them are two panels. One is a **simulated agent** (no LLM, same as part 1: the plan is hard-coded) with the goal *find the cheapest nonstop flight BOG → MAD for 2 passengers and book it for Ana Gómez*. The other is a **schema inspector** that shows, live, the JSON Schema that comes out of each form.

In my runs (headless Chrome 154, using the shim):

1. **The agent discovers 2 tools** from the markup, without the page registering anything.
2. **`search_flights` fills and submits itself.** The agent gets 745 characters of JSON with the flights, and the URL doesn't change: zero navigations.
3. **`book_flight` fills and then waits.** The form gets highlighted, and the "Confirm booking" button pulses and has focus. The agent can't finish until you click. When you do, it gets 313 characters of JSON with the confirmation.

While it waits, you can cancel in three different ways: the agent cancels, you reset the form, or the page changes the `toolname`. All three cut off the in-flight invocation.

## The problem: every tool needed JavaScript

Part 1 left us with a core idea: a tool isn't a second implementation of the feature, it's another entry point into the one you already have. But with the imperative API, you have to build that entry point by hand. This is what `search_flights` looked like in the first demo's [`tools.js`](https://github.com/khriztianmoreno/khriztianmoreno.dev/blob/main/demos/webmcp-fundamentals/tools.js):

```js
{
  name: 'search_flights',
  title: 'Search flights',
  description:
    'Search available flights between two airports. Returns every matching flight with id, airline, times, number of stops and price in USD.',
  inputSchema: {
    type: 'object',
    properties: {
      origin: { type: 'string', description: 'IATA code of the departure airport, e.g. "BOG".' },
      destination: { type: 'string', description: 'IATA code of the arrival airport, e.g. "MAD".' },
      date: { type: 'string', format: 'date', description: 'Departure date, YYYY-MM-DD.' },
    },
    required: ['origin', 'destination'],
  },
  annotations: { readOnlyHint: true },
  execute: async ({ origin, destination, date }) => {
    const flights = searchFlights({ origin, destination, date });
    return { count: flights.length, flights };
  },
},
```

Look at the `inputSchema`. That block **repeats information your form already has**: that `origin` is a required string, that `date` is a date. And because it's duplicated, it can drift: the day someone adds a `pattern` to the origin input, the schema never hears about it. On top of that, not everything on your site sits behind a JavaScript function. Plenty of forms just `POST` to the server and that's it. To expose them with the imperative API, you'd have to rewrite them first.

## Building block 1: the same contract, written in HTML

This is the demo's search form, in [`index.html`](https://github.com/khriztianmoreno/khriztianmoreno.dev/blob/main/demos/webmcp-declarative-forms/index.html) (I left out the cabin and passenger fields so it reads better):

```html
<form
  id="search-form"
  action="submitted.html"
  method="get"
  toolname="search_flights"
  tooldescription="Search flights between two airports on a given date. Returns each flight's id, airline, times, number of stops and per-passenger price."
  toolautosubmit
  class="tool-form grid grid-cols-2 gap-3 sm:grid-cols-4"
>
  <label class="field">From
    <input name="origin" required pattern="[A-Za-z]{3}" maxlength="3" placeholder="BOG" autocomplete="off" title="3-letter airport code"
      toolparamdescription="Origin airport, as a 3-letter IATA code (e.g. BOG)" />
  </label>
  <label class="field">To
    <input name="destination" required pattern="[A-Za-z]{3}" maxlength="3" placeholder="MAD" autocomplete="off" title="3-letter airport code"
      toolparamdescription="Destination airport, as a 3-letter IATA code (e.g. MAD)" />
  </label>
  <label class="field col-span-2">Date
    <input name="date" type="date" required min="2026-10-13" max="2027-10-12"
      toolparamdescription="Departure date" />
  </label>
```

The pattern comes straight from the [declarative API explainer](https://github.com/webmachinelearning/webmcp/blob/main/declarative-api-explainer.md), which shows the same side-by-side with a car search. There are only a few attributes:

- **On the `<form>`:** `toolname` (the equivalent of the imperative tool's `name`), `tooldescription` (the equivalent of `description`), and `toolautosubmit`, a boolean attribute we'll get to in building block 3.
- **On each control:** the usual `name` becomes the property name, and `toolparamdescription` provides its description.

One detail you'll see wrong in a few places: **there is no `toolparam` attribute**. The property name is the control's `name`, the same one that already travels with the form submission. The only new thing per control is the description.

And notice what *isn't* there: no `execute`, no `registerTool()`, no `AbortController` to unregister. According to the explainer, when a form with these attributes is inserted, removed, or has those attributes changed, the browser creates a new declarative tool. The tool's lifecycle is the element's lifecycle.

## Building block 2: from form to JSON Schema (and why it's TBD)

For the agent to know how to fill the form, the browser has to "compile" it into an `inputSchema`. The explainer calls this *input schema synthesis*, and here's the part I most want to be clear about: **the algorithm doesn't exist in the spec yet.** The section literally says TODO: it still needs to specify how `<input>`, `<select>`, and attributes like `step` and `min` reduce to a JSON Schema with `anyOf`, `oneOf`, `minimum`, and `maximum`. Chromium is implementing "a loose version" of it to trial.

So the demo ships **our own approximation**, in [`schema-synthesis.js`](https://github.com/khriztianmoreno/khriztianmoreno.dev/blob/main/demos/webmcp-declarative-forms/schema-synthesis.js), and the inspector shows it with a label that says so. This table is what I'd *expect* to happen, not what a standard says:

| In the HTML | Our approximation in JSON Schema |
| --- | --- |
| `required` | The property goes into `required` |
| `pattern="[A-Za-z]{3}"` | `"pattern": "^(?:[A-Za-z]{3})$"` (HTML anchors patterns implicitly; JSON Schema doesn't) |
| `minlength` / `maxlength` | `minLength` / `maxLength` |
| `type="email"` | `"format": "email"` |
| `type="date"` with `min` / `max` | `"format": "date"`; the range goes into a `$comment`, because JSON Schema has no standard keyword for date ranges |
| `type="number" min="0" max="3"` | `"type": "integer", "minimum": 0, "maximum": 3` (the default `step` is 1, hence integer) |
| `type="checkbox"` | `"type": "boolean"` |
| `<select>` | `"oneOf": [{ "const": "economy", "title": "Economy" }, …]`; the empty placeholder is dropped when the select is `required` |
| Form-associated custom element | `"type": "string"` with a `$comment`: the mapping is unspecified |

Building this taught me two things. First, **your HTML validation becomes documentation for the agent**. That `pattern` you added for the user now also tells the model what format the field expects. Second, some things don't translate well: a date range has no standard keyword, and a custom control is opaque. Validation still runs when the form is submitted (it's HTML, after all), but the agent can't see it ahead of time.

The inspector updates through a `MutationObserver`. Tick the `toolautosubmit` checkbox or rename the tool, and you'll see the schema re-synthesized on the spot.

## Building block 3: `toolautosubmit` or human review

This is the most important design decision in the API, and it's a single boolean attribute:

- **With `toolautosubmit`**, the agent fills the form and submits it on the user's behalf. That makes sense for a search: it's read-only and has no consequences.
- **Without `toolautosubmit`**, once the agent is done filling, **the browser brings the submit button into focus**, and the agent should tell the user to check the form and submit it manually.

In part 1, the "Approve / Deny" before booking was implemented by my simulated agent reading `consequentialHint`. Here, the human in the loop comes for free: **it's the form itself**, with the agent's data in plain view, and the same button as always. No JavaScript, no separate dialog.

To make sure the user notices a form waiting for them, the explainer proposes two CSS pseudo-classes: `:tool-form-active` for the `<form>` whose tool is "running", and `:tool-submit-active` for its submit button. A script can't make a real pseudo-class match, so the shim mirrors them as `data-*` attributes, and [`style.css`](https://github.com/khriztianmoreno/khriztianmoreno.dev/blob/main/demos/webmcp-declarative-forms/style.css) has both versions:

```css
form:tool-form-active {
  outline: 2px dashed var(--review);
  outline-offset: 8px;
  border-radius: 0.5rem;
}

/* ... */

form[data-tool-form-active] {
  outline: 2px dashed var(--review);
  outline-offset: 8px;
  border-radius: 0.5rem;
}
```

They're separate rules on purpose: a browser that doesn't know `:tool-form-active` drops the whole rule, so if you put both versions in a single selector list, that browser would drop the shim's version too.

The invocation can also be cut off. According to the explainer, if the form is reset or its tool declaration changes (say, its `toolname`), the in-flight invocation is canceled and the agent is notified. In the demo you can try it with the "Clear" and "Rename to reserve_flight" buttons while the agent is waiting.

### Find, preview, commit

After part 1, a reader asked a question worth its weight in gold: if the agent no longer has to guess which button to press, how does a site express the difference between **finding** an option, **previewing** the result, and **committing** a change? Those are three distinct intents, and today WebMCP covers them unevenly:

| Intent | Imperative API (part 1) | Declarative API (this part) |
| --- | --- | --- |
| **Find** | `readOnlyHint` on the tool | a search form with `toolautosubmit` |
| **Preview** | not a concept: you model it as a separate read-only tool (e.g. `quote_booking`) | the agent-filled form waiting for review (`:tool-form-active`, focus on the submit button) |
| **Commit** | `consequentialHint`, plus your own approval UI | the human presses submit (no `toolautosubmit`) |

The awkward part: the declarative API has **no** equivalent to `readOnlyHint` or `consequentialHint`. The only attributes the explainer proposes are `toolname`, `tooldescription`, `toolautosubmit`, and `toolparamdescription`. The only signal that "this has consequences" is the absence of `toolautosubmit`.

What follows is my own reading, not something in the explainer: the web has had this distinction for decades. In HTTP, `GET` is a *safe* method, meant for reading, and `POST` isn't. A well-built form already declares its intent through its `method`: search goes over `GET`, booking over `POST`. Note that the demo's booking form uses `GET` only because a static server rejects `POST`; a real app would use `POST`. If tool synthesis ended up using that signal, agents would inherit semantics the web already understands instead of inventing new ones. Solving this properly, with permissions and confirmations, is the topic of this series' human-in-the-loop post.

## Building block 4: `agentInvoked` and `respondWith()`, where JavaScript comes back

So far, zero JavaScript. But there's a gap: when the agent submits the search form, what does it get back? Without JavaScript, the form navigates to its `action`, as always. The explainer had an idea for that case: use the first `<script type="application/ld+json">` on the destination page as the response. That idea is now **under debate** in [issue #135](https://github.com/webmachinelearning/webmcp/issues/135).

The alternative, which the demo uses, is to answer from the page. The explainer adds two members to `SubmitEvent`: `agentInvoked`, to tell whether an agent triggered the submission, and `respondWith(promise)`, to hand the agent a response without navigating. The rule: you must call `preventDefault()` **before** `respondWith()`. Here's how it looks in [`app.js`](https://github.com/khriztianmoreno/khriztianmoreno.dev/blob/main/demos/webmcp-declarative-forms/app.js):

```js
searchForm.addEventListener('submit', (event) => {
  // Enhanced path: answer in-page instead of navigating to the GET action.
  event.preventDefault();
  const flights = searchFlights(Object.fromEntries(new FormData(searchForm)));
  renderResults(resultsEl, flights, bookForm);

  if (event.agentInvoked) {
    // The agent gets structured data back; the page never navigates.
    event.respondWith(Promise.resolve({ flights }));
  }
});
```

This is what I liked most about the approach: **it's the same handler for humans and agents.** If you fill in the search yourself, `agentInvoked` is `false`, the results render on the page, and that's it. If the agent fills it, exactly the same thing happens, and the agent also gets `{ flights }` as data, so it doesn't have to read the results list. The only agent-specific line is the `if`.

One detail the explainer doesn't settle: when the agent fills `book_flight` and you click "Confirm booking", is that submission `agentInvoked`? The shim says yes, so the agent receives the confirmation. That's my call, not something the text says.

## Building block 5: Web Components that take part

The explainer talks about `<form>` and [form-associated elements](https://html.spec.whatwg.org/#form-associated-element). It doesn't mention `<details>`, tables, or microformats. But here's an important detail: a custom element with `static formAssociated = true` and `ElementInternals` **is** a form-associated element per HTML. So a Web Component can take part. The demo has one, [`passenger-stepper.js`](https://github.com/khriztianmoreno/khriztianmoreno.dev/blob/main/demos/webmcp-declarative-forms/passenger-stepper.js):

```js
class PassengerStepper extends HTMLElement {
  static formAssociated = true;

  #internals = this.attachInternals();
```

It shows up in `form.elements`, submits its value with `setFormValue()`, validates with `setValidity()`, and responds to reset with `formResetCallback()`. To the shim, it's just another control.

Now, what follows is **my inference, not spec**: the explainer doesn't say how a custom element maps to a schema. An `<input type="number" min="1" max="6">` tells the agent "integer between 1 and 6". My custom element, on the other hand, is a black box: the browser has no way of knowing which values it accepts. That's why, in our approximation, it comes out as a `string` with a `$comment`, and the demo's agent sends `"2"`. Validation still works on submit, but the agent loses the type and the range. If you can use a native control, the agent comes out ahead.

## Building block 6: real progressive enhancement

Since it's all HTML, the demo works without JavaScript. Both forms `GET` `submitted.html`, a static page that shows you what arrived. The stepper has a fallback too: in the markup, it wraps a plain `<input type="number" name="passengers">`, and when the custom element upgrades, it copies its contract (`name`, `min`, `max`, and `toolparamdescription`) and replaces it. Without JavaScript, the element never upgrades and the form submits the plain input.

To try it without touching your browser settings, the "View without the page script" link loads the page with `?nojs`, and [`main.js`](https://github.com/khriztianmoreno/khriztianmoreno.dev/blob/main/demos/webmcp-declarative-forms/main.js) stops before doing anything:

```js
if (new URLSearchParams(location.search).has('nojs')) {
  document.documentElement.dataset.nojs = '';
} else {
  await boot();
}
```

It's a simulation, and the UI says so. For the real test, disable JavaScript in DevTools. That's how I verified it with Playwright: with JavaScript off, the booking form navigates to `submitted.html?flight=IB-6584&passenger=Ana+G%C3%B3mez&…` like any form from the 2000s.

That's the underlying argument: **declarative attributes cost nobody anything.** A browser that doesn't understand them ignores them, a human sees the same form as always, and the page that already worked keeps working.

## An honest caveat: this is even earlier than part 1

If the imperative API is a proposal, the declarative one is a step further back:

- **It only exists in an explainer.** It's not in the [spec](https://webmachinelearning.github.io/webmcp/), which is itself a Draft Community Group Report off the standards track.
- **Schema synthesis is TBD.** Everything in the table is our approximation. Chromium is trialing its own loose version, and the result may differ.
- **How the response gets back to the agent is under debate** ([issue #135](https://github.com/webmachinelearning/webmcp/issues/135)). `respondWith()` is in the explainer, but the no-JavaScript path (`application/ld+json` on the destination page) is still being discussed.
- **Where the events fire is still open.** The explainer and the spec IDL now agree on the names: `toolactivated` and `toolcancel`. What isn't settled is whether, for declarative tools, they fire at the `ModelContext` or at the `<form>` that registered the tool ([issue #126](https://github.com/webmachinelearning/webmcp/issues/126)). The shim fires them on its own object.
- **Integration with `getTools()` / `executeTool()` is TBD.** The explainer says declarative tools will almost certainly be invokable through them, but the details aren't there. That's why the shim exposes its own `getTools()` / `executeTool()` and leaves `document.modelContext` alone.
- **I haven't tested the native path.** There's no documented way to detect support for the declarative API, so the demo doesn't invent one: the declarative behavior is **always** the shim. If your browser exposes the imperative `document.modelContext`, the badge shows it, but that tells you nothing about forms.

## What I learned building this

1. **Your forms were already a contract.** `name`, `type`, `required`, and `pattern` have been describing what your app expects for years. The declarative API doesn't ask for a new contract; it asks you to add the descriptions.
2. **Human-in-the-loop can be an attribute.** Leaving out `toolautosubmit` is enough to make the user review a consequential action, with a UI they already know. It's the cheapest form of control I've seen so far in this series.
3. **One handler for humans and agents.** `agentInvoked` + `respondWith()` doesn't make you fork your logic: you just add a structured response at the end of the path that already existed.
4. **Native beats custom, at least for the agent.** A Web Component can take part, but a native `<input>` gives the model types and ranges that an opaque component hides.

In the next posts in the series, we'll look at what happens when state lives in an SPA's hooks and stores, how to design human-in-the-loop permissions beyond a form, and how to debug all of this with DevTools.

---

### To keep exploring

- **The declarative API explainer:** [`declarative-api-explainer.md`](https://github.com/webmachinelearning/webmcp/blob/main/declarative-api-explainer.md), the source for everything in this post.
- **The issue about the agent response:** [webmachinelearning/webmcp#135](https://github.com/webmachinelearning/webmcp/issues/135), where the way a form's result gets back to the agent is being discussed.
- **The WebMCP spec:** [webmachinelearning.github.io/webmcp](https://webmachinelearning.github.io/webmcp/), the Draft Community Group Report (the imperative API).
- **Part 1 of the series:** [WebMCP — Why agents shouldn't have to guess how your UI works](/blog/webmcp-fundamentals), with `registerTool()`, `getTools()`, and `executeTool()`.
- **The full demo:** [`demos/webmcp-declarative-forms`](https://github.com/khriztianmoreno/khriztianmoreno.dev/tree/main/demos/webmcp-declarative-forms) — run the agent, leave it waiting on the booking form, and try all three ways to cancel.

How many of your app's forms could be tools tomorrow just by adding descriptions? I'd love to hear which one you'd expose first. Let's talk on [X/Twitter](https://twitter.com/khriztianmoreno) or [LinkedIn](https://www.linkedin.com/in/khriztianmoreno/).

![Profile](https://res.cloudinary.com/khriztianmoreno/image/upload/c_scale,w_148/v1591324337/KM-brand/stickers/sticker-3_2x.png)
