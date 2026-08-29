#!/usr/bin/env bash
# Build the static export and publish it to Cloudflare Pages.
#
# Usage:
#   scripts/deploy-pages.sh                 # production (branch main)
#   scripts/deploy-pages.sh preview         # preview deployment
#
# Env overrides:
#   PROJECT_NAME  Pages project            (default xhs-agent-garden)
#   SITE_URL      public origin baked into meta/rss/sitemap
#                                          (default https://takina.xyz)
set -euo pipefail

readonly PROJECT_NAME="${PROJECT_NAME:-xhs-agent-garden}"
readonly SITE_URL="${SITE_URL:-https://takina.xyz}"
readonly WRANGLER_VERSION="${WRANGLER_VERSION:-4}"

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

branch="main"
if [[ "${1:-}" == "preview" ]]; then
  branch="$(git rev-parse --abbrev-ref HEAD)"
  if [[ "$branch" == "main" ]]; then
    echo "error: preview requested but HEAD is main" >&2
    exit 1
  fi
fi

for tool in node pnpm git npx; do
  command -v "$tool" >/dev/null || { echo "error: missing $tool" >&2; exit 1; }
done

echo "==> gates"
pnpm lint
pnpm check-format
pnpm type-check
pnpm test:run

echo "==> build (SITE_URL=$SITE_URL)"
export SITE_URL
pnpm build:static

# The export must contain the pieces the site is useless without.
for required in out/index.html out/rss.xml out/sitemap.xml; do
  [[ -f "$required" ]] || { echo "error: missing $required" >&2; exit 1; }
done
posts="$(find out/posts -name index.html | wc -l | tr -d ' ')"
[[ "$posts" -gt 0 ]] || { echo "error: no post pages exported" >&2; exit 1; }
echo "    exported $posts posts"

echo "==> deploy to $PROJECT_NAME (branch $branch)"
npx --yes "wrangler@$WRANGLER_VERSION" pages deploy out \
  --project-name "$PROJECT_NAME" \
  --branch "$branch" \
  --commit-dirty=true
