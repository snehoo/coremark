// functions/api/razorpay-webhook.js
import { getSQL, sha256 } from '../_db.js';

async function verifyRazorpaySignature(rawBody, signature, secret) {
  const key = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']
  );
  const sigBytes = new Uint8Array(signature.match(/.{2}/g).map(b => parseInt(b, 16)));
  return crypto.subtle.verify('HMAC', key, sigBytes, new TextEncoder().encode(rawBody));
}

export async function onRequestGet() { return new Response('OK', { status: 200 }); }

export async function onRequestPost({ request, env }) {
  const rawBody  = await request.text();
  const signature = request.headers.get('x-razorpay-signature') ?? '';

  if (env.RAZORPAY_WEBHOOK_SECRET) {
    const valid = await verifyRazorpaySignature(rawBody, signature, env.RAZORPAY_WEBHOOK_SECRET);
    if (!valid) return new Response('Unauthorized', { status: 401 });
  }

  let event;
  try { event = JSON.parse(rawBody); }
  catch { return new Response('Bad JSON', { status: 400 }); }

  const sql = getSQL(env);
  const { event: eventName, payload } = event;

  if (eventName === 'payment.captured') {
    const payment = payload.payment.entity;
    const notes   = payment.notes ?? {};
    const buyerEmail  = notes.buyer_email ?? null;
    const buyerHash   = buyerEmail ? await sha256(buyerEmail) : null;
    const country     = payment.international ? 'International' : 'IN';
    const orderType   = notes.order_type   ?? 'single';
    const primarySlug = notes.primary_slug ?? null;
    const itemSlugs   = notes.item_slugs   ? notes.item_slugs.split(',') : [];
    const subject     = notes.subject      ?? null;
    const stage       = notes.stage        ? parseInt(notes.stage) : null;

    if (buyerHash) {
      await sql`
        INSERT INTO buyers (buyer_hash, country, order_count, total_paise)
        VALUES (${buyerHash}, ${country}, 1, ${payment.amount})
        ON CONFLICT (buyer_hash) DO UPDATE SET
          order_count = buyers.order_count + 1,
          total_paise = buyers.total_paise + ${payment.amount},
          updated_at  = NOW()`;
    }

    const result = await sql`
      UPDATE orders SET
        razorpay_payment_id = ${payment.id},
        buyer_hash = ${buyerHash},
        buyer_email = ${buyerEmail},
        status = 'paid', paid_at = NOW()
      WHERE razorpay_order_id = ${payment.order_id} AND status != 'paid'`;

    if (result.length === 0) {
      await sql`
        INSERT INTO orders
          (razorpay_order_id, razorpay_payment_id, buyer_hash, buyer_email,
           order_type, primary_slug, item_slugs, amount_paise, currency,
           status, subject, stage, paid_at, source)
        VALUES (
          ${payment.order_id}, ${payment.id}, ${buyerHash}, ${buyerEmail},
          ${orderType}, ${primarySlug}, ${JSON.stringify(itemSlugs)}::jsonb,
          ${payment.amount}, 'INR', 'paid', ${subject}, ${stage}, NOW(), 'web'
        )
        ON CONFLICT (razorpay_order_id) DO UPDATE SET
          razorpay_payment_id = EXCLUDED.razorpay_payment_id,
          status = 'paid', paid_at = NOW()`;
    }
  }

  if (eventName === 'payment.failed') {
    const payment = payload.payment.entity;
    await sql`UPDATE orders SET status = 'failed' WHERE razorpay_order_id = ${payment.order_id} AND status = 'pending'`;
  }

  if (eventName === 'refund.created') {
    const refund = payload.refund.entity;
    await sql`UPDATE orders SET status = 'refunded' WHERE razorpay_payment_id = ${refund.payment_id}`;
  }

  return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
}
