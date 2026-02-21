# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev          # Start development server
pnpm build        # Production build → build/
pnpm preview      # Preview production build locally
pnpm check        # Type-check with svelte-check
pnpm check:watch  # Type-check in watch mode
pnpm lint         # Prettier check + ESLint
pnpm format       # Auto-format with Prettier
```

No test framework is configured.

## Project

**SecurePass Gen** — client-side cryptographic password generator. Single page SPA, fully static (no server). Built with SvelteKit + Svelte 5 + TypeScript + Tailwind CSS 4 + Flowbite Svelte + svelte-i18n (RU/EN).

## Architecture

### Key source files

| Path | Purpose |
|---|---|
| `src/lib/utils/password.ts` | Core generation logic — `generatePassword(opts)` using `crypto.getRandomValues()` with Fisher-Yates shuffle and per-category guarantee |
| `src/lib/utils/strength.ts` | Entropy-based strength calculation → `StrengthLevel`: `weak / medium / strong / excellent` |
| `src/lib/i18n/config.ts` | svelte-i18n setup — `setupI18n()` (call once in layout), re-exports `locale` store |
| `src/lib/i18n/locales/en.json` | English strings |
| `src/lib/i18n/locales/ru.json` | Russian strings |
| `src/routes/+layout.svelte` | Header (🔑 logo, RU/EN switcher, dark/light toggle) + footer. Initialises i18n and dark-mode from localStorage |
| `src/routes/+page.svelte` | Password generator UI — password field, strength bar, length slider (4–128), charset checkboxes, generate button, copy toast |

### Routing

Single route `/` — everything lives in `+page.svelte`.

### Conventions

- **Svelte 5 runes** — use `$state()`, `$derived()`, `$props()` throughout; no Svelte 4 reactive syntax
- **Dark mode** — class-based (`.dark` on `<html>`), toggled in `+layout.svelte`, saved to `localStorage`; CSS variant defined in `layout.css` as `@custom-variant dark`
- **Purple primary colour** — defined in `layout.css` via `@theme { --color-primary-* }` (Tailwind v4 style). Use `accent-purple-600` / `bg-purple-600` / `text-purple-*` for accents; Flowbite components accept `color="purple"`
- **i18n** — call `setupI18n()` once (idempotent guard inside); use `$t('key')` from `svelte-i18n` in any component
- **`$lib`** alias → `src/lib/`
- Static assets in `static/`; `static/_headers` contains Netlify security headers
- Prettier: tabs, single quotes, 100-char width, Tailwind class sorting via `prettier-plugin-tailwindcss`
- No SSR — adapter-static with `fallback: 'index.html'` for SPA routing
