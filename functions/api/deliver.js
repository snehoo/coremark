// functions/api/deliver.js
import { query } from '../_db.js';
export async function onRequestGet({request,env}){
  const p=new URL(request.url).searchParams,orderId=p.get('order_id'),slug=p.get('slug');
  if(!orderId||!slug)return new Response('Missing params',{status:400});
  const r=await query(env,`SELECT id,item_slugs,status,buyer_hash FROM orders WHERE id=$1 OR razorpay_payment_id=$1`,[orderId]);
  if(!r.rows.length)return new Response('Not found',{status:404});
  const o=r.rows[0];
  if(o.status!=='paid')return new Response('Not paid',{status:402});
  const items=Array.isArray(o.item_slugs)?o.item_slugs:JSON.parse(o.item_slugs||'[]');
  if(!items.includes(slug))return new Response('Not in order',{status:403});
  const l=await env.R2_BUCKET.list({prefix:`booster/cm-${slug}-`});
  if(!l.objects?.length)return new Response('File not found',{status:404});
  await query(env,`INSERT INTO downloads(order_id,booster_slug,buyer_hash,download_no)VALUES($1::uuid,$2,$3,(SELECT COALESCE(MAX(download_no),0)+1 FROM downloads WHERE order_id=$1::uuid AND booster_slug=$2))`,[o.id,slug,o.buyer_hash]);
  return Response.redirect(`https://assets.coremark.study/${l.objects[0].key}`,302);
}
