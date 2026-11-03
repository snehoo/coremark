// functions/api/_coach.js
// CoreMark Coach: one markdown agent file per stage, sold through the same
// checkout -> verify-payment -> send-email pipeline as the PDF boosters.
//
// The file lives in R2 only, under coach/cm-coach-s<stage>-<random hash>.md.
// The hash is NOT in this repo (the repo is public); it is looked up by prefix
// at delivery time. A stage is on sale only while its file exists in R2, so
// launching a stage = uploading its file (Tutor/release/release.sh).

export const COACH_SLUGS = { 'coach-s7': 7, 'coach-s8': 8, 'coach-s9': 9 };

export const COACH_PRICE_PAISE = 499900;  // ₹4,999, every stage, INR only

export function coachStage(slug) {
  return COACH_SLUGS[slug] || null;
}

export function coachTitle(stage) {
  return `CoreMark Coach · Stage ${stage}`;
}

export async function coachFileKey(env, slug) {
  if (!coachStage(slug) || !env.R2_BUCKET) return null;
  const l = await env.R2_BUCKET.list({ prefix: `coach/cm-${slug}-` });
  const obj = (l.objects || []).filter(o => o.key.endsWith('.md'))
    .sort((a, b) => new Date(b.uploaded) - new Date(a.uploaded))[0];
  return obj ? obj.key : null;
}

export async function coachFileUrl(env, slug) {
  const key = await coachFileKey(env, slug);
  return key ? `https://assets.coremark.study/${key}` : null;
}

// Which stages are on sale right now (their file is in R2).
export async function coachAvailability(env) {
  const out = {};
  for (const [slug, stage] of Object.entries(COACH_SLUGS)) {
    try { out[stage] = !!(await coachFileKey(env, slug)); } catch { out[stage] = false; }
  }
  return out;
}
