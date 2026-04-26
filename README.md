This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Features

### Interview Practice
- VAPI-powered voice interviews with AI coach
- Topic-based interviews with premade topics
- Resume-based interviews with personalized questions
- Voice conversation with microphone controls
- Real-time interview transcript with improved visibility
- Detailed interview reports with feedback and scoring
- Lottie animation for sound waves visualization

### Resume Analysis
- Upload PDF resumes for analysis
- AI-powered resume evaluation against job descriptions
- Personalized improvement suggestions

### Interview Reports
- Comprehensive interview performance analysis using Google GenAI
- Strengths and weaknesses identification
- Score-based evaluation (0-100)
- Detailed feedback and recommendations
- Interview transcript storage and retrieval

### Pricing Plans
- Multiple subscription tiers with clear feature differentiation
- Beautiful pricing page with plan comparisons
- Upgrade prompts using shadcn alert dialogs
- Easy navigation to pricing from sidebar

## Database Schema

### Interview Reports
The application uses a Supabase database with the following key tables:

- `interview_reports`: Stores detailed interview analysis and feedback
- `session_history`: Tracks interview session data

### Table Structures

#### session_history
```sql
CREATE TABLE IF NOT EXISTS session_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  companion_id UUID,
  topic TEXT,
  messages JSONB,
  duration INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### interview_reports
```sql
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
```

## API Integration

### Google GenAI
The application uses Google GenAI (Gemini) for generating interview reports:
- Genuine AI-powered analysis instead of mock reports
- Structured JSON response parsing
- Error handling and fallback mechanisms

### VAPI
Voice API integration for real-time voice interviews:
- WebRTC-based voice communication
- Real-time transcription
- Microphone controls

## UI/UX Improvements

### Alert Dialogs
- Replaced browser alerts with beautiful shadcn alert dialogs
- Upgrade prompts with direct navigation to pricing page
- Consistent design language throughout the application

### Text Visibility
- Enhanced text contrast for better readability
- Improved dark mode support for all components
- Gradient text styling for headings

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.