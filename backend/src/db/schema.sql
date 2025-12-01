-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(50) DEFAULT 'customer', -- customer, admin, pharmacist, delivery
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Addresses Table
CREATE TABLE IF NOT EXISTS addresses (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    tag VARCHAR(50), -- Home, Work, etc.
    street_address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    pincode VARCHAR(20) NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index on email for fast lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Warehouses Table
CREATE TABLE IF NOT EXISTS warehouses (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    address TEXT,
    pincodes JSONB DEFAULT '[]', -- Array of strings
    config JSONB DEFAULT '{}', -- capacity, cold_chain, etc.
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Bins Table
CREATE TABLE IF NOT EXISTS bins (
    id SERIAL PRIMARY KEY,
    warehouse_id INTEGER REFERENCES warehouses(id) ON DELETE CASCADE,
    code VARCHAR(50) NOT NULL, -- e.g., A-01-02
    zone VARCHAR(50),
    description TEXT,
    UNIQUE(warehouse_id, code)
);

-- Products (SKUs) Table
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    sku VARCHAR(100) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    price DECIMAL(10, 2) NOT NULL,
    mrp DECIMAL(10, 2),
    tax_rate DECIMAL(5, 2) DEFAULT 0,
    prescription_required BOOLEAN DEFAULT FALSE,
    attributes JSONB DEFAULT '{}', -- variant info, weight, etc.
    images JSONB DEFAULT '[]',
    seo JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Batches Table
CREATE TABLE IF NOT EXISTS batches (
    id SERIAL PRIMARY KEY,
    sku_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    batch_no VARCHAR(100) NOT NULL,
    expiry_date DATE NOT NULL,
    manufacture_date DATE,
    cost_price DECIMAL(10, 2),
    warehouse_id INTEGER REFERENCES warehouses(id) ON DELETE CASCADE,
    bin_id INTEGER REFERENCES bins(id),
    qty_available INTEGER DEFAULT 0,
    qty_reserved INTEGER DEFAULT 0,
    supplier_po VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(sku_id, batch_no, warehouse_id)
);

-- Reservations Table (Atomic Holds)
CREATE TABLE IF NOT EXISTS reservations (
    id SERIAL PRIMARY KEY,
    owner_type VARCHAR(50) NOT NULL, -- 'order', 'pos', 'transfer'
    owner_id VARCHAR(100) NOT NULL,
    sku_id INTEGER REFERENCES products(id),
    batch_id INTEGER REFERENCES batches(id),
    qty INTEGER NOT NULL,
    status VARCHAR(50) DEFAULT 'active', -- active, committed, released
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Inventory Adjustments (Ledger)
CREATE TABLE IF NOT EXISTS inventory_adjustments (
    id SERIAL PRIMARY KEY,
    sku_id INTEGER REFERENCES products(id),
    batch_id INTEGER REFERENCES batches(id),
    warehouse_id INTEGER REFERENCES warehouses(id),
    delta INTEGER NOT NULL, -- positive or negative
    reason VARCHAR(50) NOT NULL, -- 'purchase', 'damage', 'correction', 'pos'
    reference_id VARCHAR(100), -- PO number, Order ID
    performed_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Transfer Orders
CREATE TABLE IF NOT EXISTS transfer_orders (
    id SERIAL PRIMARY KEY,
    from_warehouse_id INTEGER REFERENCES warehouses(id),
    to_warehouse_id INTEGER REFERENCES warehouses(id),
    status VARCHAR(50) DEFAULT 'created', -- created, in_transit, received, completed
    items JSONB NOT NULL, -- [{sku_id, qty, batch_id}]
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_batches_sku_wh ON batches(sku_id, warehouse_id);
CREATE INDEX IF NOT EXISTS idx_batches_expiry ON batches(expiry_date);
CREATE INDEX IF NOT EXISTS idx_reservations_expires ON reservations(expires_at) WHERE status = 'active';


-- Orders Table
CREATE TABLE IF NOT EXISTS orders (
    id VARCHAR(50) PRIMARY KEY, -- ORD-YYYY-XXXX
    user_id INTEGER REFERENCES users(id),
    status VARCHAR(50) NOT NULL, -- created, awaiting_rx, rx_review, payment_pending, paid, reserved, warehouse_assigned, picked, packed, shipped, delivered, cancelled, returned
    payment_status VARCHAR(50) DEFAULT 'pending', -- pending, authorized, paid, failed, refunded
    payment_method VARCHAR(50), -- razorpay, cod, wallet
    payment_id VARCHAR(100), -- Transaction ID
    
    total_amount DECIMAL(10, 2) NOT NULL,
    tax_amount DECIMAL(10, 2) DEFAULT 0,
    shipping_amount DECIMAL(10, 2) DEFAULT 0,
    discount_amount DECIMAL(10, 2) DEFAULT 0,
    coupon_code VARCHAR(50),
    
    shipping_address_id INTEGER REFERENCES addresses(id),
    billing_address_id INTEGER REFERENCES addresses(id),
    
    warehouse_id INTEGER REFERENCES warehouses(id),
    courier_id VARCHAR(50),
    awb_number VARCHAR(100),
    delivery_slot VARCHAR(100),
    
    prescription_required BOOLEAN DEFAULT FALSE,
    prescription_url TEXT,
    pharmacist_id INTEGER REFERENCES users(id),
    pharmacist_notes TEXT,
    
    risk_score INTEGER DEFAULT 0,
    risk_flags JSONB DEFAULT '[]',
    
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Order Items Table
CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id VARCHAR(50) REFERENCES orders(id) ON DELETE CASCADE,
    sku_id INTEGER REFERENCES products(id),
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    tax_rate DECIMAL(5, 2) DEFAULT 0,
    
    -- Fulfillment details
    batch_id INTEGER REFERENCES batches(id), -- Assigned batch
    status VARCHAR(50) DEFAULT 'pending', -- pending, picked, packed, returned
    
    UNIQUE(order_id, sku_id)
);

-- Order Timeline (Audit Log)
CREATE TABLE IF NOT EXISTS order_timeline (
    id SERIAL PRIMARY KEY,
    order_id VARCHAR(50) REFERENCES orders(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL,
    description TEXT,
    metadata JSONB DEFAULT '{}',
    created_by INTEGER REFERENCES users(id), -- NULL for system
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Returns Table

-- Return Requests Table
CREATE TABLE IF NOT EXISTS return_requests (
    id VARCHAR(50) PRIMARY KEY, -- RET-YYYY-XXXX
    order_id VARCHAR(50) REFERENCES orders(id),
    user_id INTEGER REFERENCES users(id),
    status VARCHAR(50) DEFAULT 'requested', -- requested, scheduled, picked_up, received, inspected, approved, rejected, refunded
    type VARCHAR(50) DEFAULT 'customer_return', -- customer_return, rto
    
    reason VARCHAR(100),
    description TEXT,
    images JSONB DEFAULT '[]',
    
    pickup_slot TIMESTAMP WITH TIME ZONE,
    courier_awb VARCHAR(100),
    
    refund_method VARCHAR(50), -- original, wallet
    refund_amount DECIMAL(10, 2),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Return Items Table (Granular tracking)
CREATE TABLE IF NOT EXISTS return_items (
    id SERIAL PRIMARY KEY,
    return_request_id VARCHAR(50) REFERENCES return_requests(id) ON DELETE CASCADE,
    order_item_id INTEGER REFERENCES order_items(id),
    quantity INTEGER NOT NULL,
    reason VARCHAR(100),
    condition VARCHAR(50), -- unopened, opened, damaged
    status VARCHAR(50) DEFAULT 'pending', -- pending, accepted, rejected
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- RTO Logs Table (Auto-created on delivery failure)
CREATE TABLE IF NOT EXISTS rto_logs (
    id SERIAL PRIMARY KEY,
    order_id VARCHAR(50) REFERENCES orders(id),
    courier_id VARCHAR(50),
    reason VARCHAR(100),
    status VARCHAR(50) DEFAULT 'initiated', -- initiated, received, disposed, restocked
    received_at TIMESTAMP WITH TIME ZONE,
    action_taken TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Inspections Table
CREATE TABLE IF NOT EXISTS inspections (
    id SERIAL PRIMARY KEY,
    return_request_id VARCHAR(50) REFERENCES return_requests(id),
    rto_log_id INTEGER REFERENCES rto_logs(id), -- Nullable, either return or RTO
    inspector_id INTEGER REFERENCES users(id),
    
    outcome VARCHAR(50) NOT NULL, -- accept, reject, repair, quarantine
    notes TEXT,
    images JSONB DEFAULT '[]',
    
    restock_batch_id INTEGER REFERENCES batches(id), -- If restocked
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for Returns
CREATE INDEX IF NOT EXISTS idx_return_requests_order ON return_requests(order_id);
CREATE INDEX IF NOT EXISTS idx_return_requests_status ON return_requests(status);
CREATE INDEX IF NOT EXISTS idx_rto_logs_order ON rto_logs(order_id);


-- Indexes for Orders
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);

-- Payments Table
CREATE TABLE IF NOT EXISTS payments (
    id VARCHAR(100) PRIMARY KEY, -- Gateway Payment ID (e.g., pay_Hq7...)
    order_id VARCHAR(50) REFERENCES orders(id),
    user_id INTEGER REFERENCES users(id),
    method VARCHAR(50) NOT NULL, -- card, upi, netbanking, wallet
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'INR',
    status VARCHAR(50) NOT NULL, -- created, authorized, captured, failed, refunded
    gateway VARCHAR(50) DEFAULT 'razorpay',
    
    fee DECIMAL(10, 2), -- Gateway fee
    tax DECIMAL(10, 2), -- Gateway tax
    
    error_code VARCHAR(100),
    error_description TEXT,
    
    bank_ref_no VARCHAR(100), -- UTR
    vpa VARCHAR(100), -- UPI ID
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Settlements Table (Reconciliation)
CREATE TABLE IF NOT EXISTS settlements (
    id VARCHAR(100) PRIMARY KEY, -- Gateway Settlement ID
    gateway VARCHAR(50) DEFAULT 'razorpay',
    amount DECIMAL(10, 2) NOT NULL,
    fee DECIMAL(10, 2) NOT NULL,
    tax DECIMAL(10, 2) NOT NULL,
    utr VARCHAR(100),
    status VARCHAR(50) NOT NULL, -- processed, failed
    settled_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Refund Transactions Table (Financial)
CREATE TABLE IF NOT EXISTS refund_transactions (
    id VARCHAR(100) PRIMARY KEY, -- Gateway Refund ID (e.g., rfnd_...)
    payment_id VARCHAR(100) REFERENCES payments(id),
    order_id VARCHAR(50) REFERENCES orders(id),
    amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) NOT NULL, -- processed, failed
    speed VARCHAR(50) DEFAULT 'normal', -- normal, instant
    
    reason VARCHAR(100),
    receipt_number VARCHAR(100),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for Payments
CREATE INDEX IF NOT EXISTS idx_payments_order ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_created ON payments(created_at);

-- Roles Table
CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL, -- admin, pharmacist, warehouse_lead
    description TEXT,
    is_system BOOLEAN DEFAULT FALSE, -- Cannot be deleted
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Permissions Table
CREATE TABLE IF NOT EXISTS permissions (
    id SERIAL PRIMARY KEY,
    code VARCHAR(100) UNIQUE NOT NULL, -- products.create, orders.view
    description TEXT,
    category VARCHAR(50) -- products, finance, etc.
);

-- Role Permissions (Many-to-Many)
CREATE TABLE IF NOT EXISTS role_permissions (
    role_id INTEGER REFERENCES roles(id) ON DELETE CASCADE,
    permission_id INTEGER REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

-- Employees Table (Extends Users)
CREATE TABLE IF NOT EXISTS employees (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    role_id INTEGER REFERENCES roles(id),
    
    employee_code VARCHAR(20) UNIQUE NOT NULL,
    designation VARCHAR(100),
    department VARCHAR(100),
    joining_date DATE,
    
    salary_base DECIMAL(10, 2),
    salary_allowances JSONB DEFAULT '{}',
    salary_deductions JSONB DEFAULT '{}',
    
    bank_account_no VARCHAR(50),
    bank_ifsc VARCHAR(20),
    pan_number VARCHAR(20),
    aadhaar_number VARCHAR(20),
    
    emergency_contact_name VARCHAR(100),
    emergency_contact_phone VARCHAR(20),
    
    documents JSONB DEFAULT '[]', -- [{type: 'offer_letter', url: '...'}]
    
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Attendance Table
CREATE TABLE IF NOT EXISTS attendance (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER REFERENCES employees(id),
    date DATE NOT NULL,
    check_in TIMESTAMP WITH TIME ZONE,
    check_out TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) DEFAULT 'present', -- present, absent, leave, half_day
    total_hours DECIMAL(4, 2),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(employee_id, date)
);

-- Payroll Table
CREATE TABLE IF NOT EXISTS payroll (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER REFERENCES employees(id),
    month VARCHAR(7) NOT NULL, -- YYYY-MM
    
    basic_salary DECIMAL(10, 2),
    total_allowances DECIMAL(10, 2),
    total_deductions DECIMAL(10, 2),
    net_salary DECIMAL(10, 2),
    
    status VARCHAR(20) DEFAULT 'pending', -- pending, processed, paid
    payment_date DATE,
    transaction_ref VARCHAR(100),
    
    payslip_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(employee_id, month)
);

-- Indexes for Employees
CREATE INDEX IF NOT EXISTS idx_employees_user ON employees(user_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(date);
CREATE INDEX IF NOT EXISTS idx_payroll_month ON payroll(month);

-- Campaigns Table
CREATE TABLE IF NOT EXISTS campaigns (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    rules JSONB DEFAULT '[]', -- Complex rules for the campaign
    start_at TIMESTAMP WITH TIME ZONE NOT NULL,
    end_at TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(50) DEFAULT 'draft', -- draft, active, paused, expired
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Voucher Pools Table
CREATE TABLE IF NOT EXISTS voucher_pools (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    pattern VARCHAR(50) NOT NULL, -- e.g., WELCOME-####
    total_generated INTEGER DEFAULT 0,
    is_single_use BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Coupons Table
CREATE TABLE IF NOT EXISTS coupons (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    campaign_id INTEGER REFERENCES campaigns(id),
    type VARCHAR(50) NOT NULL, -- percent, flat, bogo, free_shipping
    value DECIMAL(10, 2) NOT NULL, -- 10% or 100 INR
    cap_amount DECIMAL(10, 2), -- Max discount for percent type
    min_order_amount DECIMAL(10, 2) DEFAULT 0,
    
    applies_to JSONB DEFAULT '{}', -- {categories: [], products: [], exclude_rx: true}
    
    is_stackable BOOLEAN DEFAULT FALSE,
    stack_with JSONB DEFAULT '[]', -- List of coupon types/ids it can stack with
    priority INTEGER DEFAULT 0,
    
    usage_limit_total INTEGER,
    usage_limit_per_user INTEGER DEFAULT 1,
    
    start_at TIMESTAMP WITH TIME ZONE,
    end_at TIMESTAMP WITH TIME ZONE,
    
    is_auto_apply BOOLEAN DEFAULT FALSE,
    voucher_pool_id INTEGER REFERENCES voucher_pools(id),
    
    status VARCHAR(50) DEFAULT 'draft', -- draft, active, paused, expired
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Vouchers Table (Individual Codes from Pool)
CREATE TABLE IF NOT EXISTS vouchers (
    id SERIAL PRIMARY KEY,
    pool_id INTEGER REFERENCES voucher_pools(id) ON DELETE CASCADE,
    code VARCHAR(50) UNIQUE NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    used_at TIMESTAMP WITH TIME ZONE,
    used_by_order_id VARCHAR(50) REFERENCES orders(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Coupon Redemptions Table
CREATE TABLE IF NOT EXISTS coupon_redemptions (
    id SERIAL PRIMARY KEY,
    coupon_id INTEGER REFERENCES coupons(id),
    order_id VARCHAR(50) REFERENCES orders(id),
    user_id INTEGER REFERENCES users(id),
    discount_amount DECIMAL(10, 2) NOT NULL,
    metadata JSONB DEFAULT '{}', -- Snapshot of cart context
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for Coupons
CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_status ON coupons(status);
CREATE INDEX IF NOT EXISTS idx_vouchers_code ON vouchers(code);
CREATE INDEX IF NOT EXISTS idx_redemptions_user ON coupon_redemptions(user_id);

-- CMS Pages Table
CREATE TABLE IF NOT EXISTS cms_pages (
    id SERIAL PRIMARY KEY,
    slug VARCHAR(100) UNIQUE NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    is_published BOOLEAN DEFAULT false,
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- CMS Blocks Table (Content Sections)
CREATE TABLE IF NOT EXISTS cms_blocks (
    id SERIAL PRIMARY KEY,
    page_id INTEGER REFERENCES cms_pages(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- hero, banner_grid, product_carousel, text_block
    position INTEGER NOT NULL,
    content JSONB NOT NULL, -- flexible content structure
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- CMS Banners Table (Standalone Banners)
CREATE TABLE IF NOT EXISTS cms_banners (
    id SERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    link_url VARCHAR(500),
    position VARCHAR(50), -- home_hero, sidebar, etc.
    start_at TIMESTAMP WITH TIME ZONE,
    end_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Support Tickets Table
CREATE TABLE IF NOT EXISTS tickets (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    subject VARCHAR(200) NOT NULL,
    status VARCHAR(50) DEFAULT 'open', -- open, in_progress, resolved, closed
    priority VARCHAR(20) DEFAULT 'medium', -- low, medium, high, urgent
    category VARCHAR(50), -- order, payment, account, other
    assigned_to INTEGER REFERENCES users(id), -- Agent ID
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Ticket Messages Table
CREATE TABLE IF NOT EXISTS ticket_messages (
    id SERIAL PRIMARY KEY,
    ticket_id INTEGER REFERENCES tickets(id) ON DELETE CASCADE,
    sender_id INTEGER REFERENCES users(id), -- Null if system message
    message TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT false, -- For agent notes
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_tickets_user ON tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);

-- Delivery Zones Table
CREATE TABLE IF NOT EXISTS delivery_zones (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    pincodes JSONB DEFAULT '[]', -- List of pincodes or patterns (e.g., "400*")
    standard_cost DECIMAL(10, 2) DEFAULT 0,
    express_cost DECIMAL(10, 2) DEFAULT 0,
    delivery_days_min INTEGER DEFAULT 2,
    delivery_days_max INTEGER DEFAULT 5,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

