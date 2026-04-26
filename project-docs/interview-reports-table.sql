-- Create interview_reports table
CREATE TABLE IF NOT EXISTS interview_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  session_id UUID REFERENCES session_history(id) ON DELETE CASCADE,
  interview_type TEXT NOT NULL,
  topic TEXT,
  job_description TEXT,
  transcript JSONB,
  strengths TEXT[],
  weaknesses TEXT[],
  improvements TEXT[],
  score INTEGER,
  feedback TEXT,
  recommendations TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_interview_reports_user_id ON interview_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_interview_reports_created_at ON interview_reports(created_at);
CREATE INDEX IF NOT EXISTS idx_interview_reports_score ON interview_reports(score);

-- Enable RLS (Row Level Security)
ALTER TABLE interview_reports ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own interview reports" 
  ON interview_reports 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own interview reports" 
  ON interview_reports 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own interview reports" 
  ON interview_reports 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Grant permissions
GRANT ALL ON interview_reports TO authenticated;