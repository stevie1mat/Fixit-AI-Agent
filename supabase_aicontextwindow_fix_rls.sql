-- Fix RLS policies for AIContextWindow table
-- Run this in Supabase SQL Editor if you're getting RLS policy violations

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can view own context" ON public."AIContextWindow";
DROP POLICY IF EXISTS "Users can insert own context" ON public."AIContextWindow";
DROP POLICY IF EXISTS "Users can update own context" ON public."AIContextWindow";
DROP POLICY IF EXISTS "Users can delete own context" ON public."AIContextWindow";
DROP POLICY IF EXISTS "Service role can manage context" ON public."AIContextWindow";

-- Option 1: Allow all operations (backend validates userId)
-- This allows the backend API to manage context for any userId
CREATE POLICY "Service role can manage context" ON public."AIContextWindow"
  FOR ALL USING (true) WITH CHECK (true);

-- OR Option 2: Disable RLS if backend uses service role key
-- ALTER TABLE public."AIContextWindow" DISABLE ROW LEVEL SECURITY;

