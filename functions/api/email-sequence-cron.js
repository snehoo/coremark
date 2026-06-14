// functions/api/email-sequence-cron.js
// Cloudflare Pages Cron Trigger — runs every 2 hours
//
// Set up in wrangler.jsonc:
//   "triggers": { "crons": ["0 */2 * * *"] }
//
// Also add to wrangler.jsonc under pages_build_output_dir section:
//   "triggers": { "crons": ["0 */2 * * *"] }
//
// What it does:
//   • Finds paid orders where sequence_step = 0 AND paid_at > 48h ago
//     → sends Day 2 email, sets sequence_step = 1
//   • Finds paid orders where sequence_step = 1 AND paid_at > 7d ago
//     → sends Day 7 email, sets sequence_step = 2

import { getClient } from '../_db.js';

const BASE_URL = 'https://coremark.study';

export async function scheduled(event, env, ctx) {
  ctx.waitUntil(runSequence(env));
}

async function runSequence(env) {
  const client = await getClient(env);
  try {
    // ── DAY 2 — 48 hours after purchase ─────────────────────
    const { rows: day2Orders } = await client.query(
      `SELECT
         id, razorpay_payment_id, buyer_email, order_type,
         primary_slug, item_slugs, amount_paise, subject, stage
       FROM orders
       WHERE status        = 'paid'
         AND sequence_step = 0
         AND paid_at       < NOW() - INTERVAL '48 hours'
         AND buyer_email   IS NOT NULL
       LIMIT 50`
    );

    console.log(`[cron] Day 2 queue: ${day2Orders.length} orders`);

    for (const order of day2Orders) {
      try {
        // Get booster name for email subject line
        const itemSlugs = Array.isArray(order.item_slugs)
          ? order.item_slugs
          : JSON.parse(order.item_slugs || '[]');

        let orderTitle = order.primary_slug;
        if (itemSlugs.length === 1) {
          const { rows: bRows } = await client.query(
            `SELECT name FROM boosters WHERE slug = $1`,
            [itemSlugs[0]]
          );
          if (bRows.length) orderTitle = bRows[0].name;
        } else {
          const typeLabel = {
            fivepack: '5-Pack Bundle',
            subject:  'Subject Bundle',
            stage:    'Stage Bundle',
          };
          orderTitle = typeLabel[order.order_type] || orderTitle;
        }

        const res = await fetch(`${BASE_URL}/api/send-email-day2`, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({
            to:         order.buyer_email,
            buyerName:  '',
            orderTitle,
            orderType:  order.order_type,
            subject:    order.subject,
            stage:      order.stage,
            orderId:    order.id,
            itemSlugs,
          }),
        });

        if (res.ok) {
          await client.query(
            `UPDATE orders SET sequence_step = 1 WHERE id = $1`,
            [order.id]
          );
          console.log(`[cron] Day 2 sent: ${order.id} → ${order.buyer_email}`);
        } else {
          console.warn(`[cron] Day 2 failed for ${order.id}:`, await res.text());
        }

        // Small delay to avoid rate-limiting Resend
        await sleep(300);

      } catch (err) {
        console.error(`[cron] Day 2 error for ${order.id}:`, err.message);
      }
    }

    // ── DAY 7 — 7 days after purchase ───────────────────────
    const { rows: day7Orders } = await client.query(
      `SELECT
         id, razorpay_payment_id, buyer_email, order_type,
         primary_slug, item_slugs, subject, stage
       FROM orders
       WHERE status        = 'paid'
         AND sequence_step = 1
         AND paid_at       < NOW() - INTERVAL '7 days'
         AND buyer_email   IS NOT NULL
       LIMIT 50`
    );

    console.log(`[cron] Day 7 queue: ${day7Orders.length} orders`);

    for (const order of day7Orders) {
      try {
        const itemSlugs = Array.isArray(order.item_slugs)
          ? order.item_slugs
          : JSON.parse(order.item_slugs || '[]');

        let orderTitle = order.primary_slug;
        if (itemSlugs.length === 1) {
          const { rows: bRows } = await client.query(
            `SELECT name FROM boosters WHERE slug = $1`,
            [itemSlugs[0]]
          );
          if (bRows.length) orderTitle = bRows[0].name;
        } else {
          const typeLabel = { fivepack:'5-Pack', subject:'Subject Bundle', stage:'Stage Bundle' };
          orderTitle = typeLabel[order.order_type] || orderTitle;
        }

        const res = await fetch(`${BASE_URL}/api/send-email-day7`, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({
            to:        order.buyer_email,
            buyerName: '',
            orderTitle,
            orderType: order.order_type,
            subject:   order.subject,
            stage:     order.stage,
            orderId:   order.id,
          }),
        });

        if (res.ok) {
          await client.query(
            `UPDATE orders SET sequence_step = 2 WHERE id = $1`,
            [order.id]
          );
          console.log(`[cron] Day 7 sent: ${order.id} → ${order.buyer_email}`);
        } else {
          console.warn(`[cron] Day 7 failed for ${order.id}:`, await res.text());
        }

        await sleep(300);

      } catch (err) {
        console.error(`[cron] Day 7 error for ${order.id}:`, err.message);
      }
    }

  } catch (err) {
    console.error('[cron] Fatal error:', err);
  } finally {
    await client.end();
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
