# MongoDB Setup for Ignitia Project

This guide will help you set up MongoDB Atlas connection for your Ignitia project.

## Current Issue: Authentication Failed

The main issue is that your MongoDB Atlas credentials are not working. Here's how to fix it:

## Step 1: Fix MongoDB Atlas Credentials

### Option A: Fix Existing User
1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Sign in to your account
3. Select your cluster: `cluster0.ordetpq.mongodb.net`
4. Go to **Database Access** → **Database Users**
5. Find user `arsansk09` and click **Edit**
6. **Set a new simple password** (avoid special characters for now)
7. Ensure the user has **"readWrite"** privileges to the **"Ignitia"** database
8. Click **Update User**

### Option B: Create New User (Recommended)
1. Go to **Database Access** → **Database Users**
2. Click **Add New Database User**
3. Choose **Password** authentication
4. Set username: `ignitia_user`
5. Set password: `ignitia_pass` (simple for testing)
6. Database User Privileges: **"readWrite"** to **"Ignitia"** database
7. Click **Add User**

## Step 2: Check Network Access

1. Go to **Network Access** → **IP Access List**
2. Click **Add IP Address**
3. Choose **"Allow access from anywhere"** (0.0.0.0/0)
4. Or add your specific IP address
5. Click **Confirm**

## Step 3: Update Connection String

### If you fixed existing user:
Update your `.env` file:
```env
DATABASE_URL=mongodb+srv://arsansk09:YOUR_NEW_PASSWORD@cluster0.ordetpq.mongodb.net/Ignitia?retryWrites=true&w=majority&appName=Cluster0
```

### If you created new user:
Update your `.env` file:
```env
DATABASE_URL=mongodb+srv://ignitia_user:ignitia_pass@cluster0.ordetpq.mongodb.net/Ignitia?retryWrites=true&w=majority&appName=Cluster0
```

**Note:** Special characters in passwords need URL encoding:
- `@` becomes `%40`
- `#` becomes `%23` 
- `$` becomes `%24`
- etc.

## Step 4: Test Connection

Run the credential checker:
```bash
npm run mongodb:check
```

This will test your connection and provide specific error messages.

## Step 5: Setup Database Collections

Once connection works, run:
```bash
npm run mongodb:setup
```

This will:
- ✅ Create all required collections
- 🔍 Set up performance indexes  
- 📊 Display database status

## Step 6: Start Your Project

```bash
npm run dev
```

Your project should now start without database errors!

## Available Scripts

- `npm run mongodb:check` - Test MongoDB credentials
- `npm run mongodb:setup` - Set up database collections and indexes
- `npm run mongodb:test` - Basic connection test
- `npm run dev` - Start development server

## Troubleshooting

### Authentication Failed
- ❌ **Wrong password**: Reset password in MongoDB Atlas
- ❌ **User doesn't exist**: Create user in Database Access
- ❌ **Wrong permissions**: Ensure "readWrite" access to "Ignitia" database

### Network Issues  
- ❌ **Connection timeout**: Check Network Access IP whitelist
- ❌ **Firewall blocking**: Add 0.0.0.0/0 to IP Access List
- ❌ **Corporate proxy**: Contact your IT department

### URL Encoding Issues
- ❌ **Special characters**: Use URL encoding for passwords with special chars
- ✅ **Simple passwords**: Use alphanumeric passwords for development

## Database Structure

Your MongoDB database will have these collections:
- `users` - User accounts and profiles
- `organizations` - Event organizing entities
- `events` - Hackathons, conferences, etc.
- `teams` - Event teams
- `teammembers` - Team membership
- `eventregistrations` - Event registrations
- `submissions` - Team submissions
- `badges` - User badges and achievements
- `certificates` - Generated certificates
- `eventrounds` - Multi-round event structure
- `evaluations` - Submission evaluations
- `userconnections` - Social connections
- `organizationfollowers` - Organization followers
- `announcements` - Event announcements  
- `qathreads` - Q&A discussions
- `qareplies` - Q&A responses

## Security Notes

⚠️ **For Production:**
- Use strong, unique passwords
- Restrict IP access to specific addresses
- Enable MongoDB Atlas security features
- Use environment variables for all credentials
- Regularly rotate database passwords

🛡️ **Current Setup (Development):**
- Simple passwords for easy testing
- Open IP access (0.0.0.0/0) for convenience
- All credentials in `.env` file

---

## Need Help?

If you're still having issues:

1. **Check MongoDB Atlas Status**: Sometimes there are service outages
2. **Try Different Network**: Test from a different internet connection
3. **Create Fresh Cluster**: If nothing works, create a new cluster
4. **Contact MongoDB Support**: For Atlas-specific issues

Once connected, your project should work seamlessly with MongoDB Atlas! 🚀
