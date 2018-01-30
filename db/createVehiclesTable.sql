CREATE TABLE IF NOT EXISTS vehicles (
  id SERIAL PRIMARY KEY,
  make TEXT,
  model TEXT,
  year INTEGER,
  owner_id INTEGER REFERENCES users(id)
);