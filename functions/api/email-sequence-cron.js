// functions/api/email-sequence-cron.js
import { getSQL } from '../_db.js';

const BASE_URL = 'https://coremark.study';

export async function scheduled(event, env, ctx) {
  ctx.waitUntil(runSequence(env));
}

async function runSequence(env) {
  const sql = getSQL(env);

  // Day 2 — 48h after purchase
  const day2 = await sql`
    SELECT id, buyer_email, order_type, primary_slug, item_slugs, subject, stage
    FROM orders WHERE status='paid' AND sequence_step=0 AND paid_at < NOW()-INTERVAL '48 hours' AND buyer_email IS NOT NULL LIMIT 50`;

  for (const order of day2) {
    try {
      const items = Array.isArray(order.item_slugs) ? order.item_slugs : JSON.parse(order.item_slugs||'[]');
      let title = order.primary_slug;
      if (items.length === 1) {
        const b = await sql`SELECT name FROM boosters WHERE slug = ${items[0]}`;
        if (b.length) title = b[0].name;
      }
      const res = await fetch(`${BASE_URL}/api/send-email-day2`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: order.buyer_email, orderTitle: title, orderType: order.order_type, subject: order.subject, stage: order.stage, orderId: order.id, itemSlugs: items }),
      });
      if (res.ok) await sql`UPDATE orders SET sequence_step=1 WHERE id=${order.id}::uuid`;
    } catch (err) { console.error('[cron day2]', order.id, err.message); }
    await new Promise(r => setTimeout(r, 300));
  }

  // Day 7 — 7 days after purchase
  const day7 = await sql`
    SELECT id, buyer_email, order_type, primary_slug, item_slugs, subject, stage
    FROM orders WHERE status='paid' AND sequence_step=1 AND paid_at < NOW()-INTERVAL '7 days' AND buyer_email IS NOT NULL LIMIT 50`;

  for (const order of day7) {
    try {
      const items = Array.isArray(order.item_slugs) ? order.item_slugs : JSON.parse(order.item_slugs||'[]');
      let title = order.primary_slug;
      if (items.length === 1) {
        const b = await sql`SELECT name FROM boosters WHERE slug = ${items[0]}`;
        if (b.length) title = b[0].name;
      }
      const res = await fetch(`${BASE_URL}/api/send-email-day7`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: order.buyer_email, orderTitle: title, orderType: order.order_type, subject: order.subject, stage: order.stage, orderId: order.id }),
      });
      if (res.ok) await sql`UPDATE orders SET sequence_step=2 WHERE id=${order.id}::uuid`;
    } catch (err) { console.error('[cron day7]', order.id, err.message); }
    await new Promise(r => setTimeout(r, 300));
  }
}
