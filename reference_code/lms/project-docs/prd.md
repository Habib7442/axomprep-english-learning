# Product Requirements Document (PRD)
## EdTech Platform Pivot: High-Urgency Use Cases

---

## 1. Executive Summary

**Product Name:** PrepMate (suggested - you can change)

**Vision:** Become India's #1 AI-powered practice platform for high-urgency student needs - Interview Prep, English Speaking, and Exam Preparation.

**Target Launch:** Phase 1 in 4-6 weeks

**Primary Goal:** Achieve ₹50,000 MRR within 3 months with 200+ paid users

---

## 2. Problem Statement

### Current Market Pain Points:

**Interview Preparation:**
- Students get 3-7 days notice for placement interviews
- Mock interview services cost ₹500-2000 per session
- Limited availability (scheduling conflicts)
- Students need 10+ practice sessions but can't afford it
- Fear of judgment prevents practice with peers

**English Speaking:**
- 80% Indian students lack confidence in spoken English
- English classes cost ₹3,000-8,000/month
- Need daily practice but no conversation partner
- Shy to speak in group settings
- Can't afford 1-on-1 tutors (₹500-1000/hour)

**Exam Preparation:**
- Last-minute doubts at odd hours (10 PM - 2 AM)
- Coaching centers have fixed timings
- Parents can't help with advanced topics
- Online forums give delayed responses (2-24 hours)
- Students panic before exams

---

## 3. Solution Overview

### Three-Module Platform:

**Module 1: AI Interview Coach**
- Voice-based mock interviews (technical + HR)
- Real-time feedback and scoring
- Industry-specific question banks
- Performance analytics

**Module 2: English Speaking Practice**
- Daily conversation practice with AI
- Grammar and pronunciation correction
- Scenario-based learning
- Progress tracking and streaks

**Module 3: Instant Doubt Solver**
- 24/7 voice-based doubt resolution
- Step-by-step explanations
- Visual solutions for maths/science
- Call or web-based access

---

## 4. Target Audience

### Primary Segments:

**Segment 1: College Students (Interview Prep)**
- Age: 20-24 years
- Engineering/MBA final year students
- Location: Tier 1 & 2 cities
- Pain: Placement interviews in 1-2 weeks
- Willingness to pay: High (₹299-999)
- **Market size:** 15 lakh engineering graduates/year

**Segment 2: School/College Students (English Speaking)**
- Age: 14-22 years
- Class 9-12 + College students
- Location: Tier 2 & 3 cities
- Pain: Poor English communication skills
- Willingness to pay: Medium (₹199-499)
- **Market size:** 5 crore+ students

**Segment 3: Exam Students (Doubt Solving)**
- Age: 14-18 years
- Class 9-12 (CBSE/ICSE/State boards)
- Location: All tiers
- Pain: Stuck while studying, especially at night
- Willingness to pay: Medium (₹199-399)
- **Market size:** 3 crore+ board exam students

### Initial Focus (MVP):
**Start with Segment 1 (Interview Prep)** - Highest urgency + willingness to pay

---

## 5. Product Features & Requirements

### 5.1 MODULE 1: AI INTERVIEW COACH

#### Core Features (MVP):

**Feature 1.1: Interview Session**
- Student selects interview type: Technical/HR/Mixed
- Student selects domain: Software Engineering/Data Science/Consulting/Finance
- AI conducts 15-30 min voice interview
- Questions adapt based on student's resume/field
- Natural conversation flow with follow-up questions

**Technical Requirements:**
- Vapi integration for voice
- Question bank: 500+ questions per domain
- LLM prompt engineering for natural follow-ups
- Audio recording and transcription
- Response time: <2 seconds

**Feature 1.2: Real-time Feedback**
- Speech analysis: pace, filler words, clarity
- Content quality: relevance, structure, depth
- Confidence scoring (1-10 scale)
- Body language tips (if video enabled - Phase 2)

**Technical Requirements:**
- Speech-to-text analysis
- LLM-based answer evaluation
- Sentiment analysis for confidence detection
- Generate feedback within 5 seconds of answer completion

**Feature 1.3: Post-Interview Report**
- Overall performance score (0-100)
- Question-wise breakdown
- Strengths and weaknesses
- Specific improvement suggestions
- Recommended areas to practice

**Technical Requirements:**
- PDF generation
- Email delivery
- Dashboard with historical reports
- Comparison with previous attempts

