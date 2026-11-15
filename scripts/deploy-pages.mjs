#!/usr/bin/env node
/**
 * deploy-pages.mjs
 * Safe Cloudflare Pages deployment wrapper:
 *   1. Builds web/ (which runs prebuild -> npm run sync)
 *   2. Runs scripts/preflight-guard.mjs --mode=deploy
 *   3. In --dry-run mode logs readiness and exits 0; otherwise deploys via Wrangler
 * Never logs or exposes environment tokens.
 * Zero external dependencies (Node 20+ ESM).
 */

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const WEB_DIR = path.join(ROOT_DIR, 'web');
const PREFLIGHT_SCRIPT = path.join(ROOT_DIR, 'scripts', 'preflight-guard.mjs');

const isDryRun = process.argv.includes('--dry-run');

function getNodeBinDir() {
  try {
    return path.dirname(fs.realpathSync(process.execPath));
  } catch {
    return path.dirname(process.execPath);
  }
}

function buildChildEnv() {
  const nodeBinDir = getNodeBinDir();
  const currentPath = process.env.PATH || '';
  const pathParts = currentPath.split(path.delimiter).filter(Boolean);
  const nextPath = pathParts.includes(nodeBinDir)
    ? currentPath
    : [nodeBinDir, ...pathParts].join(path.delimiter);
  return { ...process.env, PATH: nextPath };
}

function resolveTool(name) {
  const candidate = path.join(getNodeBinDir(), name);
  if (fs.existsSync(candidate)) {
    return candidate;
  }
  return name;
}

function runStep(label, command, args, cwd) {
  console.log(`\n==> ${label}`);
  const resolved = command === 'npm' || command === 'npx' ? resolveTool(command) : command;
  try {
    execFileSync(resolved, args, {
      cwd,
      stdio: 'inherit',
      env: buildChildEnv(),
    });
  } catch (err) {
    const code = typeof err?.status === 'number' ? err.status : 1;
    console.error(`ERROR: Step "${label}" failed with exit code ${code}.`);
    process.exit(code);
  }
}

function main() {
  runStep('Step 1/3: Build web production bundle (includes npm run sync)', 'npm', ['run', 'build'], WEB_DIR);

  runStep(
    'Step 2/3: Run deploy preflight accident guards',
    process.execPath,
    [PREFLIGHT_SCRIPT, '--mode=deploy'],
    ROOT_DIR
  );

  if (isDryRun) {
    console.log('\n==> Step 3/3: Dry-run mode enabled');
    console.log('READY: web/dist passed all build and deploy preflight guards. Skipping Wrangler upload.');
    process.exit(0);
  }

  runStep(
    'Step 3/3: Deploy web/dist to Cloudflare Pages (project=sheetautomate, branch=main)',
    'npx',
    [
      '--yes',
      'wrangler',
      'pages',
      'deploy',
      'web/dist',
      '--project-name=sheetautomate',
      '--branch=main',
      '--commit-dirty=true',
    ],
    ROOT_DIR
  );

  console.log('\nDeployment completed successfully.');
}

main();
