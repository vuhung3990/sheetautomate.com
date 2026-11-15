# SheetAutomate QA & Verification Evidence Report

- **Generated At:** 2026-11-14T01:33:44.345Z
- **Mode:** `ci`
- **Overall Status:** **PASS**
- **Total Duration:** 31.98s

## Evaluation Scorecard

| Criterion | Verdict | Quantitative Evidence |
| --- | --- | --- |
| 1. Website Stability & Zero Errors | **PASS** | Build: PASS (6 JS chunks, largest 193.26 KB); Vitest/axe: PASS (9 Vitest test(s) passed across 1 file(s)); Playwright: PASS (11 Playwright E2E test(s) passed (0 skipped)) |
| 2. SEO & GEO + Modern Web Guidance | **PASS** | Dist SEO/GEO artifacts: 5/5 present (robots.txt, sitemap.xml, llms.txt, llms-full.txt, og-image.png); Legacy scan: PASS; E2E SEO/GEO: PASS |
| 3. GitHub Actions Zero-Error Workflow | **PASS** | Workflow YAML valid=true; secrets-in-if=0; Node tests: PASS (84/84 tests passed across 3 file(s)) |
| 4. Flows & Extension Functionality | **PASS** | Flows validated: 12; Extension zip: 58.5 KB; Guard sync: PASS |
| 5. Dev/Deploy Accident Guardrails | **PASS** | Preflight (deploy): PASS (4 passed); Deploy dry-run: true |

## Detailed Check Results

| # | Check | Status | Duration | Summary |
| --- | --- | --- | --- | --- |
| 1 | Validate Flows, Badges, Manifest, Extension & SEO/GEO Sync | **PASS** | 1.59s | 12 flows validated & bundled; extension zip 58.5 KB; SEO/GEO assets generated |
| 2 | Node Test Suites (tests/*.test.mjs) | **PASS** | 2.80s | 84/84 tests passed across 3 file(s) |
| 3 | Production Build & Code-Split Size Audit | **PASS** | 5.12s | Built 6 JS chunk(s), total 495.72 KB, largest 193.26 KB (0 over 380 KB) |
| 4 | Vitest Unit & Accessibility (axe-core) Suite | **PASS** | 7.21s | 9 Vitest test(s) passed across 1 file(s) |
| 5 | Modern Web Guidance Legacy Scan | **PASS** | 2.12s | modern-web-guidance legacy-scan passed cleanly |
| 6 | Playwright Headless E2E + SEO/GEO/Stability/Reflow/CLS | **PASS** | 6.51s | 11 Playwright E2E test(s) passed (0 skipped) |
| 7 | Preflight Accident Guard (--mode=deploy) | **PASS** | 0.37s | 4 preflight guard group(s) passed in deploy mode |
| 8 | GitHub Actions YAML & Deploy Dry-Run Check | **PASS** | 6.23s | GitHub Actions YAML validated & deploy-pages.mjs --dry-run READY |

## Production JS Bundle Chunks (`web/dist/assets/*.js`)

| Chunk | Size (KB) | Limit (380 KB) |
| --- | --- | --- |
| `flows-data-DvYfkVQb.js` | 193.26 KB | OK |
| `vendor-react-CfDz6BDZ.js` | 139.58 KB | OK |
| `index-DCAaUzed.js` | 96.98 KB | OK |
| `FlowWorkbenchModal-2WuQ2CsB.js` | 37.89 KB | OK |
| `vendor-icons-BW4Nmgnx.js` | 21.88 KB | OK |
| `LegalModals-DN0_XPyE.js` | 6.14 KB | OK |
