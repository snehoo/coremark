// functions/api/feedback.js
import { getSQL } from '../_db.js';

async function verifyToken(env, orderId, token) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(env.FEEDBACK_SECRET), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(orderId));
  const computed = Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2,'0')).join('');
  return computed === token;
}

function thankYouPage(rating) {
  const m = rating >= 4 ? { emoji:'🎉', h:'Thanks so much!', s:"Really glad it's hitting the mark." }
    : rating === 3 ? { emoji:'👍', h:'Thanks for letting us know', s:'We\'re always improving. Email support@coremark.study with suggestions.' }
    : { emoji:'💬', h:'Thanks for the feedback', s:'Sorry it didn\'t fully land. Email support@coremark.study and we\'ll make it right.' };
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Thanks — CoreMark</title>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;700;800&display=swap" rel="stylesheet">
<style>*{box-sizing:border-box;margin:0;padding:0;}body{font-family:'Plus Jakarta Sans',sans-serif;background:#FBF8F2;color:#2A1B3D;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px;}.card{background:#fff;border:1.5px solid #EAE3F5;border-radius:22px;padding:52px 44px;max-width:440px;width:100%;text-align:center;}.emoji{font-size:52px;margin-bottom:20px;}h1{font-size:26px;font-weight:800;margin-bottom:10px;}p{font-size:15px;color:#7A6A94;line-height:1.6;margin-bottom:28px;}a{display:inline-block;padding:13px 26px;background:#6E47C9;color:#fff;border-radius:10px;font-weight:700;font-size:15px;text-decoration:none;}</style>
</head><body><div class="card"><div class="emoji">${m.emoji}</div><h1>${m.h}</h1><p>${m.s}</p><a href="https://coremark.study">Back to CoreMark</a></div></body></html>`;
}

export async function onRequestGet({ request, env }) {
  const params  = new URL(request.url).searchParams;
  const orderId = params.get('order_id');
  const token   = params.get('token');
  const rating  = Math.min(5, Math.max(1, parseInt(params.get('rating')) || 3));
  if (!orderId || !token) return new Response('Missing params', { status: 400 });
  const valid = await verifyToken(env, orderId, token);
  if (!valid) return new Response('Invalid token', { status: 403 });
  try {
    const sql = getSQL(env);
    await sql`INSERT INTO feedback (order_id, rating) VALUES (${orderId}::uuid, ${rating}) ON CONFLICT DO NOTHING`;
  } catch (err) { console.error('[feedback]', err.message); }
  return new Response(thankYouPage(rating), { status: 200, headers: { 'Content-Type': 'text/html;charset=UTF-8' } });
}
