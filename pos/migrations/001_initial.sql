-- PulseKart POS - initial schema
--
-- Design notes that are not obvious from the column names:
--
-- * Money is `numeric(12,2)`. Never float. Quantities are integers in the
--   product's smallest sellable unit (a strip of 10 is 10 units).
-- * Every table that holds business data carries `pharmacy_id`. This is a
--   multi-tenant database and row-level isolation is enforced by that column
--   being part of every query and every unique constraint.
-- * Timestamps are `timestamptz`. A pharmacy's day-close depends on knowing
--   the actual instant, and India has no DST but servers are not always IST.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ---------------------------------------------------------------------------
-- Tenant
-- ---------------------------------------------------------------------------

CREATE TABLE pharmacies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,

    -- Statutory identifiers. A pharmacy invoice is not valid without the drug
    -- licence number, and generic invoicing tools treat it as optional.
    gstin VARCHAR(15),
    drug_licence_no TEXT NOT NULL,
    -- GST state code drives CGST+SGST vs IGST. Two digits, e.g. '27' for
    -- Maharashtra. Derived from the GSTIN prefix when one is present.
    state_code VARCHAR(2) NOT NULL,

    address_line TEXT NOT NULL,
    city TEXT NOT NULL,
    pincode VARCHAR(6) NOT NULL,
    phone VARCHAR(20),
    email TEXT,

    -- Days before expiry at which a batch starts warning. The research is
    -- consistent that this must be configurable; 30/60/90 are the common tiers.
    expiry_warn_days INTEGER NOT NULL DEFAULT 90 CHECK (expiry_warn_days > 0),

    -- Composition scheme dealers must not charge GST separately.
    is_composition_dealer BOOLEAN NOT NULL DEFAULT FALSE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT gstin_format CHECK (
        gstin IS NULL OR gstin ~ '^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$'
    )
);

CREATE TABLE outlets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pharmacy_id UUID NOT NULL REFERENCES pharmacies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    -- Invoice numbers are per outlet, per financial year. GST requires a
    -- consecutive series unique within the financial year.
    invoice_prefix TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (pharmacy_id, name)
);

-- ---------------------------------------------------------------------------
-- People
-- ---------------------------------------------------------------------------

CREATE TYPE user_role AS ENUM ('owner', 'pharmacist', 'cashier');

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pharmacy_id UUID NOT NULL REFERENCES pharmacies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'cashier',

    -- Only a registered pharmacist may dispense Schedule H1. Stored so the
    -- dispensing record can name who did it.
    pharmacist_reg_no TEXT,

    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Email is unique per tenant, not globally: the same person may work for
    -- two pharmacies running on the same instance.
    UNIQUE (pharmacy_id, email)
);

-- ---------------------------------------------------------------------------
-- Catalogue
-- ---------------------------------------------------------------------------

-- Drugs & Cosmetics Act schedules that change how an item may be sold.
--   otc  - no prescription needed
--   h    - prescription required, retain record
--   h1   - prescription required + separate register, retained 3 years
--   x    - narcotic/psychotropic, strictest controls
CREATE TYPE drug_schedule AS ENUM ('otc', 'h', 'h1', 'x');

CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pharmacy_id UUID NOT NULL REFERENCES pharmacies(id) ON DELETE CASCADE,

    name TEXT NOT NULL,
    generic_name TEXT,
    manufacturer TEXT,

    -- HSN is mandatory on a GST invoice above the turnover thresholds.
    hsn_code VARCHAR(8),
    -- Most medicines are 5% or 12%; some OTC items are 18%.
    gst_rate NUMERIC(5,2) NOT NULL DEFAULT 12 CHECK (gst_rate >= 0 AND gst_rate <= 28),

    schedule drug_schedule NOT NULL DEFAULT 'otc',
    -- Units per pack, for display. Stock is always counted in single units.
    pack_size INTEGER NOT NULL DEFAULT 1 CHECK (pack_size > 0),

    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE (pharmacy_id, name, manufacturer)
);

CREATE INDEX idx_products_pharmacy_name ON products(pharmacy_id, name);
CREATE INDEX idx_products_schedule ON products(pharmacy_id, schedule)
    WHERE schedule <> 'otc';

