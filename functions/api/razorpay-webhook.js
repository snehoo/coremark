// functions/api/razorpay-webhook.js
// POST /api/razorpay-webhook
//
// Register this URL in Razorpay Dashboard:
//   Settings → Webhooks → Add new webhook
//   URL: https://coremark.study/api/razorpay-webhook
//   Events: payment.captured · payment.failed · refund.created
//   Set a Webhook Secret → save as RAZORPAY_WEBHOOK_SECRET env var
//
// This is a safety net alongside verify-payment.
// It fires asynchronously — verify-payment handles the real-time path.

import { getClient, sha256 } from '../_db.js';

async function verifyRazorpaySignature(rawBody, signature, secret) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['verify']
  );
  const sigBytes = hexToBytes(signature);
  return crypto.subtle.verify('HMAC', key, sigBytes, new TextEncoder().encode(rawBody));
}

function hexToBytes(hex) {
  const arr = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    arr[i / 2] = parseInt(hex.slice(i, i + 2), 16);
  }
  return arr;
}

// Health-check — Razorpay pings GET before activating webhook
export async function onRequestGet() {
  return new Response('OK', { status: 200 });
}

export async function onRequestPost({ request, env }) {
  const rawBody  = await request.text();
  const signature = request.headers.get('x-razorpay-signature') ?? '';

  // ── 1. Verify signature ──────────────────────────────────
  if (env.RAZORPAY_WEBHOOK_SECRET) {
    const valid = await verifyRazorpaySignature(rawBody, signature, env.RAZORPAY_WEBHOOK_SECRET);
    if (!valid) {
      console.warn('[webhook] Invalid signature');
      return new Response('Unauthorized', { status: 401 });
    }
  }

  let event;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return new Response('Bad JSON', { status: 400 });
  }

  const client = await getClient(env);
  try {
    const { event: eventName, payload } = event;

    // ── payment.captured ────────────────────────────────────
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

      // Upsert buyer
      if (buyerHash) {
        await client.query(
          `INSERT INTO buyers (buyer_hash, country, order_count, total_paise)
           VALUES ($1, $2, 1, $3)
           ON CONFLICT (buyer_hash) DO UPDATE
             SET order_count = buyers.order_count + 1,
                 total_paise = buyers.total_paise + $3,
                 updated_at  = NOW()`,
          [buyerHash, country, payment.amount]
        );
      }

      // Update order to paid — the pending row was created by create-order
      const result = await client.query(
        `UPDATE orders
         SET razorpay_payment_id = $1,
             buyer_hash          = $2,
             buyer_email         = $3,
             status              = 'paid',
             paid_at             = NOW()
         WHERE razorpay_order_id = $4
           AND status != 'paid'`,
        [payment.id, buyerHash, buyerEmail, payment.order_id]
      );

      // If no row updated (race condition or missing pending), insert fresh
      if (result.rowCount === 0) {
        await client.query(
          `INSERT INTO orders
             (razorpay_order_id, razorpay_payment_id, buyer_hash, buyer_email,
              order_type, primary_slug, item_slugs, amount_paise, currency,
              status, subject, stage, paid_at, source)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'INR','paid',$9,$10,NOW(),'web')
           ON CONFLICT (razorpay_order_id) DO UPDATE
             SET razorpay_payment_id = EXCLUDED.razorpay_payment_id,
                 status              = 'paid',
                 paid_at             = NOW()`,
          [
            payment.order_id,
            payment.id,
            buyerHash,
            buyerEmail,
            orderType,
            primarySlug,
            JSON.stringify(itemSlugs),
            payment.amount,
            subject,
            stage,
          ]
        );
      }
    }

    // ── payment.failed ───────────────────────────────────────
    if (eventName === 'payment.failed') {
      const payment = payload.payment.entity;
      await client.query(
        `UPDATE orders SET status = 'failed'
         WHERE razorpay_order_id = $1 AND status = 'pending'`,
        [payment.order_id]
      );
    }

    // ── refund.created ───────────────────────────────────────
    if (eventName === 'refund.created') {
      const refund = payload.refund.entity;
      await client.query(
        `UPDATE orders SET status = 'refunded'
         WHERE razorpay_payment_id = $1`,
        [refund.payment_id]
      );
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error('[webhook]', err);
    return new Response('Internal error', { status: 500 });
  } finally {
    await client.end();
  }
}
