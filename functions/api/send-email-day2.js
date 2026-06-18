// functions/api/send-email-day2.js
// POST /api/send-email-day2  (called by email-sequence-cron.js)
//
// Sent ~48 hours after purchase.
// Contains: subject-specific study tip + feedback CTA + upsell nudge.
//
// Body: {
//   to, buyerName, orderTitle, orderType,
//   subject, stage, orderId, itemSlugs
// }

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS });
}

// ── Study tips library ────────────────────────────────────
// One tip per subject — rotated by stage so it feels personal
const TIPS = {
  math: {
    7: {
      heading: 'The #1 mistake in Stage 7 Maths',
      body:    'Students lose the most marks on integer operations by forgetting sign rules when multiplying negatives. A quick check: negative × negative = positive, always. Make your child write this rule at the top of every page until it\'s automatic.',
    },
    8: {
      heading: 'Where Stage 8 marks are really lost',
      body:    'The biggest mark-loss in Stage 8 Maths is not showing working. Cambridge awards method marks even for a wrong final answer — but only if the steps are written out. Drill this habit: every step on a new line, every operation shown.',
    },
    9: {
      heading: 'Stage 9 Maths: the silent mark-stealer',
      body:    'Simultaneous equations trip up more Stage 9 students than any other topic. The fix: always label equations (1) and (2), always show the elimination step in full, and always substitute back to verify. Three habits, many marks saved.',
    },
  },
  science: {
    7: {
      heading: 'The word Cambridge examiners love to see',
      body:    '"Because" — that single word is the difference between a 1-mark answer and a 2-mark answer in Stage 7 Science. Train your child to never stop at a fact. State it, then explain why. "Plants need light because…" not just "Plants need light."',
    },
    8: {
      heading: 'Stage 8 Science: the command word trap',
      body:    '"Describe" and "Explain" are not the same. Describe = say what happens. Explain = say why it happens. Stage 8 examiners see hundreds of papers where students explain when asked to describe, and lose marks for adding unrequested content. Read the command word first, always.',
    },
    9: {
      heading: 'How to pick up evaluation marks in Stage 9',
      body:    'Evaluation questions ("Suggest how this experiment could be improved") are worth 2–3 marks and most students only get 1. The formula: identify the limitation → explain why it\'s a problem → suggest a specific improvement. Three sentences, full marks.',
    },
  },
  computing: {
    7: {
      heading: 'The flowchart error Cambridge sees every year',
      body:    'Stage 7 students consistently draw diamonds (decisions) with only one exit arrow instead of two — one for Yes, one for No. This single error loses marks on every flowchart question. Check every diamond: it must have exactly two labelled exits.',
    },
    8: {
      heading: 'Pseudocode: the formatting marks are free',
      body:    'In Stage 8 Computing, indentation in pseudocode is worth marks. An IF block with no indentation inside, or a loop with the body at the same level as the loop header, will drop a mark every time. These are literally free marks — just press Tab.',
    },
    9: {
      heading: 'Algorithm trace tables: where marks are left on the table',
      body:    'Stage 9 students often skip completing trace tables fully — they get the final output right but leave intermediate rows blank. Cambridge marks every row. Complete every cell, even if the value hasn\'t changed. A blank cell looks like a skipped step.',
    },
  },
};

function getTip(subject, stage) {
  const subj = TIPS[subject] || TIPS['math'];
  return subj[stage] || subj[8] || Object.values(subj)[0];
}

// HMAC token for feedback link (ties response to this order)
async function makeFeedbackToken(env, orderId) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(env.FEEDBACK_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(orderId));
  return Array.from(new Uint8Array(sig))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

function subjectLabel(s) {
  return { math:'Mathematics', science:'Science', computing:'Computing' }[s] || 'Subject';
}

