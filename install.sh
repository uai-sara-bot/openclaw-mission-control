#!/usr/bin/env bash
# OpenClaw Mission Control — Quick Installer
#
# Usage:
#   bash install.sh [--docker|--local] [--port PORT]

set -euo pipefail

MC_PORT="${MC_PORT:-3000}"
DEPLOY_MODE=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --docker) DEPLOY_MODE="docker"; shift ;;
    --local)  DEPLOY_MODE="local"; shift ;;
    --port)   MC_PORT="$2"; shift 2 ;;
    -h|--help)
      echo "Usage: install.sh [--docker|--local] [--port PORT]"
      exit 0 ;;
    *) echo "Unknown option: $1"; exit 1 ;;
  esac
done

info()  { echo -e "\033[1;34m[MC]\033[0m $*"; }
ok()    { echo -e "\033[1;32m[OK]\033[0m $*"; }
warn()  { echo -e "\033[1;33m[!!]\033[0m $*"; }
err()   { echo -e "\033[1;31m[ERR]\033[0m $*" >&2; }
die()   { err "$*"; exit 1; }

command_exists() { command -v "$1" &>/dev/null; }

check_prerequisites() {
  local has_docker=false has_node=false

  if command_exists docker && docker info &>/dev/null 2>&1; then
    has_docker=true
    ok "Docker available ($(docker --version | head -1))"
  fi

  if command_exists node; then
    local node_major
    node_major=$(node -v | sed 's/v//' | cut -d. -f1)
    if [[ "$node_major" -ge 20 ]]; then
      has_node=true
      ok "Node.js $(node -v) available"
    else
      warn "Node.js $(node -v) found but v20+ required"
    fi
  fi

  if ! $has_docker && ! $has_node; then
    die "Either Docker or Node.js 20+ is required."
  fi

  if [[ -z "$DEPLOY_MODE" ]]; then
    if $has_docker; then
      DEPLOY_MODE="docker"
      info "Auto-selected Docker deployment (use --local to override)"
    else
      DEPLOY_MODE="local"
      info "Auto-selected local deployment"
    fi
  fi
}

setup_env() {
  if [[ ! -f .env.local ]]; then
    if [[ -f .env.example ]]; then
      cp .env.example .env.local
      ok "Created .env.local from .env.example"
      warn "Edit .env.local with your Supabase and gateway credentials"
    fi
  else
    ok ".env.local already exists"
  fi
}

deploy_docker() {
  info "Starting Docker deployment..."
  MC_PORT="$MC_PORT" docker compose up -d --build
  ok "Mission Control running at http://localhost:$MC_PORT"
}

deploy_local() {
  info "Starting local deployment..."

  if command_exists pnpm; then
    ok "pnpm found"
  elif command_exists corepack; then
    corepack enable && corepack prepare pnpm@latest --activate
    ok "pnpm activated via corepack"
  else
    die "pnpm or corepack required"
  fi

  pnpm install
  ok "Dependencies installed"

  setup_env

  info "Starting dev server on port $MC_PORT..."
  PORT="$MC_PORT" pnpm dev
}

main() {
  info "OpenClaw Mission Control Installer"
  echo ""

  check_prerequisites
  setup_env

  case "$DEPLOY_MODE" in
    docker) deploy_docker ;;
    local)  deploy_local ;;
    *)      die "Unknown deploy mode: $DEPLOY_MODE" ;;
  esac
}

main
