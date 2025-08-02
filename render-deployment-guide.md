# Render Database Deployment Guide

## Quick Deploy to Render PostgreSQL

### Option 1: Render Shell (Recommended)
1. Go to your Render dashboard
2. Open your "open-house-planner-db" PostgreSQL database
3. Click the **Shell** tab
4. Copy and paste the entire contents of `deploy-database.sql`
5. Press Enter to execute

### Option 2: Upload SQL File
1. In Render Shell, use:
   ```sql
   \i deploy-database.sql
   ```
   (if you can upload the file)

### Option 3: Command Line
```bash
psql "your-render-connection-string" < deploy-database.sql
```

## What This Script Does

✅ **Complete Database Setup:**
- Drops existing tables (clean slate)
- Creates `users` table with proper structure
- Creates `open_houses` table with user relationships
- Creates `session` table for authentication
- Adds all necessary indexes for performance

✅ **User Data Migration:**
- Migrates Tom McCarthy (tommccarthy@outlook.com)
- Migrates Jenna McCarthy (jenna.mccarthy@gmail.com)
- Preserves original hashed passwords

✅ **Production Ready:**
- Foreign key constraints
- Proper data types
- Performance indexes
- Session management setup

## After Running the Script

1. **Verify deployment** - the script will show:
   - "Database setup complete!"
   - User count confirmation
   - Table count confirmation
   - List of created users

2. **Update your Render web service** environment variables:
   - `DATABASE_URL` = your PostgreSQL connection string
   - `SESSION_SECRET` = a secure random string

3. **Deploy your application** to Render

4. **Test login** at theOpenHousePlanner.com:
   - Tom: "tommccarthy@outlook.com" / "D@leJr88"
   - Jenna: "jenna.mccarthy@gmail.com" / "Hulu25"

## Rollback Plan

If something goes wrong:
1. The script starts with `DROP TABLE IF EXISTS` - it's safe to re-run
2. Simply execute the script again for a clean deployment
3. No data loss since this is setting up the production database

## Next Steps

After successful database deployment:
1. Deploy your web application code to Render
2. Test authentication system
3. Verify user data isolation
4. Test all open house CRUD operations

Your production database will be fully set up and ready to use!