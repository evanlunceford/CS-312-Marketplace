CREATE TABLE comments (
  id SERIAL PRIMARY KEY,

  listing_id INTEGER NOT NULL
    REFERENCES listings(id)
    ON DELETE CASCADE,

  user_id TEXT NOT NULL
    REFERENCES users(user_id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,

  content TEXT NOT NULL
    CHECK (char_length(btrim(content)) BETWEEN 1 AND 1000),

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX comments_listing_id_index
  ON comments(listing_id);