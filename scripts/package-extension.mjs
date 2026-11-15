#!/usr/bin/env node
/**
 * package-extension.mjs
 * Validates extension/manifest.json (MV3) and extension/flows-bundle.json,
 * then deterministically packages extension/ into
 * web/public/downloads/sheetautomate-chrome-extension.zip via python3 zipfile.
 * Zero external dependencies (Node 20+ ESM).
 */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const EXT_DIR = path.join(ROOT_DIR, 'extension');
const MANIFEST_PATH = path.join(EXT_DIR, 'manifest.json');
const BUNDLE_PATH = path.join(EXT_DIR, 'flows-bundle.json');
const OUTPUT_ZIP_PATH = path.join(
  ROOT_DIR,
  'web',
  'public',
  'downloads',
  'sheetautomate-chrome-extension.zip'
);

function main() {
  if (!fs.existsSync(EXT_DIR)) {
    console.error(`ERROR: extension directory not found at ${EXT_DIR}`);
    process.exit(1);
  }

  if (!fs.existsSync(MANIFEST_PATH)) {
    console.error(`ERROR: extension/manifest.json not found at ${MANIFEST_PATH}`);
    process.exit(1);
  }

  let manifest;
  try {
    manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
  } catch (err) {
    console.error(`ERROR: Invalid JSON in extension/manifest.json: ${err.message}`);
    process.exit(1);
  }

  if (manifest.manifest_version !== 3) {
    console.error(
      `ERROR: extension/manifest.json must have manifest_version === 3 (got ${manifest.manifest_version})`
    );
    process.exit(1);
  }

  if (typeof manifest.name !== 'string' || typeof manifest.version !== 'string') {
    console.error('ERROR: extension/manifest.json missing valid "name" or "version"');
    process.exit(1);
  }

  if (!fs.existsSync(BUNDLE_PATH)) {
    console.error(
      `ERROR: extension/flows-bundle.json not found. Run scripts/build-flows-manifest.mjs first.`
    );
    process.exit(1);
  }

  let bundle;
  try {
    bundle = JSON.parse(fs.readFileSync(BUNDLE_PATH, 'utf8'));
  } catch (err) {
    console.error(`ERROR: Invalid JSON in extension/flows-bundle.json: ${err.message}`);
    process.exit(1);
  }

  if (!Array.isArray(bundle.flows) || bundle.flows.length === 0) {
    console.error('ERROR: extension/flows-bundle.json must contain a non-empty "flows" array');
    process.exit(1);
  }

  fs.mkdirSync(path.dirname(OUTPUT_ZIP_PATH), { recursive: true });

  const pyScript = `
import os, sys, zipfile

ext_dir = sys.argv[1]
out_zip = sys.argv[2]

skip_names = {'.DS_Store', 'Thumbs.db', 'desktop.ini'}
entries = []

for root, dirs, files in os.walk(ext_dir):
    dirs[:] = sorted(d for d in dirs if not d.startswith('.') and d != '__pycache__')
    for fname in sorted(files):
        if fname in skip_names or fname.startswith('.') or fname.endswith('.swp'):
            continue
        full_path = os.path.join(root, fname)
        rel_path = os.path.relpath(full_path, ext_dir).replace(os.sep, '/')
        entries.append((rel_path, full_path))

entries.sort(key=lambda x: x[0])

with zipfile.ZipFile(out_zip, 'w', compression=zipfile.ZIP_DEFLATED, compresslevel=9) as zf:
    for rel_path, full_path in entries:
        zi = zipfile.ZipInfo(rel_path, date_time=(2026, 1, 1, 0, 0, 0))
        zi.compress_type = zipfile.ZIP_DEFLATED
        zi.external_attr = (0o644 & 0xFFFF) << 16
        with open(full_path, 'rb') as f:
            zf.writestr(zi, f.read())

print(len(entries))
`;

  const fileCount = execFileSync('python3', ['-c', pyScript, EXT_DIR, OUTPUT_ZIP_PATH], {
    encoding: 'utf8',
  }).trim();

  const zipBytes = fs.readFileSync(OUTPUT_ZIP_PATH);
  const sha256 = crypto.createHash('sha256').update(zipBytes).digest('hex');
  const sizeKb = (zipBytes.length / 1024).toFixed(1);

  console.log(
    `Packaged Chrome Extension v${manifest.version} (MV3, ${fileCount} files, ${sizeKb} KB)`
  );
  console.log(`  - Output: ${path.relative(ROOT_DIR, OUTPUT_ZIP_PATH)}`);
  console.log(`  - SHA-256: ${sha256}`);
}

main();
