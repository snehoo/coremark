// functions/_db.js
// Neon HTTP API — zero dependencies, works in Cloudflare Pages Functions.
// Requires DATABASE_URL env var set in Cloudflare Pages dashboard.
// (Hyperdrive connectionString is a proxy URL, not usable with Neon HTTP API)

function parseConnectionString(connStr) {
  const url = new URL(connStr
    .replace(/^postgres:\/\//, 'https://')
    .replace(/^postgresql:\/\//, 'https://')
  );
  return {
    host:     url.hostname,
    user:     decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
  };
}

export async function query(env, sql, params = []) {
  // Always use DATABASE_URL — direct Neon connection string
  // HYPERDRIVE.connectionString is an internal proxy, not compatible with HTTP API
  const connStr = env.DATABASE_URL;
  if (!connStr) throw new Error('DATABASE_URL env var not set');

  const { host, user, password } = parseConnectionString(connStr);

  const res = await fetch(`https://${host}/sql`, {
    method:  'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': 'Basic ' + btoa(`${user}:${password}`),
    },
    body: JSON.stringify({ query: sql, params }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Neon HTTP ${res.status}: ${err}`);
  }

  const data = await res.json();
  const fields = data.fields || [];
  const rows = (data.rows || []).map(row => {
    if (Array.isArray(row)) {
      const obj = {};
      fields.forEach((f, i) => { obj[f.name] = row[i]; });
      return obj;
    }
    return row;
  });

  return { rows, rowCount: data.rowCount ?? rows.length };
}

export async function sha256(text) {
  const buf = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(text.toLowerCase().trim())
  );
  return Array.from(new Uint8Array(buf))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

export function classifySource(referrer) {
  if (!referrer) return 'direct';
  const r = referrer.toLowerCase();
  if (r.includes('google') || r.includes('bing') || r.includes('duckduckgo')) return 'organic';
  if (r.includes('twitter') || r.includes('x.com') || r.includes('instagram') ||
      r.includes('linkedin') || r.includes('facebook') || r.includes('whatsapp')) return 'social';
  if (r.includes('mail') || r.includes('beehiiv') || r.includes('resend')) return 'email';
  return 'referral';
}
