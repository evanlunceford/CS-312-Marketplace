-- Server-side sign-in sessions. The browser holds a random token in an httpOnly cookie;
-- only its SHA-256 hash is stored here, so a leaked table cannot be used to sign in.
CREATE TABLE sessions (
  token_hash TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX sessions_user_id_index ON sessions (user_id);
