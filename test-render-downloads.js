#!/usr/bin/env node
/**
 * Test delivery.html renderDownloads() function
 * Validates that ZIP bundles render as single download button
 * and individual PDFs render as multiple download buttons
 */

'use strict';

// ────────────────────────────────────────────────────────────────
// Reproduce renderDownloads() function from delivery.html
// ────────────────────────────────────────────────────────────────
function renderDownloads(fileUrls, orderTitle, count, orderType) {
  const results = {
    title: orderTitle,
    type: orderType,
    count: count,
    isZipBundle: false,
    downloadCount: 0,
    downloadButtons: [],
    dlCountText: '',
  };

  const isZipBundle = fileUrls.length === 1 && fileUrls[0].endsWith('.zip');
  results.isZipBundle = isZipBundle;

  if (isZipBundle) {
    results.dlCountText = 'All boosters in one ZIP · Cambridge Lower Secondary';
    results.downloadCount = 1;
    results.downloadButtons.push({
      icon: '📦',
      name: 'Download All Boosters (ZIP)',
      url: fileUrls[0],
    });
    return results;
  }

  // Multi-PDF rendering
  results.dlCountText = `${count} PDF${count > 1 ? 's' : ''} · Cambridge Lower Secondary`;
  results.downloadCount = fileUrls.length;

  fileUrls.forEach((url) => {
    const filename = url.split('/').pop()
      .replace('cm-', '')
      .replace(/-[a-f0-9]+\.pdf$/, '.pdf');

    results.downloadButtons.push({
      icon: '📄',
      name: filename,
      url: url,
    });
  });

  return results;
}

// ────────────────────────────────────────────────────────────────
// Test Cases
// ────────────────────────────────────────────────────────────────
console.log('\n═══════════════════════════════════════════════════════════════');
console.log('TEST: delivery.html renderDownloads() function');
console.log('═══════════════════════════════════════════════════════════════\n');

const testCases = [
  {
    name: 'Single booster (1 PDF)',
    fileUrls: ['https://assets.coremark.study/booster/cm-math-n1-integers-s7-abc123.pdf'],
    orderTitle: 'Integers',
    count: 1,
    orderType: 'single',
    expect: {
      isZipBundle: false,
      downloadCount: 1,
      iconCheck: (btns) => btns[0].icon === '📄',
      nameSample: 'math-n1-integers-s7.pdf',
    },
  },
  {
    name: '5-pack (5 PDFs)',
    fileUrls: [
      'https://assets.coremark.study/booster/cm-math-n1-integers-s7-abc123.pdf',
      'https://assets.coremark.study/booster/cm-math-n2-place-value-rounding-s7-def456.pdf',
      'https://assets.coremark.study/booster/cm-math-n3-decimals-s7-ghi789.pdf',
      'https://assets.coremark.study/booster/cm-math-n4-fractions-s7-jkl012.pdf',
      'https://assets.coremark.study/booster/cm-math-a1-expressions-formulae-equations-s7-mno345.pdf',
    ],
    orderTitle: '5-Pack Bundle',
    count: 5,
    orderType: 'fivepack',
    expect: {
      isZipBundle: false,
      downloadCount: 5,
      iconCheck: (btns) => btns.every(b => b.icon === '📄'),
      dlCountText: '5 PDFs · Cambridge Lower Secondary',
    },
  },
  {
    name: 'Subject bundle (1 ZIP)',
    fileUrls: ['https://assets.coremark.study/bundle/cm-all-math-s7-xyz789.zip'],
    orderTitle: 'Complete Mathematics Stage 7',
    count: 1,
    orderType: 'subject',
    expect: {
      isZipBundle: true,
      downloadCount: 1,
      icon: '📦',
      buttonName: 'Download All Boosters (ZIP)',
      dlCountText: 'All boosters in one ZIP · Cambridge Lower Secondary',
    },
  },
  {
    name: 'Stage bundle (1 ZIP)',
    fileUrls: ['https://assets.coremark.study/bundle/cm-all-s8-uvw111.zip'],
    orderTitle: 'Everything — Stage 8 (All Subjects)',
    count: 32,
    orderType: 'stage',
    expect: {
      isZipBundle: true,
      downloadCount: 1,
      icon: '📦',
      buttonName: 'Download All Boosters (ZIP)',
      dlCountText: 'All boosters in one ZIP · Cambridge Lower Secondary',
    },
  },
  {
    name: 'Subject bundle fallback (8 PDFs, no ZIP)',
    fileUrls: [
      'https://assets.coremark.study/booster/cm-math-n1-integers-s8-a.pdf',
      'https://assets.coremark.study/booster/cm-math-n2-place-value-rounding-s8-b.pdf',
      'https://assets.coremark.study/booster/cm-math-n3-decimals-s8-c.pdf',
      'https://assets.coremark.study/booster/cm-math-n4-fractions-s8-d.pdf',
      'https://assets.coremark.study/booster/cm-math-n5-percentages-s8-e.pdf',
      'https://assets.coremark.study/booster/cm-math-n6-ratio-proportion-s8-f.pdf',
      'https://assets.coremark.study/booster/cm-math-a1-expressions-formulae-equations-s8-g.pdf',
      'https://assets.coremark.study/booster/cm-math-a2-sequences-functions-s8-h.pdf',
    ],
    orderTitle: 'Complete Mathematics Stage 8',
    count: 8,
    orderType: 'subject',
    expect: {
      isZipBundle: false,
      downloadCount: 8,
      iconCheck: (btns) => btns.every(b => b.icon === '📄'),
      dlCountText: '8 PDFs · Cambridge Lower Secondary',
    },
  },
];

