// functions/api/verify-payment.js
// NOTE: Never return 5xx — Cloudflare intercepts them with HTML error pages.
// Use 200 with ok:false, or 4xx only.

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS });
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS },
  });
}

function razorpayAuth(env) {
  return 'Basic ' + btoa(`${env.RAZORPAY_KEY_ID}:${env.RAZORPAY_KEY_SECRET}`);
}

async function sha256(text) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text.toLowerCase().trim()));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function verifySignature(env, orderId, paymentId, sig) {
  try {
    const key = await crypto.subtle.importKey(
      'raw', new TextEncoder().encode(env.RAZORPAY_KEY_SECRET),
      { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
    );
    const s = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`${orderId}|${paymentId}`));
    const c = Array.from(new Uint8Array(s)).map(b => b.toString(16).padStart(2, '0')).join('');
    return c === sig;
  } catch (e) {
    return false;
  }
}

async function dbQuery(env, sql, params = []) {
  const connStr = env.DATABASE_URL;
  if (!connStr) throw new Error('DATABASE_URL not set');
  const url = new URL(connStr.replace(/^postgres(ql)?:\/\//, 'https://'));
  const res = await fetch(`https://${url.hostname}/sql`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json', 'Neon-Connection-String': connStr },
    body:    JSON.stringify({ query: sql, params }),
  });
  if (!res.ok) throw new Error(`DB ${res.status}: ${await res.text()}`);
  const data   = await res.json();
  const fields = data.fields || [];
  const rows   = (data.rows || []).map(row => {
    if (!Array.isArray(row)) return row;
    const obj = {};
    fields.forEach((f, i) => { obj[f.name] = row[i]; });
    return obj;
  });
  return { rows, rowCount: data.rowCount ?? rows.length };
}

async function getFileUrls(env, itemSlugs, orderType, bundleSlug) {
  // For subject/stage bundles, serve a single pre-built zip instead of
  // looping through every individual booster PDF.
  if ((orderType === 'subject' || orderType === 'stage') && bundleSlug) {
    try {
      const l = await env.R2_BUCKET.list({ prefix: `bundle/cm-${bundleSlug}` });
      const zipObj = (l.objects || [])[0];
      if (zipObj) return [`https://assets.coremark.study/${zipObj.key}`];
    } catch (e) { /* fall through to per-file links below */ }
  }

  const urls = [];
  for (const slug of itemSlugs) {
    try {
      const l = await env.R2_BUCKET.list({ prefix: `booster/cm-${slug}` });
      for (const o of (l.objects || [])) urls.push(`https://assets.coremark.study/${o.key}`);
    } catch (e) { /* R2 not set up yet — use fallback */ }
  }
  if (!urls.length) {
    for (const slug of itemSlugs) {
      urls.push(`https://assets.coremark.study/booster/cm-${slug}.pdf`);
    }
  }
  return urls;
}

export async function onRequestPost({ request, env }) {
  // Wrap EVERYTHING — never let an unhandled exception reach Cloudflare
  try {
    let body;
    try { body = await request.json(); }
    catch { return json({ ok: false, error: 'Bad JSON' }, 400); }

    const { paymentId, razorpayOrderId, signature, orderType, primarySlug, itemSlugs = [], buyerEmail } = body;

    if (!paymentId || !razorpayOrderId) {
      return json({ ok: false, error: 'Missing paymentId or razorpayOrderId' }, 400);
    }

    // 1. Verify signature (non-fatal if missing)
    if (signature) {
      const valid = await verifySignature(env, razorpayOrderId, paymentId, signature);
      if (!valid) return json({ ok: false, error: 'Invalid signature' }, 403);
    }

    // 2. Fetch payment from Razorpay
    let payment;
    try {
      const r = await fetch(`https://api.razorpay.com/v1/payments/${paymentId}`, {
        headers: { 'Authorization': razorpayAuth(env) },
      });
      if (!r.ok) {
        const err = await r.text();
        return json({ ok: false, error: `Razorpay ${r.status}: ${err}` }, 422);
      }
      payment = await r.json();
    } catch (e) {
      return json({ ok: false, error: 'Razorpay fetch failed: ' + e.message }, 422);
    }

    if (payment.status !== 'captured') {
      return json({ ok: false, error: 'Payment not captured', status: payment.status }, 402);
    }

    // 3. Resolve order details
    const email    = payment.email || payment.notes?.buyer_email || buyerEmail || '';
    const hash     = email ? await sha256(email) : null;
    const country  = payment.international ? 'International' : 'IN';
    const items    = itemSlugs.length > 0 ? itemSlugs : (payment.notes?.item_slugs || '').split(',').filter(Boolean);
    const rType    = orderType || payment.notes?.order_type || 'single';
    const rSlug    = primarySlug || payment.notes?.primary_slug || '';
    const rSubj    = payment.notes?.subject || null;
    const rStage   = payment.notes?.stage ? parseInt(payment.notes.stage) : null;

    // 4. DB operations — all in one try/catch, non-fatal
    let internalId = razorpayOrderId;
    let title      = rSlug;
    try {
      // Upsert order — works even if create-order DB insert failed
      await dbQuery(env,
        `INSERT INTO orders
           (razorpay_order_id, razorpay_payment_id, buyer_email, buyer_hash,
            order_type, primary_slug, item_slugs, amount_paise, currency,
            status, subject, stage, paid_at, source)
         VALUES ($1,$2,$3,$4,$5,$6,$7::jsonb,$8,'INR','paid',$9,$10,NOW(),'web')
         ON CONFLICT (razorpay_order_id) DO UPDATE SET
           razorpay_payment_id = EXCLUDED.razorpay_payment_id,
           buyer_email         = EXCLUDED.buyer_email,
           buyer_hash          = EXCLUDED.buyer_hash,
           status              = 'paid',
           paid_at             = COALESCE(orders.paid_at, NOW()),
           item_slugs          = CASE WHEN orders.item_slugs::text = '[]' THEN EXCLUDED.item_slugs ELSE orders.item_slugs END,
           subject             = COALESCE(orders.subject, EXCLUDED.subject),
           stage               = COALESCE(orders.stage, EXCLUDED.stage)`,
        [razorpayOrderId, paymentId, email, hash,
         rType, rSlug, JSON.stringify(items), payment.amount,
         rSubj, rStage]
      );

      // Upsert buyer
      if (hash) {
        await dbQuery(env,
          `INSERT INTO buyers(buyer_hash,country,order_count,total_paise) VALUES($1,$2,1,$3)
           ON CONFLICT(buyer_hash) DO UPDATE SET
           order_count=buyers.order_count+1, total_paise=buyers.total_paise+$3, updated_at=NOW()`,
          [hash, country, payment.amount]
        );
      }

      // Get internal order ID
      const orderRows = await dbQuery(env,
        `SELECT id FROM orders WHERE razorpay_order_id=$1`, [razorpayOrderId]
      );
      if (orderRows.rows.length) internalId = orderRows.rows[0].id;

      // Get booster name for title
      if (items.length === 1) {
        const bRows = await dbQuery(env, `SELECT name FROM boosters WHERE slug=$1`, [items[0]]);
        if (bRows.rows.length) title = bRows.rows[0].name;
      } else {
        const labels = { fivepack:'5-Pack Bundle', subject:'Subject Bundle', stage:'Stage Bundle' };
        title = labels[rType] || rSlug;
      }
    } catch (dbErr) {
      console.error('[verify-payment] DB error:', dbErr.message);
      // Continue — delivery still works without DB
    }

    // 5. Beehiiv (fire and forget)
    if (email && env.BEEHIIV_API_KEY && env.BEEHIIV_PUB_ID) {
      fetch(`https://api.beehiiv.com/v2/publications/${env.BEEHIIV_PUB_ID}/subscriptions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${env.BEEHIIV_API_KEY}` },
        body: JSON.stringify({
          email, reactivate_existing: false, send_welcome_email: false,
          utm_source: 'coremark_purchase', utm_campaign: rSlug,
          custom_fields: [
            { name: 'subject', value: rSubj || '' },
            { name: 'stage',   value: rStage ? String(rStage) : '' },
            { name: 'source',  value: 'coremark' },
          ],
        }),
      }).catch(e => console.warn('[beehiiv]', e.message));
    }

    // 6. Get file URLs from R2
    const fileUrls = await getFileUrls(env, items, rType, rSlug);

    return json({
      ok: true, email, orderTitle: title, orderId: internalId,
      paymentId, orderType: rType, subject: rSubj, stage: rStage, fileUrls,
    });

  } catch (e) {
    // Last resort — return 200 with error so Cloudflare doesn't intercept
    return json({ ok: false, error: 'Unexpected error: ' + e.message });
  }
}
