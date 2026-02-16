-- Migration: Create coupons and coupon_usages tables
-- Created: 2026-02-14

-- Create enum types
DO $$ BEGIN
    CREATE TYPE coupon_type AS ENUM ('percentage', 'fixed_amount');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE applicable_products_type AS ENUM ('all', 'specific', 'category');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create coupons table
CREATE TABLE IF NOT EXISTS coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    type coupon_type NOT NULL DEFAULT 'percentage',
    value DECIMAL(10, 2) NOT NULL,
    min_order_amount DECIMAL(10, 2),
    max_discount_amount DECIMAL(10, 2),
    usage_limit INTEGER NOT NULL DEFAULT 0,
    usage_count INTEGER NOT NULL DEFAULT 0,
    per_user_limit INTEGER NOT NULL DEFAULT 1,
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    applicable_products applicable_products_type NOT NULL DEFAULT 'all',
    applicable_product_ids JSONB NOT NULL DEFAULT '[]',
    applicable_categories JSONB NOT NULL DEFAULT '[]',
    excluded_products JSONB NOT NULL DEFAULT '[]',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create coupon_usages table
CREATE TABLE IF NOT EXISTS coupon_usages (
    id SERIAL PRIMARY KEY,
    coupon_id UUID NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL,
    order_id VARCHAR(100),
    discount_amount DECIMAL(10, 2) NOT NULL,
    used_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_is_active ON coupons(is_active);
CREATE INDEX IF NOT EXISTS idx_coupons_start_date ON coupons(start_date);
CREATE INDEX IF NOT EXISTS idx_coupons_end_date ON coupons(end_date);
CREATE INDEX IF NOT EXISTS idx_coupon_usages_coupon_id ON coupon_usages(coupon_id);
CREATE INDEX IF NOT EXISTS idx_coupon_usages_user_id ON coupon_usages(user_id);
CREATE INDEX IF NOT EXISTS idx_coupon_usages_user_coupon ON coupon_usages(user_id, coupon_id);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_coupons_updated_at ON coupons;
CREATE TRIGGER update_coupons_updated_at
    BEFORE UPDATE ON coupons
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert sample coupons for testing
-- Note: These can be removed in production
INSERT INTO coupons (code, description, type, value, min_order_amount, max_discount_amount, usage_limit, per_user_limit, is_active, applicable_products)
VALUES 
    ('WELCOME10', '10% off on your first order', 'percentage', 10, 500, 200, 1000, 1, TRUE, 'all'),
    ('FLAT50', 'Flat 50 off on orders above 1000', 'fixed_amount', 50, 1000, NULL, 500, 1, TRUE, 'all'),
    ('SAVE20', '20% off up to 500', 'percentage', 20, 1000, 500, 200, 1, TRUE, 'all')
ON CONFLICT (code) DO NOTHING;
