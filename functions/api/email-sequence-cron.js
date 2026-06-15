// functions/api/email-sequence-cron.js

// ── Inline DB helper (no imports needed) ─────────────────
async function dbQuery(env, sql, params = []) {
  const connStr = env.DATABASE_URL;
  if (!connStr) throw new Error('DATABASE_URL not set');
  const url  = new URL(connStr.replace(/^postgres(ql)?:\/\//, 'https://'));
  const auth = 'Basic ' + btoa(`${decodeURIComponent(url.username)}:${decodeURIComponent(url.password)}`);
  const res  = await fetch(`https://${url.hostname}/sql`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': auth },
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
const BASE='https://coremark.study';
export async function scheduled(event,env,ctx){ctx.waitUntil(run(env));}
async function run(env){
  const day2=await dbQuery(env,`SELECT id,buyer_email,order_type,primary_slug,item_slugs,subject,stage FROM orders WHERE status='paid' AND sequence_step=0 AND paid_at<NOW()-INTERVAL '48 hours' AND buyer_email IS NOT NULL LIMIT 50`,[]);
  for(const o of day2.rows){
    try{
      const items=Array.isArray(o.item_slugs)?o.item_slugs:JSON.parse(o.item_slugs||'[]');
      let title=o.primary_slug;
      if(items.length===1){const b=await dbQuery(env,`SELECT name FROM boosters WHERE slug=$1`,[items[0]]);if(b.rows.length)title=b.rows[0].name;}
      const r=await fetch(`${BASE}/api/send-email-day2`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({to:o.buyer_email,orderTitle:title,orderType:o.order_type,subject:o.subject,stage:o.stage,orderId:o.id,itemSlugs:items})});
      if(r.ok)await dbQuery(env,`UPDATE orders SET sequence_step=1 WHERE id=$1::uuid`,[o.id]);
    }catch(e){console.error('[cron day2]',o.id,e.message);}
    await new Promise(r=>setTimeout(r,300));
  }
  const day7=await dbQuery(env,`SELECT id,buyer_email,order_type,primary_slug,item_slugs,subject,stage FROM orders WHERE status='paid' AND sequence_step=1 AND paid_at<NOW()-INTERVAL '7 days' AND buyer_email IS NOT NULL LIMIT 50`,[]);
  for(const o of day7.rows){
    try{
      const items=Array.isArray(o.item_slugs)?o.item_slugs:JSON.parse(o.item_slugs||'[]');
      let title=o.primary_slug;
      if(items.length===1){const b=await dbQuery(env,`SELECT name FROM boosters WHERE slug=$1`,[items[0]]);if(b.rows.length)title=b.rows[0].name;}
      const r=await fetch(`${BASE}/api/send-email-day7`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({to:o.buyer_email,orderTitle:title,orderType:o.order_type,subject:o.subject,stage:o.stage,orderId:o.id})});
      if(r.ok)await dbQuery(env,`UPDATE orders SET sequence_step=2 WHERE id=$1::uuid`,[o.id]);
    }catch(e){console.error('[cron day7]',o.id,e.message);}
    await new Promise(r=>setTimeout(r,300));
  }
}
