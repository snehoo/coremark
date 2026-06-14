// functions/api/subscribe.js
// POST /api/subscribe
//
// Called from footer newsletter form (to be added to index/subject pages).
// Subscribes email to Beehiiv with source tags.
//
// Body: { email, source, subject, stage }

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS });
}

export async function onRequestPost({ request, env }) {
  let body;
  try {
    body = await request.json();
  } catch {
    return new Response('Bad JSON', { status: 400, headers: CORS });
  }

  const { email, source = 'footer', subject = '', stage = '' } = body;

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return new Response(
      JSON.stringify({ error: 'Valid email required' }),
      { status: 400, headers: { 'Content-Type': 'application/json', ...CORS } }
    );
  }

  if (!env.BEEHIIV_API_KEY || !env.BEEHIIV_PUB_ID) {
    return new Response(
      JSON.stringify({ error: 'Beehiiv not configured' }),
      { status: 503, headers: { 'Content-Type': 'application/json', ...CORS } }
    );
  }

  try {
    const res = await fetch(
      `https://api.beehiiv.com/v2/publications/${env.BEEHIIV_PUB_ID}/subscriptions`,
      {
        method:  'POST',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${env.BEEHIIV_API_KEY}`,
        },
        body: JSON.stringify({
          email:               email.trim(),
          reactivate_existing: true,
          send_welcome_email:  true,
          utm_source:          'coremark_' + source,
          utm_medium:          'organic',
          utm_campaign:        'newsletter_signup',
          custom_fields: [
            { name: 'subject', value: subject },
            { name: 'stage',   value: String(stage) },
            { name: 'source',  value: 'coremark' },
          ],
        }),
      }
    );

    if (!res.ok) {
      const err = await res.text();
      console.error('[subscribe] Beehiiv error:', err);
      return new Response(
        JSON.stringify({ error: 'Subscribe failed', detail: err }),
        { status: 502, headers: { 'Content-Type': 'application/json', ...CORS } }
      );
    }

    return new Response(
      JSON.stringify({ ok: true }),
      { status: 200, headers: { 'Content-Type': 'application/json', ...CORS } }
    );

  } catch (err) {
    console.error('[subscribe]', err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...CORS } }
    );
  }
}
