-- Create AIContextWindow table for storing conversation context and messages
CREATE TABLE IF NOT EXISTS public."AIContextWindow" (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "storeConnectionId" TEXT,
  "recentMessages" TEXT NOT NULL DEFAULT '[]',
  "currentIssues" TEXT NOT NULL DEFAULT '[]',
  "optimizationHistory" TEXT NOT NULL DEFAULT '[]',
  "storeData" TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups by userId
CREATE INDEX IF NOT EXISTS idx_aicontextwindow_userid ON public."AIContextWindow"("userId");

-- Enable Row Level Security
ALTER TABLE public."AIContextWindow" ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Allow users to view their own context
CREATE POLICY "Users can view own context" ON public."AIContextWindow"
  FOR SELECT USING (auth.uid()::text = "userId");

-- Allow users to insert their own context
CREATE POLICY "Users can insert own context" ON public."AIContextWindow"
  FOR INSERT WITH CHECK (auth.uid()::text = "userId");

-- Allow users to update their own context
CREATE POLICY "Users can update own context" ON public."AIContextWindow"
  FOR UPDATE USING (auth.uid()::text = "userId");

-- Allow users to delete their own context
CREATE POLICY "Users can delete own context" ON public."AIContextWindow"
  FOR DELETE USING (auth.uid()::text = "userId");

-- Note: If you're using service role key (server-side only), you can temporarily disable RLS
-- ALTER TABLE public."AIContextWindow" DISABLE ROW LEVEL SECURITY;

