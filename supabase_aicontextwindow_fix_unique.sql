-- Fix: Add unique constraint on userId to prevent duplicate records
-- This ensures upsert updates existing records instead of creating new ones

-- STEP 1: First, clean up any duplicate records (keep the most recent one per userId)
-- This must be run BEFORE creating the unique index
DELETE FROM public."AIContextWindow" a
USING public."AIContextWindow" b
WHERE a."userId" = b."userId"
  AND a."updatedAt" < b."updatedAt";

-- Alternative: If above doesn't work, delete all but the one with the latest updatedAt:
-- WITH ranked AS (
--   SELECT id, ROW_NUMBER() OVER (PARTITION BY "userId" ORDER BY "updatedAt" DESC) as rn
--   FROM public."AIContextWindow"
-- )
-- DELETE FROM public."AIContextWindow"
-- WHERE id IN (SELECT id FROM ranked WHERE rn > 1);

-- STEP 2: Drop existing index if it exists (in case it was created as non-unique)
DROP INDEX IF EXISTS idx_aicontextwindow_userid_unique;

-- STEP 3: Create unique constraint on userId
-- This will prevent future duplicates
CREATE UNIQUE INDEX idx_aicontextwindow_userid_unique 
ON public."AIContextWindow"("userId");

