"use server";

import { GoogleGenAI } from "@google/genai";
import { promises as fs } from "fs";
import { tmpdir } from "os";
import { join } from "path";

// Initialize Google GenAI with the API key from environment variables
const genAI = new GoogleGenAI({ apiKey: process.env.GOOGLE_GENAI_API_KEY || "" });

// Mock implementation for PDF text extraction
const extractTextFromPDF = async (filePath: string): Promise<string> => {
  // In a real implementation, you would use a PDF parsing library
  // For now, we'll return mock text
  return "This is mock text extracted from a PDF resume. In a real implementation, this would be the actual text content of the resume.";
};

export const analyzeResume = async (fileBuffer: ArrayBuffer, jobDescription: string) => {
  try {
    // Save the file buffer to a temporary file
    const tempFilePath = join(tmpdir(), `resume-${Date.now()}.pdf`);
    await fs.writeFile(tempFilePath, Buffer.from(fileBuffer));

    // Extract text from PDF
    const resumeText = await extractTextFromPDF(tempFilePath);

    // Use Google GenAI to analyze the resume against the job description
    // Note: The exact API may vary depending on the version of @google/genai
    // This is a placeholder implementation that would need to be adjusted based on the actual API
    
    const mockResponse = `Based on the resume and job description for "${jobDescription}", here's my analysis:
    
Strengths:
- Strong technical skills matching the job requirements
- Relevant experience in the field
- Clear presentation of achievements

Areas for improvement:
- Could include more quantifiable achievements
- Consider reordering sections for better flow
- Add more specific technical skills mentioned in the job description

Overall, this is a solid resume that would be competitive for this position.`;

    // Clean up the temporary file
    await fs.unlink(tempFilePath);
    
    return mockResponse;
  } catch (error) {
    console.error("Error analyzing resume:", error);
    // Clean up the temporary file even if there's an error
    try {
      const tempFilePath = join(tmpdir(), `resume-${Date.now()}.pdf`);
      await fs.unlink(tempFilePath);
    } catch (unlinkError) {
      // Ignore unlink errors
    }
    throw new Error("Failed to analyze resume");
  }
};

export const getResumeSummary = async (fileBuffer: ArrayBuffer) => {
  try {
    // Save the file buffer to a temporary file
    const tempFilePath = join(tmpdir(), `resume-${Date.now()}.pdf`);
    await fs.writeFile(tempFilePath, Buffer.from(fileBuffer));

    // Extract text from PDF
    const resumeText = await extractTextFromPDF(tempFilePath);

    // Use Google GenAI to summarize the resume
    // Note: The exact API may vary depending on the version of @google/genai
    // This is a placeholder implementation that would need to be adjusted based on the actual API
    
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

    // Clean up the temporary file
    await fs.unlink(tempFilePath);
    
    return mockResponse;
  } catch (error) {
    console.error("Error summarizing resume:", error);
    // Clean up the temporary file even if there's an error
    try {
      const tempFilePath = join(tmpdir(), `resume-${Date.now()}.pdf`);
      await fs.unlink(tempFilePath);
    } catch (unlinkError) {
      // Ignore unlink errors
    }
    throw new Error("Failed to summarize resume");
  }
};