// functions/api/orders.js
// GET /api/orders?status=paid&limit=50
// Same x-metrics-secret auth as /api/metrics

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, x-metrics-secret',
};

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS });
}

async function dbQuery(env, sql, params = []) {
  const connStr = env.DATABASE_URL;
  if (!connStr) throw new Error('DATABASE_URL not set');
  const url = new URL(connStr.replace(/^postgres(ql)?:\/\//, 'https://'));
  const res = await fetch(`https://${url.hostname}/sql`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Neon-Connection-String': connStr },
    body: JSON.stringify({ query: sql, params }),
  });
  if (!res.ok) throw new Error(`DB ${res.status}: ${await res.text()}`);
  const data = await res.json();
  const fields = data.fields || [];
  const rows = (data.rows || []).map(row => {
    if (!Array.isArray(row)) return row;
    const obj = {};
    fields.forEach((f, i) => { obj[f.name] = row[i]; });
    return obj;
  });
  return { rows, rowCount: data.rowCount ?? rows.length };
}

export async function onRequestGet({ request, env }) {
  if (request.headers.get('x-metrics-secret') !== env.METRICS_SECRET) {
    return new Response('Unauthorized', { status: 401, headers: CORS });
  }

  try {
    const url    = new URL(request.url);
    const status = url.searchParams.get('status') || 'all';
    const limit  = Math.min(parseInt(url.searchParams.get('limit') || '100'), 500);

    const where = status === 'all'
      ? `WHERE status IN ('paid','pending','refunded','failed')`
      : `WHERE status = $2`;
    const params = status === 'all' ? [limit] : [limit, status];

    const { rows } = await dbQuery(env,
      `SELECT id, razorpay_order_id, razorpay_payment_id, buyer_email,
              order_type, primary_slug, amount_paise, currency, status,
              subject, stage, paid_at, created_at, source
       FROM orders
       ${where}
       ORDER BY created_at DESC
       LIMIT $1`,
      params
    );

    return new Response(JSON.stringify({ ok: true, orders: rows }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...CORS },
    });
  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...CORS },
    });
  }
}
