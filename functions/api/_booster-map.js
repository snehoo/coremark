// functions/api/_booster-map.js
// Booster slugs on sale. The R2 file names are NOT stored here: this repo is
// public, and the names are what keep the PDFs private. Each file lives at
// booster/cm-<slug>-<16 hex>.pdf where the hex part is
// HMAC-SHA256(BOOSTER_KEY_SECRET, slug). The secret is a Cloudflare Pages
// secret (and ~/.coremark-booster-secret on the owner's Mac for uploads).

export const BOOSTER_SLUGS = [
  'math-n1-integers-s7',
  'math-n2-place-value-rounding-s7',
  'math-n3-decimals-s7',
  'math-n4-fractions-s7',
  'math-a1-expressions-formulae-equations-s7',
  'math-g1-angles-constructions-s7',
  'math-g2-shapes-symmetry-s7',
  'math-s1-collecting-data-s7',
  'math-n1-integers-s8',
  'math-n2-place-value-rounding-s8',
  'math-n3-decimals-s8',
  'math-n4-fractions-s8',
  'math-n5-percentages-s8',
  'math-n6-ratio-proportion-s8',
  'math-a1-expressions-formulae-equations-s8',
  'math-a2-sequences-functions-s8',
  'math-a3-graphs-s8',
  'math-g1-angles-constructions-s8',
  'math-g2-shapes-symmetry-s8',
  'math-g3-position-transformation-s8',
  'math-g4-distance-area-volume-s8',
  'math-s1-collecting-data-s8',
  'math-s2-probability-s8',
  'math-s3-interpreting-discussing-results-s8',
  'math-n1-number-calculation-s9',
  'math-n2-decimals-percentages-rounding-s9',
  'math-n3-fractions-s9',
  'math-n4-ratio-proportion-s9',
  'math-a1-expressions-formulae-s9',
  'math-a2-equations-inequalities-s9',
  'math-a3-sequences-functions-s9',
  'math-a4-graphs-s9',
  'math-g1-angles-s9',
  'math-g2-shapes-measurements-s9',
  'math-g3-position-transformation-s9',
  'math-g4-volume-surface-area-symmetry-s9',
  'math-s1-statistical-investigations-s9',
  'math-s2-probability-s9',
  'math-s3-interpreting-discussing-results-s9',
  'sci-b1-cells-s7',
  'sci-b2-grouping-identifying-organisms-s7',
  'sci-b3-microorganisms-environment-s7',
  'sci-c1-materials-structure-s7',
  'sci-c2-properties-materials-s7',
  'sci-c3-changes-materials-s7',
  'sci-p1-forces-energy-s7',
  'sci-p2-earth-physics-s7',
  'sci-p3-electricity-s7',
  'sci-b1-respiration-s8',
  'sci-b2-ecosystems-s8',
  'sci-b3-diet-growth-s8',
  'sci-c1-properties-materials-s8',
  'sci-c2-materials-structure-s8',
  'sci-c3-chemical-reactions-s8',
  'sci-p1-forces-energy-s8',
  'sci-p2-light-s8',
  'sci-p3-magnetism-s8',
  'sci-b1-photosynthesis-carbon-cycle-s9',
  'sci-b2-maintaining-life-s9',
  'sci-b3-genes-inheritance-s9',
  'sci-c1-properties-materials-s9',
  'sci-c2-reactivity-s9',
  'sci-c3-rates-reaction-s9',
  'sci-p1-forces-energy-s9',
  'sci-p2-electricity-s9',
  'sci-p3-sound-space-s9',
  'comp-p1-flowcharts-selection-s7',
  'comp-p2-text-programming-python-s7',
  'comp-p3-software-dev-physical-computing-s7',
  'comp-d1-spreadsheets-modelling-s7',
  'comp-d2-databases-data-collection-s7',
  'comp-n1-networks-websites-data-transmission-s7',
  'comp-s1-computer-systems-logic-ai-s7',
  'comp-p1-pseudocode-selection-s8',
  'comp-p2-programming-data-s8',
  'comp-p3-software-dev-physical-computing-s8',
  'comp-d1-modelling-databases-s8',
  'comp-n1-networks-data-transmission-security-s8',
  'comp-s1-computer-architecture-software-data-s8',
  'comp-s2-logic-gates-truth-tables-ai-s8',
  'comp-p1-pseudocode-iteration-algorithms-s9',
  'comp-p2-loops-data-structures-algorithms-s9',
  'comp-p3-searching-testing-physical-computing-s9',
  'comp-d1-spreadsheets-systems-databases-s9',
  'comp-n1-topologies-transmission-network-security-s9',
  'comp-s1-computer-design-architecture-s9',
  'comp-s2-software-data-representation-logic-s9',
  'comp-s3-ai-computerisation-s9',
];

const SLUG_SET = new Set(BOOSTER_SLUGS);
export function isBooster(slug) { return SLUG_SET.has(slug); }

async function hmacHex(secret, msg) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(msg));
  return Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('');
}

// R2 key for one booster PDF. Falls back to the newest object with the slug's
// prefix if the secret is missing, so delivery never breaks.
export async function boosterKey(env, slug) {
  if (!SLUG_SET.has(slug)) return null;
  if (env.BOOSTER_KEY_SECRET) {
    return `booster/cm-${slug}-${(await hmacHex(env.BOOSTER_KEY_SECRET, slug)).slice(0, 16)}.pdf`;
  }
  try {
    const l = await env.R2_BUCKET.list({ prefix: `booster/cm-${slug}-` });
    const obj = (l.objects || []).sort((a, b) => new Date(b.uploaded) - new Date(a.uploaded))[0];
    return obj ? obj.key : null;
  } catch { return null; }
}

export async function boosterUrls(env, slugs) {
  const keys = await Promise.all(slugs.map(s => boosterKey(env, s)));
  return keys.filter(Boolean).map(k => `https://assets.coremark.study/${k}`);
}
