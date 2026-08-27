-- Customer address book
--
-- Orders already store their delivery address as JSONB, so historical orders
-- are self-contained and unaffected by a later edit or deletion here. This
-- table is the reusable book the customer picks from, which previously lived
-- only in React state and was lost on every refresh.

CREATE TYPE address_label AS ENUM ('home', 'work', 'other');

CREATE TABLE addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    label address_label NOT NULL DEFAULT 'home',
    recipient_name VARCHAR(120) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    line1 VARCHAR(255) NOT NULL,
    city VARCHAR(80) NOT NULL,
    pincode VARCHAR(6) NOT NULL,

    is_default BOOLEAN NOT NULL DEFAULT FALSE,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    CONSTRAINT pincode_is_six_digits CHECK (pincode ~ '^[0-9]{6}$')
);

CREATE INDEX idx_addresses_user_id ON addresses(user_id);

-- At most one default per customer, enforced by the database rather than by
-- application code remembering to clear the old one.
CREATE UNIQUE INDEX idx_one_default_address_per_user
    ON addresses(user_id) WHERE is_default;

CREATE TRIGGER update_addresses_updated_at BEFORE UPDATE ON addresses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
