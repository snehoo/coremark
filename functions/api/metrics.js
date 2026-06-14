// functions/api/metrics.js
// GET /api/metrics
//
// Protected by x-metrics-secret header (set in Cloudflare env vars).
// Returns KPIs for the admin dashboard.

import { getClient } from '../_db.js';

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, x-metrics-secret',
};

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS });
}

export async function onRequestGet({ request, env }) {
  // Auth check
  const secret = request.headers.get('x-metrics-secret');
  if (!secret || secret !== env.METRICS_SECRET) {
    return new Response('Unauthorized', { status: 401, headers: CORS });
  }

  const client = await getClient(env);
  try {
    // ── Run all queries in parallel ──────────────────────────
    const [
      revenueRes,
      ordersRes,
      buyersRes,
      topBoostersRes,
      bySubjectRes,
      byStageRes,
      byTypeRes,
      dailyRes,
      sequenceRes,
      feedbackRes,
      pageviewsRes,
    ] = await Promise.all([

      // Total revenue
      client.query(`
        SELECT
          COALESCE(SUM(amount_paise), 0)           AS total_paise,
          COALESCE(SUM(amount_paise) FILTER (
            WHERE paid_at >= NOW() - INTERVAL '30 days'
          ), 0)                                     AS last30_paise,
          COALESCE(SUM(amount_paise) FILTER (
            WHERE paid_at >= NOW() - INTERVAL '7 days'
          ), 0)                                     AS last7_paise,
          COALESCE(SUM(amount_paise) FILTER (
            WHERE paid_at >= CURRENT_DATE
          ), 0)                                     AS today_paise
        FROM orders WHERE status = 'paid'
      `),

      // Order counts
      client.query(`
        SELECT
          COUNT(*)                                   AS total,
          COUNT(*) FILTER (
            WHERE paid_at >= NOW() - INTERVAL '30 days'
          )                                          AS last30,
          COUNT(*) FILTER (
            WHERE paid_at >= NOW() - INTERVAL '7 days'
          )                                          AS last7,
          COUNT(*) FILTER (
            WHERE paid_at >= CURRENT_DATE
          )                                          AS today,
          COUNT(*) FILTER (WHERE status = 'pending') AS pending,
          COUNT(*) FILTER (WHERE status = 'refunded') AS refunded
        FROM orders WHERE status IN ('paid','pending','refunded')
      `),

      // Unique buyers
      client.query(`
        SELECT
          COUNT(*)                                   AS total,
          COUNT(*) FILTER (
            WHERE created_at >= NOW() - INTERVAL '30 days'
          )                                          AS last30
        FROM buyers
      `),

      // Top 10 boosters by units sold
      client.query(`
        SELECT
          slug_item                                  AS slug,
          COUNT(*)                                   AS units
        FROM orders,
             jsonb_array_elements_text(item_slugs) AS slug_item
        WHERE status = 'paid'
        GROUP BY slug_item
        ORDER BY units DESC
        LIMIT 10
      `),

      // Revenue by subject
      client.query(`
        SELECT
          subject,
          COUNT(*)                   AS orders,
          COALESCE(SUM(amount_paise), 0) AS revenue_paise
        FROM orders
        WHERE status = 'paid' AND subject IS NOT NULL
        GROUP BY subject
        ORDER BY revenue_paise DESC
      `),

      // Revenue by stage
      client.query(`
        SELECT
          stage,
          COUNT(*)                   AS orders,
          COALESCE(SUM(amount_paise), 0) AS revenue_paise
        FROM orders
        WHERE status = 'paid' AND stage IS NOT NULL
        GROUP BY stage
        ORDER BY stage
      `),

      // Orders by type
      client.query(`
        SELECT
          order_type,
          COUNT(*)                   AS orders,
          COALESCE(SUM(amount_paise), 0) AS revenue_paise
        FROM orders
        WHERE status = 'paid'
        GROUP BY order_type
        ORDER BY orders DESC
      `),

      // Daily revenue — last 30 days
      client.query(`
        SELECT
          DATE(paid_at)              AS day,
          COUNT(*)                   AS orders,
          COALESCE(SUM(amount_paise), 0) AS revenue_paise
        FROM orders
        WHERE status = 'paid'
          AND paid_at >= NOW() - INTERVAL '30 days'
        GROUP BY DATE(paid_at)
        ORDER BY day ASC
      `),

      // Email sequence health
      client.query(`
        SELECT
          sequence_step,
          COUNT(*) AS orders
        FROM orders
        WHERE status = 'paid'
        GROUP BY sequence_step
        ORDER BY sequence_step
      `),

      // Feedback summary
      client.query(`
        SELECT
          COUNT(*)                  AS total,
          ROUND(AVG(rating), 1)     AS avg_rating,
          COUNT(*) FILTER (WHERE rating >= 4) AS happy,
          COUNT(*) FILTER (WHERE rating = 3)  AS neutral,
          COUNT(*) FILTER (WHERE rating <= 2) AS unhappy
        FROM feedback
      `),

      // Pageviews — last 7 days
      client.query(`
        SELECT
          path,
          COUNT(*) AS views
        FROM pageviews
        WHERE viewed_at >= NOW() - INTERVAL '7 days'
        GROUP BY path
        ORDER BY views DESC
        LIMIT 10
      `),
    ]);

    const revenue  = revenueRes.rows[0];
    const orders   = ordersRes.rows[0];
    const buyers   = buyersRes.rows[0];
    const feedback = feedbackRes.rows[0];

    return new Response(
      JSON.stringify({
        ok: true,
        generatedAt: new Date().toISOString(),

        revenue: {
          totalPaise:  Number(revenue.total_paise),
          last30Paise: Number(revenue.last30_paise),
          last7Paise:  Number(revenue.last7_paise),
          todayPaise:  Number(revenue.today_paise),
        },

        orders: {
          total:    Number(orders.total),
          last30:   Number(orders.last30),
          last7:    Number(orders.last7),
          today:    Number(orders.today),
          pending:  Number(orders.pending),
          refunded: Number(orders.refunded),
        },

        buyers: {
          total:  Number(buyers.total),
          last30: Number(buyers.last30),
        },

        topBoosters: topBoostersRes.rows.map(r => ({
          slug:  r.slug,
          units: Number(r.units),
        })),

        bySubject: bySubjectRes.rows.map(r => ({
          subject:      r.subject,
          orders:       Number(r.orders),
          revenuePaise: Number(r.revenue_paise),
        })),

        byStage: byStageRes.rows.map(r => ({
          stage:        Number(r.stage),
          orders:       Number(r.orders),
          revenuePaise: Number(r.revenue_paise),
        })),

        byType: byTypeRes.rows.map(r => ({
          type:         r.order_type,
          orders:       Number(r.orders),
          revenuePaise: Number(r.revenue_paise),
        })),

        daily: dailyRes.rows.map(r => ({
          day:          r.day,
          orders:       Number(r.orders),
          revenuePaise: Number(r.revenue_paise),
        })),

        sequence: sequenceRes.rows.map(r => ({
          step:   Number(r.sequence_step),
          orders: Number(r.orders),
        })),

        feedback: {
          total:   Number(feedback.total),
          avgRating: feedback.avg_rating ? Number(feedback.avg_rating) : null,
          happy:   Number(feedback.happy),
          neutral: Number(feedback.neutral),
          unhappy: Number(feedback.unhappy),
        },

        topPages: pageviewsRes.rows.map(r => ({
          path:  r.path,
          views: Number(r.views),
        })),
      }),
      { status: 200, headers: { 'Content-Type': 'application/json', ...CORS } }
    );

  } catch (err) {
    console.error('[metrics]', err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...CORS } }
    );
  } finally {
    await client.end();
  }
}
