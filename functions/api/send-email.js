// functions/api/send-email.js
// POST /api/send-email
//
// Called fire-and-forget by delivery.html after verify-payment succeeds.
// Sends the purchase confirmation + PDF download links via Resend.
//
// Body: {
//   to,           // buyer email
//   orderTitle,   // e.g. 'Integers' or 'Complete Mathematics Stage 8'
//   orderType,    // 'single' | 'fivepack' | 'subject' | 'stage'
//   fileUrls,     // array of R2 PDF URLs
//   orderId,      // internal UUID
// }

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS });
}

function friendlyFilename(url) {
  return url.split('/').pop()
    .replace('cm-', '')
    .replace(/-[a-f0-9]+\.(pdf|zip)$/, '.$1')
    .replace(/-/g, ' ')
    .replace(/\.(pdf|zip)$/, '')
    .replace(/\b\w/g, c => c.toUpperCase());
}

function buildEmailHtml({ to, orderTitle, orderType, fileUrls, orderId }) {
  const typeLabel = {
    single:  'Single Booster',
    fivepack:'5-Pack Bundle',
    subject: 'Subject Bundle',
    stage:   'Stage Bundle',
  }[orderType] || 'Booster';

  const isZipBundle = fileUrls.length === 1 && fileUrls[0].endsWith('.zip');

  const downloadLinks = isZipBundle
    ? `
      <tr>
        <td style="padding:8px 0;">
          <a href="${fileUrls[0]}"
             style="display:inline-flex;align-items:center;gap:10px;
                    background:#6E47C9;color:#ffffff;
                    padding:13px 22px;border-radius:10px;
                    font-family:'Plus Jakarta Sans',Arial,sans-serif;
                    font-size:15px;font-weight:700;text-decoration:none;
                    letter-spacing:-0.01em;">
            📦&nbsp; Download All Boosters (ZIP)
          </a>
        </td>
      </tr>`
    : fileUrls.map((url, i) => {
        const name = friendlyFilename(url);
        return `
          <tr>
            <td style="padding:8px 0;">
              <a href="${url}"
                 style="display:inline-flex;align-items:center;gap:10px;
                        background:#6E47C9;color:#ffffff;
                        padding:13px 22px;border-radius:10px;
                        font-family:'Plus Jakarta Sans',Arial,sans-serif;
                        font-size:15px;font-weight:700;text-decoration:none;
                        letter-spacing:-0.01em;">
                📄&nbsp; ${fileUrls.length > 1 ? (i + 1) + '. ' : ''}Download ${name}
              </a>
            </td>
          </tr>`;
      }).join('');

  const multiNote = isZipBundle
    ? `<p style="color:#7A6A94;font-size:14px;margin:0 0 20px;">
        Your order is ready as a single ZIP file — extract it to access every PDF.
       </p>`
    : fileUrls.length > 1
    ? `<p style="color:#7A6A94;font-size:14px;margin:0 0 20px;">
        Your order includes <strong>${fileUrls.length} PDFs</strong>. Download each one below.
       </p>`
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Your CoreMark Booster is Ready</title>
</head>
<body style="margin:0;padding:0;background:#FBF8F2;font-family:'Plus Jakarta Sans',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#FBF8F2;padding:40px 20px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

  <!-- HEADER -->
  <tr>
    <td style="background:#2A1B3D;border-radius:16px 16px 0 0;padding:32px 40px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td>
            <div style="display:inline-flex;align-items:center;gap:10px;">
              <span style="background:#2A1B3D;border:2px solid rgba(255,255,255,0.15);
                           border-radius:8px;padding:6px 10px;
                           font-weight:800;font-size:14px;color:#ffffff;
                           letter-spacing:-0.01em;">CM</span>
              <span style="font-weight:800;font-size:20px;color:#ffffff;letter-spacing:-0.02em;">
                Core<span style="color:#6E47C9;">Mark</span>
              </span>
            </div>
          </td>
          <td align="right">
            <span style="font-family:monospace;font-size:11px;letter-spacing:0.1em;
                         text-transform:uppercase;color:rgba(255,255,255,0.4);">
              ${typeLabel}
            </span>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- HERO -->
  <tr>
    <td style="background:#2A1B3D;padding:0 40px 36px;">
      <p style="font-family:Georgia,serif;font-size:34px;font-style:italic;
                color:#FAE588;margin:0 0 10px;line-height:1.2;letter-spacing:-0.02em;">
        Your Booster is Ready
      </p>
      <p style="color:rgba(255,255,255,0.6);font-size:15px;margin:0;line-height:1.6;">
        ${orderTitle} · Cambridge Lower Secondary
      </p>
    </td>
  </tr>

  <!-- BODY -->
  <tr>
    <td style="background:#ffffff;border-left:1px solid #EAE3F5;border-right:1px solid #EAE3F5;
               padding:36px 40px;">

      <p style="color:#2A1B3D;font-size:16px;margin:0 0 24px;line-height:1.6;">
        Hi there — your PDF booster is ready to download. Click the button below to get started.
      </p>

      ${multiNote}

      <!-- DOWNLOAD BUTTONS -->
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
        ${downloadLinks}
      </table>

      <!-- DIVIDER -->
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
        <tr><td style="border-top:1px solid #EAE3F5;"></td></tr>
      </table>

      <!-- HOW TO USE -->
      <p style="font-family:monospace;font-size:11px;letter-spacing:0.12em;
                text-transform:uppercase;color:#7A6A94;margin:0 0 16px;">
        How to use your booster
      </p>

      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #F0EBF8;vertical-align:top;width:28px;">
            <span style="display:inline-block;width:24px;height:24px;border-radius:50%;
                         background:#F0EBF8;border:1px solid rgba(110,71,201,0.2);
                         font-size:11px;font-weight:800;color:#6E47C9;
                         text-align:center;line-height:22px;">1</span>
          </td>
          <td style="padding:10px 0 10px 12px;border-bottom:1px solid #F0EBF8;">
            <strong style="color:#2A1B3D;font-size:14px;">Read the Cheat Sheet first</strong><br>
            <span style="color:#7A6A94;font-size:13px;line-height:1.5;">
              Page 2 has all the key facts and formulas. Spend 5 minutes here before attempting questions.
            </span>
          </td>
        </tr>
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #F0EBF8;vertical-align:top;width:28px;">
            <span style="display:inline-block;width:24px;height:24px;border-radius:50%;
                         background:#F0EBF8;border:1px solid rgba(110,71,201,0.2);
                         font-size:11px;font-weight:800;color:#6E47C9;
                         text-align:center;line-height:22px;">2</span>
          </td>
          <td style="padding:10px 0 10px 12px;border-bottom:1px solid #F0EBF8;">
            <strong style="color:#2A1B3D;font-size:14px;">Attempt all 20 questions</strong><br>
            <span style="color:#7A6A94;font-size:13px;line-height:1.5;">
              Work through Foundation → Standard → Stretch. Don't skip — each band builds on the last.
            </span>
          </td>
        </tr>
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #F0EBF8;vertical-align:top;width:28px;">
            <span style="display:inline-block;width:24px;height:24px;border-radius:50%;
                         background:#F0EBF8;border:1px solid rgba(110,71,201,0.2);
                         font-size:11px;font-weight:800;color:#6E47C9;
                         text-align:center;line-height:22px;">3</span>
          </td>
          <td style="padding:10px 0 10px 12px;border-bottom:1px solid #F0EBF8;">
            <strong style="color:#2A1B3D;font-size:14px;">Check with the worked solutions</strong><br>
            <span style="color:#7A6A94;font-size:13px;line-height:1.5;">
              Read the error flags — they show exactly what Cambridge examiners look for.
            </span>
          </td>
        </tr>
        <tr>
          <td style="padding:10px 0;vertical-align:top;width:28px;">
            <span style="display:inline-block;width:24px;height:24px;border-radius:50%;
                         background:#F0EBF8;border:1px solid rgba(110,71,201,0.2);
                         font-size:11px;font-weight:800;color:#6E47C9;
                         text-align:center;line-height:22px;">4</span>
          </td>
          <td style="padding:10px 0 10px 12px;">
            <strong style="color:#2A1B3D;font-size:14px;">Use the Parent and Tutor Guide</strong><br>
            <span style="color:#7A6A94;font-size:13px;line-height:1.5;">
              The last pages have score bands, study tips, and guidance on what to focus on next.
            </span>
          </td>
        </tr>
      </table>

      <!-- GUARANTEE -->
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:28px;">
        <tr>
          <td style="background:rgba(5,150,105,0.08);border:1px solid rgba(5,150,105,0.2);
                     border-radius:10px;padding:14px 18px;">
            <span style="color:#065f46;font-size:13px;font-weight:600;">
              🛡️ 7-day money-back guarantee.
            </span>
            <span style="color:#065f46;font-size:13px;">
              Not happy? Email <a href="mailto:info@coremark.study"
              style="color:#065f46;">info@coremark.study</a> and we'll refund you in full.
            </span>
          </td>
        </tr>
      </table>

    </td>
  </tr>

  <!-- FOOTER -->
  <tr>
    <td style="background:#F0EBF8;border-radius:0 0 16px 16px;
               border:1px solid #EAE3F5;border-top:none;
               padding:24px 40px;">
      <p style="color:#7A6A94;font-size:12px;margin:0 0 6px;line-height:1.6;">
        © 2025 CoreMark · Cambridge Lower Secondary Practice Boosters<br>
        Order ID: <span style="font-family:monospace;">${orderId}</span>
      </p>
      <p style="color:#7A6A94;font-size:12px;margin:0;">
        <a href="https://coremark.study" style="color:#6E47C9;text-decoration:none;">coremark.study</a>
        &nbsp;·&nbsp;
        <a href="mailto:info@coremark.study" style="color:#6E47C9;text-decoration:none;">info@coremark.study</a>
        &nbsp;·&nbsp;
        <a href="https://coremark.study/legal/refund.html" style="color:#7A6A94;text-decoration:none;">Refund Policy</a>
      </p>
    </td>
  </tr>

</table>
</td></tr>
</table>
</body>
</html>`;
}

export async function onRequestPost({ request, env }) {
  let body;
  try {
    body = await request.json();
  } catch {
    return new Response('Bad JSON', { status: 400, headers: CORS });
  }

  const { to, orderTitle, orderType, fileUrls, orderId } = body;

  if (!to || !fileUrls || fileUrls.length === 0) {
    return new Response(
      JSON.stringify({ error: 'Missing to or fileUrls' }),
      { status: 400, headers: { 'Content-Type': 'application/json', ...CORS } }
    );
  }

  const html = buildEmailHtml({ to, orderTitle, orderType, fileUrls, orderId });

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method:  'POST',
      headers: {
        'Authorization': `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type':  'application/json',
      },
      body: JSON.stringify({
        from:    'CoreMark <info@coremark.study>',
        to:      [to],
        subject: `📄 Your CoreMark Booster is Ready — ${orderTitle}`,
        html,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('[send-email] Resend error:', err);
      return new Response(
        JSON.stringify({ error: 'Email send failed', detail: err }),
        { status: 503, headers: { 'Content-Type': 'application/json', ...CORS } }
      );
    }

    const data = await res.json();
    return new Response(
      JSON.stringify({ ok: true, id: data.id }),
      { status: 200, headers: { 'Content-Type': 'application/json', ...CORS } }
    );

  } catch (err) {
    console.error('[send-email]', err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 422, headers: { 'Content-Type': 'application/json', ...CORS } }
    );
  }
}
