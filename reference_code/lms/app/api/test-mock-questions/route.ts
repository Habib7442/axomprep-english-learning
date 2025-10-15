import { saveMockTestQuestions, getUserMockTestQuestions } from "@/lib/actions/chapter.actions";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Retrieve saved data
    const retrievedData = await getUserMockTestQuestions("test-chapter-1");
    console.log("Retrieved mock test questions:", retrievedData);

    return NextResponse.json({ 
      success: true, 
      retrieved: retrievedData
    });
  } catch (error) {
    console.error("Test Error:", error);
    return NextResponse.json({ 
      success: false, 
      error: (error as Error).message 
    }, { status: 500 });
  }
}

export async function POST() {
  try {
    // Test data
    const testData = {
      chapter_id: "test-chapter-1",
      chapter_name: "Test Chapter",
      subject: "science",
      class: "9",
      questions: [
        {
          question: "What is the capital of France?",
          options: ["London", "Berlin", "Paris", "Madrid"],
          correctAnswer: "Paris",
          explanation: "Paris is the capital of France."
        },
        {
          question: "What is 2 + 2?",
          options: ["3", "4", "5", "6"],
          correctAnswer: "4",
          explanation: "2 + 2 = 4."
        }
      ],
      test_score: 100,
      time_taken: 120,
      total_questions: 2,
      correct_answers: 2
    };

    // Save test data
    const savedData = await saveMockTestQuestions(testData);
    console.log("Saved mock test questions:", savedData);

    // Retrieve saved data
    const retrievedData = await getUserMockTestQuestions("test-chapter-1");
    console.log("Retrieved mock test questions:", retrievedData);

    return NextResponse.json({ 
      success: true, 
      saved: savedData,
      retrieved: retrievedData
    });
  } catch (error) {
    console.error("Test Error:", error);
    return NextResponse.json({ 
      success: false, 
      error: (error as Error).message 
    }, { status: 500 });
  }
}