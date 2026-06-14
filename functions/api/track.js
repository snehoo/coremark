// functions/api/track.js
import { getSQL, classifySource } from '../_db.js';

const CORS = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' };
export async function onRequestOptions() { return new Response(null, { status: 204, headers: CORS }); }

export async function onRequestPost({ request, env }) {
  let body;
  try { body = await request.json(); } catch { return new Response('Bad JSON', { status: 400, headers: CORS }); }
  const { path = '/', referrer = null } = body;
  const source  = classifySource(referrer);
  const subject = path.includes('math') ? 'math' : path.includes('science') ? 'science' : path.includes('computing') ? 'computing' : null;
  const stageM  = path.match(/[?&]stage=(\d)/);
  const stage   = stageM ? parseInt(stageM[1]) : null;
  try {
    const sql = getSQL(env);
    await sql`INSERT INTO pageviews (path, referrer, source, subject, stage) VALUES (${path.slice(0,500)}, ${referrer?.slice(0,500)||null}, ${source}, ${subject}, ${stage})`;
  } catch (err) { console.error('[track]', err.message); }
  return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'Content-Type': 'application/json', ...CORS } });
}
