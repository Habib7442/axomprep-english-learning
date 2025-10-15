import { generateChapterExplanation, generatePracticeQuestions, generateFlashcards, generateReportCard } from "@/lib/ai-service";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { action, ...params } = await request.json();
    
    switch (action) {
      case "generateExplanation":
        const explanation = await generateChapterExplanation(
          params.subject,
          params.chapter,
          params.subtopic
        );
        return NextResponse.json({ result: explanation });
        
      case "generateQuestions":
        const questions = await generatePracticeQuestions(
          params.subject,
          params.chapter,
          params.count,
          params.subtopic // Pass subtopic if provided
        );
        
        // Log the questions for debugging
        console.log("Generated questions:", questions);
        console.log("Number of questions:", questions.length);
        
        // Validate that we have questions
        if (!questions || !Array.isArray(questions) || questions.length === 0) {
          return NextResponse.json({ 
            error: "Failed to generate valid questions" 
          }, { status: 500 });
        }
        
        return NextResponse.json({ result: questions });
        
      case "generateFlashcards":
        const flashcards = await generateFlashcards(
          params.subject,
          params.chapter,
          params.count
        );
        return NextResponse.json({ result: flashcards });
        
      case "generateReport":
        try {
          const report = await generateReportCard(
            params.subject,
            params.chapter,
            params.score,
            params.totalQuestions,
            params.correctAnswers,
            params.timeTaken
          );
          return NextResponse.json({ result: report });
        } catch (reportError) {
          console.error("Error generating report:", reportError);
          // Return default report data instead of failing
          const defaultReport = {
            overallAnalysis: "Your performance was satisfactory. Keep practicing to improve further.",
            strengths: ["Concept understanding", "Time management"],
            areasForImprovement: ["Accuracy", "Speed"],
            recommendations: ["Review incorrect answers", "Practice more questions"],
            nextSteps: ["Focus on weak areas", "Take another test"]
          };
          return NextResponse.json({ result: defaultReport });
        }
        
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("AI API Error:", error);
    // Return a more user-friendly error message
    return NextResponse.json({ error: "AI service temporarily unavailable. Please try again later." }, { status: 500 });
  }
}