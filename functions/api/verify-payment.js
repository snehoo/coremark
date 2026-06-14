// functions/api/verify-payment.js
// POST /api/verify-payment
//
// Called by delivery.html immediately after Razorpay payment success.
//
// Body: {
//   paymentId,       // razorpay_payment_id from handler response
//   razorpayOrderId, // razorpay_order_id
//   signature,       // razorpay_signature
//   orderType,
//   primarySlug,
//   itemSlugs,       // array
//   buyerEmail,
// }
//
// Returns: {
//   ok, email, orderTitle, orderId,
//   fileUrls, subject, stage
// }

import { getClient, sha256 } from '../_db.js';

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

// Verify HMAC-SHA256 signature
// Razorpay signs: razorpay_order_id + "|" + razorpay_payment_id
async function verifySignature(env, orderId, paymentId, signature) {
  const payload = `${orderId}|${paymentId}`;
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(env.RAZORPAY_KEY_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig     = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload));
  const computed = Array.from(new Uint8Array(sig))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  return computed === signature;
}

// Build a human-readable order title
function buildTitle(orderType, primarySlug, itemSlugs) {
  const subjectMap = { math:'Mathematics', sci:'Science', comp:'Computing' };
  const typeLabel  = { single:'Booster', fivepack:'5-Pack', subject:'Bundle', stage:'Stage Bundle' };

  if (orderType === 'single') {
    // 'math-n1-integers-s8' → 'Integers (M·N1 · Stage 8)'
    const parts = primarySlug.split('-');
    const stage = parts[parts.length - 1].replace('s', 'Stage ');
    return primarySlug; // will be overridden by DB name below
  }
  return typeLabel[orderType] || primarySlug;
}

// Get R2 file URLs for a list of booster slugs
async function getFileUrls(env, itemSlugs) {
  const urls = [];
  for (const slug of itemSlugs) {
    const prefix = `booster/cm-${slug}-`;
    try {
      const listed = await env.R2_BUCKET.list({ prefix });
      for (const obj of listed.objects) {
        urls.push(`https://assets.coremark.study/${obj.key}`);
      }
    } catch (err) {
      console.warn('[verify-payment] R2 list failed for', slug, err.message);
    }
  }

  // Fallback: derive URL from slug if R2 list returns nothing
  // (used during dev before PDFs are uploaded)
  if (urls.length === 0) {
    for (const slug of itemSlugs) {
      urls.push(`https://assets.coremark.study/booster/cm-${slug}.pdf`);
    }
  }

  return urls;
}

