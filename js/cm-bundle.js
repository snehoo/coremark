// js/cm-bundle.js
// CoreMark — runs AFTER the page's own <script> block.
// Overrides updateBasket() and buyBundle() in place.
// The page's showToast, toggleSelect, clearBasket etc are left untouched.
'use strict';
(function () {

  var P         = window.CM_PRODUCTS;
  var SUBJECT   = window.CM_SUBJECT || 'math';
  var SUBJ_SLUG = { math:'math', science:'sci', computing:'comp' }[SUBJECT] || 'math';

  // ── slug lookup map ───────────────────────────────────────
  var CODE_MAP = {};
  Object.values(P.boosters)
    .filter(function(b){ return b.subject === SUBJECT; })
    .forEach(function(b){ CODE_MAP[b.topicCode + '-' + b.stage] = b.slug; });

  function activeStage() {
    var card  = document.querySelector('.booster-card.selected');
    if (card) return parseInt((card.dataset.stage || 's8').replace('s',''));
    var panel = document.querySelector('.stage-panel.active');
    return panel ? parseInt(panel.id.replace('panel-s','')) : 8;
  }

  // ── Button enable/disable ────────────────────────────────
  function refreshBtn(count) {
    var btn = document.getElementById('b-buy-btn');
    if (!btn) return;
    if (count >= 5) {
      btn.removeAttribute('disabled');
      btn.style.cssText = '';           // restore all original styles
      btn.textContent   = 'Buy Bundle — ₹799';
    } else {
      btn.setAttribute('disabled', '');
      btn.style.opacity    = '0.38';
      btn.style.cursor     = 'not-allowed';
      btn.textContent      = count === 0 ? 'Buy Bundle' : 'Add ' + (5-count) + ' more →';
    }
  }

  // ── Save reference to original updateBasket ───────────────
  var _origUpdateBasket = window.updateBasket;

  // ── Override updateBasket ─────────────────────────────────
  // Original already handles: basket visibility, tier labels, price, sub-label, toasts
  // We just add: button state refresh after it runs
  window.updateBasket = function() {
    if (typeof _origUpdateBasket === 'function') _origUpdateBasket();
    refreshBtn((window.selected || []).length);
  };

  // ── Also hook toggleSelect to catch count=1 and count=2 ──
  // Original only toasts at 3,4,5. We add toasts at 1 and 2.
  var _origToggleSelect = window.toggleSelect;
  window.toggleSelect = function(btn) {
    if (typeof _origToggleSelect === 'function') _origToggleSelect(btn);
    var count = (window.selected || []).length;
    // Fire extra toasts for counts 1 and 2 (original handles 3,4,5)
    if (count === 1) {
      window.showToast('Add 4 more topics to unlock ₹799 bundle pricing', 'You save ₹446 with 5 topics');
    } else if (count === 2) {
      window.showToast('Add 3 more topics to unlock ₹799 bundle pricing', 'You save ₹446 with 5 topics');
    }
    // refreshBtn is already called via updateBasket above
  };

  // ── Override buyBundle ────────────────────────────────────
  window.buyBundle = function() {
    var codes    = window.selected || [];
    var stageNum = activeStage();
    var slugs    = codes.map(function(c){ return CODE_MAP[c+'-'+stageNum]; }).filter(Boolean);
    if (!slugs.length) return;
    if (slugs.length === 1) {
      location.href = 'checkout.html?type=single&slug=' + slugs[0];
      return;
    }
    if (slugs.length < 5) {
      window.showToast('Add ' + (5-slugs.length) + ' more topics to unlock the 5-pack', '5 topics for ₹799');
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
    document.querySelectorAll('.buy-btn').forEach(function(btn) {
      var card = btn.closest('.booster-card');
      if (!card) return;
      var slug = CODE_MAP[card.dataset.code + '-' + parseInt((card.dataset.stage||'s8').replace('s',''))];
      if (!slug) return;
      btn.href = 'checkout.html?type=single&slug=' + slug;
      btn.removeAttribute('onclick');
    });
  }

  // ── Wire Bundle Bar primary buttons ──────────────────────
  function wireBundleBar() {
    document.querySelectorAll('.bb-btn.primary').forEach(function(btn) {
      var panel = btn.closest('.stage-panel');
      if (!panel) return;
      var s = parseInt(panel.id.replace('panel-s',''));
      btn.href = 'checkout.html?type=subject&slug=all-' + SUBJ_SLUG + '-s' + s;
      btn.removeAttribute('onclick');
    });
  }

  // ── Wire Pricing Strip ────────────────────────────────────
  function wirePricingStrip() {
    document.querySelectorAll('.stage-panel').forEach(function(panel) {
      var s = parseInt(panel.id.replace('panel-s',''));
      panel.querySelectorAll('.pricing-strip').forEach(function(strip) {
        var items = strip.querySelectorAll('.ps-item');
        var b0 = items[0] && items[0].querySelector('.ps-btn');
        var b1 = items[1] && items[1].querySelector('.ps-btn');
        var b2 = items[2] && items[2].querySelector('.ps-btn');
        var b3 = items[3] && items[3].querySelector('.ps-btn');
        if (b0) { b0.href='#'; b0.onclick=function(e){e.preventDefault();panel.querySelector('.booster-card').scrollIntoView({behavior:'smooth',block:'center'});}; }
        if (b1) { b1.href='#'; b1.onclick=function(e){e.preventDefault();panel.querySelector('.select-btn').scrollIntoView({behavior:'smooth',block:'center'});}; }
        if (b2) { b2.href='checkout.html?type=subject&slug=all-'+SUBJ_SLUG+'-s'+s; b2.removeAttribute('onclick'); }
        if (b3) { b3.href='checkout.html?type=stage&slug=all-s'+s;                  b3.removeAttribute('onclick'); }
      });
    });
  }

  // ── Track ─────────────────────────────────────────────────
  function track() {
    fetch('/api/track',{method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({path:location.pathname+location.search,referrer:document.referrer||null})
    }).catch(function(){});
  }

  // ── Init — runs after page script so all functions exist ──
  function init() {
    wireBuyBtns();
    wireBundleBar();
    wirePricingStrip();
    refreshBtn(0);
    track();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
