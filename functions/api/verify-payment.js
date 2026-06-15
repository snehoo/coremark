// functions/api/verify-payment.js

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

const CORS = { 'Access-Control-Allow-Origin':'*','Access-Control-Allow-Methods':'POST, OPTIONS','Access-Control-Allow-Headers':'Content-Type' };
export async function onRequestOptions(){ return new Response(null,{status:204,headers:CORS}); }

function razorpayAuth(env){ return 'Basic '+btoa(`${env.RAZORPAY_KEY_ID}:${env.RAZORPAY_KEY_SECRET}`); }

async function verifySignature(env,orderId,paymentId,sig){
  const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(env.RAZORPAY_KEY_SECRET),{name:'HMAC',hash:'SHA-256'},false,['sign']);
  const s=await crypto.subtle.sign('HMAC',key,new TextEncoder().encode(`${orderId}|${paymentId}`));
  const c=Array.from(new Uint8Array(s)).map(b=>b.toString(16).padStart(2,'0')).join('');
  return c===sig;
}

async function getFileUrls(env,itemSlugs){
  const urls=[];
  for(const slug of itemSlugs){
    try{
      const l=await env.R2_BUCKET.list({prefix:`booster/cm-${slug}-`});
      for(const o of(l.objects||[]))urls.push(`https://assets.coremark.study/${o.key}`);
    }catch(e){console.warn('[verify] R2:',slug,e.message);}
  }
  if(!urls.length)for(const slug of itemSlugs)urls.push(`https://assets.coremark.study/booster/cm-${slug}.pdf`);
  return urls;
}

export async function onRequestPost({request,env}){
  let body; try{body=await request.json();}catch{return new Response('Bad JSON',{status:400,headers:CORS});}
  const{paymentId,razorpayOrderId,signature,orderType,primarySlug,itemSlugs=[],buyerEmail}=body;
  if(!paymentId||!razorpayOrderId)return new Response(JSON.stringify({error:'Missing params'}),{status:400,headers:{'Content-Type':'application/json',...CORS}});

  if(signature){const v=await verifySignature(env,razorpayOrderId,paymentId,signature);if(!v)return new Response(JSON.stringify({error:'Invalid signature'}),{status:403,headers:{'Content-Type':'application/json',...CORS}});}

  let payment;
  try{const r=await fetch(`https://api.razorpay.com/v1/payments/${paymentId}`,{headers:{'Authorization':razorpayAuth(env)}});if(!r.ok)throw new Error('Razorpay '+r.status);payment=await r.json();}
  catch(err){return new Response(JSON.stringify({error:err.message}),{status:502,headers:{'Content-Type':'application/json',...CORS}});}

  if(payment.status!=='captured')return new Response(JSON.stringify({error:'Not captured',status:payment.status}),{status:402,headers:{'Content-Type':'application/json',...CORS}});

  const email=payment.email||payment.notes?.buyer_email||buyerEmail||'';
  const hash=email?await sha256(email):null;
  const country=payment.international?'International':'IN';
  const items=itemSlugs.length>0?itemSlugs:(payment.notes?.item_slugs||'').split(',').filter(Boolean);
  const rType=orderType||payment.notes?.order_type||'single';
  const rSlug=primarySlug||payment.notes?.primary_slug||'';
  const rSubj=payment.notes?.subject||null;
  const rStage=payment.notes?.stage?parseInt(payment.notes.stage):null;

  const existing=await dbQuery(env,`SELECT id FROM orders WHERE razorpay_order_id=$1 AND status='paid'`,[razorpayOrderId]);
  const isNew=!existing.rows.length;

  await dbQuery(env,
    `UPDATE orders SET razorpay_payment_id=$1,buyer_email=$2,buyer_hash=$3,status='paid',paid_at=NOW(),
     item_slugs=COALESCE(NULLIF(item_slugs::text,'[]')::jsonb,$4::jsonb),subject=COALESCE(subject,$5),stage=COALESCE(stage,$6)
     WHERE razorpay_order_id=$7`,
    [paymentId,email,hash,JSON.stringify(items),rSubj,rStage,razorpayOrderId]);

  if(isNew&&hash)await dbQuery(env,
    `INSERT INTO buyers(buyer_hash,country,order_count,total_paise)VALUES($1,$2,1,$3)
     ON CONFLICT(buyer_hash)DO UPDATE SET order_count=buyers.order_count+1,total_paise=buyers.total_paise+$3,updated_at=NOW()`,
    [hash,country,payment.amount]);

  if(isNew&&email&&env.BEEHIIV_API_KEY&&env.BEEHIIV_PUB_ID){
    fetch(`https://api.beehiiv.com/v2/publications/${env.BEEHIIV_PUB_ID}/subscriptions`,{method:'POST',headers:{'Content-Type':'application/json','Authorization':`Bearer ${env.BEEHIIV_API_KEY}`},
      body:JSON.stringify({email,reactivate_existing:false,send_welcome_email:false,utm_source:'coremark_purchase',utm_campaign:rSlug,custom_fields:[{name:'subject',value:rSubj||''},{name:'stage',value:rStage?String(rStage):''},{name:'source',value:'coremark'}]})
    }).catch(e=>console.warn('[beehiiv]',e.message));
  }

  const orderRows=await dbQuery(env,`SELECT id FROM orders WHERE razorpay_order_id=$1`,[razorpayOrderId]);
  const internalId=orderRows.rows[0]?.id||razorpayOrderId;

  let title=rSlug;
  if(items.length===1){const b=await dbQuery(env,`SELECT name FROM boosters WHERE slug=$1`,[items[0]]);if(b.rows.length)title=b.rows[0].name;}
  else{const l={fivepack:'5-Pack Bundle',subject:'Subject Bundle',stage:'Stage Bundle'};title=l[rType]||title;}

  const fileUrls=await getFileUrls(env,items);
  return new Response(JSON.stringify({ok:true,email,orderTitle:title,orderId:internalId,paymentId,orderType:rType,subject:rSubj,stage:rStage,fileUrls}),{status:200,headers:{'Content-Type':'application/json',...CORS}});
}
