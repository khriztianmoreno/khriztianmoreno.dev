/**
 * A simulated agent that never looks at the DOM. It discovers what the page
 * can do with getTools(), reads the schemas, and calls executeTool(). Like
 * the actuation agent there's no LLM — the "reasoning" is hard-coded — but
 * notice what it depends on: tool names and JSON, not markup.
 */

// RegisteredTool carries a `window` reference — not something you'd send to a model.
const describeTool = ({ window: _window, ...meta }) => meta;

export async function runWebMcpAgent({ modelContext, goal, ui }) {
  ui.reset();
  ui.status('running', 'running');
  ui.log('think', `Goal: ${goal.text}`);

  async function call(tool, input) {
    const raw = await modelContext.executeTool(tool, input);
    const inputJson = JSON.stringify(input);
    ui.step('tool', `executeTool("${tool.name}", ${inputJson})`, inputJson.length);
    ui.addPayload(raw.length);
    const result = JSON.parse(raw); // executeTool() always resolves to a string
    ui.json(`← ${raw.length.toLocaleString()} ch of JSON`, result);
    return result;
  }

  try {
    const tools = (await modelContext.getTools()).map((t) => ({ tool: t, meta: describeTool(t) }));
    const catalog = JSON.stringify(tools.map((t) => t.meta));
    ui.step('observe', `getTools() → ${tools.length} tools`, catalog.length);

    for (const { meta } of tools) {
      const hints = Object.entries(meta.annotations ?? {})
        .filter(([, on]) => on)
        .map(([k]) => k);
      ui.json(`${meta.name}${hints.length ? `  [${hints.join(', ')}]` : ''}`, meta);
    }

    const byName = (name) => {
      const found = tools.find((t) => t.meta.name === name);
      if (!found) throw new Error(`the page does not expose a "${name}" tool`);
      return found;
    };

    const search = byName('search_flights');
    const { flights } = await call(search.tool, { origin: goal.origin, destination: goal.destination, date: goal.date });

    const pick = flights.filter((f) => f.stops === 0).sort((a, b) => a.price - b.price)[0];
    if (!pick) throw new Error('no nonstop flights in the results');
    ui.log('think', `cheapest nonstop: ${pick.airline} ${pick.id} at $${pick.price} (read from a number, not from pixels)`);

    const book = byName('book_flight');
    if (book.meta.annotations?.consequentialHint) {
      const approved = await ui.approval(`book_flight is consequential. Book ${pick.id} for ${goal.passenger}?`);
      if (!approved) {
        ui.log('fail', 'user denied the booking — nothing was changed');
        ui.status('failed', 'denied');
        return;
      }
    }

    const booked = await call(book.tool, { flightId: pick.id, passenger: goal.passenger });
    if (!booked.ok) throw new Error(`book_flight failed: ${booked.error}`);

    const { booking } = await call(byName('get_booking').tool, {});
    ui.log('ok', `verified booking ${booking.confirmation} for ${booking.passenger} — same state the UI is showing`);
    ui.status('done', 'done');
  } catch (err) {
    ui.log('fail', err.message);
    ui.status('failed', 'failed');
  }
}
