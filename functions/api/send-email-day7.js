// functions/api/send-email-day7.js
// POST /api/send-email-day7  (called by email-sequence-cron.js)
//
// Sent ~7 days after purchase.
// Goal: upsell to next stage bundle OR all-subjects bundle.
// Tone: warm, helpful — not pushy.
//
// Body: {
//   to, buyerName, orderTitle, orderType,
//   subject, stage, orderId
// }

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS });
}

function subjectLabel(s) {
  return { math:'Mathematics', science:'Science', computing:'Computing' }[s] || 'Subject';
}

function subjectSlug(s) {
  return { math:'math', science:'sci', computing:'comp' }[s] || s;
}

// Build upsell options based on what they bought
function buildUpsells(orderType, subject, stage) {
  const upsells = [];

  // If they bought single/5pack → suggest full subject bundle
  if ((orderType === 'single' || orderType === 'fivepack') && subject && stage) {
    upsells.push({
      label:    `Complete ${subjectLabel(subject)} Stage ${stage}`,
      sub:      `All boosters for Stage ${stage} ${subjectLabel(subject)} — every topic covered.`,
      price:    '₹1,299',
      slug:     `all-${subjectSlug(subject)}-s${stage}`,
      type:     'subject',
      priority: 1,
    });
  }

  // If they bought subject bundle → suggest all-subjects for same stage
  if ((orderType === 'subject' || orderType === 'single' || orderType === 'fivepack') && stage) {
    upsells.push({
      label:    `Everything for Stage ${stage}`,
      sub:      `Maths, Science and Computing — all subjects, one stage.`,
      price:    '₹2,499',
      slug:     `all-s${stage}`,
      type:     'stage',
      priority: 2,
    });
  }

  // If they bought stage bundle → suggest next stage
  if (orderType === 'stage' && stage && stage < 9) {
    upsells.push({
      label:    `Start Stage ${stage + 1} early`,
      sub:      `Get ahead — all Stage ${stage + 1} boosters across Maths, Science and Computing.`,
      price:    '₹2,499',
      slug:     `all-s${stage + 1}`,
      type:     'stage',
      priority: 1,
    });
  }

  return upsells.sort((a, b) => a.priority - b.priority).slice(0, 2);
}

