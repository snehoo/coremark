// functions/_db.js
// Zero-dependency DB helper for Cloudflare Pages Functions.
// Uses Neon's HTTP API directly via fetch — no npm packages needed.
//
// Neon exposes a SQL-over-HTTP endpoint:
//   POST https://{host}/sql
//   Body: { query: "SELECT...", params: [...] }
//   Returns: { rows: [...], fields: [...] }
//
// Connection string format:
//   postgresql://user:password@host/dbname?sslmode=require
// We parse host, user, password, dbname from HYPERDRIVE.connectionString
// (or DATABASE_URL fallback) and call Neon's HTTP API.

/**
 * Parse a postgres connection string into its components.
 */
function parseConnectionString(connStr) {
  // postgresql://user:password@host/dbname?params
  const url = new URL(connStr.replace(/^postgres:\/\//, 'https://').replace(/^postgresql:\/\//, 'https://'));
  return {
    host:     url.hostname,
    user:     decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: url.pathname.replace(/^\//, ''),
  };
}

/**
 * Execute a SQL query via Neon HTTP API.
 *
 * Usage:
 *   const { rows } = await query(env, 'SELECT * FROM orders WHERE id = $1', [id]);
 *
 * @param {object} env       - Pages Function env (has HYPERDRIVE or DATABASE_URL)
 * @param {string} sql       - SQL string with $1, $2 placeholders
 * @param {Array}  params    - Parameter values
 * @returns {Promise<{rows: Array, rowCount: number}>}
 */
export async function query(env, sql, params = []) {
  const connStr = env.HYPERDRIVE?.connectionString || env.DATABASE_URL;
  if (!connStr) throw new Error('No database connection string in env');

  const { host, user, password, database } = parseConnectionString(connStr);

  // Neon HTTP API endpoint
  const endpoint = `https://${host}/sql`;

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': 'Basic ' + btoa(`${user}:${password}`),
      'Neon-Connection-String': connStr,
    },
    body: JSON.stringify({ query: sql, params }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Neon HTTP error ${res.status}: ${err}`);
  }

  const data = await res.json();

  // Neon HTTP returns { rows: [...], fields: [...] }
  // rows are arrays; convert to objects using fields
  const fields = data.fields || [];
  const rows = (data.rows || []).map(row => {
    if (Array.isArray(row)) {
      const obj = {};
      fields.forEach((f, i) => { obj[f.name] = row[i]; });
      return obj;
    }
    return row; // already an object
  });

  return { rows, rowCount: data.rowCount ?? rows.length };
}

/**
 * SHA-256 hash — used for buyer email hashing.
 */
export async function sha256(text) {
  const buf = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(text.toLowerCase().trim())
  );
  return Array.from(new Uint8Array(buf))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Classify referrer into traffic source.
 */
export function classifySource(referrer) {
  if (!referrer) return 'direct';
  const r = referrer.toLowerCase();
  if (r.includes('google') || r.includes('bing') || r.includes('duckduckgo')) return 'organic';
  if (r.includes('twitter') || r.includes('x.com') || r.includes('instagram') ||
      r.includes('linkedin') || r.includes('facebook') || r.includes('whatsapp')) return 'social';
  if (r.includes('mail') || r.includes('beehiiv') || r.includes('resend')) return 'email';
  return 'referral';
}
