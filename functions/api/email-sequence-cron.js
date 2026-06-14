// functions/api/email-sequence-cron.js
import { query } from '../_db.js';
const BASE='https://coremark.study';
export async function scheduled(event,env,ctx){ctx.waitUntil(run(env));}
async function run(env){
  const day2=await query(env,`SELECT id,buyer_email,order_type,primary_slug,item_slugs,subject,stage FROM orders WHERE status='paid' AND sequence_step=0 AND paid_at<NOW()-INTERVAL '48 hours' AND buyer_email IS NOT NULL LIMIT 50`,[]);
  for(const o of day2.rows){
    try{
      const items=Array.isArray(o.item_slugs)?o.item_slugs:JSON.parse(o.item_slugs||'[]');
      let title=o.primary_slug;
      if(items.length===1){const b=await query(env,`SELECT name FROM boosters WHERE slug=$1`,[items[0]]);if(b.rows.length)title=b.rows[0].name;}
      const r=await fetch(`${BASE}/api/send-email-day2`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({to:o.buyer_email,orderTitle:title,orderType:o.order_type,subject:o.subject,stage:o.stage,orderId:o.id,itemSlugs:items})});
      if(r.ok)await query(env,`UPDATE orders SET sequence_step=1 WHERE id=$1::uuid`,[o.id]);
    }catch(e){console.error('[cron day2]',o.id,e.message);}
    await new Promise(r=>setTimeout(r,300));
  }
  const day7=await query(env,`SELECT id,buyer_email,order_type,primary_slug,item_slugs,subject,stage FROM orders WHERE status='paid' AND sequence_step=1 AND paid_at<NOW()-INTERVAL '7 days' AND buyer_email IS NOT NULL LIMIT 50`,[]);
  for(const o of day7.rows){
    try{
      const items=Array.isArray(o.item_slugs)?o.item_slugs:JSON.parse(o.item_slugs||'[]');
      let title=o.primary_slug;
      if(items.length===1){const b=await query(env,`SELECT name FROM boosters WHERE slug=$1`,[items[0]]);if(b.rows.length)title=b.rows[0].name;}
      const r=await fetch(`${BASE}/api/send-email-day7`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({to:o.buyer_email,orderTitle:title,orderType:o.order_type,subject:o.subject,stage:o.stage,orderId:o.id})});
      if(r.ok)await query(env,`UPDATE orders SET sequence_step=2 WHERE id=$1::uuid`,[o.id]);
    }catch(e){console.error('[cron day7]',o.id,e.message);}
    await new Promise(r=>setTimeout(r,300));
  }
}
