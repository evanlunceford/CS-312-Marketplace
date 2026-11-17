CREATE TABLE user_profiles (
  user_id TEXT PRIMARY KEY
    REFERENCES users(user_id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,

  bio TEXT NOT NULL DEFAULT ''
    CHECK (char_length(bio) <= 1000),

  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create profiles for existing users
INSERT INTO user_profiles (user_id)
SELECT user_id FROM users
ON CONFLICT (user_id) DO NOTHING;