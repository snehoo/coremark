// js/buy-wire.js
// Wires checkout on math/science/computing pages.
// Controls the #b-buy-btn disabled state + toast from 1st selection.
'use strict';

(function () {
  const P       = window.CM_PRODUCTS;
  const SUBJECT = window.CM_SUBJECT || 'math';
  const SUBJ_SLUG = { math:'math', science:'sci', computing:'comp' }[SUBJECT] || 'math';

  // ── Code → slug map ──────────────────────────────────────
  const CODE_MAP = {};
  Object.values(P.boosters)
    .filter(b => b.subject === SUBJECT)
    .forEach(b => { CODE_MAP[b.topicCode + '-' + b.stage] = b.slug; });

  // ── Helper: active stage number ───────────────────────────
  function activeStage() {
    const card = document.querySelector('.booster-card.selected');
    if (card) return parseInt((card.dataset.stage || 's8').replace('s', ''));
    // Fallback: whichever stage panel is active
    const panel = document.querySelector('.stage-panel.active');
    if (panel) return parseInt(panel.id.replace('panel-s', ''));
    return 8;
  }

  // ── Buy button state ──────────────────────────────────────
  function refreshBuyBtn() {
    const btn   = document.getElementById('b-buy-btn');
    const count = (window.selected || []).length;
    if (!btn) return;

    if (count === 0) {
      btn.disabled = true;
      btn.style.opacity  = '0.35';
      btn.style.cursor   = 'not-allowed';
      btn.textContent    = 'Buy Bundle';
      return;
    }

    if (count < 5) {
      const need = 5 - count;
      btn.disabled = true;
      btn.style.opacity  = '0.45';
      btn.style.cursor   = 'not-allowed';
      btn.textContent    = 'Add ' + need + ' more →';
    } else {
      // exactly 5
      btn.disabled = false;
      btn.style.opacity  = '1';
      btn.style.cursor   = 'pointer';
      btn.textContent    = 'Buy Bundle — ₹799';
    }
  }

  // ── Toast helper ──────────────────────────────────────────
  function toast(msg, tip) {
    if (typeof window.showToast === 'function') {
      window.showToast(msg, tip || '');
    }
  }

  // ── Intercept toggleSelect ────────────────────────────────
  // Wrap the page's own toggleSelect so we can fire toasts + update btn
  function wrapToggleSelect() {
    const orig = window.toggleSelect;
    if (!orig) return;
    window.toggleSelect = function (btn) {
      orig(btn); // run original (updates selected[], card style, updateBasket)
      const count = (window.selected || []).length;
      refreshBuyBtn();

      // Toast on every add (not on remove — count won't increase)
      const card      = btn.closest('.booster-card');
      const wasAdded  = card && card.classList.contains('selected');
      if (!wasAdded) return; // it was a deselect

      if (count < 5) {
        const need = 5 - count;
        const msgs = [
          '',
          'Add 4 more topics to unlock the ₹799 5-pack!',
          'Add 3 more topics to unlock the ₹799 5-pack!',
          'Add 2 more topics to unlock the ₹799 5-pack!',
          'One more topic to unlock the ₹799 5-pack!',
        ];
        toast(msgs[count] || '', '5 topics for ₹799 — ₹160 each');
      } else {
        toast('5-pack unlocked 🎉 — ₹799 for all 5!', 'Click Buy Bundle to continue');
      }
    };
  }

  // ── buyBundle ─────────────────────────────────────────────
  window.buyBundle = function () {
    const codes = window.selected || [];
    if (codes.length === 0) return;

    const stageNum = activeStage();
    const slugs = codes
      .map(code => CODE_MAP[code + '-' + stageNum])
      .filter(Boolean);

    if (slugs.length === 0) return;

    if (slugs.length === 1) {
      location.href = `checkout.html?type=single&slug=${slugs[0]}`;
      return;
    }

    if (slugs.length < 5) {
      // Button should be disabled but guard anyway
      toast('Add ' + (5 - slugs.length) + ' more topics to unlock the 5-pack', '5 topics for ₹799');
      return;
    }

    // Exactly 5
    location.href = `checkout.html?type=fivepack`
      + `&slug=5pack-${SUBJ_SLUG}-s${stageNum}`
      + `&items=${slugs.join(',')}`
      + `&stage=${stageNum}&subject=${SUBJECT}`;
  };

  // ── Wire Buy (single) buttons ─────────────────────────────
  function wireBuyButtons() {
    document.querySelectorAll('.buy-btn').forEach(btn => {
      const card = btn.closest('.booster-card');
      if (!card) return;
      const code  = card.dataset.code;
      const stage = parseInt((card.dataset.stage || 's8').replace('s', ''));
      const slug  = CODE_MAP[code + '-' + stage];
      if (!slug) return;
      btn.href = `checkout.html?type=single&slug=${slug}`;
      btn.removeAttribute('onclick');
    });
  }

  // ── Wire Bundle Bar primary buttons ──────────────────────
  function wireBundleBarButtons() {
    document.querySelectorAll('.bb-btn.primary').forEach(btn => {
      const panel = btn.closest('.stage-panel');
      if (!panel) return;
      const stageNum = parseInt(panel.id.replace('panel-s', ''));
      btn.href = `checkout.html?type=subject&slug=all-${SUBJ_SLUG}-s${stageNum}`;
      btn.removeAttribute('onclick');
    });
  }

  // ── Wire Pricing Strip ────────────────────────────────────
  function wirePricingStrip() {
    document.querySelectorAll('.stage-panel').forEach(panel => {
      const stageNum = parseInt(panel.id.replace('panel-s', ''));
      panel.querySelectorAll('.pricing-strip').forEach(strip => {
        const items = strip.querySelectorAll('.ps-item');

        const singleBtn  = items[0]?.querySelector('.ps-btn');
        const fiveBtn    = items[1]?.querySelector('.ps-btn');
        const subjectBtn = items[2]?.querySelector('.ps-btn');
        const stageBtn   = items[3]?.querySelector('.ps-btn');

        if (singleBtn) {
          singleBtn.href = '#';
          singleBtn.onclick = e => {
            e.preventDefault();
            panel.querySelector('.booster-card')?.scrollIntoView({ behavior:'smooth', block:'center' });
          };
        }
        if (fiveBtn) {
          fiveBtn.href = '#';
          fiveBtn.onclick = e => {
            e.preventDefault();
            panel.querySelector('.select-btn')?.scrollIntoView({ behavior:'smooth', block:'center' });
          };
        }
        if (subjectBtn) {
          subjectBtn.href = `checkout.html?type=subject&slug=all-${SUBJ_SLUG}-s${stageNum}`;
          subjectBtn.removeAttribute('onclick');
        }
        if (stageBtn) {
          stageBtn.href = `checkout.html?type=stage&slug=all-s${stageNum}`;
          stageBtn.removeAttribute('onclick');
        }
      });
    });
  }

  // ── Track pageview ────────────────────────────────────────
  function trackPageview() {
    fetch('/api/track', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ path: location.pathname + location.search, referrer: document.referrer || null }),
    }).catch(() => {});
  }

  // ── Init ─────────────────────────────────────────────────
  function init() {
    wireBuyButtons();
    wireBundleBarButtons();
    wirePricingStrip();
    refreshBuyBtn();     // start disabled
    wrapToggleSelect();  // intercept after page script has defined it
    trackPageview();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
