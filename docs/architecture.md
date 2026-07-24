# Architecture

Replaces `PROJECT_STRUCTURE.md`, which had drifted out of date with the tree it
described.

## Layout

```
.
├── app/                     Next.js App Router
│   ├── (storefront pages)   shop, product, cart, checkout, account, dashboard
│   ├── admin/(dashboard)/   back-office - the "POS" surface being extracted
│   └── api/ai/chat/         the only Next.js route handler
├── components/              shared React components (layout, shop, ui, auth)
├── context/                 AuthContext, CartContext - client-side global state
├── lib/                     api client, constants, sanitizers, icons, utils
├── data/                    static nav/menu definitions
├── backend/                 NestJS + TypeORM + Postgres API
│   └── src/{auth,products,orders,coupons,pricing,payments,reports,users,email}
├── scripts/                 data generation, DB seeding, deploy helpers
│   └── data/                generated seed fixtures (gitignored)
└── docs/                    this directory
```

## Runtime shape

Two independently deployed services plus a database:

- **Web** — Next.js 16 / React 19. Almost entirely client components; state lives
  in React context and `localStorage`.
- **API** — NestJS on port 4000 (`PORT`), routes prefixed `/v1`. JWT bearer auth,
  TypeORM entities against Postgres.
- **Database** — Postgres. Schema comes from `backend/src/database/migrations/`.
  `DB_SYNC=true` enables TypeORM auto-sync; development only.

The browser reaches the API via `lib/api.ts`. In development `next.config.ts`
rewrites `/api/v1/*` to `localhost:4000/v1/*`; in production
`NEXT_PUBLIC_API_URL` points at the deployed API directly.

## The seam that matters

`app/admin/(dashboard)/` is a 24-page back-office bolted onto the storefront. It
shares `AuthContext`, the icon set and the layout chrome with the customer-facing
site, but nothing else — its pages talk to different endpoints, serve a different
audience, and several are still UI-only shells with no backend behind them.

That shared-context coupling is the work item when extracting it into a standalone
product: the admin pages depend on the storefront's auth and cart providers being
mounted above them, so they cannot currently be lifted out as-is.

## Known-unimplemented specs in this directory

These describe intended behaviour that no code implements yet. They are kept as
specifications, not as descriptions of the running system:

- `triage_rules.md` — red-flag triage for the health chat.
- `pdf_exports/template_specs.md` — invoice/report PDF templates.
- `weaviate_schema.json` — vector search schema. Nothing connects to Weaviate;
  it was removed from `docker-compose.yml` for that reason.
