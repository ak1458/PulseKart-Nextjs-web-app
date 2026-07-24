-- Prescriptions
--
-- Prescription-only medicines may not be dispensed without a retained copy of
-- the prescription. The checkout flow previously "uploaded" the file with a
-- setTimeout and discarded it, so no such record existed.
--
-- File bytes are stored in the database rather than on the filesystem because
-- the application runs on ephemeral container storage - anything written to
-- local disk is lost on restart or redeploy. Move to object storage with a
-- signed-URL reference if volume makes bytea impractical.

CREATE TYPE prescription_status AS ENUM ('pending_review', 'approved', 'rejected');

CREATE TABLE prescriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status prescription_status NOT NULL DEFAULT 'pending_review',
    file_name VARCHAR(255) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    size_bytes INTEGER NOT NULL CHECK (size_bytes > 0),
    content BYTEA NOT NULL,
    reviewed_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    review_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_prescriptions_user_id ON prescriptions(user_id);
CREATE INDEX idx_prescriptions_status ON prescriptions(status);

-- Link an order to the prescription it was dispensed against.
ALTER TABLE orders
    ADD COLUMN prescription_id UUID REFERENCES prescriptions(id) ON DELETE SET NULL;

CREATE INDEX idx_orders_prescription_id ON orders(prescription_id);
