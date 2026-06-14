// functions/api/deliver.js
import { getSQL } from '../_db.js';

export async function onRequestGet({ request, env }) {
  const params  = new URL(request.url).searchParams;
  const orderId = params.get('order_id');
  const slug    = params.get('slug');
  if (!orderId || !slug) return new Response('Missing params', { status: 400 });

  const sql = getSQL(env);
  const rows = await sql`SELECT id, item_slugs, status, buyer_hash FROM orders WHERE id = ${orderId} OR razorpay_payment_id = ${orderId}`;
  if (!rows.length) return new Response('Order not found', { status: 404 });

  const order = rows[0];
  if (order.status !== 'paid') return new Response('Order not paid', { status: 402 });

  const items = Array.isArray(order.item_slugs) ? order.item_slugs : JSON.parse(order.item_slugs || '[]');
  if (!items.includes(slug)) return new Response('Booster not in order', { status: 403 });

  const listed = await env.R2_BUCKET.list({ prefix: `booster/cm-${slug}-` });
  if (!listed.objects?.length) return new Response('File not found', { status: 404 });

  await sql`
    INSERT INTO downloads (order_id, booster_slug, buyer_hash, download_no)
    VALUES (
      ${order.id}::uuid, ${slug}, ${order.buyer_hash},
      (SELECT COALESCE(MAX(download_no),0)+1 FROM downloads WHERE order_id = ${order.id}::uuid AND booster_slug = ${slug})
    )`;

  return Response.redirect(`https://assets.coremark.study/${listed.objects[0].key}`, 302);
}
