# PulseKart POS

Offline-first point of sale for Indian retail pharmacies. FEFO batch dispensing,
Schedule H1 register, GST invoicing, and a setup wizard aimed at someone who runs
a chemist shop rather than a server.

> **Status: a sale works end to end; not yet a shippable product.** You can
> install it, sign in, open a shift, bill an item against FEFO-allocated stock
> with GST computed and an H1 register entry written, and close the drawer
> against a counted total. Offline mode, purchases and printing are not built.
> See [What is and isn't built](#what-is-and-isnt-built).

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

## Using it

After setup, sign in at `/login` with the owner account you created.

1. **`/pos`** — open a shift with the cash already in the drawer. Nothing can be
   sold until one is open, because a sale with no shift cannot be reconciled.
2. Search stock by name or salt. Each result shows what will be dispensed: units
   on hand, the earliest expiry, and a schedule badge (`Rx`, `H1`).
3. Add items and bill. Restricted items require confirming a prescription was
   seen; Schedule H1 additionally collects the register details, and the sale is
   refused if the signed-in user has no pharmacist registration number.
4. **`/shift`** — count the drawer denomination by denomination and close.

The expected cash total stays hidden behind a button until the count is entered.
Showing it first invites the counter to type the expected number rather than
count, which is the one thing the count exists to prevent.

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

Built (60 domain tests, `npm test`):

- Full schema with tenant isolation, FEFO index, audit trail
- GST: inclusive-tax split, CGST/SGST vs IGST, round-off, financial year
- Dispensing: FEFO allocation, end-of-month expiry, expiry tiers, schedule rules
- Shifts: open/close, takings by tender, expected cash, variance, denominations
- **Sale transaction**: stock allocation, invoice numbering, sale and lines,
  stock ledger and H1 register, all in one transaction
- Session auth with an httpOnly cookie, plus edge middleware on `/pos`, `/shift`
- Setup wizard: pre-flight checks, migrations, first-run install
- Selling screen and shift-close screen

Not built:

- **Offline queue and sync.** The schema is ready — `sales.client_uuid` is unique
  per pharmacy, and the sale endpoint already returns the original sale instead
  of inserting a second one when a client replays it — but there is no service
  worker or local store, so the till still needs the network.
- **Integration tests.** The domain layer is covered; the DB-bound code in
  `src/lib/{sales,shifts}.ts` is not, because it needs a live Postgres.
- Purchase/GRN entry, returns, credit notes, supplier management.
- IRN generation, e-way bills, Tally export.
- Barcode scanning and receipt printing — a sale records, but nothing prints.
- Staff management beyond the owner account created at install.

## Layout

```
migrations/       schema, applied in order by the installer
src/domain/       pure business logic - no database, fully unit tested
  gst.ts          tax split, invoice totals, financial year
  dispensing.ts   FEFO, expiry, schedule H/H1/X rules
  shift.ts        takings, reconciliation, denomination counting
src/lib/          database pool, installer, auth, shifts, sales
src/middleware.ts edge guard on /pos and /shift
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
