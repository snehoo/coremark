// functions/api/subscribe.js
// Adds a contact to Brevo CoreMark Leads list (ID 2).
// Called from footer/inline opt-in forms.
// Body: { email, source, subject, stage }

async function sha256(text) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text.toLowerCase().trim()));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,'0')).join('');
}

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
  try { body = await request.json(); }
  catch { return new Response('Bad JSON', { status: 400, headers: CORS }); }

  const { email, source = 'footer', subject = '', stage = '' } = body;

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return new Response(
      JSON.stringify({ error: 'Valid email required' }),
      { status: 400, headers: { 'Content-Type': 'application/json', ...CORS } }
    );
  }

  if (!env.BREVO_API_KEY) {
    return new Response(
      JSON.stringify({ error: 'Email service not configured' }),
      { status: 503, headers: { 'Content-Type': 'application/json', ...CORS } }
    );
  }

  try {
    const res = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'api-key': env.BREVO_API_KEY },
      body: JSON.stringify({
        email: email.trim(),
        listIds: [2],
        updateEnabled: true,
        attributes: {
          SOURCE:  'coremark_' + source,
          SUBJECT: subject,
          STAGE:   String(stage),
        },
      }),
    });

    // 204 = already exists and updated, 201 = created — both are success
    if (!res.ok && res.status !== 204) {
      const err = await res.text();
      console.error('[subscribe] Brevo error:', err);
      return new Response(
        JSON.stringify({ error: 'Subscribe failed' }),
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
