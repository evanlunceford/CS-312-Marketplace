-- Accounts. user_id is the login handle the user picks at signup (the proposal's "user_id"),
-- so other tables can reference users(user_id) directly.
CREATE TABLE users (
  user_id TEXT PRIMARY KEY CHECK (user_id ~ '^[A-Za-z0-9_]{3,30}$'),
  name TEXT NOT NULL CHECK (char_length(btrim(name)) BETWEEN 1 AND 100),
  email TEXT NOT NULL CHECK (email ~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'),
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Case-insensitive uniqueness: "Joe" and "joe" are the same account.
CREATE UNIQUE INDEX users_user_id_lower_key ON users (lower(user_id));
CREATE UNIQUE INDEX users_email_lower_key ON users (lower(email));