CREATE TABLE batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pharmacy_id UUID NOT NULL REFERENCES pharmacies(id) ON DELETE CASCADE,
    outlet_id UUID NOT NULL REFERENCES outlets(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,

    batch_no TEXT NOT NULL,
    expiry_date DATE NOT NULL,

    -- MRP is per batch, not per product: the printed price changes between
    -- manufacturing runs and it is an offence to sell above the MRP printed on
    -- the pack the customer is handed.
    mrp NUMERIC(12,2) NOT NULL CHECK (mrp > 0),
    purchase_price NUMERIC(12,2) CHECK (purchase_price >= 0),

    qty_available INTEGER NOT NULL DEFAULT 0 CHECK (qty_available >= 0),

    received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE (pharmacy_id, outlet_id, product_id, batch_no)
);

-- The dispensing hot path: "oldest non-expired batch of this product with
-- stock". FEFO ordering is the index, not an afterthought.
CREATE INDEX idx_batches_fefo
    ON batches(pharmacy_id, outlet_id, product_id, expiry_date)
    WHERE qty_available > 0;

CREATE INDEX idx_batches_expiring ON batches(pharmacy_id, expiry_date)
    WHERE qty_available > 0;

-- ---------------------------------------------------------------------------
-- Register shifts
-- ---------------------------------------------------------------------------

CREATE TYPE shift_status AS ENUM ('open', 'closed');

CREATE TABLE shifts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pharmacy_id UUID NOT NULL REFERENCES pharmacies(id) ON DELETE CASCADE,
    outlet_id UUID NOT NULL REFERENCES outlets(id) ON DELETE CASCADE,

    opened_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    opened_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    opening_float NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (opening_float >= 0),

    closed_by UUID REFERENCES users(id) ON DELETE RESTRICT,
    closed_at TIMESTAMPTZ,

    -- What the drawer physically held at close, counted by a human.
    closing_counted NUMERIC(12,2) CHECK (closing_counted >= 0),
    -- What it should have held. Computed, stored for audit.
    closing_expected NUMERIC(12,2),
    -- counted - expected. Negative is a shortfall. Stored rather than derived
    -- so a later correction to a sale cannot silently rewrite history.
    variance NUMERIC(12,2),
    close_note TEXT,

    status shift_status NOT NULL DEFAULT 'open'
);

-- At most one open shift per outlet. Two tills open at once is the single
-- easiest way to make cash reconciliation meaningless.
CREATE UNIQUE INDEX idx_one_open_shift_per_outlet
    ON shifts(outlet_id) WHERE status = 'open';

-- ---------------------------------------------------------------------------
-- Sales
-- ---------------------------------------------------------------------------

CREATE TYPE payment_mode AS ENUM ('cash', 'card', 'upi', 'credit');
CREATE TYPE sale_status AS ENUM ('completed', 'voided');

CREATE TABLE sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pharmacy_id UUID NOT NULL REFERENCES pharmacies(id) ON DELETE CASCADE,
    outlet_id UUID NOT NULL REFERENCES outlets(id) ON DELETE RESTRICT,
    shift_id UUID NOT NULL REFERENCES shifts(id) ON DELETE RESTRICT,

    invoice_no TEXT NOT NULL,
    financial_year VARCHAR(7) NOT NULL,          -- e.g. '2026-27'

    sold_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    sold_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    customer_name TEXT,
    customer_phone VARCHAR(20),
    -- Present only for B2B sales; drives IGST vs CGST+SGST.
    customer_gstin VARCHAR(15),
    place_of_supply_state_code VARCHAR(2) NOT NULL,

    taxable_value NUMERIC(12,2) NOT NULL DEFAULT 0,
    cgst NUMERIC(12,2) NOT NULL DEFAULT 0,
    sgst NUMERIC(12,2) NOT NULL DEFAULT 0,
    igst NUMERIC(12,2) NOT NULL DEFAULT 0,
    discount NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (discount >= 0),
    -- Difference between the true total and the rounded total, -0.50..0.50.
    round_off NUMERIC(4,2) NOT NULL DEFAULT 0,
    total NUMERIC(12,2) NOT NULL,

    payment_mode payment_mode NOT NULL,
    status sale_status NOT NULL DEFAULT 'completed',

    -- Set when an invoice has been reported to the IRP. Null is normal below
    -- the turnover threshold.
    irn TEXT,

    -- Offline-first: the client mints this id, so a sale replayed after a
    -- reconnect cannot be inserted twice.
    client_uuid UUID NOT NULL,

    -- GST requires a consecutive series unique within the financial year.
    UNIQUE (pharmacy_id, financial_year, invoice_no),
    UNIQUE (pharmacy_id, client_uuid)
);

