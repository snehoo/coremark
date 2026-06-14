// functions/api/track.js
// POST /api/track
//
// Called by subject pages and checkout on load.
// Stores pageview in DB for admin dashboard.
//
// Body: { path, referrer }

import { getClient, classifySource } from '../_db.js';

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS });
}

function parseSubjectFromPath(path) {
  if (path.includes('math'))      return 'math';
  if (path.includes('science'))   return 'science';
  if (path.includes('computing')) return 'computing';
  return null;
}

function parseStageFromPath(path) {
  const m = path.match(/[?&]stage=(\d)/);
  return m ? parseInt(m[1]) : null;
}

export async function onRequestPost({ request, env }) {
  let body;
  try {
    body = await request.json();
  } catch {
    return new Response('Bad JSON', { status: 400, headers: CORS });
  }

  const { path = '/', referrer = null } = body;
  const source  = classifySource(referrer);
  const subject = parseSubjectFromPath(path);
  const stage   = parseStageFromPath(path);

  const client = await getClient(env);
  try {
    await client.query(
      `INSERT INTO pageviews (path, referrer, source, subject, stage)
       VALUES ($1, $2, $3, $4, $5)`,
      [path.slice(0, 500), referrer?.slice(0, 500) || null, source, subject, stage]
    );
  } catch (err) {
    console.error('[track]', err.message);
  } finally {
    await client.end();
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json', ...CORS },
  });
}
