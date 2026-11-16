// functions/_middleware.js
// The whole repo is the Pages output folder, so internal notes, scripts and
// logs would otherwise be public at coremark.study/<file>. Hide them.
const HIDDEN = [
  /\.(md|py|log|jsonc)$/i,                 // notes, scripts, logs, wrangler config
  /^\/(run-state|body)\.json$/i,
  /^\/(experiments|\.claude|\.git)(\/|$)/i,
  /^\/test-[^/]+\.js$/i,
  /^\/index-old\.html$/i,
];

export async function onRequest({ request, next }) {
  const path = new URL(request.url).pathname;
  if (HIDDEN.some(re => re.test(path))) {
    return new Response('Not found', { status: 404, headers: { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex' } });
  }
  return next();
}
