# 🔑 SecurePass Gen

A cryptographically secure, client-side password generator. No server requests — everything runs directly in your browser.

[**→ Live Demo**](https://github.com/Neuyazvimyi/securepass-gen)

---

## Features

- **Cryptographically secure** — uses `crypto.getRandomValues()`, never `Math.random()`
- **Flexible settings** — password length from 4 to 128 characters, choose character sets (uppercase, lowercase, digits, special)
- **Category guarantee** — generated password always contains at least one character from each selected category
- **Exclude ambiguous characters** — removes `l`, `1`, `I`, `O`, `0`, `o` (enabled by default)
- **Strength indicator** — entropy-based calculation: Weak / Medium / Strong / Excellent
- **Dark & light theme** — persisted in `localStorage`
- **Two languages** — English and Russian, switch on the fly
- **One-click copy** — copies to clipboard with a toast notification
- **Fully static** — no backend, no tracking, no cookies

## Tech Stack

| Technology | Version | Role |
|---|---|---|
| [SvelteKit](https://kit.svelte.dev/) | 2.x | Framework |
| [Svelte](https://svelte.dev/) | 5.x | UI (runes API) |
| [TypeScript](https://www.typescriptlang.org/) | 5.x | Type safety |
| [Tailwind CSS](https://tailwindcss.com/) | 4.x | Styling |
| [Flowbite Svelte](https://flowbite-svelte.com/) | 1.x | UI components |
| [svelte-i18n](https://github.com/kaisermann/svelte-i18n) | 4.x | Internationalization |
| [adapter-static](https://kit.svelte.dev/docs/adapter-static) | — | Static SPA deployment |

## Getting Started

```bash
# Install dependencies
pnpm install

# Start dev server
pnpm dev
```

Open [http://localhost:5173](http://localhost:5173)

## Scripts

```bash
pnpm dev           # Dev server with HMR
pnpm build         # Production build → build/
pnpm preview       # Preview production build locally
pnpm check         # Type-check with svelte-check
pnpm lint          # Prettier check + ESLint
pnpm format        # Auto-format with Prettier
```

## Project Structure

```
src/
├── lib/
│   ├── i18n/
│   │   ├── config.ts          # svelte-i18n setup
│   │   └── locales/
│   │       ├── en.json        # English strings
│   │       └── ru.json        # Russian strings
│   └── utils/
│       ├── password.ts        # Generation logic (crypto.getRandomValues)
│       └── strength.ts        # Entropy-based strength calculation
└── routes/
    ├── +layout.svelte         # Header, footer, theme, i18n init
    ├── +page.svelte           # Main page — the generator UI
    └── layout.css             # Tailwind + custom CSS variables
static/
├── robots.txt
└── _headers                   # Netlify security headers
```

## Deployment

The project builds into fully static files (`build/`) and is deployed on **Netlify**.

```bash
pnpm build        # Build command
# Publish directory: build
```

Security headers (CSP, X-Frame-Options, etc.) are configured in `static/_headers`.

## License

MIT
