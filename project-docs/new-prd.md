# Product Requirements Document
## integratepdf.com — Voice-Powered PDF Study Platform

**Version:** 1.0  
**Date:** April 2026  
**Author:** Habib / Locallify  
**Status:** Draft

---

## 1. Executive Summary

**integratepdf.com** is a voice-first AI study platform that lets students upload any PDF and have a real, two-way spoken conversation with its content. Unlike existing tools (AskYourPDF, Speechify, StudyPDF) that are text-chat or one-way audio, integratepdf.com is the first product to offer **real-time voice conversation with a PDF document**, powered by Vapi's in-browser WebRTC voice agent.

**Primary market:** Students (UPSC, NEET, JEE, board exams) preparing for competitive exams.  
**Secondary market:** Global English-speaking students and professionals.

---

## 2. Problem Statement

Students have millions of PDFs — textbooks, notes, research papers — but no effective way to study them actively. Existing solutions are passive:

- **PDF readers** → you read at it
- **Text-to-speech tools** → it reads at you
- **AI chat tools (AskYourPDF, ChatPDF)** → text only, no voice

**The core problem:** Students learn better through conversation, but no tool lets them *talk* to their study material in real-time voice to master complex subjects.

---

## 3. Goals & Success Metrics

### Goals
- Launch a working MVP within 4–6 weeks
- Acquire first 500 users organically via short-form content (Reels, Shorts)
- Achieve 10% free-to-paid conversion within 3 months

### Success Metrics

| Metric | MVP Target (Month 1) | Growth Target (Month 3) |
|--------|---------------------|------------------------|
| Registered Users | 500 | 5,000 |
| PDFs Uploaded | 1,000 | 15,000 |
| Voice Sessions / Day | 50 | 500 |
| Free → Paid Conversion | — | 10% |
| Avg Session Duration | 5 min | 8 min |

---

## 4. Target Users

### Primary Persona — "Raj" (Indian Competitive Exam Student)
- Age: 18–25, studying for UPSC / NEET / JEE
- Location: Tier 2–3 city (Silchar, Patna, Indore)
- Pain: Dense PDFs, no one to explain concepts, English barrier
- Need: Explain this PDF to me. Quiz me. Help me revise fast.

### Secondary Persona — "Priya" (College Student, Urban)
- Age: 20–26, engineering / MBA / law student
- Location: Metro city, comfortable in English
- Pain: Too many research papers, not enough time
- Need: Rapid comprehension, voice quizzes while commuting

### Tertiary Persona — "Professional" (Working Adult)
- Age: 27–40, reading reports, whitepapers, legal docs
- Need: Summarize and explain without reading 40 pages

---

## 5. Core Features

### 5.1 MVP Features (Phase 1)

#### F1 — PDF Upload & Processing
- Store processed content for voice session context
- **Scanned PDF Support**: Auto-detect image-only PDFs and trigger Tesseract.js OCR fallback (max 20 pages for Free tier)

#### F2 — In-Browser Voice Agent (Vapi WebRTC)
- Single "Talk" button — no app download required
- Mic activates in browser via WebRTC (no phone number needed)
- Real-time voice response latency < 2 seconds
- Agent has full PDF content as context
- Session auto-ends at 5 minutes (free tier)

#### F3 — Language Toggle (Removed)
- Default to English voice mode
- Agent responds entirely in English

#### F4 — Study Modes

**Tutor Mode (Default)**
- Student asks questions freely
- Agent explains concepts from the PDF
- Agent asks follow-up questions to check understanding

**Exam Panic Mode**
- Student sets a timer (30 min / 1 hr / 2 hr)
- Agent fires rapid questions from the PDF
- Aggressive, timed pacing — no fluff
- Shows score at the end

**Debate Mode (Unique USP) — PRO ONLY**
- Agent takes the opposite position of what the PDF argues
- Student must defend the content
- Forces deep active recall
- Most shareable / viral mode (Locked behind Pro to drive conversion)

#### F5 — Session Summary
- After each session, auto-generate a text summary
- Show: topics covered, questions asked, weak areas
- Downloadable as PDF

#### F6 — Basic Auth & Dashboard
- Email + password signup
- Google OAuth
- Dashboard showing uploaded PDFs and session history
- Free tier limits displayed clearly

---

### 5.2 Phase 2 Features (Post-MVP)

#### F7 — Multi-PDF Mode
- Upload up to 5 PDFs, ask questions across all of them
- Useful for students comparing multiple chapters or books

#### F8 — Shareable Clips
- Export 30-second audio clips of interesting debate moments
- One-click share to WhatsApp, Instagram
- Viral growth driver

#### F9 — Teacher / Coaching Institute Dashboard
- Teacher uploads PDFs for a batch
- Students join a shared "room" and study the same material
- Teacher sees analytics (which students studied, for how long)

#### F10 — Multi-Device Support
- Seamless transition between desktop and mobile browser
- Shared session history across devices

#### F11 — Browser Extension
- Highlight any text on any webpage → right-click → "Add to integratepdf"
- Builds a personal knowledge PDF on the fly

---

## 6. User Flows

### 6.1 Core Flow — New User

```
Land on homepage
    ↓
See demo video / hero CTA "Talk to Your PDF Free"
    ↓
Sign up (Google or Email)
    ↓
Upload PDF (drag & drop or click)
    ↓
Select Mode (Tutor / Panic / Debate - Tier Appropriate)
    ↓
Click "Start Talking" button
    ↓
Vapi WebRTC voice session begins
    ↓
Session ends (time limit or user stops)
    ↓
View session summary
    ↓
Prompt to upgrade or share
```

### 6.2 Returning User Flow