export async function onRequestPost({ request, env }) {
  let body;
  try {
    body = await request.json();
  } catch {
    return new Response('Bad JSON', { status: 400, headers: CORS });
  }

  const {
    paymentId,
    razorpayOrderId,
    signature,
    orderType,
    primarySlug,
    itemSlugs = [],
    buyerEmail,
  } = body;

  if (!paymentId || !razorpayOrderId) {
    return new Response(
      JSON.stringify({ error: 'Missing paymentId or razorpayOrderId' }),
      { status: 400, headers: { 'Content-Type': 'application/json', ...CORS } }
    );
  }

  // ── 1. Verify signature ──────────────────────────────────
  if (signature) {
    const valid = await verifySignature(env, razorpayOrderId, paymentId, signature);
    if (!valid) {
      console.warn('[verify-payment] Invalid signature for', paymentId);
      return new Response(
        JSON.stringify({ error: 'Invalid payment signature' }),
        { status: 403, headers: { 'Content-Type': 'application/json', ...CORS } }
      );
    }
  }

  // ── 2. Fetch payment from Razorpay to get buyer email ────
  let payment;
  try {
    const res = await fetch(`https://api.razorpay.com/v1/payments/${paymentId}`, {
      headers: { 'Authorization': razorpayAuth(env) },
    });
    if (!res.ok) throw new Error('Razorpay API error: ' + res.status);
    payment = await res.json();
  } catch (err) {
    return new Response(
      JSON.stringify({ error: 'Could not fetch payment details: ' + err.message }),
      { status: 502, headers: { 'Content-Type': 'application/json', ...CORS } }
    );
  }

  if (payment.status !== 'captured') {
    return new Response(
      JSON.stringify({ error: 'Payment not captured', status: payment.status }),
      { status: 402, headers: { 'Content-Type': 'application/json', ...CORS } }
    );
  }

  const confirmedEmail = payment.email
    || payment.notes?.buyer_email
    || buyerEmail
    || '';
  const confirmedName  = payment.notes?.buyer_name || '';
  const buyerHash      = confirmedEmail ? await sha256(confirmedEmail) : null;
  const country        = payment.international ? 'International' : 'IN';

  // Resolve itemSlugs from notes if not passed (webhook path)
  const resolvedItems = itemSlugs.length > 0
    ? itemSlugs
    : (payment.notes?.item_slugs || '').split(',').filter(Boolean);

  const resolvedType    = orderType || payment.notes?.order_type || 'single';
  const resolvedSlug    = primarySlug || payment.notes?.primary_slug || '';
  const resolvedSubject = payment.notes?.subject || null;
  const resolvedStage   = payment.notes?.stage ? parseInt(payment.notes.stage) : null;

  const client = await getClient(env);
  try {
    // ── 3. Check for existing paid order (idempotent re-visit) ──
    const { rows: existing } = await client.query(
      `SELECT id, item_slugs, primary_slug FROM orders
       WHERE razorpay_order_id = $1 AND status = 'paid'`,
      [razorpayOrderId]
    );

    const isNewOrder = existing.length === 0;

    // ── 4. Mark order as paid ────────────────────────────────
    await client.query(
      `UPDATE orders
       SET razorpay_payment_id = $1,
           buyer_email         = $2,
           buyer_hash          = $3,
           status              = 'paid',
           paid_at             = NOW(),
           item_slugs          = COALESCE(NULLIF(item_slugs::text, '[]')::jsonb, $4::jsonb),
           subject             = COALESCE(subject, $5),
           stage               = COALESCE(stage, $6)
       WHERE razorpay_order_id = $7`,
      [
        paymentId,
        confirmedEmail,
        buyerHash,
        JSON.stringify(resolvedItems),
        resolvedSubject,
        resolvedStage,
        razorpayOrderId,
      ]
    );

    // ── 5. Upsert buyer record ───────────────────────────────
    if (isNewOrder && buyerHash) {
      await client.query(
        `INSERT INTO buyers (buyer_hash, country, order_count, total_paise)
         VALUES ($1, $2, 1, $3)
         ON CONFLICT (buyer_hash) DO UPDATE
           SET order_count = buyers.order_count + 1,
               total_paise = buyers.total_paise + $3,
               country     = COALESCE(buyers.country, EXCLUDED.country),
               updated_at  = NOW()`,
        [buyerHash, country, payment.amount]
      );
    }

    // ── 6. Beehiiv subscribe (new orders only, fire-and-forget) ──
    if (isNewOrder && confirmedEmail && env.BEEHIIV_API_KEY && env.BEEHIIV_PUB_ID) {
      fetch(
        `https://api.beehiiv.com/v2/publications/${env.BEEHIIV_PUB_ID}/subscriptions`,
        {
          method:  'POST',
          headers: {
            'Content-Type':  'application/json',
            'Authorization': `Bearer ${env.BEEHIIV_API_KEY}`,
          },
          body: JSON.stringify({
            email:               confirmedEmail,
            reactivate_existing: false,
            send_welcome_email:  false,
            utm_source:          'coremark_purchase',
            utm_medium:          'organic',
            utm_campaign:        resolvedSlug,
            custom_fields: [
              { name: 'subject', value: resolvedSubject || '' },
              { name: 'stage',   value: resolvedStage ? String(resolvedStage) : '' },
              { name: 'source',  value: 'coremark' },
            ],
          }),
        }
      ).catch(err => console.warn('[beehiiv] subscribe failed:', err.message));
    }

    // ── 7. Get internal order ID ─────────────────────────────
    const { rows: orderRows } = await client.query(
      `SELECT id FROM orders WHERE razorpay_order_id = $1`,
      [razorpayOrderId]
    );
    const internalOrderId = orderRows[0]?.id || razorpayOrderId;

    // ── 8. Build order title from booster names ───────────────
    let orderTitle = resolvedSlug;
    if (resolvedItems.length === 1) {
      const { rows: bRows } = await client.query(
        `SELECT name, topic_code FROM boosters WHERE slug = $1`,
        [resolvedItems[0]]
      );
      if (bRows.length) orderTitle = bRows[0].name;
    } else if (resolvedType === 'fivepack') {
      const subj = resolvedSubject
        ? { math:'Mathematics', science:'Science', computing:'Computing' }[resolvedSubject]
        : 'Subject';
      orderTitle = subj + ' Stage ' + resolvedStage + ' — 5-Pack';
    } else if (resolvedType === 'subject') {
      const subj = resolvedSubject
        ? { math:'Mathematics', science:'Science', computing:'Computing' }[resolvedSubject]
        : 'Subject';
      orderTitle = 'Complete ' + subj + ' Stage ' + resolvedStage;
    } else if (resolvedType === 'stage') {
      orderTitle = 'Everything — Stage ' + resolvedStage + ' (All Subjects)';
    }

    // ── 9. Get R2 file URLs ───────────────────────────────────
    const fileUrls = await getFileUrls(env, resolvedItems);

    return new Response(
      JSON.stringify({
        ok:         true,
        email:      confirmedEmail,
        orderTitle,
        orderId:    internalOrderId,
        paymentId,
        orderType:  resolvedType,
        subject:    resolvedSubject,
        stage:      resolvedStage,
        fileUrls,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json', ...CORS } }
    );

  } catch (err) {
    console.error('[verify-payment]', err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...CORS } }
    );
  } finally {
    await client.end();
  }
}
