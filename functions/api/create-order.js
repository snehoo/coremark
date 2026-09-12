// functions/api/create-order.js
import { BOOSTER_MAP } from './_booster-map.js';

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

const PRICE_INR_PAISE = { single: 24900, fivepack: 79900, subject: 129900, stage: 249900 };
const PRICE_USD_CENTS = { single: 499, fivepack: 1499, subject: 1999, stage: 3499 };

function calculatePrice(orderType, currency) {
  return currency === 'USD' ? PRICE_USD_CENTS[orderType] : PRICE_INR_PAISE[orderType];
}

// Currency is decided entirely server-side from Cloudflare's edge-resolved
// country — never from anything the client sends. This closes the same
// pricing-abuse surface as validateOrder() above: there is no client-supplied
// currency field anywhere, so there is nothing to trust or distrust.
function currencyForRequest(request) {
  return request.cf?.country === 'IN' ? 'INR' : 'USD';
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

const SUBJECT_PREFIXES = ['math', 'sci', 'comp'];

function slugsFor(prefix, stage) {
  return Object.keys(BOOSTER_MAP).filter(k => k.startsWith(`${prefix}-`) && k.endsWith(`-s${stage}`));
}

function sameSet(a, b) {
  if (a.length !== b.length) return false;
  const setB = new Set(b);
  return a.every(x => setB.has(x));
}

// Every order type has a fixed price computed from orderType alone
// (calculatePrice never looks at itemSlugs' actual content). Without this,
// a direct POST to this endpoint could pay the single/fivepack/subject/stage
// price while requesting far more files than that tier is supposed to include
// — verify-payment.js's getFileUrls() falls back to emailing every slug in
// itemSlugs individually whenever no pre-built bundle zip matches primarySlug.
// The client already enforces basket shape in CM_PRODUCTS, but that's
// trivially bypassable by calling this endpoint directly.
function validateOrder(orderType, itemSlugs, primarySlug) {
  const parsed = [];
  for (const slug of itemSlugs) {
    if (!BOOSTER_MAP[slug]) return `Unknown booster: ${slug}`;
    const m = slug.match(/^(math|sci|comp)-.+-s(\d)$/);
    if (!m) return `Invalid booster slug: ${slug}`;
    parsed.push({ slug, prefix: m[1], stage: m[2] });
  }

  if (orderType === 'single') {
    if (itemSlugs.length !== 1) return 'A single booster order must contain exactly 1 item.';
    return null;
  }

  if (orderType === 'fivepack') {
    if (itemSlugs.length !== 5) return 'A 5-pack must contain exactly 5 boosters.';
    if (new Set(parsed.map(p => p.prefix)).size > 1) return 'All 5-pack boosters must be from the same subject.';
    if (new Set(parsed.map(p => p.stage)).size > 1) return 'All 5-pack boosters must be from the same stage.';
    return null;
  }

  if (orderType === 'subject') {
    const prefixes = new Set(parsed.map(p => p.prefix)), stages = new Set(parsed.map(p => p.stage));
    if (prefixes.size !== 1 || stages.size !== 1) return 'A subject bundle must be a single subject and stage.';
    const expected = slugsFor([...prefixes][0], [...stages][0]);
    if (!sameSet(itemSlugs, expected)) return 'Subject bundle must include every booster for that subject and stage — nothing more, nothing less.';
    return null;
  }

  if (orderType === 'stage') {
    const stages = new Set(parsed.map(p => p.stage));
    if (stages.size !== 1) return 'A stage bundle must be a single stage.';
    const expected = SUBJECT_PREFIXES.flatMap(p => slugsFor(p, [...stages][0]));
    if (!sameSet(itemSlugs, expected)) return 'Stage bundle must include every booster across all subjects for that stage.';
    return null;
  }

  return `Unknown order type: ${orderType}`;
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

  const orderError = validateOrder(orderType, itemSlugs, primarySlug);
  if (orderError)
    return new Response(JSON.stringify({ error: orderError }), { status: 400, headers: { 'Content-Type': 'application/json', ...CORS } });

  const currency    = currencyForRequest(request);
  const amountPaise = calculatePrice(orderType, currency);
  const subject     = deriveSubject(orderType, primarySlug, itemSlugs);
  const stage       = deriveStage(itemSlugs, primarySlug);

  // Create Razorpay order
  let rzpOrder;
  try {
    const rzpRes = await fetch('https://api.razorpay.com/v1/orders', {
      method:  'POST',
      headers: { 'Authorization': razorpayAuth(env), 'Content-Type': 'application/json' },
      body:    JSON.stringify({
        amount: amountPaise, currency,
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
       VALUES ($1,$2,$3,$4,$5::jsonb,$6,$7,'pending',$8,$9,'web') ON CONFLICT (razorpay_order_id) DO NOTHING`,
      [rzpOrder.id, buyerEmail.trim(), orderType, primarySlug, JSON.stringify(itemSlugs), amountPaise, currency, subject, stage]
    );
  } catch (err) {
    console.error('[create-order] DB:', err.message);
  }

  return new Response(
    JSON.stringify({ ok: true, razorpayOrderId: rzpOrder.id, keyId: env.RAZORPAY_KEY_ID, amountPaise, currency }),
    { status: 200, headers: { 'Content-Type': 'application/json', ...CORS } }
  );
}
