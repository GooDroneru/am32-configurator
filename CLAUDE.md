# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
bun run dev        # Start dev server at http://localhost:3000
bun run build      # Build for production
bun run preview    # Preview production build
bun run generate   # Static site generation

# Code quality
bun run lint       # ESLint on .ts, .js, .vue files
```

> Package manager: Yarn 4.12.0 or Bun. Bun is preferred per README.

## Architecture

**Nuxt 3 (Vue 3 + TypeScript), SSR disabled, PWA.**
Base URL: `/configurator/`

### Communication Layer (`/src/communication/`)
Three protocol implementations for talking to ESC devices via WebSerial:
- `msp.ts` — MSP protocol (flight controllers)
- `four_way.ts` — 4-way interface protocol (direct ESC programming via FC)
- `direct.ts` — Direct USB connection to ESC
- `serial.ts` — Low-level serial transport

`app.vue` initializes WebSerial API, detects browser support, and wires up the protocol stack.

### State Management (`/stores/`)
Pinia stores:
- `esc.ts` — ESC device data (`escData`, `selectedEscInfo`, `isSaving`, `isLoading`, `bytesWritten`)
- `serial.ts` — Connection state (`hasConnection`, `isFourWay`, `deviceHandles`, `pairedDevices`)
- `log.ts` — Log entries (normal / warning / error with timestamps)

### Core Logic (`/src/`)
- `db.ts` — IndexedDB via Dexie
- `eeprom.ts` — EEPROM read/write abstraction
- `flash.ts` — Firmware flashing logic
- `mcu.ts` — MCU detection and layout
- `settings.ts` — Settings schema and defaults

### Pages & UI
- `/pages/configurator.vue` — Main configurator UI
- `/pages/downloads.vue` — Firmware downloads
- `/components/EscView*` — Per-ESC display and controls
- `/components/SettingField*` — Dynamic setting input fields
- `/server/api/` — Server routes (firmware metadata, file proxying)

### Storage
Local: IndexedDB (Dexie). Cloud: Minio / Netlify Blobs via `/composables/useMinio.ts`.

## Key Constraints
- Web Serial API works only in Chrome / Edge — no Firefox or Safari support.
- ESLint rules: 4-space indent, semicolons required, no-console enforced.
- TypeScript target: ES2022 with Web Serial API types (`@types/w3c-web-serial`).
