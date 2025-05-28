# Winston AI Supabase Setup Guide

## Quick Setup (5 minutes)

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Create a new project
4. Wait for project to be ready (~2 minutes)

### 2. Run Database Schema
1. In your Supabase dashboard, go to **SQL Editor**
2. Copy and paste the contents of `supabase/minimal-schema.sql`
3. Click **Run** to execute the SQL

### 3. Get Your Environment Variables
1. Go to **Settings** → **API**
2. Copy these values:

```bash
# Add to your .env.local file
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

### 4. Configure Authentication (Optional)
1. Go to **Authentication** → **Settings**
2. Enable **Email** provider
3. For Google OAuth (optional):
   - Go to **Authentication** → **Providers**
   - Enable **Google**
   - Add your Google OAuth credentials

### 5. Test the Connection
Run your Next.js app:
```bash
npm run dev
```

Visit `http://localhost:3000` and test authentication.

## Database Schema Overview

### Core Tables Created:

#### `users`
- `id` (UUID, primary key)
- `email` (text, unique)
- `full_name` (text, optional)
- `created_at` (timestamp)

#### `campaigns`
- `id` (UUID, primary key)
- `user_id` (UUID, foreign key to users)
- `name` (text, required)
- `status` ('draft', 'active', 'paused')
- `created_at` (timestamp)

#### `leads`
- `id` (UUID, primary key)
- `campaign_id` (UUID, foreign key to campaigns)
- `email` (text, required)
- `status` ('new', 'contacted', 'qualified', 'unqualified')
- `last_contacted` (timestamp, optional)
- `created_at` (timestamp)

## Security Configuration

### Row Level Security (RLS)
- All tables have RLS enabled
- Current policies allow full access for MVP
- Modify policies in production for proper security

### Recommended Production Policies
Replace the open policies with these for production:

```sql
-- Users: Users can only see/edit their own data
create policy "Users can view own data" on users 
  for select using (auth.uid()::text = id::text);

-- Campaigns: Users can only see/edit their own campaigns
create policy "Users can view own campaigns" on campaigns 
  for select using (auth.uid()::text = user_id::text);

-- Leads: Users can only see leads from their campaigns
create policy "Users can view own leads" on leads 
  for select using (
    campaign_id in (
      select id from campaigns where user_id::text = auth.uid()::text
    )
  );
```

## Testing Your Setup

### 1. Test Database Connection
```javascript
// Test in browser console or create a test page
import { supabase } from '@/lib/supabase';

// Test connection
const testConnection = async () => {
  const { data, error } = await supabase.from('users').select('*');
  console.log('Connection test:', { data, error });
};
```

### 2. Test Authentication
```javascript
// Test sign up
const testSignUp = async () => {
  const { data, error } = await supabase.auth.signUp({
    email: 'test@example.com',
    password: 'testpassword123'
  });
  console.log('Sign up test:', { data, error });
};
```

### 3. Test Data Operations
```javascript
// Test creating a user
const testCreateUser = async () => {
  const { data, error } = await supabase
    .from('users')
    .insert([
      { email: 'test@example.com', full_name: 'Test User' }
    ]);
  console.log('Create user test:', { data, error });
};
```

## Troubleshooting

### Common Issues:

1. **"relation does not exist" error**
   - Make sure you ran the SQL schema in the correct database
   - Check that you're connected to the right Supabase project

2. **Authentication not working**
   - Verify your environment variables are correct
   - Check that Supabase URL and anon key match your project

3. **RLS blocking queries**
   - For MVP, the policies are open (allow all)
   - If you modified policies, ensure they match your auth setup

4. **CORS errors**
   - Add your domain to Supabase **Authentication** → **Settings** → **Site URL**

### Getting Help:
- Check Supabase logs in **Logs** → **Database**
- Use Supabase **Table Editor** to manually verify data
- Test queries in **SQL Editor** before using in code

## Next Steps

1. **Add sample data** for testing
2. **Configure email templates** in Supabase
3. **Set up proper RLS policies** for production
4. **Add indexes** for better performance
5. **Configure backups** in Supabase settings

## Advanced Schema (Optional)

If you need more features, use `supabase/schema.sql` instead, which includes:
- Teams and team management
- Email templates
- Lead activities tracking
- Analytics events
- Chatbot interactions
- Proper RLS policies
- Performance indexes
- Automatic triggers

This advanced schema is production-ready and includes all features needed for a full Winston AI deployment. 