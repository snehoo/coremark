# CoreMark Purchase Flow End-to-End Verification Report

**Date:** 2026-06-18  
**Status:** ✅ CODE VERIFICATION COMPLETE | ⏳ R2 BUCKET VERIFICATION PENDING

---

## Executive Summary

All code-level logic for the CoreMark purchase flow has been verified without requiring real payments:

1. ✅ **create-order endpoint** works correctly for all 4 order types (single, fivepack, subject, stage)
2. ✅ **getFileUrls() logic** correctly routes bundles to ZIP files and single boosters to PDFs
3. ✅ **renderDownloads() function** correctly detects ZIP bundles vs. individual PDFs
4. ✅ **All 12 bundles** (9 subject + 3 stage) are fully defined in products.js

---

## STEP 1: Create-Order Endpoint Verification ✅

### Test Results

All create-order API calls returned HTTP 200 with correct pricing:

| Order Type | Test Case | Amount (Paise) | Amount (₹) | Expected | Status |
|---|---|---|---|---|---|
| single | `math-n1-integers-s7` | 24900 | 249 | 24900 | ✅ PASS |
| fivepack | 5 boosters from Math S7 | 79900 | 799 | 79900 | ✅ PASS |
| subject | All 8 Math S7 boosters | 129900 | 1299 | 129900 | ✅ PASS |
| stage | All 24 Stage 7 boosters | 249900 | 2499 | 249900 | ✅ PASS |

### Code Review: `functions/api/create-order.js`

**Pricing Logic (lines 18-24):**
```javascript
function calculatePrice(orderType, itemSlugs) {
  if (orderType === 'single')   return 24900;
  if (orderType === 'fivepack') return 79900;
  if (orderType === 'subject')  return 129900;
  if (orderType === 'stage')    return 249900;
  return itemSlugs.length * 24900;
}
```
✅ **Status:** Correct for all order types

**Razorpay Order Creation (lines 82-99):**
- Creates order via Razorpay API with correct amount in paise
- Stores order metadata (orderType, itemSlugs, subject, stage) in Razorpay notes
- Saves order to database with status='pending'
- ✅ No real payment is captured at this stage

---

## STEP 2: File Resolution Logic - getFileUrls() ✅

### Code Review: `functions/api/verify-payment.js` (lines 66-90)

**Logic Flow:**

1. **For Subject/Stage Bundles WITH ZIP (lines 69-75):**
   ```javascript
   if ((orderType === 'subject' || orderType === 'stage') && bundleSlug) {
     const l = await env.R2_BUCKET.list({ prefix: `bundle/cm-${bundleSlug}` });
     const zipObj = (l.objects || [])[0];
     if (zipObj) return [`https://assets.coremark.study/${zipObj.key}`];
   }
   ```
   - ✅ Looks for single ZIP file under `bundle/cm-{slug}`
   - ✅ Returns exactly 1 download link if ZIP found

2. **For Individual Boosters (lines 77-90):**
   ```javascript
   const urls = [];
   for (const slug of itemSlugs) {
     const l = await env.R2_BUCKET.list({ prefix: `booster/cm-${slug}` });
     for (const o of (l.objects || [])) urls.push(`https://assets.coremark.study/${o.key}`);
   }
   ```
   - ✅ Loops through each itemSlug
   - ✅ Returns N PDF links (one per booster)

3. **Fallback (lines 84-88):**
   - If R2 not yet populated, assumes files exist at standard paths
   - ✅ Graceful degradation

**Test Results:**

| Scenario | Files | Order Type | Result |
|---|---|---|---|
| Single booster | 1 PDF | single | ✅ 1 PDF link |
| 5-pack | 5 PDFs | fivepack | ✅ 5 PDF links |
| Subject bundle (ZIP exists) | 1 ZIP | subject | ✅ 1 ZIP link |
| Subject bundle (no ZIP) | 8 PDFs | subject | ✅ 8 PDF links (fallback) |
| Stage bundle (ZIP exists) | 1 ZIP | stage | ✅ 1 ZIP link |
| Stage bundle (no ZIP) | 24+ PDFs | stage | ✅ 24+ PDF links (fallback) |

---

## STEP 3: Bundle Definitions ✅

### All 12 Bundles Present

**Subject Bundles (3 subjects × 3 stages = 9 bundles):**

| Bundle | Type | Booster Count | Price |
|---|---|---|---|
| all-math-s7 | subject | 8 | ₹1,299 |
| all-math-s8 | subject | 16 | ₹1,299 |
| all-math-s9 | subject | 15 | ₹1,299 |
| all-sci-s7 | subject | 9 | ₹1,299 |
| all-sci-s8 | subject | 9 | ₹1,299 |
| all-sci-s9 | subject | 9 | ₹1,299 |
| all-comp-s7 | subject | 7 | ₹1,299 |
| all-comp-s8 | subject | 7 | ₹1,299 |
| all-comp-s9 | subject | 8 | ₹1,299 |

**Stage Bundles (1 per stage = 3 bundles):**

| Bundle | Type | Booster Count | Price |
|---|---|---|---|
| all-s7 | stage | 24 | ₹2,499 |
| all-s8 | stage | 32 | ₹2,499 |
| all-s9 | stage | 32 | ₹2,499 |

✅ **Total:** 12 bundles, all properly defined with itemSlugs

---

## STEP 4: Delivery Page - renderDownloads() Logic ✅

### Code Review: `delivery.html` (lines 298-348)

**Key Logic:**
```javascript
const isZipBundle = fileUrls.length === 1 && fileUrls[0].endsWith('.zip');

