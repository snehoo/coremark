// functions/api/create-order.js
import { query } from '../_db.js';

const CORS = { 'Access-Control-Allow-Origin':'*','Access-Control-Allow-Methods':'POST, OPTIONS','Access-Control-Allow-Headers':'Content-Type' };
export async function onRequestOptions() { return new Response(null,{status:204,headers:CORS}); }

function razorpayAuth(env){ return 'Basic '+btoa(`${env.RAZORPAY_KEY_ID}:${env.RAZORPAY_KEY_SECRET}`); }
function calculatePrice(t,items){ if(t==='single')return 24900;if(t==='fivepack')return 79900;if(t==='subject')return 129900;if(t==='stage')return 249900;return items.length*24900; }
function deriveSubject(t,slug,items){ if(t==='stage')return 'mixed';const s=items[0]||slug||'';if(s.startsWith('math-'))return 'math';if(s.startsWith('sci-'))return 'science';if(s.startsWith('comp-'))return 'computing';return null; }
function deriveStage(items,slug){ const s=items[0]||slug||'';const m=s.match(/-s(\d)$/);return m?parseInt(m[1]):null; }

export async function onRequestPost({request,env}){
  let body; try{body=await request.json();}catch{return new Response('Bad JSON',{status:400,headers:CORS});}
  const{orderType,primarySlug,itemSlugs,buyerEmail,buyerName}=body;
  if(!orderType||!primarySlug||!Array.isArray(itemSlugs)||!itemSlugs.length)
    return new Response(JSON.stringify({error:'Missing fields'}),{status:400,headers:{'Content-Type':'application/json',...CORS}});
  if(!buyerEmail||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(buyerEmail.trim()))
    return new Response(JSON.stringify({error:'Valid email required'}),{status:400,headers:{'Content-Type':'application/json',...CORS}});

  const amountPaise=calculatePrice(orderType,itemSlugs);
  const subject=deriveSubject(orderType,primarySlug,itemSlugs);
  const stage=deriveStage(itemSlugs,primarySlug);

  let rzpOrder;
  try{
    const r=await fetch('https://api.razorpay.com/v1/orders',{method:'POST',headers:{'Authorization':razorpayAuth(env),'Content-Type':'application/json'},
      body:JSON.stringify({amount:amountPaise,currency:'INR',notes:{source:'coremark',order_type:orderType,primary_slug:primarySlug,item_slugs:itemSlugs.join(','),buyer_email:buyerEmail.trim(),buyer_name:buyerName||'',subject:subject||'',stage:stage?String(stage):''}})});
    if(!r.ok)throw new Error('Razorpay error: '+r.status);
    rzpOrder=await r.json();
  }catch(err){return new Response(JSON.stringify({error:err.message}),{status:502,headers:{'Content-Type':'application/json',...CORS}});}

  try{
    await query(env,
      `INSERT INTO orders (razorpay_order_id,buyer_email,order_type,primary_slug,item_slugs,amount_paise,currency,status,subject,stage,source)
       VALUES ($1,$2,$3,$4,$5::jsonb,$6,'INR','pending',$7,$8,'web') ON CONFLICT (razorpay_order_id) DO NOTHING`,
      [rzpOrder.id,buyerEmail.trim(),orderType,primarySlug,JSON.stringify(itemSlugs),amountPaise,subject,stage]);
  }catch(err){console.error('[create-order] DB:',err.message);}

  return new Response(JSON.stringify({ok:true,razorpayOrderId:rzpOrder.id,keyId:env.RAZORPAY_KEY_ID,amountPaise}),{status:200,headers:{'Content-Type':'application/json',...CORS}});
}
