// functions/api/deliver.js
// GET /api/deliver?order_id=xxx&slug=math-n1-integers-s8
//
// Secondary download endpoint — called when buyer clicks
// "re-download" from the email link. Generates a fresh
// signed R2 URL and redirects to it.
//
// The primary delivery path (delivery.html) gets URLs
// directly from verify-payment.js via R2 list.

import { getClient } from '../_db.js';

export async function onRequestGet({ request, env }) {
  const params    = new URL(request.url).searchParams;
  const orderId   = params.get('order_id');
  const slug      = params.get('slug');

  if (!orderId || !slug) {
    return new Response('Missing order_id or slug', { status: 400 });
  }

  const client = await getClient(env);
  try {
    // Verify the order is paid and contains this slug
    const { rows } = await client.query(
      `SELECT id, item_slugs, status
       FROM orders
       WHERE id = $1 OR razorpay_payment_id = $1`,
      [orderId]
    );

    if (rows.length === 0) {
      return new Response('Order not found', { status: 404 });
    }

    const order = rows[0];

    if (order.status !== 'paid') {
      return new Response('Order not paid', { status: 402 });
    }

    const itemSlugs = Array.isArray(order.item_slugs)
      ? order.item_slugs
      : JSON.parse(order.item_slugs || '[]');

    if (!itemSlugs.includes(slug)) {
      return new Response('Booster not in this order', { status: 403 });
    }

    // Find the file in R2
    const prefix = `booster/cm-${slug}-`;
    const listed = await env.R2_BUCKET.list({ prefix });

    if (!listed.objects || listed.objects.length === 0) {
      return new Response('File not found', { status: 404 });
    }

    const key = listed.objects[0].key;

    // Log the download
    await client.query(
      `INSERT INTO downloads (order_id, booster_slug, buyer_hash, download_no)
       VALUES (
         $1, $2,
         (SELECT buyer_hash FROM orders WHERE id = $1),
         (SELECT COALESCE(MAX(download_no), 0) + 1
          FROM downloads WHERE order_id = $1 AND booster_slug = $2)
       )`,
      [order.id, slug]
    );

    // Redirect to the public R2 asset URL
    // (R2 bucket is served via coremark.study custom domain on Cloudflare)
    const fileUrl = `https://assets.coremark.study/${key}`;
    return Response.redirect(fileUrl, 302);

  } catch (err) {
    console.error('[deliver]', err);
    return new Response('Internal error', { status: 500 });
  } finally {
    await client.end();
  }
}
