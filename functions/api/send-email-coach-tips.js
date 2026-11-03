// functions/api/send-email-coach-tips.js
// POST /api/send-email-coach-tips?step=2|7  (internal only, called by email-sequence-cron.js)
// Body: { to } — the Coach buyer. Sends the day-2 (for the student) or day-7 (for the parent) tips.
import { isInternal } from './_internal.js';
import { COACH_TIPS } from './_coach-tips.js';

export async function onRequestPost({ request, env }) {
  if (!(await isInternal(request, env))) return new Response('Unauthorized', { status: 401 });
  const step = new URL(request.url).searchParams.get('step');
  const tip  = COACH_TIPS[step];
  let body;
  try { body = await request.json(); } catch { return new Response('Bad JSON', { status: 400 }); }
  if (!tip || !body.to) return new Response(JSON.stringify({ error: 'Missing step or to' }), { status: 400 });

  const res = await fetch('https://api.resend.com/emails', {
    method:  'POST',
    headers: { 'Authorization': `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body:    JSON.stringify({
      from: 'CoreMark <info@coremark.study>', to: [body.to], reply_to: 'info@coremark.study',
      subject: tip.subject, html: tip.html,
    }),
  });
  if (!res.ok) {
    console.error('[coach-tips] Resend error:', await res.text());
    return new Response(JSON.stringify({ error: 'Email send failed' }), { status: 422 });
  }
  return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
}
