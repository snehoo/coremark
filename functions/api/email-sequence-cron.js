// functions/api/email-sequence-cron.js
//
// HTTP-triggered email drip orchestrator.
// Called by cron-job.org:  GET https://coremark.study/api/email-sequence-cron
//
// WHY THIS WAS BROKEN:
// The previous version only exported `scheduled()`. That is a Cloudflare
// *Workers* Cron Trigger handler — Cloudflare *Pages* Functions never invoke
// it. Pages routes are HTTP-only and need an onRequest* export. So cron-job.org's
// request never ran the job; it fell through to a static page, and that large
// HTML body is what tripped cron-job.org's "Response data too big" error.
//
// THE FIX:
//   1. Export onRequest (HTTP) so the request actually runs the job.
//   2. Return a tiny JSON body  -> fixes "Response data too big".
//   3. Run the batch in the background (waitUntil) and ACK immediately
//      -> a large backlog can never make the request time out (which would
//         otherwise just re-trigger the 25-failure auto-disable).

// ── Inline DB helper (Pages Functions can't import across files) ─────────────
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

const BASE = 'https://coremark.study';
const SEND_DELAY_MS = 120; // ~8/sec, stays under Resend's default rate limit

async function resolveTitle(env, primarySlug, items) {
  if (items.length === 1) {
    const b = await dbQuery(env, `SELECT name FROM boosters WHERE slug=$1`, [items[0]]);
    if (b.rows.length) return b.rows[0].name;
  }
  return primarySlug;
}

// Processes one drip stage. Returns counts only (never row data).
async function processBatch(env, { selectSql, sendPath, nextStep, label }) {
  const res = await dbQuery(env, selectSql, []);
  let sent = 0, failed = 0;

  for (const o of res.rows) {
    try {
      const items = Array.isArray(o.item_slugs) ? o.item_slugs : JSON.parse(o.item_slugs || '[]');
      const title = await resolveTitle(env, o.primary_slug, items);

      const r = await fetch(`${BASE}${sendPath}`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          to:        o.buyer_email,
          buyerName: o.buyer_name || null,
          orderTitle: title,
          orderType: o.order_type,
          subject:   o.subject,
          stage:     o.stage,
          orderId:   o.id,
          itemSlugs: items,
        }),
      });

      if (r.ok) {
        await dbQuery(env, `UPDATE orders SET sequence_step=$1 WHERE id=$2::uuid`, [nextStep, o.id]);
        sent++;
      } else {
        failed++;
        console.error(`[cron ${label}] send failed`, o.id, r.status);
      }
    } catch (e) {
      failed++;
      console.error(`[cron ${label}]`, o.id, e.message);
    }
    await new Promise(r => setTimeout(r, SEND_DELAY_MS));
  }

  return { sent, failed };
}

async function sendAbandonedCheckoutEmail(env, order) {
  const typeMap = { single:'Single Booster', fivepack:'5-Pack Bundle', subject:'Subject Bundle', stage:'Stage Bundle' };
  const typeLabel = typeMap[order.order_type] || order.order_type || 'order';
  const firstName = order.buyer_name ? order.buyer_name.split(' ')[0] : null;
  const greeting = firstName ? `Hi ${firstName}` : 'Hi';

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: 'CoreMark <info@coremark.study>',
      to:   [order.buyer_email],
      subject: 'Did something go wrong at checkout?',
      html: `<div style="font-family:Arial,sans-serif;max-width:480px;margin:20px auto;font-size:15px;color:#2A1B3D;line-height:1.7;">
<p>${greeting},</p>
<p>You started a checkout for a <strong>${typeLabel}</strong> on CoreMark but the payment didn't go through.</p>
<p>If a UPI app timed out or something went wrong, you can try again here:<br>
<a href="https://coremark.study" style="color:#6E47C9;font-weight:600;">coremark.study</a></p>
<p>If you have any questions before purchasing, just reply to this email.</p>
<p>Snehal<br>CoreMark</p>
</div>`,
    }),
  });
  return res.ok;
}

