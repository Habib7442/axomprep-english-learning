-- Create session_history table
CREATE TABLE IF NOT EXISTS session_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  companion_id UUID REFERENCES companions(id) ON DELETE CASCADE,
  topic TEXT,
  messages JSONB,
  duration INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_session_history_user_id ON session_history(user_id);
CREATE INDEX IF NOT EXISTS idx_session_history_created_at ON session_history(created_at);

-- Enable RLS (Row Level Security)
ALTER TABLE session_history ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own session history" 
  ON session_history 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own session history" 
  ON session_history 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own session history" 
  ON session_history 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Grant permissions
GRANT ALL ON session_history TO authenticated;