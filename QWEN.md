# SecurePass Gen — Project Context

## Project Overview

**SecurePass Gen** is a cryptographically secure, client-side password generator built with **SvelteKit 2.x** and **Svelte 5.x**. The application runs entirely in the browser with no backend or server requests. It features a bilingual interface (English/Russian), dark/light theme support, and an entropy-based password strength indicator.

### Key Features
- **Cryptographically secure**: Uses `crypto.getRandomValues()` (never `Math.random()`)
- **Flexible settings**: Password length 4–128 characters, customizable character sets
- **Category guarantee**: Ensures at least one character from each selected category
- **Exclude ambiguous characters**: Removes `l, 1, I, O, 0, o` (enabled by default)
- **Strength indicator**: Entropy-based calculation (Weak / Medium / Strong / Excellent)
- **i18n**: English and Russian, switchable on the fly
- **Theme**: Dark/light mode persisted in `localStorage`
- **Fully static**: Deployed on Netlify as a SPA

---

## Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| SvelteKit | 2.x | Framework |
| Svelte | 5.x | UI (runes API: `$state`, `$derived`, `$props`) |
| TypeScript | 5.x | Type safety |
| Tailwind CSS | 4.x | Styling (vite plugin) |
| Flowbite Svelte | 1.x | UI components |
| svelte-i18n | 4.x | Internationalization |
| adapter-static | — | Static SPA deployment |
| Vite | 7.x | Build tool |

---

## Project Structure

```
securepass-gen/
├── src/
│   ├── lib/
│   │   ├── i18n/
│   │   │   ├── config.ts          # svelte-i18n setup, locale export
│   │   │   └── locales/
│   │   │       ├── en.json        # English translations
│   │   │       └── ru.json        # Russian translations
│   │   ├── utils/
│   │   │   ├── password.ts        # generatePassword() with crypto API
│   │   │   └── strength.ts        # calculateStrength() entropy calculation
│   │   └── index.ts               # Public library exports
│   ├── routes/
│   │   ├── +layout.svelte         # Header, footer, theme toggle, i18n init
│   │   ├── +page.svelte           # Main password generator UI
│   │   └── layout.css             # Tailwind imports + custom slider styles
│   ├── app.d.ts                   # TypeScript declarations
│   └── app.html                   # HTML template
├── static/
│   ├── _headers                   # Netlify security headers (CSP, X-Frame-Options)
│   └── robots.txt
├── openspec/
│   └── config.yaml                # OpenSpec configuration
├── package.json
├── svelte.config.js               # adapter-static configuration
├── vite.config.ts                 # Tailwind + SvelteKit plugins
├── tsconfig.json
├── eslint.config.js
├── .prettierrc                    # Tabs, single quotes, tailwindcss plugin
└── project.md                     # Detailed specification (Russian)
```

---

## Building and Running

### Prerequisites
- **Node.js** (v20+ recommended)
- **pnpm** (project uses pnpm workspace)

### Commands

```bash
# Install dependencies
pnpm install

# Development server (localhost:5173)
pnpm dev

# Production build → build/
pnpm build

# Preview production build
pnpm preview

# Type checking
pnpm check
pnpm check:watch

# Linting and formatting
pnpm lint          # Prettier check + ESLint
pnpm format        # Auto-format with Prettier
```

### Deployment
- **Build command**: `pnpm build`
- **Publish directory**: `build/`
- **Platform**: Netlify (configured via `static/_headers` for security headers)

---

## Development Conventions

### Code Style
- **Indentation**: Tabs (`.prettierrc`)
- **Quotes**: Single quotes
- **Trailing commas**: None
- **Print width**: 100 characters
- **Plugins**: `prettier-plugin-svelte`, `prettier-plugin-tailwindcss`

### Svelte 5 Patterns
- Use **runes API**: `$state()`, `$derived()`, `$props()`
- Avoid legacy `let` with `$:` reactive declarations
- Component props: `let { name = defaultValue } = $props();`

### TypeScript
- **Strict mode** enabled (`tsconfig.json`)
- Path aliases: `$lib` for `src/lib/`
- Module resolution: `bundler`