**Feature 1.4: Question Banks by Domain**

**Software Engineering:**
- DSA questions (50+)
- System design basics (30+)
- Programming languages (40+)
- Projects discussion (20+)
- HR questions (50+)

**Data Science:**
- Statistics/ML concepts (50+)
- Case studies (20+)
- Python/R questions (30+)
- Projects discussion (20+)

**MBA/Consulting:**
- Case interviews (30+)
- Behavioral questions (50+)
- Market sizing (20+)
- Leadership scenarios (30+)

**Feature 1.5: Practice Mode vs Exam Mode**
- Practice: Hints available, can pause
- Exam: Timed, no hints, full simulation

#### Nice-to-Have (Phase 2):
- Video interview simulation
- Industry-specific scenarios (FAANG, startups, consulting)
- Peer comparison benchmarking
- Mock group discussions
- Resume review and suggestions

---

### 5.2 MODULE 2: ENGLISH SPEAKING PRACTICE

#### Core Features (MVP):

**Feature 2.1: Daily Conversation Practice**
- 10-minute daily conversation with AI
- Topics: Current events, hobbies, technology, travel, etc.
- Difficulty levels: Beginner (A1) to Advanced (C2)
- AI adapts to student's level

**Technical Requirements:**
- Vapi voice integration
- Topic randomization (50+ topics)
- Difficulty assessment algorithm
- Conversation state management

**Feature 2.2: Grammar & Pronunciation Correction**
- Real-time corrections during conversation
- AI points out: Wrong tenses, article errors, pronunciation issues
- Suggests better alternatives
- Doesn't interrupt flow (notes corrections for later)

**Technical Requirements:**
- Grammar checking API integration
- Pronunciation analysis (phoneme-level)
- Real-time error detection
- Post-conversation correction summary

**Feature 2.3: Scenario-Based Learning**
- Job interview scenarios
- Restaurant ordering
- Airport/hotel conversations
- Presentations
- Casual conversations

**Technical Requirements:**
- Pre-defined scenario scripts
- Role-playing AI personalities
- Context-aware responses

**Feature 2.4: Vocabulary Building**
- AI introduces 5-10 new words per session
- Uses them in conversation naturally
- Post-session vocabulary list with examples
- Spaced repetition for review

**Feature 2.5: Gamification**
- Daily streak counter
- XP points for completing sessions
- Levels: Bronze → Silver → Gold → Platinum
- Leaderboard (optional)
- Certificates on completing levels

**Technical Requirements:**
- User progress tracking
- Points and badge system
- Email reminders for streak maintenance

**Feature 2.6: Progress Analytics**
- Fluency score over time (graph)
- Grammar accuracy improvement
- Vocabulary growth
- Speaking speed (words per minute)
- Confidence level tracking

#### Nice-to-Have (Phase 2):
- Topic selection by user
- Debate mode (AI takes opposing view)
- Storytelling practice
- Accent training (British/American)
- Group conversation simulation

---

### 5.3 MODULE 3: INSTANT DOUBT SOLVER

#### Core Features (MVP):

**Feature 3.1: Multi-channel Doubt Input**
- Web platform: Type or voice
- Phone call: Dedicated number
- WhatsApp bot (Phase 1.5)

**Technical Requirements:**
- Vapi for voice calls
- Twilio for phone number
- Web voice interface
- WhatsApp Business API (later)

**Feature 3.2: Voice + Visual Solution**
- Student asks doubt via voice
- AI explains concept via voice
- Simultaneously displays:
  - Step-by-step written solution
  - Mathematical notation (LaTeX)
  - Diagrams (for science/geometry)
  - Formula explanations

**Technical Requirements:**
- LLM generates solution
- LaTeX rendering (MathJax)
- SVG/image generation for diagrams
- Sync between voice and visual display

**Feature 3.3: Subject Coverage**
- Mathematics: Class 8-12 (Algebra, Geometry, Calculus, Statistics)
- Physics: Mechanics, Optics, Electricity, Modern Physics
- Chemistry: Physical, Organic, Inorganic
- Biology: Basic coverage (Phase 2)

**Feature 3.4: Solution Delivery**
- Real-time voice explanation (3-5 min)
- Written solution on screen
- Option to save/download solution
- Share via WhatsApp/Email

**Feature 3.5: Follow-up Questions**
- Student can ask "why?" during explanation
- AI maintains context of conversation
- Can ask for simpler explanation
- Can request more examples

