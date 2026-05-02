# Duels Leaderboard

## Overview

A competitive Minecraft PvP duels leaderboard website. Shows ranked players across 8 gamemodes with Minecraft player heads, MMR, wins/losses, and tier badges. Auto-detects visitor region (US/EU) via IP geolocation.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React + Vite (artifacts/duels-site) at `/`
- **API framework**: Express 5 (artifacts/api-server) at `/api`
- **Database**: External MySQL (PebbleHost) via mysql2
- **Validation**: Zod (`zod/v4`)
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec

## Database

External MySQL database on PebbleHost (`na01-sql.pebblehost.com`).
Connection credentials stored as environment variables: `MYSQL_HOST`, `MYSQL_PORT`, `MYSQL_DATABASE`, `MYSQL_USER`, `MYSQL_PASSWORD`.

**Important:** The Replit server IP must be whitelisted in PebbleHost's MySQL access controls. Current Replit IP: `34.23.202.168`

### MySQL Schema (managed by Minecraft Skript plugin)

- `players` — uuid, username
- `player_stats` — uuid, mode, mmr, fights, last_fight (+ optional wins column)
- `ht1_holders` — mode, uuid

## Gamemodes

sword, axe, dpot (Diamond Pot), nethpot (Netherite Pot), smp, crystal (CrystalPVP), mace, uhc

## Tier System

LT5 (0-499) → HT5 → LT4 → HT4 → LT3 → HT3 → LT2 → HT2 → LT1 → HT1 (top 1 per mode)

## Features

- Leaderboard per mode + Overview tab
- Minecraft player heads via Crafatar API
- Auto US/EU region detection via ipapi.co
- Player profile page with per-mode breakdown
- Wins/losses display (requires `wins` column in player_stats)
- HT1 crown indicator and highlighted rows

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
