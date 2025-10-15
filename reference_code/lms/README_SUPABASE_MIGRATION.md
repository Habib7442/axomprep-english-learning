# Supabase Migration Instructions

This document outlines the necessary steps to update your Supabase database schema to support the new retake functionality and user-specific flashcards.

## Migration Script

The following SQL script needs to be executed on your Supabase database:

```sql
-- Add is_retake column to mock_test_questions table
ALTER TABLE mock_test_questions 
ADD COLUMN IF NOT EXISTS is_retake BOOLEAN DEFAULT FALSE;

-- Add user_id column to flashcards table
ALTER TABLE flashcards 
ADD COLUMN IF NOT EXISTS user_id TEXT;
```

## How to Apply the Migration

1. Log in to your Supabase dashboard
2. Navigate to the SQL editor
3. Copy and paste the above SQL script
4. Run the script

## What This Migration Does

1. Adds a new `is_retake` boolean column to the `mock_test_questions` table
   - Sets the default value to `FALSE` for existing records
   - This column will be used to distinguish between first attempts and retakes of mock tests

2. Adds a new `user_id` text column to the `flashcards` table
   - This column will be used to associate flashcards with specific users
   - Allows for user-specific flashcard storage and retrieval

## Why This Migration is Needed

This migration is required to support:
1. The new retake functionality that prevents students from immediately retaking tests (24-hour cooldown)
2. User-specific flashcard storage for better personalization
3. Better analytics on student progress
4. Improved data security and organization

## After Applying the Migration

After applying this migration:
- The retake functionality will work as expected with 24-hour cooldown
- Retakes are clearly marked in the "My Journey" page
- Test results are properly stored with retake information
- Flashcards can be saved and retrieved per user
- All existing functionality continues to work as before