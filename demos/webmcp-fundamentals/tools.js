import { searchFlights, bookFlight, getBooking } from './store.js';

/**
 * The page's WebMCP tools. Each `execute` is a thin adapter over a store
 * function the UI already uses — same validation, same state, same session.
 * Whatever an `execute` resolves to is JSON-serialized by the browser and
 * handed to the agent as a string.
 */
const TOOLS = [
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
  {
    name: 'get_booking',
    title: 'Get current booking',
    description: 'Return the booking in the current session, or null if nothing has been booked yet.',
    inputSchema: { type: 'object', properties: {} },
    // The passenger name is free text typed by a user: flag it as untrusted.
    annotations: { readOnlyHint: true, untrustedContentHint: true },
    execute: async () => ({ booking: getBooking() }),
  },
];

/**
 * Registers all tools. Returns an AbortController — calling `abort()` on it
 * unregisters every tool at once (the spec's way to remove a tool).
 */
export async function registerTools(modelContext) {
  const controller = new AbortController();
  for (const tool of TOOLS) {
    await modelContext.registerTool(tool, { signal: controller.signal });
  }
  return controller;
}
