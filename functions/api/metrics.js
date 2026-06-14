// functions/api/metrics.js
import { getSQL } from '../_db.js';

const CORS = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, x-metrics-secret' };
export async function onRequestOptions() { return new Response(null, { status: 204, headers: CORS }); }

export async function onRequestGet({ request, env }) {
  if (request.headers.get('x-metrics-secret') !== env.METRICS_SECRET)
    return new Response('Unauthorized', { status: 401, headers: CORS });

  const sql = getSQL(env);

  const [revenue, orders, buyers, topBoosters, bySubject, byStage, byType, daily, sequence, feedback, topPages] = await Promise.all([
    sql`SELECT COALESCE(SUM(amount_paise),0) AS total_paise, COALESCE(SUM(amount_paise) FILTER (WHERE paid_at >= NOW()-INTERVAL '30 days'),0) AS last30_paise, COALESCE(SUM(amount_paise) FILTER (WHERE paid_at >= NOW()-INTERVAL '7 days'),0) AS last7_paise, COALESCE(SUM(amount_paise) FILTER (WHERE paid_at >= CURRENT_DATE),0) AS today_paise FROM orders WHERE status='paid'`,
    sql`SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE paid_at>=NOW()-INTERVAL '30 days') AS last30, COUNT(*) FILTER (WHERE paid_at>=NOW()-INTERVAL '7 days') AS last7, COUNT(*) FILTER (WHERE paid_at>=CURRENT_DATE) AS today, COUNT(*) FILTER (WHERE status='pending') AS pending, COUNT(*) FILTER (WHERE status='refunded') AS refunded FROM orders WHERE status IN ('paid','pending','refunded')`,
    sql`SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE created_at>=NOW()-INTERVAL '30 days') AS last30 FROM buyers`,
    sql`SELECT slug_item AS slug, COUNT(*) AS units FROM orders, jsonb_array_elements_text(item_slugs) AS slug_item WHERE status='paid' GROUP BY slug_item ORDER BY units DESC LIMIT 10`,
    sql`SELECT subject, COUNT(*) AS orders, COALESCE(SUM(amount_paise),0) AS revenue_paise FROM orders WHERE status='paid' AND subject IS NOT NULL GROUP BY subject ORDER BY revenue_paise DESC`,
    sql`SELECT stage, COUNT(*) AS orders, COALESCE(SUM(amount_paise),0) AS revenue_paise FROM orders WHERE status='paid' AND stage IS NOT NULL GROUP BY stage ORDER BY stage`,
    sql`SELECT order_type, COUNT(*) AS orders, COALESCE(SUM(amount_paise),0) AS revenue_paise FROM orders WHERE status='paid' GROUP BY order_type ORDER BY orders DESC`,
    sql`SELECT DATE(paid_at) AS day, COUNT(*) AS orders, COALESCE(SUM(amount_paise),0) AS revenue_paise FROM orders WHERE status='paid' AND paid_at>=NOW()-INTERVAL '30 days' GROUP BY DATE(paid_at) ORDER BY day ASC`,
    sql`SELECT sequence_step, COUNT(*) AS orders FROM orders WHERE status='paid' GROUP BY sequence_step ORDER BY sequence_step`,
    sql`SELECT COUNT(*) AS total, ROUND(AVG(rating),1) AS avg_rating, COUNT(*) FILTER (WHERE rating>=4) AS happy, COUNT(*) FILTER (WHERE rating=3) AS neutral, COUNT(*) FILTER (WHERE rating<=2) AS unhappy FROM feedback`,
    sql`SELECT path, COUNT(*) AS views FROM pageviews WHERE viewed_at>=NOW()-INTERVAL '7 days' GROUP BY path ORDER BY views DESC LIMIT 10`,
  ]);

  const r = revenue[0], o = orders[0], b = buyers[0], fb = feedback[0];
  return new Response(JSON.stringify({
    ok: true, generatedAt: new Date().toISOString(),
    revenue: { totalPaise: Number(r.total_paise), last30Paise: Number(r.last30_paise), last7Paise: Number(r.last7_paise), todayPaise: Number(r.today_paise) },
    orders:  { total: Number(o.total), last30: Number(o.last30), last7: Number(o.last7), today: Number(o.today), pending: Number(o.pending), refunded: Number(o.refunded) },
    buyers:  { total: Number(b.total), last30: Number(b.last30) },
    topBoosters: topBoosters.map(r => ({ slug: r.slug, units: Number(r.units) })),
    bySubject: bySubject.map(r => ({ subject: r.subject, orders: Number(r.orders), revenuePaise: Number(r.revenue_paise) })),
    byStage:   byStage.map(r => ({ stage: Number(r.stage), orders: Number(r.orders), revenuePaise: Number(r.revenue_paise) })),
    byType:    byType.map(r => ({ type: r.order_type, orders: Number(r.orders), revenuePaise: Number(r.revenue_paise) })),
    daily:     daily.map(r => ({ day: r.day, orders: Number(r.orders), revenuePaise: Number(r.revenue_paise) })),
    sequence:  sequence.map(r => ({ step: Number(r.sequence_step), orders: Number(r.orders) })),
    feedback:  { total: Number(fb.total), avgRating: fb.avg_rating ? Number(fb.avg_rating) : null, happy: Number(fb.happy), neutral: Number(fb.neutral), unhappy: Number(fb.unhappy) },
    topPages:  topPages.map(r => ({ path: r.path, views: Number(r.views) })),
  }), { status: 200, headers: { 'Content-Type': 'application/json', ...CORS } });
}
