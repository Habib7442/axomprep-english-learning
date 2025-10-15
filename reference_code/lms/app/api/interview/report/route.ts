import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { transcript, interviewType, topic, jobDescription } = await request.json();
    
    // Initialize Google GenAI with the API key from environment variables
    const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY || "" });
    
    // Create the prompt for analysis
    const prompt = `Analyze the following interview transcript and provide a detailed report with the following information:
    
    Interview Type: ${interviewType}
    ${interviewType === "resume-based" ? `Job Description: ${jobDescription}` : `Topic: ${topic}`}
    
    Transcript:
    ${transcript}
    
    Please provide the analysis in the following JSON format:
    {
      "strengths": ["List of strengths demonstrated in the interview"],
      "weaknesses": ["List of weaknesses or areas that need improvement"],
      "improvements": ["Specific suggestions for improvement"],
      "score": 75,
      "feedback": "Overall feedback about the interview performance",
      "recommendations": ["List of recommendations for future interviews"]
    }
    
    Make sure the score is between 0-100. The feedback should be detailed and personalized based on the transcript. All lists should have 3-5 items each.`;
    
    // Generate content using Google GenAI
    const genResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [prompt],
    });
    
    // Parse the response
    const analysisText = genResponse.text;
    
    // Check if we have a response
    if (!analysisText) {
      throw new Error('No response from AI model');
    }
    
    // Try to extract JSON from the response text
    let analysis;
    try {
      // Extract JSON from the response text
      const jsonStart = analysisText.indexOf('{');
      const jsonEnd = analysisText.lastIndexOf('}') + 1;
      const jsonString = analysisText.substring(jsonStart, jsonEnd);
      analysis = JSON.parse(jsonString);
      
      // Validate that the analysis has the required properties
      if (!analysis.strengths || !analysis.weaknesses || !analysis.improvements || 
          analysis.score === undefined || !analysis.feedback || !analysis.recommendations) {
        throw new Error('Analysis missing required properties');
      }
      
      // Validate that score is between 0-100
      if (typeof analysis.score !== 'number' || analysis.score < 0 || analysis.score > 100) {
        throw new Error('Score must be a number between 0-100');
      }
      
      return NextResponse.json({ analysis });
    } catch (parseError) {
      console.error('Error parsing JSON from AI response:', parseError);
      // Return an error response so the frontend knows to use mock data
      return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 });
    }
    
  } catch (error) {
    console.error("Error generating interview report:", error);
    return NextResponse.json({ error: "Failed to generate interview report" }, { status: 500 });
  }
}