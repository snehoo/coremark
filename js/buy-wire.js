// js/buy-wire.js
// Wires Buy/Bundle/Pricing buttons on subject pages to checkout.html
// Also overrides basket behaviour: disabled until exactly 5 for 5-pack,
// nudge toast from first selection.

'use strict';

(function () {
  const P       = window.CM_PRODUCTS;
  const SUBJECT = window.CM_SUBJECT || 'math';

  // ── Code → slug map ──────────────────────────────────────
  function buildCodeMap(subject) {
    const map = {};
    Object.values(P.boosters)
      .filter(b => b.subject === subject)
      .forEach(b => { map[b.topicCode + '-' + b.stage] = b.slug; });
    return map;
  }
  const CODE_MAP = buildCodeMap(SUBJECT);

  function slugFromCard(card) {
    const code     = card.dataset.code;
    const stageNum = parseInt((card.dataset.stage || 's8').replace('s', ''));
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
  function wireBundleBarButtons() {
    document.querySelectorAll('.bb-btn.primary').forEach(btn => {
      const panel = btn.closest('.stage-panel');
      if (!panel) return;
      const stageNum = parseInt(panel.id.replace('panel-s', ''));
      const subjSlug = { math:'math', science:'sci', computing:'comp' }[SUBJECT];
      btn.href = `checkout.html?type=subject&slug=all-${subjSlug}-s${stageNum}`;
      btn.removeAttribute('onclick');
    });
  }

  // ── 3. Wire Pricing Strip buttons ─────────────────────────
  function wirePricingStrip() {
    document.querySelectorAll('.stage-panel').forEach(panel => {
      const stageNum = parseInt(panel.id.replace('panel-s', ''));
      const subjSlug = { math:'math', science:'sci', computing:'comp' }[SUBJECT];
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
          subjectBtn.href = `checkout.html?type=subject&slug=all-${subjSlug}-s${stageNum}`;
          subjectBtn.removeAttribute('onclick');
        }
        if (stageBtn) {
          stageBtn.href = `checkout.html?type=stage&slug=all-s${stageNum}`;
          stageBtn.removeAttribute('onclick');
        }
      });
    });
  }

  // ── 4. Override basket behaviour ──────────────────────────
  // The basket Checkout button should be:
  //   - DISABLED (greyed, no nav) when 1–4 items selected
  //   - ENABLED when exactly 5 items selected
  // Toast nudge fires from the FIRST selection.

  function getBuyBtn() {
    return document.querySelector('.basket .b-buy') || document.querySelector('.b-buy');
  }

  function updateBuyBtn(count) {
    const btn = getBuyBtn();
    if (!btn) return;
    if (count === 0) {
      btn.disabled = false;
      btn.style.opacity = '';
      btn.style.cursor = '';
      btn.textContent = 'Checkout';
      return;
    }
    if (count < 5) {
      const need = 5 - count;
      btn.disabled = true;
      btn.style.opacity = '0.4';
      btn.style.cursor = 'not-allowed';
      btn.textContent = 'Add ' + need + ' more to checkout';
    } else {
      btn.disabled = false;
      btn.style.opacity = '';
      btn.style.cursor = '';
      btn.textContent = 'Checkout — ₹799 🎉';
    }
  }

  // Override updateBasket to inject our button state + early toasts
  const _origUpdateBasket = window.updateBasket;
  window.updateBasket = function () {
    // Call the original first
    if (typeof _origUpdateBasket === 'function') _origUpdateBasket();

    const count = (window.selected || []).length;
    updateBuyBtn(count);

    // Toast nudge from first selection
    if (count >= 1 && count < 5) {
      const need = 5 - count;
      const msg  = count === 1
        ? 'Add 4 more topics to unlock the ₹799 5-pack bundle'
        : count === 2
        ? 'Add 3 more topics to unlock the ₹799 5-pack bundle'
        : count === 3
        ? 'Add 2 more topics to unlock the ₹799 5-pack bundle'
        : 'Add 1 more topic to unlock the ₹799 5-pack bundle!';
      const tip = 'You save ₹' + ((count * 249) - 799 + (need * 249)).toLocaleString('en-IN') + ' with the 5-pack';

      // Use the page's existing showToast if available
      if (typeof window.showToast === 'function') {
        window.showToast(msg, tip);
      }
    }
  };

  // ── 5. Override buyBundle ─────────────────────────────────
  window.buyBundle = function () {
    const codes = window.selected || [];
    if (codes.length === 0) return;

    // Find active stage
    const firstCard = document.querySelector('.booster-card.selected');
    if (!firstCard) return;
    const stageNum = parseInt((firstCard.dataset.stage || 's8').replace('s', ''));

    // Map codes to slugs
    const slugs = codes
      .map(code => CODE_MAP[code + '-' + stageNum])
      .filter(Boolean);

    if (slugs.length === 0) return;

    if (slugs.length === 1) {
      location.href = `checkout.html?type=single&slug=${slugs[0]}`;
      return;
    }

    if (slugs.length < 5) {
      // Should not reach here (button is disabled) but guard anyway
      const need = 5 - slugs.length;
      if (typeof window.showToast === 'function') {
        window.showToast(
          'Add ' + need + ' more topic' + (need > 1 ? 's' : '') + ' to unlock the 5-pack',
          '5 topics for ₹799 — ₹160 each'
        );
      }
      return;
    }

    // Exactly 5 — go to checkout
    const subjSlug = { math:'math', science:'sci', computing:'comp' }[SUBJECT];
    location.href = `checkout.html?type=fivepack`
      + `&slug=5pack-${subjSlug}-s${stageNum}`
      + `&items=${slugs.join(',')}`
      + `&stage=${stageNum}&subject=${SUBJECT}`;
  };

  // ── 6. Track pageview ─────────────────────────────────────
  function trackPageview() {
    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: location.pathname + location.search, referrer: document.referrer || null }),
    }).catch(() => {});
  }

  // ── Init ─────────────────────────────────────────────────
  function init() {
    wireBuyButtons();
    wireBundleBarButtons();
    wirePricingStrip();
    // Initial button state
    updateBuyBtn(0);
    trackPageview();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
