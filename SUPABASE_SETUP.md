# Supabase Authentication Setup

This guide will help you set up Supabase authentication for the Fix It AI application.

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/sign in
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - Name: `fixit-ai` (or your preferred name)
   - Database Password: Create a strong password
   - Region: Choose closest to your users
5. Click "Create new project"

## 2. Get Your Project Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (starts with `https://`)
   - **anon public** key (starts with `eyJ`)

## 3. Configure Environment Variables

1. Create a `.env.local` file in your project root (if it doesn't exist)
2. Add your Supabase credentials:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL="your-project-url-here"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key-here"
```

## 4. Set Up Database Tables (Optional)

The app will automatically create users through Supabase Auth. If you want to store additional user data, you can create custom tables:

```sql
-- Create users table (extends auth.users)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create store connections table
CREATE TABLE public.store_connections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT CHECK (type IN ('shopify', 'wordpress')) NOT NULL,
  url TEXT NOT NULL,
  access_token TEXT NOT NULL,
  is_connected BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_connections ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own connections" ON public.store_connections
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own connections" ON public.store_connections
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own connections" ON public.store_connections
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own connections" ON public.store_connections
  FOR DELETE USING (auth.uid() = user_id);
```

## 5. Configure Authentication Settings

1. In your Supabase dashboard, go to **Authentication** → **Settings**
2. Configure the following:
   - **Site URL**: `http://localhost:3000` (for development)
   - **Redirect URLs**: Add `http://localhost:3000/login`
   - **Email Templates**: Customize if desired

## 6. Test the Setup

1. Start your development server: `npm run dev`
2. Visit `http://localhost:3000`
3. Click "Get Started" to go to the login page
4. Try creating an account and signing in

## 7. Production Deployment

For production, update your environment variables with your production Supabase project credentials and update the Site URL in Supabase settings to your production domain.

## Troubleshooting

- **"Invalid API key"**: Double-check your environment variables
- **"Site URL not allowed"**: Update the Site URL in Supabase Auth settings
- **Database connection issues**: Ensure your Supabase project is active and the database password is correct

## Security Notes

- Never commit your `.env.local` file to version control
- Use environment variables for all sensitive configuration
- The anon key is safe to expose in client-side code
- Row Level Security (RLS) ensures users can only access their own data
