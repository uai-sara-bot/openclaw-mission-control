# Contributing to OpenClaw Mission Control

Thanks for your interest in contributing!

## Development Setup

1. Fork and clone the repo
2. Run `bash scripts/setup.sh` or manually:
   ```bash
   corepack enable && corepack prepare pnpm@latest --activate
   pnpm install
   cp .env.example .env.local
   ```
3. Start the dev server: `pnpm dev`

## Code Standards

- **TypeScript** strict mode — no `any` unless absolutely necessary
- **Tailwind CSS** for styling — avoid inline styles
- **shadcn/ui** for components — use existing primitives before creating custom ones
- Run `pnpm lint` before committing
- Run `pnpm build` to verify the production build passes

## Pull Requests

1. Create a feature branch from `main`
2. Make your changes with clear, focused commits
3. Ensure `pnpm lint` and `pnpm build` pass
4. Open a PR with a description of what changed and why

## Project Structure

```
src/
  app/           # Next.js App Router pages
  components/    # React components
  lib/           # Utilities, Supabase client, stores
  types/         # TypeScript type definitions
docs/            # Documentation
scripts/         # Build and setup scripts
```

## Design System

- **Theme:** Dark background (#0A0A0F), card surfaces (#1A1A2E)
- **Accent colors:** Blue (#3B82F6), Green (#10B981), Purple (#8B5CF6), Red (#EF4444), Orange (#F59E0B)
- **Fonts:** Inter (sans), JetBrains Mono (mono)

## Issues

Report bugs or request features via GitHub Issues.
