// js/checkout-wire.js
// Wires all buy/bundle/pricing buttons on math.html, science.html, computing.html
// to checkout.html with correct params.
//
// Add this AFTER products.js in each subject page:
//   <script src="js/products.js"></script>
//   <script src="js/checkout-wire.js"></script>
//
// Depends on: window.CM_PRODUCTS (products.js)
// Reads:      window.CM_SUBJECT  — set in each subject page before this script
//             e.g. <script>window.CM_SUBJECT = 'math';</script>

'use strict';

(function () {
  const P       = window.CM_PRODUCTS;
  const SUBJECT = window.CM_SUBJECT || 'math';

  // ── Code → slug mapping ───────────────────────────────────
  // Maps "M·N1" + stage 8 → "math-n1-integers-s8"
  // Built dynamically from products.js so it's always in sync.

  function buildCodeMap(subject) {
    const map = {}; // e.g. { 'M·N1-7': 'math-n1-integers-s7', ... }
    Object.values(P.boosters)
      .filter(b => b.subject === subject)
      .forEach(b => {
        const key = b.topicCode + '-' + b.stage;
        map[key] = b.slug;
      });
    return map;
  }

  const CODE_MAP = buildCodeMap(SUBJECT);

  function slugFromCard(card) {
    const code  = card.dataset.code;  // e.g. "M·N1"
    const stage = card.dataset.stage; // e.g. "s8" → 8
    const stageNum = parseInt(stage.replace('s', ''));
    return CODE_MAP[code + '-' + stageNum] || null;
  }

  // ── 1. Wire individual Buy buttons ────────────────────────
  function wireBuyButtons() {
    document.querySelectorAll('.buy-btn').forEach(btn => {
      const card = btn.closest('.booster-card');
      if (!card) return;
      const slug = slugFromCard(card);
      if (!slug) return;
      btn.href = `checkout.html?type=single&slug=${slug}`;
      btn.removeAttribute('onclick');
    });
  }

  // ── 2. Wire Bundle Bar primary buttons ────────────────────
  // "Get Full Stage X Bundle — ₹1,299"
  function wireBundleBarButtons() {
    document.querySelectorAll('.bb-btn.primary').forEach(btn => {
      // Find which stage panel this button lives in
      const panel = btn.closest('.stage-panel');
      if (!panel) return;
      const stageNum = parseInt(panel.id.replace('panel-s', ''));
      const subjSlug = { math:'math', science:'sci', computing:'comp' }[SUBJECT];
      const bundleSlug = `all-${subjSlug}-s${stageNum}`;
      btn.href = `checkout.html?type=subject&slug=${bundleSlug}`;
      btn.removeAttribute('onclick');
    });
  }

  // ── 3. Wire Pricing Strip buttons ─────────────────────────
  // Each .pricing-strip has 4 .ps-item elements:
  //   [0] Single booster  → scroll up to pick one
  //   [1] 5-pack          → scroll up to basket
  //   [2] Full subject    → checkout subject bundle
  //   [3] All subjects    → checkout stage bundle
  function wirePricingStrip() {
    document.querySelectorAll('.stage-panel').forEach(panel => {
      const stageNum  = parseInt(panel.id.replace('panel-s', ''));
      const subjSlug  = { math:'math', science:'sci', computing:'comp' }[SUBJECT];
      const strips    = panel.querySelectorAll('.pricing-strip');

      strips.forEach(strip => {
        const items = strip.querySelectorAll('.ps-item');

        // [0] Single — scroll to first booster card in this stage
        const singleBtn = items[0]?.querySelector('.ps-btn');
        if (singleBtn) {
          singleBtn.href = '#';
          singleBtn.onclick = (e) => {
            e.preventDefault();
            const firstCard = panel.querySelector('.booster-card');
            if (firstCard) firstCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
          };
        }

        // [1] 5-pack — scroll to basket / first select button
        const fiveBtn = items[1]?.querySelector('.ps-btn');
        if (fiveBtn) {
          fiveBtn.href = '#';
          fiveBtn.onclick = (e) => {
            e.preventDefault();
            const firstSelect = panel.querySelector('.select-btn');
            if (firstSelect) firstSelect.scrollIntoView({ behavior: 'smooth', block: 'center' });
          };
        }

        // [2] Full subject bundle
        const subjectBtn = items[2]?.querySelector('.ps-btn');
        if (subjectBtn) {
          subjectBtn.href = `checkout.html?type=subject&slug=all-${subjSlug}-s${stageNum}`;
          subjectBtn.removeAttribute('onclick');
        }

        // [3] All subjects (stage bundle)
        const stageBtn = items[3]?.querySelector('.ps-btn');
        if (stageBtn) {
          stageBtn.href = `checkout.html?type=stage&slug=all-s${stageNum}`;
          stageBtn.removeAttribute('onclick');
        }
      });
    });
  }

  // ── 4. Wire buyBundle() — called by basket "Buy Bundle" button ──
  // Overrides the placeholder in math/science/computing HTML
  window.buyBundle = function () {
    // `selected` is defined in the subject page's own script
    // It holds topic codes e.g. ['M·N1', 'M·N3', ...]
    const codes = window.selected || [];
    if (codes.length === 0) return;

    // Determine active stage from first selected card
    const firstCard = document.querySelector('.booster-card.selected');
    if (!firstCard) return;
    const stageNum = parseInt((firstCard.dataset.stage || 's8').replace('s', ''));

    // Map codes to slugs
    const slugs = codes
      .map(code => CODE_MAP[code + '-' + stageNum])
      .filter(Boolean);

    if (slugs.length === 0) return;

    if (slugs.length === 1) {
      // Single — go direct
      location.href = `checkout.html?type=single&slug=${slugs[0]}`;
    } else if (slugs.length === 5) {
      // Full 5-pack
      const subjSlug = { math:'math', science:'sci', computing:'comp' }[SUBJECT];
      location.href = `checkout.html?type=fivepack`
        + `&slug=5pack-${subjSlug}-s${stageNum}`
        + `&items=${slugs.join(',')}`
        + `&stage=${stageNum}&subject=${SUBJECT}`;
    } else {
      // 2–4 items — treat as individual singles priced per item
      // Send as fivepack type but with actual item count pricing handled server-side
      // The create-order server calculates price = count × 24900 for non-5 counts
      location.href = `checkout.html?type=fivepack`
        + `&slug=5pack-${SUBJECT}-s${stageNum}`
        + `&items=${slugs.join(',')}`
        + `&stage=${stageNum}&subject=${SUBJECT}`;
    }
  };

  // ── 5. Add tracking on page load ─────────────────────────
  function trackPageview() {
    fetch('/api/track', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({
        path:     location.pathname + location.search,
        referrer: document.referrer || null,
      }),
    }).catch(() => {}); // fire and forget — never block UI
  }

  // ── Init ─────────────────────────────────────────────────
  function init() {
    wireBuyButtons();
    wireBundleBarButtons();
    wirePricingStrip();
    trackPageview();
  }

  // Run after DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
