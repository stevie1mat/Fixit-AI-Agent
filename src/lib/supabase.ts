import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY // Service role key bypasses RLS

// Check if environment variables are set
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase environment variables are missing!')
  console.error('Please add the following to your .env.local file:')
  console.error('NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url')
  console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key')
  console.error('SUPABASE_SERVICE_ROLE_KEY=your_service_role_key (optional, bypasses RLS)')
}

// Use service role key if available (bypasses RLS), otherwise use anon key
// Service role key is more secure for server-side operations
const supabaseKey = supabaseServiceKey || supabaseAnonKey

// Create client only if environment variables are available
// This prevents runtime errors if env vars are missing
export const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey)
  : createClient('https://placeholder.supabase.co', 'placeholder-key')

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          created_at?: string
          updated_at?: string
        }
      }
      store_connections: {
        Row: {
          id: string
          user_id: string
          type: 'shopify' | 'wordpress'
          url: string
          access_token: string | null
          username: string | null
          app_password: string | null
          is_connected: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: 'shopify' | 'wordpress'
          url: string
          access_token?: string | null
          username?: string | null
          app_password?: string | null
          is_connected?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: 'shopify' | 'wordpress'
          url?: string
          access_token?: string | null
          username?: string | null
          app_password?: string | null
          is_connected?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
