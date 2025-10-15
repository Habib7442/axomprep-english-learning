"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { saveChapterScore, saveMockTestQuestions } from "@/lib/actions/chapter.actions";
import { DetailedReportCard } from "@/components/DetailedReportCard";

interface Question {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

interface PracticeQuestionsProps {
  subject: string;
  chapter: string;
  userId: string;
  subtopic?: string; // Add subtopic parameter
}

export const PracticeQuestions = ({ subject, chapter, userId, subtopic }: PracticeQuestionsProps) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 minutes
  const [testResults, setTestResults] = useState<{
    score: number;
    correctCount: number;
    timeTaken: number;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false); // Add submitting state

  // Add timer effect
  useEffect(() => {
    if (questions.length > 0 && !showResults) {
      const timer = setInterval(() => {
        setTimeLeft(prevTime => {
          if (prevTime <= 1) {
            clearInterval(timer);
            handleSubmit(); // Auto-submit when time runs out
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [questions, showResults]);

  const handleGenerateQuestions = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "generateQuestions",
          subject,
          chapter,
          subtopic, // Pass subtopic if provided
          count: 10,
          // Add a timestamp to ensure different questions each time
          timestamp: new Date().getTime(),
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to generate practice questions");
      }
      
      // Check if we received valid questions
      if (!data.result || !Array.isArray(data.result) || data.result.length === 0) {
        throw new Error("Failed to generate valid questions. Please try again.");
      }
      
      const generatedQuestions = data.result;
      setQuestions(generatedQuestions);
      setCurrentQuestionIndex(0);
      setSelectedAnswers({});
      setShowResults(false);
      setTestResults(null);
      setTimeLeft(15 * 60);
    } catch (err) {
      setError("Failed to generate practice questions. Please try again.");
      console.error("Error generating questions:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (questionIndex: number, answer: string) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [questionIndex]: answer
    });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true); // Set submitting state to true
    
    try {
      // Calculate score
      let correctCount = 0;
      questions.forEach((question, index) => {
        // Convert the selected answer (full text) to the corresponding letter (A, B, C, D)
        const selectedAnswerText = selectedAnswers[index];
        if (selectedAnswerText) {
          const answerIndex = question.options.indexOf(selectedAnswerText);
          if (answerIndex !== -1) {
            const answerLetter = String.fromCharCode(65 + answerIndex); // Convert 0,1,2,3 to A,B,C,D
            if (answerLetter === question.correctAnswer) {
              correctCount++;
            }
          }
        }
      });
      
      const score = Math.round((correctCount / questions.length) * 100);
      const timeTaken = 15 * 60 - timeLeft;
      
      // Save practice questions to Supabase (for subtopic practice) with user answers
      try {
        // Prepare questions with user answers for storage
        const questionsWithUserAnswers = questions.map((q, index) => ({
          ...q,
          userAnswer: selectedAnswers[index] || undefined
        }));
        
        await saveMockTestQuestions({
          chapter_id: chapter,
          chapter_name: chapter,
          subject,
          class: "9",
          questions: questionsWithUserAnswers,
          test_score: score,
          time_taken: timeTaken,
          total_questions: questions.length,
          correct_answers: correctCount,
          // Add subtopic information
          subtopic: subtopic || undefined
        });
      } catch (error) {
        console.error("Error saving practice questions:", error);
      }
      
      // Save score to database
      try {
        await saveChapterScore({
          chapter_id: chapter,
          chapter_name: chapter,
          score,
          time_taken: timeTaken,
          total_questions: questions.length,
          correct_answers: correctCount,
          subject,
          class: "9" // Assuming Class 9 for now
        });
      } catch (err) {
        console.error("Error saving score:", err);
      }
      
      // Set test results for detailed report
      setTestResults({
        score,
        correctCount,
        timeTaken
      });
      
      setShowResults(true);
    } catch (error) {
      console.error("Error submitting test:", error);
      // Reset submitting state if there's an error
      setIsSubmitting(false);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p>Generating practice questions...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="bg-red-50 text-red-700 p-4 rounded mb-4">
          {error}
        </div>
        <Button 
          onClick={handleGenerateQuestions}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Try Again
        </Button>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center">
        <h3 className="text-xl font-bold mb-4">Practice Questions</h3>
        <p className="text-gray-600 mb-6">Generate practice questions to test your understanding of this topic.</p>
        <Button 
          onClick={handleGenerateQuestions}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Generate Questions
        </Button>
      </div>
    );
  }

  if (showResults && testResults) {
    return (
      <DetailedReportCard
        subject={subject}
        chapter={chapter}
        score={testResults.score}
        totalQuestions={questions.length}
        correctAnswers={testResults.correctCount}
        timeTaken={testResults.timeTaken}
        questions={questions}
        userAnswers={selectedAnswers}
      />
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  
  return (
    <div className="bg-white rounded-lg shadow">
      {/* Test Header */}
      <div className="p-6 border-b">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Practice Questions</h2>
          <div className="bg-red-100 text-red-800 px-3 py-1 rounded-full font-medium">
            {formatTime(timeLeft)}
          </div>
        </div>
        <div className="flex justify-between text-sm text-gray-600">
          <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
          <span>Total Marks: {questions.length}</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="px-6 py-3 bg-gray-50">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full" 
            style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Question */}
      <div className="p-6">
        <h3 className="text-xl font-medium mb-6">
          {currentQuestion.question}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {currentQuestion.options.map((option, index) => (
            <button
              key={index}
              className={`p-4 text-left rounded-lg border-2 transition-colors ${
                selectedAnswers[currentQuestionIndex] === option
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
              onClick={() => handleAnswerSelect(currentQuestionIndex, option)}
            >
              <span className="font-medium mr-2">
                {String.fromCharCode(65 + index)}.
              </span>
              {option}
            </button>
          ))}
        </div>

        <div className="flex justify-between">
          <Button
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            variant="outline"
          >
            Previous
          </Button>
          
          {currentQuestionIndex === questions.length - 1 ? (
            <Button
              onClick={handleSubmit}
              disabled={!selectedAnswers[currentQuestionIndex] || isSubmitting}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? "Submitting..." : "Submit Test"}
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              disabled={!selectedAnswers[currentQuestionIndex]}
            >
              Next
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};