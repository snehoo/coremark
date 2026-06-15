// functions/api/feedback.js

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
async function verifyToken(env,orderId,token){
  const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(env.FEEDBACK_SECRET),{name:'HMAC',hash:'SHA-256'},false,['sign']);
  const sig=await crypto.subtle.sign('HMAC',key,new TextEncoder().encode(orderId));
  return Array.from(new Uint8Array(sig)).map(b=>b.toString(16).padStart(2,'0')).join('')===token;
}
function page(r){const m=r>=4?{e:'🎉',h:'Thanks so much!',s:"Really glad it's hitting the mark."}:r===3?{e:'👍',h:'Thanks for letting us know',s:'Email info@coremark.study with suggestions.'}:{e:'💬',h:'Thanks for the feedback',s:'Sorry it didn\'t land. Email info@coremark.study.'};
return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Thanks</title><link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;700;800&display=swap" rel="stylesheet"><style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:'Plus Jakarta Sans',sans-serif;background:#FBF8F2;color:#2A1B3D;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px}.card{background:#fff;border:1.5px solid #EAE3F5;border-radius:22px;padding:52px 44px;max-width:440px;width:100%;text-align:center}.e{font-size:52px;margin-bottom:20px}h1{font-size:26px;font-weight:800;margin-bottom:10px}p{font-size:15px;color:#7A6A94;line-height:1.6;margin-bottom:28px}a{display:inline-block;padding:13px 26px;background:#6E47C9;color:#fff;border-radius:10px;font-weight:700;font-size:15px;text-decoration:none}</style></head>
<body><div class="card"><div class="e">${m.e}</div><h1>${m.h}</h1><p>${m.s}</p><a href="https://coremark.study">Back to CoreMark</a></div></body></html>`;}
export async function onRequestGet({request,env}){
  const p=new URL(request.url).searchParams,orderId=p.get('order_id'),token=p.get('token');
  const rating=Math.min(5,Math.max(1,parseInt(p.get('rating'))||3));
  if(!orderId||!token)return new Response('Missing params',{status:400});
  if(!(await verifyToken(env,orderId,token)))return new Response('Invalid token',{status:403});
  try{await dbQuery(env,`INSERT INTO feedback(order_id,rating)VALUES($1::uuid,$2)ON CONFLICT DO NOTHING`,[orderId,rating]);}
  catch(e){console.error('[feedback]',e.message);}
  return new Response(page(rating),{status:200,headers:{'Content-Type':'text/html;charset=UTF-8'}});
}
