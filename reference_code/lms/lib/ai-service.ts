import { GoogleGenAI } from "@google/genai";

// Initialize the Google GenAI client
const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GENAI_API_KEY,
});

// Function to generate chapter explanation
export const generateChapterExplanation = async (
  subject: string,
  chapter: string,
  subtopic?: string
) => {
  try {
    const prompt = subtopic
      ? `You are an expert teacher in ${subject} for CBSE Class 9 students. Explain the subtopic "${subtopic}" from the chapter "${chapter}" in a clear, comprehensive, and student-friendly manner.

      Your explanation should include:
      1. A simple definition of the concept
      2. Key points and important facts
      3. Real-life examples or applications
      4. Any relevant formulas, laws, or principles
      5. Common misconceptions and clarifications
      6. Tips for better understanding and retention

      Keep the explanation concise but thorough. Use simple language that a Class 9 student can easily understand.`
      : `You are an expert teacher in ${subject} for CBSE Class 9 students. Provide a comprehensive explanation of the chapter "${chapter}".

      Your explanation should include:
      1. An overview of what the chapter covers
      2. Key concepts and their definitions
      3. Important formulas, laws, or principles (if applicable)
      4. Real-life applications and examples
      5. Step-by-step explanations of complex topics
      6. Common mistakes students make and how to avoid them
      7. Tips for better understanding and exam preparation

      Structure the explanation clearly with headings and subheadings. Use simple language that a Class 9 student can easily understand while maintaining academic accuracy.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        thinkingConfig: {
          thinkingBudget: 0, // Disables thinking for faster response
        },
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response text received");
    }
    
    return text;
  } catch (error) {
    console.error("Error generating explanation:", error);
    throw new Error("Failed to generate explanation");
  }
};

// Function to generate practice questions
export const generatePracticeQuestions = async (
  subject: string,
  chapter: string,
  count: number = 10,
  subtopic?: string // Add subtopic parameter
) => {
  try {
    // Add a timestamp to make each request unique
    const timestamp = new Date().getTime();
    
    // Create different prompts based on whether a subtopic is provided
    const prompt = subtopic
      ? `Generate exactly ${count} multiple choice questions focused specifically on the subtopic "${subtopic}" from the chapter "${chapter}" in ${subject} for CBSE Class 9 students.

Requirements:
1. Each question must have:
   - A clear question statement specifically about "${subtopic}"
   - Four options (A, B, C, D)
   - The correct answer (A, B, C, or D)
   - A brief explanation

2. Questions should focus ONLY on "${subtopic}" and not other topics in the chapter
3. Mix of easy, medium, and difficult questions about this subtopic
4. Focus on testing understanding of "${subtopic}", not just memorization

Return ONLY a JSON array in this exact format:
[
  {
    "question": "Question text here",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": "A",
    "explanation": "Explanation text here"
  }
]

Do not include any other text, just the JSON array. Ensure all text is in English and properly formatted JSON.

Request ID: ${timestamp}`
      : `Generate exactly ${count} multiple choice questions for the chapter "${chapter}" in ${subject} for CBSE Class 9 students.

Requirements:
1. Each question must have:
   - A clear question statement
   - Four options (A, B, C, D)
   - The correct answer (A, B, C, or D)
   - A brief explanation

2. Questions should cover different topics within the chapter
3. Mix of easy, medium, and difficult questions
4. Focus on testing understanding, not just memorization

Return ONLY a JSON array in this exact format:
[
  {
    "question": "Question text here",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": "A",
    "explanation": "Explanation text here"
  }
]

Do not include any other text, just the JSON array. Ensure all text is in English and properly formatted JSON.

Request ID: ${timestamp}`;

    console.log("Sending prompt to AI:", prompt);
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        thinkingConfig: {
          thinkingBudget: 0,
        },
      },
    });

    // Log the raw response for debugging
    console.log("Raw AI Response:", response);
    
    // Try to parse the response as JSON
    try {
      const text = response.text;
      console.log("AI Response Text:", text);
      
      if (!text) {
        throw new Error("No response text received");
      }
      
      // Clean the text to remove any markdown formatting and fix common JSON issues
      let cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
      
      // Remove any non-English characters that might break JSON parsing
      cleanText = cleanText.replace(/[^\x20-\x7E\s\n\r\t\[\]\{\}",:]/g, '');
      
      // Fix common JSON formatting issues
      cleanText = cleanText.replace(/,\s*}/g, '}'); // Remove trailing commas before closing braces
      cleanText = cleanText.replace(/,\s*\]/g, ']'); // Remove trailing commas before closing brackets
      
      // If the text is wrapped in brackets, keep it as is
      // Otherwise, try to extract JSON array
      if (!cleanText.startsWith('[')) {
        // Try to find JSON array in the response
        const jsonStart = cleanText.indexOf('[');
        const jsonEnd = cleanText.lastIndexOf(']') + 1;
        if (jsonStart !== -1 && jsonEnd > jsonStart) {
          cleanText = cleanText.substring(jsonStart, jsonEnd);
        }
      }
      
      console.log("Cleaned AI Response Text:", cleanText);
      
      const questions = JSON.parse(cleanText);
      console.log("Parsed Questions:", questions);
      console.log("Number of questions:", questions.length);
      return questions;
    } catch (parseError) {
      // Log the parsing error for debugging
      console.error("Error parsing AI response:", parseError);
      console.error("Response text that failed to parse:", response.text);
      
      // If JSON parsing fails, return a structured response
      return [
        {
          question: "What is the main concept discussed in this chapter?",
          options: [
            "Option A",
            "Option B", 
            "Option C",
            "Option D"
          ],
          correctAnswer: "A",
          explanation: "This is a sample explanation for the question."
        }
      ];
    }
  } catch (error) {
    console.error("Error generating practice questions:", error);
    throw new Error("Failed to generate practice questions");
  }
};

// Function to generate flashcards
export const generateFlashcards = async (
  subject: string,
  chapter: string,
  count: number = 10
) => {
  try {
    // Add a timestamp to make each request unique
    const timestamp = new Date().getTime();
    
    const prompt = `You are an expert teacher in ${subject} for CBSE Class 9 students. Create exactly ${count} high-quality educational flashcards for the chapter "${chapter}".

    Each flashcard should help students review and memorize key concepts from the chapter. Create flashcards that cover:
    1. Important definitions and terms
    2. Key formulas or equations (if applicable)
    3. Important facts and concepts
    4. Examples and applications
    5. Differences between similar concepts

    Requirements:
    - Create exactly ${count} flashcards
    - Each flashcard must have a clear, specific front (term/concept) and detailed back (explanation)
    - Focus on the most important aspects of the chapter
    - Use clear, concise language appropriate for Class 9 students
    - Avoid generic or vague content

    Format the response as a JSON array with the following exact format:
    [
      {
        "front": "Specific term, concept, or question",
        "back": "Clear, detailed explanation or answer with examples if relevant"
      }
    ]

    Return ONLY the JSON array with exactly ${count} flashcards. Do not include any other text.

    Request ID: ${timestamp}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        thinkingConfig: {
          thinkingBudget: 0,
        },
      },
    });

    // Try to parse the response as JSON
    try {
      const text = response.text;
      if (!text) {
        throw new Error("No response text received");
      }
      
      // Clean the text to remove any markdown formatting
      let cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
      
      // If the text is wrapped in brackets, keep it as is
      // Otherwise, try to extract JSON array
      if (!cleanText.startsWith('[')) {
        // Try to find JSON array in the response
        const jsonStart = cleanText.indexOf('[');
        const jsonEnd = cleanText.lastIndexOf(']') + 1;
        if (jsonStart !== -1 && jsonEnd > jsonStart) {
          cleanText = cleanText.substring(jsonStart, jsonEnd);
        }
      }
      
      const flashcards = JSON.parse(cleanText);
      
      // Validate that we have the correct number of flashcards
      if (!Array.isArray(flashcards) || flashcards.length === 0) {
        throw new Error("Invalid flashcard format received");
      }
      
      // If we don't have enough flashcards, generate more
      if (flashcards.length < count) {
        console.warn(`Only received ${flashcards.length} flashcards, requested ${count}. Generating more...`);
        // Try to generate additional flashcards
        const additionalPrompt = `You are an expert teacher in ${subject} for CBSE Class 9 students. Generate ${count - flashcards.length} more flashcards for the chapter "${chapter}" to supplement the existing ones.

        Requirements:
        - Create exactly ${count - flashcards.length} additional flashcards
        - Each flashcard must have a clear, specific front (term/concept) and detailed back (explanation)
        - Focus on different aspects of the chapter than the previous flashcards
        - Use clear, concise language appropriate for Class 9 students

        Format the response as a JSON array with the following exact format:
        [
          {
            "front": "Specific term, concept, or question",
            "back": "Clear, detailed explanation or answer with examples if relevant"
          }
        ]

        Return ONLY the JSON array with exactly ${count - flashcards.length} flashcards. Do not include any other text.

        Request ID: ${timestamp}-additional`;
        
        const additionalResponse = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: additionalPrompt,
          config: {
            thinkingConfig: {
              thinkingBudget: 0,
            },
          },
        });
        
        const additionalText = additionalResponse.text;
        if (additionalText) {
          let cleanAdditionalText = additionalText.replace(/```json/g, '').replace(/```/g, '').trim();
          
          if (!cleanAdditionalText.startsWith('[')) {
            const jsonStart = cleanAdditionalText.indexOf('[');
            const jsonEnd = cleanAdditionalText.lastIndexOf(']') + 1;
            if (jsonStart !== -1 && jsonEnd > jsonStart) {
              cleanAdditionalText = cleanAdditionalText.substring(jsonStart, jsonEnd);
            }
          }
          
          const additionalFlashcards = JSON.parse(cleanAdditionalText);
          if (Array.isArray(additionalFlashcards)) {
            flashcards.push(...additionalFlashcards);
          }
        }
      }
      
      // Ensure we have unique flashcards (no duplicates)
      const uniqueFlashcards = flashcards.filter((card, index, self) => 
        index === self.findIndex(c => c.front === card.front)
      );
      
      // If we still don't have enough, pad with properly formatted placeholders
      while (uniqueFlashcards.length < count) {
        uniqueFlashcards.push({
          front: `Key Concept ${uniqueFlashcards.length + 1}`,
          back: `Important concept from ${chapter} in ${subject}. Review your textbook for detailed information.`
        });
      }
      
      // Return exactly the requested number of flashcards
      return uniqueFlashcards.slice(0, count);
    } catch (parseError) {
      // If JSON parsing fails, generate fallback flashcards with better quality
      console.error("Error parsing AI flashcard response:", parseError);
      console.error("Response text that failed to parse:", response.text);
      
      // Generate high-quality fallback flashcards
      const fallbackFlashcards = [];
      for (let i = 1; i <= count; i++) {
        fallbackFlashcards.push({
          front: `${chapter} - Key Concept ${i}`,
          back: `This is an important concept from the ${chapter} chapter in ${subject}. For detailed information, please review the chapter content and consult your textbook.`
        });
      }
      return fallbackFlashcards;
    }
  } catch (error) {
    console.error("Error generating flashcards:", error);
    throw new Error("Failed to generate flashcards");
  }
};

