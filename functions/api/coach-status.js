// functions/api/coach-status.js
// GET /api/coach-status -> { ok, available: {7,8,9}, pricePaise }
// Read by coach.html and checkout.html to decide which stages can be bought.
// Display only: create-order.js re-checks availability and sets the price.
import { coachAvailability, COACH_PRICE_PAISE } from './_coach.js';

export async function onRequestGet({ env }) {
  const available = await coachAvailability(env);
  return new Response(JSON.stringify({ ok: true, available, pricePaise: COACH_PRICE_PAISE }), {
    status: 200, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=60' },
  });
}
