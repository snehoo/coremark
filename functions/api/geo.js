// functions/api/geo.js
// Read-only country/currency lookup for display purposes only.
// request.cf.country is set by Cloudflare at the edge from the visitor's
// resolved IP — the client cannot spoof this the way it could a body field.
// The actual charge is always re-derived server-side in create-order.js;
// this endpoint only tells the browser which price copy to render.
const CORS = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, OPTIONS' };

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS });
}

export async function onRequestGet({ request }) {
  const country  = request.cf?.country || null;
  const currency = country === 'IN' ? 'INR' : 'USD';
  return new Response(JSON.stringify({ country, currency }), {
    status: 200,
    headers: { 'Content-Type': 'application/json', ...CORS },
  });
}
