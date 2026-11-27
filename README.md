# SheetAutomate.com

[![Audit Flows & Deploy SheetAutomate](https://github.com/vuhung3990/sheetautomate.com/actions/workflows/flows-audit-and-deploy.yml/badge.svg)](https://github.com/vuhung3990/sheetautomate.com/actions/workflows/flows-audit-and-deploy.yml)
![Open-Source Flows](./web/public/badges/flows-count.svg)
![VirusTotal Security](./web/public/badges/virustotal.svg)
![AI Security Gate](./web/public/badges/ai-security.svg)
[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](https://opensource.org/licenses/MIT)

> **100% Free Forever, Open-Source Google Workspace Automation Flows**  
> Copy-paste Google Apps Script automations that run 100% inside your own Google Drive & Sheets tenant. Zero recurring SaaS fees. Zero third-party servers. Zero telemetry.

---

## Architecture Overview

SheetAutomate uses **`flows/` as the single source of truth**. Every flow directory automatically feeds the website catalog, the Chrome Extension bundle, and the CI/CD security pipeline:

- **[`flows/`](./flows/)**: 12+ production-ready, MIT-licensed Google Apps Script flows (`b2b-client-invoice`, `gmail-invoice-extractor`, `monthly-ot-sheet-locker`, `field-service-work-order`, `completion-certificate-batch`, `multi-item-sales-quote`, `overdue-payment-reminder`, `inventory-low-stock-alert`, `hr-offer-letter-onboarding`, `form-approval-workflow`, `packing-slip-dispatch`, `weekly-kpi-digest-mailer`). Each folder contains `flow.json`, `Code.gs`, `appsscript.json`, `thumbnail.svg`, and `README.md`.
- **[`web/`](./web/)**: React 18 + TypeScript + Tailwind CSS + Vite catalog & interactive workbench (`https://sheetautomate.com`), auto-loading `flows/*/` via Vite and deploying to Cloudflare Pages.
- **[`extension/`](./extension/)**: Manifest V3 Chrome Extension with a searchable flow popup and a non-intrusive Google Sheets assistant drawer for 1-click **Copy Script** and **Copy Headers (TSV)**.
- **[`scripts/`](./scripts/)**: Zero-dependency Node 20+ ESM scripts for schema/security validation, VirusTotal bundle scanning, AI + Static AST security auditing, SVG badge generation, manifest bundling, extension `.zip` packaging, SEO/GEO asset generation (`generate-seo-geo-assets.mjs`), preflight accident guards (`preflight-guard.mjs`), safe Cloudflare Pages deploy (`deploy-pages.mjs`), Git hook setup (`install-git-hooks.mjs`), and the master QA pipeline (`run-all-checks.mjs`).
- **[`tests/`](./tests/)**: Node 20+ `node:test` suites covering Apps Script VM runtime behavior across all 12 flows (`flows-runtime.test.mjs`), security/idempotency gates (`security-gates.test.mjs`), and CI/CD + preflight guardrails (`ci-and-guards.test.mjs`), paired with Vitest + `axe-core` unit tests (`web/src/__tests__/`) and Playwright Chromium E2E checks (`web/e2e/`).
- **[`.github/workflows/flows-audit-and-deploy.yml`](./.github/workflows/flows-audit-and-deploy.yml)**: Automated CI/CD pipeline running on every PR and push to `main` (concurrency-guarded and safe without optional secrets).
- **[`structure.txt`](./structure.txt)**, **[`plan/`](./plan/)**, **[`idea/`](./idea/)**, **[`decision/`](./decision/)**, **[`reports/`](./reports/)**: Project map, roadmap, architecture decision records, and QA evidence reports (`reports/qa-evidence-report.md`, `reports/qa-evidence-report.json`).

---

## Triple-Audited CI/CD Security Pipeline

Every flow change goes through an automated 3-layer security pipeline before deployment:

1. **Schema & Static Gate (`scripts/validate-flows.mjs`)**: Verifies `flows/schema.json` compliance, `appsscript.json` (`V8`, least-privilege OAuth scopes—rejects `https://mail.google.com/` and full `drive`), `Code.gs` safety (blocks `eval`, `new Function`, `document.write`, hardcoded external `UrlFetchApp.fetch` URLs, checks `onOpen` and `LockService`), and SVG XSS safety.
2. **VirusTotal & Integrity Audit (`scripts/virustotal-audit.mjs`)**: Builds a deterministic archive of `flows/`, computes per-flow and bundle SHA-256 hashes, queries/uploads to VirusTotal API v3 (when `VT_API_KEY` is configured), and updates `flows/audit-status.json`.
3. **AI + Static AST Security Audit (`scripts/ai-security-audit.mjs`)**: Audits `Code.gs` and `appsscript.json` via Google Gemini (free-tier Flash models via `GEMINI_API_KEY`), Groq (`GROQ_API_KEY`), OpenRouter (`OPENROUTER_API_KEY`), OpenAI (`OPENAI_API_KEY`), or the Local Deep Static Security Analyzer fallback, with SHA-256 incremental caching and failing the build on any `FAIL` verdict.

---

## Quick Start (Local Development & Validation)

### 1. Validate & Audit Flows
```bash
# Validate all flows against schema, OAuth scope policy, and static security rules
node scripts/validate-flows.mjs

# Run local SHA-256 + AI static security dry-run
node scripts/virustotal-audit.mjs --dry-run
node scripts/ai-security-audit.mjs --dry-run

# Regenerate SVG badges, manifests, Chrome Extension zip, and SEO/GEO assets
node scripts/generate-badges.mjs
node scripts/build-flows-manifest.mjs
node scripts/package-extension.mjs
node scripts/generate-seo-geo-assets.mjs
```

### 2. Run the Website
```bash
cd web
npm install
npm run dev
# Production build check:
npm run build
```

### 3. QA, E2E Verification & Accident Guardrails
```bash
# Run the full 8-stage QA & Evidence pipeline (generates reports/qa-evidence-report.md & .json)
node scripts/run-all-checks.mjs --ci
# Or from web/:
cd web && npm run test:all

# Install local Git hooks (.githooks/pre-commit & pre-push)
node scripts/install-git-hooks.mjs

# Run preflight accident guard & safe Cloudflare Pages dry-run deploy check
node scripts/preflight-guard.mjs --mode=deploy
node scripts/deploy-pages.mjs --dry-run
```

#### SEO & GEO Endpoints
Generated deterministically into `web/public/` during sync/build:
- `/robots.txt` & `/sitemap.xml` (crawler rules and dynamic flow URLs)
- `/llms.txt` & `/llms-full.txt` (structured AI/LLM reference summaries and full flow catalog)
- `/og-image.png` (`1200x630`), `/favicon.svg`, and `/manifest.webmanifest`
- Schema.org JSON-LD `@graph` in [`web/index.html`](./web/index.html)

### 4. Load the Chrome Extension Locally
1. Run `node scripts/build-flows-manifest.mjs` to ensure `extension/flows-bundle.json` is up to date.
2. Open `chrome://extensions` in Chrome, enable **Developer mode**, click **Load unpacked**, and select the [`extension/`](./extension/) directory.
3. Or download the packaged bundle generated at `web/public/downloads/sheetautomate-chrome-extension.zip`.

---

## Contributing a Flow

1. Copy an existing flow folder (e.g. `flows/b2b-client-invoice`) to `flows/<your-slug>`.
2. Keep `appsscript.json` strictly least-privilege (`spreadsheets.currentonly`, `drive.file`, etc.) and guard execution with `LockService.getScriptLock()`.
3. Run `node scripts/validate-flows.mjs` and `node scripts/ai-security-audit.mjs --dry-run`.
4. Open a Pull Request — GitHub Actions will automatically validate, audit, and post a security summary comment on your PR.
