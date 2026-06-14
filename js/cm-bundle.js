// js/cm-bundle.js
// CoreMark subject page wiring — bundle basket, buy buttons, pricing strip
'use strict';

(function () {
  const P         = window.CM_PRODUCTS;
  const SUBJECT   = window.CM_SUBJECT || 'math';
  const SUBJ_SLUG = { math:'math', science:'sci', computing:'comp' }[SUBJECT] || 'math';

  // Code → slug map
  const CODE_MAP = {};
  Object.values(P.boosters)
    .filter(b => b.subject === SUBJECT)
    .forEach(b => { CODE_MAP[b.topicCode + '-' + b.stage] = b.slug; });

  function activeStage() {
    const card  = document.querySelector('.booster-card.selected');
    if (card) return parseInt((card.dataset.stage || 's8').replace('s', ''));
    const panel = document.querySelector('.stage-panel.active');
    return panel ? parseInt(panel.id.replace('panel-s', '')) : 8;
  }

  // ── Buy Bundle button state ───────────────────────────────
  function refreshBtn() {
    const btn   = document.querySelector('.basket .b-buy');
    const count = (window.selected || []).length;
    if (!btn) return;

    if (count < 5) {
      btn.disabled             = true;
      btn.style.opacity        = '0.4';
      btn.style.cursor         = 'not-allowed';
      btn.style.background     = 'rgba(244,199,62,0.4)';
      btn.textContent          = count === 0 ? 'Buy Bundle' : 'Add ' + (5 - count) + ' more →';
    } else {
      btn.disabled             = false;
      btn.style.opacity        = '1';
      btn.style.cursor         = 'pointer';
      btn.style.background     = '';  // restore original coral
      btn.textContent          = 'Buy Bundle — ₹799';
    }
  }

  // ── Toast — same style as original, correct wording ──────
  // Original toast fires via showToast(msg, tip) defined in each page.
  // We call it directly — same dark pill, white text.
  const TOAST_MSGS = [
    null,
    'Add 4 more topics to unlock ₹799 bundle pricing',
    'Add 3 more topics to unlock ₹799 bundle pricing',
    'Add 2 more topics to unlock ₹799 bundle pricing',
    'One more topic unlocks the 5-pack bundle!',
    '5-pack bundle unlocked 🎉',
  ];
  const TOAST_TIPS = [
    null, null, null, null,
    'Pay ₹799 instead of ₹996 — save ₹197',
    'All 5 for ₹799 — saving ₹446',
  ];

  function fireToast(count) {
    const msg = TOAST_MSGS[count];
    const tip = TOAST_TIPS[count] || 'You save ₹' + ((count * 249) - 799 + ((5 - count) * 249)) + ' with 5 topics';
    if (msg && typeof window.showToast === 'function') {
      window.showToast(msg, tip);
    }
  }

  // ── Hook into select button clicks via event delegation ───
  // setTimeout(0) ensures we read window.selected AFTER page's toggleSelect runs
  document.addEventListener('click', function (e) {
    if (!e.target.closest('.select-btn')) return;
    const card = e.target.closest('.booster-card');
    setTimeout(function () {
      const count = (window.selected || []).length;
      refreshBtn();
      // Only fire toast on add, not remove
      if (card && card.classList.contains('selected')) {
        fireToast(count);
      }
    }, 0);
  });

  // ── buyBundle ─────────────────────────────────────────────
  window.buyBundle = function () {
    const codes    = window.selected || [];
    const stageNum = activeStage();
    const slugs    = codes.map(c => CODE_MAP[c + '-' + stageNum]).filter(Boolean);

    if (slugs.length === 0) return;
    if (slugs.length === 1) {
      location.href = 'checkout.html?type=single&slug=' + slugs[0];
      return;
    }
    if (slugs.length < 5) {
      if (typeof window.showToast === 'function')
        window.showToast('Add ' + (5 - slugs.length) + ' more topics to unlock the 5-pack', '5 topics for ₹799 — ₹160 each');
      return;
    }
    location.href = 'checkout.html?type=fivepack'
      + '&slug=5pack-' + SUBJ_SLUG + '-s' + stageNum
      + '&items='      + slugs.join(',')
      + '&stage='      + stageNum
      + '&subject='    + SUBJECT;
  };

  // ── Wire individual Buy buttons ───────────────────────────
  function wireBuyBtns() {
    document.querySelectorAll('.buy-btn').forEach(function (btn) {
      const card = btn.closest('.booster-card');
      if (!card) return;
      const slug = CODE_MAP[card.dataset.code + '-' + parseInt((card.dataset.stage || 's8').replace('s', ''))];
      if (!slug) return;
      btn.href = 'checkout.html?type=single&slug=' + slug;
      btn.removeAttribute('onclick');
    });
  }

  // ── Wire Bundle Bar primary buttons ──────────────────────
  function wireBundleBar() {
    document.querySelectorAll('.bb-btn.primary').forEach(function (btn) {
      const panel = btn.closest('.stage-panel');
      if (!panel) return;
      const s = parseInt(panel.id.replace('panel-s', ''));
      btn.href = 'checkout.html?type=subject&slug=all-' + SUBJ_SLUG + '-s' + s;
      btn.removeAttribute('onclick');
    });
  }

  // ── Wire Pricing Strip ────────────────────────────────────
  function wirePricingStrip() {
    document.querySelectorAll('.stage-panel').forEach(function (panel) {
      const s = parseInt(panel.id.replace('panel-s', ''));
      panel.querySelectorAll('.pricing-strip').forEach(function (strip) {
        const items = strip.querySelectorAll('.ps-item');
        var b0 = items[0] && items[0].querySelector('.ps-btn');
        var b1 = items[1] && items[1].querySelector('.ps-btn');
        var b2 = items[2] && items[2].querySelector('.ps-btn');
        var b3 = items[3] && items[3].querySelector('.ps-btn');
        if (b0) { b0.href = '#'; b0.onclick = function(e){ e.preventDefault(); panel.querySelector('.booster-card').scrollIntoView({behavior:'smooth',block:'center'}); }; }
        if (b1) { b1.href = '#'; b1.onclick = function(e){ e.preventDefault(); panel.querySelector('.select-btn').scrollIntoView({behavior:'smooth',block:'center'}); }; }
        if (b2) { b2.href = 'checkout.html?type=subject&slug=all-' + SUBJ_SLUG + '-s' + s; b2.removeAttribute('onclick'); }
        if (b3) { b3.href = 'checkout.html?type=stage&slug=all-s' + s;                      b3.removeAttribute('onclick'); }
      });
    });
  }

  // ── Track ─────────────────────────────────────────────────
  function track() {
    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: location.pathname + location.search, referrer: document.referrer || null }),
    }).catch(function(){});
  }

  // ── Init ─────────────────────────────────────────────────
  function init() {
    wireBuyBtns();
    wireBundleBar();
    wirePricingStrip();
    refreshBtn();
    track();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