**Technical Requirements:**
- Conversation memory (10-15 min session)
- Context-aware responses
- Multi-turn dialogue management

**Feature 3.6: Doubt History**
- All previous doubts saved
- Searchable by topic/chapter
- Can re-listen to explanations
- Organized by subject

#### Nice-to-Have (Phase 2):
- Image upload (take photo of problem)
- Handwriting recognition
- Similar problems for practice
- Video explanations for complex topics
- Doubt resolution in regional languages

---

## 6. User Flow Diagrams

### 6.1 Interview Prep Flow

```
Student Login
    ↓
Select Module: "Interview Prep"
    ↓
Choose Interview Type: Technical/HR/Mixed
    ↓
Select Domain: Software/Data Science/MBA/etc.
    ↓
Choose Mode: Practice/Exam
    ↓
[Start Interview] → Voice conversation begins
    ↓
AI asks questions (15-30 min)
    ↓
Student answers via voice
    ↓
Real-time feedback on each answer
    ↓
Interview ends
    ↓
Generate Performance Report
    ↓
Show Report + Download PDF
    ↓
[Practice Again] or [End Session]
```

### 6.2 English Speaking Flow

```
Student Login
    ↓
Daily Challenge Prompt: "Practice your daily conversation!"
    ↓
Select Topic (or Random)
    ↓
Select Difficulty: Beginner/Intermediate/Advanced
    ↓
[Start Conversation] → AI initiates chat
    ↓
10-minute natural conversation
    ↓
AI corrects errors (non-intrusively)
    ↓
Conversation ends
    ↓
Show Correction Summary
    ↓
Display new vocabulary learned
    ↓
Update streak + XP points
    ↓
[View Progress] or [Practice Again]
```

### 6.3 Doubt Solver Flow

```
Student has a doubt
    ↓
Choose input method: Web Voice/Phone Call/Chat
    ↓
Student explains doubt via voice
    ↓
AI confirms understanding: "You want to know about..."
    ↓
AI explains concept (voice + visual)
    ↓
Written solution appears on screen
    ↓
Student can ask follow-ups
    ↓
AI answers follow-ups
    ↓
[Solution Clear?] 
    → Yes: Save solution → End
    → No: AI re-explains differently
```

---

## 7. Technical Architecture

### 7.1 Tech Stack

**Frontend:**
- React.js (existing platform)
- Tailwind CSS
- Vapi SDK for voice integration
- MathJax for LaTeX rendering
- Recharts for analytics
- Lucide React for icons

**Backend:**
- Node.js + Express (or your existing stack)
- Database: PostgreSQL (user data, history)
- Redis: Session management
- AWS S3: Audio recordings, PDFs

**AI/ML:**
- OpenAI GPT-4 (or Claude) for conversational AI
- Vapi for voice interface
- Whisper API for speech-to-text
- ElevenLabs/Google TTS for text-to-speech (backup)

**Integrations:**
- Vapi.ai (primary voice)
- Twilio (phone numbers)
- Razorpay (payments)
- SendGrid (emails)
- WhatsApp Business API (Phase 2)

### 7.2 System Architecture

```
User (Web/Phone)
    ↓
Frontend (React) / Phone Call
    ↓
API Gateway (Express.js)
    ↓
┌────────────┬──────────────┬─────────────┐
│  Auth      │  Interview   │  Speaking   │
│  Service   │  Service     │  Service    │
└────────────┴──────────────┴─────────────┘
    ↓              ↓              ↓
┌────────────┬──────────────┬─────────────┐
│  Vapi API  │  LLM API     │  Database   │
│            │  (GPT-4)     │  (Postgres) │
└────────────┴──────────────┴─────────────┘
```

### 7.3 Database Schema (Key Tables)

**Users Table:**
```sql
users {
  id: UUID
  email: VARCHAR
  phone: VARCHAR
  name: VARCHAR
  subscription_tier: ENUM (free/basic/premium)
  subscription_end_date: TIMESTAMP
  created_at: TIMESTAMP
}
```

**Interview_Sessions Table:**
```sql
interview_sessions {
  id: UUID
  user_id: UUID (FK)
  interview_type: VARCHAR
  domain: VARCHAR
  duration: INTEGER
  score: INTEGER
  questions_asked: JSONB
  transcript: TEXT
  feedback: JSONB
  created_at: TIMESTAMP
}
```

