# Supabase Setup Guide

## Step 1: Create Tables

Go to [Supabase Dashboard SQL Editor](https://supabase.com/dashboard/project/advxcrconarkrhfzstlf/sql/new) and run the SQL in `supabase/migrations/001_create_tables.sql`.

Or copy-paste directly:

```sql
-- Run this entire file in Supabase Dashboard → SQL Editor
-- https://supabase.com/dashboard/project/advxcrconarkrhfzstlf/sql/new
```

## Step 2: Get Database Password

For programmatic migrations, get the DB password from:
Supabase Dashboard → Project Settings → Database → Connection string

Add to Railway MC service env vars:
```
DATABASE_URL=postgresql://postgres.advxcrconarkrhfzstlf:[YOUR_DB_PASSWORD]@aws-0-us-east-1.pooler.supabase.com:5432/postgres
```

## Step 3: Seed Real Data

After tables are created, call:
```bash
# Seed agents + cron jobs
curl -X POST https://mission-control-production-75d9.up.railway.app/api/migrate

# Seed memory + projects
curl -X POST https://mission-control-production-75d9.up.railway.app/api/migrate/seed
```

## Auto-seeding

The app automatically seeds agents and cron jobs on startup via `instrumentation.ts`.
If tables don't exist yet, it skips gracefully.

## Webhook

OpenClaw sends lifecycle events to:
```
POST https://mission-control-production-75d9.up.railway.app/api/openclaw/event
```

Body:
```json
{
  "runId": "abc123",
  "action": "start|progress|end|error",
  "sessionKey": "agent:main:slack:...",
  "prompt": "User's message",
  "agentName": "main",
  "toolName": "exec",
  "thinking": "...",
  "response": "...",
  "error": "..."
}
```