async function run(env) {
  // Abandoned checkout: pending orders > 1h old, recovery email not yet sent
  const abandoned = await dbQuery(env,
    `SELECT id,buyer_email,buyer_name,order_type,primary_slug,razorpay_order_id
     FROM orders
     WHERE status='pending'
       AND created_at < NOW() - INTERVAL '1 hour'
       AND created_at > NOW() - INTERVAL '24 hours'
       AND buyer_email IS NOT NULL
       AND abandoned_email_sent IS NOT TRUE
     LIMIT 20`
  );
  let abandonedSent = 0;
  for (const o of abandoned.rows) {
    try {
      const ok = await sendAbandonedCheckoutEmail(env, o);
      if (ok) {
        await dbQuery(env, `UPDATE orders SET abandoned_email_sent=TRUE WHERE id=$1::uuid`, [o.id]);
        abandonedSent++;
        console.log('[cron abandoned] sent to', o.buyer_email);
      }
    } catch (e) {
      console.error('[cron abandoned]', o.id, e.message);
    }
    await new Promise(r => setTimeout(r, SEND_DELAY_MS));
  }

  // Delivery retry: paid orders where delivery email never sent (> 15 min old)
  const missed = await dbQuery(env,
    `SELECT id,buyer_email,buyer_name,order_type,primary_slug,item_slugs,subject,stage
     FROM orders
     WHERE status='paid' AND delivery_email_sent=FALSE
       AND paid_at < NOW() - INTERVAL '15 minutes'
       AND buyer_email IS NOT NULL
     LIMIT 20`
  );
  for (const o of missed.rows) {
    try {
      const items = Array.isArray(o.item_slugs) ? o.item_slugs : JSON.parse(o.item_slugs || '[]');
      const title = await resolveTitle(env, o.primary_slug, items);
      const r = await fetch(`${BASE}/api/send-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: o.buyer_email, buyerName: o.buyer_name || null,
          orderTitle: title, orderType: o.order_type,
          subject: o.subject, stage: o.stage,
          orderId: o.id, itemSlugs: items,
        }),
      });
      if (r.ok) {
        await dbQuery(env, `UPDATE orders SET delivery_email_sent=TRUE WHERE id=$1::uuid`, [o.id]);
        console.log('[cron delivery-retry] sent to', o.buyer_email);
      } else {
        console.error('[cron delivery-retry] failed', o.id, r.status);
      }
    } catch (e) {
      console.error('[cron delivery-retry]', o.id, e.message);
    }
    await new Promise(r => setTimeout(r, SEND_DELAY_MS));
  }

  // Day 2: 48h after purchase, sequence_step 0 -> 1
  const day2 = await processBatch(env, {
    label:    'day2',
    sendPath: '/api/send-email-day2',
    nextStep: 1,
    selectSql: `SELECT id,buyer_email,buyer_name,order_type,primary_slug,item_slugs,subject,stage
                FROM orders
                WHERE status='paid' AND sequence_step=0
                  AND paid_at < NOW() - INTERVAL '48 hours'
                  AND buyer_email IS NOT NULL
                LIMIT 50`,
  });

  // Day 7: 7 days after purchase, sequence_step 1 -> 2
  const day7 = await processBatch(env, {
    label:    'day7',
    sendPath: '/api/send-email-day7',
    nextStep: 2,
    selectSql: `SELECT id,buyer_email,buyer_name,order_type,primary_slug,item_slugs,subject,stage
                FROM orders
                WHERE status='paid' AND sequence_step=1
                  AND paid_at < NOW() - INTERVAL '7 days'
                  AND buyer_email IS NOT NULL
                LIMIT 50`,
  });

  // Counts land in the Cloudflare Functions log so you can confirm runs.
  console.log('[cron] done', JSON.stringify({ abandonedSent, day2, day7 }));
  return { abandonedSent, day2, day7 };
}

// ── HTTP handler — what cron-job.org actually calls ──────────────────────────
export async function onRequest(context) {
  const { request, env, waitUntil } = context;

  // Optional shared-secret guard. Once you set CRON_SECRET in Pages env vars,
  // cron-job.org must send:  Authorization: Bearer <CRON_SECRET>
  // (Leave CRON_SECRET unset and it runs open — set it to lock the endpoint.)
  if (env.CRON_SECRET) {
    const auth = request.headers.get('Authorization') || '';
    if (auth !== `Bearer ${env.CRON_SECRET}`) {
      return new Response('Unauthorized', { status: 401 });
    }
  }

  // Fire the drip in the background, ACK immediately with a tiny body.
  waitUntil(run(env).catch(e => console.error('[cron] fatal', e.message)));
  return Response.json({ ok: true, started: true });
}