**Speaking_Sessions Table:**
```sql
speaking_sessions {
  id: UUID
  user_id: UUID (FK)
  topic: VARCHAR
  duration: INTEGER
  fluency_score: INTEGER
  grammar_errors: JSONB
  vocabulary_learned: JSONB
  transcript: TEXT
  created_at: TIMESTAMP
}
```

**Doubt_History Table:**
```sql
doubt_history {
  id: UUID
  user_id: UUID (FK)
  subject: VARCHAR
  chapter: VARCHAR
  question: TEXT
  solution: TEXT
  transcript: TEXT
  audio_url: VARCHAR
  created_at: TIMESTAMP
}
```

**User_Progress Table:**
```sql
user_progress {
  id: UUID
  user_id: UUID (FK)
  module: VARCHAR (interview/speaking/doubt)
  streak_days: INTEGER
  total_sessions: INTEGER
  xp_points: INTEGER
  level: VARCHAR
  last_activity: TIMESTAMP
}
```

---

## 8. Pricing Strategy

### 8.1 Pricing Tiers

**FREE TIER:**
- 3 interview practice sessions (lifetime)
- 5 English speaking sessions (lifetime)
- 10 doubts per month
- No detailed analytics
- Basic features only

**BASIC TIER - ₹199/month:**
- Interview Prep: 10 sessions/month
- English Speaking: Daily practice (unlimited)
- Doubt Solver: 50 doubts/month
- Performance reports
- Basic analytics

**PREMIUM TIER - ₹399/month:**
- Interview Prep: Unlimited sessions
- English Speaking: Unlimited + advanced scenarios
- Doubt Solver: Unlimited doubts
- Detailed analytics and insights
- Priority support
- Downloadable certificates
- Phone call access for doubts

**PRO TIER - ₹699/month (Phase 2):**
- Everything in Premium
- 1-on-1 mentor session (monthly)
- Resume review
- Career guidance
- Group discussion practice
- Video interview simulation

### 8.2 One-time Packages (Alternative)

**Interview Crash Course - ₹499:**
- 30 days access
- Unlimited interview practice
- Performance reports
- Valid for placement season

**English Fluency - ₹999 (3 months):**
- 90 days unlimited practice
- Certificate on completion
- Progress tracking

### 8.3 Student Discounts

- College ID verification: 20% off
- Referral program: ₹50 credit per referral
- Early bird (first 100 users): 50% off for 3 months

---

## 9. Go-to-Market Strategy

### 9.1 Phase 1 Launch (Weeks 1-4): Interview Prep Only

**Target:** Engineering college students (final year)

**Marketing Channels:**

1. **LinkedIn:**
   - Post content: "5 common mistakes in technical interviews"
   - Run ads targeting: Engineering students, final year, India
   - Budget: ₹10,000

2. **College Groups:**
   - WhatsApp/Telegram placement groups
   - Reddit: r/developersIndia, r/Indian_Academia
   - Discord: Tech/placement communities

3. **Partnerships:**
   - Reach out to 20 college placement cells
   - Offer free access to entire college for 1 month
   - Convert to paid after trial

4. **Influencer Marketing:**
   - Find YouTubers who make placement content (10k-100k subscribers)
   - Offer affiliate commission: ₹50 per signup

**Messaging:**
- "Got interview next week? Practice with AI - unlimited mock interviews at ₹199/month"
- "Don't go to interview unprepared. Practice with our AI coach - available 24/7"

**Success Metric:** 500 free signups, 50 paid conversions (10% conversion)

---

### 9.2 Phase 2 Launch (Weeks 5-8): English Speaking

**Target:** Class 11-12 + College students (broader)

**Marketing Channels:**

1. **Instagram/YouTube Shorts:**
   - Create engaging content: "Day 1 of speaking English daily"
   - Show before/after progress
   - Budget: ₹15,000

2. **School Partnerships:**
   - Reach out to 50 CBSE schools
   - Offer as "English lab" supplement

3. **Parent Groups:**
   - Facebook groups for parents
   - Position as "English confidence builder"

4. **Content Marketing:**
   - Blog posts: "How to improve spoken English in 30 days"
   - SEO optimization
   - YouTube videos: Tips + platform demo

**Messaging:**
- "Speak English confidently in 30 days - just 10 minutes daily practice"
- "No more fear of speaking English - practice with AI, no judgment"

**Success Metric:** 1000 free signups, 100 paid conversions (10% conversion)

---

