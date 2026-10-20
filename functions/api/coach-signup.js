// functions/api/coach-signup.js
// POST /api/coach-signup   Body: { email, stage: '7'|'8'|'9', campaign?: string, website?: honeypot }
//
// Early-bird reservation for CoreMark Coach. Dropping an email locks the early-bird price.
//   1. Brevo   : upsert contact into list 13 ("coremark-coach"), SOURCE/STAGE tagged
//   2. Postgres: row in coach_signups with early_bird = TRUE (table is created on first use)
//   3. Resend  : notification to info@coremark.study (routes to Snehal's inbox), first signup per email+stage only
// Brevo is the source of truth: if it fails the request fails. DB and notification failures are logged only.

const BREVO_LIST_COACH   = 13;
const EARLY_BIRD_PRICE   = 4999;
const EARLY_BIRD_CAP     = 100;
const NOTIFY_TO          = 'info@coremark.study';
const VALID_STAGES       = ['7', '8', '9'];
const JSON_HEADERS       = { 'Content-Type': 'application/json' };

// ── Inline DB helper (Pages Functions can't import across files) ─────────────
async function dbQuery(env, sql, params = []) {
  const connStr = env.DATABASE_URL;
  if (!connStr) throw new Error('DATABASE_URL not set');
  const url = new URL(connStr.replace(/^postgres(ql)?:\/\//, 'https://'));
  const res = await fetch(`https://${url.hostname}/sql`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json', 'Neon-Connection-String': connStr },
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

let schemaReady = null;
function ensureSchema(env) {
  if (!schemaReady) {
    schemaReady = (async () => {
      await dbQuery(env, `CREATE TABLE IF NOT EXISTS coach_signups (
        id               BIGSERIAL PRIMARY KEY,
        email            TEXT        NOT NULL,
        stage            SMALLINT    NOT NULL,
        early_bird       BOOLEAN     NOT NULL DEFAULT TRUE,
        price_locked_inr INTEGER     NOT NULL DEFAULT ${EARLY_BIRD_PRICE},
        campaign         TEXT,
        source           TEXT,
        created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (email, stage)
      )`);
    })().catch(err => { schemaReady = null; throw err; });
  }
  return schemaReady;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function json(status, body) {
  return new Response(JSON.stringify(body), { status, headers: JSON_HEADERS });
}

async function notifyOwner(env, { email, stage, campaign, position }) {
  if (!env.RESEND_API_KEY) return;
  const capNote = position && position >= EARLY_BIRD_CAP ? ' · CAP REACHED' : '';
  const subject = `Coach early-bird signup${position ? ' #' + position : ''} · Stage ${stage} · ${email}${capNote}`;
  const rows = [
    ['Email',        email],
    ['Stage',        'Stage ' + stage],
    ['Price locked', '₹' + EARLY_BIRD_PRICE.toLocaleString('en-IN') + ' (early bird)'],
    ['Early-bird #', position ? position + ' of ' + EARLY_BIRD_CAP : 'unknown (DB unavailable)'],
    ['Came from',    campaign || 'direct'],
    ['Brevo list',   '13 (coremark-coach)'],
  ];
  const html = `<!DOCTYPE html><html><body style="font-family:Arial,sans-serif;max-width:520px;margin:24px auto;color:#2A1B3D;font-size:15px;line-height:1.6;">
<p style="margin:0 0 16px;"><strong>New Coach early-bird signup</strong></p>
<table cellpadding="0" cellspacing="0" style="border-collapse:collapse;width:100%;">
${rows.map(([k, v]) => `<tr><td style="padding:6px 12px 6px 0;color:#7A6A94;white-space:nowrap;">${escapeHtml(k)}</td><td style="padding:6px 0;"><strong>${escapeHtml(v)}</strong></td></tr>`).join('\n')}
</table>
<p style="margin:20px 0 0;font-size:13px;color:#7A6A94;">Reply to this email to write to them. Stored in Brevo list 13 and the coach_signups table.</p>
</body></html>`;
  const res = await fetch('https://api.resend.com/emails', {
    method:  'POST',
    headers: { 'Authorization': `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body:    JSON.stringify({ from: 'CoreMark <info@coremark.study>', to: [NOTIFY_TO], reply_to: email, subject, html }),
  });
  if (!res.ok) throw new Error(`Resend ${res.status}: ${await res.text()}`);
}

async function sendConfirmation(env, { email, stage }) {
  if (!env.RESEND_API_KEY) return;
  const price = '₹' + EARLY_BIRD_PRICE.toLocaleString('en-IN');
  const p = (t, m = '0 0 16px') => `<p style="color:#2A1B3D;font-size:16px;margin:${m};line-height:1.6;">${t}</p>`;
  const html = `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#FBF8F2;font-family:'Plus Jakarta Sans',Arial,sans-serif;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">Nothing to pay now. We'll email you the moment Coach opens.</div>
<table width="100%" cellpadding="0" cellspacing="0" style="background:#FBF8F2;padding:32px 16px;"><tr><td align="center">
<table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">
<tr><td style="background:#2A1B3D;border-radius:16px 16px 0 0;padding:28px 36px;">
  <p style="font-family:Georgia,serif;font-size:28px;font-style:italic;color:#FAE588;margin:0 0 6px;line-height:1.2;">You're on the list.</p>
  <p style="color:rgba(255,255,255,0.65);font-size:14px;margin:0;">CoreMark Coach · Stage ${escapeHtml(stage)}</p>
</td></tr>
<tr><td style="background:#ffffff;border:1px solid #EAE3F5;border-top:none;padding:30px 36px;">
  ${p('Hi,')}
  ${p(`We've reserved the <strong>early-bird price of ${price}</strong> (instead of ₹9,999) for CoreMark Coach, Stage ${escapeHtml(stage)}. <strong>There is nothing to pay now.</strong>`, '0 0 22px')}
  <p style="color:#2A1B3D;font-size:15px;font-weight:700;margin:0 0 10px;">What happens next</p>
  <ol style="color:#4A3760;font-size:15px;line-height:1.6;margin:0 0 22px;padding-left:20px;">
    <li style="margin-bottom:6px;">We email you the moment Coach opens, with your link to buy at ${price}.</li>
    <li style="margin-bottom:6px;">After payment, your Coach file and a short setup guide arrive by email.</li>
    <li>Setup takes under a minute: add one file to a Claude project and say "hi".</li>
  </ol>
  <p style="color:#4A3760;font-size:14px;margin:0 0 16px;line-height:1.6;"><strong>Worth doing now:</strong> create your Claude account at <a href="https://claude.ai" style="color:#6E47C9;">claude.ai</a> (the free plan works). Coach runs inside Claude, and Claude accounts are for adults (18+), so use your own and stay nearby while your child uses Coach.</p>
  <p style="color:#7A6A94;font-size:13px;margin:0;line-height:1.6;">Questions? Just reply to this email. Didn't sign up? Ignore this email or reply and we'll remove you.</p>
</td></tr>
<tr><td style="background:#F0EBF8;border:1px solid #EAE3F5;border-top:none;border-radius:0 0 16px 16px;padding:18px 36px;">
  <p style="color:#7A6A94;font-size:12px;margin:0;line-height:1.6;">© 2026 CoreMark · <a href="https://coremark.study" style="color:#6E47C9;text-decoration:none;">coremark.study</a> · Independent practice material, not affiliated with or endorsed by Cambridge Assessment International Education or Anthropic.</p>
</td></tr>
</table></td></tr></table></body></html>`;
  const res = await fetch('https://api.resend.com/emails', {
    method:  'POST',
    headers: { 'Authorization': `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body:    JSON.stringify({
      from: 'CoreMark <info@coremark.study>', to: [email], reply_to: NOTIFY_TO,
      subject: `You're on the list: your ${price} Coach price for Stage ${stage} is reserved`, html,
    }),
  });
  if (!res.ok) throw new Error(`Resend confirm ${res.status}: ${await res.text()}`);
}

export async function onRequestOptions() {
  return new Response(null, { status: 204 });
}

export async function onRequestPost({ request, env, waitUntil }) {
  let body;
  try { body = await request.json(); }
  catch { return json(400, { error: 'Bad JSON' }); }

  // Honeypot: bots fill the hidden field. Pretend success, do nothing.
  if (body && body.website) return json(200, { ok: true });

  const emailRaw = String((body && body.email) || '').trim();
  const stage    = String((body && body.stage) || '');
  const campaign = String((body && body.campaign) || '').toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, 60);

  if (emailRaw.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailRaw)) {
    return json(400, { error: 'Valid email required' });
  }
  if (!VALID_STAGES.includes(stage)) {
    return json(400, { error: 'Stage must be 7, 8 or 9' });
  }
  if (!env.BREVO_API_KEY) {
    return json(503, { error: 'Email service not configured' });
  }

  const emailKey = emailRaw.toLowerCase();
  const source   = 'coremark_coach_earlybird_s' + stage;

  // 1. Brevo list 13 (source of truth)
  try {
    const res = await fetch('https://api.brevo.com/v3/contacts', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', 'api-key': env.BREVO_API_KEY },
      body:    JSON.stringify({
        email: emailRaw,
        listIds: [BREVO_LIST_COACH],
        updateEnabled: true,
        attributes: { SOURCE: source, SUBJECT: 'coach', STAGE: stage },
      }),
    });
    if (!res.ok && res.status !== 204) {
      console.error('[coach-signup] Brevo error:', res.status, await res.text());
      return json(502, { error: 'Signup failed' });
    }
  } catch (err) {
    console.error('[coach-signup] Brevo exception:', err.message);
    return json(500, { error: 'Signup failed' });
  }

  // 2. Postgres: mark as early bird. First insert per (email, stage) is "new".
  let isNew = true;
  let position = null;
  let stored = false;
  try {
    await ensureSchema(env);
    const ins = await dbQuery(env,
      `INSERT INTO coach_signups (email, stage, campaign, source)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (email, stage) DO NOTHING
       RETURNING id`,
      [emailKey, Number(stage), campaign || null, source]);
    isNew = ins.rows.length > 0;
    const cnt = await dbQuery(env, `SELECT COUNT(DISTINCT email) AS n FROM coach_signups WHERE early_bird`);
    position = Number(cnt.rows[0] && cnt.rows[0].n) || null;
    stored = true;
  } catch (err) {
    console.error('[coach-signup] DB error:', err.message);
  }

  // 3. Notify Snehal + confirm to the family (only for a genuinely new signup)
  if (isNew) {
    const job = Promise.all([
      notifyOwner(env, { email: emailKey, stage, campaign, position })
        .catch(err => console.error('[coach-signup] notify error:', err.message)),
      sendConfirmation(env, { email: emailRaw, stage })
        .catch(err => console.error('[coach-signup] confirm error:', err.message)),
    ]);
    if (typeof waitUntil === 'function') waitUntil(job); else await job;
  }

  // `stored` only says whether the DB write worked (never whether the email was already known).
  return json(200, { ok: true, stored });
}
