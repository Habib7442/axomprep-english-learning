"use client";

import React, { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";

interface ReportCardData {
  overallAnalysis: string;
  strengths: string[];
  areasForImprovement: string[];
  recommendations: string[];
  nextSteps: string[];
}

interface Question {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

interface QuestionAnalysis {
  questionNumber: number;
  question: string;
  userAnswer?: string; // Make userAnswer optional
  correctAnswer: string;
  isCorrect: boolean;
  explanation: string;
  options: string[]; // Add options
}

interface DetailedReportCardProps {
  subject: string;
  chapter: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeTaken: number;
  questionDetails?: QuestionAnalysis[];
  questions?: Question[]; // Add questions prop for displaying all questions
  userAnswers?: Record<number, string>; // Add user answers
  isRetake?: boolean; // Add retake flag
  onRetake?: () => void; // Add retake handler
}

export const DetailedReportCard = ({
  subject,
  chapter,
  score,
  totalQuestions,
  correctAnswers,
  timeTaken,
  questionDetails,
  questions, // Destructure questions
  userAnswers = {}, // Destructure user answers
  isRetake = false, // Default to false
  onRetake // Destructure retake handler
}: DetailedReportCardProps) => {
  const [reportData, setReportData] = useState<ReportCardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        const response = await fetch("/api/ai", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "generateReport",
            subject,
            chapter,
            score,
            totalQuestions,
            correctAnswers,
            timeTaken
          }),
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          // If there's an error, use default data instead of showing an error
          console.error("Failed to generate detailed report:", data.error);
          setReportData({
            overallAnalysis: "Your performance was satisfactory. Keep practicing to improve further.",
            strengths: ["Concept understanding", "Time management"],
            areasForImprovement: ["Accuracy", "Speed"],
            recommendations: ["Review incorrect answers", "Practice more questions"],
            nextSteps: ["Focus on weak areas", "Take another test"]
          });
        } else {
          setReportData(data.result);
        }
      } catch (err) {
        // If there's a network error, use default data
        console.error("Network error when generating report:", err);
        setReportData({
          overallAnalysis: "Your performance was satisfactory. Keep practicing to improve further.",
          strengths: ["Concept understanding", "Time management"],
          areasForImprovement: ["Accuracy", "Speed"],
          recommendations: ["Review incorrect answers", "Practice more questions"],
          nextSteps: ["Focus on weak areas", "Take another test"]
        });
      } finally {
        setLoading(false);
      }
    };

    fetchReportData();
  }, [subject, chapter, score, totalQuestions, correctAnswers, timeTaken]);

  const getPerformanceColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getPerformanceBg = (score: number) => {
    if (score >= 80) return "bg-green-100";
    if (score >= 60) return "bg-yellow-100";
    return "bg-red-100";
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Generating detailed performance report...</p>
        </div>
      </div>
    );
  }

  if (error) {
    // We no longer show error messages since we handle them gracefully
    // Just continue with default data
    console.error("Error generating report (handled gracefully):", error);
  }

  // If we have questions but no questionDetails, create questionDetails from questions
  const processedQuestionDetails = questionDetails || (questions ? questions.map((q, index) => {
    // Convert userAnswers to the expected format if it's from the database
    let userAnswer = "Not answered";
    let isCorrect = false;
    
    if (userAnswers) {
      // If userAnswers is a Record<string, string> (from database)
      if (typeof userAnswers === 'object' && userAnswers !== null && !Array.isArray(userAnswers)) {
        const stringIndex = index.toString();
        userAnswer = (userAnswers as Record<string, string>)[stringIndex] || "Not answered";
      } 
      // If userAnswers is a Record<number, string> (from client)
      else if (typeof userAnswers === 'object' && userAnswers !== null) {
        userAnswer = (userAnswers as Record<number, string>)[index] || "Not answered";
      }
      
      // Determine if the answer is correct
      if (userAnswer !== "Not answered") {
        // Convert the user answer (full text) to the corresponding letter (A, B, C, D)
        const answerIndex = q.options.indexOf(userAnswer);
        if (answerIndex !== -1) {
          const answerLetter = String.fromCharCode(65 + answerIndex); // Convert 0,1,2,3 to A,B,C,D
          isCorrect = answerLetter === q.correctAnswer;
        }
      }
    }
    
    return {
      questionNumber: index + 1,
      question: q.question,
      userAnswer: userAnswer,
      correctAnswer: q.correctAnswer,
      isCorrect: isCorrect,
      explanation: q.explanation,
      options: q.options
    };
  }) : []);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg">
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Detailed Performance Report</h2>
              <p className="text-gray-600">Chapter: {chapter}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Subject: {subject}</p>
              <p className="text-sm text-gray-600">Date: {new Date().toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="p-6 border-b">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <p className="text-2xl font-bold text-blue-600">{correctAnswers}/{totalQuestions}</p>
              <p className="text-gray-600">Correct Answers</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <p className="text-2xl font-bold text-green-600">{totalQuestions - correctAnswers}</p>
              <p className="text-gray-600">Incorrect</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg text-center">
              <p className="text-2xl font-bold text-purple-600">{formatTime(timeTaken)}</p>
              <p className="text-gray-600">Time Taken</p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg text-center">
              <p className="text-2xl font-bold text-yellow-600">{score}%</p>
              <p className="text-gray-600">Overall Score</p>
            </div>
          </div>
        </div>

        {/* Performance Visualization */}
        <div className="p-6 border-b">
          <h3 className="text-lg font-medium mb-4">Performance Overview</h3>
          <div className="flex items-center justify-center">
            <div className="relative w-48 h-48">
              <svg viewBox="0 0 36 36" className="w-full h-full">
                <path
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#eee"
                  strokeWidth="3"
                />
                <path
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke={score >= 80 ? "#4CAF50" : score >= 60 ? "#FFC107" : "#F44336"}
                  strokeWidth="3"
                  strokeDasharray={`${score}, 100`}
                />
                <text x="18" y="18" textAnchor="middle" fill="#333" fontSize="6" fontWeight="bold">
                  {score}%
                </text>
                <text x="18" y="22" textAnchor="middle" fill="#666" fontSize="3">
                  Performance
                </text>
              </svg>
            </div>
          </div>
        </div>

        {/* Overall Analysis */}
        <div className="p-6 border-b">
          <h3 className="text-lg font-medium mb-4">Overall Performance Analysis</h3>
          <div className={`p-4 rounded-lg ${getPerformanceBg(score)}`}>
            <p className={getPerformanceColor(score)}>
              {reportData?.overallAnalysis || 
                (score >= 80 
                  ? "Your performance was excellent. Keep up the great work!" 
                  : score >= 60 
                  ? "Your performance was satisfactory. Keep practicing to improve further." 
                  : "Your performance needs improvement. Review the concepts and practice more.")
              }
            </p>
          </div>
        </div>

        {/* Strengths */}
        <div className="p-6 border-b">
          <h3 className="text-lg font-medium mb-4">Your Strengths</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {(reportData?.strengths || ["Concept understanding", "Time management"]).map((strength, index) => (
              <div key={index} className="flex items-start p-3 bg-green-50 rounded-lg">
                <span className="text-green-600 mr-2">✓</span>
                <span>{strength}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Areas for Improvement */}
        <div className="p-6 border-b">
          <h3 className="text-lg font-medium mb-4">Areas for Improvement</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {(reportData?.areasForImprovement || ["Accuracy", "Speed"]).map((area, index) => (
              <div key={index} className="flex items-start p-3 bg-yellow-50 rounded-lg">
                <span className="text-yellow-600 mr-2">!</span>
                <span>{area}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Question-by-Question Analysis */}
        {processedQuestionDetails.length > 0 && (
          <div className="p-6 border-b">
            <h3 className="text-lg font-medium mb-4">Question-by-Question Analysis</h3>
            <div className="space-y-4">
              {processedQuestionDetails.map((question, index) => (
                <div 
                  key={index} 
                  className={`p-4 rounded-lg border ${
                    question.isCorrect ? "border-green-500 bg-green-50" : "border-red-500 bg-red-50"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium">Question {question.questionNumber}</h4>
                    <span className={`px-2 py-1 rounded text-sm ${
                      question.isCorrect ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                    }`}>
                      {question.isCorrect ? "Correct" : "Incorrect"}
                    </span>
                  </div>
                  <p className="mt-2 text-gray-700">{question.question}</p>
                  
                  <div className="mt-3">
                    <p className="text-sm font-medium text-gray-600">Options:</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-1">
                      {question.options.map((option: string, optionIndex: number) => {
                        const optionLetter = String.fromCharCode(65 + optionIndex);
                        const isSelected = question.userAnswer === option;
                        const isCorrect = question.correctAnswer === optionLetter;
                        
                        return (
                          <div 
                            key={optionIndex} 
                            className={`p-2 rounded ${
                              isSelected && isCorrect ? "bg-green-100 border border-green-300" :
                              isSelected && !isCorrect ? "bg-red-100 border border-red-300" :
                              isCorrect ? "bg-green-50 border border-green-200" :
                              "bg-gray-50"
                            }`}
                          >
                            <span className={`font-medium ${
                              isSelected && isCorrect ? "text-green-800" :
                              isSelected && !isCorrect ? "text-red-800" :
                              isCorrect ? "text-green-700" :
                              ""
                            }`}>
                              {optionLetter}. {option}
                            </span>
                            {isSelected && (
                              <span className="ml-2 text-xs px-1 py-0.5 bg-blue-100 text-blue-800 rounded">
                                Your Answer
                              </span>
                            )}
                            {isCorrect && (
                              <span className="ml-2 text-xs px-1 py-0.5 bg-green-100 text-green-800 rounded">
                                Correct
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  
                  <div className="mt-3">
                    <p className="text-sm font-medium text-gray-600">Explanation:</p>
                    <div className="text-gray-700 mt-1">
                      <ReactMarkdown 
                        remarkPlugins={[remarkGfm, remarkBreaks]}
                        components={{
                          h1: (props) => <h1 className="text-lg font-bold mt-2 mb-1" {...props} />,
                          h2: (props) => <h2 className="text-md font-bold mt-2 mb-1" {...props} />,
                          h3: (props) => <h3 className="font-bold mt-1 mb-1" {...props} />,
                          p: (props) => <p className="mb-2" {...props} />,
                          ul: (props) => <ul className="list-disc pl-5 mb-2" {...props} />,
                          ol: (props) => <ol className="list-decimal pl-5 mb-2" {...props} />,
                          li: (props) => <li className="mb-1" {...props} />,
                          strong: (props) => <strong className="font-bold" {...props} />,
                          em: (props) => <em className="italic" {...props} />,
                        }}
                      >
                        {question.explanation}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="p-6 border-t flex flex-wrap justify-center gap-4">
          {onRetake && (
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center" onClick={onRetake}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 110 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              </svg>
              {isRetake ? "Retake Test (Again)" : "Retake Test"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};