```
Login → Dashboard
    ↓
Select existing PDF or upload new
    ↓
Choose mode → Start session
```

---

## 7. Technical Architecture

### 7.1 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router) + Tailwind CSS |
| Backend | Node.js / Express or Next.js API routes |
| Database | Supabase (Postgres + Auth + Storage) |
| PDF Processing | pdf-parse (Text) + Tesseract.js (OCR Fallback) |
| Voice Agent | Vapi (WebRTC in-browser, no phone number) |
| AI Model | Claude via Anthropic API (PDF context + conversation) |
| Hosting | Vercel (frontend) + Railway or Supabase Edge Functions |
| File Storage | Supabase Storage or AWS S3 |

### 7.2 Vapi Integration

- Use **Vapi Web SDK** (browser-based, zero phone costs)
- PDF content is chunked and passed as system prompt context to Vapi
- Vapi handles: STT (speech-to-text) → LLM → TTS (text-to-speech)
- Voice personas configured for optimal clarity
- Session metadata (duration, transcript) saved post-call via Vapi webhook

### 7.3 PDF Processing Pipeline

```
User uploads PDF
    ↓
Attempt text extraction (pdfjs-dist)
    ↓
If text density low → Trigger Tesseract.js OCR
    ↓
Text chunked into segments (max 4000 tokens each)
    ↓
Stored in Supabase with embedding metadata
    ↓
On session start → relevant chunks sent to Vapi as context
    ↓
Claude uses context to answer voice questions
```

### 7.4 Cost Structure (Per User Estimate)

| Service | Free User Cost | Paid User Cost |
|---------|---------------|----------------|
| Vapi (5 min/day) | ~$0.03/day | ~$0.15/day (25 min) |
| Claude API | ~$0.005/session | ~$0.02/session |
| OCR (Client-side) | $0.00 (CPU) | $0.00 (CPU) |
| **Total / month** | **~$1.00/user** | **~$4.50/user** |

**Note on OCR:** We use client-side Tesseract.js to eliminate server costs. Processing is compute-intensive on the user's device. Limits: 20 pages (Free), 50 pages (Student), 100 pages (Pro).

---

## 8. Monetization

### Pricing Tiers

| Plan | Price | Limits |
|------|-------|--------|
| **Free** | ₹0 | 3 PDFs, 5 min/day (Tutor Mode only) |
| **Student** | ₹199/month ($2.50) | 20 PDFs, 30 min/day (Tutor & Panic Modes) |
| **Pro** | ₹499/month ($6) | Unlimited PDFs, 2 hrs/day, All Modes (inc. Debate) |
| **Institute** | ₹4,999/month | Batch upload, student analytics, 50 seats |

### Revenue Projections (Month 3)

- 5,000 users × 10% paid = 500 paid users
- 400 Student × ₹199 + 100 Pro × ₹499 = ₹79,600 + ₹49,900 = **~₹1.3 lakh/month**

---

## 9. Go-To-Market Strategy

### Phase 1 — Organic Viral (Month 1–2)

- Record short videos of Debate Mode: "I uploaded my UPSC notes and the AI ARGUED with me"
- Post on Instagram Reels, YouTube Shorts, Twitter
- Target hashtags: #UPSC2025 #NEETprep #AIStudy #StudyWithAI
- Reach out to 10 UPSC / NEET study influencers for free access

### Phase 2 — Community Seeding (Month 2–3)

- Post in Reddit communities: r/UPSC, r/indianstudents, r/GetStudying
- Telegram groups for competitive exam students
- Product Hunt launch (English audience)

### Phase 3 — Partnership (Month 3+)

- Partner with coaching institutes in Silchar / Guwahati (via Locallify network)
- Offer Institute Plan free for 1 month to 3 coaching centers
- Get testimonials + word-of-mouth from real student batches

---

## 10. Competitive Positioning

| Feature | integratepdf.com | AskYourPDF | Speechify | StudyPDF |
|---------|-----------------|------------|-----------|----------|
| Real-time voice conversation | ✅ | ❌ | ❌ | ❌ |
| Voice-based active recall | ✅ | ❌ | ❌ | ❌ |
| Debate / Argue mode | ✅ | ❌ | ❌ | ❌ |
| Exam Panic mode | ✅ | ❌ | ❌ | Partial |
| In-browser (no app) | ✅ | ✅ | ❌ | ✅ |
| India pricing | ✅ | ❌ | ❌ | ❌ |

**Core positioning statement:**  
*"The only platform where you don't read your PDF — you talk to it."*

---

## 11. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| Vapi costs exceed revenue | Medium | High | Hard cap free tier at 5 min/day, monitor burn daily |
| PDF parsing fails on complex docs | High | Medium | Show clear error + fallback text extraction |
| Low voice response quality | Medium | High | Test multiple Vapi voice models before launch |
| Users don't understand the product | Medium | High | Add 30-second demo video on homepage |
| Competitor copies idea fast | Low | Medium | Move fast, build community moat |

---

## 12. Launch Milestones

| Milestone | Target Date |
|-----------|------------|
| Tech stack finalized | Week 1 |
| PDF upload + text extraction working | Week 2 |
| Vapi WebRTC integrated in browser | Week 3 |
| All 3 study modes working | Week 4 |
| Auth + dashboard complete | Week 4 |
| Beta with 20 test users | Week 5 |
| Public launch | Week 6 |
| First paid user | Week 7 |
| Product Hunt launch | Week 8 |

---

## 13. Open Questions

1. Which Vapi voice sounds most natural for students?
2. Do we build our own PDF viewer UI or keep it minimal?

---

*Document maintained by Habib — integratepdf.com / Locallify*  
*Last updated: April 2026*