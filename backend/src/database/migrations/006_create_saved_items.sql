-- Wishlist / saved items
--
-- Linked from three places in the customer dashboard but backed by nothing, so
-- the page showed a permanent empty state.

CREATE TABLE saved_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Saving the same product twice is a no-op, not a second row.
    UNIQUE (user_id, product_id)
);

CREATE INDEX idx_saved_items_user_id ON saved_items(user_id);
