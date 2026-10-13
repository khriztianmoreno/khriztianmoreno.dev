/**
 * A simulated agent for declarative tools. Like part 1 there's no LLM: the
 * "reasoning" is hard-coded. It discovers the forms-as-tools, reads their
 * synthesized schemas, and calls them. Whether a call finishes on its own or
 * waits for you depends on one HTML attribute: toolautosubmit.
 */

export async function runAgent({ tools, goal, ui, signal }) {
  ui.reset();
  ui.status('running', 'running');
  ui.log('think', `Goal: ${goal.text}`);

  async function call(tool, input) {
    ui.count('calls');
    ui.log('tool', `executeTool("${tool.name}", ${JSON.stringify(input)})`);
    if (tool.autosubmit) {
      ui.log('think', `${tool.name} has toolautosubmit: the form is filled and submitted for me`);
    } else {
      ui.count('reviews');
      ui.status('waiting', 'waiting for you');
      ui.log('human', `${tool.name} has no toolautosubmit: the form is filled and its submit button focused. Review it, then submit it yourself.`);
    }
    const raw = await tools.executeTool(tool.name, input, { signal });
    ui.status('running', 'running');
    const result = JSON.parse(raw);
    ui.json(`← ${raw.length.toLocaleString()} ch of JSON (no navigation)`, result);
    return result;
  }

  try {
    const catalog = await tools.getTools();
    ui.count('tools', catalog.length);
    ui.log('observe', `getTools() → ${catalog.length} declarative tools (synthesized from <form> markup)`);
    for (const tool of catalog) ui.json(`${tool.name}${tool.autosubmit ? '  [toolautosubmit]' : '  [human submits]'}`, tool);

    const byName = (name) => {
      const found = catalog.find((t) => t.name === name);
      if (!found) throw new Error(`the page does not expose a "${name}" tool (tool names are the contract)`);
      return found;
    };

    const { flights } = await call(byName('search_flights'), goal.search);
    const pick = flights.filter((f) => f.stops === 0).sort((a, b) => a.price - b.price)[0];
    if (!pick) throw new Error('no nonstop flights in the results');
    ui.log('think', `cheapest nonstop: ${pick.airline} ${pick.id} at $${pick.price}`);

    const book = byName('book_flight');
    const result = await call(book, { flight: pick.id, ...goal.booking });
    if (!result.ok) throw new Error(`book_flight failed: ${result.error}`);

    const how = book.autosubmit ? 'auto-submitted' : 'after you reviewed and submitted the form';
    ui.log('ok', `booked ${result.booking.confirmation} for ${result.booking.passenger} (${how})`);
    ui.status('done', 'done');
  } catch (err) {
    const canceled = err.name === 'AbortError';
    ui.log('fail', canceled ? `invocation canceled: ${err.message}` : err.message);
    ui.status('failed', canceled ? 'canceled' : 'failed');
  }
}
