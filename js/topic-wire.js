// js/buy-wire.js
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
    const card = document.querySelector('.booster-card.selected');
    if (card) return parseInt((card.dataset.stage || 's8').replace('s', ''));
    const panel = document.querySelector('.stage-panel.active');
    return panel ? parseInt(panel.id.replace('panel-s', '')) : 8;
  }

  // ── Buy button state ──────────────────────────────────────
  function refreshBuyBtn() {
    const btn   = document.getElementById('b-buy-btn');
    const count = (window.selected || []).length;
    if (!btn) return;
    if (count === 0) {
      btn.disabled = true;
      btn.style.opacity = '0.35';
      btn.style.cursor  = 'not-allowed';
      btn.textContent   = 'Buy Bundle';
    } else if (count < 5) {
      const need = 5 - count;
      btn.disabled = true;
      btn.style.opacity = '0.45';
      btn.style.cursor  = 'not-allowed';
      btn.textContent   = 'Add ' + need + ' more →';
    } else {
      btn.disabled = false;
      btn.style.opacity = '1';
      btn.style.cursor  = 'pointer';
      btn.textContent   = 'Buy Bundle — ₹799';
    }
  }

  // ── Toast ─────────────────────────────────────────────────
  function toast(msg, tip) {
    if (typeof window.showToast === 'function') window.showToast(msg, tip || '');
  }

  // ── Hook via select button clicks (event delegation) ──────
  // This fires AFTER the page's own toggleSelect runs,
  // so window.selected is already updated.
  function hookSelectButtons() {
    document.addEventListener('click', function(e) {
      const btn = e.target.closest('.select-btn');
      if (!btn) return;

      // Wait one tick for the page's toggleSelect to finish
      setTimeout(function() {
        const count = (window.selected || []).length;
        refreshBuyBtn();

        // Only toast on adds (count > 0 and card is now selected)
        const card    = btn.closest('.booster-card');
        const added   = card && card.classList.contains('selected');
        if (!added) return;

        const msgs = [
          '',
          'Add 4 more topics to unlock ₹799 bundle pricing',
          'Add 3 more topics to unlock ₹799 bundle pricing',
          'Add 2 more topics to unlock ₹799 bundle pricing',
          'One more topic unlocks the 5-pack bundle!',
          '5-pack bundle unlocked 🎉',
        ];
        const tips = [
          '', '', '', '',
          'Pay ₹799 instead of ₹996 — save ₹197',
          'All 5 for ₹799 — saving ₹446',
        ];
        toast(msgs[count] || '', tips[count] || '5 topics for ₹799 — ₹160 each');
      }, 0);
    });
  }

  // ── buyBundle ─────────────────────────────────────────────
  window.buyBundle = function () {
    const codes = window.selected || [];
    if (codes.length === 0) return;
    const stageNum = activeStage();
    const slugs = codes.map(c => CODE_MAP[c + '-' + stageNum]).filter(Boolean);
    if (!slugs.length) return;

    if (slugs.length === 1) {
      location.href = `checkout.html?type=single&slug=${slugs[0]}`;
      return;
    }
    if (slugs.length < 5) {
      toast('Add ' + (5 - slugs.length) + ' more topics to unlock the 5-pack', '5 topics for ₹799');
      return;
    }
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
      const slug = CODE_MAP[card.dataset.code + '-' + parseInt((card.dataset.stage||'s8').replace('s',''))];
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
      const s = parseInt(panel.id.replace('panel-s', ''));
      btn.href = `checkout.html?type=subject&slug=all-${SUBJ_SLUG}-s${s}`;
      btn.removeAttribute('onclick');
    });
  }

  // ── Wire Pricing Strip ────────────────────────────────────
  function wirePricingStrip() {
    document.querySelectorAll('.stage-panel').forEach(panel => {
      const s = parseInt(panel.id.replace('panel-s', ''));
      panel.querySelectorAll('.pricing-strip').forEach(strip => {
        const items      = strip.querySelectorAll('.ps-item');
        const singleBtn  = items[0]?.querySelector('.ps-btn');
        const fiveBtn    = items[1]?.querySelector('.ps-btn');
        const subjectBtn = items[2]?.querySelector('.ps-btn');
        const stageBtn   = items[3]?.querySelector('.ps-btn');
        if (singleBtn) { singleBtn.href='#'; singleBtn.onclick=e=>{e.preventDefault();panel.querySelector('.booster-card')?.scrollIntoView({behavior:'smooth',block:'center'});}; }
        if (fiveBtn)   { fiveBtn.href='#';   fiveBtn.onclick=e=>{e.preventDefault();panel.querySelector('.select-btn')?.scrollIntoView({behavior:'smooth',block:'center'});}; }
        if (subjectBtn){ subjectBtn.href=`checkout.html?type=subject&slug=all-${SUBJ_SLUG}-s${s}`; subjectBtn.removeAttribute('onclick'); }
        if (stageBtn)  { stageBtn.href=`checkout.html?type=stage&slug=all-s${s}`;                  stageBtn.removeAttribute('onclick'); }
      });
    });
  }

  // ── Track ─────────────────────────────────────────────────
  function trackPageview() {
    fetch('/api/track',{method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({path:location.pathname+location.search,referrer:document.referrer||null})
    }).catch(()=>{});
  }

  // ── Init ─────────────────────────────────────────────────
  function init() {
    wireBuyButtons();
    wireBundleBarButtons();
    wirePricingStrip();
    refreshBuyBtn();
    hookSelectButtons();
    trackPageview();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