function buildDay7Html({ to, buyerName, orderTitle, orderType, subject, stage, upsells }) {
  const greeting = buyerName ? `Hi ${buyerName.split(' ')[0]}` : 'Hi there';

  const upsellCards = upsells.map(u => `
    <tr>
      <td style="padding-bottom:12px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="background:#F0EBF8;border:1.5px solid #DDD5ED;
                       border-radius:12px;padding:20px 24px;">
              <p style="font-family:monospace;font-size:10px;letter-spacing:0.12em;
                        text-transform:uppercase;color:#6E47C9;margin:0 0 6px;">
                ${u.type === 'stage' ? 'Stage Bundle' : 'Subject Bundle'}
              </p>
              <p style="color:#2A1B3D;font-size:16px;font-weight:700;
                        margin:0 0 4px;letter-spacing:-0.02em;">
                ${u.label}
              </p>
              <p style="color:#7A6A94;font-size:13px;margin:0 0 16px;line-height:1.5;">
                ${u.sub}
              </p>
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding-right:14px;">
                    <span style="font-size:22px;font-weight:800;color:#2A1B3D;
                                 letter-spacing:-0.03em;">${u.price}</span>
                    <span style="font-size:13px;color:#7A6A94;"> one-time</span>
                  </td>
                  <td>
                    <a href="https://coremark.study/checkout.html?type=${u.type}&slug=${u.slug}"
                       style="display:inline-block;padding:11px 20px;background:#6E47C9;
                              color:#ffffff;border-radius:8px;font-size:14px;font-weight:700;
                              text-decoration:none;letter-spacing:-0.01em;">
                      Get Bundle →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>`).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>What's next for Stage ${stage} ${subjectLabel(subject)}?</title>
</head>
<body style="margin:0;padding:0;background:#FBF8F2;font-family:'Plus Jakarta Sans',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#FBF8F2;padding:40px 20px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

  <!-- HEADER -->
  <tr>
    <td style="background:#2A1B3D;border-radius:16px 16px 0 0;padding:28px 40px;">
      <table width="100%" cellpadding="0" cellspacing="0"><tr>
        <td>
          <img src="https://coremark.study/assets/logo.jpg" alt="CoreMark" height="26"
               style="display:block;border:0;outline:none;text-decoration:none;">
        </td>
        <td align="right">
          <span style="font-family:monospace;font-size:11px;letter-spacing:0.1em;
                       text-transform:uppercase;color:rgba(255,255,255,0.4);">
            Week 1 Check-In
          </span>
        </td>
      </tr></table>
    </td>
  </tr>

  <!-- BODY -->
  <tr>
    <td style="background:#ffffff;border-left:1px solid #EAE3F5;
               border-right:1px solid #EAE3F5;padding:36px 40px;">

      <p style="color:#2A1B3D;font-size:16px;margin:0 0 16px;line-height:1.6;">
        ${greeting} —
      </p>
      <p style="color:#2A1B3D;font-size:16px;margin:0 0 16px;line-height:1.6;">
        It's been a week since you picked up ${
          orderType === 'subject' || orderType === 'stage'
            ? `the <strong>${orderTitle}</strong> bundle`
            : orderType === 'fivepack'
            ? `the <strong>${orderTitle}</strong> 5-pack`
            : `the <strong>${orderTitle}</strong> booster`
        }.
        Hopefully your child has worked through it and is feeling more confident about
        ${subject ? subjectLabel(subject) : 'the topic'}.
      </p>
      <p style="color:#2A1B3D;font-size:16px;margin:0 0 28px;line-height:1.6;">
        If they're ready to keep the momentum going, here's what we'd suggest next:
      </p>

      <!-- UPSELL CARDS -->
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
        ${upsellCards}
      </table>

      <!-- DIVIDER -->
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
        <tr><td style="border-top:1px solid #EAE3F5;"></td></tr>
      </table>

      <!-- BROWSE CTA -->
      <p style="color:#7A6A94;font-size:14px;margin:0 0 16px;line-height:1.6;">
        Not quite ready? Browse the full catalogue and pick the next weak topic when the time is right.
      </p>
      <a href="https://coremark.study/${subject === 'math' ? 'math' : subject === 'science' ? 'science' : subject === 'computing' ? 'computing' : ''}.html"
         style="display:inline-block;padding:12px 22px;background:#F0EBF8;
                color:#6E47C9;border-radius:8px;font-size:14px;font-weight:700;
                text-decoration:none;border:1.5px solid #DDD5ED;">
        Browse ${subject ? subjectLabel(subject) : 'all'} boosters →
      </a>

    </td>
  </tr>

  <!-- FOOTER -->
  <tr>
    <td style="background:#F0EBF8;border-radius:0 0 16px 16px;
               border:1px solid #EAE3F5;border-top:none;padding:20px 40px;">
      <p style="color:#7A6A94;font-size:12px;margin:0;line-height:1.6;">
        © 2025 CoreMark ·
        <a href="https://coremark.study" style="color:#6E47C9;text-decoration:none;">coremark.study</a>
        &nbsp;·&nbsp;
        <a href="mailto:info@coremark.study" style="color:#6E47C9;text-decoration:none;">info@coremark.study</a>
        &nbsp;·&nbsp;
        You're receiving this because you purchased a CoreMark booster.
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

  const { to, buyerName, orderTitle, orderType, subject, stage, orderId } = body;

  if (!to || !orderId) {
    return new Response(
      JSON.stringify({ error: 'Missing to or orderId' }),
      { status: 400, headers: { 'Content-Type': 'application/json', ...CORS } }
    );
  }

  const upsells = buildUpsells(orderType, subject, stage);

  const html = buildDay7Html({
    to, buyerName, orderTitle, orderType,
    subject: subject || 'math',
    stage:   stage   || 8,
    upsells,
  });

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type':  'application/json',
      },
      body: JSON.stringify({
        from:    'CoreMark <info@coremark.study>',
        to:      [to],
        subject: `What's next for Stage ${stage || 8} ${subjectLabel(subject)}?`,
        html,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('[send-email-day7] Resend error:', err);
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
    console.error('[send-email-day7]', err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...CORS } }
    );
  }
}
