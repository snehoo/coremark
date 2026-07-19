// functions/api/admin-email.js
// POST /api/admin-email  — send a one-off email from info@coremark.study via Resend
// Auth: x-metrics-secret header (same secret as /api/metrics)
//
// Body: { to, subject, text }
//   to      — recipient address (string)
//   subject — email subject
//   text    — plain-text body (auto-wrapped in minimal HTML)

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, x-metrics-secret',
};

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS });
}

export async function onRequestPost({ request, env }) {
  if (request.headers.get('x-metrics-secret') !== env.METRICS_SECRET) {
    return new Response('Unauthorized', { status: 401, headers: CORS });
  }

  let body;
  try { body = await request.json(); }
  catch { return new Response('Bad JSON', { status: 400, headers: CORS }); }

  const { to, subject, text } = body;
  if (!to || !subject || !text) {
    return new Response(
      JSON.stringify({ error: 'Missing to, subject, or text' }),
      { status: 400, headers: { 'Content-Type': 'application/json', ...CORS } }
    );
  }

  const html = `<!DOCTYPE html>
<html><body style="font-family:'Plus Jakarta Sans',Arial,sans-serif;max-width:520px;margin:32px auto;color:#2A1B3D;font-size:15px;line-height:1.7;">
${text.split('\n').map(l => l.trim() ? `<p style="margin:0 0 14px;">${l}</p>` : '').join('')}
<p style="margin:32px 0 0;font-size:13px;color:#7A6A94;">
— Team CoreMark<br>
<a href="https://coremark.study" style="color:#6E47C9;text-decoration:none;">coremark.study</a>
&nbsp;·&nbsp;
<a href="mailto:info@coremark.study" style="color:#6E47C9;text-decoration:none;">info@coremark.study</a>
</p>
</body></html>`;

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type':  'application/json',
      },
      body: JSON.stringify({
        from:    'CoreMark <info@coremark.study>',
        to:      [to],
        subject,
        html,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      return new Response(
        JSON.stringify({ ok: false, error: err }),
        { status: 503, headers: { 'Content-Type': 'application/json', ...CORS } }
      );
    }

    const data = await res.json();
    return new Response(
      JSON.stringify({ ok: true, id: data.id }),
      { status: 200, headers: { 'Content-Type': 'application/json', ...CORS } }
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ ok: false, error: e.message }),
      { status: 422, headers: { 'Content-Type': 'application/json', ...CORS } }
    );
  }
}
