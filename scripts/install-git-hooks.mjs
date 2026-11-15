#!/usr/bin/env node
/**
 * install-git-hooks.mjs
 * Marks .githooks/* scripts executable (chmod +x) and configures
 * git config core.hooksPath .githooks for this repository.
 * Zero external dependencies (Node 20+ ESM).
 */

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const HOOKS_DIR = path.join(ROOT_DIR, '.githooks');

function main() {
  if (!fs.existsSync(HOOKS_DIR) || !fs.statSync(HOOKS_DIR).isDirectory()) {
    console.error(`ERROR: .githooks directory not found at ${HOOKS_DIR}`);
    process.exit(1);
  }

  const entries = fs.readdirSync(HOOKS_DIR, { withFileTypes: true });
  const installed = [];

  for (const entry of entries) {
    if (!entry.isFile()) continue;
    const hookPath = path.join(HOOKS_DIR, entry.name);
    fs.chmodSync(hookPath, 0o755);
    installed.push(entry.name);
  }

  execFileSync('git', ['config', 'core.hooksPath', '.githooks'], {
    cwd: ROOT_DIR,
    stdio: 'inherit',
  });

  console.log(`Configured git core.hooksPath -> .githooks (${installed.join(', ')})`);
}

main();
