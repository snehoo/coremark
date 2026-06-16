// functions/api/deliver.js

// ── Inline DB helper (no imports needed) ─────────────────
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

async function sha256(text) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text.toLowerCase().trim()));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,'0')).join('');
}

function classifySource(referrer) {
  if (!referrer) return 'direct';
  const r = referrer.toLowerCase();
  if (r.includes('google') || r.includes('bing')) return 'organic';
  if (r.includes('twitter') || r.includes('instagram') || r.includes('facebook') || r.includes('whatsapp')) return 'social';
  if (r.includes('mail') || r.includes('beehiiv')) return 'email';
  return 'referral';
}
export async function onRequestGet({request,env}){
  const p=new URL(request.url).searchParams,orderId=p.get('order_id'),slug=p.get('slug');
  if(!orderId||!slug)return new Response('Missing params',{status:400});
  const r=await dbQuery(env,`SELECT id,item_slugs,status,buyer_hash FROM orders WHERE id=$1 OR razorpay_payment_id=$1`,[orderId]);
  if(!r.rows.length)return new Response('Not found',{status:404});
  const o=r.rows[0];
  if(o.status!=='paid')return new Response('Not paid',{status:402});
  const items=Array.isArray(o.item_slugs)?o.item_slugs:JSON.parse(o.item_slugs||'[]');
  if(!items.includes(slug))return new Response('Not in order',{status:403});
  const l=await env.R2_BUCKET.list({prefix:`booster/cm-${slug}`});
  if(!l.objects?.length)return new Response('File not found',{status:404});
  await dbQuery(env,`INSERT INTO downloads(order_id,booster_slug,buyer_hash,download_no)VALUES($1::uuid,$2,$3,(SELECT COALESCE(MAX(download_no),0)+1 FROM downloads WHERE order_id=$1::uuid AND booster_slug=$2))`,[o.id,slug,o.buyer_hash]);
  return Response.redirect(`https://assets.coremark.study/${l.objects[0].key}`,302);
}
