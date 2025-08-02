-- Migration SQL for Render PostgreSQL Database
-- Run these commands on your Render "open-house-planner-db" database

-- Step 1: Create users table structure
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  password TEXT NOT NULL,
  created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
);

-- Step 2: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_name ON users(name);

-- Step 3: Insert user data (replace with actual hashed passwords from export)
-- Use the passwords from your current database export

INSERT INTO users (name, email, password, created_at) VALUES
('Tom McCarthy', 'tommccarthy@outlook.com', 'dd8d601a3970b639565376176c4decd99f9a9be4316d737380a5a481a50143c270f84d7e6c082897b343710b75612cf2a9b5505b808d212c337bbd71631b58bd.c2a56c1c7910dda0cee029671e7620ed', '2025-08-02 13:34:45.618753'),
('Jenna McCarthy', 'jenna.mccarthy@gmail.com', '6c6de6c4ce63c7a8b71eb8accb41a0b7212e1da1ac76ee79869f97246d1f26ed043da0e9ea4bdbc72802467d89217a16f182ecce97e96b000d234cb84b472f9e.91315ba7fabd9ec7e526c9673b3bdb95', '2025-08-02 13:34:46.513711');

-- Step 4: Verify the migration
SELECT id, name, email, created_at FROM users ORDER BY id;
SELECT name, LEFT(password, 10) as password_preview FROM users;