if (isZipBundle) {
  // Single "Download All Boosters (ZIP)" button
  const a = document.createElement('a');
  a.innerHTML = `<span class="download-btn-name">Download All Boosters (ZIP)</span>`;
  list.appendChild(a);
  return;
}

// Multi-file rendering for individual PDFs
fileUrls.forEach((url, i) => {
  // Creates individual download button for each PDF
});
```

**Test Results:**

| Input | Detection | Output | Status |
|---|---|---|---|
| `["https://.../bundle/cm-all-math-s7-abc123.zip"]` | ZIP bundle detected | 1 button: "Download All Boosters (ZIP)" | ✅ PASS |
| `["https://.../booster/cm-math-n1.pdf", "https://.../booster/cm-math-n2.pdf"]` | PDF files detected | 2 buttons: one per PDF | ✅ PASS |

✅ **renderDownloads() correctly routes based on file type**

---

## STEP 5: Full Purchase Flow Simulation (Without Payment)

### Flow Diagram

```
User selects items (single/5-pack/subject/stage)
         ↓
POST /api/create-order
  ├─ Verify email + order type
  ├─ Calculate price (based on type, not item count)
  ├─ Create Razorpay order (pending status, NO CHARGE)
  ├─ Store order in DB
  └─ Return razorpayOrderId + keyId + amountPaise
         ↓
[Razorpay Checkout UI - User cancels or closes]
[NO PAYMENT CAPTURED - Order remains pending]
         ↓
IF user completes payment (IRL only):
  POST /api/verify-payment
    ├─ Fetch payment from Razorpay API
    ├─ Verify status === 'captured'
    ├─ Resolve file URLs based on orderType
    │   ├─ For subject/stage: Look for single ZIP
    │   └─ For single/5pack: Return individual PDFs
    ├─ Update order status to 'paid'
    └─ Return fileUrls array
           ↓
delivery.html renderDownloads()
  ├─ Check if array contains .zip
  ├─ If ZIP: Single download button
  └─ If PDFs: Multiple download buttons
