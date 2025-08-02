-- Database Migration Script for Render PostgreSQL
-- This script creates all necessary tables and data for the Open House Planner
-- Execute this script once on your Render PostgreSQL database

-- Drop existing tables if they exist (for clean deployment)
DROP TABLE IF EXISTS open_houses CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS session CASCADE;

-- Create users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  password TEXT NOT NULL,
  created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create open_houses table with user relationship
CREATE TABLE open_houses (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  address TEXT NOT NULL,
  price TEXT,
  zestimate TEXT,
  monthly_payment TEXT,
  date TEXT,
  time TEXT,
  image_url TEXT,
  image_data TEXT,
  listing_url TEXT,
  notes TEXT,
  visited BOOLEAN NOT NULL DEFAULT FALSE,
  favorited BOOLEAN NOT NULL DEFAULT FALSE,
  disliked BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create session table for express-session storage
CREATE TABLE session (
  sid VARCHAR NOT NULL COLLATE "default",
  sess JSON NOT NULL,
  expire TIMESTAMP(6) NOT NULL
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_name ON users(name);
CREATE INDEX idx_open_houses_user_id ON open_houses(user_id);
CREATE INDEX idx_open_houses_date ON open_houses(date);
CREATE INDEX idx_open_houses_visited ON open_houses(visited);
CREATE INDEX idx_open_houses_favorited ON open_houses(favorited);

-- Session table constraints and indexes
ALTER TABLE session ADD CONSTRAINT session_pkey PRIMARY KEY (sid) NOT DEFERRABLE INITIALLY IMMEDIATE;
CREATE INDEX idx_session_expire ON session(expire);

-- Insert user data with actual hashed passwords
INSERT INTO users (name, email, password, created_at) VALUES
('Tom McCarthy', 'tommccarthy@outlook.com', 'dd8d601a3970b639565376176c4decd99f9a9be4316d737380a5a481a50143c270f84d7e6c082897b343710b75612cf2a9b5505b808d212c337bbd71631b58bd.c2a56c1c7910dda0cee029671e7620ed', '2025-08-02 13:34:45.618753'),
('Jenna McCarthy', 'jenna.mccarthy@gmail.com', '6c6de6c4ce63c7a8b71eb8accb41a0b7212e1da1ac76ee79869f97246d1f26ed043da0e9ea4bdbc72802467d89217a16f182ecce97e96b000d234cb84b472f9e.91315ba7fabd9ec7e526c9673b3bdb95', '2025-08-02 13:34:46.513711');

-- Verify the deployment
SELECT 'Database setup complete!' as status;
SELECT 'Users created:' as info, COUNT(*) as user_count FROM users;
SELECT 'Tables created:' as info, COUNT(*) as table_count 
FROM information_schema.tables 
WHERE table_schema = 'public' AND table_type = 'BASE TABLE';

-- Show user accounts
SELECT id, name, email, created_at FROM users ORDER BY id;