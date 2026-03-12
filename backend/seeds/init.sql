\c whiteboard;

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name TEXT,
  email TEXT UNIQUE,
  image TEXT
);

CREATE TABLE IF NOT EXISTS boards (
  id UUID PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  objects JSONB,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);