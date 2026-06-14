// functions/api/feedback.js
// GET /api/feedback?order_id=xxx&token=xxx&rating=5
//
// Linked from Day 2 email emoji buttons.
// Verifies HMAC token, saves rating, redirects to a thank-you page.

import { getClient } from '../_db.js';

async function verifyToken(env, orderId, token) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(env.FEEDBACK_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(orderId));
  const computed = Array.from(new Uint8Array(sig))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  return computed === token;
}

function thankYouPage(rating) {
  const message = rating >= 4
    ? { emoji: '🎉', heading: 'Thanks so much!', sub: 'Really glad it\'s hitting the mark. Good luck with the upcoming exams!' }
    : rating === 3
    ? { emoji: '👍', heading: 'Thanks for letting us know', sub: 'We\'re always improving. If you have a specific suggestion, email us at support@coremark.study.' }
    : { emoji: '💬', heading: 'Thanks for the feedback', sub: 'We\'re sorry it didn\'t fully land. Please email support@coremark.study — we\'ll make it right.' };

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Thanks — CoreMark</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;700;800&display=swap" rel="stylesheet">
<style>
  *{box-sizing:border-box;margin:0;padding:0;}
  body{font-family:'Plus Jakarta Sans',sans-serif;background:#FBF8F2;color:#2A1B3D;
       min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px;}
  .card{background:#fff;border:1.5px solid #EAE3F5;border-radius:22px;padding:52px 44px;
        max-width:440px;width:100%;text-align:center;box-shadow:0 2px 8px rgba(42,27,61,0.06),0 16px 40px rgba(42,27,61,0.10);}
  .emoji{font-size:52px;margin-bottom:20px;}
  h1{font-size:26px;font-weight:800;letter-spacing:-0.025em;margin-bottom:10px;}
  p{font-size:15px;color:#7A6A94;line-height:1.6;margin-bottom:28px;}
  a{display:inline-block;padding:13px 26px;background:#6E47C9;color:#fff;
    border-radius:10px;font-weight:700;font-size:15px;text-decoration:none;}
  a:hover{background:#5234A4;}
</style>
</head>
<body>
  <div class="card">
    <div class="emoji">${message.emoji}</div>
    <h1>${message.heading}</h1>
    <p>${message.sub}</p>
    <a href="https://coremark.study">Back to CoreMark</a>
  </div>
</body>
</html>`;
}

export async function onRequestGet({ request, env }) {
  const params  = new URL(request.url).searchParams;
  const orderId = params.get('order_id');
  const token   = params.get('token');
  const rating  = parseInt(params.get('rating')) || 3;

  if (!orderId || !token) {
    return new Response('Missing parameters', { status: 400 });
  }

  // Verify token
  const valid = await verifyToken(env, orderId, token);
  if (!valid) {
    return new Response('Invalid token', { status: 403 });
  }

  // Save feedback (one per order — ignore duplicates)
  const client = await getClient(env);
  try {
    await client.query(
      `INSERT INTO feedback (order_id, rating)
       VALUES ($1::uuid, $2)
       ON CONFLICT DO NOTHING`,
      [orderId, Math.min(5, Math.max(1, rating))]
    );
  } catch (err) {
    console.error('[feedback]', err.message);
  } finally {
    await client.end();
  }

  return new Response(thankYouPage(rating), {
    status: 200,
    headers: { 'Content-Type': 'text/html;charset=UTF-8' },
  });
}
