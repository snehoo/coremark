// functions/api/create-order.js
const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS });
}

export async function onRequestPost({ request, env }) {
  try {
    let body;
    try { body = await request.json(); }
    catch { return new Response(JSON.stringify({ error: 'Bad JSON' }), { status: 400, headers: { 'Content-Type': 'application/json', ...CORS } }); }

    const { orderType, primarySlug, itemSlugs, buyerEmail } = body;

    if (!orderType || !primarySlug || !Array.isArray(itemSlugs) || !itemSlugs.length) {
      return new Response(JSON.stringify({ error: 'Missing fields' }), { status: 400, headers: { 'Content-Type': 'application/json', ...CORS } });
    }
    if (!buyerEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(buyerEmail.trim())) {
      return new Response(JSON.stringify({ error: 'Valid email required' }), { status: 400, headers: { 'Content-Type': 'application/json', ...CORS } });
    }

    // Price calculation — no DB needed
    const prices = { single: 24900, fivepack: 79900, subject: 129900, stage: 249900 };
    const amountPaise = prices[orderType] || itemSlugs.length * 24900;

    // Check Razorpay keys
    if (!env.RAZORPAY_KEY_ID || !env.RAZORPAY_KEY_SECRET) {
      return new Response(JSON.stringify({ error: 'Razorpay keys not configured', keyId: !!env.RAZORPAY_KEY_ID, secret: !!env.RAZORPAY_KEY_SECRET }), { status: 500, headers: { 'Content-Type': 'application/json', ...CORS } });
    }

    // Create Razorpay order
    const auth = 'Basic ' + btoa(`${env.RAZORPAY_KEY_ID}:${env.RAZORPAY_KEY_SECRET}`);
    const rzpRes = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: { 'Authorization': auth, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: amountPaise,
        currency: 'INR',
        notes: {
          source: 'coremark',
          order_type: orderType,
          primary_slug: primarySlug,
          item_slugs: itemSlugs.join(','),
          buyer_email: buyerEmail.trim(),
        },
      }),
    });

    if (!rzpRes.ok) {
      const err = await rzpRes.text();
      return new Response(JSON.stringify({ error: 'Razorpay failed', status: rzpRes.status, detail: err }), { status: 502, headers: { 'Content-Type': 'application/json', ...CORS } });
    }

    const rzpOrder = await rzpRes.json();

    // Try DB — but don't fail if it errors
    let dbStatus = 'skipped';
    try {
      const connStr = env.DATABASE_URL;
      if (connStr) {
        const url = new URL(connStr.replace(/^postgres(ql)?:\/\//, 'https://'));
        const host = url.hostname;
        const auth2 = 'Basic ' + btoa(`${decodeURIComponent(url.username)}:${decodeURIComponent(url.password)}`);
        const dbRes = await fetch(`https://${host}/sql`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': auth2 },
          body: JSON.stringify({
            query: `INSERT INTO orders (razorpay_order_id, buyer_email, order_type, primary_slug, item_slugs, amount_paise, currency, status, source)
                    VALUES ($1,$2,$3,$4,$5::jsonb,$6,'INR','pending','web') ON CONFLICT (razorpay_order_id) DO NOTHING`,
            params: [rzpOrder.id, buyerEmail.trim(), orderType, primarySlug, JSON.stringify(itemSlugs), amountPaise],
          }),
        });
        dbStatus = dbRes.ok ? 'ok' : 'error:' + dbRes.status;
      } else {
        dbStatus = 'no DATABASE_URL';
      }
    } catch(dbErr) {
      dbStatus = 'exception:' + dbErr.message;
    }

    return new Response(
      JSON.stringify({ ok: true, razorpayOrderId: rzpOrder.id, keyId: env.RAZORPAY_KEY_ID, amountPaise, dbStatus }),
      { status: 200, headers: { 'Content-Type': 'application/json', ...CORS } }
    );

  } catch (err) {
    return new Response(
      JSON.stringify({ error: 'Unhandled exception', message: err.message, stack: err.stack }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...CORS } }
    );
  }
}
