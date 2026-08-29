#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * Static export builder for Cloudflare Pages.
 *
 * Why not plain `next build`?
 * - API routes under pages/api/* are incompatible with `output: 'export'`.
 * - We temporarily stash them for the export build, then restore.
 *
 * Env:
 *   SITE_URL / NEXT_PUBLIC_SITE_URL  public origin, e.g. https://xxx.pages.dev
 *   STATIC_EXPORT=1                  set automatically here
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const apiDir = path.join(root, 'pages', 'api');
const stashDir = path.join(root, '.cf-static-stash', 'api');

function run(cmd, args, env = {}) {
  const result = spawnSync(cmd, args, {
    cwd: root,
    env: { ...process.env, ...env },
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });
  if (result.status !== 0) {
    throw new Error(
      `${cmd} ${args.join(' ')} failed with code ${result.status}`
    );
  }
}

function ensureCleanStash() {
  if (fs.existsSync(stashDir)) {
    fs.rmSync(stashDir, { recursive: true, force: true });
  }
  fs.mkdirSync(path.dirname(stashDir), { recursive: true });
}

function stashApi() {
  if (!fs.existsSync(apiDir)) {
    console.log('[build-static] no pages/api — skip stash');
    return false;
  }
  ensureCleanStash();
  fs.renameSync(apiDir, stashDir);
  console.log('[build-static] stashed pages/api → .cf-static-stash/api');
  return true;
}

function restoreApi(stashed) {
  if (!stashed) return;
  if (fs.existsSync(apiDir)) {
    fs.rmSync(apiDir, { recursive: true, force: true });
  }
  if (fs.existsSync(stashDir)) {
    fs.renameSync(stashDir, apiDir);
    console.log('[build-static] restored pages/api');
  }
  // clean empty stash parent if empty
  const parent = path.dirname(stashDir);
  try {
    if (fs.existsSync(parent) && fs.readdirSync(parent).length === 0) {
      fs.rmdirSync(parent);
    }
  } catch {
    // ignore
  }
}

function copyPublicHeaders() {
  // Cloudflare Pages reads _headers / _redirects from the output directory.
  const srcHeaders = path.join(root, 'public', '_headers');
  const outHeaders = path.join(root, 'out', '_headers');
  if (fs.existsSync(srcHeaders) && fs.existsSync(path.join(root, 'out'))) {
    fs.copyFileSync(srcHeaders, outHeaders);
    console.log('[build-static] copied public/_headers → out/_headers');
  }
  const srcRedirects = path.join(root, 'public', '_redirects');
  const outRedirects = path.join(root, 'out', '_redirects');
  if (fs.existsSync(srcRedirects) && fs.existsSync(path.join(root, 'out'))) {
    fs.copyFileSync(srcRedirects, outRedirects);
    console.log('[build-static] copied public/_redirects → out/_redirects');
  }
}

/** Cloudflare Pages rejects files > 25 MiB. AI search index is unused on static. */
function stripOversizedAssets() {
  const outDir = path.join(root, 'out');
  if (!fs.existsSync(outDir)) return;
  const limit = 25 * 1024 * 1024;
  const alwaysDrop = [path.join(outDir, 'static', 'search-index.json')];
  for (const file of alwaysDrop) {
    if (fs.existsSync(file)) {
      const size = fs.statSync(file).size;
      fs.unlinkSync(file);
      console.log(
        `[build-static] dropped ${path.relative(root, file)} (${(size / 1024 / 1024).toFixed(1)} MiB)`
      );
    }
  }
  // Safety net: drop any remaining file over the CF limit.
  const walk = (dir) => {
    for (const name of fs.readdirSync(dir)) {
      const full = path.join(dir, name);
      const st = fs.statSync(full);
      if (st.isDirectory()) walk(full);
      else if (st.size > limit) {
        fs.unlinkSync(full);
        console.log(
          `[build-static] dropped oversized ${path.relative(root, full)} (${(st.size / 1024 / 1024).toFixed(1)} MiB)`
        );
      }
    }
  };
  walk(outDir);
}

let stashed = false;
try {
  stashed = stashApi();

  const siteUrl = (
    process.env.SITE_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    'http://127.0.0.1:3460'
  ).replace(/\/$/, '');

  const env = {
    STATIC_EXPORT: '1',
    NEXT_PUBLIC_STATIC_EXPORT: '1',
    NEXT_IMAGE_UNOPTIMIZED: '1',
    SITE_URL: siteUrl,
    NEXT_PUBLIC_SITE_URL: siteUrl,
    // Avoid needing a real git SHA in CI.
    NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA:
      process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA ||
      process.env.CF_PAGES_COMMIT_SHA ||
      'cloudflare-pages',
  };

  console.log(`[build-static] SITE_URL=${siteUrl}`);
  console.log('[build-static] generating rss + sitemap');
  run('pnpm', ['generate:rss'], env);
  run('pnpm', ['generate:sitemap'], env);

  console.log('[build-static] next build (output: export)');
  run('pnpm', ['exec', 'next', 'build'], env);

  copyPublicHeaders();
  stripOversizedAssets();

  if (!fs.existsSync(path.join(root, 'out', 'index.html'))) {
    throw new Error('static export missing out/index.html');
  }
  console.log('[build-static] OK → out/');
} catch (error) {
  console.error('[build-static] FAILED:', error.message || error);
  process.exitCode = 1;
} finally {
  restoreApi(stashed);
}