// Function to generate detailed report card
export const generateReportCard = async (
  subject: string,
  chapter: string,
  score: number,
  totalQuestions: number,
  correctAnswers: number,
  timeTaken: number
) => {
  try {
    const prompt = `You are an expert educational advisor for ${subject} in CBSE Class 9. Analyze the student's performance on the test for chapter "${chapter}" and generate a detailed, personalized report card.

    Student's Performance Data:
    - Chapter: ${chapter}
    - Subject: ${subject}
    - Score: ${score}%
    - Total Questions: ${totalQuestions}
    - Correct Answers: ${correctAnswers}
    - Time Taken: ${timeTaken} seconds

    Provide a comprehensive analysis including:
    1. Overall Performance Analysis: Evaluate the student's understanding level and proficiency
    2. Strengths Identified: Highlight specific areas where the student performed well
    3. Areas for Improvement: Identify weak areas and knowledge gaps
    4. Specific Recommendations: Provide actionable study tips and resources
    5. Suggested Next Steps: Recommend focused practice areas and learning strategies

    Format the response as JSON with the following structure:
    {
      "overallAnalysis": "Comprehensive performance evaluation",
      "strengths": ["Strength 1", "Strength 2"],
      "areasForImprovement": ["Area 1", "Area 2"],
      "recommendations": ["Recommendation 1", "Recommendation 2"],
      "nextSteps": ["Next step 1", "Next step 2"]
    }

    Make the analysis encouraging yet constructive. Focus on helping the student improve rather than just pointing out weaknesses.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        thinkingConfig: {
          thinkingBudget: 0,
        },
      },
    });

    // Try to parse the response as JSON
    try {
      const text = response.text;
      if (!text) {
        throw new Error("No response text received");
      }
      const report = JSON.parse(text);
      return report;
    } catch (parseError) {
      // If JSON parsing fails, return a structured response
      return {
        overallAnalysis: "Your performance was satisfactory. Keep practicing to improve further.",
        strengths: ["Concept understanding", "Time management"],
        areasForImprovement: ["Accuracy", "Speed"],
        recommendations: ["Review incorrect answers", "Practice more questions"],
        nextSteps: ["Focus on weak areas", "Take another test"]
      };
    }
  } catch (error) {
    console.error("Error generating report card:", error);
    // Return a default report instead of throwing an error
    return {
      overallAnalysis: "Your performance was satisfactory. Keep practicing to improve further.",
      strengths: ["Concept understanding", "Time management"],
      areasForImprovement: ["Accuracy", "Speed"],
      recommendations: ["Review incorrect answers", "Practice more questions"],
      nextSteps: ["Focus on weak areas", "Take another test"]
    };
  }
};

// Function to generate speech from text
export const generateSpeechFromText = async (
  text: string,
  language: string = "en-US"
) => {
  try {
    // For now, we'll return a placeholder
    // In a real implementation, we would use the Google Text-to-Speech API
    // or another speech generation service
    
    // This is a placeholder implementation
    console.log("Generating speech for text:", text);
    console.log("Language:", language);
    
    // Return a success message for now
    return {
      success: true,
      message: "Speech generation would be implemented here",
      language: language
    };
  } catch (error) {
    console.error("Error generating speech:", error);
    throw new Error("Failed to generate speech");
  }
};
