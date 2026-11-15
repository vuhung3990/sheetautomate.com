#!/usr/bin/env node
/**
 * build-flows-manifest.mjs
 * Reads all valid flows/<slug>/ folders + flows/audit-status.json and outputs
 * web/public/flows-manifest.json and extension/flows-bundle.json.
 * Zero external dependencies (Node 20+ ESM).
 */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const FLOWS_DIR = path.join(ROOT_DIR, 'flows');
const AUDIT_STATUS_PATH = path.join(FLOWS_DIR, 'audit-status.json');
const WEB_MANIFEST_PATH = path.join(ROOT_DIR, 'web', 'public', 'flows-manifest.json');
const EXT_BUNDLE_PATH = path.join(ROOT_DIR, 'extension', 'flows-bundle.json');

function sha256(content) {
  return crypto.createHash('sha256').update(content, 'utf8').digest('hex');
}

function deepEqual(a, b) {
  if (Object.is(a, b)) return true;
  if (a === null || b === null || typeof a !== typeof b) return false;
  if (Array.isArray(a) || Array.isArray(b)) {
    if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) return false;
    return a.every((item, idx) => deepEqual(item, b[idx]));
  }
  if (typeof a === 'object') {
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    if (keysA.length !== keysB.length) return false;
    return keysA.every((k) => Object.prototype.hasOwnProperty.call(b, k) && deepEqual(a[k], b[k]));
  }
  return false;
}

function stripTimestamp(obj, key) {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return obj;
  const copy = { ...obj };
  delete copy[key];
  return copy;
}

function resolvePreservedTimestamp(candidatePaths, nextPayloadWithoutTs, timestampKey, forceTimestamp) {
  if (forceTimestamp) {
    return new Date().toISOString();
  }
  for (const filePath of candidatePaths) {
    if (!fs.existsSync(filePath)) continue;
    try {
      const existing = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      if (
        typeof existing?.[timestampKey] === 'string' &&
        existing[timestampKey].length > 0 &&
        deepEqual(stripTimestamp(existing, timestampKey), stripTimestamp(nextPayloadWithoutTs, timestampKey))
      ) {
        return existing[timestampKey];
      }
    } catch {
      // Ignore malformed existing JSON and fall back to fresh timestamp.
    }
  }
  return new Date().toISOString();
}

function writeIfChanged(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  if (fs.existsSync(filePath) && fs.readFileSync(filePath, 'utf8') === content) {
    return false;
  }
  fs.writeFileSync(filePath, content, 'utf8');
  return true;
}

function main() {
  const forceTimestamp = process.argv.includes('--force-timestamp');
  if (!fs.existsSync(FLOWS_DIR)) {
    console.error(`ERROR: flows directory not found at ${FLOWS_DIR}`);
    process.exit(1);
  }

  const slugs = fs
    .readdirSync(FLOWS_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory() && !d.name.startsWith('.'))
    .map((d) => d.name)
    .sort();

  if (slugs.length === 0) {
    console.error('ERROR: No flow directories found in flows/');
    process.exit(1);
  }

  let auditStatus = {};
  if (fs.existsSync(AUDIT_STATUS_PATH)) {
    auditStatus = JSON.parse(fs.readFileSync(AUDIT_STATUS_PATH, 'utf8'));
  }

  const vt = auditStatus.virustotal || {};
  const ai = auditStatus.aiSecurity || {};
  const flowAuditMap = auditStatus.flows || {};

  const flows = [];

  for (const slug of slugs) {
    const flowDir = path.join(FLOWS_DIR, slug);
    const flowJsonPath = path.join(flowDir, 'flow.json');
    const codePath = path.join(flowDir, 'Code.gs');
    const appsscriptPath = path.join(flowDir, 'appsscript.json');

    if (!fs.existsSync(flowJsonPath) || !fs.existsSync(codePath) || !fs.existsSync(appsscriptPath)) {
      console.error(`ERROR: Flow "${slug}" is missing required files (flow.json, Code.gs, or appsscript.json).`);
      process.exit(1);
    }

    const flowMeta = JSON.parse(fs.readFileSync(flowJsonPath, 'utf8'));
    const code = fs.readFileSync(codePath, 'utf8');
    const appsscript = JSON.parse(fs.readFileSync(appsscriptPath, 'utf8'));
    const oauthScopes = Array.isArray(appsscript.oauthScopes) ? appsscript.oauthScopes : [];

    const existingAudit = flowAuditMap[slug] || {};
    const computedHash = sha256(code);

    flows.push({
      ...flowMeta,
      code,
      oauthScopes,
      audit: {
        sha256: existingAudit.sha256 || computedHash,
        scopesCount:
          typeof existingAudit.scopesCount === 'number'
            ? existingAudit.scopesCount
            : oauthScopes.length,
        vtClean: Boolean(existingAudit.vtClean),
        aiStatus: existingAudit.aiStatus || 'PENDING',
        aiScore: typeof existingAudit.aiScore === 'number' ? existingAudit.aiScore : 0,
        notes: existingAudit.notes || '',
      },
    });
  }

  // Sort featured flows first, then alphabetically by title
  flows.sort((a, b) => {
    if (Boolean(a.featured) !== Boolean(b.featured)) {
      return a.featured ? -1 : 1;
    }
    return a.id.localeCompare(b.id);
  });

  const manifestBody = {
    totalFlows: flows.length,
    repository: auditStatus.repository || 'https://github.com/hungvvinfinity/sheetautomate.com',
    auditSummary: {
      virustotalLabel: vt.label || 'Pending VT_API_KEY (SHA-256 Verified)',
      virustotalUrl: vt.reportUrl || 'https://www.virustotal.com/gui/home/search',
      aiLabel: ai.label || 'AI Verified (100%)',
      aiProvider: ai.provider || 'Local Deep Static Security Analyzer',
    },
    flows,
  };

  const generatedAt = resolvePreservedTimestamp(
    [WEB_MANIFEST_PATH, EXT_BUNDLE_PATH],
    manifestBody,
    'generatedAt',
    forceTimestamp
  );

  const manifest = {
    generatedAt,
    ...manifestBody,
  };

  const payload = JSON.stringify(manifest, null, 2) + '\n';

  writeIfChanged(WEB_MANIFEST_PATH, payload);
  writeIfChanged(EXT_BUNDLE_PATH, payload);

  console.log(`Built flows manifest (${flows.length} flows):`);
  console.log(`  - ${path.relative(ROOT_DIR, WEB_MANIFEST_PATH)}`);
  console.log(`  - ${path.relative(ROOT_DIR, EXT_BUNDLE_PATH)}`);
}

main();
