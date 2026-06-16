// functions/api/create-order.js
// No imports — all logic self-contained to avoid module resolution issues

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS });
}

function razorpayAuth(env) {
  return 'Basic ' + btoa(`${env.RAZORPAY_KEY_ID}:${env.RAZORPAY_KEY_SECRET}`);
}

function calculatePrice(orderType, itemSlugs) {
  if (orderType === 'single')   return 24900;
  if (orderType === 'fivepack') return 79900;
  if (orderType === 'subject')  return 129900;
  if (orderType === 'stage')    return 249900;
  return itemSlugs.length * 24900;
}

function deriveSubject(orderType, primarySlug, itemSlugs) {
  if (orderType === 'stage') return 'mixed';
  const slug = itemSlugs[0] || primarySlug || '';
  if (slug.startsWith('math-'))  return 'math';
  if (slug.startsWith('sci-'))   return 'science';
  if (slug.startsWith('comp-'))  return 'computing';
  return null;
}

function deriveStage(itemSlugs, primarySlug) {
  const slug  = itemSlugs[0] || primarySlug || '';
  const match = slug.match(/-s(\d)$/);
  return match ? parseInt(match[1]) : null;
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

export async function onRequestPost({ request, env }) {
  let body;
  try { body = await request.json(); }
  catch { return new Response(JSON.stringify({ error: 'Bad JSON' }), { status: 400, headers: { 'Content-Type': 'application/json', ...CORS } }); }

  const { orderType, primarySlug, itemSlugs, buyerEmail, buyerName } = body;

  if (!orderType || !primarySlug || !Array.isArray(itemSlugs) || !itemSlugs.length)
    return new Response(JSON.stringify({ error: 'Missing fields' }), { status: 400, headers: { 'Content-Type': 'application/json', ...CORS } });

  if (!buyerEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(buyerEmail.trim()))
    return new Response(JSON.stringify({ error: 'Valid email required' }), { status: 400, headers: { 'Content-Type': 'application/json', ...CORS } });

  const amountPaise = calculatePrice(orderType, itemSlugs);
  const subject     = deriveSubject(orderType, primarySlug, itemSlugs);
  const stage       = deriveStage(itemSlugs, primarySlug);

  // Create Razorpay order
  let rzpOrder;
  try {
    const rzpRes = await fetch('https://api.razorpay.com/v1/orders', {
      method:  'POST',
      headers: { 'Authorization': razorpayAuth(env), 'Content-Type': 'application/json' },
      body:    JSON.stringify({
        amount: amountPaise, currency: 'INR',
        notes: {
          source: 'coremark', order_type: orderType,
          primary_slug: primarySlug, item_slugs: itemSlugs.join(','),
          buyer_email: buyerEmail.trim(), buyer_name: buyerName || '',
          subject: subject || '', stage: stage ? String(stage) : '',
        },
      }),
    });
    if (!rzpRes.ok) throw new Error('Razorpay ' + rzpRes.status + ': ' + await rzpRes.text());
    rzpOrder = await rzpRes.json();
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 503, headers: { 'Content-Type': 'application/json', ...CORS } });
  }

  // Save to DB — non-blocking
  try {
    await dbQuery(env,
      `INSERT INTO orders (razorpay_order_id, buyer_email, order_type, primary_slug, item_slugs, amount_paise, currency, status, subject, stage, source)
       VALUES ($1,$2,$3,$4,$5::jsonb,$6,'INR','pending',$7,$8,'web') ON CONFLICT (razorpay_order_id) DO NOTHING`,
      [rzpOrder.id, buyerEmail.trim(), orderType, primarySlug, JSON.stringify(itemSlugs), amountPaise, subject, stage]
    );
  } catch (err) {
    console.error('[create-order] DB:', err.message);
  }

  return new Response(
    JSON.stringify({ ok: true, razorpayOrderId: rzpOrder.id, keyId: env.RAZORPAY_KEY_ID, amountPaise }),
    { status: 200, headers: { 'Content-Type': 'application/json', ...CORS } }
  );
}
