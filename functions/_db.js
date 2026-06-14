// functions/_db.js
// Shared DB helper using @neondatabase/serverless
// Works in Cloudflare Pages Functions (no native TCP needed — uses WebSockets)

import { neon } from '@neondatabase/serverless';

/**
 * Returns a Neon SQL query function.
 * Usage: const sql = getSQL(env);
 *        const { rows } = await sql`SELECT * FROM orders WHERE id = ${id}`;
 *
 * With Hyperdrive: uses HYPERDRIVE.connectionString for connection pooling.
 * Falls back to DATABASE_URL env var if Hyperdrive not bound.
 *
 * @param {object} env  Pages Function env object
 * @returns neon tagged-template SQL function
 */
export function getSQL(env) {
  const connectionString = env.HYPERDRIVE?.connectionString || env.DATABASE_URL;
  if (!connectionString) throw new Error('No database connection string found in env');
  return neon(connectionString);
}

/**
 * SHA-256 hash — used for buyer email hashing.
 * @param {string} text
 * @returns {Promise<string>} 64-char hex
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
 * @param {string|null} referrer
 * @returns {'direct'|'organic'|'social'|'email'|'referral'}
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
