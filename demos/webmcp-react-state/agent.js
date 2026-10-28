/**
 * A simulated in-page agent. No LLM: the plan is hard-coded, like parts 1
 * and 2. It only talks to the page through getTools() and executeTool(),
 * so whatever it sees is whatever the tools' `execute` returns at call time.
 */
import { sleep } from './agent-console.js';

export const GOAL = 'Add the cheapest nonstop BOG → MAD flight to my trip cart, then tell me what is in the cart and what it costs.';

const STEP_DELAY = 350;

async function findTool(modelContext, name) {
  const tools = await modelContext.getTools();
  return tools.find((t) => t.name === name) ?? null;
}

// Look the tool up right before calling it: tools come and go with components.
async function call(modelContext, ui, name, input = {}) {
  const tool = await findTool(modelContext, name);
  if (!tool) throw new Error(`Tool "${name}" is not registered right now.`);
  ui.log('tool', `executeTool("${name}", ${JSON.stringify(input)})`);
  const json = await modelContext.executeTool(tool, input);
  const value = JSON.parse(json);
  ui.json(`← ${json.length} ch of JSON`, value);
  return value;
}

export async function runAgent({ modelContext, ui }) {
  ui.reset();
  ui.status('running', 'running');
  try {
    ui.log('observe', 'getTools()');
    const tools = await modelContext.getTools();
    ui.log('observe', `${tools.length} tools: ${tools.map((t) => t.name).join(', ')}`);
    await sleep(STEP_DELAY);

    const trip = await call(modelContext, ui, 'get_trip_state');
    const nonstop = trip.results.filter((f) => f.stops === 0).sort((a, b) => a.pricePerPassenger - b.pricePerPassenger);
    if (nonstop.length === 0) throw new Error('No nonstop results on screen.');
    const pick = nonstop[0];
    ui.log('think', `Cheapest nonstop: ${pick.id} (${pick.airline}) at $${pick.pricePerPassenger} per passenger.`);
    await sleep(STEP_DELAY);

    await call(modelContext, ui, 'add_flight_to_cart', { flightId: pick.id });
    await sleep(STEP_DELAY);

    const cart = await call(modelContext, ui, 'get_cart_items');
    ui.log('think', `Cart: ${cart.items.map((i) => i.id).join(', ') || '(empty)'} · ${cart.passengers} pax · subtotal $${cart.subtotal}.`);
    await sleep(STEP_DELAY);

    if (await findTool(modelContext, 'quote_fare')) {
      const quote = await call(modelContext, ui, 'quote_fare');
      ui.log('ok', `Done. Total with taxes and fees: $${quote.total} (quote #${quote.quoteNumber}).`);
    } else {
      ui.log('ok', 'Done.');
    }
    ui.status('done', 'done');
  } catch (err) {
    ui.log('fail', `${err.name}: ${err.message}`);
    ui.status('failed', 'failed');
  }
}

/** One read, so you can change the cart by hand and see what the agent gets. */
export async function rereadCart({ modelContext, ui }) {
  try {
    const cart = await call(modelContext, ui, 'get_cart_items');
    ui.log('observe', `Agent sees: ${cart.items.map((i) => i.id).join(', ') || '(empty)'} · ${cart.passengers} pax · subtotal $${cart.subtotal}.`);
  } catch (err) {
    ui.log('fail', `${err.name}: ${err.message}`);
  }
}
