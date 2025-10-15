"use client";

import React from "react";

interface WeakTopic {
  id: string;
  name: string;
  score: number;
  improvement: number;
}

interface ReportCardProps {
  studentName: string;
  chapterName: string;
  overallScore: number;
  timeTaken: string;
  totalQuestions: number;
  correctAnswers: number;
  weakTopics: WeakTopic[];
}

export const ReportCard = ({
  studentName,
  chapterName,
  overallScore,
  timeTaken,
  totalQuestions,
  correctAnswers,
  weakTopics
}: ReportCardProps) => {
  const percentage = Math.round((correctAnswers / totalQuestions) * 100);
  
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

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg">
        {/* Header */}
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold">Detailed Performance Report</h2>
          <p className="text-gray-600">Chapter: {chapterName}</p>
        </div>

        {/* Student Info */}
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xl font-medium">{studentName}</h3>
              <p className="text-gray-600">Test completed on {new Date().toLocaleDateString()}</p>
            </div>
            <div className={`px-4 py-2 rounded-full ${getPerformanceBg(overallScore)}`}>
              <span className={`text-lg font-bold ${getPerformanceColor(overallScore)}`}>
                {overallScore}%
              </span>
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="p-6 border-b">
          <h3 className="text-lg font-medium mb-4">Test Summary</h3>
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
              <p className="text-2xl font-bold text-purple-600">{timeTaken}</p>
              <p className="text-gray-600">Time Taken</p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg text-center">
              <p className="text-2xl font-bold text-yellow-600">{percentage}%</p>
              <p className="text-gray-600">Accuracy</p>
            </div>
          </div>
        </div>

        {/* Performance Analysis */}
        <div className="p-6 border-b">
          <h3 className="text-lg font-medium mb-4">Performance Analysis</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-gray-600">Overall Performance</span>
                <span className={getPerformanceColor(overallScore)}>{overallScore}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${
                    overallScore >= 80 ? "bg-green-500" : 
                    overallScore >= 60 ? "bg-yellow-500" : 
                    "bg-red-500"
                  }`}
                  style={{ width: `${overallScore}%` }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-gray-600">Speed</span>
                <span className="text-green-600">Good</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="h-2 rounded-full bg-green-500" style={{ width: "75%" }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-gray-600">Accuracy</span>
                <span className="text-yellow-600">Average</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="h-2 rounded-full bg-yellow-500" style={{ width: "65%" }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Weak Topics */}
        <div className="p-6 border-b">
          <h3 className="text-lg font-medium mb-4">Areas for Improvement</h3>
          <div className="space-y-3">
            {weakTopics.map((topic) => (
              <div key={topic.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div>
                  <h4 className="font-medium">{topic.name}</h4>
                  <p className="text-sm text-gray-600">Score: {topic.score}%</p>
                </div>
                <div className="flex items-center">
                  <span className="text-red-600 mr-2">↓ {topic.improvement}%</span>
                  <Button variant="outline" size="sm">
                    Practice
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recommendations */}
        <div className="p-6">
          <h3 className="text-lg font-medium mb-4">Recommendations</h3>
          <div className="space-y-3">
            <div className="flex items-start p-3 bg-blue-50 rounded-lg">
              <span className="text-blue-600 mr-2">📘</span>
              <div>
                <h4 className="font-medium">Review Concepts</h4>
                <p className="text-sm text-gray-600">Spend 30 minutes reviewing the concepts in weak areas</p>
              </div>
            </div>
            <div className="flex items-start p-3 bg-green-50 rounded-lg">
              <span className="text-green-600 mr-2">🎤</span>
              <div>
                <h4 className="font-medium">Voice Practice</h4>
                <p className="text-sm text-gray-600">Use voice tutor to practice explaining these concepts</p>
              </div>
            </div>
            <div className="flex items-start p-3 bg-purple-50 rounded-lg">
              <span className="text-purple-600 mr-2">📝</span>
              <div>
                <h4 className="font-medium">Additional Questions</h4>
                <p className="text-sm text-gray-600">Complete 10 additional practice questions on these topics</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-6 border-t flex justify-center gap-4">
          <Button variant="outline">
            Download PDF Report
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700">
            Retake Test
          </Button>
          <Button variant="outline">
            Practice Weak Topics
          </Button>
        </div>
      </div>
    </div>
  );
};

const Button = ({ 
  children, 
  variant = "default", 
  size = "default",
  className = "",
  ...props 
}: {
  children: React.ReactNode;
  variant?: "default" | "outline";
  size?: "default" | "sm";
  className?: string;
  [key: string]: unknown;
}) => {
  const baseClasses = "px-4 py-2 rounded-md font-medium transition-colors";
  
  const variantClasses = variant === "outline" 
    ? "border border-gray-300 text-gray-700 hover:bg-gray-50" 
    : "bg-blue-600 text-white hover:bg-blue-700";
  
  const sizeClasses = size === "sm" 
    ? "px-3 py-1 text-sm" 
    : "px-4 py-2";
  
  return (
    <button 
      className={`${baseClasses} ${variantClasses} ${sizeClasses} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};