function buildDay2Html({ to, buyerName, orderTitle, orderType, subject, stage, tip, feedbackUrl, upsellUrl, upsellLabel }) {
  const greeting = buyerName ? `Hi ${buyerName.split(' ')[0]}` : 'Hi there';

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Quick tip for ${orderTitle}</title>
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
          <img src="https://assets.coremark.study/logo.jpg" alt="CoreMark" height="26"
               style="display:block;border:0;outline:none;text-decoration:none;">
        </td>
        <td align="right">
          <span style="font-family:monospace;font-size:11px;letter-spacing:0.1em;
                       text-transform:uppercase;color:rgba(255,255,255,0.4);">
            Study Tip
          </span>
        </td>
      </tr></table>
    </td>
  </tr>

  <!-- BODY -->
  <tr>
    <td style="background:#ffffff;border-left:1px solid #EAE3F5;
               border-right:1px solid #EAE3F5;padding:36px 40px;">

      <p style="color:#2A1B3D;font-size:16px;margin:0 0 20px;line-height:1.6;">
        ${greeting} —
      </p>
      <p style="color:#2A1B3D;font-size:16px;margin:0 0 28px;line-height:1.6;">
        Hope your child has had a chance to work through ${
          orderType === 'subject' || orderType === 'stage'
            ? `the <strong>${orderTitle}</strong> bundle`
            : orderType === 'fivepack'
            ? `the <strong>${orderTitle}</strong> 5-pack`
            : `the <strong>${orderTitle}</strong> booster`
        }.
        Here's something we see come up time and again for ${subjectLabel(subject)} Stage ${stage}:
      </p>

      <!-- TIP CARD -->
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
        <tr>
          <td style="background:#F0EBF8;border-left:4px solid #6E47C9;
                     border-radius:0 10px 10px 0;padding:20px 24px;">
            <p style="font-family:monospace;font-size:11px;letter-spacing:0.12em;
                      text-transform:uppercase;color:#6E47C9;margin:0 0 10px;">
              Examiner tip · ${subjectLabel(subject)} Stage ${stage}
            </p>
            <p style="color:#2A1B3D;font-size:16px;font-weight:700;margin:0 0 10px;
                      letter-spacing:-0.01em;">
              ${tip.heading}
            </p>
            <p style="color:#4A3760;font-size:14px;margin:0;line-height:1.65;">
              ${tip.body}
            </p>
          </td>
        </tr>
      </table>

      <!-- DIVIDER -->
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
        <tr><td style="border-top:1px solid #EAE3F5;"></td></tr>
      </table>

      <!-- FEEDBACK -->
      <p style="color:#2A1B3D;font-size:15px;font-weight:700;margin:0 0 8px;">
        How's it going?
      </p>
      <p style="color:#7A6A94;font-size:14px;margin:0 0 20px;line-height:1.6;">
        We'd love to know if the booster is hitting the mark. One tap is all it takes:
      </p>
      <table cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
        <tr>
          <td style="padding-right:8px;">
            <a href="${feedbackUrl}&rating=5"
               style="display:inline-block;padding:11px 18px;background:#F0EBF8;
                      color:#2A1B3D;border-radius:8px;font-size:20px;text-decoration:none;">😊</a>
          </td>
          <td style="padding-right:8px;">
            <a href="${feedbackUrl}&rating=3"
               style="display:inline-block;padding:11px 18px;background:#F0EBF8;
                      color:#2A1B3D;border-radius:8px;font-size:20px;text-decoration:none;">😐</a>
          </td>
          <td>
            <a href="${feedbackUrl}&rating=1"
               style="display:inline-block;padding:11px 18px;background:#F0EBF8;
                      color:#2A1B3D;border-radius:8px;font-size:20px;text-decoration:none;">😞</a>
          </td>
        </tr>
      </table>

      <!-- UPSELL (only if not already full bundle) -->
      ${upsellUrl ? `
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="background:#2A1B3D;border-radius:12px;padding:24px 28px;">
            <p style="font-family:monospace;font-size:10px;letter-spacing:0.14em;
                      text-transform:uppercase;color:#F4C73E;margin:0 0 8px;">Complete the set</p>
            <p style="color:#ffffff;font-size:16px;font-weight:700;
                      margin:0 0 8px;letter-spacing:-0.02em;">
              ${upsellLabel}
            </p>
            <p style="color:rgba(255,255,255,0.55);font-size:13px;margin:0 0 18px;line-height:1.5;">
              Cover every ${subjectLabel(subject)} topic for Stage ${stage}. All boosters, one price.
            </p>
            <a href="${upsellUrl}"
               style="display:inline-block;padding:12px 22px;background:#F4C73E;
                      color:#2A1B3D;border-radius:8px;font-size:14px;font-weight:700;
                      text-decoration:none;letter-spacing:-0.01em;">
              Get the Full Bundle — ₹1,299 →
            </a>
          </td>
        </tr>
      </table>
      ` : ''}

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

  const { to, buyerName, orderTitle, orderType, subject, stage, orderId, itemSlugs } = body;

  if (!to || !orderId) {
    return new Response(
      JSON.stringify({ error: 'Missing to or orderId' }),
      { status: 400, headers: { 'Content-Type': 'application/json', ...CORS } }
    );
  }

  const tip           = getTip(subject, stage);
  const feedbackToken = await makeFeedbackToken(env, orderId);
  const feedbackUrl   = `https://coremark.study/api/feedback?order_id=${orderId}&token=${feedbackToken}`;

  // Only show upsell if they bought a single or 5-pack (not already a full bundle)
  const showUpsell = orderType === 'single' || orderType === 'fivepack';
  const upsellSlug = showUpsell && subject && stage
    ? `all-${subject === 'science' ? 'sci' : subject === 'computing' ? 'comp' : subject}-s${stage}`
    : null;
  const upsellUrl   = upsellSlug
    ? `https://coremark.study/checkout.html?type=subject&slug=${upsellSlug}`
    : null;
  const upsellLabel = upsellUrl
    ? `Get all Stage ${stage} ${subjectLabel(subject)} boosters`
    : null;

  const html = buildDay2Html({
    to, buyerName, orderTitle, orderType, subject, stage: stage || 8,
    tip, feedbackUrl, upsellUrl, upsellLabel,
  });

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from:    'CoreMark <info@coremark.study>',
        to:      [to],
        subject: `📝 A quick tip for ${orderTitle} (Stage ${stage || 8} ${subjectLabel(subject)})`,
        html,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('[send-email-day2] Resend error:', err);
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
    console.error('[send-email-day2]', err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...CORS } }
    );
  }
}