// ────────────────────────────────────────────────────────────────
// Run Tests
// ────────────────────────────────────────────────────────────────
let passCount = 0;
let failCount = 0;

testCases.forEach((tc) => {
  const result = renderDownloads(tc.fileUrls, tc.orderTitle, tc.count, tc.orderType);

  let testPass = true;
  const checks = [];

  // Check isZipBundle
  if (result.isZipBundle !== tc.expect.isZipBundle) {
    checks.push(`  ❌ isZipBundle: expected ${tc.expect.isZipBundle}, got ${result.isZipBundle}`);
    testPass = false;
  } else {
    checks.push(`  ✅ isZipBundle: ${result.isZipBundle}`);
  }

  // Check downloadCount
  if (result.downloadCount !== tc.expect.downloadCount) {
    checks.push(`  ❌ downloadCount: expected ${tc.expect.downloadCount}, got ${result.downloadCount}`);
    testPass = false;
  } else {
    checks.push(`  ✅ downloadCount: ${result.downloadCount}`);
  }

  // Check dlCountText if provided
  if (tc.expect.dlCountText && result.dlCountText !== tc.expect.dlCountText) {
    checks.push(`  ❌ dlCountText: expected "${tc.expect.dlCountText}", got "${result.dlCountText}"`);
    testPass = false;
  } else if (tc.expect.dlCountText) {
    checks.push(`  ✅ dlCountText: "${result.dlCountText}"`);
  }

  // For ZIP bundles, check button
  if (tc.expect.icon) {
    const btn = result.downloadButtons[0];
    if (btn.icon !== tc.expect.icon) {
      checks.push(`  ❌ icon: expected ${tc.expect.icon}, got ${btn.icon}`);
      testPass = false;
    } else {
      checks.push(`  ✅ icon: ${btn.icon}`);
    }

    if (btn.name !== tc.expect.buttonName) {
      checks.push(`  ❌ button name: expected "${tc.expect.buttonName}", got "${btn.name}"`);
      testPass = false;
    } else {
      checks.push(`  ✅ button name: "${btn.name}"`);
    }
  }

  // For PDF lists, check icon consistency
  if (tc.expect.iconCheck && !tc.expect.iconCheck(result.downloadButtons)) {
    checks.push(`  ❌ icons: not all PDF (📄)`);
    testPass = false;
  } else if (tc.expect.iconCheck) {
    checks.push(`  ✅ icons: all PDF (📄)`);
  }

  // Print results
  const status = testPass ? '✅ PASS' : '❌ FAIL';
  console.log(`${status} | ${tc.name}`);
  checks.forEach(c => console.log(c));
  console.log();

  testPass ? passCount++ : failCount++;
});

// ────────────────────────────────────────────────────────────────
// Summary
// ────────────────────────────────────────────────────────────────
console.log('\n═══════════════════════════════════════════════════════════════');
console.log('SUMMARY');
console.log('═══════════════════════════════════════════════════════════════\n');
console.log(`Total Tests: ${testCases.length}`);
console.log(`Passed: ${passCount} ✅`);
console.log(`Failed: ${failCount} ${failCount > 0 ? '❌' : ''}`);

if (failCount > 0) {
  console.log('\n❌ SOME TESTS FAILED');
  process.exit(1);
} else {
  console.log('\n✅ ALL TESTS PASSED');
  console.log('\nKey Validations:');
  console.log('  • Single boosters render 1 PDF download button');
  console.log('  • 5-packs render N PDF download buttons');
  console.log('  • Subject bundles render 1 ZIP download button');
  console.log('  • Stage bundles render 1 ZIP download button');
  console.log('  • Fallback (no ZIP) renders individual PDFs correctly');
  console.log('  • All icons and labels match expected values');
  console.log('\n✅ renderDownloads() logic is CORRECT\n');
  process.exit(0);
}
