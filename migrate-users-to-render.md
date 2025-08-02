# Migrating Users Table to Render PostgreSQL Database

This guide will help you migrate your populated users table from your current development database to the "open-house-planner-db" PostgreSQL database on Render.

## Prerequisites

1. Access to your Render dashboard
2. Connection string for "open-house-planner-db" 
3. Current users table with Tom McCarthy and Jenna McCarthy data

## Step 1: Get Your Render Database Connection String

1. Log into your Render dashboard
2. Navigate to your "open-house-planner-db" PostgreSQL database
3. Copy the **External Database URL** (starts with `postgresql://`)
4. Save this connection string - you'll need it for the migration

## Step 2: Export Current Users Data

Run this SQL query in your current database to get the user data:

```sql
-- Export users data
SELECT 
  name,
  email,
  password,
  created_at
FROM users 
ORDER BY id;
```

Expected output:
```
Tom McCarthy,tommccarthy@outlook.com,[hashed_password],2025-01-02 18:33:40.123456
Jenna McCarthy,jenna.mccarthy@gmail.com,[hashed_password],2025-01-02 18:33:40.123456
```

## Step 3: Connect to Render Database

Use one of these methods to connect to your Render PostgreSQL database:

### Option A: Using psql command line
```bash
psql "postgresql://your-render-db-connection-string"
```

### Option B: Using pgAdmin or DBeaver
- Create new connection using the Render connection string
- Test connection before proceeding

## Step 4: Create Users Table on Render (if not exists)

Run this SQL to create the users table structure:

```sql
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  password TEXT NOT NULL,
  created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_name ON users(name);
```

## Step 5: Insert User Data

Insert your users with the exact same data:

```sql
-- Insert Tom McCarthy
INSERT INTO users (name, email, password, created_at) 
VALUES (
  'Tom McCarthy',
  'tommccarthy@outlook.com',
  '$2b$10$[your_actual_hashed_password_here]',
  '2025-01-02 18:33:40.123456'
);

-- Insert Jenna McCarthy  
INSERT INTO users (name, email, password, created_at)
VALUES (
  'Jenna McCarthy', 
  'jenna.mccarthy@gmail.com',
  '$2b$10$[your_actual_hashed_password_here]',
  '2025-01-02 18:33:40.123456'
);
```

**Important:** Replace `[your_actual_hashed_password_here]` with the actual hashed passwords from your export.

## Step 6: Verify Migration

After inserting, verify the data:

```sql
-- Check users were created correctly
SELECT id, name, email, created_at FROM users ORDER BY id;

-- Verify passwords are properly hashed (should start with $2b$)
SELECT name, LEFT(password, 10) as password_start FROM users;
```

## Step 7: Update Your Application Configuration

1. Update your Render deployment environment variables:
   - Set `DATABASE_URL` to your Render PostgreSQL connection string
   - Ensure `SESSION_SECRET` is set for session management

2. Deploy your application to Render

3. Test login functionality with both users:
   - Tom McCarthy: email "tommccarthy@outlook.com", password "D@leJr88"
   - Jenna McCarthy: email "jenna.mccarthy@gmail.com", password "Hulu25"

## Troubleshooting

### Connection Issues
- Verify your Render database is running and accessible
- Check that your IP is whitelisted (Render PostgreSQL allows all IPs by default)
- Ensure connection string includes all parameters

### Authentication Issues  
- Verify passwords are properly hashed with bcrypt/scrypt
- Check that password hashing algorithm matches your application code
- Test login API endpoints directly

### Data Issues
- Ensure email addresses match exactly (case-sensitive)
- Verify timestamps are in correct format
- Check for any missing or null required fields

## Security Notes

- Never commit actual passwords or connection strings to version control
- Use environment variables for sensitive data
- Consider rotating passwords after migration if needed
- Backup your data before making changes

## Rollback Plan

If issues occur:
1. Keep your original development database intact
2. You can drop and recreate the users table on Render
3. Re-run the migration steps with corrected data

---

**Next Steps After Migration:**
1. Test both user logins on your production site
2. Verify user data isolation (each user only sees their own properties)
3. Test all authentication flows (login, logout, session persistence)