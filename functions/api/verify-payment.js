// functions/api/verify-payment.js
// NOTE: Never return 5xx — Cloudflare intercepts them with HTML error pages.
// Use 200 with ok:false, or 4xx only.
import { BOOSTER_MAP } from './_booster-map.js';

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
  // For subject/stage bundles, serve a single pre-built zip.
  if ((orderType === 'subject' || orderType === 'stage') && bundleSlug) {
    try {
      const l = await env.R2_BUCKET.list({ prefix: `bundle/cm-${bundleSlug}` });
      const zipObj = (l.objects || [])[0];
      if (zipObj) return [`https://assets.coremark.study/${zipObj.key}`];
    } catch (e) { /* fall through */ }
  }

  // Individual boosters — explicit map preserves hash-protected filenames.
  return itemSlugs.map(slug => {
    const key = BOOSTER_MAP[slug];
    return `https://assets.coremark.study/${key || `booster/cm-${slug}.pdf`}`;
  });
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

      // Build a specific, human-readable order title
      const subjectNames = { math: 'Mathematics', science: 'Science', computing: 'Computing' };
      const subjLabel    = rSubj ? (subjectNames[rSubj] || rSubj) : null;

      if (items.length === 1 && rType === 'single') {
        const bRows = await dbQuery(env, `SELECT name FROM boosters WHERE slug=$1`, [items[0]]);
        if (bRows.rows.length) title = bRows.rows[0].name;
      } else if (rType === 'fivepack') {
        title = subjLabel ? `${subjLabel} · Stage ${rStage} · 5-Pack Bundle` : '5-Pack Bundle';
      } else if (rType === 'subject') {
        title = subjLabel ? `${subjLabel} · Stage ${rStage} · Full Subject Bundle` : 'Subject Bundle';
      } else if (rType === 'stage') {
        title = `All Subjects · Stage ${rStage} Bundle`;
      }
    } catch (dbErr) {
      console.error('[verify-payment] DB error:', dbErr.message);
      // Continue — delivery still works without DB
    }

    // 5. Brevo — add buyer to CoreMark Buyers list (fire and forget)
    if (email && env.BREVO_API_KEY) {
      fetch('https://api.brevo.com/v3/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'api-key': env.BREVO_API_KEY },
        body: JSON.stringify({
          email,
          listIds: [4],
          updateEnabled: true,
          attributes: {
            SUBJECT: rSubj || '',
            STAGE:   rStage ? String(rStage) : '',
            SOURCE:  'purchase',
            SLUG:    rSlug || '',
          },
        }),
      }).catch(e => console.warn('[brevo]', e.message));
    }

    // 6. Get file URLs from R2
    const fileUrls = await getFileUrls(env, items, rType, rSlug);

    // 7. Server-side email dispatch (fire and forget so the response is never blocked)
    let emailSent = false;
    if (env.RESEND_API_KEY) {
      const origin      = new URL(request.url).origin;
      const typeLabels  = { single: 'Single Booster', fivepack: '5-Pack Bundle', subject: 'Subject Bundle', stage: 'Stage Bundle' };
      const typeLabel   = typeLabels[rType] || rType;
      const amountRs    = Math.round(payment.amount / 100);
      const subjDisplay = rSubj ? rSubj.charAt(0).toUpperCase() + rSubj.slice(1) : null;

      // Buyer confirmation email (awaited so emailSent reflects actual success)
      if (email) {
        try {
          const emailRes = await fetch(`${origin}/api/send-email`, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ to: email, orderTitle: title, orderType: rType, fileUrls, orderId: internalId }),
          });
          emailSent = emailRes.ok;
          if (!emailRes.ok) console.warn('[send-email] non-OK:', await emailRes.text());
        } catch (e) {
          console.warn('[send-email]', e.message);
        }
      }

      // Admin notification to info@coremark.study
      fetch('https://api.resend.com/emails', {
        method:  'POST',
        headers: { 'Authorization': `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from:    'CoreMark Sales <info@coremark.study>',
          to:      ['info@coremark.study'],
          subject: `💰 New Sale — ${typeLabel} — ₹${amountRs}`,
          html: `<div style="font-family:Arial,sans-serif;max-width:480px;margin:20px auto;padding:24px;border:1px solid #EAE3F5;border-radius:12px;">
<h2 style="color:#2A1B3D;margin:0 0 20px;font-size:18px;">New CoreMark Sale &#127881;</h2>
<table style="width:100%;border-collapse:collapse;font-size:14px;">
<tr><td style="padding:8px 0;color:#7A6A94;width:110px;vertical-align:top;">Product</td><td style="padding:8px 0;font-weight:600;">${title}</td></tr>
<tr><td style="padding:8px 0;color:#7A6A94;">Type</td><td style="padding:8px 0;">${typeLabel}</td></tr>
<tr><td style="padding:8px 0;color:#7A6A94;">Amount</td><td style="padding:8px 0;font-weight:700;color:#059669;">&#8377;${amountRs}</td></tr>
<tr><td style="padding:8px 0;color:#7A6A94;">Buyer</td><td style="padding:8px 0;">${email || '&#8212;'}</td></tr>
${subjDisplay ? `<tr><td style="padding:8px 0;color:#7A6A94;">Subject</td><td style="padding:8px 0;">${subjDisplay}${rStage ? ' &middot; Stage ' + rStage : ''}</td></tr>` : ''}
<tr><td style="padding:8px 0;color:#7A6A94;">Payment ID</td><td style="padding:8px 0;font-family:monospace;font-size:12px;">${paymentId}</td></tr>
<tr><td style="padding:8px 0;color:#7A6A94;">Order ID</td><td style="padding:8px 0;font-family:monospace;font-size:12px;">${internalId}</td></tr>
</table>
</div>`,
        }),
      }).catch(e => console.warn('[admin-notify]', e.message));
    }

    return json({
      ok: true, email, orderTitle: title, orderId: internalId,
      paymentId, orderType: rType, subject: rSubj, stage: rStage, fileUrls,
      emailSent,
    });

  } catch (e) {
    // Last resort — return 200 with error so Cloudflare doesn't intercept
    return json({ ok: false, error: 'Unexpected error: ' + e.message });
  }
}
