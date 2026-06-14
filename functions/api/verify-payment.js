// functions/api/verify-payment.js
import { getSQL, sha256 } from '../_db.js';

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS }); }

function razorpayAuth(env) {
  return 'Basic ' + btoa(`${env.RAZORPAY_KEY_ID}:${env.RAZORPAY_KEY_SECRET}`);
}

async function verifySignature(env, orderId, paymentId, signature) {
  const key = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(env.RAZORPAY_KEY_SECRET),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`${orderId}|${paymentId}`));
  const computed = Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2,'0')).join('');
  return computed === signature;
}

async function getFileUrls(env, itemSlugs) {
  const urls = [];
  for (const slug of itemSlugs) {
    try {
      const listed = await env.R2_BUCKET.list({ prefix: `booster/cm-${slug}-` });
      for (const obj of (listed.objects || [])) {
        urls.push(`https://assets.coremark.study/${obj.key}`);
      }
    } catch (err) {
      console.warn('[verify] R2 list failed for', slug, err.message);
    }
  }
  if (urls.length === 0) {
    for (const slug of itemSlugs) {
      urls.push(`https://assets.coremark.study/booster/cm-${slug}.pdf`);
    }
  }
  return urls;
}

export async function onRequestPost({ request, env }) {
  let body;
  try { body = await request.json(); }
  catch { return new Response('Bad JSON', { status: 400, headers: CORS }); }

  const { paymentId, razorpayOrderId, signature, orderType, primarySlug, itemSlugs = [], buyerEmail } = body;

  if (!paymentId || !razorpayOrderId) {
    return new Response(JSON.stringify({ error: 'Missing paymentId or razorpayOrderId' }),
      { status: 400, headers: { 'Content-Type': 'application/json', ...CORS } });
  }

  if (signature) {
    const valid = await verifySignature(env, razorpayOrderId, paymentId, signature);
    if (!valid) return new Response(JSON.stringify({ error: 'Invalid signature' }),
      { status: 403, headers: { 'Content-Type': 'application/json', ...CORS } });
  }

  let payment;
  try {
    const res = await fetch(`https://api.razorpay.com/v1/payments/${paymentId}`,
      { headers: { 'Authorization': razorpayAuth(env) } });
    if (!res.ok) throw new Error('Razorpay API error: ' + res.status);
    payment = await res.json();
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }),
      { status: 502, headers: { 'Content-Type': 'application/json', ...CORS } });
  }

  if (payment.status !== 'captured') {
    return new Response(JSON.stringify({ error: 'Payment not captured', status: payment.status }),
      { status: 402, headers: { 'Content-Type': 'application/json', ...CORS } });
  }

  const confirmedEmail  = payment.email || payment.notes?.buyer_email || buyerEmail || '';
  const buyerHash       = confirmedEmail ? await sha256(confirmedEmail) : null;
  const country         = payment.international ? 'International' : 'IN';
  const resolvedItems   = itemSlugs.length > 0 ? itemSlugs : (payment.notes?.item_slugs || '').split(',').filter(Boolean);
  const resolvedType    = orderType || payment.notes?.order_type || 'single';
  const resolvedSlug    = primarySlug || payment.notes?.primary_slug || '';
  const resolvedSubject = payment.notes?.subject || null;
  const resolvedStage   = payment.notes?.stage ? parseInt(payment.notes.stage) : null;

  const sql = getSQL(env);

  // Check if already paid (idempotent)
  const existing = await sql`
    SELECT id FROM orders WHERE razorpay_order_id = ${razorpayOrderId} AND status = 'paid'`;
  const isNew = existing.length === 0;

  // Mark paid
  await sql`
    UPDATE orders SET
      razorpay_payment_id = ${paymentId},
      buyer_email         = ${confirmedEmail},
      buyer_hash          = ${buyerHash},
      status              = 'paid',
      paid_at             = NOW(),
      item_slugs          = COALESCE(NULLIF(item_slugs::text,'[]')::jsonb, ${JSON.stringify(resolvedItems)}::jsonb),
      subject             = COALESCE(subject, ${resolvedSubject}),
      stage               = COALESCE(stage, ${resolvedStage})
    WHERE razorpay_order_id = ${razorpayOrderId}`;

  // Upsert buyer
  if (isNew && buyerHash) {
    await sql`
      INSERT INTO buyers (buyer_hash, country, order_count, total_paise)
      VALUES (${buyerHash}, ${country}, 1, ${payment.amount})
      ON CONFLICT (buyer_hash) DO UPDATE SET
        order_count = buyers.order_count + 1,
        total_paise = buyers.total_paise + ${payment.amount},
        updated_at  = NOW()`;
  }

  // Beehiiv subscribe
  if (isNew && confirmedEmail && env.BEEHIIV_API_KEY && env.BEEHIIV_PUB_ID) {
    fetch(`https://api.beehiiv.com/v2/publications/${env.BEEHIIV_PUB_ID}/subscriptions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${env.BEEHIIV_API_KEY}` },
      body: JSON.stringify({
        email: confirmedEmail, reactivate_existing: false, send_welcome_email: false,
        utm_source: 'coremark_purchase', utm_campaign: resolvedSlug,
        custom_fields: [
          { name: 'subject', value: resolvedSubject || '' },
          { name: 'stage',   value: resolvedStage ? String(resolvedStage) : '' },
          { name: 'source',  value: 'coremark' },
        ],
      }),
    }).catch(e => console.warn('[beehiiv]', e.message));
  }

  // Get internal order ID
  const orderRows = await sql`SELECT id FROM orders WHERE razorpay_order_id = ${razorpayOrderId}`;
  const internalId = orderRows[0]?.id || razorpayOrderId;

  // Build title
  let orderTitle = resolvedSlug;
  if (resolvedItems.length === 1) {
    const bRows = await sql`SELECT name FROM boosters WHERE slug = ${resolvedItems[0]}`;
    if (bRows.length) orderTitle = bRows[0].name;
  } else {
    const labels = { fivepack:'5-Pack Bundle', subject:'Subject Bundle', stage:'Stage Bundle' };
    orderTitle = labels[resolvedType] || orderTitle;
  }

  const fileUrls = await getFileUrls(env, resolvedItems);

  return new Response(JSON.stringify({
    ok: true, email: confirmedEmail, orderTitle, orderId: internalId,
    paymentId, orderType: resolvedType, subject: resolvedSubject,
    stage: resolvedStage, fileUrls,
  }), { status: 200, headers: { 'Content-Type': 'application/json', ...CORS } });
}
