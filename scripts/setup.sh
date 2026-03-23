#!/usr/bin/env bash
# Setup script: install deps, generate env, build
set -euo pipefail

info() { echo -e "\033[1;34m[setup]\033[0m $*"; }
ok()   { echo -e "\033[1;32m[OK]\033[0m $*"; }

cd "$(dirname "$0")/.."

info "Installing dependencies..."
if ! command -v pnpm &>/dev/null; then
  corepack enable && corepack prepare pnpm@latest --activate
fi
pnpm install
ok "Dependencies installed"

if [[ ! -f .env.local ]]; then
  cp .env.example .env.local
  ok "Created .env.local — edit it with your credentials"
else
  ok ".env.local exists"
fi

info "Building project..."
pnpm build
ok "Build complete"

echo ""
ok "Setup done. Run 'pnpm dev' to start the dev server."