CREATE INDEX idx_sales_shift ON sales(shift_id);
CREATE INDEX idx_sales_sold_at ON sales(pharmacy_id, sold_at DESC);

CREATE TABLE sale_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sale_id UUID NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
    -- RESTRICT, not CASCADE: a sale line is a tax record. It must survive the
    -- deletion of the batch or product it referenced.
    batch_id UUID NOT NULL REFERENCES batches(id) ON DELETE RESTRICT,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,

    -- Denormalised deliberately. The invoice must reproduce exactly what was
    -- printed, even after the catalogue is edited.
    product_name TEXT NOT NULL,
    batch_no TEXT NOT NULL,
    expiry_date DATE NOT NULL,
    hsn_code VARCHAR(8),

    quantity INTEGER NOT NULL CHECK (quantity > 0),
    mrp NUMERIC(12,2) NOT NULL,
    rate NUMERIC(12,2) NOT NULL,        -- pre-tax unit price
    gst_rate NUMERIC(5,2) NOT NULL,
    taxable_value NUMERIC(12,2) NOT NULL,
    tax_amount NUMERIC(12,2) NOT NULL,
    line_total NUMERIC(12,2) NOT NULL
);

CREATE INDEX idx_sale_items_sale ON sale_items(sale_id);

-- ---------------------------------------------------------------------------
-- Schedule H1 register
-- ---------------------------------------------------------------------------

-- Rule 65(11)(d): supply of an H1 drug must be entered in a separate register
-- recording the prescriber's name and address, the patient's name, the drug and
-- the quantity supplied. Retained three years and open to inspection.
--
-- This is a legal register, not a convenience view: it is append-only, and
-- deliberately duplicates the drug and quantity rather than joining to
-- sale_items so that it remains readable and intact on its own.
CREATE TABLE h1_register (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pharmacy_id UUID NOT NULL REFERENCES pharmacies(id) ON DELETE RESTRICT,
    sale_id UUID NOT NULL REFERENCES sales(id) ON DELETE RESTRICT,

    supplied_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    drug_name TEXT NOT NULL,
    batch_no TEXT NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),

    patient_name TEXT NOT NULL,
    prescriber_name TEXT NOT NULL,
    prescriber_address TEXT NOT NULL,
    prescriber_reg_no TEXT,

    -- The pharmacist who dispensed, and their council registration.
    dispensed_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    pharmacist_reg_no TEXT,

    prescription_ref TEXT,

    -- Three years from supply. A retention job must refuse to delete before it.
    retain_until DATE NOT NULL
);

CREATE INDEX idx_h1_register_supplied_at ON h1_register(pharmacy_id, supplied_at DESC);

-- ---------------------------------------------------------------------------
-- Stock movements (audit trail)
-- ---------------------------------------------------------------------------

CREATE TYPE movement_reason AS ENUM (
    'sale', 'sale_void', 'purchase', 'adjustment', 'expiry_writeoff', 'return'
);

CREATE TABLE stock_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pharmacy_id UUID NOT NULL REFERENCES pharmacies(id) ON DELETE CASCADE,
    batch_id UUID NOT NULL REFERENCES batches(id) ON DELETE RESTRICT,

    -- Negative for stock leaving, positive for stock arriving.
    quantity_delta INTEGER NOT NULL CHECK (quantity_delta <> 0),
    reason movement_reason NOT NULL,
    reference_id UUID,
    performed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_stock_movements_batch ON stock_movements(batch_id, occurred_at DESC);

-- ---------------------------------------------------------------------------
-- Setup state
-- ---------------------------------------------------------------------------

-- Single row. The setup wizard refuses to run once completed_at is set, so
-- the install endpoint cannot be replayed to create a second owner account.
CREATE TABLE install_state (
    id BOOLEAN PRIMARY KEY DEFAULT TRUE CHECK (id),
    schema_version INTEGER NOT NULL DEFAULT 1,
    completed_at TIMESTAMPTZ
);

INSERT INTO install_state (id, schema_version) VALUES (TRUE, 1);
