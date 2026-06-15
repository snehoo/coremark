// functions/api/razorpay-webhook.js

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

async function verifySig(rawBody,sig,secret){
  const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(secret),{name:'HMAC',hash:'SHA-256'},false,['verify']);
  const bytes=new Uint8Array(sig.match(/.{2}/g).map(b=>parseInt(b,16)));
  return crypto.subtle.verify('HMAC',key,bytes,new TextEncoder().encode(rawBody));
}
export async function onRequestGet(){return new Response('OK',{status:200});}
export async function onRequestPost({request,env}){
  const raw=await request.text();const sig=request.headers.get('x-razorpay-signature')||'';
  if(env.RAZORPAY_WEBHOOK_SECRET){const v=await verifySig(raw,sig,env.RAZORPAY_WEBHOOK_SECRET);if(!v)return new Response('Unauthorized',{status:401});}
  let event;try{event=JSON.parse(raw);}catch{return new Response('Bad JSON',{status:400});}
  const{event:name,payload}=event;
  if(name==='payment.captured'){
    const p=payload.payment.entity,n=p.notes??{};
    const email=n.buyer_email??null,hash=email?await sha256(email):null;
    const country=p.international?'International':'IN';
    const items=n.item_slugs?n.item_slugs.split(','):[];
    if(hash)await dbQuery(env,`INSERT INTO buyers(buyer_hash,country,order_count,total_paise)VALUES($1,$2,1,$3)ON CONFLICT(buyer_hash)DO UPDATE SET order_count=buyers.order_count+1,total_paise=buyers.total_paise+$3,updated_at=NOW()`,[hash,country,p.amount]);
    const r=await dbQuery(env,`UPDATE orders SET razorpay_payment_id=$1,buyer_hash=$2,buyer_email=$3,status='paid',paid_at=NOW() WHERE razorpay_order_id=$4 AND status!='paid'`,[p.id,hash,email,p.order_id]);
    if(!r.rowCount)await dbQuery(env,`INSERT INTO orders(razorpay_order_id,razorpay_payment_id,buyer_hash,buyer_email,order_type,primary_slug,item_slugs,amount_paise,currency,status,subject,stage,paid_at,source)VALUES($1,$2,$3,$4,$5,$6,$7::jsonb,$8,'INR','paid',$9,$10,NOW(),'web')ON CONFLICT(razorpay_order_id)DO UPDATE SET razorpay_payment_id=EXCLUDED.razorpay_payment_id,status='paid',paid_at=NOW()`,
      [p.order_id,p.id,hash,email,n.order_type??'single',n.primary_slug??null,JSON.stringify(items),p.amount,n.subject??null,n.stage?parseInt(n.stage):null]);
  }
  if(name==='payment.failed'){const p=payload.payment.entity;await dbQuery(env,`UPDATE orders SET status='failed' WHERE razorpay_order_id=$1 AND status='pending'`,[p.order_id]);}
  if(name==='refund.created'){const r=payload.refund.entity;await dbQuery(env,`UPDATE orders SET status='refunded' WHERE razorpay_payment_id=$1`,[r.payment_id]);}
  return new Response(JSON.stringify({ok:true}),{status:200,headers:{'Content-Type':'application/json'}});
}
