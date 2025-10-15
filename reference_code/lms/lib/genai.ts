import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Google GenAI with the API key from environment variables
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || "");

export const analyzeResume = async (resumeText: string, jobDescription: string) => {
  try {
    // For now, we'll return a mock response
    // In a real implementation, you would use the Google GenAI API here
    const mockResponse = `Based on the resume and job description, here's my analysis:
    
Strengths:
- Strong technical skills matching the job requirements
- Relevant experience in the field
- Clear presentation of achievements

Areas for improvement:
- Could include more quantifiable achievements
- Consider reordering sections for better flow
- Add more specific technical skills mentioned in the job description

Overall, this is a solid resume that would be competitive for this position.`;
    
    return mockResponse;
  } catch (error) {
    console.error("Error analyzing resume:", error);
    throw new Error("Failed to analyze resume");
  }
};

export const getResumeSummary = async (resumeText: string) => {
  try {
    // For now, we'll return a mock response
    // In a real implementation, you would use the Google GenAI API here
    const mockResponse = `This is a summary of the candidate's resume:
    
Work Experience:
- 5 years as a Software Engineer at Tech Corp
- 2 years as a Senior Developer at Startup Inc

Skills:
- JavaScript, React, Node.js
- Python, SQL
- Project management

Education:
- B.S. in Computer Science from University of Tech
- Various online certifications`;
    
    return mockResponse;
  } catch (error) {
    console.error("Error summarizing resume:", error);
    throw new Error("Failed to summarize resume");
  }
};