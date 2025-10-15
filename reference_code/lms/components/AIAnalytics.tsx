"use client";

import React, { useState, useEffect } from "react";
import { getUserChapterScores, getStudentProgress } from "@/lib/actions/chapter.actions";

interface WeakTopic {
  id: string;
  name: string;
  score: number;
  improvement: number;
}

interface PerformanceAnalysis {
  overallScore: number;
  topics: WeakTopic[];
  recommendations: string[];
}

interface ProgressData {
  chapter_id: string;
  chapter_name: string;
  mastery_percentage: number;
}

interface ScoreData {
  score: number;
}

interface AIAnalyticsProps {
  userId: string;
}

export const AIAnalytics = ({ userId }: AIAnalyticsProps) => {
  const [analysis, setAnalysis] = useState<PerformanceAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const analyzePerformance = async () => {
      try {
        // Get user's chapter scores
        const scores: ScoreData[] = await getUserChapterScores();
        
        // Get student progress data
        const progressData: ProgressData[] = await getStudentProgress();
        
        // Calculate overall performance
        const overallScore = scores.length > 0 
          ? Math.round(scores.reduce((sum, score) => sum + score.score, 0) / scores.length)
          : 0;
        
        // Identify weak topics (scores below 70%)
        const weakTopics: WeakTopic[] = [];
        progressData.forEach((progress) => {
          if (progress.mastery_percentage < 70) {
            weakTopics.push({
              id: progress.chapter_id,
              name: progress.chapter_name,
              score: progress.mastery_percentage,
              improvement: 70 - progress.mastery_percentage
            });
          }
        });
        
        // Generate recommendations
        const recommendations: string[] = [];
        if (overallScore < 70) {
          recommendations.push("Focus on improving your overall understanding of the subject matter");
        }
        
        if (weakTopics.length > 0) {
          recommendations.push(`You have ${weakTopics.length} topics that need improvement`);
          recommendations.push("Spend extra time practicing these weak areas");
        }
        
        if (scores.length > 0) {
          const recentScore = scores[0].score;
          if (recentScore > overallScore) {
            recommendations.push("Great job! Your recent performance is above your average");
          } else if (recentScore < overallScore) {
            recommendations.push("Keep practicing to improve your consistency");
          }
        }
        
        setAnalysis({
          overallScore,
          topics: weakTopics,
          recommendations
        });
      } catch (err) {
        setError("Failed to analyze performance. Please try again.");
        console.error("Error analyzing performance:", err);
      } finally {
        setLoading(false);
      }
    };
    
    analyzePerformance();
  }, [userId]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p>Analyzing your performance...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="bg-red-50 text-red-700 p-4 rounded mb-4">
          {error}
        </div>
        <button 
          onClick={() => window.location.reload()}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <p>No performance data available.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b">
        <h2 className="text-2xl font-bold">AI Performance Analysis</h2>
        <p className="text-gray-600">Personalized insights to help you improve</p>
      </div>

      <div className="p-6">
        {/* Overall Performance */}
        <div className="mb-8">
          <h3 className="text-lg font-medium mb-4">Overall Performance</h3>
          <div className="flex items-center">
            <div className="relative w-32 h-32">
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
                  stroke={analysis.overallScore >= 80 ? "#4CAF50" : analysis.overallScore >= 60 ? "#FFC107" : "#F44336"}
                  strokeWidth="3"
                  strokeDasharray={`${analysis.overallScore}, 100`}
                />
                <text x="18" y="18" textAnchor="middle" fill="#333" fontSize="6" fontWeight="bold">
                  {analysis.overallScore}%
                </text>
                <text x="18" y="22" textAnchor="middle" fill="#666" fontSize="3">
                  Average
                </text>
              </svg>
            </div>
            <div className="ml-6">
              <p className="text-gray-600 mb-2">Your overall performance is</p>
              <p className={`text-2xl font-bold ${
                analysis.overallScore >= 80 ? "text-green-600" : 
                analysis.overallScore >= 60 ? "text-yellow-600" : 
                "text-red-600"
              }`}>
                {analysis.overallScore >= 80 ? "Excellent" : 
                 analysis.overallScore >= 60 ? "Good" : 
                 "Needs Improvement"}
              </p>
            </div>
          </div>
        </div>

        {/* Weak Topics */}
        {analysis.topics.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-medium mb-4">Areas for Improvement</h3>
            <div className="space-y-3">
              {analysis.topics.map((topic) => (
                <div key={topic.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div>
                    <h4 className="font-medium">{topic.name}</h4>
                    <p className="text-sm text-gray-600">Current Score: {topic.score}%</p>
                  </div>
                  <div className="flex items-center">
                    <span className="text-red-600 mr-2">↓ {topic.improvement}%</span>
                    <button className="text-blue-600 hover:text-blue-800 text-sm">
                      Practice
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommendations */}
        {analysis.recommendations.length > 0 && (
          <div>
            <h3 className="text-lg font-medium mb-4">Personalized Recommendations</h3>
            <div className="space-y-3">
              {analysis.recommendations.map((recommendation, index) => (
                <div key={index} className="flex items-start p-3 bg-blue-50 rounded-lg">
                  <span className="text-blue-600 mr-2">💡</span>
                  <span>{recommendation}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};