### 9.3 Phase 3 Launch (Weeks 9-12): Doubt Solver

**Target:** Class 9-12 board exam students

**Marketing Channels:**

1. **WhatsApp Marketing:**
   - Parent groups
   - Student groups
   - Share: "Stuck on maths problem at 11 PM? Just call us"

2. **Coaching Center Partnerships:**
   - Offer as supplementary tool
   - Revenue sharing model

3. **Google/Facebook Ads:**
   - Target: "Maths doubts", "physics help", "board exam preparation"
   - Budget: ₹20,000

**Messaging:**
- "Stuck while studying? Get instant doubts solved via call - 24/7"
- "Your personal tutor on phone - available anytime"

**Success Metric:** 500 paid users across all modules

---

## 10. Success Metrics & KPIs

### 10.1 User Acquisition Metrics

- **Free signups:** 2000 in 3 months
- **Free to paid conversion:** 10-15%
- **Paid users:** 200-300 in 3 months
- **CAC (Customer Acquisition Cost):** <₹500
- **LTV (Lifetime Value):** >₹2000 (avg 6-month retention)

### 10.2 Engagement Metrics

**Interview Prep:**
- Average sessions per user: 5+/month
- Session completion rate: >80%
- User satisfaction score: >4/5

**English Speaking:**
- Daily active users (DAU): 40% of paid users
- Streak maintenance: >7 days for 50% users
- Session completion rate: >70%

**Doubt Solver:**
- Average doubts per user: 15/month
- Response satisfaction: >4/5
- Repeat usage: >80%

### 10.3 Revenue Metrics

- **MRR (Monthly Recurring Revenue):** ₹50,000 by Month 3
- **Churn rate:** <15% monthly
- **ARPU (Average Revenue Per User):** ₹250-300

### 10.4 Product Metrics

- **Voice AI response time:** <2 seconds
- **System uptime:** >99%
- **Error rate:** <2%
- **User support tickets:** <5% of users

---

## 11. Development Roadmap

### Phase 1: MVP (Weeks 1-4)

**Week 1-2: Interview Prep Module**
- [ ] Vapi integration for voice interviews
- [ ] Question bank setup (100 questions)
- [ ] Basic interview flow
- [ ] Simple feedback generation
- [ ] User authentication

**Week 3-4: Core Platform**
- [ ] Dashboard with module selection
- [ ] Payment integration (Razorpay)
- [ ] Basic analytics
- [ ] Email notifications
- [ ] Landing page + marketing site

**Deliverable:** Launch Interview Prep module

---

### Phase 2: English Speaking (Weeks 5-8)

**Week 5-6: Speaking Module**
- [ ] Daily conversation flow
- [ ] Topic bank (50 topics)
- [ ] Grammar correction system
- [ ] Vocabulary tracking

**Week 7-8: Gamification**
- [ ] Streak system
- [ ] XP and levels
- [ ] Progress analytics
- [ ] Certificates

**Deliverable:** Launch English Speaking module

---

### Phase 3: Doubt Solver (Weeks 9-12)

**Week 9-10: Doubt Solving**
- [ ] Multi-channel input (web, phone)
- [ ] Visual solution generation
- [ ] LaTeX rendering
- [ ] Diagram generation

**Week 11-12: Polish**
- [ ] Doubt history and search
- [ ] Subject-wise organization
- [ ] WhatsApp integration (basic)
- [ ] Performance optimization

**Deliverable:** Launch Doubt Solver module

---

### Phase 4: Growth & Optimization (Month 4+)

- Advanced analytics dashboard
- Video interview simulation
- Regional language support
- Mobile app (React Native)
- Enterprise features (college/school plans)
- AI improvements based on user feedback

---

## 12. Risk Analysis & Mitigation

### 12.1 Technical Risks

**Risk:** Vapi API downtime/issues
- **Mitigation:** Implement fallback to alternative TTS/STT providers
- **Mitigation:** Cache common responses

**Risk:** LLM costs become too high
- **Mitigation:** Optimize prompts for token efficiency
- **Mitigation:** Implement usage caps per user
- **Mitigation:** Consider fine-tuned smaller models

**Risk:** Poor voice quality/latency
- **Mitigation:** Regular testing and monitoring
- **Mitigation:** Provide text-based backup option

### 12.2 Market Risks

**Risk:** Low user adoption
- **Mitigation:** Extensive beta testing before launch
- **Mitigation:** Pivot messaging based on feedback
- **Mitigation:** Offer generous free tier

