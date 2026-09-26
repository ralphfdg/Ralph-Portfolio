# Ralph Portfolio

Developer portfolio built with Next.js App Router, TypeScript, Tailwind CSS v4,
Anime.js v4, Zod v4, and Resend.

## Design decisions

Full rationale lives in `docs/superpowers/specs/2026-09-26-ralph-portfolio-design.md`.
The build sequence lives in `docs/superpowers/plans/2026-09-26-ralph-portfolio-build.md`.

- **Content lives in typed modules.** `src/lib/content/` holds every string on the
  site. A Zod schema validates the data and TypeScript types are inferred from that
  schema, so invariants and types cannot drift apart.
- **Two client components.** The hero motion and the contact form carry all
  JavaScript. Everything else is a Server Component.
- **Two accents, strictly assigned.** Blue means actionable, amber means incomplete.

## Commands

```bash
npm run dev        # start the dev server
npm run build      # production build
npm run start      # serve the production build
npm run test       # vitest, single run
npm run typecheck  # tsc --noEmit
npm run lint       # eslint
```

## Install note

This project installs with `npm install --ignore-scripts`. npm 12 blocks install
scripts by default, and none are needed here: Next.js and Tailwind v4 ship
prebuilt platform binaries through optional dependencies rather than postinstall
downloads.

## Environment

Copy `.env.example` to `.env.local` and fill it in. The contact form stays inert and
renders a notice until `CONTACT_EMAIL` is set, so the site builds and deploys
without it.

Sending real mail also needs a verified Resend sending domain. The account's
onboarding address is development-only and restricted to the account holder's inbox.
