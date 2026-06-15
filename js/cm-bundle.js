// js/cm-bundle.js
'use strict';
(function () {
  var P         = window.CM_PRODUCTS;
  var SUBJECT   = window.CM_SUBJECT || 'math';
  var SUBJ_SLUG = { math:'math', science:'sci', computing:'comp' }[SUBJECT] || 'math';

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

  // Exposed to updateBasket in HTML
  window.refreshBtn = function(count) {
    var btn = document.getElementById('b-buy-btn');
    if (!btn) return;
    if (count >= 5) {
      btn.removeAttribute('disabled');
      btn.style.opacity    = '1';
      btn.style.cursor     = 'pointer';
      btn.style.background = '';
      btn.textContent      = 'Buy Bundle — ₹799';
    } else {
      btn.setAttribute('disabled','');
      btn.style.opacity    = '0.38';
      btn.style.cursor     = 'not-allowed';
      btn.style.background = 'rgba(244,199,62,0.4)';
      btn.textContent      = count === 0 ? 'Buy Bundle' : 'Add ' + (5-count) + ' more →';
    }
  };

  // Exposed to buyBundle() in HTML
  window.cmBuyBundle = function() {
    var codes    = window.selected || [];
    var stageNum = activeStage();
    var slugs    = codes.map(function(c){ return CODE_MAP[c+'-'+stageNum]; }).filter(Boolean);


    if (!slugs.length) {
      return;
    }
    if (slugs.length === 1) {
      location.href = 'checkout.html?type=single&slug=' + slugs[0];
      return;
    }
    if (slugs.length < 5) {
      if (typeof window.showToast === 'function')
        window.showToast('Add ' + (5-slugs.length) + ' more topics to unlock the 5-pack', '5 topics for ₹799 — ₹160 each');
      return;
    }
    location.href = 'checkout.html?type=fivepack'
      + '&slug=5pack-' + SUBJ_SLUG + '-s' + stageNum
      + '&items='      + slugs.join(',')
      + '&stage='      + stageNum
      + '&subject='    + SUBJECT;
  };

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

  function wireBundleBar() {
    document.querySelectorAll('.bb-btn.primary').forEach(function(btn) {
      var panel = btn.closest('.stage-panel');
      if (!panel) return;
      var s = parseInt(panel.id.replace('panel-s',''));
      btn.href = 'checkout.html?type=subject&slug=all-' + SUBJ_SLUG + '-s' + s;
      btn.removeAttribute('onclick');
    });
  }

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
        if (b3) { b3.href='checkout.html?type=stage&slug=all-s'+s; b3.removeAttribute('onclick'); }
      });
    });
  }

  function track() {
    fetch('/api/track',{method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({path:location.pathname+location.search,referrer:document.referrer||null})
    }).catch(function(){});
  }

  function init() {
    wireBuyBtns();
    wireBundleBar();
    wirePricingStrip();
    window.refreshBtn(0);
    track();
    // Pre-select stage from URL hash e.g. #stage8
    var hash = location.hash.replace('#','').toLowerCase();
    if (hash === 'stage7' || hash === 'stage8' || hash === 'stage9') {
      var stageId = 's' + hash.replace('stage','');
      var tabBtn  = document.querySelector('.stage-tab[onclick*="' + stageId + '"]');
      if (tabBtn && typeof window.showStage === 'function') {
        window.showStage(stageId, tabBtn);
        // Smooth scroll to top of stage panel
        setTimeout(function() {
          var panel = document.getElementById('panel-' + stageId);
          if (panel) panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