**Risk:** Users don't convert to paid
- **Mitigation:** Clear value demonstration in free tier
- **Mitigation:** Limited free tier to create urgency
- **Mitigation:** Social proof (testimonials, case studies)

**Risk:** Competition from established players
- **Mitigation:** Focus on niche (voice-based practice)
- **Mitigation:** Superior user experience
- **Mitigation:** Faster iteration based on feedback

### 12.3 Operational Risks

**Risk:** Customer support overload
- **Mitigation:** Comprehensive FAQ and help docs
- **Mitigation:** AI-powered chatbot for common queries
- **Mitigation:** Community forum for peer support

**Risk:** Payment failures/refund requests
- **Mitigation:** Clear refund policy
- **Mitigation:** Multiple payment options
- **Mitigation:** Grace period for failed payments

---

## 13. Success Criteria

### Minimum Viable Success (3 months):
- ✅ 200 paid users
- ✅ ₹50,000 MRR
- ✅ <20% monthly churn
- ✅ 4+ star average rating
- ✅ Positive unit economics (LTV > 3x CAC)

### Optimal Success (3 months):
- 🎯 500 paid users
- 🎯 ₹1,00,000 MRR
- 🎯 <15% monthly churn
- 🎯 4.5+ star average rating
- 🎯 Organic growth starting (referrals)

### When to Pivot:
- If <50 paid users after 3 months
- If churn >30% monthly
- If CAC > LTV
- If user engagement <20% DAU

---

## 14. Next Steps (Action Items)

### Immediate (This Week):
1. ✅ Review and finalize this PRD
2. [ ] Set up project management (Notion/Trello)
3. [ ] Finalize tech stack decisions
4. [ ] Create wireframes for key screens
5. [ ] Set up development environment

### Week 1:
1. [ ] Start Vapi integration for interview module
2. [ ] Design database schema
3. [ ] Create question bank (first 100 questions)
4. [ ] Set up authentication
5. [ ] Begin landing page development

### Week 2:
1. [ ] Complete basic interview flow
2. [ ] Implement feedback generation
3. [ ] Test with 5-10 beta users
4. [ ] Iterate based on feedback
5. [ ] Prepare marketing materials

### Week 3-4:
1. [ ] Payment integration
2. [ ] Dashboard and analytics
3. [ ] Beta launch to 50 users
4. [ ] Collect feedback and testimonials
5. [ ] Prepare for public launch

---

## 15. Appendix

### A. Sample Interview Questions by Domain

**Software Engineering - Technical:**
1. Explain the difference between REST and GraphQL
2. What is the time complexity of binary search?
3. How do you handle race conditions in concurrent programming?
4. Explain the SOLID principles
5. What's the difference between SQL and NoSQL databases?
... (50+ more)

**Software Engineering - HR:**
1. Tell me about yourself
2. Why do you want to work here?
3. Describe a challenging project you worked on
4. How do you handle tight deadlines?
5. Where do you see yourself in 5 years?
... (50+ more)

### B. English Speaking Topics

**Beginner Level:**
1. My daily routine
2. My favorite hobby
3. My family
4. My school/college
5. My favorite food

**Intermediate Level:**
1. The importance of education
2. Social media impact
3. Environmental issues
4. Technology in our lives
5. Career aspirations

**Advanced Level:**
1. Ethical implications of AI
2. Globalization and its effects
3. Leadership qualities
4. Innovation in business
5. Philosophical discussions

### C. Doubt Solver Subject Coverage

**Mathematics:**
- Algebra: Equations, inequalities, polynomials
- Geometry: Triangles, circles, coordinate geometry
- Trigonometry: Ratios, identities, equations
- Calculus: Limits, derivatives, integration
- Statistics: Mean, median, probability

**Physics:**
- Mechanics: Motion, forces, energy
- Optics: Reflection, refraction, lenses
- Electricity: Current, circuits, magnetism
- Modern Physics: Atoms, nuclei

**Chemistry:**
- Physical: Mole concept, thermodynamics
- Organic: Hydrocarbons, functional groups
- Inorganic: Periodic table, chemical bonding

---

## Document Version Control

- **Version 1.0** - October 11, 2025 - Initial PRD
- Created by: Claude (AI Assistant)
- For: EdTech Platform Pivot
- Status: Draft - Pending Review

---

**Questions? Feedback? Next Steps?**
Contact: [Your email/contact]