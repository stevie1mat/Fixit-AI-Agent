-- STEP 1: DELETE DUPLICATES FIRST (keep most recent record per userId)
-- Run this FIRST before creating the unique index

-- Option A: Delete duplicates keeping the one with latest updatedAt
DELETE FROM public."AIContextWindow" a
USING public."AIContextWindow" b
WHERE a."userId" = b."userId"
  AND a."updatedAt" < b."updatedAt";

-- If Option A doesn't work (if both have same updatedAt), use Option B:
-- WITH duplicates AS (
--   SELECT id, 
--          ROW_NUMBER() OVER (PARTITION BY "userId" ORDER BY "updatedAt" DESC, id DESC) as row_num
--   FROM public."AIContextWindow"
-- )
-- DELETE FROM public."AIContextWindow"
-- WHERE id IN (SELECT id FROM duplicates WHERE row_num > 1);

-- STEP 2: Now create the unique index (this should work after duplicates are removed)
DROP INDEX IF EXISTS idx_aicontextwindow_userid_unique;

CREATE UNIQUE INDEX idx_aicontextwindow_userid_unique 
ON public."AIContextWindow"("userId");

