// functions/api/metrics.js
const CORS = {'Access-Control-Allow-Origin':'*','Access-Control-Allow-Methods':'GET, OPTIONS','Access-Control-Allow-Headers':'Content-Type, x-metrics-secret'};
export async function onRequestOptions(){return new Response(null,{status:204,headers:CORS});}

async function dbQuery(env, sql, params=[]) {
  const connStr = env.DATABASE_URL;
  if (!connStr) throw new Error('DATABASE_URL not set');
  const url = new URL(connStr.replace(/^postgres(ql)?:\/\//, 'https://'));
  const res = await fetch(`https://${url.hostname}/sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Neon-Connection-String': connStr,
    },
    body: JSON.stringify({ query: sql, params }),
  });
  if (!res.ok) throw new Error(`DB ${res.status}: ${await res.text()}`);
  const data = await res.json();
  const fields = data.fields || [];
  const rows = (data.rows || []).map(row => {
    if (!Array.isArray(row)) return row;
    const obj = {};
    fields.forEach((f, i) => { obj[f.name] = row[i]; });
    return obj;
  });
  return { rows, rowCount: data.rowCount ?? rows.length };
}

export async function onRequestGet({request,env}){
  if(request.headers.get('x-metrics-secret')!==env.METRICS_SECRET){
    return new Response('Unauthorized',{status:401,headers:CORS});
  }
  try {
    const [rev,ord,buy,top,bySub,byStg,byTyp,daily,seq,fb,pages,funnel] = await Promise.all([
      dbQuery(env,`SELECT COALESCE(SUM(amount_paise),0) AS total_paise,COALESCE(SUM(amount_paise)FILTER(WHERE paid_at>=NOW()-INTERVAL '30 days'),0) AS last30_paise,COALESCE(SUM(amount_paise)FILTER(WHERE paid_at>=NOW()-INTERVAL '7 days'),0) AS last7_paise,COALESCE(SUM(amount_paise)FILTER(WHERE paid_at>=CURRENT_DATE),0) AS today_paise FROM orders WHERE status='paid'`,[]),
      dbQuery(env,`SELECT COUNT(*) AS total,COUNT(*)FILTER(WHERE paid_at>=NOW()-INTERVAL '30 days') AS last30,COUNT(*)FILTER(WHERE paid_at>=NOW()-INTERVAL '7 days') AS last7,COUNT(*)FILTER(WHERE paid_at>=CURRENT_DATE) AS today,COUNT(*)FILTER(WHERE status='pending') AS pending,COUNT(*)FILTER(WHERE status='refunded') AS refunded FROM orders WHERE status IN('paid','pending','refunded')`,[]),
      dbQuery(env,`SELECT COUNT(*) AS total,COUNT(*)FILTER(WHERE created_at>=NOW()-INTERVAL '30 days') AS last30 FROM buyers`,[]),
      dbQuery(env,`SELECT slug_item AS slug,COUNT(*) AS units FROM orders,jsonb_array_elements_text(item_slugs) AS slug_item WHERE status='paid' GROUP BY slug_item ORDER BY units DESC LIMIT 10`,[]),
      dbQuery(env,`SELECT subject,COUNT(*) AS orders,COALESCE(SUM(amount_paise),0) AS revenue_paise FROM orders WHERE status='paid' AND subject IS NOT NULL GROUP BY subject ORDER BY revenue_paise DESC`,[]),
      dbQuery(env,`SELECT stage,COUNT(*) AS orders,COALESCE(SUM(amount_paise),0) AS revenue_paise FROM orders WHERE status='paid' AND stage IS NOT NULL GROUP BY stage ORDER BY stage`,[]),
      dbQuery(env,`SELECT order_type,COUNT(*) AS orders,COALESCE(SUM(amount_paise),0) AS revenue_paise FROM orders WHERE status='paid' GROUP BY order_type ORDER BY orders DESC`,[]),
      dbQuery(env,`SELECT DATE(paid_at) AS day,COUNT(*) AS orders,COALESCE(SUM(amount_paise),0) AS revenue_paise FROM orders WHERE status='paid' AND paid_at>=NOW()-INTERVAL '30 days' GROUP BY DATE(paid_at) ORDER BY day ASC`,[]),
      dbQuery(env,`SELECT sequence_step,COUNT(*) AS orders FROM orders WHERE status='paid' GROUP BY sequence_step ORDER BY sequence_step`,[]),
      dbQuery(env,`SELECT COUNT(*) AS total,ROUND(AVG(rating),1) AS avg_rating,COUNT(*)FILTER(WHERE rating>=4) AS happy,COUNT(*)FILTER(WHERE rating=3) AS neutral,COUNT(*)FILTER(WHERE rating<=2) AS unhappy FROM feedback`,[]),
      dbQuery(env,`SELECT path,COUNT(*) AS views FROM pageviews WHERE viewed_at>=NOW()-INTERVAL '7 days' GROUP BY path ORDER BY views DESC LIMIT 10`,[]),
      dbQuery(env,`SELECT COUNT(*) AS total,COUNT(*)FILTER(WHERE path='/free.html') AS free_page,COUNT(*)FILTER(WHERE path='/free-download.html') AS free_signups FROM pageviews WHERE viewed_at>=NOW()-INTERVAL '30 days'`,[]),
    ]);
    const r=rev.rows[0], o=ord.rows[0], b=buy.rows[0], f=fb.rows[0];
    return new Response(JSON.stringify({
      ok:true, generatedAt:new Date().toISOString(),
      revenue:{totalPaise:Number(r.total_paise),last30Paise:Number(r.last30_paise),last7Paise:Number(r.last7_paise),todayPaise:Number(r.today_paise)},
      orders:{total:Number(o.total),last30:Number(o.last30),last7:Number(o.last7),today:Number(o.today),pending:Number(o.pending),refunded:Number(o.refunded)},
      buyers:{total:Number(b.total),last30:Number(b.last30)},
      topBoosters:top.rows.map(x=>({slug:x.slug,units:Number(x.units)})),
      bySubject:bySub.rows.map(x=>({subject:x.subject,orders:Number(x.orders),revenuePaise:Number(x.revenue_paise)})),
      byStage:byStg.rows.map(x=>({stage:Number(x.stage),orders:Number(x.orders),revenuePaise:Number(x.revenue_paise)})),
      byType:byTyp.rows.map(x=>({type:x.order_type,orders:Number(x.orders),revenuePaise:Number(x.revenue_paise)})),
      daily:daily.rows.map(x=>({day:x.day,orders:Number(x.orders),revenuePaise:Number(x.revenue_paise)})),
      sequence:seq.rows.map(x=>({step:Number(x.sequence_step),orders:Number(x.orders)})),
      feedback:{total:Number(f.total),avgRating:f.avg_rating?Number(f.avg_rating):null,happy:Number(f.happy),neutral:Number(f.neutral),unhappy:Number(f.unhappy)},
      topPages:pages.rows.map(x=>({path:x.path,views:Number(x.views)})),
      funnel:{visitors:Number(funnel.rows[0]?.total||0),freePage:Number(funnel.rows[0]?.free_page||0),freeSignups:Number(funnel.rows[0]?.free_signups||0),paid:Number(o.last30)},
    }),{status:200,headers:{'Content-Type':'application/json',...CORS}});
  } catch(e) {
    console.error('[metrics]',e.message);
    return new Response(JSON.stringify({ok:false,error:e.message}),{status:422,headers:{'Content-Type':'application/json',...CORS}});
  }
}
