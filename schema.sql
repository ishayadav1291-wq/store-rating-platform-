-- users table
CREATE TYPE user_role AS ENUM ('admin', 'user', 'owner');

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(60) NOT NULL CHECK (LENGTH(name) >= 20),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  address VARCHAR(400) NOT NULL,
  role user_role DEFAULT 'user',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_name ON users(name);
CREATE INDEX idx_users_email ON users(email);

-- stores table
CREATE TABLE stores (
  id SERIAL PRIMARY KEY,
  owner_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(60) NOT NULL CHECK (LENGTH(name) >= 20),
  email VARCHAR(255) NOT NULL,
  address VARCHAR(400) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_stores_name ON stores(name);
CREATE INDEX idx_stores_address ON stores(address);

-- ratings table
CREATE TABLE ratings (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  store_id INTEGER REFERENCES stores(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, store_id)
);

CREATE INDEX idx_ratings_store ON ratings(store_id);
