CREATE TABLE transactions (
  id SERIAL PRIMARY KEY,

  listing_id INTEGER NOT NULL UNIQUE
    REFERENCES listings(id)
    ON DELETE RESTRICT,

  buyer_id TEXT NOT NULL
    REFERENCES users(user_id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,

  seller_id TEXT NOT NULL
    REFERENCES users(user_id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,

  sale_price NUMERIC(10, 2) NOT NULL
    CHECK (sale_price >= 0),

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CHECK (buyer_id <> seller_id)
);

CREATE INDEX transactions_buyer_id_index
  ON transactions(buyer_id);

CREATE INDEX transactions_seller_id_index
  ON transactions(seller_id);