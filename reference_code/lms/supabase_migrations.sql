-- Add is_retake column to mock_test_questions table (if not exists)
ALTER TABLE mock_test_questions 
ADD COLUMN IF NOT EXISTS is_retake BOOLEAN DEFAULT FALSE;

-- Add user_id column to flashcards table (if not exists)
ALTER TABLE flashcards 
ADD COLUMN IF NOT EXISTS user_id TEXT;

-- Add foreign key constraint for user_id if needed (optional)
-- ALTER TABLE flashcards 
-- ADD CONSTRAINT fk_flashcards_user_id 
-- FOREIGN KEY (user_id) REFERENCES auth.users(id);