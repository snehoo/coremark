// Shared admin-endpoint helpers (underscore prefix = not routed by Pages).

// Admin endpoints are only called from the same-origin admin dashboard,
// so CORS is locked to the production origin instead of '*'.
export const ADMIN_ORIGIN = 'https://coremark.study';

// Constant-time check of the x-metrics-secret header. Both sides are hashed
// first so the compared buffers are always equal length (timingSafeEqual
// throws on length mismatch, and early-exit would leak the secret length).
export async function secretOk(request, env) {
  const given = request.headers.get('x-metrics-secret') || '';
  const real  = env.METRICS_SECRET || '';
  if (!real) return false;
  const enc = new TextEncoder();
  const [a, b] = await Promise.all([
    crypto.subtle.digest('SHA-256', enc.encode(given)),
    crypto.subtle.digest('SHA-256', enc.encode(real)),
  ]);
  if (typeof crypto.subtle.timingSafeEqual === 'function') return crypto.subtle.timingSafeEqual(a, b);
  const x = new Uint8Array(a), y = new Uint8Array(b);
  let diff = 0;
  for (let i = 0; i < x.length; i++) diff |= x[i] ^ y[i];
  return diff === 0;
}
