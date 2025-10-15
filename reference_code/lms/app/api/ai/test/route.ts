import { generatePracticeQuestions } from "@/lib/ai-service";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    console.log("Testing question generation...");
    const questions = await generatePracticeQuestions("science", "Matter in Our Surroundings", 10);
    
    console.log("Generated questions:", questions);
    console.log("Number of questions:", questions.length);
    
    return NextResponse.json({ 
      success: true, 
      questions,
      count: questions.length
    });
  } catch (error) {
    console.error("Test Error:", error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}