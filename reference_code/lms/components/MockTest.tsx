"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { saveChapterScore, updateStudentProgress, saveMockTestQuestions } from "@/lib/actions/chapter.actions";
import { DetailedReportCard } from "@/components/DetailedReportCard";

interface Question {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

interface MockTestProps {
  chapterId: string;
  chapterName: string;
  subject: string;
  // Add subtopic parameter
  subtopic?: string;
  // Add callback for test completion
  onTestComplete?: () => void;
}

export const MockTest = ({ chapterId, chapterName, subject, subtopic, onTestComplete }: MockTestProps) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 minutes in seconds
  const [testResults, setTestResults] = useState<{
    score: number;
    correctCount: number;
    timeTaken: number;
  } | null>(null);
  const [isRetake, setIsRetake] = useState(false);
  const [lastTestDate, setLastTestDate] = useState<Date | null>(null);
  const [canRetake, setCanRetake] = useState(true); // Always allow retake
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Timer effect
  useEffect(() => {
    if (timeLeft <= 0 || showResults) return;

    const timerId = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timerId);
  }, [timeLeft, showResults]);

  // Remove the 24-hour cooldown check
  useEffect(() => {
    const checkRetakeEligibility = async () => {
      try {
        const response = await fetch(`/api/my-journey?chapterId=${chapterId}`);
        const data = await response.json();
        
        if (data.success && data.data.length > 0) {
          // Get the most recent test
          const recentTest = data.data[0];
          const testDate = new Date(recentTest.created_at);
          setLastTestDate(testDate);
          
          // Always allow retake (remove 24-hour restriction)
          setCanRetake(true);
        }
      } catch (err) {
        console.error("Error checking retake eligibility:", err);
      }
    };

    checkRetakeEligibility();
  }, [chapterId]);

  // Generate questions when component mounts
  useEffect(() => {
    const generateQuestions = async () => {
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
            chapter: chapterName,
            count: 10,
            // Add a timestamp to ensure different questions each time
            timestamp: new Date().getTime(),
            // No subtopic parameter for mock tests - this generates questions for the entire chapter
          }),
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || "Failed to generate mock test questions");
        }
        
        setQuestions(data.result);
        setCurrentQuestionIndex(0);
        setSelectedAnswers({});
        setShowResults(false);
        setTestResults(null);
        setTimeLeft(15 * 60);
      } catch (err) {
        setError("Failed to generate mock test questions. Please try again.");
        console.error("Error generating questions:", err);
      } finally {
        setLoading(false);
      }
    };

    generateQuestions();
  }, [subject, chapterName]);

  const handleAnswerSelect = (questionIndex: number, answer: string) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionIndex]: answer
    }));
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
      
      // Save mock test questions to Supabase with user answers
      try {
        // Prepare questions with user answers for storage
        const questionsWithUserAnswers = questions.map((q, index) => ({
          ...q,
          userAnswer: selectedAnswers[index] || undefined
        }));
        
        await saveMockTestQuestions({
          chapter_id: chapterId,
          chapter_name: chapterName,
          subject,
          class: "9",
          questions: questionsWithUserAnswers,
          test_score: score,
          time_taken: timeTaken,
          total_questions: questions.length,
          correct_answers: correctCount,
          is_retake: isRetake, // Add retake flag
          subtopic: subtopic || undefined // Pass subtopic information
        });
      } catch (error) {
        console.error("Error saving mock test questions:", error);
      }
      
      // Save score to Supabase
      try {
        await saveChapterScore({
          chapter_id: chapterId,
          chapter_name: chapterName,
          score,
          time_taken: timeTaken,
          total_questions: questions.length,
          correct_answers: correctCount,
          subject,
          class: "9"
        });
      } catch (error) {
        console.error("Error saving score:", error);
      }
      
      // Set test results for detailed report
      setTestResults({
        score,
        correctCount,
        timeTaken
      });
      
      setShowResults(true);
      
      // Call the callback if provided
      if (onTestComplete) {
        onTestComplete();
      }
    } catch (error) {
      console.error("Error submitting test:", error);
      // Reset submitting state if there's an error
      setIsSubmitting(false);
    }
  };

  const handleRetake = async () => {
    // Reset state for retake
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setShowResults(false);
    setTestResults(null);
    setTimeLeft(15 * 60);
    setIsRetake(true);
    
    // Generate new questions
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
          chapter: chapterName,
          count: 10,
          // Add a timestamp to ensure different questions each time
          timestamp: new Date().getTime(),
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to generate mock test questions");
      }
      
      setQuestions(data.result);
    } catch (err) {
      setError("Failed to generate mock test questions. Please try again.");
      console.error("Error generating questions:", err);
    } finally {
      setLoading(false);
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
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Generating mock test questions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="bg-red-50 text-red-700 p-4 rounded mb-4">
            {error}
          </div>
          <Button 
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">No Questions Available</h2>
          <p className="text-gray-600 mb-6">Unable to generate questions for this mock test.</p>
          <Button 
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (showResults && testResults) {
    return (
      <DetailedReportCard
        subject={subject}
        chapter={chapterName}
        score={testResults.score}
        totalQuestions={questions.length}
        correctAnswers={testResults.correctCount}
        timeTaken={testResults.timeTaken}
        questions={questions}
        userAnswers={selectedAnswers}
        isRetake={isRetake}
        onRetake={handleRetake} // Always allow retake
      />
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg">
        {/* Test Header */}
        <div className="p-6 border-b">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">{chapterName} - Mock Test</h2>
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
              className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
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
    </div>
  );
};