### Testing
- No test framework currently configured
- Manual testing via dev server

### i18n
- Library: `svelte-i18n`
- Files: `src/lib/i18n/locales/{en,ru}.json`
- Usage: `import { t } from 'svelte-i18n';` then `{$t('key')}` in templates
- Locale switching: `locale.set('ru' | 'en')`

### Theme System
- Stored in `localStorage` as `'theme'` (`'dark'` | `'light'`)
- Applied via `document.documentElement.classList.toggle('dark', isDark)`
- Tailwind dark mode: `dark:` variant with `&:where(.dark, .dark *)`

---

## Core Logic

### Password Generation (`src/lib/utils/password.ts`)

```typescript
export interface PasswordOptions {
  length: number;
  useUpper: boolean;
  useLower: boolean;
  useDigits: boolean;
  useSpecial: boolean;
  excludeAmbiguous: boolean;
}

export function generatePassword(opts: PasswordOptions): string
```

**Algorithm**:
1. Build character pools based on selected options
2. Guarantee one character from each active category
3. Fill remaining length from combined pool
4. Fisher-Yates shuffle for randomness

### Strength Calculation (`src/lib/utils/strength.ts`)

```typescript
export type StrengthLevel = 'weak' | 'medium' | 'strong' | 'excellent';

export function calculateStrength(
  password: string,
  opts: PasswordOptions
): StrengthResult
```

**Criteria**:
| Level | Requirements |
|-------|--------------|
| Excellent | 4 categories, length > 16, excludeAmbiguous |
| Strong | ≥3 categories, length > 12 |
| Medium | ≥2 categories, length ≥ 8 |
| Weak | Everything else |

**Score**: Entropy-based, 128 bits = 100%

---

## Key Configuration Files

### `svelte.config.js`
- Uses `@sveltejs/adapter-static` for SPA deployment
- Fallback: `index.html` (client-side routing)
- Prerender errors: `warn`

### `vite.config.ts`
- Plugins: `tailwindcss()`, `sveltekit()`
- Tailwind CSS v4 via `@tailwindcss/vite`

### `.prettierrc`
```json
{
  "useTabs": true,
  "singleQuote": true,
  "trailingComma": "none",
  "printWidth": 100,
  "plugins": ["prettier-plugin-svelte", "prettier-plugin-tailwindcss"],
  "tailwindStylesheet": "./src/routes/layout.css"
}
```

### `eslint.config.js`
- Uses `@eslint/compat`, `eslint-plugin-svelte`, `typescript-eslint`
- Globals: browser + node
- Rule: `no-undef` off (TypeScript handles this)

---

## UI Components

### Primary Color (Purple)
Defined in `layout.css` via `@theme`:
```css
@theme {
  --color-primary-600: #7c3aed;
  --color-primary-700: #6d28d9;
}
```

### Custom Slider
`.range-purple` class in `layout.css` for cross-browser range input styling.

### Icons
- Emoji-based: 🔑 (logo), 📋 (copy), 🙈/👁️ (show/hide), ☀️/🌙 (theme)
- SVG: GitHub icon in footer

---

## Security Headers (`static/_headers`)

Configured for Netlify:
- `Content-Security-Policy`
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`

---

## Related Documentation

- **`project.md`**: Detailed specification in Russian (functional requirements, roadmap, acceptance criteria)
- **`README.md`**: User-facing documentation with feature list and quick start guide
- **`openspec/config.yaml`**: OpenSpec configuration (purpose TBD)

---

## Common Tasks

### Add a new translation key
1. Add to both `src/lib/i18n/locales/en.json` and `ru.json`
2. Use in components: `{$t('newKey')}`

### Change primary color
Edit `--color-primary-*` variables in `src/routes/layout.css`

### Modify password algorithm
Edit `src/lib/utils/password.ts` — ensure `crypto.getRandomValues()` is used

### Add new character set
1. Add to `CHARS` object in `password.ts`
2. Add checkbox in `+page.svelte`
3. Add translation keys

### Update strength criteria
Edit `calculateStrength()` in `src/lib/utils/strength.ts`
