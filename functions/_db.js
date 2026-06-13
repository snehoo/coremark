// functions/_db.js
// Shared helper — import this in every Pages Function that needs DB access.
// Identical pattern to NovaKit; bindings renamed to CoreMark conventions.

import pg from 'pg';
const { Client } = pg;

/**
 * Returns a connected pg Client via Cloudflare Hyperdrive.
 * ALWAYS call client.end() in a finally block — never leave connections open.
 *
 * @param {object} env  The Pages Function env object (has env.HYPERDRIVE)
 * @returns {Promise<Client>}
 */
export async function getClient(env) {
  const client = new Client({
    connectionString: env.HYPERDRIVE.connectionString,
  });
  await client.connect();
  return client;
}

/**
 * Hash a string (email) to a hex SHA-256.
 * We never store raw buyer emails in the orders table — only the hash.
 * The raw email is stored separately for delivery/email sends and
 * cleared after the email sequence completes.
 *
 * @param {string} text  Typically buyer email — lowercased and trimmed before hashing
 * @returns {Promise<string>}  64-char hex string
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
 * Classify a referrer URL into a traffic source bucket.
 * Used by the tracker to populate orders.source.
 *
 * @param {string|null} referrer
 * @returns {'direct'|'organic'|'social'|'email'|'referral'}
 */
export function classifySource(referrer) {
  if (!referrer) return 'direct';
  const r = referrer.toLowerCase();
  if (r.includes('google') || r.includes('bing') || r.includes('duckduckgo'))
    return 'organic';
  if (
    r.includes('twitter') || r.includes('x.com') ||
    r.includes('instagram') || r.includes('linkedin') ||
    r.includes('facebook') || r.includes('youtube') ||
    r.includes('whatsapp')
  ) return 'social';
  if (
    r.includes('mail') || r.includes('substack') ||
    r.includes('beehiiv') || r.includes('resend')
  ) return 'email';
  return 'referral';
}