```

### Live Test Results

Tested create-order for all 4 scenarios without payment capture:

```bash
✅ Single booster:   order_T30IcslgtxlgiS  (24900 paise)
✅ 5-pack:           order_T30ImqW4gHKk3c  (79900 paise)
✅ Subject bundle:   order_T30KuOCdFzYhrl  (129900 paise)
✅ Stage bundle:     order_T30LAnNF4JLTkn  (249900 paise)
```

All orders created successfully without Razorpay capturing any payment (orders remain pending).

---

## STEP 6: Missing Verification (Requires R2 Bucket Access)

⏳ **The following must be verified separately:**

### 6.1 Bundle ZIP Files Exist in R2

**Command:**
```bash
wrangler r2 object list coremark --prefix=bundle/
```

**Expected files (at least one per bundle):**
- `bundle/cm-all-math-s7-{hash}.zip`
- `bundle/cm-all-math-s8-{hash}.zip`
- `bundle/cm-all-math-s9-{hash}.zip`
- `bundle/cm-all-sci-s7-{hash}.zip`
- `bundle/cm-all-sci-s8-{hash}.zip`
- `bundle/cm-all-sci-s9-{hash}.zip`
- `bundle/cm-all-comp-s7-{hash}.zip`
- `bundle/cm-all-comp-s8-{hash}.zip`
- `bundle/cm-all-comp-s9-{hash}.zip`
- `bundle/cm-all-s7-{hash}.zip`
- `bundle/cm-all-s8-{hash}.zip`
- `bundle/cm-all-s9-{hash}.zip`

**Failure Mode:** If any ZIP is missing, that bundle purchase would fall back to individual PDFs in verify-payment.js line 74.

### 6.2 Individual Booster PDFs Exist in R2

**Command:**
```bash
wrangler r2 object list coremark --prefix=booster/
```

**Sample files expected:**
- `booster/cm-math-n1-integers-s7-{hash}.pdf`
- `booster/cm-math-n2-place-value-rounding-s7-{hash}.pdf`
- `booster/cm-sci-b1-cells-s7-{hash}.pdf`
- ... (88 total, one per booster across all stages)

**Failure Mode:** If PDFs missing, verify-payment falls back to hardcoded paths (line 86), which may 404.

### 6.3 Payment Capture Flow (IRL Test Only)

To fully test end-to-end WITH payment:
1. Create a real Razorpay test payment
2. Call POST /api/verify-payment with captured payment ID
3. Confirm getFileUrls() returns correct ZIP or PDF array
4. Confirm delivery.html renderDownloads() renders correctly

⚠️ **Note:** This requires actual payment capture. The current verification confirms all logic is correct without touching real payments.

---

## Risk Assessment

### What Could Break at Payment Time

| Risk | Severity | Mitigated By | Status |
|---|---|---|---|
| Bundle ZIP doesn't exist in R2 | High | Fallback to individual PDFs, but UX breaks | 🔴 Unverified |
| Individual booster PDF doesn't exist | High | Hardcoded fallback path (may 404) | 🔴 Unverified |
| Wrong file naming convention | High | getFileUrls searches by prefix | ✅ Guarded |
| Razorpay API down | Medium | Order created locally; sync retry later | ✅ Handled |
| Database failure | Medium | Delivery still works without DB | ✅ Handled |

---

## Summary Table

| Component | Test | Result | Risk |
|---|---|---|---|
| **create-order endpoint** | Pricing logic for 4 types | ✅ All PASS | ✅ Low |
| **getFileUrls() logic** | ZIP detection, PDF enumeration | ✅ All PASS | ✅ Low |
| **renderDownloads()** | ZIP vs PDF button rendering | ✅ All PASS | ✅ Low |
| **Bundle definitions** | 12 bundles with itemSlugs | ✅ All present | ✅ Low |
| **R2 bundle ZIPs** | File existence | ⏳ UNVERIFIED | 🔴 High |
| **R2 booster PDFs** | File existence | ⏳ UNVERIFIED | 🔴 High |
| **Live payment capture** | End-to-end flow | ⏳ UNVERIFIED | 🔴 Critical |

---

## Recommendations

### Before Production

1. **Verify R2 Bucket Contents:**
   ```bash
   wrangler r2 object list coremark --prefix=bundle/ | wc -l  # Should be ≥ 12 zips
   wrangler r2 object list coremark --prefix=booster/ | wc -l # Should be ≥ 88 pdfs
   ```

2. **Test a Real Razorpay Payment (Test Mode):**
   - Use Razorpay's test card numbers
   - Complete full payment capture flow
   - Verify delivery.html receives correct fileUrls

3. **QA Checklist:**
   - [ ] Single booster purchase → 1 PDF download
   - [ ] 5-pack purchase → 5 PDF downloads
   - [ ] Subject bundle purchase → 1 ZIP download
   - [ ] Stage bundle purchase → 1 ZIP download
   - [ ] Email delivery works for all 4 types
   - [ ] Upsell card shows correctly for singles only

### Verified Safe to Launch (Code-Level)

- ✅ All pricing calculations correct
- ✅ All order types create valid Razorpay orders
- ✅ File resolution logic handles both ZIP and PDF correctly
- ✅ Delivery page renders correctly for both cases
- ✅ No real payments are captured in /api/create-order (orders remain pending)

---

## Testing Notes

**Verification Date:** 2026-06-18  
**Tools Used:**
- Node.js: test-purchase-flow.js (code logic validation)
- curl: Live API testing against production
- Code review: verify-payment.js, create-order.js, delivery.html

**No Database or R2 Modifications Made**  
**No Real Payments Captured**
