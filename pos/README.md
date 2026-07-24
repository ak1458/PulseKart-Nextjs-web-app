# PulseKart POS

Offline-first point of sale for Indian retail pharmacies. FEFO batch dispensing,
Schedule H1 register, GST invoicing, and a setup wizard aimed at someone who runs
a chemist shop rather than a server.

> **Status: foundation, not yet a shippable product.** The domain layer, database
> schema and installer are built and tested. The selling UI is not. See
> [What is and isn't built](#what-is-and-isnt-built) before planning around it.

## Setup

You need Docker, or a PostgreSQL 13+ database and Node 20+.

```bash
cp .env.example .env
docker compose up -d          # starts PostgreSQL
npm install
npm run dev
```

Open <http://localhost:3000>. The app redirects to `/setup`, which checks your
environment, applies the schema and creates your pharmacy and owner account. No
migration commands, no seed scripts, no editing config by hand.

The wizard asks for:

| | Why |
| --- | --- |
| Pharmacy name, address, pincode | Printed on every invoice |
| **Drug licence number** | A pharmacy invoice is not valid without it |
| GSTIN (optional) | Leave blank if below the registration threshold |
| State | Decides CGST+SGST vs IGST |
| Expiry warning window | Days before expiry that stock starts warning; 90 by default |
| First counter name and invoice prefix | Invoice series is per counter, per financial year |
| Your name, email, password | The owner account |

It refuses to run twice — the guard is a row lock inside the same transaction that
creates the owner, so two people submitting the form at once cannot both succeed.

## Why these decisions

**FEFO, not FIFO.** First-*expired*-first-out. A batch received later can expire
sooner, and dispensing the longest-dated stock first strands the near-dated stock
until it has to be written off. Every current pharmacy-POS buyer's guide treats
FEFO as core rather than optional, and `allocateFefo` implements it directly.

**Expiry is end-of-month.** A pack marked `EXP 03/2027` is good through 31 March
2027. Treating it as 1 March writes off a month of saleable stock; inverting the
comparison sells a month past the real date. `endOfExpiryMonth` exists so this is
decided in one place.

**MRP is GST-inclusive.** The printed MRP already contains the tax, and selling
above it is an offence. Tax is therefore *back-calculated* out of the price, never
added on top — software that treats MRP as a pre-tax rate overcharges by the tax
on every line. `splitInclusiveTax` derives the tax by subtraction so
`taxableValue + tax` is exactly the price charged, with no stray paisa.

**The H1 register is a table, not a report.** Rule 65(11)(d) requires supply of a
Schedule H1 drug to be entered in a *separate* register naming the prescriber and
their address, the patient, the drug and the quantity — retained three years and
open to inspection. It is append-only and duplicates the drug name and quantity
rather than joining to `sale_items`, so it stays readable and intact on its own.
Schedule X is refused outright rather than half-supported: it carries narcotics
controls this system does not implement.

**One open shift per outlet**, enforced by a partial unique index. Two tills open
at once makes cash reconciliation meaningless. Only cash counts toward the drawer
— card and UPI settle to the bank, credit has not been collected — and the
variance is reported exactly as counted, with no tolerance band quietly absorbing
a persistent shortfall.

**Money is `numeric(12,2)`,** never float, and quantities are integers in the
smallest sellable unit.

## Compliance context (2026)

- **E-invoicing (IRN)** is mandatory for B2B above ₹5 crore aggregate turnover.
  Below that it does not apply, so `sales.irn` is nullable and the system works
  without it.
- **Dynamic QR on B2C** applies above ₹500 crore — not most pharmacies.
- Pharmacy invoices must carry **batch number, expiry date and drug licence
  number**, which generic e-invoicing tools treat as optional. They are columns
  here, not free text.
- Invoice numbers must be a consecutive series unique within the **financial
  year** (1 April–31 March), which is why `financialYear()` exists and the series
  resets in April rather than January.

Verify current thresholds before going live; they move.

## What is and isn't built

Built and tested (60 tests, `npm test`):

- Full schema with tenant isolation, FEFO index, audit trail
- GST: inclusive-tax split, CGST/SGST vs IGST, round-off, financial year
- Dispensing: FEFO allocation, end-of-month expiry, expiry tiers, schedule rules
- Shifts: takings by tender, expected cash, variance, denomination counting
- Setup wizard: pre-flight checks, migrations, first-run install

Not built:

- **The selling screen.** The domain logic a sale needs exists and is tested; the
  UI and the API route that ties them to the database do not.
- **Offline queue and sync.** The schema is ready for it — `sales.client_uuid` is
  unique per pharmacy so a sale replayed after a reconnect cannot insert twice —
  but there is no service worker or local store yet.
- Authentication beyond the owner account created at install.
- Purchase/GRN entry, returns, credit notes, supplier management.
- IRN generation, e-way bills, Tally export.
- Barcode scanning and receipt printing.

## Layout

```
migrations/       schema, applied in order by the installer
src/domain/       pure business logic - no database, fully unit tested
  gst.ts          tax split, invoice totals, financial year
  dispensing.ts   FEFO, expiry, schedule H/H1/X rules
  shift.ts        takings, reconciliation, denomination counting
src/lib/          database pool, installer
tests/            vitest, mirrors src/domain
```

The domain layer deliberately has no database imports, so the rules that matter
can be tested without a running Postgres.

## Extracting to its own repository

This lives inside the `pulsekart-web-nextjs` repository for now. To split it out
with its history intact:

```bash
git subtree split --prefix=pos -b pos-only
git push git@github.com:<you>/pulsekart-pos.git pos-only:main
```
