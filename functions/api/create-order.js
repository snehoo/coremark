// functions/api/create-order.js
// POST /api/create-order
//
// Called by checkout.html before opening the Razorpay modal.
//
// Body: {
//   orderType,    // 'single' | 'fivepack' | 'subject' | 'stage'
//   primarySlug,  // e.g. 'math-n1-integers-s8' or 'all-math-s8'
//   itemSlugs,    // array of booster slugs
//   amountPaise,  // price in paise (verified server-side)
//   buyerEmail,
//   buyerName,    // optional
// }
//
// Returns: { razorpayOrderId, keyId }

import { getClient } from '../_db.js';

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS });
}

function razorpayAuth(env) {
  return 'Basic ' + btoa(`${env.RAZORPAY_KEY_ID}:${env.RAZORPAY_KEY_SECRET}`);
}

// Server-side price calculation — never trust the client amount
function calculatePrice(orderType, itemSlugs) {
  const count = itemSlugs.length;

  if (orderType === 'single')   return 24900;
  if (orderType === 'fivepack') return 79900;  // flat 5-pack price
  if (orderType === 'subject')  return 129900;
  if (orderType === 'stage')    return 249900;

  // Fallback: count × single price (handles edge cases)
  return count * 24900;
}

// Derive subject from item slugs
function deriveSubject(orderType, primarySlug, itemSlugs) {
  if (orderType === 'stage') return 'mixed';
  const slug = itemSlugs[0] || primarySlug || '';
  if (slug.startsWith('math-'))    return 'math';
  if (slug.startsWith('sci-'))     return 'science';
  if (slug.startsWith('comp-'))    return 'computing';
  return null;
}

// Derive stage from item slugs
function deriveStage(itemSlugs, primarySlug) {
  const slug = itemSlugs[0] || primarySlug || '';
  const match = slug.match(/-s(\d)$/);
  return match ? parseInt(match[1]) : null;
}

export async function onRequestPost({ request, env }) {
  let body;
  try {
    body = await request.json();
  } catch {
    return new Response('Bad JSON', { status: 400, headers: CORS });
  }

  const { orderType, primarySlug, itemSlugs, buyerEmail, buyerName } = body;

  // ── Validate ────────────────────────────────────────────
  if (!orderType || !primarySlug || !Array.isArray(itemSlugs) || itemSlugs.length === 0) {
    return new Response(
      JSON.stringify({ error: 'Missing required fields: orderType, primarySlug, itemSlugs' }),
      { status: 400, headers: { 'Content-Type': 'application/json', ...CORS } }
    );
  }

  if (!buyerEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(buyerEmail.trim())) {
    return new Response(
      JSON.stringify({ error: 'Valid buyer email is required' }),
      { status: 400, headers: { 'Content-Type': 'application/json', ...CORS } }
    );
  }

  // ── Server-side price (ignore client amount) ─────────────
  const amountPaise = calculatePrice(orderType, itemSlugs);
  const subject     = deriveSubject(orderType, primarySlug, itemSlugs);
  const stage       = deriveStage(itemSlugs, primarySlug);

  // ── Create Razorpay order ────────────────────────────────
  let rzpOrder;
  try {
    const rzpRes = await fetch('https://api.razorpay.com/v1/orders', {
      method:  'POST',
      headers: {
        'Authorization': razorpayAuth(env),
        'Content-Type':  'application/json',
      },
      body: JSON.stringify({
        amount:   amountPaise,
        currency: 'INR',
        notes: {
          source:       'coremark',
          order_type:   orderType,
          primary_slug: primarySlug,
          item_slugs:   itemSlugs.join(','),
          buyer_email:  buyerEmail.trim(),
          buyer_name:   buyerName || '',
          subject:      subject || '',
          stage:        stage ? String(stage) : '',
        },
      }),
    });

    if (!rzpRes.ok) {
      const err = await rzpRes.text();
      console.error('[create-order] Razorpay error:', err);
      throw new Error('Razorpay order creation failed: ' + rzpRes.status);
    }

    rzpOrder = await rzpRes.json();
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 502, headers: { 'Content-Type': 'application/json', ...CORS } }
    );
  }

  // ── Save pending order to DB ─────────────────────────────
  const client = await getClient(env);
  try {
    await client.query(
      `INSERT INTO orders
         (razorpay_order_id, buyer_email, order_type, primary_slug,
          item_slugs, amount_paise, currency, status, subject, stage, source)
       VALUES ($1, $2, $3, $4, $5, $6, 'INR', 'pending', $7, $8, 'web')
       ON CONFLICT (razorpay_order_id) DO NOTHING`,
      [
        rzpOrder.id,
        buyerEmail.trim(),
        orderType,
        primarySlug,
        JSON.stringify(itemSlugs),
        amountPaise,
        subject,
        stage,
      ]
    );
  } catch (err) {
    // DB failure shouldn't block checkout — log and continue
    console.error('[create-order] DB insert failed:', err.message);
  } finally {
    await client.end();
  }

  return new Response(
    JSON.stringify({
      ok:             true,
      razorpayOrderId: rzpOrder.id,
      keyId:          env.RAZORPAY_KEY_ID,
      amountPaise,
    }),
    { status: 200, headers: { 'Content-Type': 'application/json', ...CORS } }
  );
}
