# SheetAutomate QA & Verification Evidence Report

- **Generated At:** 2026-11-27T03:37:41.313Z
- **Mode:** `ci`
- **Overall Status:** **PASS**
- **Total Duration:** 41.47s

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
| 1 | Validate Flows, Badges, Manifest, Extension & SEO/GEO Sync | **PASS** | 0.93s | 12 flows validated & bundled; extension zip 58.5 KB; SEO/GEO assets generated |
| 2 | Node Test Suites (tests/*.test.mjs) | **PASS** | 0.87s | 84/84 tests passed across 3 file(s) |
| 3 | Production Build & Code-Split Size Audit | **PASS** | 8.36s | Built 6 JS chunk(s), total 495.76 KB, largest 193.26 KB (0 over 380 KB) |
| 4 | Vitest Unit & Accessibility (axe-core) Suite | **PASS** | 11.35s | 9 Vitest test(s) passed across 1 file(s) |
| 5 | Modern Web Guidance Legacy Scan | **PASS** | 0.94s | modern-web-guidance legacy-scan passed cleanly |
| 6 | Playwright Headless E2E + SEO/GEO/Stability/Reflow/CLS | **PASS** | 10.32s | 11 Playwright E2E test(s) passed (0 skipped) |
| 7 | Preflight Accident Guard (--mode=deploy) | **PASS** | 0.12s | 4 preflight guard group(s) passed in deploy mode |
| 8 | GitHub Actions YAML & Deploy Dry-Run Check | **PASS** | 8.55s | GitHub Actions YAML validated & deploy-pages.mjs --dry-run READY |

## Production JS Bundle Chunks (`web/dist/assets/*.js`)

| Chunk | Size (KB) | Limit (380 KB) |
| --- | --- | --- |
| `flows-data-DvYfkVQb.js` | 193.26 KB | OK |
| `vendor-react-CfDz6BDZ.js` | 139.58 KB | OK |
| `index-BNN6EmAp.js` | 97.02 KB | OK |
| `FlowWorkbenchModal-Dwp-4WyU.js` | 37.89 KB | OK |
| `vendor-icons-BW4Nmgnx.js` | 21.88 KB | OK |
| `LegalModals-DN0_XPyE.js` | 6.14 KB | OK |
